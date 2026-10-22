"use server";

import { db } from "@/db";
import {
  additionalHours,
  categoryData,
  clubMemberGroups,
  loggedHours,
  registrations,
  signUps,
  studentClubGroupAssignment,
  studentClubMembership,
  studentRoleAssignment,
  studentUserData,
} from "@/db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";
import { toTitleCase } from "@/lib/toTitleCase";
import { STUDENT_EMAIL_DOMAIN, isStudentEmail } from "@/lib/studentEmail";

export type ClubMember = {
  studentId: number;
  fName: string;
  lName: string;
  email: string;
  gradClass: number | null;
  groupId: number | null;
  groupName: string | null;
  isActive: boolean;
  isExec: boolean;
};

export type ClubGroup = {
  groupId: number;
  groupName: string;
};

export type NewStudent = {
  studentId: number;
  fName: string;
  lName: string;
  email: string;
  gradClass: number;
};

/** An incoming student whose ID is already in the student table with different details. */
export type StudentConflict = {
  existing: NewStudent;
  incoming: NewStudent;
};

/** Which record to keep for each conflicting student ID. */
export type ConflictChoices = Record<number, "existing" | "incoming">;

export type AddStudentsResult = {
  added: number;
  reactivated: number;
  alreadyMembers: number;
  /** Not added yet. Resend them with a choice in `ConflictChoices`. */
  conflicts: StudentConflict[];
  errors: string[];
};

//--------------------------------------------------------------------------------------//
//                                   Other Functions                                    //
//--------------------------------------------------------------------------------------//

const toIds = (ids: number[]) => [...new Set(ids.filter((id) => Number.isInteger(id)))];

const clubGroupIds = (clubId: number) =>
  db.select({ groupId: clubMemberGroups.groupId }).from(clubMemberGroups).where(eq(clubMemberGroups.clubId, clubId));

const clubSignUpIds = (clubId: number) =>
  db
    .select({ signUpId: signUps.signUpId })
    .from(signUps)
    .where(
      inArray(
        signUps.categoryId,
        db.select({ categoryId: categoryData.categoryId }).from(categoryData).where(eq(categoryData.clubId, clubId)),
      ),
    );

// Trims, title-cases names and lowercases the email. Returns an error message when invalid.
const normalizeStudent = (student: NewStudent): NewStudent | string => {
  const normalized = {
    studentId: Number(student.studentId),
    fName: toTitleCase(String(student.fName ?? "")) ?? "",
    lName: toTitleCase(String(student.lName ?? "")) ?? "",
    email: String(student.email ?? "").trim().toLowerCase(),
    gradClass: Number(student.gradClass),
  };
  const label = normalized.fName || normalized.lName ? `${normalized.fName} ${normalized.lName}`.trim() : "A student";

  if (!Number.isInteger(normalized.studentId) || normalized.studentId <= 0) return `${label}: Student ID must be a whole number.`;
  if (!normalized.fName || !normalized.lName) return `Student ${normalized.studentId}: first and last name are required.`;
  if (!isStudentEmail(normalized.email)) {
    return `Student ${normalized.studentId}: email must end in @${STUDENT_EMAIL_DOMAIN}.`;
  }
  if (!Number.isInteger(normalized.gradClass) || normalized.gradClass < 2000 || normalized.gradClass > 2100) {
    return `Student ${normalized.studentId}: grad class must be a year like 2027.`;
  }
  return normalized;
};

const sameStudent = (a: NewStudent, b: NewStudent) =>
  a.fName === b.fName && a.lName === b.lName && a.email === b.email && a.gradClass === b.gradClass;

//--------------------------------------------------------------------------------------//
//                                         Read                                         //
//--------------------------------------------------------------------------------------//

export const getClubMembers = async (clubId: number): Promise<ClubMember[]> => {
  const members = await db
    .select({
      studentId: studentUserData.studentId,
      fName: studentUserData.fName,
      lName: studentUserData.lName,
      email: studentUserData.email,
      gradClass: studentUserData.gradClass,
      isActive: studentClubMembership.membership_status,
      isExec: studentClubMembership.is_exec,
    })
    .from(studentClubMembership)
    .innerJoin(studentUserData, eq(studentClubMembership.studentId, studentUserData.studentId))
    .where(eq(studentClubMembership.clubId, clubId));

  // Each student is in at most one group per club
  const groups = await db
    .select({
      studentId: studentClubGroupAssignment.studentId,
      groupId: clubMemberGroups.groupId,
      groupName: clubMemberGroups.groupName,
    })
    .from(studentClubGroupAssignment)
    .innerJoin(clubMemberGroups, eq(studentClubGroupAssignment.groupId, clubMemberGroups.groupId))
    .where(eq(clubMemberGroups.clubId, clubId));
  const groupByStudent = new Map(groups.map((g) => [g.studentId, g]));

  return members.map((m) => ({
    studentId: m.studentId,
    fName: m.fName ?? "",
    lName: m.lName ?? "",
    email: m.email ?? "",
    gradClass: m.gradClass,
    groupId: groupByStudent.get(m.studentId)?.groupId ?? null,
    groupName: groupByStudent.get(m.studentId)?.groupName ?? null,
    isActive: m.isActive ?? true,
    isExec: m.isExec ?? false,
  }));
};

export const getClubGroups = async (clubId: number): Promise<ClubGroup[]> => {
  const groups = await db
    .select({ groupId: clubMemberGroups.groupId, groupName: clubMemberGroups.groupName })
    .from(clubMemberGroups)
    .where(eq(clubMemberGroups.clubId, clubId))
    .orderBy(clubMemberGroups.groupName);
  return groups.map((g) => ({ groupId: g.groupId, groupName: g.groupName ?? "" }));
};

//--------------------------------------------------------------------------------------//
//                                          Add                                         //
//--------------------------------------------------------------------------------------//

// New students go into the student table; students already there only get a club
// membership. An existing ID with different details is returned as a conflict until
// the caller picks which record to keep.
export const addStudentsToClub = async (
  clubId: number,
  students: NewStudent[],
  choices: ConflictChoices = {},
): Promise<AddStudentsResult> => {
  const result: AddStudentsResult = { added: 0, reactivated: 0, alreadyMembers: 0, conflicts: [], errors: [] };

  // Validate and drop repeated IDs
  const incoming = new Map<number, NewStudent>();
  for (const student of students) {
    const normalized = normalizeStudent(student);
    if (typeof normalized === "string") {
      result.errors.push(normalized);
    } else if (incoming.has(normalized.studentId)) {
      result.errors.push(`Student ${normalized.studentId}: listed more than once.`);
    } else {
      incoming.set(normalized.studentId, normalized);
    }
  }
  if (incoming.size === 0) return result;

  const ids = [...incoming.keys()];
  const existingRows = await db.select().from(studentUserData).where(inArray(studentUserData.studentId, ids));
  const existing = new Map(
    existingRows.map((s) => [
      s.studentId,
      {
        studentId: s.studentId,
        fName: s.fName ?? "",
        lName: s.lName ?? "",
        email: (s.email ?? "").toLowerCase(),
        gradClass: s.gradClass ?? 0,
      },
    ]),
  );

  // Emails are unique across students, so an email owned by another ID cannot be used
  const emails = [...incoming.values()].map((s) => s.email);
  const emailOwners = await db
    .select({ studentId: studentUserData.studentId, email: studentUserData.email })
    .from(studentUserData)
    .where(inArray(sql`lower(${studentUserData.email})`, emails));
  const ownerByEmail = new Map(emailOwners.map((o) => [(o.email ?? "").toLowerCase(), o.studentId]));

  const toInsert: NewStudent[] = [];
  const toUpdate: NewStudent[] = [];
  const toMember: number[] = [];

  for (const student of incoming.values()) {
    const owner = ownerByEmail.get(student.email);
    const current = existing.get(student.studentId);

    if (!current) {
      if (owner !== undefined) {
        result.errors.push(`Student ${student.studentId}: ${student.email} is already used by student ${owner}.`);
        continue;
      }
      toInsert.push(student);
    } else if (!sameStudent(current, student)) {
      const choice = choices[student.studentId];
      if (!choice) {
        result.conflicts.push({ existing: current, incoming: student });
        continue;
      }
      if (choice === "incoming") {
        if (owner !== undefined && owner !== student.studentId) {
          result.errors.push(`Student ${student.studentId}: ${student.email} is already used by student ${owner}.`);
          continue;
        }
        toUpdate.push(student);
      }
    }
    toMember.push(student.studentId);
  }

  if (toInsert.length > 0) {
    await db.insert(studentUserData).values(toInsert);
  }
  for (const student of toUpdate) {
    await db
      .update(studentUserData)
      .set({ fName: student.fName, lName: student.lName, email: student.email, gradClass: student.gradClass })
      .where(eq(studentUserData.studentId, student.studentId));
  }
  if (toMember.length === 0) return result;

  // Add memberships; inactive members are reactivated instead of duplicated
  const memberships = await db
    .select({ studentId: studentClubMembership.studentId, isActive: studentClubMembership.membership_status })
    .from(studentClubMembership)
    .where(and(eq(studentClubMembership.clubId, clubId), inArray(studentClubMembership.studentId, toMember)));
  const membershipByStudent = new Map(memberships.map((m) => [m.studentId, m.isActive ?? true]));

  const newMembers = toMember.filter((id) => !membershipByStudent.has(id));
  const inactiveMembers = toMember.filter((id) => membershipByStudent.get(id) === false);
  result.added = newMembers.length;
  result.reactivated = inactiveMembers.length;
  result.alreadyMembers = toMember.length - newMembers.length - inactiveMembers.length;

  if (newMembers.length > 0) {
    await db.insert(studentClubMembership).values(
      newMembers.map((studentId) => ({ clubId, studentId, membership_status: true, is_exec: false })),
    );
  }
  if (inactiveMembers.length > 0) {
    await setMembersActive(clubId, inactiveMembers, true);
  }

  return result;
};

//--------------------------------------------------------------------------------------//
//                                        Update                                        //
//--------------------------------------------------------------------------------------//

// Deactivating keeps the membership and all club history
export const setMembersActive = async (clubId: number, studentIds: number[], active: boolean) => {
  const ids = toIds(studentIds);
  if (ids.length === 0) return { success: true, count: 0 };

  await db
    .update(studentClubMembership)
    .set({ membership_status: active })
    .where(and(eq(studentClubMembership.clubId, clubId), inArray(studentClubMembership.studentId, ids)));
  return { success: true, count: ids.length };
};

// Replaces each student's group in this club. A null group removes them from their group.
export const assignMembersToGroup = async (clubId: number, studentIds: number[], groupId: number | null) => {
  const ids = toIds(studentIds);
  if (ids.length === 0) return { success: true, count: 0 };

  if (groupId !== null) {
    const group = await db
      .select({ groupId: clubMemberGroups.groupId })
      .from(clubMemberGroups)
      .where(and(eq(clubMemberGroups.groupId, groupId), eq(clubMemberGroups.clubId, clubId)));
    if (!group[0]) return { success: false, count: 0, error: "That group is not in this club." };
  }

  const removeCurrent = db
    .delete(studentClubGroupAssignment)
    .where(
      and(
        inArray(studentClubGroupAssignment.studentId, ids),
        inArray(studentClubGroupAssignment.groupId, clubGroupIds(clubId)),
      ),
    );

  if (groupId === null) {
    await removeCurrent;
  } else {
    await db.batch([
      removeCurrent,
      db.insert(studentClubGroupAssignment).values(ids.map((studentId) => ({ studentId, groupId }))),
    ]);
  }
  return { success: true, count: ids.length };
};

//--------------------------------------------------------------------------------------//
//                                        Delete                                        //
//--------------------------------------------------------------------------------------//

// Removes the membership and everything the students have in this club: group, roles,
// logged and additional hours, and opportunity sign ups. The student record stays.
export const removeMembersAndHistory = async (clubId: number, studentIds: number[]) => {
  const ids = toIds(studentIds);
  if (ids.length === 0) return { success: true, count: 0 };

  await db.batch([
    db
      .delete(studentClubGroupAssignment)
      .where(
        and(
          inArray(studentClubGroupAssignment.studentId, ids),
          inArray(studentClubGroupAssignment.groupId, clubGroupIds(clubId)),
        ),
      ),
    db
      .delete(studentRoleAssignment)
      .where(and(eq(studentRoleAssignment.clubId, clubId), inArray(studentRoleAssignment.studentId, ids))),
    db
      .delete(registrations)
      .where(and(inArray(registrations.studentId, ids), inArray(registrations.signUpId, clubSignUpIds(clubId)))),
    db.delete(loggedHours).where(and(eq(loggedHours.clubId, clubId), inArray(loggedHours.studentId, ids))),
    db.delete(additionalHours).where(and(eq(additionalHours.clubId, clubId), inArray(additionalHours.studentId, ids))),
    db
      .delete(studentClubMembership)
      .where(and(eq(studentClubMembership.clubId, clubId), inArray(studentClubMembership.studentId, ids))),
  ]);
  return { success: true, count: ids.length };
};
