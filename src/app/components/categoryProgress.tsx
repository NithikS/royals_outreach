import React from "react";
import ProgressRing from "./progressRing";
import ProgressBar from "./progressBar";
import SectionHead from "./sectionHead";
import Badge from "./badge";
import "./categoryProgress.css";
import { formatHours } from "@/lib/formatHours";

export type CategoryGoal = {
  name: string;
  value: number;
  goal: number;
  /** Gray line under the bar, "4 students · 75% of goal". */
  line?: React.ReactNode;
};

type CategoryProgressVariant = "default" | "total" | "detail";

type CategoryProgressProps = {
  /** Club name shown as a large section head. Omit to hide it. */
  name?: string;
  /** Approved hours toward the goal (ring and General Hours bar). */
  earned?: number;
  goal?: number;
  /** Pending hours, shown under the ring as "2 hrs pending". Ignored when `ringNote` is set. */
  pending?: number;
  /** Category goals. Empty means the club has no categories (general hours only, e.g. Robotics Club). */
  categories?: CategoryGoal[];
  /** Gray line above the bars ("3 hrs approved · 2 hrs pending"). */
  line?: React.ReactNode;
  /**
   * default: ring left, bars right.
   * total: ring boxed in a blue frame with a caption, bars right (club totals).
   * detail: framed card, ring beside the heading, bars below (one student).
   */
  variant?: CategoryProgressVariant;
  showRing?: boolean;
  ringSize?: number;
  /** Ring center text. Defaults to the earned hours. */
  ringLabel?: React.ReactNode;
  /** Ring line under the label. Defaults to "of {goal} hrs". */
  ringSublabel?: React.ReactNode;
  /** Small uppercase caption above the ring, "Club Total". */
  ringCaption?: React.ReactNode;
  /** Line under the ring, "1 of 8 Met Goal". Replaces the pending line. */
  ringNote?: React.ReactNode;
  /** Name beside the ring (detail variant), "Katara Lopez". */
  heading?: React.ReactNode;
  /** Gray line under the heading, "Seniors · Class Of 2027". */
  meta?: React.ReactNode;
  /** Shown under the heading, e.g. a Met Goal badge. */
  badge?: React.ReactNode;
  generalLabel?: string;
  noCategoriesLabel?: string;
  noCategoriesNote?: string;
  className?: string;
};

const DEFAULT_CATEGORIES: CategoryGoal[] = [
  { name: "Service", value: 3, goal: 10 },
  { name: "Event Help", value: 0, goal: 5 },
];

const VARIANT_CLASSES: Record<CategoryProgressVariant, string> = {
  default: "",
  total: "category-progress-total",
  detail: "category-progress-detail",
};

export default function CategoryProgress({
  name,
  earned = 3,
  goal = 15,
  pending,
  categories = DEFAULT_CATEGORIES,
  line,
  variant = "default",
  showRing = true,
  ringSize = 150,
  ringLabel,
  ringSublabel,
  ringCaption,
  ringNote,
  heading,
  meta,
  badge,
  generalLabel = "General Hours",
  noCategoriesLabel = "No Categories",
  noCategoriesNote = "Any approved hours count toward this goal.",
  className = "",
}: CategoryProgressProps) {
  const general = categories.length === 0;
  const note = ringNote ?? (pending != null ? `${formatHours(pending)} pending` : null);
  const hasText = heading != null || meta != null || badge != null;

  return (
    <section
      className={`category-progress ${VARIANT_CLASSES[variant]} ${className}`.replace(/\s+/g, " ").trim()}
    >
      {/* Header */}
      {name && <SectionHead size="lg">{name}</SectionHead>}

      {/* Body */}
      <div className={`category-progress-body ${showRing ? "" : "category-progress-bars-only"}`.trim()}>
        {showRing && (
          <div className="category-progress-ring">
            {ringCaption && <span className="category-progress-caption">{ringCaption}</span>}
            <ProgressRing
              value={earned}
              goal={goal}
              size={ringSize}
              label={ringLabel}
              sublabel={ringSublabel}
            />
            {note && <span className="category-progress-note">{note}</span>}
            {hasText && (
              <div className="category-progress-text">
                {heading != null && <div className="category-progress-heading">{heading}</div>}
                {meta != null && <div className="category-progress-meta">{meta}</div>}
                {badge != null && <div className="category-progress-badge">{badge}</div>}
              </div>
            )}
          </div>
        )}

        <div className="category-progress-bars">
          {line && <div className="category-progress-line">{line}</div>}
          {general ? (
            <>
              <ProgressBar label={generalLabel} value={earned} goal={goal} />
              <div className="category-progress-general">
                <Badge tone="info">{noCategoriesLabel}</Badge>
                <span className="category-progress-muted">{noCategoriesNote}</span>
              </div>
            </>
          ) : (
            categories.map((c) => (
              <div key={c.name}>
                <ProgressBar label={c.name} value={c.value} goal={c.goal} />
                {c.line && <div className="category-progress-bar-line">{c.line}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
