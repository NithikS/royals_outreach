"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/logo+login.css";

type LoginButtonProps = {
  /** Signed in shows the profile icon with a Log Out menu; signed out shows Sign In. */
  signedIn?: boolean;
  label?: string;
  /** Sign In link, used when `onSignIn` is not set. */
  href?: string;
  onSignIn?: () => void;
  onLogout?: () => void;
  className?: string;
};

export default function LoginButton({
  signedIn = false,
  label = "Sign In",
  href = "/login",
  onSignIn,
  onLogout,
  className = "",
}: LoginButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [dropdownOpen]);

  if (signedIn) {
    return (
      <div ref={dropdownRef} className={`login-dropdown ${className}`.trim()}>
        <button
          type="button"
          className="profile-icon-button"
          aria-label="Profile"
          aria-expanded={dropdownOpen}
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <i className="bi bi-person-circle" />
        </button>
        <ul className={`dropdown-menu dropdown-menu-end login-dropdown-menu ${dropdownOpen ? "show" : ""}`.trim()}>
          <li>
            <button
              type="button"
              className="dropdown-item text-danger"
              onClick={() => {
                setDropdownOpen(false);
                onLogout?.();
              }}
            >
              <i className="bi bi-box-arrow-right me-2" />
              Log Out
            </button>
          </li>
        </ul>
      </div>
    );
  }

  if (onSignIn) {
    return (
      <button type="button" className={`login-button ${className}`.trim()} onClick={onSignIn}>
        <i className="bi bi-box-arrow-in-right" />
        {label}
      </button>
    );
  }

  return (
    <Link href={href} className={`login-button ${className}`.trim()}>
      <i className="bi bi-box-arrow-in-right" />
      {label}
    </Link>
  );
}
