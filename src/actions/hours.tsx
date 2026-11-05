"use server";

import { db } from "@/db";
import {
  categoryClubGroupAssignment,
  categoryData,
  clubData,
  clubMemberGroups,
  loggedHours,
  studentClubGroupAssignment,
  studentClubMembership,
} from "@/db/schema";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import type { HourRequest, HourRequestStatus } from "@/app/components/requestRow";
import { CURRENT_STUDENT_ID } from "@/lib/currentStudent";
import { formatDate } from "@/lib/formatDate";
import { schoolToday } from "@/lib/schoolDate";
import { cleanLoggedHours, validateLoggedHours, type LoggedHoursFields } from "@/lib/validateLoggedHours";

export type LogHoursCategory = {
  categoryId: number;
  categoryName: string;
  needsEmailVerification: boolean;
  needsClubConfirmation: boolean;
};

/** A club the student can log hours in, with only the categories open to them. */
export type LogHoursClub = {
  clubId: number;
  clubName: string;
  categories: LogHoursCategory[];
};

export type LogHoursInput = LoggedHoursFields & {
  clubId: number;
  categoryId: number;
};

/** A request on My Requests, with what the edit form needs. */
export type MyRequest = HourRequest & {
  id: number;
  /** ISO date, e.g. "2026-10-10". */
  isoDate: string;
  /** True until a coordinator or the club has verified it. */
  canChange: boolean;
};

export type MyRequestResult = { success: true } | { success: false; error: string };

const ALREADY_VERIFIED = "This request has already been verified, so it can no longer be changed.";

// Email verification comes before the club's, so a request waiting on the club that has a
// coordinator was already verified by them. Reads and writes share this so they cannot disagree.
const IS_UNVERIFIED = sql`(
  ${loggedHours.status} = 'Pending Email Verification'
  or (${loggedHours.status} = 'Pending Club Verification' and ${loggedHours.coordinatorEmail} is null)
)`;

//--------------------------------------------------------------------------------------//
//                                   Other Functions                                   //
//--------------------------------------------------------------------------------------//

// The coordinator's email check comes first, then the club's; with neither, hours count right away.
const statusFor = (category: LogHoursCategory): HourRequestStatus => {
  if (category.needsEmailVerification) return "Pending Email Verification";
  if (category.needsClubConfirmation) return "Pending Club Verification";
  return "Approved";
};

//--------------------------------------------------------------------------------------//
//                                         Read                                         //
//--------------------------------------------------------------------------------------//

// The student's active clubs. A student in a member group gets that group's categories;
// a student with no group gets every category in the club.
export const getLogHoursClubs = async (): Promise<LogHoursClub[]> => {
  const studentId = CURRENT_STUDENT_ID;

  const clubs = await db
    .select({ clubId: clubData.clubId, clubName: clubData.clubName })
    .from(studentClubMembership)
    .innerJoin(clubData, eq(clubData.clubId, studentClubMembership.clubId))
    .where(
      and(
        eq(studentClubMembership.studentId, studentId),
        sql`coalesce(${studentClubMembership.membership_status}, true)`,
      ),
    )
    .orderBy(clubData.clubName);
  if (clubs.length === 0) return [];

  const clubIds = clubs.map((c) => c.clubId);
  const [categories, groupLinks] = await Promise.all([
    db.select().from(categoryData).where(inArray(categoryData.clubId, clubIds)).orderBy(categoryData.categoryId),
    // One row per group category, or one row with a null category for a group with none
    db
      .select({ clubId: clubMemberGroups.clubId, categoryId: categoryClubGroupAssignment.categoryId })
      .from(studentClubGroupAssignment)
      .innerJoin(clubMemberGroups, eq(clubMemberGroups.groupId, studentClubGroupAssignment.groupId))
      .leftJoin(categoryClubGroupAssignment, eq(categoryClubGroupAssignment.groupId, clubMemberGroups.groupId))
      .where(and(eq(studentClubGroupAssignment.studentId, studentId), inArray(clubMemberGroups.clubId, clubIds))),
  ]);

  return clubs.map((club) => {
    const links = groupLinks.filter((l) => l.clubId === club.clubId);
    const groupCategoryIds = new Set(links.map((l) => l.categoryId));

    return {
      clubId: club.clubId,
      clubName: club.clubName ?? "",
      categories: categories
        .filter((c) => c.clubId === club.clubId && (links.length === 0 || groupCategoryIds.has(c.categoryId)))
        .map((c) => ({
          categoryId: c.categoryId,
          categoryName: c.categoryName ?? "",
          needsEmailVerification: c.needsEmailVerification ?? false,
          needsClubConfirmation: c.needsClubConfirmation ?? false,
        })),
    };
  });
};

// The student's requests, newest first.
export const getMyRequests = async (): Promise<MyRequest[]> => {
  const rows = await db
    .select({
      request: loggedHours,
      clubName: clubData.clubName,
      categoryName: categoryData.categoryName,
      canChange: sql<boolean>`${IS_UNVERIFIED}`,
    })
    .from(loggedHours)
    .leftJoin(clubData, eq(clubData.clubId, loggedHours.clubId))
    .leftJoin(categoryData, eq(categoryData.categoryId, loggedHours.categoryId))
    .where(eq(loggedHours.studentId, CURRENT_STUDENT_ID))
    .orderBy(desc(loggedHours.date), desc(loggedHours.num));

  return rows.map(({ request, clubName, categoryName, canChange }) => ({
    id: request.num,
    opportunity: request.opportunityName ?? "",
    club: clubName ?? undefined,
    category: categoryName ?? undefined,
    date: formatDate(request.date, "short"),
    fullDate: formatDate(request.date),
    isoDate: request.date ?? "",
    hours: request.hours ?? 0,
    status: request.status as HourRequestStatus,
    hasPhoto: !!request.imageId,
    organization: request.orgName ?? undefined,
    coordinator: request.coordinatorName ?? undefined,
    coordinatorEmail: request.coordinatorEmail ?? undefined,
    message: request.optionalMessage ?? undefined,
    denyMessage: request.denyMessage ?? undefined,
    canChange: !!canChange,
  }));
};

// The My Requests badge in the side nav.
export const getMyPendingRequestCount = async (): Promise<number> => {
  const [row] = await db
    .select({ pending: count() })
    .from(loggedHours)
    .where(
      and(
        eq(loggedHours.studentId, CURRENT_STUDENT_ID),
        inArray(loggedHours.status, ["Pending Email Verification", "Pending Club Verification"]),
      ),
    );

  return row?.pending ?? 0;
};

//--------------------------------------------------------------------------------------//
//                                         Save                                        //
//--------------------------------------------------------------------------------------//

export const logHours = async (
  input: LogHoursInput,
): Promise<{ success: true; status: HourRequestStatus } | { success: false; error: string }> => {
  // The club and category must be open to this student
  const club = (await getLogHoursClubs()).find((c) => c.clubId === input.clubId);
  if (!club) return { success: false, error: "You are not an active member of that club." };
  const category = club.categories.find((c) => c.categoryId === input.categoryId);
  if (!category) return { success: false, error: `You cannot log hours in that category for ${club.clubName}.` };

  // Validate
  const fields = cleanLoggedHours(input);
  const errors = validateLoggedHours(fields, {
    needsEmailVerification: category.needsEmailVerification,
    today: schoolToday(),
  });
  const firstError = Object.values(errors)[0];
  if (firstError) return { success: false, error: firstError };

  // Write
  const status = statusFor(category);
  await db.insert(loggedHours).values({
    studentId: CURRENT_STUDENT_ID,
    clubId: club.clubId,
    categoryId: category.categoryId,
    opportunityName: fields.opportunityName,
    orgName: fields.orgName,
    date: fields.date,
    hours: Number(fields.hours),
    coordinatorName: category.needsEmailVerification ? fields.coordinatorName : null,
    coordinatorEmail: category.needsEmailVerification ? fields.coordinatorEmail : null,
    optionalMessage: fields.message || null,
    status,
  });

  refresh();
  return { success: true, status };
};

// Club and category stay as logged, so the request keeps its place in the verification steps.
// TODO: send the coordinator a new email when their address changes, once verification emails are added
export const updateMyRequest = async (requestId: number, input: LoggedHoursFields): Promise<MyRequestResult> => {
  const isChangeable = and(
    eq(loggedHours.num, requestId),
    eq(loggedHours.studentId, CURRENT_STUDENT_ID),
    IS_UNVERIFIED,
  );

  const [request] = await db.select({ status: loggedHours.status }).from(loggedHours).where(isChangeable);
  if (!request) {
    refresh();
    return { success: false, error: ALREADY_VERIFIED };
  }
  const needsEmailVerification = request.status === "Pending Email Verification";

  // Validate
  const fields = cleanLoggedHours(input);
  const errors = validateLoggedHours(fields, { needsEmailVerification, today: schoolToday() });
  const firstError = Object.values(errors)[0];
  if (firstError) return { success: false, error: firstError };

  // Write
  const updated = await db
    .update(loggedHours)
    .set({
      opportunityName: fields.opportunityName,
      orgName: fields.orgName,
      date: fields.date,
      hours: Number(fields.hours),
      coordinatorName: needsEmailVerification ? fields.coordinatorName : null,
      coordinatorEmail: needsEmailVerification ? fields.coordinatorEmail : null,
      optionalMessage: fields.message || null,
    })
    .where(isChangeable)
    .returning({ num: loggedHours.num });

  refresh();
  return updated.length > 0 ? { success: true } : { success: false, error: ALREADY_VERIFIED };
};

//--------------------------------------------------------------------------------------//
//                                        Delete                                        //
//--------------------------------------------------------------------------------------//

export const deleteMyRequest = async (requestId: number): Promise<MyRequestResult> => {
  const deleted = await db
    .delete(loggedHours)
    .where(and(eq(loggedHours.num, requestId), eq(loggedHours.studentId, CURRENT_STUDENT_ID), IS_UNVERIFIED))
    .returning({ num: loggedHours.num });

  refresh();
  return deleted.length > 0 ? { success: true } : { success: false, error: ALREADY_VERIFIED };
};
