"use client";

import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ListRowIcon } from "./listRow";
import "./clubCard.css";

type ClubCardProps = {
  name?: string;
  /** Bootstrap Icons name without the `bi-` prefix ("heart", "palette", "gear"). */
  icon?: string;
  /** Card: gray line under the name. Tile: smaller line under the name ("3 open events"). */
  meta?: React.ReactNode;
  /** "card" is the framed club card (Staff/Admin All Clubs, Exec Clubs); "tile" is the selectable picker tile. */
  variant?: "card" | "tile";
  /** Card body under the header (staff list, progress bar, notes). */
  children?: React.ReactNode;
  /** Card footer buttons (Assign Staff, Club Executive Panel). */
  actions?: React.ReactNode;
  /** Tile: solid blue when selected. */
  selected?: boolean;
  /** Tile: show a check circle at the right that fills when selected (multi select). */
  checkable?: boolean;
  /** Tile: click handler. Without it the tile is a static, non-interactive block. */
  onClick?: () => void;
  /** Tile: locked (e.g. every club is included in a full portfolio). */
  disabled?: boolean;
  className?: string;
};

export default function ClubCard({
  name = "Key Club",
  icon = "heart",
  meta,
  variant = "card",
  children,
  actions,
  selected = false,
  checkable = false,
  onClick,
  disabled = false,
  className = "",
}: ClubCardProps) {
  if (variant === "tile") {
    const classes = [
      "club-card-tile",
      selected ? "club-card-tile-selected" : "",
      onClick && !disabled ? "club-card-tile-clickable" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const inner = (
      <>
        <i className={`bi bi-${icon} club-card-tile-icon`} aria-hidden="true" />
        <span className="club-card-tile-text">
          <span className="club-card-tile-name">{name}</span>
          {meta && <span className="club-card-tile-meta">{meta}</span>}
        </span>
        {checkable && (
          <i
            className={`bi bi-${selected ? "check-circle-fill" : "circle"} club-card-tile-mark`}
            aria-hidden="true"
          />
        )}
      </>
    );

    if (!onClick) return <div className={classes}>{inner}</div>;

    return (
      <button
        type="button"
        className={classes}
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }

  return (
    <section className={`club-card ${className}`.trim()}>
      {/* Header */}
      <header className="club-card-header">
        <ListRowIcon icon={icon} size="md" />
        <div className="club-card-heading">
          <h3 className="club-card-name">{name}</h3>
          {meta && <div className="club-card-meta">{meta}</div>}
        </div>
      </header>

      {/* Body */}
      {children && <div className="club-card-body">{children}</div>}

      {/* Footer */}
      {actions && <div className="club-card-actions">{actions}</div>}
    </section>
  );
}
