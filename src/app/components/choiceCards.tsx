"use client";

import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./choiceCards.css";

export type ChoiceCardOption = {
  value: string;
  title: string;
  description?: React.ReactNode;
  /** Bootstrap Icons name shown before the title. */
  icon?: string;
  /** "danger" outlines the selected card in red (destructive choices). */
  tone?: "primary" | "danger";
};

type ChoiceCardsProps = {
  options?: ChoiceCardOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** "row" puts the cards side by side (they stack under 600px). */
  direction?: "row" | "column";
  ariaLabel?: string;
  className?: string;
};

const DEFAULT_OPTIONS: ChoiceCardOption[] = [
  { value: "categories", icon: "tags", title: "Categories", description: "Each category has its own goal and rules." },
  { value: "general", icon: "clock", title: "General Hours Only", description: "One goal for the club. No categories." },
];

export default function ChoiceCards({
  options = DEFAULT_OPTIONS,
  value,
  onChange,
  direction = "row",
  ariaLabel,
  className = "",
}: ChoiceCardsProps) {
  return (
    <div
      className={`choice-cards choice-cards-${direction} ${className}`.trim()}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const classes = [
          "choice-card",
          selected ? "choice-card-selected" : "",
          option.tone === "danger" ? "choice-card-danger" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={classes}
            onClick={() => onChange?.(option.value)}
          >
            <span className="choice-card-title">
              {option.icon && <i className={`bi bi-${option.icon}`} aria-hidden="true" />}
              {option.title}
            </span>
            {option.description && <span className="choice-card-description">{option.description}</span>}
          </button>
        );
      })}
    </div>
  );
}
