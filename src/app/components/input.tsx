"use client";

import React, { useId } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/components.css";

type InputProps = {
  label?: string;
  /** Gray helper line under the field. Replaced by `error` when both are set. */
  hint?: string;
  /** Red message under the field; also turns the border red. */
  error?: string;
  /** Bootstrap Icons name shown inside the field on the left (e.g. "search"). */
  icon?: string;
  /** Short unit text inside the field on the right (e.g. "hrs"). */
  suffix?: string;
  /** Render a textarea instead of an input. */
  multiline?: boolean;
  rows?: number;
  type?: string;
  id?: string;
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function Input({
  label,
  hint,
  error,
  icon,
  suffix,
  multiline = false,
  rows = 3,
  type = "text",
  id,
  name,
  value,
  defaultValue,
  placeholder,
  onChange,
  disabled = false,
  required = false,
  className = "",
  style,
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const message = error || hint;
  const messageId = message ? `${inputId}-message` : undefined;

  const boxClasses = [
    "input-field-box",
    multiline ? "input-field-box-multiline" : "",
    error ? "input-field-box-error" : "",
    disabled ? "input-field-box-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const controlProps = {
    id: inputId,
    name,
    ...(value !== undefined ? { value } : { defaultValue }),
    placeholder,
    onChange,
    disabled,
    required,
    className: "input-field-control",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": messageId,
  };

  return (
    <div className={`input-field ${className}`.trim()} style={style}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="input-field-label">
          {label}
        </label>
      )}

      {/* Field */}
      <div className={boxClasses}>
        {icon && <i className={`bi bi-${icon} input-field-icon`} aria-hidden="true" />}
        {multiline ? (
          <textarea rows={rows} {...controlProps} />
        ) : (
          <input type={type} {...controlProps} />
        )}
        {suffix && <span className="input-field-suffix">{suffix}</span>}
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
