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
import { and, eq, inArray, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import type { HourRequestStatus } from "@/app/components/requestRow";
import { CURRENT_STUDENT_ID } from "@/lib/currentStudent";
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
