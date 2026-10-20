import React from "react";
import "../css/components.css";

type CardProps = {
  title?: React.ReactNode;
  /** Control shown at the right end of the title row (or title bar). */
  action?: React.ReactNode;
  /** "plain" is a blue heading inside the card; "bar" is a solid blue title bar inside a 5px blue frame. */
  header?: "plain" | "bar";
  /** Border color for the plain header. Ignored when header is "bar". */
  tone?: "blue" | "red" | "silver";
  /** Body padding override, e.g. "0" for a flush table or list. */
  padding?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Card({
  title,
  action,
  header = "plain",
  tone = "blue",
  padding,
  children,
  className = "",
  style,
}: CardProps) {
  const bar = header === "bar";
  const frameClass = bar ? "card-box-frame-bar" : `card-box-frame-${tone}`;

  return (
    <section
      className={`card-box ${frameClass} ${className}`.trim()}
      style={style}
    >
      {/* Header */}
      {title &&
        (bar ? (
          <header className="card-box-bar">
            <h3 className="card-box-bar-title">{title}</h3>
            {action}
          </header>
        ) : (
          <header className="card-box-header">
            <h3 className="card-box-title">{title}</h3>
            {action}
          </header>
        ))}

      {/* Body */}
      <div
        className={`card-box-body ${bar ? "card-box-body-bar" : ""}`.trim()}
        style={padding !== undefined ? { padding } : undefined}
      >
        {children}
      </div>
    </section>
  );
}
