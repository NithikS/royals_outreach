"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import ClubPanelNav, { CLUB_PANEL_BACK_LABELS, CLUB_PANEL_USERS, buildClubPanelNavItems } from "@/app/components/clubPanelNav";
import MobileNav from "@/app/components/MobileNav";
import type { ClubRole, ClubSection } from "@/lib/canSee";

// TODO: role, user and back link come from the session once RBAC is added
const ROLE: ClubRole = "Staff";
const BACK_HREF = "/";

export default function ClubPanelNavUI() {
  const router = useRouter();
  const pathname = usePathname();
  const { clubId } = useParams<{ clubId: string }>();

  // /club/12/config -> "config"
  const section = (pathname.split("/")[3] || "overview") as ClubSection;
  const goTo = (value: string) => router.push(`/club/${clubId}/${value}`);

  return (
    <>
      <ClubPanelNav role={ROLE} badges={{}} value={section} onChange={goTo} backHref={BACK_HREF} />
      <MobileNav
        items={buildClubPanelNavItems({ role: ROLE, badges: {} })}
        value={section}
        onChange={(value) => {
          if (value !== "images") goTo(value);
        }}
        user={CLUB_PANEL_USERS[ROLE]}
        back={{ label: CLUB_PANEL_BACK_LABELS[ROLE], href: BACK_HREF }}
      />
    </>
  );
}
