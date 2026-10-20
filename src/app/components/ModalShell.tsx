"use client";

import React, { useEffect, useId, useRef } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";

type ModalShellProps = {
  title?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  /** Any CSS length. The panel never grows past 90vw. Mockups use 480px to 640px. */
  width?: string;
  className?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function ModalShell({
  title = "Dialog",
  onClose = () => {},
  children = "Dialog content goes here.",
  footer,
  width = "500px",
  className = "",
}: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Latest onClose without re-running the mount effect when callers pass inline handlers
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  // Focus the panel, lock body scroll, and restore both on unmount
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, []);

  // Escape closes the dialog; Tab cycles focus inside the panel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const panel = panelRef.current;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!panel.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="modal-shell-scrim" onClick={onClose}>
      <div
        ref={panelRef}
        className={`modal-shell ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ width: `min(${width}, 90vw)` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-shell-header">
          <span id={titleId} className="modal-shell-title">
            {title}
          </span>
          <button
            type="button"
            className="modal-shell-close"
            aria-label="Close"
            onClick={onClose}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="modal-shell-body">
          <div className="modal-shell-frame">{children}</div>
        </div>

        {/* Footer */}
        <div className="modal-shell-footer">{footer}</div>
      </div>
    </div>
  );
}
