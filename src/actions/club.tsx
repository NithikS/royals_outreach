"use server";

import { db } from "@/db";
import { clubData } from "@/db/schema";
import { eq } from "drizzle-orm";

export type ClubConfig = {
  clubId: number;
  clubName: string;
  execNeedsHours: boolean;
  doubleDipping: boolean;
  clubLogoFileId: string | null;
  /** False until the hour settings have been saved once (a new club only has a name). */
  isConfigured: boolean;
};

// Read
export const getClubConfigById = async (clubId: number): Promise<ClubConfig | null> => {
  const club = await db
    .select()
    .from(clubData)
    .where(eq(clubData.clubId, clubId));
  if (!club[0]) return null;

  // Columns are nullable, so fill in the defaults the config page expects
  return {
    clubId: club[0].clubId,
    clubName: club[0].clubName ?? "",
    execNeedsHours: club[0].execNeedsHours ?? false,
    doubleDipping: club[0].doubleDipping ?? false,
    clubLogoFileId: club[0].clubLogoFileId,
    isConfigured:
      club[0].execNeedsHours !== null &&
      club[0].doubleDipping !== null,
  };
};

// Update
export const updateClubConfigById = async (
  clubId: number,
  data: {
    clubName: string;
    execNeedsHours: boolean;
    doubleDipping: boolean;
    clubLogoFileId: string | null;
  },
) => {
  const clubName = data.clubName.trim().replace(/\s+/g, " ");
  if (!clubName) {
    return { success: false, error: "Club name is required." };
  }

  await db
    .update(clubData)
    .set({
      clubName,
      execNeedsHours: data.execNeedsHours,
      doubleDipping: data.doubleDipping,
      clubLogoFileId: data.clubLogoFileId,
    })
    .where(eq(clubData.clubId, clubId));
  // return to display confirmation
  return { success: true, clubName };
};
