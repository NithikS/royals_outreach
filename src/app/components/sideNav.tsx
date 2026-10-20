"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import royalsOutreachLogo from "../assets/logo.png";
import "../css/shell.css";
import { fullName, initials, type PersonName } from "@/lib/personName";

export type SideNavItem = {
  value?: string;
  label?: string;
  /** Shorter label used by bottomNav ("Requests" instead of "My Requests"). */
  shortLabel?: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
  /** Opens `href` in a new tab (Image Folder opens OneDrive). */
  external?: boolean;
  badge?: number | string;
  /** Renders a section group label instead of a link. */
  section?: string;
};

/** Initials and the full name are built from fName and lName. */
export type SideNavUser = PersonName & {
  role: string;
};

export type SideNavBack = {
  label: string;
  href: string;
};

export const STUDENT_NAV_ITEMS: SideNavItem[] = [
  { value: "home", label: "Home", icon: "house" },
  { value: "log", label: "Log Hours", icon: "plus-circle" },
  { value: "hours", label: "Goal Progress", shortLabel: "Goals", icon: "bullseye" },
  { value: "req", label: "My Requests", shortLabel: "Requests", icon: "inbox", badge: 2 },
  { section: "Clubs" },
  { value: "opps", label: "Opportunities", shortLabel: "Events", icon: "calendar-event" },
  { value: "clubs", label: "All Clubs", shortLabel: "Clubs", icon: "people" },
  { section: "Account" },
  { value: "export", label: "Export Portfolio", shortLabel: "Export", icon: "file-earmark-arrow-down" },
];

export const DEFAULT_NAV_USER: SideNavUser = {
  fName: "Aang",
  lName: "Smith",
  role: "Student",
};

export function isNavItemActive(
  item: SideNavItem,
  value: string | undefined,
  pathname: string | null,
) {
  if (value !== undefined) return item.value === value;
  return !!item.href && !item.external && item.href === pathname;
}

/** Renders a nav item as an external <a>, a next/link, or a button. */
export function NavItemLink({
  item,
  className,
  title,
  onSelect,
  children,
}: {
  item: SideNavItem;
  className: string;
  title?: string;
  onSelect?: (value: string) => void;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    item.onClick?.();
    if (onSelect && item.value) onSelect(item.value);
  };

  if (item.href && item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={title}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href} className={className} title={title} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} title={title} onClick={handleClick}>
      {children}
    </button>
  );
}

type NavLockupProps = {
  /** Link target. Pass null for a static lockup (coordinator page, no account). */
  logoHref?: string | null;
  small?: boolean;
  className?: string;
};

/** ROYALS / OUTREACH logo lockup shared by sideNav and MobileNav (pass logoHref={null} for a static lockup). */
export function NavLockup({ logoHref = "/", small = false, className = "" }: NavLockupProps) {
  const classes = `side-nav-brand ${small ? "side-nav-brand-small" : ""} ${className}`.replace(/\s+/g, " ").trim();
  const content = (
    <>
      <Image
        src={royalsOutreachLogo}
        alt=""
        width={52}
        height={52}
        className="side-nav-logo"
      />
      <span className="side-nav-lockup">
        <span className="side-nav-lockup-title">ROYALS</span>
        <span className="side-nav-lockup-subtitle">OUTREACH</span>
      </span>
    </>
  );

  if (logoHref === null) {
    return (
      <div className={classes} role="img" aria-label="Royals Outreach">
        {content}
      </div>
    );
  }

  return (
    <Link href={logoHref} className={classes} aria-label="Royals Outreach Home">
      {content}
    </Link>
  );
}

type SideNavProps = {
  items?: SideNavItem[];
  /** Active item value. When omitted, the item whose href matches the URL is active. */
  value?: string;
  onChange?: (value: string) => void;
  user?: SideNavUser | null;
  /** Makes the user block a button (e.g. to open the log out menu). */
  onUserClick?: () => void;
  /** "Back To ... Homepage" button above the user block (club panel). */
  back?: SideNavBack;
  /** Extra content above the user block, e.g. a user menu popover. */
  footer?: React.ReactNode;
  /** Always render the icon-only rail (it also collapses on its own under 1024px). */
  compact?: boolean;
  logoHref?: string;
  className?: string;
};

export default function SideNav({
  items = STUDENT_NAV_ITEMS,
  value,
  onChange,
  user = DEFAULT_NAV_USER,
  onUserClick,
  back,
  footer,
  compact = false,
  logoHref = "/",
  className = "",
}: SideNavProps) {
  const pathname = usePathname();

  const userContent = user && (
    <>
      <span className="side-nav-avatar">{initials(user)}</span>
      <span className="side-nav-user-text">
        <span className="side-nav-user-name">{fullName(user)}</span>
        <span className="side-nav-user-role">{user.role}</span>
      </span>
    </>
  );

  return (
    <nav
      className={`side-nav ${compact ? "side-nav-compact" : ""} ${className}`.trim()}
      aria-label="Main"
    >
      {/* Header */}
      <div className="side-nav-header">
        <NavLockup logoHref={logoHref} />
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
              item={item}
              title={item.label}
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
            <Link href={back.href} className="side-nav-back" title={back.label}>
              <i className="bi bi-arrow-left" />
              <span className="side-nav-back-label">{back.label}</span>
            </Link>
          )}

          {footer}

          {user &&
            (onUserClick ? (
              <button
                type="button"
                className="side-nav-user side-nav-user-button"
                title={fullName(user)}
                onClick={onUserClick}
              >
                {userContent}
              </button>
            ) : (
              <div className="side-nav-user" title={fullName(user)}>
                {userContent}
              </div>
            ))}
        </div>
      )}
    </nav>
  );
}
