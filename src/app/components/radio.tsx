"use client";

import React, { useId } from "react";
import "../css/components.css";

export type RadioOption = string | { value: string; label: string; disabled?: boolean };

type RadioProps = {
  options?: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Shared input name; generated when omitted. */
  name?: string;
  direction?: "column" | "row";
  /** Accessible name for the group. */
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function Radio({
  options = ["Yes", "No"],
  value,
  defaultValue,
  onChange,
  name,
  direction = "column",
  ariaLabel,
  disabled = false,
  className = "",
  style,
}: RadioProps) {
  const autoName = useId();
  const groupName = name ?? autoName;

  const classes = [
    "radio-group",
    direction === "row" ? "radio-group-row" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={classes} style={style}>
      {options.map((option) => {
        const optionValue = typeof option === "string" ? option : option.value;
        const optionLabel = typeof option === "string" ? option : option.label;
        const optionDisabled = disabled || (typeof option !== "string" && !!option.disabled);
        return (
          <label
            key={optionValue}
            className={`radio-field ${optionDisabled ? "radio-field-disabled" : ""}`.trim()}
          >
            <input
              type="radio"
              className="radio-field-input"
              name={groupName}
              value={optionValue}
              checked={value === undefined ? undefined : value === optionValue}
              defaultChecked={value === undefined ? defaultValue === optionValue : undefined}
              onChange={() => onChange?.(optionValue)}
              disabled={optionDisabled}
            />
            <span className="radio-field-dot" aria-hidden="true" />
            <span className="radio-field-label">{optionLabel}</span>
          </label>
        );
      })}
    </div>
  );
}
