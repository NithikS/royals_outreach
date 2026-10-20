import React from "react";
import "./detailList.css";

export type DetailItem = {
  label: string;
  value: React.ReactNode;
  /** Span every column (long values such as messages). */
  full?: boolean;
  /** "danger" colors the label red (Deny Message). */
  tone?: "default" | "danger";
};

type DetailListProps = {
  items?: DetailItem[];
  /** Two columns on wide screens (Log Hours review); one column in side panels. */
  columns?: 1 | 2;
  /** "sm" is the 13.5px side panel size. */
  size?: "sm" | "md";
  /** "inline" puts label and value on one divided row; "stacked" puts a small gray label over the value (club request panel). */
  layout?: "inline" | "stacked";
  className?: string;
};

const DEFAULT_ITEMS: DetailItem[] = [
  { label: "Date", value: "Sep 20, 2026" },
  { label: "Club", value: "Robotics Club" },
  { label: "Category", value: "General Hours" },
  { label: "Hours", value: "1 hr" },
  { label: "Organization", value: "Fishers Robotics Camp" },
  { label: "Coordinator", value: "Sam Patel" },
];

export default function DetailList({
  items = DEFAULT_ITEMS,
  columns = 1,
  size = "md",
  layout = "inline",
  className = "",
}: DetailListProps) {
  const classes = [
    "detail-list",
    `detail-list-${columns}`,
    `detail-list-${size}`,
    layout === "stacked" ? "detail-list-stacked" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <dl className={classes}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`detail-list-item ${item.full ? "detail-list-item-full" : ""}`.trim()}
        >
          <dt className={`detail-list-label ${item.tone === "danger" ? "detail-list-label-danger" : ""}`.trim()}>
            {item.label}
          </dt>
          <dd className="detail-list-value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
