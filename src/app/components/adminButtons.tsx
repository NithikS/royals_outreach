"use client";

import React from "react";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/admin.css";

type AdminButtonsVariant = "primary" | "danger" | "dashed";

type AdminButtonsProps = {
  children?: React.ReactNode;
  link?: string;
  icon?: string;
  variant?: AdminButtonsVariant;
  onClick?: () => void;
  className?: string;
  borderColor?: string;
  backgroundColor?: string;
  /** Skip the JS hover color-swap and let CSS (:hover in shell.css) handle
   *  it instead. The swap only runs when a prop-driven `backgroundColor` or
   *  `borderColor` is set; variant colors always use CSS. */
  staticStyle?: boolean;
};

const VARIANT_CLASSES: Record<AdminButtonsVariant, string> = {
  primary: "",
  danger: "admin-nav-button-danger",
  dashed: "admin-nav-button-dashed",
};

export default function AdminButtons({
  children = "Log Hours",
  link = "#",
  icon,
  variant = "primary",
  onClick,
  className = "",
  borderColor,
  backgroundColor,
  staticStyle = false,
}: AdminButtonsProps) {
  const router = useRouter();
  const swap = !staticStyle && !!(backgroundColor || borderColor);

  const buttonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!swap) return;
    e.currentTarget.style.backgroundColor = "var(--white)";
    e.currentTarget.style.color = backgroundColor ?? "var(--primaryBlue)";
    e.currentTarget.style.borderColor = borderColor ?? backgroundColor ?? "var(--primaryBlue)";
  };

  const buttonUnhover = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!swap) return;
    e.currentTarget.style.backgroundColor = backgroundColor ?? "var(--primaryBlue)";
    e.currentTarget.style.color = "var(--white)";
    e.currentTarget.style.borderColor = borderColor ?? "transparent";
  };

  return (
    <button
      type="button"
      className={`admin-nav-button ${VARIANT_CLASSES[variant]} ${className}`.replace(/\s+/g, " ").trim()}
      style={{
        ...(borderColor ? { borderColor } : {}),
        ...(backgroundColor ? { backgroundColor } : {}),
      }}
      onMouseEnter={buttonHover}
      onMouseLeave={buttonUnhover}
      onClick={() => {
        if (onClick) {
          onClick();
        } else if (link && link !== "#") {
          router.push(link);
        }
      }}
    >
      {icon && <i className={`bi bi-${icon} admin-nav-button-icon`} />}
      <span>{children}</span>
    </button>
  );
}
