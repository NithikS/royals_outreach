"use client";

import { useMemo, useRef, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import ClubSectionHeader from "@/app/components/clubSectionHeader";
import SectionHead from "@/app/components/sectionHead";
import Input from "@/app/components/input";
import IconButton from "@/app/components/iconButton";
import SaveButton from "@/app/components/saveButton";
import ClubSaveBar from "@/app/components/clubSaveBar";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import StudentRosterModal from "@/app/components/StudentRosterModal";
import EmptyState from "@/app/components/emptyState";
import "@/app/css/club.css";
import { useToast } from "@/app/context/ToastContext";
import { formatHours } from "@/lib/formatHours";
import { fullName } from "@/lib/personName";
import { plural } from "@/lib/plural";

import { saveMemberGroups, type MemberGroup } from "@/actions/groups";
import type { ClubCategory } from "@/actions/categories";
import type { ClubMember } from "@/actions/members";

type MemberGroupsUIProps = {
  clubId: number;
  clubName: string;
  initialGroups: MemberGroup[];
  categories: ClubCategory[];
  members: ClubMember[];
};

const SEARCH_LIMIT = 5;

export default function MemberGroupsUI({ clubId, clubName, initialGroups, categories, members }: MemberGroupsUIProps) {
  const { showToast } = useToast();
  // Unsaved groups get negative ids until the server assigns real ones
  const nextTempId = useRef(-1);

  const [groups, setGroups] = useState(initialGroups);
  const [saved, setSaved] = useState(initialGroups);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(initialGroups[0]?.groupId ?? null);
  const [query, setQuery] = useState("");
  const [paste, setPaste] = useState("");
  const [pasteMessage, setPasteMessage] = useState("");
  // Pasted students who are already in another group, waiting on a move decision
  const [pasteConflicts, setPasteConflicts] = useState<number[]>([]);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MemberGroup | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dirty = JSON.stringify(groups) !== JSON.stringify(saved);
  const current = groups.find((g) => g.groupId === selectedId) ?? groups[0];

  const memberById = useMemo(() => new Map(members.map((m) => [m.studentId, m])), [members]);
  // Each student is in at most one group, so this is where they are right now (unsaved included)
  const groupOfStudent = useMemo(
    () => new Map(groups.flatMap((g) => g.studentIds.map((id) => [id, g] as const))),
    [groups],
  );

  const updateCurrent = (change: (g: MemberGroup) => MemberGroup) => {
    if (!current) return;
    setGroups((prev) => prev.map((g) => (g.groupId === current.groupId ? change(g) : g)));
    setError("");
  };

  const selectGroup = (groupId: number) => {
    setSelectedId(groupId);
    setQuery("");
    setPaste("");
    setPasteMessage("");
    setPasteConflicts([]);
  };

  const addGroup = () => {
    const groupId = nextTempId.current--;
    setGroups((prev) => [...prev, { groupId, groupName: "New Group", categoryIds: [], studentIds: [] }]);
    selectGroup(groupId);
  };

  const deleteGroup = (group: MemberGroup) => {
    setGroups((prev) => prev.filter((g) => g.groupId !== group.groupId));
    if (group.groupId > 0) setDeletedIds((prev) => [...prev, group.groupId]);
    setPendingDelete(null);
  };

  const toggleCategory = (categoryId: number) =>
    updateCurrent((g) => ({
      ...g,
      categoryIds: g.categoryIds.includes(categoryId)
        ? g.categoryIds.filter((id) => id !== categoryId)
        : [...g.categoryIds, categoryId],
    }));

  const addStudents = (ids: number[]) => updateCurrent((g) => ({ ...g, studentIds: [...g.studentIds, ...ids] }));

  // Takes students out of their current groups and puts them in the open one
  const moveStudents = (studentIds: number[]) => {
    if (!current) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.groupId === current.groupId
          ? { ...g, studentIds: [...g.studentIds, ...studentIds.filter((id) => !g.studentIds.includes(id))] }
          : { ...g, studentIds: g.studentIds.filter((id) => !studentIds.includes(id)) },
      ),
    );
    setPasteConflicts((prev) => prev.filter((id) => !studentIds.includes(id)));
    setError("");
  };

  // Sum of the goals of the categories this group earns hours in
  const groupGoal = current
    ? categories.filter((c) => current.categoryIds.includes(c.categoryId)).reduce((sum, c) => sum + c.goal, 0)
    : 0;

  // Search the club's members by name, ID or email
  const q = query.trim().toLowerCase();
  const results = q
    ? members
        .filter((m) => `${fullName(m)} ${m.studentId} ${m.email}`.toLowerCase().includes(q))
        .slice(0, SEARCH_LIMIT)
    : [];

  const handleAddPasted = () => {
    if (!current) return;
    const tokens = paste.split(/[\s,;]+/).filter(Boolean);
    const added: number[] = [];
    const conflicts: number[] = [];
    const notMembers: string[] = [];
    let alreadyHere = 0;

    tokens.forEach((token) => {
      const member = members.find((m) => String(m.studentId) === token || m.email.toLowerCase() === token.toLowerCase());
      if (!member) {
        notMembers.push(token);
        return;
      }
      const id = member.studentId;
      if (added.includes(id) || conflicts.includes(id)) return;
      const inGroup = groupOfStudent.get(id);
      if (!inGroup) added.push(id);
      else if (inGroup.groupId === current.groupId) alreadyHere++;
      else conflicts.push(id);
    });

    addStudents(added);
    setPasteConflicts(conflicts);
    // Leave anything that is not a club member in the box so it can be fixed
    setPaste(notMembers.join("\n"));
    setPasteMessage(
      [
        `Added ${plural(added.length, "student")}.`,
        alreadyHere > 0 ? `${alreadyHere} already in this group.` : "",
        notMembers.length > 0 ? `Not in this club: ${notMembers.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    );
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    if (groups.some((g) => !g.groupName.trim())) {
      setError("Every group needs a name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await saveMemberGroups(clubId, groups, deletedIds);
      if (!result.success) {
        setError(result.error);
        return;
      }
      // Keep the same group open, matching a newly saved group by name
      const selectedName = current?.groupName.trim().toLowerCase();
      const reselected = result.groups.find((g) => g.groupName.toLowerCase() === selectedName);
      setGroups(result.groups);
      setSaved(result.groups);
      setDeletedIds([]);
      setSelectedId(reselected?.groupId ?? result.groups[0]?.groupId ?? null);
      setError("");
      showToast("Member groups saved.", "success");
    } catch {
      showToast("Could not save member groups.", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setGroups(saved);
    setDeletedIds([]);
    setError("");
    if (!saved.some((g) => g.groupId === selectedId)) setSelectedId(saved[0]?.groupId ?? null);
  };

  return (
    <div className="club-groups">
      {/* Header */}
      <ClubSectionHeader
        title="Member Groups"
        subtitle="Group members and choose which categories each group earns hours in."
        clubName={clubName}
        actions={
          <SaveButton size="sm" variant="secondary" icon="plus-circle" onClick={addGroup}>
            Add Group
          </SaveButton>
        }
      />

      {/* Note */}
      <div className="club-note">
        <i className="bi bi-info-circle" aria-hidden="true" />
        <p>
          Member groups are for clubs where different students have different requirements. If everyone in the club
          has the same requirements, put everyone in one member group.
        </p>
      </div>

      <div className="club-groups-layout">
        {/* Group list */}
        <div className="club-groups-list" role="tablist" aria-label="Member groups">
          {groups.length === 0 ? (
            <EmptyState size="sm" message="No groups yet. Add one to assign students and categories." />
          ) : (
            groups.map((g) => (
              <button
                key={g.groupId}
                type="button"
                role="tab"
                aria-selected={g.groupId === current?.groupId}
                className={`club-groups-list-item ${g.groupId === current?.groupId ? "club-groups-list-item-active" : ""}`.trim()}
                onClick={() => selectGroup(g.groupId)}
              >
                <span className="club-groups-list-name">{g.groupName || "Untitled Group"}</span>
                <span className="club-muted-line">
                  {plural(g.studentIds.length, "Student")} · {plural(g.categoryIds.length, "Category", "Categories")}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Group editor */}
        {current && (
          <div className="club-groups-editor">
            <div className="club-groups-name-row">
              <Input
                label="Group Name"
                value={current.groupName}
                error={error && !current.groupName.trim() ? "Name is required." : undefined}
                onChange={(e) => updateCurrent((g) => ({ ...g, groupName: e.target.value }))}
                className="club-groups-name"
              />
              <IconButton icon="trash" label="Delete Group" onClick={() => setPendingDelete(current)} />
            </div>

            {/* Categories */}
            <div className="club-groups-block">
              <span className="club-groups-label">Categories</span>
              {categories.length === 0 ? (
                <div className="club-groups-inline-note">
                  <span className="club-muted-line">This club has no categories yet.</span>
                  <SaveButton size="sm" variant="secondary" icon="tags" href={`/club/${clubId}/categories`}>
                    Configure Categories
                  </SaveButton>
                </div>
              ) : (
                <div className="club-groups-categories">
                  {categories.map((c) => {
                    const on = current.categoryIds.includes(c.categoryId);
                    return (
                      <button
                        key={c.categoryId}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        className={`club-groups-category ${on ? "club-groups-category-on" : ""}`.trim()}
                        onClick={() => toggleCategory(c.categoryId)}
                      >
                        <span className="club-groups-category-head">
                          <span className="club-groups-category-name">{c.categoryName}</span>
                          <i className={`bi bi-${on ? "check-circle-fill" : "circle"}`} aria-hidden="true" />
                        </span>
                        <span className="club-groups-category-goal">{formatHours(c.goal)} Goal</span>
                        <span className="club-groups-category-tags">
                          {c.needsEmailVerification && <span className="club-groups-tag">Email Verification</span>}
                          {c.needsClubConfirmation && <span className="club-groups-tag">Club Confirmation</span>}
                          {!c.needsEmailVerification && !c.needsClubConfirmation && (
                            <span className="club-muted-line">No Extra Approval</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {categories.length > 0 && (
                <p className="club-groups-total">
                  {current.categoryIds.length === 0 ? (
                    "Pick the categories this group earns hours in."
                  ) : (
                    <>
                      Students in this group need to earn <strong>{formatHours(groupGoal)}</strong> in total.
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Assigned count */}
            <div className="club-groups-count">
              <div className="club-groups-count-text">
                <div className="club-groups-count-value">{plural(current.studentIds.length, "Student")}</div>
                <div className="club-groups-label">In This Group</div>
              </div>
              <SaveButton size="sm" variant="secondary" icon="search" onClick={() => setRosterOpen(true)}>
                Search Assigned Students
              </SaveButton>
            </div>

            {/* Add students */}
            <div className="club-groups-block">
              <SectionHead>Add Students</SectionHead>
              <Input
                label="Search By Name, ID Or Email"
                placeholder="Start typing"
                icon="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {results.length > 0 && (
                <div className="club-groups-results">
                  {results.map((m) => {
                    const inGroup = groupOfStudent.get(m.studentId);
                    return (
                      <div key={m.studentId} className="club-groups-result">
                        <span className="club-groups-result-text">
                          <span className="club-groups-result-name">{fullName(m)}</span>
                          <span className="club-muted-line">
                            {" "}
                            · ID {m.studentId} · {m.email}
                          </span>
                        </span>
                        {!inGroup ? (
                          <SaveButton
                            size="sm"
                            icon="person-plus"
                            onClick={() => {
                              addStudents([m.studentId]);
                              setQuery("");
                            }}
                          >
                            Add
                          </SaveButton>
                        ) : inGroup.groupId === current.groupId ? (
                          <span className="club-groups-result-action">In This Group</span>
                        ) : (
                          <span className="club-groups-result-move">
                            <span className="club-muted-line">In {inGroup.groupName || "Untitled Group"}</span>
                            <SaveButton
                              size="sm"
                              variant="secondary"
                              icon="arrow-left-right"
                              onClick={() => {
                                moveStudents([m.studentId]);
                                setQuery("");
                              }}
                            >
                              Move To This Group
                            </SaveButton>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {q && results.length === 0 && (
                <p className="club-muted-line">No club members match &quot;{query.trim()}&quot;.</p>
              )}

              <Input
                label="Or Paste A List Of IDs Or Emails"
                multiline
                rows={3}
                placeholder="304512, klopez@hsestudents.org, 304530"
                hint="Separate with commas, spaces or new lines."
                value={paste}
                onChange={(e) => {
                  setPaste(e.target.value);
                  setPasteMessage("");
                }}
              />
              <div className="club-groups-paste-row">
                <SaveButton
                  size="sm"
                  variant="secondary"
                  icon="person-plus"
                  disabled={!paste.trim()}
                  onClick={handleAddPasted}
                >
                  Add Pasted List
                </SaveButton>
                <span className="club-groups-paste-message" aria-live="polite">
                  {pasteMessage}
                </span>
              </div>

              {/* Pasted students already in another group */}
              {pasteConflicts.length > 0 && (
                <div className="club-groups-conflicts">
                  <p className="club-groups-conflicts-title">
                    {pasteConflicts.length === 1
                      ? "1 student is already in another group."
                      : `${pasteConflicts.length} students are already in other groups.`}{" "}
                    Move them to {current.groupName || "this group"}?
                  </p>
                  <div className="club-groups-results">
                    {pasteConflicts.map((id) => {
                      const m = memberById.get(id);
                      return (
                        <div key={id} className="club-groups-result">
                          <span className="club-groups-result-text">
                            <span className="club-groups-result-name">{m ? fullName(m) : `Student ${id}`}</span>
                            <span className="club-muted-line"> · ID {id}</span>
                          </span>
                          <span className="club-groups-result-move">
                            <span className="club-muted-line">
                              In {groupOfStudent.get(id)?.groupName || "Untitled Group"}
                            </span>
                            <SaveButton size="sm" variant="secondary" icon="arrow-left-right" onClick={() => moveStudents([id])}>
                              Move
                            </SaveButton>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="club-groups-conflicts-buttons">
                    <SaveButton size="sm" variant="secondary" onClick={() => setPasteConflicts([])}>
                      Keep Them Where They Are
                    </SaveButton>
                    <SaveButton size="sm" icon="arrow-left-right" onClick={() => moveStudents(pasteConflicts)}>
                      Move All To This Group
                    </SaveButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="club-error" role="alert">
          {error}
        </p>
      )}

      {/* Footer */}
      <ClubSaveBar dirty={dirty && !isSubmitting} onDiscard={handleDiscard} onSave={handleSave} />

      {/* Dialogs */}
      {rosterOpen && current && (
        <StudentRosterModal
          title={`Assigned Students · ${current.groupName || "Untitled Group"}`}
          students={current.studentIds.map((id) => {
            const m = memberById.get(id);
            return { id: String(id), fName: m?.fName ?? "", lName: m?.lName ?? "" };
          })}
          onRemove={(id) => updateCurrent((g) => ({ ...g, studentIds: g.studentIds.filter((s) => String(s) !== id) }))}
          emptyText="No students in this group yet."
          onClose={() => setRosterOpen(false)}
        />
      )}
      {pendingDelete && (
        <ConfirmDialog
          title="Delete Group"
          message={`Delete ${pendingDelete.groupName || "this group"}? Its ${plural(pendingDelete.studentIds.length, "student")} will have no group. Nothing changes until you save.`}
          confirmLabel="Delete Group"
          onConfirm={() => deleteGroup(pendingDelete)}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
