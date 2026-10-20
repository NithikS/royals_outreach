"use client";

import { useState } from "react";
import "../css/shell.css";

export type TabOption = {
  value: string;
  label: string;
  count?: number;
};

type TabsProps = {
  /** Plain strings are used as both value and label. */
  tabs?: (TabOption | string)[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  ariaLabel?: string;
  className?: string;
};

const DEFAULT_TABS: TabOption[] = [
  { value: "all", label: "All", count: 5 },
  { value: "pending", label: "Pending", count: 2 },
  { value: "approved", label: "Approved", count: 2 },
  { value: "denied", label: "Denied", count: 1 },
];

export default function Tabs({
  tabs = DEFAULT_TABS,
  value,
  defaultValue,
  onChange,
  ariaLabel = "Filter",
  className = "",
}: TabsProps) {
  const options = tabs.map((t) => (typeof t === "string" ? { value: t, label: t } : t));
  const [inner, setInner] = useState(defaultValue ?? options[0]?.value);
  const current = value ?? inner;

  return (
    <div role="group" aria-label={ariaLabel} className={`tabs ${className}`.trim()}>
      {options.map((tab) => {
        const active = tab.value === current;

        return (
          <button
            key={tab.value}
            type="button"
            aria-pressed={active}
            className={`tabs-item ${active ? "tabs-item-active" : ""}`.trim()}
            onClick={() => {
              setInner(tab.value);
              onChange?.(tab.value);
            }}
          >
            {tab.label}
            {tab.count != null && <span className="tabs-count">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
