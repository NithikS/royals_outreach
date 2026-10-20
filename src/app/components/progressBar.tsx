import React from "react";
import "../css/components.css";

type ProgressBarProps = {
  value?: number;
  goal?: number;
  label?: React.ReactNode;
  /** Show "value / goal unit" at the right of the label row. */
  showValue?: boolean;
  unit?: string;
  /** Track height in px. */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
};

export default function ProgressBar({
  value = 18,
  goal = 25,
  label = "General Hours",
  showValue = true,
  unit = "hrs",
  height = 16,
  className = "",
  style,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, goal ? (value / goal) * 100 : 0));

  return (
    <div className={`progress-bar-box ${className}`.trim()} style={style}>
      {(label || showValue) && (
        <div className="progress-bar-head">
          <span className="progress-bar-label">{label}</span>
          {showValue && (
            <span className="progress-bar-value">
              {value} / {goal} {unit}
            </span>
          )}
        </div>
      )}

      <div
        className="progress-bar-track"
        style={{ height }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={value}
        aria-label={typeof label === "string" ? label : undefined}
      >
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
