import { Suspense } from "react";
import { notFound } from "next/navigation";
import ManageMembersUI from "./ui";
import { getClubConfigById } from "@/actions/club";
import { getClubGroups, getClubMembers } from "@/actions/members";

export default function ManageMembersPage({ params }: PageProps<"/club/[clubId]/members">) {
  return (
    <Suspense fallback={null}>
      <ManageMembersLoader params={params} />
    </Suspense>
  );
}

async function ManageMembersLoader({ params }: { params: Promise<{ clubId: string }> }) {
  const clubId = Number((await params).clubId);
  if (!Number.isInteger(clubId)) notFound();

  const [club, members, groups] = await Promise.all([
    getClubConfigById(clubId),
    getClubMembers(clubId),
    getClubGroups(clubId),
  ]);
  if (!club) notFound();

  return <ManageMembersUI clubId={clubId} clubName={club.clubName} initialMembers={members} groups={groups} />;
}
