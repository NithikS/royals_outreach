"use client";

import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import Tabs from "./tabs";
import SectionHead from "./sectionHead";
import Checkbox from "./checkbox";
import SaveButton from "./saveButton";
import "./exportOptions.css";

export type ExportIncludeOption = {
  value: string;
  label: string;
  checked: boolean;
};

type ExportOptionsProps = {
  /** File format choices shown as tabs ("CSV", "Excel"). Hidden when empty. */
  formats?: string[];
  format?: string;
  onFormatChange?: (format: string) => void;
  formatLabel?: string;
  /** Checkboxes for what goes in the export. Hidden when empty. */
  includeOptions?: ExportIncludeOption[];
  onIncludeChange?: (value: string, checked: boolean) => void;
  includeTitle?: string;
  /** Show the framed summary bar with the export button. */
  showBar?: boolean;
  /** Bar title ("Full Portfolio"). */
  title?: string;
  /** Bar summary line ("2 clubs · 6 hrs approved"). */
  summary?: React.ReactNode;
  exportLabel?: string;
  exportIcon?: string;
  onExport?: () => void;
  disabled?: boolean;
  /** Shows the confirmation next to the button after an export. */
  done?: boolean;
  doneMessage?: string;
  className?: string;
};

const DEFAULT_INCLUDE: ExportIncludeOption[] = [
  { value: "members", label: "Club Memberships", checked: true },
  { value: "total", label: "Total Hours", checked: true },
  { value: "clubHrs", label: "Club-Specific Hours", checked: true },
  { value: "cats", label: "Category Breakdown", checked: false },
];

export default function ExportOptions({
  formats = [],
  format,
  onFormatChange,
  formatLabel = "File Format",
  includeOptions = DEFAULT_INCLUDE,
  onIncludeChange,
  includeTitle = "Include",
  showBar = true,
  title = "Full Portfolio",
  summary = "2 clubs · 6 hrs approved",
  exportLabel = "Export Portfolio",
  exportIcon = "file-earmark-arrow-down",
  onExport,
  disabled = false,
  done = false,
  doneMessage = "Portfolio exported.",
  className = "",
}: ExportOptionsProps) {
  return (
    <div className={`export-options ${className}`.trim()}>
      {/* File format */}
      {formats.length > 0 && (
        <div className="export-options-format">
          <span className="export-options-format-label">{formatLabel}</span>
          <Tabs
            tabs={formats}
            value={format ?? formats[0]}
            onChange={onFormatChange}
            ariaLabel={formatLabel}
          />
        </div>
      )}

      {/* Include */}
      {includeOptions.length > 0 && (
        <div>
          <SectionHead>{includeTitle}</SectionHead>
          <div className="export-options-include">
            {includeOptions.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={option.checked}
                onChange={(checked) => onIncludeChange?.(option.value, checked)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Export bar */}
      {showBar && (
        <div className="export-options-bar">
          <div className="export-options-bar-text">
            <div className="export-options-bar-title">{title}</div>
            {summary && <div className="export-options-bar-summary">{summary}</div>}
          </div>

          <div className="export-options-bar-actions">
            {done && (
              <span className="export-options-done" role="status">
                <i className="bi bi-check-circle-fill export-options-done-icon" aria-hidden="true" />
                {doneMessage}
              </span>
            )}
            <SaveButton icon={exportIcon} onClick={onExport} disabled={disabled}>
              {exportLabel}
            </SaveButton>
          </div>
        </div>
      )}
    </div>
  );
}
