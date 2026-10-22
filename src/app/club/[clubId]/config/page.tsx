import { Suspense } from "react";
import { notFound } from "next/navigation";
import ClubConfigUI from "./ui";
import { getClubConfigById } from "@/actions/club";

export default function ClubConfigPage({ params }: PageProps<"/club/[clubId]/config">) {
  return (
    <Suspense fallback={null}>
      <ClubConfigLoader params={params} />
    </Suspense>
  );
}

async function ClubConfigLoader({ params }: { params: Promise<{ clubId: string }> }) {
  const clubId = Number((await params).clubId);
  if (!Number.isInteger(clubId)) notFound();

  const club = await getClubConfigById(clubId);
  if (!club) notFound();

  return <ClubConfigUI club={club} />;
}
