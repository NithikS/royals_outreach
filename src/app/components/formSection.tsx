"use client";

import React from "react";
import SectionHead from "./sectionHead";
import "./formSection.css";

type FormSectionProps = {
  title?: React.ReactNode;
  /** Short line under the title. */
  description?: React.ReactNode;
  /** Frame color (5px). "none" drops the frame and uses a SectionHead for the title (Log Hours steps). */
  tone?: "red" | "blue" | "none";
  /** "bar" is a solid title bar in the frame color; "plain" is a bold heading inside the frame. Ignored when tone is "none". */
  header?: "bar" | "plain";
  /** Control shown at the right of the title (button, switch, badge). */
  action?: React.ReactNode;
  /** Field grid columns. Wrap a child in `FormSectionSpan` to span the full row. Collapses to 1 under 768px. */
  columns?: 1 | 2;
  children?: React.ReactNode;
  /** Button row under the fields, separated by a 3px silver rule. */
  footer?: React.ReactNode;
  /** Renders a form element; the default submit is prevented before this runs. */
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Center the body content (confirmation and success panels). */
  centered?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function FormSection({
  title = "Opportunity Details",
  description,
  tone = "red",
  header = "plain",
  action,
  columns = 2,
  children,
  footer,
  onSubmit,
  centered = false,
  className = "",
  style,
}: FormSectionProps) {
  const framed = tone !== "none";
  const bar = framed && header === "bar";

  const classes = [
    "form-panel",
    framed ? `form-panel-frame form-panel-${tone}` : "form-panel-open",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {/* Header */}
      {title &&
        (!framed ? (
          <SectionHead action={action}>
            {title}
          </SectionHead>
        ) : bar ? (
          <header className="form-panel-bar">
            <h3 className="form-panel-bar-title">{title}</h3>
            {action}
          </header>
        ) : (
          <header className="form-panel-header">
            <h3 className="form-panel-title">{title}</h3>
            {action}
          </header>
        ))}

      {/* Body */}
      <div className={`form-panel-body ${centered ? "form-panel-body-centered" : ""}`.trim()}>
        {description && <p className="form-panel-description">{description}</p>}
        <div className={`form-panel-grid form-panel-grid-${centered ? "center" : columns}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && <div className="form-panel-footer">{footer}</div>}
      </div>
    </>
  );

  if (onSubmit) {
    return (
      <form
        className={classes}
        style={style}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e);
        }}
      >
        {content}
      </form>
    );
  }

  return (
    <section className={classes} style={style}>
      {content}
    </section>
  );
}

/** Wrap a field so it spans every column of the FormSection grid. */
export function FormSectionSpan({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <div className={`form-panel-span ${className}`.trim()}>{children}</div>;
}
