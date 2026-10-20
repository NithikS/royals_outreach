"use client";

import React, { useState } from "react";
import ModalShell from "./ModalShell";
import SaveButton from "./saveButton";
import IconButton from "./iconButton";
import Input from "./input";
import ListRow from "./listRow";
import EmptyState from "./emptyState";
import "../css/club.css";
import { fullName } from "@/lib/personName";

export type RosterStudent = {
  /** Student ID, shown as "ID 304512" and matched by search. */
  id: string;
  fName: string;
  lName: string;
  /** Extra text after the ID ("Signed up Oct 1"). */
  meta?: string;
};

type StudentRosterModalProps = {
  title?: string;
  students?: RosterStudent[];
  /** Shows a remove button on each row when set. */
  onRemove?: (id: string) => void;
  removeLabel?: string;
  /** Buttons placed before Done (e.g. Export Registered). */
  footerActions?: React.ReactNode;
  onClose?: () => void;
  /** Rows shown at once; search narrows the rest. */
  limit?: number;
  searchPlaceholder?: string;
  emptyText?: string;
  noMatchText?: string;
};

const DEFAULT_STUDENTS: RosterStudent[] = [
  { id: "304512", fName: "Katara", lName: "Lopez" },
  { id: "304518", fName: "Jordan", lName: "Reyes" },
  { id: "304523", fName: "Maya", lName: "Lindgren" },
];

export default function StudentRosterModal({
  title = "Assigned Students · Seniors",
  students = DEFAULT_STUDENTS,
  onRemove,
  removeLabel = "Remove",
  footerActions,
  onClose = () => {},
  limit = 50,
  searchPlaceholder = "Search By Name Or ID",
  emptyText = "No students yet.",
  noMatchText = "No students match.",
}: StudentRosterModalProps) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = students.filter((s) => !q || `${fullName(s)} ${s.id}`.toLowerCase().includes(q));
  const shown = matches.slice(0, limit);

  return (
    <ModalShell
      title={title}
      onClose={onClose}
      width="560px"
      footer={
        <>
          {footerActions}
          <SaveButton onClick={onClose}>Done</SaveButton>
        </>
      }
    >
      <div className="club-roster">
        {/* Search */}
        <Input
          placeholder={searchPlaceholder}
          icon="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="club-muted-line">
          Showing {shown.length} of {students.length}
          {matches.length > limit ? ". Search to narrow the list." : "."}
        </div>

        {/* List */}
        <div className="club-roster-list">
          {shown.map((s) => (
            <ListRow
              key={s.id}
              title={fullName(s)}
              density="compact"
              trailing={
                <>
                  <span className="club-muted-line">
                    ID {s.id}
                    {s.meta ? ` · ${s.meta}` : ""}
                  </span>
                  {onRemove && (
                    <IconButton icon="x-lg" label={removeLabel} size={20} onClick={() => onRemove(s.id)} />
                  )}
                </>
              }
            />
          ))}
          {shown.length === 0 && (
            <EmptyState size="sm" message={students.length === 0 ? emptyText : noMatchText} />
          )}
        </div>
      </div>
    </ModalShell>
  );
}
