"use client";

import React, { useState } from "react";
import ModalShell from "./ModalShell";
import SaveButton from "./saveButton";
import Input from "./input";
import Select from "./select";
import { HourRequest, HourRequestStatus } from "./requestRow";
import "../css/components.css";
import { fullName } from "@/lib/personName";

type EditHoursDialogProps = {
  /** The request being edited. Remount (change `key`) to edit a different one. */
  request?: HourRequest;
  /** Category choices. Empty or omitted hides the Category field (general hours only, e.g. Robotics Club). */
  categories?: string[];
  statuses?: HourRequestStatus[];
  title?: string;
  width?: string;
  onClose?: () => void;
  /** Called with the edited copy of the request when Save Changes is pressed. */
  onSave?: (request: HourRequest) => void;
  /** Shows a Delete Request button in the footer. */
  onDelete?: (id: HourRequest["id"]) => void;
};

const DEFAULT_REQUEST: HourRequest = {
  id: 1,
  opportunity: "Park Cleanup",
  club: "Key Club",
  category: "Service",
  date: "Oct 2",
  hours: 2,
  status: "Pending",
};

export default function EditHoursDialog({
  request = DEFAULT_REQUEST,
  categories = [],
  statuses = ["Pending", "Approved", "Denied"],
  title = "Edit Logged Hours",
  width = "480px",
  onClose = () => {},
  onSave,
  onDelete,
}: EditHoursDialogProps) {
  const [draft, setDraft] = useState<HourRequest>(request);
  const hasCategories = categories.length > 0;

  // "student · opportunity" when a student is set, otherwise the opportunity with club and category below
  const heading = [request.student && fullName(request.student), request.opportunity].filter(Boolean).join(" · ");
  const meta = request.student ? undefined : [request.club, request.category].filter(Boolean).join(" · ");

  return (
    <ModalShell
      title={title}
      width={width}
      onClose={onClose}
      footer={
        <>
          {onDelete && (
            <SaveButton variant="danger" onClick={() => onDelete(request.id)}>
              Delete Request
            </SaveButton>
          )}
          <SaveButton variant="secondary" onClick={onClose}>
            Cancel
          </SaveButton>
          <SaveButton onClick={() => onSave?.(draft)}>Save Changes</SaveButton>
        </>
      }
    >
      <div className="edit-hours-grid">
        {/* Summary */}
        <div className="edit-hours-full">
          <div className="edit-hours-name">{heading}</div>
          {meta && <div className="edit-hours-meta">{meta}</div>}
        </div>

        {/* Fields */}
        <Input
          label="Hours"
          type="number"
          value={draft.hours}
          onChange={(e) => setDraft({ ...draft, hours: Math.max(0, Number(e.target.value)) })}
        />
        <Input
          label="Date"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
        />
        {hasCategories && (
          <Select
            label="Category"
            options={categories}
            value={draft.category}
            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
          />
        )}
        <div className={hasCategories ? "" : "edit-hours-full"}>
          <Select
            label="Status"
            options={statuses}
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as HourRequestStatus })}
          />
        </div>
      </div>
    </ModalShell>
  );
}
