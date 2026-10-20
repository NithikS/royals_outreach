"use client";

import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";

type IconButtonProps = {
  /** Bootstrap Icons name without the `bi-` prefix. */
  icon?: string;
  /** Accessible name, also shown as the native tooltip. */
  label?: string;
  /** Icon size in px. Filled buttons are a circle 1.7x this size. */
  size?: number;
  variant?: "plain" | "filled";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function IconButton({
  icon = "pencil",
  label = "Edit",
  size = 28,
  variant = "plain",
  onClick,
  disabled = false,
  className = "",
  style,
}: IconButtonProps) {
  const filled = variant === "filled";

  return (
    <button
      type="button"
      className={`icon-button ${filled ? "icon-button-filled" : ""} ${className}`.replace(/\s+/g, " ").trim()}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(filled ? { width: size * 1.7, height: size * 1.7 } : {}),
        ...style,
      }}
    >
      <i className={`bi bi-${icon} icon-button-icon`} style={{ fontSize: size }} aria-hidden="true" />
    </button>
  );
}
