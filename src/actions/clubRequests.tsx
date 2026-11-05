"use server";

import { db } from "@/db";
import { categoryData, clubData, loggedHours, studentClubMembership, studentUserData } from "@/db/schema";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import type { HourRequest, HourRequestStatus } from "@/app/components/requestRow";
import { formatDate } from "@/lib/formatDate";
import { schoolToday } from "@/lib/schoolDate";
import { MAX_MESSAGE_LENGTH, dateError, hoursError, opportunityNameError } from "@/lib/validateLoggedHours";

/** A request on the club panel's Hour Requests page. */
export type ClubRequest = HourRequest & {
  id: number;
  categoryId: number | null;
  /** ISO date, e.g. "2026-10-10". */
  isoDate: string;
};

export type ClubRequestEdit = {
  hours: number;
  /** ISO date, e.g. "2026-10-10". */
  isoDate: string;
  categoryId: number | null;
  status: HourRequestStatus;
};

export type ManualHoursInput = {
  studentId: number;
  categoryId: number | null;
  opportunityName: string;
  /** ISO date, e.g. "2026-10-10". */
  isoDate: string;
  hours: string;
};

export type ClubRequestResult = { success: true } | { success: false; error: string };

const PENDING_STATUSES: HourRequestStatus[] = ["Pending Email Verification", "Pending Club Verification"];
const STATUSES: HourRequestStatus[] = [...PENDING_STATUSES, "Approved", "Denied"];

const ALREADY_REVIEWED = "This request was already reviewed. The list has been updated.";
const NOT_FOUND = "This request no longer exists. The list has been updated.";

// A coordinator on a request past the email step means they verified it, so one who never
// answered cannot stay on the request when an exec decides it without them.
const DROP_UNVERIFIED_COORDINATOR = {
  coordinatorName: sql`case when ${loggedHours.status} = 'Pending Email Verification' then null else ${loggedHours.coordinatorName} end`,
  coordinatorEmail: sql`case when ${loggedHours.status} = 'Pending Email Verification' then null else ${loggedHours.coordinatorEmail} end`,
};

//--------------------------------------------------------------------------------------//
//                                   Other Functions                                    //
//--------------------------------------------------------------------------------------//

const isClubRequest = (clubId: number, requestId: number) =>
  and(eq(loggedHours.num, requestId), eq(loggedHours.clubId, clubId));

const isInClub = async (clubId: number, categoryId: number) => {
  const [category] = await db
    .select({ categoryId: categoryData.categoryId })
    .from(categoryData)
    .where(and(eq(categoryData.categoryId, categoryId), eq(categoryData.clubId, clubId)));
  return !!category;
};

//--------------------------------------------------------------------------------------//
//                                         Read                                         //
//--------------------------------------------------------------------------------------//

// Every request logged to the club, newest first.
export const getClubRequests = async (clubId: number): Promise<ClubRequest[]> => {
  const rows = await db
    .select({
      request: loggedHours,
      clubName: clubData.clubName,
      categoryName: categoryData.categoryName,
      fName: studentUserData.fName,
      lName: studentUserData.lName,
    })
    .from(loggedHours)
    .leftJoin(clubData, eq(clubData.clubId, loggedHours.clubId))
    .leftJoin(categoryData, eq(categoryData.categoryId, loggedHours.categoryId))
    .leftJoin(studentUserData, eq(studentUserData.studentId, loggedHours.studentId))
    .where(eq(loggedHours.clubId, clubId))
    .orderBy(desc(loggedHours.date), desc(loggedHours.num));

  return rows.map(({ request, clubName, categoryName, fName, lName }) => ({
    id: request.num,
    opportunity: request.opportunityName ?? "",
    student: { fName: fName ?? "", lName: lName ?? "" },
    club: clubName ?? undefined,
    category: categoryName ?? undefined,
    categoryId: request.categoryId,
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
  }));
};

// The Hour Requests badge in the side nav.
export const getClubPendingRequestCount = async (clubId: number): Promise<number> => {
  const [row] = await db
    .select({ pending: count() })
    .from(loggedHours)
    .where(and(eq(loggedHours.clubId, clubId), inArray(loggedHours.status, PENDING_STATUSES)));

  return row?.pending ?? 0;
};

//--------------------------------------------------------------------------------------//
//                                        Review                                        //
//--------------------------------------------------------------------------------------//

// Approving a request still waiting on its coordinator is the Override Approve button.
export const approveClubRequest = async (clubId: number, requestId: number): Promise<ClubRequestResult> => {
  const updated = await db
    .update(loggedHours)
    .set({ status: "Approved", denyMessage: null, ...DROP_UNVERIFIED_COORDINATOR })
    .where(and(isClubRequest(clubId, requestId), inArray(loggedHours.status, PENDING_STATUSES)))
    .returning({ num: loggedHours.num });

  refresh();
  return updated.length > 0 ? { success: true } : { success: false, error: ALREADY_REVIEWED };
};

export const denyClubRequest = async (
  clubId: number,
  requestId: number,
  message: string,
): Promise<ClubRequestResult> => {
  const denyMessage = String(message ?? "").trim();
  if (denyMessage.length > MAX_MESSAGE_LENGTH) {
    return { success: false, error: `Keep the deny message under ${MAX_MESSAGE_LENGTH} characters.` };
  }

  const updated = await db
    .update(loggedHours)
    .set({ status: "Denied", denyMessage: denyMessage || null, ...DROP_UNVERIFIED_COORDINATOR })
    .where(and(isClubRequest(clubId, requestId), inArray(loggedHours.status, PENDING_STATUSES)))
    .returning({ num: loggedHours.num });

  refresh();
  return updated.length > 0 ? { success: true } : { success: false, error: ALREADY_REVIEWED };
};

//--------------------------------------------------------------------------------------//
//                                         Save                                         //
//--------------------------------------------------------------------------------------//

// Edit Or Override: an exec can set any status, including one that reopens a final request.
export const updateClubRequest = async (
  clubId: number,
  requestId: number,
  input: ClubRequestEdit,
): Promise<ClubRequestResult> => {
  // Validate
  const problem = hoursError(String(input.hours)) ?? dateError(input.isoDate, schoolToday());
  if (problem) return { success: false, error: problem };
  if (!STATUSES.includes(input.status)) return { success: false, error: "Choose a status." };
  if (input.categoryId !== null && !(await isInClub(clubId, input.categoryId))) {
    return { success: false, error: "That category is not in this club." };
  }

  const [request] = await db
    .select({ status: loggedHours.status })
    .from(loggedHours)
    .where(isClubRequest(clubId, requestId));
  if (!request) {
    refresh();
    return { success: false, error: NOT_FOUND };
  }

  const skipsEmail =
    request.status === "Pending Email Verification" && input.status !== "Pending Email Verification";

  // Write
  await db
    .update(loggedHours)
    .set({
      hours: input.hours,
      date: input.isoDate,
      categoryId: input.categoryId,
      status: input.status,
      ...(input.status === "Denied" ? {} : { denyMessage: null }),
      ...(skipsEmail ? { coordinatorName: null, coordinatorEmail: null } : {}),
    })
    .where(isClubRequest(clubId, requestId));

  refresh();
  return { success: true };
};

// Hours an exec adds count right away, so they skip verification.
export const addClubHours = async (
  clubId: number,
  input: ManualHoursInput,
): Promise<{ success: true; requestId: number } | { success: false; error: string }> => {
  const opportunityName = String(input.opportunityName ?? "").trim().replace(/\s+/g, " ");
  const hours = String(input.hours ?? "").trim();

  // Validate
  const problem =
    opportunityNameError(opportunityName) ?? dateError(input.isoDate, schoolToday()) ?? hoursError(hours);
  if (problem) return { success: false, error: problem };

  const [member] = await db
    .select({ studentId: studentClubMembership.studentId })
    .from(studentClubMembership)
    .where(
      and(
        eq(studentClubMembership.clubId, clubId),
        eq(studentClubMembership.studentId, input.studentId),
        sql`coalesce(${studentClubMembership.membership_status}, true)`,
      ),
    );
  if (!member) return { success: false, error: "That student is not an active member of this club." };

  const [{ categories }] = await db
    .select({ categories: count() })
    .from(categoryData)
    .where(eq(categoryData.clubId, clubId));
  if (input.categoryId === null ? categories > 0 : !(await isInClub(clubId, input.categoryId))) {
    return { success: false, error: "Choose a category in this club." };
  }

  // Write
  const [added] = await db
    .insert(loggedHours)
    .values({
      studentId: input.studentId,
      clubId,
      categoryId: input.categoryId,
      opportunityName,
      date: input.isoDate,
      hours: Number(hours),
      status: "Approved",
    })
    .returning({ num: loggedHours.num });

  refresh();
  return { success: true, requestId: added.num };
};

//--------------------------------------------------------------------------------------//
//                                        Delete                                        //
//--------------------------------------------------------------------------------------//

export const deleteClubRequest = async (clubId: number, requestId: number): Promise<ClubRequestResult> => {
  const deleted = await db
    .delete(loggedHours)
    .where(isClubRequest(clubId, requestId))
    .returning({ num: loggedHours.num });

  refresh();
  return deleted.length > 0 ? { success: true } : { success: false, error: NOT_FOUND };
};
