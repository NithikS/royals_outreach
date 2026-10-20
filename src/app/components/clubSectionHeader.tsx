import React from "react";
import PageTitle from "./pageTitle";
import "../css/club.css";

type ClubSectionHeaderProps = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Club name shown in the red eyebrow above the title. */
  clubName?: string;
  eyebrow?: string;
  /** Buttons at the right, bottom-aligned with the title. Stack under it when narrow. */
  actions?: React.ReactNode;
  className?: string;
};

export default function ClubSectionHeader({
  title = "Club Config",
  subtitle = "Name, logo and hour rules for this club.",
  clubName = "National Honor Society",
  eyebrow = "Club Executive Panel",
  actions,
  className = "",
}: ClubSectionHeaderProps) {
  return (
    <div className={`club-section-header ${className}`.trim()}>
      {/* Header */}
      <div className="club-section-eyebrow">
        {clubName ? `${clubName} · ${eyebrow}` : eyebrow}
      </div>

      {/* Body */}
      <div className="club-section-header-row">
        <div className="club-section-header-title">
          <PageTitle align="left" subtitle={subtitle} className="club-section-page-title">
            {title}
          </PageTitle>
        </div>
        {actions && <div className="club-section-header-actions">{actions}</div>}
      </div>
    </div>
  );
}
