import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import HourRequestsUI from "./ui";
import { getClubConfigById } from "@/actions/club";
import { getClubCategories } from "@/actions/categories";
import { getClubMembers } from "@/actions/members";
import { getClubRequests } from "@/actions/clubRequests";
import { schoolToday } from "@/lib/schoolDate";

export default function HourRequestsPage({ params }: PageProps<"/club/[clubId]/requests">) {
  return (
    <Suspense fallback={null}>
      <HourRequestsLoader params={params} />
    </Suspense>
  );
}

async function HourRequestsLoader({ params }: { params: Promise<{ clubId: string }> }) {
  await connection();
  const clubId = Number((await params).clubId);
  if (!Number.isInteger(clubId)) notFound();

  const [club, requests, categories, members] = await Promise.all([
    getClubConfigById(clubId),
    getClubRequests(clubId),
    getClubCategories(clubId),
    getClubMembers(clubId),
  ]);
  if (!club) notFound();

  return (
    <HourRequestsUI
      clubId={clubId}
      clubName={club.clubName}
      requests={requests}
      categories={categories}
      members={members.filter((m) => m.isActive)}
      today={schoolToday()}
    />
  );
}
