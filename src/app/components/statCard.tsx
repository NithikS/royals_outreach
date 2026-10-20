import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";

type StatCardProps = {
  label?: React.ReactNode;
  /** Main number, with its unit when it stands alone ("6 hrs"). */
  value?: React.ReactNode;
  /** Optional goal shown after the value as " / 25 hrs". */
  of?: React.ReactNode;
  /** Bootstrap Icons name without the "bi-" prefix, e.g. "clock". */
  icon?: string;
  tone?: "tint" | "solid";
  className?: string;
  style?: React.CSSProperties;
};

export default function StatCard({
  label = "Approved",
  value = "6 hrs",
  of,
  icon,
  tone = "tint",
  className = "",
  style,
}: StatCardProps) {
  return (
    <div
      className={`stat-card stat-card-${tone} ${className}`.trim()}
      style={style}
    >
      <div className="stat-card-top">
        <span>
          <span className="stat-card-value">{value}</span>
          {of != null && <span className="stat-card-of"> / {of}</span>}
        </span>
        {icon && <i className={`bi bi-${icon} stat-card-icon`} aria-hidden="true" />}
      </div>
      <span className="stat-card-label">{label}</span>
    </div>
  );
}
