import React from "react";
import "../css/components.css";

type BannerHeaderProps = {
  title?: React.ReactNode;
  /** Small uppercase silver line above the title ("Class Of 2029"). */
  eyebrow?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Right-side content (e.g. the Log Hours button). Wraps below the title when narrow. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function BannerHeader({
  title = "Welcome, Aang Smith!",
  eyebrow = "Class Of 2029",
  subtitle,
  children,
  className = "",
  style,
}: BannerHeaderProps) {
  return (
    <div className={`banner-header ${className}`.trim()} style={style}>
      <div className="banner-header-inner">
        <div className="banner-header-text">
          {eyebrow && <div className="banner-header-eyebrow">{eyebrow}</div>}
          <h1 className="banner-header-title">{title}</h1>
          {subtitle && <p className="banner-header-subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
