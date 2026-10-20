"use client";

import React from "react";
import Input from "./input";
import Select, { type SelectOption } from "./select";
import "./filterBar.css";

export type FilterBarSelect = {
  /** Key passed back to onSelectChange. */
  name: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  /** Any CSS length. Defaults to 220px; ignored in the stacked layout and under 768px. */
  width?: string;
};

export type FilterBarChip = {
  value: string;
  label: string;
  count?: number;
};

type FilterBarProps = {
  /** Hide the search field to show only selects, chips and actions. */
  showSearch?: boolean;
  searchLabel?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
  selects?: FilterBarSelect[];
  onSelectChange?: (name: string, value: string) => void;
  /** Toggle chips on their own row under the fields. */
  chips?: FilterBarChip[];
  /** Values of the chips shown as selected. */
  activeChips?: string[];
  onChipToggle?: (value: string) => void;
  /** Buttons at the right end of the row (e.g. Create Club). */
  actions?: React.ReactNode;
  /** "row" puts everything on one line; "stacked" puts each field on its own line (narrow side columns). */
  layout?: "row" | "stacked";
  className?: string;
};

export default function FilterBar({
  showSearch = true,
  searchLabel,
  searchPlaceholder = "Search Clubs",
  searchValue,
  defaultSearchValue,
  onSearchChange,
  selects = [],
  onSelectChange,
  chips = [],
  activeChips = [],
  onChipToggle,
  actions,
  layout = "row",
  className = "",
}: FilterBarProps) {
  const stacked = layout === "stacked";

  return (
    <div
      className={`filter-bar ${stacked ? "filter-bar-stacked" : ""} ${className}`.replace(/\s+/g, " ").trim()}
      role="search"
    >
      {/* Fields */}
      <div className="filter-bar-fields">
        {showSearch && (
          <Input
            className="filter-bar-search"
            label={searchLabel}
            placeholder={searchPlaceholder}
            icon="search"
            value={searchValue}
            defaultValue={defaultSearchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        )}

        {selects.map((select) => (
          <Select
            key={select.name}
            className="filter-bar-select"
            name={select.name}
            label={select.label}
            options={select.options}
            placeholder={select.placeholder}
            value={select.value}
            defaultValue={select.defaultValue}
            onChange={(e) => onSelectChange?.(select.name, e.target.value)}
            style={select.width ? ({ "--filter-bar-select-width": select.width } as React.CSSProperties) : undefined}
          />
        ))}

        {actions && <div className="filter-bar-actions">{actions}</div>}
      </div>

      {/* Chips */}
      {chips.length > 0 && (
        <div className="filter-bar-chips">
          {chips.map((chip) => {
            const active = activeChips.includes(chip.value);

            return (
              <button
                key={chip.value}
                type="button"
                className={`filter-bar-chip ${active ? "filter-bar-chip-active" : ""}`.trim()}
                aria-pressed={active}
                onClick={() => onChipToggle?.(chip.value)}
              >
                {chip.label}
                {chip.count != null && <span className="filter-bar-chip-count">{chip.count}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
