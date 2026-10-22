"use server";

import { db } from "@/db";
import { additionalHours, categoryClubGroupAssignment, categoryData, loggedHours, signUps } from "@/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

export type ClubCategory = {
  /** Zero or negative for a category that is not saved yet. */
  categoryId: number;
  categoryName: string;
  goal: number;
  needsEmailVerification: boolean;
  needsClubConfirmation: boolean;
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

//--------------------------------------------------------------------------------------//
//                                         Save                                         //
//--------------------------------------------------------------------------------------//

// Saves the whole category list for a club in one go: new rows are added, changed rows
// updated, and `deletedIds` removed (with their member group links).
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
    }
  }
  if (queries.length > 0) {
    await db.batch(queries as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
  }

  // return the saved list so new categories get their ids
  return { success: true, categories: await getClubCategories(clubId) };
};
