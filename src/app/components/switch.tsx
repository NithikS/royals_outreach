"use client";

import React from "react";
import "../css/components.css";

type SwitchProps = {
  label?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  name?: string;
  /** Accessible name when no visible label is shown. */
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function Switch({
  label,
  checked,
  defaultChecked,
  onChange,
  name,
  ariaLabel,
  disabled = false,
  className = "",
  style,
}: SwitchProps) {
  const classes = [
    "switch-field",
    disabled ? "switch-field-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes} style={style}>
      <input
        type="checkbox"
        role="switch"
        className="switch-field-input"
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        onChange={(e) => onChange?.(e.target.checked)}
        name={name}
        aria-label={label ? undefined : ariaLabel}
        disabled={disabled}
      />
      <span className="switch-field-track" aria-hidden="true">
        <span className="switch-field-thumb" />
      </span>
      {label && <span className="switch-field-label">{label}</span>}
    </label>
  );
}
