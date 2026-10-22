"use client";

import { useMemo, useState } from "react";
import ClubSectionHeader from "@/app/components/clubSectionHeader";
import SectionHead from "@/app/components/sectionHead";
import FilterBar from "@/app/components/filterBar";
import InfoTable, { type InfoTableColumn } from "@/app/components/infoTable";
import Checkbox from "@/app/components/checkbox";
import IconButton from "@/app/components/iconButton";
import Badge from "@/app/components/badge";
import SaveButton from "@/app/components/saveButton";
import EmptyState from "@/app/components/emptyState";
import AddStudentsDialog from "./addStudentsDialog";
import {
  AssignGroupDialog,
  ExportMembersDialog,
  RemoveMembersDialog,
} from "./memberDialogs";
import "@/app/css/club.css";
import { useToast } from "@/app/context/ToastContext";
import { downloadSheet } from "@/lib/excel";
import { fullName } from "@/lib/personName";
import { plural } from "@/lib/plural";

import {
  addStudentsToClub,
  assignMembersToGroup,
  getClubMembers,
  removeMembersAndHistory,
  setMembersActive,
  type ClubGroup,
  type ClubMember,
  type ConflictChoices,
  type NewStudent,
} from "@/actions/members";

type ManageMembersUIProps = {
  clubId: number;
  clubName: string;
  initialMembers: ClubMember[];
  groups: ClubGroup[];
};

type MemberRow = ClubMember & { id: number };
type SortKey = "lName" | "fName" | "gradClass" | "group" | "status";
type Filters = { gradClass: string; group: string; status: string };

const ALL = "all";
const NO_GROUP = "none";

const DEFAULT_FILTERS: Filters = { gradClass: ALL, group: ALL, status: ALL };
const DEFAULT_SORT: SortKey = "lName";

const SORT_OPTIONS = [
  { value: "lName", label: "Last Name" },
  { value: "fName", label: "First Name" },
  { value: "gradClass", label: "Grad Class" },
  { value: "group", label: "Member Group" },
  { value: "status", label: "Membership Status" },
];

const byText = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "base" });
const byName = (a: ClubMember, b: ClubMember) =>
  byText(a.lName, b.lName) || byText(a.fName, b.fName);

// Ties fall back to last name, then first name
const COMPARE: Record<SortKey, (a: ClubMember, b: ClubMember) => number> = {
  lName: byName,
  fName: (a, b) => byText(a.fName, b.fName) || byText(a.lName, b.lName),
  gradClass: (a, b) =>
    (a.gradClass ?? 9999) - (b.gradClass ?? 9999) || byName(a, b),
  // Students without a group go last
  group: (a, b) =>
    Number(a.groupName === null) - Number(b.groupName === null) ||
    byText(a.groupName ?? "", b.groupName ?? "") ||
    byName(a, b),
  status: (a, b) => Number(b.isActive) - Number(a.isActive) || byName(a, b),
};

// Columns that can be copied to the clipboard and exported
const DATA_COLUMNS: {
  key: string;
  label: string;
  value: (m: ClubMember) => string | number;
}[] = [
  { key: "studentId", label: "Student ID", value: (m) => m.studentId },
  { key: "fName", label: "First Name", value: (m) => m.fName },
  { key: "lName", label: "Last Name", value: (m) => m.lName },
  { key: "email", label: "Email", value: (m) => m.email },
  { key: "gradClass", label: "Grad Class", value: (m) => m.gradClass ?? "" },
  { key: "group", label: "Member Group", value: (m) => m.groupName ?? "" },
  {
    key: "status",
    label: "Status",
    value: (m) => (m.isActive ? "Active" : "Inactive"),
  },
];

export default function ManageMembersUI({
  clubId,
  clubName,
  initialMembers,
  groups,
}: ManageMembersUIProps) {
  const { showToast } = useToast();

  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<SortKey>(DEFAULT_SORT);

  const filtersActive =
    search.trim() !== "" ||
    sortBy !== DEFAULT_SORT ||
    (Object.keys(filters) as (keyof Filters)[]).some((key) => filters[key] !== ALL);

  const clearFilters = () => {
    setSearch("");
    setFilters(DEFAULT_FILTERS);
    setSortBy(DEFAULT_SORT);
  };
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dialog, setDialog] = useState<
    "add" | "remove" | "group" | "export" | null
  >(null);

  const groupsHref = `/club/${clubId}/groups`;

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members
      .filter((m) => {
        if (
          query &&
          ![fullName(m), m.email, String(m.studentId)].some((v) =>
            v.toLowerCase().includes(query),
          )
        ) {
          return false;
        }
        if (
          filters.gradClass !== ALL &&
          String(m.gradClass) !== filters.gradClass
        )
          return false;
        if (filters.group === NO_GROUP && m.groupId !== null) return false;
        if (
          filters.group !== ALL &&
          filters.group !== NO_GROUP &&
          String(m.groupId) !== filters.group
        )
          return false;
        if (
          filters.status !== ALL &&
          (filters.status === "active") !== m.isActive
        )
          return false;
        return true;
      })
      .sort(COMPARE[sortBy]);
  }, [members, search, filters, sortBy]);

  const gradClasses = useMemo(
    () =>
      [
        ...new Set(members.map((m) => m.gradClass).filter((c) => c !== null)),
      ].sort((a, b) => a - b),
    [members],
  );

  // Actions only apply to selected students the filters still show
  const selectedShown = visible.filter((m) => selected.has(m.studentId));
  const selectedIds = selectedShown.map((m) => m.studentId);
  const allShownSelected =
    visible.length > 0 && selectedShown.length === visible.length;

  const toggle = (ids: number[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const reload = async () => setMembers(await getClubMembers(clubId));

  // Runs a change to the selected students, then refreshes the list
  const runOnSelected = async (
    action: () => Promise<unknown>,
    message: string,
  ) => {
    try {
      const result = await action();
      if ((result as { success?: boolean } | undefined)?.success === false)
        throw new Error("Action failed");
      await reload();
      setSelected(new Set());
      setDialog(null);
      showToast(message, "success");
    } catch {
      showToast("Something went wrong. Please try again.", "danger");
    }
  };

  const handleAdd = async (
    students: NewStudent[],
    choices?: ConflictChoices,
  ) => {
    const result = await addStudentsToClub(clubId, students, choices);
    const parts = [
      result.added > 0 ? `added ${plural(result.added, "student")}` : "",
      result.reactivated > 0 ? `reactivated ${result.reactivated}` : "",
      result.alreadyMembers > 0
        ? `${result.alreadyMembers} already in the club`
        : "",
    ].filter(Boolean);

    if (parts.length > 0) {
      await reload();
      const summary = parts.join(", ");
      showToast(
        `${summary.charAt(0).toUpperCase()}${summary.slice(1)}.`,
        "success",
      );
    }
    return result;
  };

  const copyColumn = async (column: (typeof DATA_COLUMNS)[number]) => {
    try {
      await navigator.clipboard.writeText(
        visible.map((m) => String(column.value(m))).join("\n"),
      );
      showToast(
        `Copied ${column.label} for ${plural(visible.length, "student")}.`,
        "success",
      );
    } catch {
      showToast("Could not copy to the clipboard.", "danger");
    }
  };

  const exportMembers = async (scope: "shown" | "all") => {
    const rows = (scope === "shown" ? visible : [...members].sort(byName)).map(
      (m) => ({
        ...Object.fromEntries(DATA_COLUMNS.map((c) => [c.label, c.value(m)])),
        Exec: m.isExec ? "Yes" : "No",
      }),
    );
    await downloadSheet(rows, `${clubName || "Club"} Members.xlsx`, [
      ...DATA_COLUMNS.map((c) => c.label),
      "Exec",
    ]);
    setDialog(null);
  };

  const columnHead = (column: (typeof DATA_COLUMNS)[number]) => (
    <span className="members-col-head">
      {column.label}
      <IconButton
        icon="clipboard2"
        label={`Copy ${column.label} Column`}
        size={24}
        className="members-copy-button"
        disabled={visible.length === 0}
        onClick={() => copyColumn(column)}
      />
    </span>
  );

  const columns: InfoTableColumn<MemberRow>[] = [
    {
      key: "select",
      label: "",
      width: "52px",
      header: (
        <Checkbox
          ariaLabel="Select all shown students"
          checked={allShownSelected}
          onChange={(on) =>
            toggle(
              visible.map((m) => m.studentId),
              on,
            )
          }
        />
      ),
      render: (m) => (
        <Checkbox
          ariaLabel={`Select ${fullName(m)}`}
          checked={selected.has(m.studentId)}
          onChange={(on) => toggle([m.studentId], on)}
        />
      ),
    },
    ...DATA_COLUMNS.map((column) => ({
      key: column.key,
      label: column.label,
      header: columnHead(column),
      render: (m: MemberRow) => {
        if (column.key === "group") {
          return (
            m.groupName ?? <span className="club-muted-line">No Group</span>
          );
        }
        if (column.key === "status") {
          return (
            <span className="members-status">
              <Badge tone={m.isActive ? "approved" : "info"}>
                {m.isActive ? "Active" : "Inactive"}
              </Badge>
              {m.isExec && <Badge tone="pending">Exec</Badge>}
            </span>
          );
        }
        return column.value(m);
      },
    })),
  ];

  const addButton = (
    <SaveButton size="sm" icon="person-plus" onClick={() => setDialog("add")}>
      Add Students
    </SaveButton>
  );

  return (
    <div className="members-page">
      {/* Header */}
      <ClubSectionHeader
        title="Manage Members"
        subtitle="Add, remove and group the students in this club."
        clubName={clubName}
        actions={
          <div className="club-config-header-actions">
            <SaveButton
              size="sm"
              variant="secondary"
              icon="people"
              href={groupsHref}
            >
              Manage Student Groups
            </SaveButton>
            {addButton}
          </div>
        }
      />

      {/* Members */}
      <section className="members-section">
        <SectionHead
          action={
            <span className="club-muted-line">
              {plural(members.length, "Member")}
            </span>
          }
        >
          Members
        </SectionHead>

        {members.length === 0 ? (
          <EmptyState
            icon="people"
            title="No Members Yet"
            message="Add students one at a time or upload an Excel file."
            action={addButton}
          />
        ) : (
          <>
            <FilterBar
              className="members-filter-bar"
              searchLabel="Search"
              searchPlaceholder="Name, email or student ID"
              searchValue={search}
              onSearchChange={setSearch}
              selects={[
                {
                  name: "sort",
                  label: "Sort By",
                  value: sortBy,
                  options: SORT_OPTIONS,
                },
                {
                  name: "gradClass",
                  label: "Grad Class",
                  value: filters.gradClass,
                  options: [
                    { value: ALL, label: "All Classes" },
                    ...gradClasses.map((c) => String(c)),
                  ],
                },
                {
                  name: "group",
                  label: "Member Group",
                  value: filters.group,
                  options: [
                    { value: ALL, label: "All Groups" },
                    ...groups.map((g) => ({
                      value: String(g.groupId),
                      label: g.groupName,
                    })),
                    { value: NO_GROUP, label: "No Group" },
                  ],
                },
                {
                  name: "status",
                  label: "Status",
                  value: filters.status,
                  options: [
                    { value: ALL, label: "All Statuses" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ],
                },
              ]}
              onSelectChange={(name, value) => {
                if (name === "sort") setSortBy(value as SortKey);
                else setFilters((prev) => ({ ...prev, [name]: value }));
              }}
              actions={
                <>
                  <SaveButton
                    variant="ghost"
                    icon="x-circle"
                    disabled={!filtersActive}
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </SaveButton>
                  <SaveButton
                    variant="secondary"
                    icon="download"
                    onClick={() => setDialog("export")}
                  >
                    Export
                  </SaveButton>
                </>
              }
            />

            {/* Bulk actions */}
            {selectedShown.length > 0 && (
              <div className="members-selection-bar">
                <span className="members-selection-count">
                  {plural(selectedShown.length, "Student")} Selected
                </span>
                <div className="members-selection-actions">
                  <SaveButton
                    size="sm"
                    variant="secondary"
                    icon="people"
                    onClick={() => setDialog("group")}
                  >
                    Assign To Group
                  </SaveButton>
                  {selectedShown.some((m) => !m.isActive) && (
                    <SaveButton
                      size="sm"
                      variant="secondary"
                      icon="arrow-counterclockwise"
                      onClick={() =>
                        runOnSelected(
                          () => setMembersActive(clubId, selectedIds, true),
                          `Reactivated ${plural(selectedIds.length, "student")}.`,
                        )
                      }
                    >
                      Reactivate
                    </SaveButton>
                  )}
                  <SaveButton
                    size="sm"
                    variant="danger"
                    icon="person-dash"
                    onClick={() => setDialog("remove")}
                  >
                    Remove
                  </SaveButton>
                  <SaveButton
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelected(new Set())}
                  >
                    Clear
                  </SaveButton>
                </div>
              </div>
            )}

            <InfoTable
              columns={columns}
              rows={visible.map((m) => ({ ...m, id: m.studentId }))}
              empty="No members match these filters."
            />
          </>
        )}
      </section>

      {/* Dialogs */}
      {dialog === "add" && (
        <AddStudentsDialog onAdd={handleAdd} onClose={() => setDialog(null)} />
      )}
      {dialog === "remove" && (
        <RemoveMembersDialog
          count={selectedIds.length}
          onClose={() => setDialog(null)}
          onDeactivate={() =>
            runOnSelected(
              () => setMembersActive(clubId, selectedIds, false),
              `Deactivated ${plural(selectedIds.length, "student")}.`,
            )
          }
          onDelete={() =>
            runOnSelected(
              () => removeMembersAndHistory(clubId, selectedIds),
              `Removed ${plural(selectedIds.length, "student")} and their club history.`,
            )
          }
        />
      )}
      {dialog === "group" && (
        <AssignGroupDialog
          count={selectedIds.length}
          groups={groups}
          groupsHref={groupsHref}
          onClose={() => setDialog(null)}
          onAssign={(groupId) =>
            runOnSelected(
              () => assignMembersToGroup(clubId, selectedIds, groupId),
              groupId === null
                ? `Removed ${plural(selectedIds.length, "student")} from their group.`
                : `Assigned ${plural(selectedIds.length, "student")} to ${groups.find((g) => g.groupId === groupId)?.groupName}.`,
            )
          }
        />
      )}
      {dialog === "export" && (
        <ExportMembersDialog
          shownCount={visible.length}
          totalCount={members.length}
          onExport={exportMembers}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
