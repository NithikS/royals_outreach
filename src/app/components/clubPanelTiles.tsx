"use client";

import React from "react";
import SectionHead from "./sectionHead";
import ClubCard from "./clubCard";
import SaveButton from "./saveButton";
import EmptyState from "./emptyState";
import "./clubPanelTiles.css";
import { formatHours } from "@/lib/formatHours";

export type PanelClub = {
  name: string;
  /** Bootstrap Icons name without the `bi-` prefix. */
  icon: string;
  /** Total approved club hours. Numbers show as "1,540 hrs"; omit to hide the card body. */
  total?: number | string;
};

type ClubPanelTilesProps = {
  /** Clubs this user can open the Club Executive Panel for (staff: assigned clubs; student: exec clubs). */
  clubs?: PanelClub[];
  title?: string;
  totalLabel?: string;
  buttonLabel?: string;
  /** Club Executive Panel button. */
  onOpenPanel?: (club: string) => void;
  /** Builds a link for the panel button when no onOpenPanel is given. */
  panelHref?: (club: string) => string;
  emptyText?: string;
  /** Render nothing when there are no clubs (students who are not an exec of any club). */
  hideWhenEmpty?: boolean;
  className?: string;
};

const DEFAULT_CLUBS: PanelClub[] = [
  { name: "National Honor Society", icon: "award", total: 1540 },
  { name: "Student Council", icon: "megaphone", total: 820 },
];

export default function ClubPanelTiles({
  clubs = DEFAULT_CLUBS,
  title = "Your Clubs",
  totalLabel = "Total Club Hours",
  buttonLabel = "Club Executive Panel",
  onOpenPanel,
  panelHref,
  emptyText = "You are not assigned to any clubs yet.",
  hideWhenEmpty = false,
  className = "",
}: ClubPanelTilesProps) {
  if (hideWhenEmpty && clubs.length === 0) return null;

  return (
    <section className={className || undefined}>
      {/* Header */}
      <SectionHead>{title}</SectionHead>

      {/* Body */}
      {clubs.length > 0 ? (
        <div className="club-card-grid">
          {clubs.map((c) => (
            <ClubCard
              key={c.name}
              name={c.name}
              icon={c.icon}
              className="club-panel-tiles-card"
              actions={
                <SaveButton
                  size="sm"
                  icon="box-arrow-up-right"
                  onClick={onOpenPanel ? () => onOpenPanel(c.name) : undefined}
                  href={panelHref?.(c.name)}
                >
                  {buttonLabel}
                </SaveButton>
              }
            >
              {c.total != null && (
                <div className="club-panel-tiles-total">
                  <span className="club-panel-tiles-label">{totalLabel}</span>
                  <span className="club-panel-tiles-value">
                    {typeof c.total === "number" ? formatHours(c.total) : c.total}
                  </span>
                </div>
              )}
            </ClubCard>
          ))}
        </div>
      ) : (
        <EmptyState size="sm" message={emptyText} />
      )}
    </section>
  );
}
