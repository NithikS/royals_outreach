"use client";

import { useState } from "react";
import ModalShell from "@/app/components/ModalShell";
import SaveButton from "@/app/components/saveButton";
import Select from "@/app/components/select";
import ChoiceCards from "@/app/components/choiceCards";
import "@/app/css/club.css";
import { plural } from "@/lib/plural";

import type { ClubGroup } from "@/actions/members";

// Runs a dialog's confirm action, disabling its buttons until it finishes
function useBusy() {
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };
  return [busy, run] as const;
}

//--------------------------------------------------------------------------------------//
//                                    Remove Members                                    //
//--------------------------------------------------------------------------------------//

type RemoveMembersDialogProps = {
  count: number;
  onDeactivate: () => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
};

export function RemoveMembersDialog({ count, onDeactivate, onDelete, onClose }: RemoveMembersDialogProps) {
  const [mode, setMode] = useState("deactivate");
  const [busy, run] = useBusy();
  const deleting = mode === "delete";

  return (
    <ModalShell
      title={`Remove ${plural(count, "Student")}`}
      width="560px"
      onClose={onClose}
      footer={
        <>
          <SaveButton variant="secondary" onClick={onClose}>
            Cancel
          </SaveButton>
          <SaveButton
            variant={deleting ? "danger" : "primary"}
            icon={deleting ? "trash" : "person-dash"}
            disabled={busy}
            onClick={() => run(deleting ? onDelete : onDeactivate)}
          >
            {deleting ? "Remove And Delete History" : "Deactivate Membership"}
          </SaveButton>
        </>
      }
    >
      <ChoiceCards
        direction="column"
        value={mode}
        onChange={setMode}
        ariaLabel="How to remove"
        options={[
          {
            value: "deactivate",
            icon: "person-dash",
            title: "Deactivate Membership",
            description: "Keeps their hours and club history. They can be reactivated later.",
          },
          {
            value: "delete",
            icon: "trash",
            tone: "danger",
            title: "Remove Membership And History",
            description:
              "Deletes their logged hours, member group, roles and opportunity sign ups in this club. This cannot be undone.",
          },
        ]}
      />
    </ModalShell>
  );
}

//--------------------------------------------------------------------------------------//
//                                   Assign To Group                                    //
//--------------------------------------------------------------------------------------//

const NO_GROUP = "none";

type AssignGroupDialogProps = {
  count: number;
  groups: ClubGroup[];
  /** Member Groups page, linked when the club has no groups yet. */
  groupsHref: string;
  onAssign: (groupId: number | null) => Promise<void>;
  onClose: () => void;
};

export function AssignGroupDialog({ count, groups, groupsHref, onAssign, onClose }: AssignGroupDialogProps) {
  const [groupId, setGroupId] = useState(groups[0] ? String(groups[0].groupId) : NO_GROUP);
  const [busy, run] = useBusy();

  return (
    <ModalShell
      title={`Assign ${plural(count, "Student")} To A Group`}
      width="480px"
      onClose={onClose}
      footer={
        <>
          <SaveButton variant="secondary" onClick={onClose}>
            Cancel
          </SaveButton>
          <SaveButton
            icon="check-lg"
            disabled={busy}
            onClick={() => run(() => onAssign(groupId === NO_GROUP ? null : Number(groupId)))}
          >
            Assign Group
          </SaveButton>
        </>
      }
    >
      <div className="members-dialog">
        <Select
          label="Member Group"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          options={[
            ...groups.map((g) => ({ value: String(g.groupId), label: g.groupName })),
            { value: NO_GROUP, label: "No Group" },
          ]}
        />
        <p className="club-muted-line">Students can be in one group per club. This replaces their current group.</p>
        {groups.length === 0 && (
          <div className="members-dialog-note">
            <span className="club-muted-line">This club has no member groups yet.</span>
            <SaveButton size="sm" variant="secondary" icon="people" href={groupsHref}>
              Manage Student Groups
            </SaveButton>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

//--------------------------------------------------------------------------------------//
//                                        Export                                        //
//--------------------------------------------------------------------------------------//

type ExportMembersDialogProps = {
  shownCount: number;
  totalCount: number;
  onExport: (scope: "shown" | "all") => Promise<void>;
  onClose: () => void;
};

export function ExportMembersDialog({ shownCount, totalCount, onExport, onClose }: ExportMembersDialogProps) {
  const [scope, setScope] = useState<"shown" | "all">("shown");
  const [busy, run] = useBusy();

  return (
    <ModalShell
      title="Export Members"
      width="520px"
      onClose={onClose}
      footer={
        <>
          <SaveButton variant="secondary" onClick={onClose}>
            Cancel
          </SaveButton>
          <SaveButton icon="download" disabled={busy} onClick={() => run(() => onExport(scope))}>
            Export To Excel
          </SaveButton>
        </>
      }
    >
      <ChoiceCards
        direction="column"
        value={scope}
        onChange={(value) => setScope(value as "shown" | "all")}
        ariaLabel="Which members to export"
        options={[
          {
            value: "shown",
            icon: "funnel",
            title: "Current View",
            description: `${plural(shownCount, "student")} with the current search, filters and sort.`,
          },
          {
            value: "all",
            icon: "people",
            title: "All Members",
            description: `Every member of the club (${plural(totalCount, "student")}).`,
          },
        ]}
      />
    </ModalShell>
  );
}
