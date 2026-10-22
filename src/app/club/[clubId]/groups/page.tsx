import { Suspense } from "react";
import { notFound } from "next/navigation";
import MemberGroupsUI from "./ui";
import { getClubConfigById } from "@/actions/club";
import { getClubCategories } from "@/actions/categories";
import { getClubMembers } from "@/actions/members";
import { getMemberGroups } from "@/actions/groups";

export default function MemberGroupsPage({ params }: PageProps<"/club/[clubId]/groups">) {
  return (
    <Suspense fallback={null}>
      <MemberGroupsLoader params={params} />
    </Suspense>
  );
}

async function MemberGroupsLoader({ params }: { params: Promise<{ clubId: string }> }) {
  const clubId = Number((await params).clubId);
  if (!Number.isInteger(clubId)) notFound();

  const [club, groups, categories, members] = await Promise.all([
    getClubConfigById(clubId),
    getMemberGroups(clubId),
    getClubCategories(clubId),
    getClubMembers(clubId),
  ]);
  if (!club) notFound();

  return (
    <MemberGroupsUI
      clubId={clubId}
      clubName={club.clubName}
      initialGroups={groups}
      categories={categories}
      members={members}
    />
  );
}
