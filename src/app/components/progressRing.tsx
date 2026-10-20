import React from "react";
import "../css/components.css";

type ProgressRingProps = {
  value?: number;
  goal?: number;
  /** Diameter in px. The ring shrinks to fit narrower containers. */
  size?: number;
  thickness?: number;
  /** Center text. Defaults to the value. */
  label?: React.ReactNode;
  /** Line under the label. Defaults to "of {goal} hrs"; pass null to hide it. */
  sublabel?: React.ReactNode | null;
  /** Draw the 12-tick clock-dial motif around the ring. */
  ticks?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export default function ProgressRing({
  value = 6,
  goal = 25,
  size = 180,
  thickness = 14,
  label,
  sublabel,
  ticks = true,
  className = "",
  style,
}: ProgressRingProps) {
  const pct = Math.max(0, Math.min(1, goal ? value / goal : 0));
  const center = size / 2;
  const radius = (size - thickness) / 2 - (ticks ? 11 : 0);
  const circumference = 2 * Math.PI * radius;

  const tickLines = ticks
    ? Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI) / 6;
        const major = i % 3 === 0;
        const outer = size / 2 - 1;
        const inner = outer - (major ? 9 : 6);
        // Rounded so server and browser trig agree (avoids a hydration mismatch)
        const at = (n: number) => Math.round(n * 100) / 100;
        return (
          <line
            key={i}
            className="progress-ring-tick"
            x1={at(center + Math.sin(angle) * inner)}
            y1={at(center - Math.cos(angle) * inner)}
            x2={at(center + Math.sin(angle) * outer)}
            y2={at(center - Math.cos(angle) * outer)}
            strokeWidth={major ? 3 : 2}
          />
        );
      })
    : null;

  return (
    <div
      className={`progress-ring ${className}`.trim()}
      style={{ width: size, ...style }}
      role="img"
      aria-label={`${value} of ${goal} hrs`}
    >
      <svg className="progress-ring-svg" viewBox={`0 0 ${size} ${size}`}>
        {tickLines}
        <circle
          className="progress-ring-track"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={thickness}
        />
        <circle
          className="progress-ring-fill"
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>

      <div className="progress-ring-center" aria-hidden="true">
        <span className="progress-ring-label">{label ?? value}</span>
        {sublabel !== null && (
          <span className="progress-ring-sublabel">
            {sublabel ?? `of ${goal} hrs`}
          </span>
        )}
      </div>
    </div>
  );
}
