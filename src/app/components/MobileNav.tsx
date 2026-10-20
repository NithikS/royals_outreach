"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  DEFAULT_NAV_USER,
  NavItemLink,
  NavLockup,
  STUDENT_NAV_ITEMS,
  isNavItemActive,
  type SideNavBack,
  type SideNavItem,
  type SideNavUser,
} from "./sideNav";
import "../css/shell.css";
import "../css/mobile-nav.css";
import { fullName, initials } from "@/lib/personName";

type MobileNavProps = {
  items?: SideNavItem[];
  /** Active item value. When omitted, the item whose href matches the URL is active. */
  value?: string;
  onChange?: (value: string) => void;
  user?: SideNavUser | null;
  /** Makes the drawer's user block a button (e.g. to open the log out menu). */
  onUserClick?: () => void;
  back?: SideNavBack;
  /** Extra content at the bottom of the drawer, above the user block. */
  footer?: React.ReactNode;
  logoHref?: string;
  className?: string;
};

export default function MobileNav({
  items = STUDENT_NAV_ITEMS,
  value,
  onChange,
  user = DEFAULT_NAV_USER,
  onUserClick,
  back,
  footer,
  logoHref = "/",
  className = "",
}: MobileNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className={`mobile-nav ${className}`.trim()}>
      {/* Top bar */}
      <header className="mobile-nav-bar">
        <NavLockup logoHref={logoHref} small />
        {user && <span className="mobile-nav-avatar">{initials(user)}</span>}
        <button
          type="button"
          className="mobile-nav-toggle"
          aria-label="Open Menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <i className="bi bi-list" />
        </button>
      </header>

      {/* Scrim */}
      <div
        className={`mobile-nav-scrim ${open ? "mobile-nav-scrim-open" : ""}`.trim()}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <nav
        className={`mobile-nav-drawer ${open ? "mobile-nav-drawer-open" : ""}`.trim()}
        aria-label="Main"
        aria-hidden={!open}
        inert={!open}
      >
        {/* Header */}
        <div className="mobile-nav-drawer-header">
          <NavLockup logoHref={logoHref} small />
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-label="Close Menu"
            onClick={() => setOpen(false)}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="side-nav-items">
          {items.map((item, i) => {
            if (item.section) {
              return (
                <div key={`section-${i}`} className="side-nav-section">
                  <span className="side-nav-section-label">{item.section}</span>
                </div>
              );
            }

            const active = isNavItemActive(item, value, pathname);

            return (
              <NavItemLink
                key={item.value ?? item.href ?? i}
                item={{
                  ...item,
                  onClick: () => {
                    item.onClick?.();
                    setOpen(false);
                  },
                }}
                onSelect={onChange}
                className={`side-nav-item ${active ? "side-nav-item-active" : ""}`.trim()}
              >
                {item.icon && <i className={`bi bi-${item.icon} side-nav-item-icon`} />}
                <span className="side-nav-item-label">{item.label}</span>
                {item.badge != null && <span className="side-nav-badge">{item.badge}</span>}
              </NavItemLink>
            );
          })}
        </div>

        {/* Footer */}
        {(back || footer || user) && (
          <div className="side-nav-footer">
            {back && (
              <Link href={back.href} className="side-nav-back" onClick={() => setOpen(false)}>
                <i className="bi bi-arrow-left" />
                <span className="side-nav-back-label">{back.label}</span>
              </Link>
            )}

            {footer}

            {user &&
              (onUserClick ? (
                <button type="button" className="side-nav-user side-nav-user-button" onClick={onUserClick}>
                  <span className="side-nav-avatar">{initials(user)}</span>
                  <span className="side-nav-user-text">
                    <span className="side-nav-user-name">{fullName(user)}</span>
                    <span className="side-nav-user-role">{user.role}</span>
                  </span>
                </button>
              ) : (
                <div className="side-nav-user">
                  <span className="side-nav-avatar">{initials(user)}</span>
                  <span className="side-nav-user-text">
                    <span className="side-nav-user-name">{fullName(user)}</span>
                    <span className="side-nav-user-role">{user.role}</span>
                  </span>
                </div>
              ))}
          </div>
        )}
      </nav>
    </div>
  );
}
