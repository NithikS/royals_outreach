"use client";

import React from "react";
import SideNav, { SideNavItem, SideNavUser } from "./sideNav";
import { canSee, ClubRole, ClubSection } from "@/lib/canSee";

type ClubPanelSectionDef = {
  value: ClubSection;
  label: string;
  icon: string;
  group: "Overview" | "Setup" | "Hours" | "Events" | "Data" | "Access";
};

/** Every Club Executive Panel section in side nav order. */
export const CLUB_PANEL_SECTIONS: ClubPanelSectionDef[] = [
  { value: "overview", label: "Overview", icon: "grid", group: "Overview" },
  { value: "config", label: "Club Config", icon: "gear", group: "Setup" },
  { value: "members", label: "Manage Members", icon: "person-lines-fill", group: "Setup" },
  { value: "categories", label: "Categories", icon: "tags", group: "Setup" },
  { value: "groups", label: "Member Groups", icon: "people", group: "Setup" },
  { value: "requests", label: "Hour Requests", icon: "inbox", group: "Hours" },
  { value: "progress", label: "Hours Progress", icon: "bar-chart", group: "Hours" },
  { value: "lookup", label: "Look Up Students", icon: "search", group: "Hours" },
  { value: "opportunities", label: "Opportunities", icon: "calendar-event", group: "Events" },
  { value: "export", label: "Export", icon: "download", group: "Data" },
  { value: "images", label: "Image Folder", icon: "images", group: "Data" },
  { value: "roles", label: "Exec And Roles", icon: "person-badge", group: "Access" },
];

export const CLUB_PANEL_BACK_LABELS: Record<ClubRole, string> = {
  Staff: "Back To Staff Homepage",
  Student: "Back To Student Homepage",
  Admin: "Back To Admin Homepage",
};

export const CLUB_PANEL_USERS: Record<ClubRole, SideNavUser> = {
  Staff: { fName: "Iroh", lName: "Bennett", role: "Staff" },
  Student: { fName: "Aang", lName: "Smith", role: "Student Exec" },
  Admin: { fName: "Toph", lName: "Beifong", role: "Admin" },
};

export type ClubPanelNavOptions = {
  role?: ClubRole;
  /** Red count badges by section, e.g. { requests: 7, opportunities: 3 }. */
  badges?: Partial<Record<ClubSection, number | string>>;
  /** Club OneDrive folder. Image Folder opens it in a new tab. */
  imageFolderHref?: string;
};

/**
 * Builds the grouped SideNav items (Overview / Setup / Hours / Events / Data / Access)
 * for one role, dropping sections `canSee` hides and empty group labels.
 */
export function buildClubPanelNavItems({
  role = "Staff",
  badges = { requests: 7, opportunities: 3 },
  imageFolderHref = "https://onedrive.live.com",
}: ClubPanelNavOptions = {}): SideNavItem[] {
  const visible = CLUB_PANEL_SECTIONS.filter((s) => canSee(s.value, role));
  const items: SideNavItem[] = [];
  let lastGroup = "";

  visible.forEach((s) => {
    if (s.group !== lastGroup && s.group !== "Overview") {
      items.push({ section: s.group });
    }
    lastGroup = s.group;

    items.push({
      value: s.value,
      label: s.label,
      icon: s.icon,
      badge: badges[s.value],
      ...(s.value === "images" ? { href: imageFolderHref, external: true } : {}),
    });
  });

  return items;
}

type ClubPanelNavProps = ClubPanelNavOptions & {
  /** Active section. */
  value?: ClubSection;
  onChange?: (section: ClubSection) => void;
  /** Homepage for the role; the label comes from the role. */
  backHref?: string;
  /** Defaults to the sample user for the role. */
  user?: SideNavUser | null;
  onUserClick?: () => void;
  footer?: React.ReactNode;
  compact?: boolean;
  logoHref?: string;
  className?: string;
};

export default function ClubPanelNav({
  role = "Staff",
  badges,
  imageFolderHref,
  value = "overview",
  onChange,
  backHref = "/",
  user,
  onUserClick,
  footer,
  compact = false,
  logoHref,
  className = "",
}: ClubPanelNavProps) {
  const items = buildClubPanelNavItems({ role, badges, imageFolderHref });
  const active = canSee(value, role) ? value : "overview";

  return (
    <SideNav
      items={items}
      value={active}
      onChange={(v) => {
        // Image Folder only opens OneDrive; it never becomes the active section
        if (v !== "images") onChange?.(v as ClubSection);
      }}
      user={user === undefined ? CLUB_PANEL_USERS[role] : user}
      onUserClick={onUserClick}
      back={{ label: CLUB_PANEL_BACK_LABELS[role], href: backHref }}
      footer={footer}
      compact={compact}
      logoHref={logoHref}
      className={className}
    />
  );
}
