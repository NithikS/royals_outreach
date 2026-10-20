import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";

type BadgeTone = "pending" | "approved" | "denied" | "info";

type BadgeProps = {
  children?: React.ReactNode;
  tone?: BadgeTone;
  /** Solid status-color background with white text. */
  filled?: boolean;
  /** Show the tone's status icon before the text. */
  icon?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const BADGE_ICONS: Record<BadgeTone, string> = {
  pending: "hourglass-split",
  approved: "check-circle-fill",
  denied: "x-circle-fill",
  info: "info-circle-fill",
};

const BADGE_LABELS: Record<BadgeTone, string> = {
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
  info: "Info",
};

export default function Badge({
  children,
  tone = "info",
  filled = false,
  icon = true,
  className = "",
  style,
}: BadgeProps) {
  const classes = [
    "badge-chip",
    `badge-${tone}`,
    filled ? "badge-filled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} style={style}>
      {icon && <i className={`bi bi-${BADGE_ICONS[tone]} badge-chip-icon`} aria-hidden="true" />}
      {children ?? BADGE_LABELS[tone]}
    </span>
  );
}
