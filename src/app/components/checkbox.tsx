"use client";

import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";

type CheckboxProps = {
  label?: string;
  /** Smaller line of body text under the label. */
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  value?: string;
  /** Accessible name when no visible label is shown. */
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function Checkbox({
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  name,
  value,
  ariaLabel,
  disabled = false,
  className = "",
  style,
}: CheckboxProps) {
  const classes = [
    "checkbox-field",
    disabled ? "checkbox-field-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes} style={style}>
      <input
        type="checkbox"
        className="checkbox-field-input"
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        onChange={(e) => onChange?.(e.target.checked)}
        name={name}
        value={value}
        aria-label={label ? undefined : ariaLabel}
        disabled={disabled}
      />
      <span className="checkbox-field-box" aria-hidden="true">
        <i className="bi bi-check-lg checkbox-field-check" />
      </span>
      {(label || description) && (
        <span className="checkbox-field-text">
          {label && <span className="checkbox-field-label">{label}</span>}
          {description && <span className="checkbox-field-description">{description}</span>}
        </span>
      )}
    </label>
  );
}
