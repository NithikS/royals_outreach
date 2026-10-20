"use client";

import React, { useState } from "react";
import FilterBar from "./filterBar";
import SaveButton from "./saveButton";
import SectionHead from "./sectionHead";
import ClubCard from "./clubCard";
import Badge from "./badge";
import EmptyState from "./emptyState";
import CreateClubDialog from "./CreateClubDialog";
import AssignStaffDialog from "./AssignStaffDialog";
import ConfirmDialog from "./ConfirmDialog";
import "../css/staff.css";
import { plural } from "@/lib/plural";
import { fullName, type PersonName } from "@/lib/personName";

export type DirectoryClub = {
  name: string;
  /** Bootstrap Icons name without the `bi-` prefix. */
  icon: string;
  members: number;
  /** Number of categories; 0 shows "General Hours Only". */
  categories: number;
  staff: PersonName[];
};

type ClubDirectoryProps = {
  clubs?: DirectoryClub[];
  /** Every staff member, offered in the Create Club and Assign Staff dialogs. */
  allStaff?: PersonName[];
  onCreateClub?: (values: { name: string; staff: PersonName | null }) => void;
  onAddStaff?: (club: string, staff: PersonName) => void;
  onRemoveStaff?: (club: string, staff: PersonName) => void;
  /** Admin only: shows a Delete Club button on each card and the confirm dialog. */
  onDeleteClub?: (club: string) => void;
  /** Admin only: shows a Club Executive Panel button first on each card. */
  onOpenPanel?: (club: string) => void;
  /** Builds a link for the panel button when no onOpenPanel is given. */
  panelHref?: (club: string) => string;
  query?: string;
  onQueryChange?: (query: string) => void;
  className?: string;
};

const DEFAULT_CLUBS: DirectoryClub[] = [
  { name: "Key Club", icon: "heart", members: 64, categories: 2, staff: [{ fName: "Tom", lName: "Brooks" }, { fName: "Priya", lName: "Patel" }] },
  { name: "Art Club", icon: "palette", members: 41, categories: 2, staff: [{ fName: "David", lName: "Chen" }] },
  { name: "Robotics Club", icon: "gear", members: 28, categories: 0, staff: [{ fName: "Chidi", lName: "Okafor" }] },
  { name: "National Honor Society", icon: "award", members: 120, categories: 3, staff: [{ fName: "Iroh", lName: "Bennett" }, { fName: "Linh", lName: "Nguyen" }] },
  { name: "Spanish Honor Society", icon: "translate", members: 52, categories: 1, staff: [{ fName: "Linh", lName: "Nguyen" }] },
  { name: "Student Council", icon: "megaphone", members: 86, categories: 2, staff: [{ fName: "Iroh", lName: "Bennett" }] },
  { name: "Chess Club", icon: "puzzle", members: 19, categories: 0, staff: [] },
];

const DEFAULT_STAFF: PersonName[] = [
  { fName: "Iroh", lName: "Bennett" },
  { fName: "Tom", lName: "Brooks" },
  { fName: "David", lName: "Chen" },
  { fName: "Linh", lName: "Nguyen" },
  { fName: "Chidi", lName: "Okafor" },
  { fName: "Priya", lName: "Patel" },
];

export default function ClubDirectory({
  clubs = DEFAULT_CLUBS,
  allStaff = DEFAULT_STAFF,
  onCreateClub,
  onAddStaff,
  onRemoveStaff,
  onDeleteClub,
  onOpenPanel,
  panelHref,
  query,
  onQueryChange,
  className = "",
}: ClubDirectoryProps) {
  const [innerQuery, setInnerQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const q = query ?? innerQuery;
  const shown = clubs.filter((c) => c.name.toLowerCase().includes(q.trim().toLowerCase()));
  const assignClub = clubs.find((c) => c.name === assigning);

  return (
    <div className={`staff-directory ${className}`.trim()}>
      {/* Search and create */}
      <FilterBar
        searchPlaceholder="Search Clubs"
        searchValue={q}
        onSearchChange={(value) => {
          setInnerQuery(value);
          onQueryChange?.(value);
        }}
        actions={
          <SaveButton variant="danger" icon="plus-circle" onClick={() => setCreating(true)}>
            Create Club
          </SaveButton>
        }
      />

      {/* Count */}
      <SectionHead className="staff-directory-count">
        {plural(clubs.length, "Club")}
        {q.trim() ? ` · ${shown.length} Shown` : ""}
      </SectionHead>

      {/* Cards */}
      {shown.length > 0 ? (
        <div className="club-card-grid">
          {shown.map((c) => (
            <ClubCard
              key={c.name}
              name={c.name}
              icon={c.icon}
              meta={`${plural(c.members, "Member")} · ${
                c.categories ? plural(c.categories, "Category", "Categories") : "General Hours Only"
              }`}
              actions={
                <>
                  {(onOpenPanel || panelHref) && (
                    <SaveButton
                      size="sm"
                      icon="box-arrow-up-right"
                      onClick={onOpenPanel ? () => onOpenPanel(c.name) : undefined}
                      href={panelHref?.(c.name)}
                    >
                      Club Executive Panel
                    </SaveButton>
                  )}
                  <SaveButton
                    size="sm"
                    variant="secondary"
                    icon="person-plus"
                    onClick={() => setAssigning(c.name)}
                  >
                    Assign Staff
                  </SaveButton>
                  {onDeleteClub && (
                    <SaveButton size="sm" variant="danger" icon="trash" onClick={() => setDeleting(c.name)}>
                      Delete Club
                    </SaveButton>
                  )}
                </>
              }
            >
              <span className="staff-card-label">Staff</span>
              {c.staff.length > 0 ? (
                <div className="staff-card-staff">{c.staff.map(fullName).join(", ")}</div>
              ) : (
                <div>
                  <Badge tone="denied">No Staff Assigned</Badge>
                </div>
              )}
            </ClubCard>
          ))}
        </div>
      ) : (
        <EmptyState message="No clubs match your search." />
      )}

      {/* Dialogs */}
      {creating && (
        <CreateClubDialog
          staffOptions={allStaff}
          onClose={() => setCreating(false)}
          onCreate={(values) => {
            onCreateClub?.(values);
            setCreating(false);
          }}
        />
      )}
      {assignClub && (
        <AssignStaffDialog
          clubName={assignClub.name}
          assigned={assignClub.staff}
          allStaff={allStaff}
          onAdd={(staff) => onAddStaff?.(assignClub.name, staff)}
          onRemove={(staff) => onRemoveStaff?.(assignClub.name, staff)}
          onClose={() => setAssigning(null)}
        />
      )}
      {deleting && onDeleteClub && (
        <ConfirmDialog
          message={`Delete ${deleting}? Its categories, member groups and opportunities will be removed. Logged hours stay on student records.`}
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            onDeleteClub(deleting);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
