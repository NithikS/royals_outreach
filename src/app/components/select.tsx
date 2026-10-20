"use client";

import React, { useId } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";

export type SelectOption = string | { value: string; label: string };

type SelectProps = {
  label?: string;
  /** Gray helper line under the field. Replaced by `error` when both are set. */
  hint?: string;
  /** Red message under the field; also turns the border red. */
  error?: string;
  options?: SelectOption[];
  /** Disabled first option shown until a value is picked. */
  placeholder?: string;
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function Select({
  label,
  hint,
  error,
  options = [],
  placeholder,
  id,
  name,
  value,
  defaultValue,
  onChange,
  disabled = false,
  required = false,
  className = "",
  style,
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const message = error || hint;
  const messageId = message ? `${selectId}-message` : undefined;

  // Controlled when `value` is given; otherwise start on the placeholder.
  const valueProps =
    value !== undefined
      ? { value }
      : { defaultValue: defaultValue ?? (placeholder ? "" : undefined) };

  return (
    <div className={`input-field ${className}`.trim()} style={style}>
      {/* Label */}
      {label && (
        <label htmlFor={selectId} className="input-field-label">
          {label}
        </label>
      )}

      {/* Field */}
      <div className="select-field-wrap">
        <select
          id={selectId}
          name={name}
          className={`select-field-control ${error ? "select-field-error" : ""}`.trim()}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          {...valueProps}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            const optionValue = typeof option === "string" ? option : option.value;
            const optionLabel = typeof option === "string" ? option : option.label;
            return (
              <option key={optionValue} value={optionValue}>
                {optionLabel}
              </option>
            );
          })}
        </select>
        <i className="bi bi-chevron-down select-field-chevron" aria-hidden="true" />
      </div>

      {/* Hint or error */}
      {message && (
        <span id={messageId} className={`input-field-hint ${error ? "input-field-error" : ""}`.trim()}>
          {message}
        </span>
      )}
    </div>
  );
}
