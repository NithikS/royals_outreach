import React from "react";
import "../css/components.css";

type PageTitleProps = {
  children?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** "center" is the huge welcome title; "left" is the standard page heading. */
  align?: "center" | "left";
  className?: string;
  style?: React.CSSProperties;
};

export default function PageTitle({
  children = "Welcome, Aang Smith!",
  subtitle,
  align = "center",
  className = "",
  style,
}: PageTitleProps) {
  return (
    <header
      className={`page-title page-title-${align} ${className}`.trim()}
      style={style}
    >
      <h1 className="page-title-text">{children}</h1>
      {subtitle && <p className="page-title-subtitle">{subtitle}</p>}
    </header>
  );
}
