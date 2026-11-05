"use client";

import { useState } from "react";
import ModalShell from "@/app/components/ModalShell";
import SaveButton from "@/app/components/saveButton";
import Input from "@/app/components/input";
import Select from "@/app/components/select";
import { fullName } from "@/lib/personName";
import { dateError, hoursError, opportunityNameError } from "@/lib/validateLoggedHours";

import type { ClubCategory } from "@/actions/categories";
import type { ClubMember } from "@/actions/members";
import { addClubHours } from "@/actions/clubRequests";

type AddHoursDialogProps = {
  clubId: number;
  categories: ClubCategory[];
  members: ClubMember[];
  today: string;
  onClose: () => void;
  onAdded: (requestId: number) => void;
};

const FIELDS = { studentId: "", categoryId: "", opportunityName: "", isoDate: "", hours: "" };
type Fields = typeof FIELDS;
type Errors = Partial<Record<keyof Fields, string>>;

const byName = (a: ClubMember, b: ClubMember) => fullName(a).localeCompare(fullName(b), undefined, { sensitivity: "base" });

export default function AddHoursDialog({ clubId, categories, members, today, onClose, onAdded }: AddHoursDialogProps) {
  const [fields, setFields] = useState<Fields>(FIELDS);
  const [errors, setErrors] = useState<Errors>({});
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const hasCategories = categories.length > 0;

  const update = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): Errors => {
    const found: Errors = {
      studentId: fields.studentId ? undefined : "Select a student.",
      categoryId: hasCategories && !fields.categoryId ? "Select a category." : undefined,
      opportunityName: opportunityNameError(fields.opportunityName.trim()),
      isoDate: dateError(fields.isoDate, today),
      hours: hoursError(fields.hours.trim()),
    };
    return Object.fromEntries(Object.entries(found).filter(([, message]) => message));
  };

  const handleAdd = async () => {
    if (isSaving) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setIsSaving(true);
    setSaveError("");
    try {
      const result = await addClubHours(clubId, {
        studentId: Number(fields.studentId),
        categoryId: fields.categoryId ? Number(fields.categoryId) : null,
        opportunityName: fields.opportunityName,
        isoDate: fields.isoDate,
        hours: fields.hours,
      });
      if (result.success) onAdded(result.requestId);
      else setSaveError(result.error);
    } catch {
      setSaveError("Could not add these hours. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalShell
      title="Add Hours Manually"
      width="560px"
      onClose={onClose}
      footer={
        <>
          <SaveButton variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </SaveButton>
          <SaveButton onClick={handleAdd} disabled={isSaving}>
            {isSaving ? "Adding..." : "Add Hours"}
          </SaveButton>
        </>
      }
    >
      <div className="edit-hours-grid">
        <div className="edit-hours-full">
          <Select
            label="Student"
            placeholder="Select Student"
            options={[...members].sort(byName).map((m) => ({
              value: String(m.studentId),
              label: `${fullName(m)} · ${m.studentId}`,
            }))}
            value={fields.studentId}
            onChange={update("studentId")}
            error={errors.studentId}
          />
        </div>
        {hasCategories && (
          <Select
            label="Category"
            placeholder="Select Category"
            options={categories.map((c) => ({ value: String(c.categoryId), label: c.categoryName }))}
            value={fields.categoryId}
            onChange={update("categoryId")}
            error={errors.categoryId}
          />
        )}
        <div className={hasCategories ? "" : "edit-hours-full"}>
          <Input
            label="Hours"
            type="number"
            suffix="hrs"
            step="any"
            value={fields.hours}
            onChange={update("hours")}
            error={errors.hours}
          />
        </div>
        <div className="edit-hours-full">
          <Input
            label="Opportunity Name"
            value={fields.opportunityName}
            onChange={update("opportunityName")}
            error={errors.opportunityName}
          />
        </div>
        <div className="edit-hours-full">
          <Input label="Date" type="date" value={fields.isoDate} onChange={update("isoDate")} error={errors.isoDate} />
        </div>
        <p className="club-muted-line edit-hours-full">These hours are approved as soon as you add them.</p>

        {saveError && (
          <p className="club-requests-error edit-hours-full" role="alert">
            {saveError}
          </p>
        )}
      </div>
    </ModalShell>
  );
}
