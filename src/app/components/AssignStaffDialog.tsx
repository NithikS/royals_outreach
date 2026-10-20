"use client";

import React, { useState } from "react";
import ModalShell from "./ModalShell";
import SaveButton from "./saveButton";
import IconButton from "./iconButton";
import Select from "./select";
import ListRow from "./listRow";
import "../css/staff.css";
import { fullName, type PersonName } from "@/lib/personName";

type AssignStaffDialogProps = {
  clubName?: string;
  /** Staff currently assigned to the club. */
  assigned?: PersonName[];
  /** Every staff member; the Add Staff select lists those not yet assigned. */
  allStaff?: PersonName[];
  onAdd?: (staff: PersonName) => void;
  onRemove?: (staff: PersonName) => void;
  /** Close icon, scrim, Escape and the Done button. */
  onClose?: () => void;
};

export default function AssignStaffDialog({
  clubName = "Key Club",
  assigned = [
    { fName: "Tom", lName: "Brooks" },
    { fName: "Priya", lName: "Patel" },
  ],
  allStaff = [
    { fName: "Iroh", lName: "Bennett" },
    { fName: "Tom", lName: "Brooks" },
    { fName: "David", lName: "Chen" },
    { fName: "Linh", lName: "Nguyen" },
    { fName: "Chidi", lName: "Okafor" },
    { fName: "Priya", lName: "Patel" },
  ],
  onAdd,
  onRemove,
  onClose = () => {},
}: AssignStaffDialogProps) {
  // The select works on full names; map back to the person on add
  const [pick, setPick] = useState("");
  const assignedNames = assigned.map(fullName);
  const available = allStaff.filter((s) => !assignedNames.includes(fullName(s)));

  function add() {
    const staff = available.find((s) => fullName(s) === pick);
    if (!staff) return;
    onAdd?.(staff);
    setPick("");
  }

  return (
    <ModalShell
      title={`Assign Staff · ${clubName}`}
      width="480px"
      onClose={onClose}
      footer={<SaveButton onClick={onClose}>Done</SaveButton>}
    >
      <div className="staff-dialog-fields">
        {/* Current staff */}
        <div className="staff-assign-list">
          {assigned.map((staff) => (
            <ListRow
              key={fullName(staff)}
              title={fullName(staff)}
              density="compact"
              trailing={
                <IconButton
                  icon="x-lg"
                  label="Remove"
                  className="staff-icon-target"
                  onClick={() => onRemove?.(staff)}
                />
              }
            />
          ))}
          {assigned.length === 0 && (
            <div className="staff-assign-empty">No staff assigned yet.</div>
          )}
        </div>

        {/* Add staff */}
        <div className="staff-assign-add">
          <Select
            className="staff-assign-select"
            label="Add Staff"
            placeholder="Select Staff"
            options={available.map(fullName)}
            value={pick}
            onChange={(e) => setPick(e.target.value)}
          />
          <SaveButton variant="secondary" onClick={add}>
            Add
          </SaveButton>
        </div>
      </div>
    </ModalShell>
  );
}
