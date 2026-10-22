"use client";

import React from "react";
import "./infoTable.css";

export type InfoTableRow = {
  id?: string | number;
  [key: string]: unknown;
};

export type InfoTableColumn<T extends InfoTableRow> = {
  key: string;
  /** Header text. Also the mobile card label; leave empty for an action column. */
  label: string;
  /** Custom header content (a select-all checkbox, a copy button). Defaults to `label`. */
  header?: React.ReactNode;
  /** Fixed column width, e.g. "120px" or "20%". */
  width?: string;
  align?: "left" | "center" | "right";
  /** Custom cell content. Defaults to row[key]. */
  render?: (row: T) => React.ReactNode;
};

type InfoTableProps<T extends InfoTableRow> = {
  columns?: InfoTableColumn<T>[];
  rows?: T[];
  /** Makes every row clickable with a blue hover tint. */
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function InfoTable<T extends InfoTableRow>({
  columns = [],
  rows = [],
  onRowClick,
  empty = "Nothing here yet.",
  className = "",
  style,
}: InfoTableProps<T>) {
  const cell = (column: InfoTableColumn<T>, row: T): React.ReactNode =>
    column.render
      ? column.render(row)
      : (row[column.key] as React.ReactNode);

  if (rows.length === 0) {
    return (
      <div className={`info-table-empty ${className}`.trim()} style={style}>
        {empty}
      </div>
    );
  }

  return (
    <div className={`info-table-wrap ${className}`.trim()} style={style}>
      <table
        className={`info-table ${onRowClick ? "info-table-clickable" : ""}`.trim()}
      >
        {/* Header */}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header ?? column.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id ?? rowIndex}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      // Ignore keys from controls rendered inside a cell
                      if (e.target !== e.currentTarget) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  data-label={column.label}
                  className={
                    `${column.align && column.align !== "center" ? `info-table-${column.align}` : ""} ${
                      column.label ? "" : "info-table-unlabeled"
                    }`.trim() || undefined
                  }
                >
                  <span className="info-table-value">{cell(column, row)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
