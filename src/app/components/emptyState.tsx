import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./emptyState.css";

type EmptyStateProps = {
  /** Main line, one short sentence ending in a period. */
  message?: React.ReactNode;
  /** Optional bold heading above the message. */
  title?: React.ReactNode;
  /** Bootstrap Icons name without the "bi-" prefix, shown above the text. */
  icon?: string;
  /** Optional button or link under the message. */
  action?: React.ReactNode;
  /** "sm" fits inside panels and lists; "md" fills a page section. */
  size?: "sm" | "md";
  /** Draws a dashed silver frame around the message. */
  framed?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function EmptyState({
  message = "No requests match your filters.",
  title,
  icon,
  action,
  size = "md",
  framed = false,
  className = "",
  style,
}: EmptyStateProps) {
  const classes = [
    "empty-state",
    `empty-state-${size}`,
    framed ? "empty-state-framed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style} role="status">
      {icon && <i className={`bi bi-${icon} empty-state-icon`} aria-hidden="true" />}
      {title && <div className="empty-state-title">{title}</div>}
      <div className="empty-state-message">{message}</div>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
