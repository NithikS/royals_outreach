"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";

type SaveButtonVariant = "primary" | "secondary" | "dashed" | "danger" | "pill" | "ghost";
type SaveButtonSize = "sm" | "md" | "lg";

type SaveButtonProps = {
  children?: React.ReactNode;
  variant?: SaveButtonVariant;
  size?: SaveButtonSize;
  /** Bootstrap Icons name without the `bi-` prefix, shown before the label. */
  icon?: string;
  /** Bootstrap Icons name shown after the label (e.g. "arrow-right"). */
  iconRight?: string;
  fullWidth?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Navigates with the Next router when no onClick is given. */
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function SaveButton({
  children = "Save",
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  fullWidth = false,
  onClick,
  href,
  type = "button",
  disabled = false,
  className = "",
  style,
}: SaveButtonProps) {
  const router = useRouter();

  const classes = [
    "save-button",
    variant !== "primary" ? `save-button-${variant}` : "",
    size !== "md" ? `save-button-${size}` : "",
    fullWidth ? "save-button-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      style={style}
      onClick={onClick ? onClick : () => href && router.push(href)}
      type={type}
      disabled={disabled}
    >
      {icon && <i className={`bi bi-${icon} save-button-icon`} aria-hidden="true" />}
      {children}
      {iconRight && <i className={`bi bi-${iconRight} save-button-icon`} aria-hidden="true" />}
    </button>
  );
}
