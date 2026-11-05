"use client";

import { useState } from "react";
import ModalShell from "@/app/components/ModalShell";
import SaveButton from "@/app/components/saveButton";
import Input from "@/app/components/input";
import {
  MAX_HOURS_PER_ENTRY,
  validateLoggedHours,
  type LoggedHoursErrors,
  type LoggedHoursFields,
} from "@/lib/validateLoggedHours";

import { updateMyRequest, type MyRequest } from "@/actions/hours";

type EditRequestDialogProps = {
  request: MyRequest;
  today: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditRequestDialog({ request, today, onClose, onSaved }: EditRequestDialogProps) {
  const needsEmail = request.status === "Pending Email Verification";

  const [fields, setFields] = useState<LoggedHoursFields>({
    opportunityName: request.opportunity,
    orgName: request.organization ?? "",
    date: request.isoDate,
    hours: String(request.hours),
    coordinatorName: request.coordinator ?? "",
    coordinatorEmail: request.coordinatorEmail ?? "",
    message: request.message ?? "",
  });
  const [errors, setErrors] = useState<LoggedHoursErrors>({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const update = (key: keyof LoggedHoursFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = async () => {
    if (isSaving) return;

    const found = validateLoggedHours(fields, { needsEmailVerification: needsEmail, today });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSaving(true);
    setSaveError("");
    try {
      const result = await updateMyRequest(request.id, fields);
      if (result.success) onSaved();
      else setSaveError(result.error);
    } catch {
      setSaveError("Could not save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalShell
      title="Edit Request"
      width="560px"
      onClose={onClose}
      footer={
        <>
          <SaveButton variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </SaveButton>
          <SaveButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </SaveButton>
        </>
      }
    >
      <div className="edit-hours-grid">
        {/* Summary */}
        <div className="edit-hours-full">
          <div className="edit-hours-name">{[request.club, request.category].filter(Boolean).join(" · ")}</div>
          <div className="edit-hours-meta">To change the club or category, delete this request and log it again.</div>
        </div>

        {/* Fields */}
        <div className="edit-hours-full">
          <Input
            label="Opportunity Name"
            value={fields.opportunityName}
            onChange={update("opportunityName")}
            error={errors.opportunityName}
          />
        </div>
        <div className="edit-hours-full">
          <Input label="Organization Name" value={fields.orgName} onChange={update("orgName")} error={errors.orgName} />
        </div>
        <Input label="Date" type="date" value={fields.date} onChange={update("date")} error={errors.date} />
        <Input
          label="Hours"
          type="number"
          suffix="hrs"
          step="any"
          value={fields.hours}
          onChange={update("hours")}
          hint={`Up to ${MAX_HOURS_PER_ENTRY} hours.`}
          error={errors.hours}
        />
        {needsEmail && (
          <>
            <Input
              label="Coordinator Name"
              icon="person"
              value={fields.coordinatorName}
              onChange={update("coordinatorName")}
              error={errors.coordinatorName}
            />
            <Input
              label="Coordinator Email"
              icon="envelope"
              type="email"
              value={fields.coordinatorEmail}
              onChange={update("coordinatorEmail")}
              error={errors.coordinatorEmail}
            />
          </>
        )}
        <div className="edit-hours-full">
          <Input
            label="Message (Optional)"
            multiline
            rows={3}
            placeholder="Anything the approver should know."
            value={fields.message}
            onChange={update("message")}
            error={errors.message}
          />
        </div>

        {saveError && (
          <p className="my-requests-error edit-hours-full" role="alert">
            {saveError}
          </p>
        )}
      </div>
    </ModalShell>
  );
}
