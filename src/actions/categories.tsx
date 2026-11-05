"use server";

import { db } from "@/db";
import { additionalHours, categoryClubGroupAssignment, categoryData, loggedHours, signUps } from "@/db/schema";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { refresh } from "next/cache";

export type ClubCategory = {
  /** Zero or negative for a category that is not saved yet. */
  categoryId: number;
  categoryName: string;
  goal: number;
  needsEmailVerification: boolean;
  needsClubConfirmation: boolean;
};

/** What saving a category's new rules does to its pending requests. */
export type CategoryRequestChanges = {
  categoryId: number;
  categoryName: string;
  total: number;
  toEmailVerification: number;
  toClubVerification: number;
  toApproved: number;
  /** Requests that lose their coordinator because the email step is gone. */
  coordinatorsCleared: number;
};

export type CategoryUsage = {
  loggedHours: number;
  additionalHours: number;
  opportunities: number;
};

//--------------------------------------------------------------------------------------//
//                                   Other Functions                                    //
//--------------------------------------------------------------------------------------//

const MAX_GOAL = 10000;

const isInUse = (usage: CategoryUsage) => usage.loggedHours + usage.additionalHours + usage.opportunities > 0;

const countWhere = async (
  table: typeof loggedHours | typeof additionalHours | typeof signUps,
  categoryId: number,
) => {
  const rows = await db.select({ n: count() }).from(table).where(eq(table.categoryId, categoryId));
  return rows[0]?.n ?? 0;
};

const PENDING_STATUSES = ["Pending Email Verification", "Pending Club Verification"];
const COORDINATOR_VERIFIED = sql<boolean>`(${loggedHours.status} = 'Pending Club Verification' and ${loggedHours.coordinatorEmail} is not null)`;

const rulesChanged = (before: ClubCategory | undefined, after: ClubCategory) =>
  before?.needsEmailVerification !== after.needsEmailVerification ||
  before?.needsClubConfirmation !== after.needsClubConfirmation;

// Where pending requests go under a category's rules. A coordinator who already verified a
// request still counts, so that request never goes back to email verification.
const nextStatuses = ({ needsEmailVerification, needsClubConfirmation }: ClubCategory) => {
  const coordinatorVerified = needsClubConfirmation ? "Pending Club Verification" : "Approved";
  const unverified = needsEmailVerification ? "Pending Email Verification" : coordinatorVerified;
  return { coordinatorVerified, unverified };
};

// Moves a category's pending requests to the step its new rules call for. Approved and denied
// requests are final. When the email step is dropped, requests still waiting on it lose their
// coordinator, because a coordinator on a request means they verified it.
const movePendingRequests = (category: ClubCategory) => {
  const { categoryId, needsEmailVerification } = category;
  const next = nextStatuses(category);
  const unlessWaitingOnEmail = (column: typeof loggedHours.coordinatorName | typeof loggedHours.coordinatorEmail) =>
    sql`case when ${loggedHours.status} = 'Pending Email Verification' then null else ${column} end`;

  return db
    .update(loggedHours)
    .set({
      status: sql`case when ${COORDINATOR_VERIFIED} then ${next.coordinatorVerified} else ${next.unverified} end`,
      ...(needsEmailVerification
        ? {}
        : {
            coordinatorName: unlessWaitingOnEmail(loggedHours.coordinatorName),
            coordinatorEmail: unlessWaitingOnEmail(loggedHours.coordinatorEmail),
          }),
    })
    .where(
      and(
        eq(loggedHours.categoryId, categoryId),
        inArray(loggedHours.status, PENDING_STATUSES),
      ),
    );
};

//--------------------------------------------------------------------------------------//
//                                         Read                                         //
//--------------------------------------------------------------------------------------//

export const getClubCategories = async (clubId: number): Promise<ClubCategory[]> => {
  const categories = await db
    .select()
    .from(categoryData)
    .where(eq(categoryData.clubId, clubId))
    .orderBy(categoryData.categoryId);

  return categories.map((c) => ({
    categoryId: c.categoryId,
    categoryName: c.categoryName ?? "",
    goal: c.goal ?? 0,
    needsEmailVerification: c.needsEmailVerification ?? false,
    needsClubConfirmation: c.needsClubConfirmation ?? false,
  }));
};

// How much points at a category. A category in use cannot be deleted.
export const getCategoryUsage = async (categoryId: number): Promise<CategoryUsage> => {
  const [logged, additional, opportunities] = await Promise.all([
    countWhere(loggedHours, categoryId),
    countWhere(additionalHours, categoryId),
    countWhere(signUps, categoryId),
  ]);
  return { loggedHours: logged, additionalHours: additional, opportunities };
};

// What saving these categories would do to pending requests, for the confirmation before a save.
// Only lists categories with at least one request that would change.
export const getCategoryRequestChanges = async (
  clubId: number,
  categories: ClubCategory[],
): Promise<CategoryRequestChanges[]> => {
  const owned = new Map((await getClubCategories(clubId)).map((c) => [c.categoryId, c]));
  const changed = categories.filter((c) => owned.has(c.categoryId) && rulesChanged(owned.get(c.categoryId), c));
  if (changed.length === 0) return [];

  const rows = await db
    .select({
      categoryId: loggedHours.categoryId,
      status: loggedHours.status,
      coordinatorVerified: COORDINATOR_VERIFIED,
      requests: count(),
    })
    .from(loggedHours)
    .where(
      and(
        inArray(loggedHours.categoryId, changed.map((c) => c.categoryId)),
        inArray(loggedHours.status, PENDING_STATUSES),
      ),
    )
    .groupBy(loggedHours.categoryId, loggedHours.status, COORDINATOR_VERIFIED);

  return changed
    .map((category) => {
      const next = nextStatuses(category);
      const changes: CategoryRequestChanges = {
        categoryId: category.categoryId,
        categoryName: category.categoryName.trim(),
        total: 0,
        toEmailVerification: 0,
        toClubVerification: 0,
        toApproved: 0,
        coordinatorsCleared: 0,
      };

      for (const row of rows.filter((r) => r.categoryId === category.categoryId)) {
        const status = row.coordinatorVerified ? next.coordinatorVerified : next.unverified;
        if (status === row.status) continue;

        changes.total += row.requests;
        if (status === "Pending Email Verification") changes.toEmailVerification += row.requests;
        else if (status === "Pending Club Verification") changes.toClubVerification += row.requests;
        else changes.toApproved += row.requests;
        if (row.status === "Pending Email Verification") changes.coordinatorsCleared += row.requests;
      }
      return changes;
    })
    .filter((changes) => changes.total > 0);
};

//--------------------------------------------------------------------------------------//
//                                         Save                                         //
//--------------------------------------------------------------------------------------//

// Saves the whole category list for a club in one go: new rows are added, changed rows
// updated, and `deletedIds` removed (with their member group links). Pending requests in a
// category whose verification rules changed move to match, in the same batch.
export const saveClubCategories = async (
  clubId: number,
  categories: ClubCategory[],
  deletedIds: number[],
): Promise<{ success: true; categories: ClubCategory[] } | { success: false; error: string }> => {
  const cleaned = categories.map((c) => ({
    ...c,
    categoryName: c.categoryName.trim().replace(/\s+/g, " "),
    goal: Number(c.goal),
  }));

  // Validate
  const names = new Set<string>();
  for (const c of cleaned) {
    if (!c.categoryName) return { success: false, error: "Every category needs a name." };
    if (!Number.isInteger(c.goal) || c.goal < 0 || c.goal > MAX_GOAL) {
      return { success: false, error: `${c.categoryName}: goal must be a whole number of hours.` };
    }
    const key = c.categoryName.toLowerCase();
    if (names.has(key)) return { success: false, error: `There is more than one category named ${c.categoryName}.` };
    names.add(key);
  }

  // Only this club's categories can be changed or deleted
  const owned = new Map((await getClubCategories(clubId)).map((c) => [c.categoryId, c]));
  const toDelete = [...new Set(deletedIds)].filter((id) => owned.has(id));
  if (cleaned.some((c) => c.categoryId > 0 && !owned.has(c.categoryId))) {
    return { success: false, error: "A category was removed by someone else. Reload the page and try again." };
  }

  for (const id of toDelete) {
    if (isInUse(await getCategoryUsage(id))) {
      return { success: false, error: `${owned.get(id)?.categoryName} has hours or opportunities, so it cannot be deleted.` };
    }
  }

  // Write
  const queries: BatchItem<"pg">[] = [];
  if (toDelete.length > 0) {
    queries.push(db.delete(categoryClubGroupAssignment).where(inArray(categoryClubGroupAssignment.categoryId, toDelete)));
    queries.push(
      db.delete(categoryData).where(and(eq(categoryData.clubId, clubId), inArray(categoryData.categoryId, toDelete))),
    );
  }
  for (const c of cleaned) {
    const values = {
      categoryName: c.categoryName,
      goal: c.goal,
      needsEmailVerification: c.needsEmailVerification,
      needsClubConfirmation: c.needsClubConfirmation,
    };
    if (c.categoryId <= 0) {
      queries.push(db.insert(categoryData).values({ clubId, ...values }));
    } else {
      queries.push(
        db.update(categoryData).set(values).where(and(eq(categoryData.clubId, clubId), eq(categoryData.categoryId, c.categoryId))),
      );

      if (rulesChanged(owned.get(c.categoryId), c)) queries.push(movePendingRequests(c));
    }
  }
  if (queries.length > 0) {
    await db.batch(queries as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  }

  // Moved requests can change the Hour Requests badge in the side nav
  refresh();

  // return the saved list so new categories get their ids
  return { success: true, categories: await getClubCategories(clubId) };
};
