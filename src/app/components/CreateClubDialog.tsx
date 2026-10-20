"use client";

import React, { useState } from "react";
import ModalShell from "./ModalShell";
import SaveButton from "./saveButton";
import Input from "./input";
import Select from "./select";
import "../css/staff.css";
import { fullName, type PersonName } from "@/lib/personName";

type CreateClubDialogProps = {
  /** Staff offered in the optional Assign Staff select. */
  staffOptions?: PersonName[];
  onClose?: () => void;
  /** Called with the trimmed club name and the picked staff member (null when none). */
  onCreate?: (values: { name: string; staff: PersonName | null }) => void;
};

export default function CreateClubDialog({
  staffOptions = [
    { fName: "Iroh", lName: "Bennett" },
    { fName: "Tom", lName: "Brooks" },
    { fName: "David", lName: "Chen" },
    { fName: "Linh", lName: "Nguyen" },
    { fName: "Chidi", lName: "Okafor" },
    { fName: "Priya", lName: "Patel" },
  ],
  onClose = () => {},
  onCreate,
}: CreateClubDialogProps) {
  const [name, setName] = useState("");
  // The select works on full names; map back to the person on create
  const [staffName, setStaffName] = useState("");
  const trimmed = name.trim();

  function create() {
    const staff = staffOptions.find((s) => fullName(s) === staffName) ?? null;
    onCreate?.({ name: trimmed, staff });
  }

  return (
    <ModalShell
      title="Create Club"
      width="480px"
      onClose={onClose}
      footer={
        <>
          <SaveButton variant="secondary" onClick={onClose}>
            Cancel
          </SaveButton>
          <SaveButton disabled={!trimmed} onClick={create}>
            Create Club
          </SaveButton>
        </>
      }
    >
      <div className="staff-dialog-fields">
        <Input
          label="Club Name"
          placeholder="e.g. Chess Club"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Select
          label="Assign Staff (Optional)"
          placeholder="Select Staff"
          options={staffOptions.map(fullName)}
          value={staffName}
          onChange={(e) => setStaffName(e.target.value)}
        />
      </div>
    </ModalShell>
  );
}
