"use client";

import { usePathname } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavItemLink, STUDENT_NAV_ITEMS, isNavItemActive, type SideNavItem } from "./sideNav";
import "../css/mobile-nav.css";

type BottomNavProps = {
  /** Same items as sideNav; section labels are skipped and `shortLabel` is used when set. */
  items?: SideNavItem[];
  /** Active item value. When omitted, the item whose href matches the URL is active. */
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export default function BottomNav({
  items = STUDENT_NAV_ITEMS,
  value,
  onChange,
  className = "",
}: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className={`bottom-nav ${className}`.trim()} aria-label="Main">
      {items
        .filter((item) => !item.section)
        .map((item, i) => {
          const active = isNavItemActive(item, value, pathname);

          return (
            <NavItemLink
              key={item.value ?? item.href ?? i}
              item={item}
              onSelect={onChange}
              className={`bottom-nav-item ${active ? "bottom-nav-item-active" : ""}`.trim()}
            >
              <span className="bottom-nav-icon">
                {item.icon && <i className={`bi bi-${item.icon}`} />}
                {item.badge != null && <span className="bottom-nav-badge">{item.badge}</span>}
              </span>
              <span className="bottom-nav-label">{item.shortLabel ?? item.label}</span>
            </NavItemLink>
          );
        })}
    </nav>
  );
}
