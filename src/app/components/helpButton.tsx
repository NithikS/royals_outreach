"use client";

import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";

type HelpButtonProps = {
  label?: string;
  icon?: string;
  /** Navigates like a link when set; otherwise renders a button that calls onClick. */
  href?: string;
  onClick?: () => void;
  /** Pins the pill to the bottom-right corner. Turn off to place it inline. */
  fixed?: boolean;
  /** Icon only, no label. The label also hides automatically under 600px. */
  compact?: boolean;
  className?: string;
};

export default function HelpButton({
  label = "Help",
  icon = "question-circle-fill",
  href,
  onClick,
  fixed = true,
  compact = false,
  className = "",
}: HelpButtonProps) {
  const classes = [
    "help-button",
    fixed ? "help-button-fixed" : "",
    compact ? "help-button-compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <i className={`bi bi-${icon}`} />
      <span className="help-button-label">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={label}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} aria-label={label} onClick={onClick}>
      {inner}
    </button>
  );
}
