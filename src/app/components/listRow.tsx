"use client";

import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./listRow.css";

type ListRowProps = {
  /** Bold blue main line. */
  title?: React.ReactNode;
  /** Text after the title on the same line, prefixed with " · " ("Key Club · Oct 2"). */
  inlineMeta?: React.ReactNode;
  /** Smaller second line under the title. */
  subtitle?: React.ReactNode;
  /** "default" is black body text; "muted" is semibold gray (club panel rows). */
  subtitleTone?: "default" | "muted";
  /** Larger title (1.05rem) for event and club rows. */
  titleSize?: "md" | "lg";
  /** Left slot: date block, icon tile, chevron, avatar. */
  leading?: React.ReactNode;
  /** Bold right-aligned value before the trailing slot ("3 hrs", "60%"). */
  meta?: React.ReactNode;
  /** Right slot: badges, buttons, icon buttons, switches. */
  trailing?: React.ReactNode;
  /** Extra lines under the subtitle (location, notes). */
  children?: React.ReactNode;
  /** Replaces title, subtitle and children entirely with custom main content. */
  main?: React.ReactNode;
  divider?: "silver" | "blue" | "none";
  /** 5px blue left edge with a blue tint, for master/detail lists. */
  selected?: boolean;
  /** Light blue background without the edge (e.g. a highlighted row). */
  highlighted?: boolean;
  density?: "compact" | "default" | "roomy";
  /** Makes the whole row clickable. The title becomes a real button whose hit area
   *  stretches over the row; controls in `trailing` stay separately clickable. */
  onClick?: () => void;
  /** Accessible name of the row button when `main` replaces the title. */
  hitLabel?: string;
  as?: "div" | "li";
  className?: string;
  style?: React.CSSProperties;
};

export default function ListRow({
  title = "Park Cleanup",
  inlineMeta,
  subtitle,
  subtitleTone = "default",
  titleSize = "md",
  leading,
  meta,
  trailing,
  children,
  main,
  divider = "silver",
  selected = false,
  highlighted = false,
  density = "default",
  onClick,
  hitLabel,
  as: Tag = "div",
  className = "",
  style,
}: ListRowProps) {
  const classes = [
    "list-row",
    divider !== "silver" ? `list-row-divider-${divider}` : "",
    density !== "default" ? `list-row-${density}` : "",
    selected ? "list-row-selected" : "",
    highlighted ? "list-row-highlighted" : "",
    onClick ? "list-row-clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const titleClass = `list-row-title ${titleSize === "lg" ? "list-row-title-lg" : ""}`.trim();

  return (
    <Tag className={classes} style={style}>
      {/* Leading */}
      {leading && <div className="list-row-leading">{leading}</div>}

      {/* Main */}
      <div className="list-row-main">
        {/* Row button over custom main content */}
        {main != null && onClick && (
          <button
            type="button"
            className="list-row-hit list-row-hit-empty"
            aria-pressed={selected || undefined}
            aria-label={hitLabel ?? (typeof title === "string" ? title : "Select")}
            onClick={onClick}
          />
        )}
        {main ?? (
          <>
            {(title || inlineMeta) && (
              <div className="list-row-title-line">
                {title &&
                  (onClick ? (
                    <button
                      type="button"
                      className={`list-row-hit ${titleClass}`}
                      aria-pressed={selected || undefined}
                      onClick={onClick}
                    >
                      {title}
                    </button>
                  ) : (
                    <span className={titleClass}>{title}</span>
                  ))}
                {inlineMeta && <span className="list-row-inline-meta"> · {inlineMeta}</span>}
              </div>
            )}
            {subtitle && (
              <div className={`list-row-subtitle ${subtitleTone === "muted" ? "list-row-subtitle-muted" : ""}`.trim()}>
                {subtitle}
              </div>
            )}
            {children && <div className="list-row-extra">{children}</div>}
          </>
        )}
      </div>

      {/* Meta and trailing */}
      {(meta != null || trailing) && (
        <div className="list-row-end">
          {meta != null && <span className="list-row-meta">{meta}</span>}
          {trailing && <div className="list-row-trailing">{trailing}</div>}
        </div>
      )}
    </Tag>
  );
}

type ListRowDateProps = {
  /** Three-letter month, shown uppercase ("OCT"). */
  month?: string;
  day?: string | number;
  /** Optional third line ("+2 More"). */
  note?: React.ReactNode;
  /** "solid" is the white-on-blue tile (Home); "plain" is blue text (Opportunities); "accent" has a red month (club panel). */
  variant?: "solid" | "plain" | "accent";
  className?: string;
};

/** Date block for the `leading` slot of event and opportunity rows. */
export function ListRowDate({
  month = "OCT",
  day = "10",
  note,
  variant = "solid",
  className = "",
}: ListRowDateProps) {
  return (
    <div className={`list-row-date list-row-date-${variant} ${className}`.trim()}>
      <span className="list-row-date-month">{month}</span>
      <span className="list-row-date-day">{day}</span>
      {note && <span className="list-row-date-note">{note}</span>}
    </div>
  );
}

type ListRowIconProps = {
  /** Bootstrap Icons name without the "bi-" prefix. */
  icon?: string;
  size?: "sm" | "md";
  className?: string;
};

/** Solid blue rounded icon tile for the `leading` slot. */
export function ListRowIcon({ icon = "people", size = "sm", className = "" }: ListRowIconProps) {
  return (
    <span className={`list-row-icon list-row-icon-${size} ${className}`.trim()} aria-hidden="true">
      <i className={`bi bi-${icon}`} />
    </span>
  );
}
