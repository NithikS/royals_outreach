import React from "react";
import Link from "next/link";
import LogoButton from "./logoButton";
import LoginButton from "./loginButton";
import "../css/shell.css";

export type AppHeaderLink = {
  label: string;
  href: string;
};

type AppHeaderProps = {
  links?: AppHeaderLink[];
  /** href of the active link (red with an underline). */
  activeHref?: string;
  logoHref?: string;
  /** Right-side slot; defaults to the Sign In button. Pass null to hide it. */
  action?: React.ReactNode;
  className?: string;
};

const DEFAULT_LINKS: AppHeaderLink[] = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why It Matters", href: "#why-it-matters" },
  { label: "Contact", href: "#contact" },
];

export default function AppHeader({
  links = DEFAULT_LINKS,
  activeHref,
  logoHref = "/",
  action = <LoginButton />,
  className = "",
}: AppHeaderProps) {
  return (
    <header className={`app-header ${className}`.trim()}>
      <div className="app-header-inner">
        <LogoButton href={logoHref} />

        <nav className="app-header-links" aria-label="Site">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`app-header-link ${link.href === activeHref ? "app-header-link-active" : ""}`.trim()}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {action}
      </div>
    </header>
  );
}
