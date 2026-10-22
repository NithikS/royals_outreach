"use server";

import { db } from "@/db";
import {
  categoryClubGroupAssignment,
  categoryData,
  clubMemberGroups,
  studentClubGroupAssignment,
  studentClubMembership,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

export type MemberGroup = {
  /** Zero or negative for a group that is not saved yet. */
  groupId: number;
  groupName: string;
  categoryIds: number[];
  studentIds: number[];
};

//--------------------------------------------------------------------------------------//
//                                   Other Functions                                    //
//--------------------------------------------------------------------------------------//

const clubGroupIds = (clubId: number) =>
  db.select({ groupId: clubMemberGroups.groupId }).from(clubMemberGroups).where(eq(clubMemberGroups.clubId, clubId));

//--------------------------------------------------------------------------------------//
//                                         Read                                         //
//--------------------------------------------------------------------------------------//

export const getMemberGroups = async (clubId: number): Promise<MemberGroup[]> => {
  const [groups, categoryLinks, studentLinks] = await Promise.all([
    db
      .select()
      .from(clubMemberGroups)
      .where(eq(clubMemberGroups.clubId, clubId))
      .orderBy(clubMemberGroups.groupId),
    db
      .select({ groupId: categoryClubGroupAssignment.groupId, categoryId: categoryClubGroupAssignment.categoryId })
      .from(categoryClubGroupAssignment)
      .where(inArray(categoryClubGroupAssignment.groupId, clubGroupIds(clubId))),
    db
      .select({ groupId: studentClubGroupAssignment.groupId, studentId: studentClubGroupAssignment.studentId })
      .from(studentClubGroupAssignment)
      .where(inArray(studentClubGroupAssignment.groupId, clubGroupIds(clubId))),
  ]);

  return groups.map((g) => ({
    groupId: g.groupId,
    groupName: g.groupName ?? "",
    categoryIds: categoryLinks.filter((l) => l.groupId === g.groupId && l.categoryId !== null).map((l) => l.categoryId!),
    studentIds: studentLinks.filter((l) => l.groupId === g.groupId && l.studentId !== null).map((l) => l.studentId!),
  }));
};

//--------------------------------------------------------------------------------------//
//                                         Save                                         //
//--------------------------------------------------------------------------------------//

// Saves every group for a club in one go. Category and student links are rewritten
// from `groups`, so a student moved between groups ends up in exactly one.
export const saveMemberGroups = async (
  clubId: number,
  groups: MemberGroup[],
  deletedIds: number[],
): Promise<{ success: true; groups: MemberGroup[] } | { success: false; error: string }> => {
  const cleaned = groups.map((g) => ({
    ...g,
    groupName: g.groupName.trim().replace(/\s+/g, " "),
    categoryIds: [...new Set(g.categoryIds)],
    studentIds: [...new Set(g.studentIds)],
  }));

  // Validate names
  const names = new Set<string>();
  for (const g of cleaned) {
    if (!g.groupName) return { success: false, error: "Every group needs a name." };
    const key = g.groupName.toLowerCase();
    if (names.has(key)) return { success: false, error: `There is more than one group named ${g.groupName}.` };
    names.add(key);
  }

  // Groups, categories and students must all belong to this club
  const [ownedGroups, clubCategories, members] = await Promise.all([
    db.select({ groupId: clubMemberGroups.groupId }).from(clubMemberGroups).where(eq(clubMemberGroups.clubId, clubId)),
    db.select({ categoryId: categoryData.categoryId }).from(categoryData).where(eq(categoryData.clubId, clubId)),
    db
      .select({ studentId: studentClubMembership.studentId })
      .from(studentClubMembership)
      .where(eq(studentClubMembership.clubId, clubId)),
  ]);
  const ownedIds = new Set(ownedGroups.map((g) => g.groupId));
  const categoryIds = new Set(clubCategories.map((c) => c.categoryId));
  const memberIds = new Set(members.map((m) => m.studentId));

  if (cleaned.some((g) => g.groupId > 0 && !ownedIds.has(g.groupId))) {
    return { success: false, error: "A group was removed by someone else. Reload the page and try again." };
  }
  if (cleaned.some((g) => g.categoryIds.some((id) => !categoryIds.has(id)))) {
    return { success: false, error: "A category was removed by someone else. Reload the page and try again." };
  }
  const seen = new Set<number>();
  for (const g of cleaned) {
    for (const id of g.studentIds) {
      if (!memberIds.has(id)) return { success: false, error: `Student ${id} is not a member of this club.` };
      if (seen.has(id)) return { success: false, error: `Student ${id} is in more than one group.` };
      seen.add(id);
    }
  }
  const toDelete = [...new Set(deletedIds)].filter((id) => ownedIds.has(id));

  // New groups need ids before their links can be written
  const saved = [];
  for (const g of cleaned) {
    if (g.groupId > 0) {
      saved.push(g);
    } else {
      const [row] = await db
        .insert(clubMemberGroups)
        .values({ clubId, groupName: g.groupName })
        .returning({ groupId: clubMemberGroups.groupId });
      saved.push({ ...g, groupId: row.groupId });
    }
  }

  // Rewrite every link for the club's groups, then drop deleted groups
  const queries: BatchItem<"pg">[] = [
    db.delete(categoryClubGroupAssignment).where(inArray(categoryClubGroupAssignment.groupId, clubGroupIds(clubId))),
    db.delete(studentClubGroupAssignment).where(inArray(studentClubGroupAssignment.groupId, clubGroupIds(clubId))),
  ];
  if (toDelete.length > 0) {
    queries.push(
      db
        .delete(clubMemberGroups)
        .where(and(eq(clubMemberGroups.clubId, clubId), inArray(clubMemberGroups.groupId, toDelete))),
    );
  }
  for (const g of saved) {
    queries.push(
      db
        .update(clubMemberGroups)
        .set({ groupName: g.groupName })
        .where(and(eq(clubMemberGroups.clubId, clubId), eq(clubMemberGroups.groupId, g.groupId))),
    );
  }
  const categoryLinks = saved.flatMap((g) => g.categoryIds.map((categoryId) => ({ groupId: g.groupId, categoryId })));
  if (categoryLinks.length > 0) queries.push(db.insert(categoryClubGroupAssignment).values(categoryLinks));
  const studentLinks = saved.flatMap((g) => g.studentIds.map((studentId) => ({ groupId: g.groupId, studentId })));
  if (studentLinks.length > 0) queries.push(db.insert(studentClubGroupAssignment).values(studentLinks));

  await db.batch(queries as [BatchItem<"pg">, ...BatchItem<"pg">[]]);

  // return the saved list so new groups get their ids
  return { success: true, groups: await getMemberGroups(clubId) };
};
