import { Suspense } from "react";
import { notFound } from "next/navigation";
import ClubCategoriesUI from "./ui";
import { getClubConfigById } from "@/actions/club";
import { getClubCategories } from "@/actions/categories";

export default function ClubCategoriesPage({ params }: PageProps<"/club/[clubId]/categories">) {
  return (
    <Suspense fallback={null}>
      <ClubCategoriesLoader params={params} />
    </Suspense>
  );
}

async function ClubCategoriesLoader({ params }: { params: Promise<{ clubId: string }> }) {
  const clubId = Number((await params).clubId);
  if (!Number.isInteger(clubId)) notFound();

  const [club, categories] = await Promise.all([getClubConfigById(clubId), getClubCategories(clubId)]);
  if (!club) notFound();

  return (
    <ClubCategoriesUI
      clubId={clubId}
      clubName={club.clubName}
      initialCategories={categories}
    />
  );
}
