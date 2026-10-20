"use client";

import React, { useId } from "react";
import "../css/components.css";

type TooltipProps = {
  content?: React.ReactNode;
  children?: React.ReactNode;
  placement?: "top" | "bottom";
  className?: string;
};

// Shows on hover and on keyboard focus of the trigger (CSS only, no state)
export default function Tooltip({
  content = "Tooltip",
  children = "Hover Me",
  placement = "top",
  className = "",
}: TooltipProps) {
  const bubbleId = useId();

  return (
    <span className={`tooltip-anchor ${className}`.trim()} tabIndex={0} aria-describedby={bubbleId}>
      {children}
      <span id={bubbleId} role="tooltip" className={`tooltip-bubble tooltip-bubble-${placement}`}>
        {content}
      </span>
    </span>
  );
}
