import React from "react";
import "../css/components.css";

type SectionHeadProps = {
  children?: React.ReactNode;
  /** Optional control shown right of the silver rule (button, switch, link). */
  action?: React.ReactNode;
  /** "lg" is the large club-name heading used above a club's goal progress. */
  size?: "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
};

export default function SectionHead({
  children = "Goal Progress",
  action,
  size = "md",
  className = "",
  style,
}: SectionHeadProps) {
  return (
    <div className={`section-head ${size === "lg" ? "section-head-lg" : ""} ${className}`.replace(/\s+/g, " ").trim()} style={style}>
      <h2 className="section-head-label">{children}</h2>
      <span className="section-head-rule" aria-hidden="true" />
      {action && <div className="section-head-action">{action}</div>}
    </div>
  );
}
