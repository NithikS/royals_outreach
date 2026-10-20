import React from "react";
import Link from "next/link";
import "./siteFooter.css";

type SiteFooterProps = {
  text?: React.ReactNode;
  /** Right-side link label (Homepage shows "Sign In"); omit to hide it (Login page). */
  linkLabel?: string;
  linkHref?: string;
  className?: string;
};

export default function SiteFooter({
  text = "Royals Outreach · Hamilton Southeastern High School · Fishers, IN",
  linkLabel,
  linkHref = "/login",
  className = "",
}: SiteFooterProps) {
  return (
    <footer className={`site-footer ${className}`.trim()}>
      <span>{text}</span>
      {linkLabel && (
        <Link href={linkHref} className="site-footer-link">
          {linkLabel}
        </Link>
      )}
    </footer>
  );
}
