"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/student.css";
import { fullName } from "@/lib/personName";

export type UserMenuItem = {
  label: string;
  /** Bootstrap Icons name without the `bi-` prefix. */
  icon?: string;
  href?: string;
  onClick?: () => void;
};

type UserMenuProps = {
  /** Pages keep this in state and toggle it from sideNav's `onUserClick`. */
  open?: boolean;
  fName?: string;
  lName?: string;
  /** Gray line under the name ("Student · Class Of 2029"). */
  detail?: string;
  /** Extra links shown above Log Out. */
  items?: UserMenuItem[];
  logoutLabel?: string;
  /** Log Out link, used when `onLogout` is not set. */
  logoutHref?: string;
  onLogout?: () => void;
  /** Called on Escape or a click outside the nav footer (the user block toggles it itself). */
  onClose?: () => void;
  className?: string;
};

// Popover for sideNav / MobileNav: pass it as `footer` and open it from `onUserClick`.
export default function UserMenu({
  open = true,
  fName = "Aang",
  lName = "Smith",
  detail = "Student · Class Of 2029",
  items = [],
  logoutLabel = "Log Out",
  logoutHref = "/",
  onLogout,
  onClose,
  className = "",
}: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape or a click outside the footer that holds the menu and the user block
  useEffect(() => {
    if (!open || !onClose) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const area = menuRef.current?.parentElement ?? menuRef.current;
      if (area && !area.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const name = fullName({ fName, lName });

  return (
    <div ref={menuRef} className={`user-menu ${className}`.trim()} role="menu" aria-label={`${name} Menu`}>
      {/* Header */}
      <div className="user-menu-header">
        <div className="user-menu-name">{name}</div>
        {detail && <div className="user-menu-detail">{detail}</div>}
      </div>

      {/* Body */}
      {items.map((item) => {
        const inner = (
          <>
            {item.icon && <i className={`bi bi-${item.icon}`} aria-hidden="true" />}
            {item.label}
          </>
        );

        return item.href ? (
          <Link key={item.label} href={item.href} className="user-menu-item" role="menuitem" onClick={item.onClick}>
            {inner}
          </Link>
        ) : (
          <button key={item.label} type="button" className="user-menu-item" role="menuitem" onClick={item.onClick}>
            {inner}
          </button>
        );
      })}

      {/* Footer */}
      {onLogout ? (
        <button type="button" className="user-menu-item user-menu-logout" role="menuitem" onClick={onLogout}>
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          {logoutLabel}
        </button>
      ) : (
        <Link href={logoutHref} className="user-menu-item user-menu-logout" role="menuitem">
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          {logoutLabel}
        </Link>
      )}
    </div>
  );
}
