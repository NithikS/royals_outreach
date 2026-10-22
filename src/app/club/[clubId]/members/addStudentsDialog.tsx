"use client";

import { useRef, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import ModalShell from "@/app/components/ModalShell";
import Tabs from "@/app/components/tabs";
import Input from "@/app/components/input";
import SaveButton from "@/app/components/saveButton";
import ChoiceCards from "@/app/components/choiceCards";
import "@/app/css/club.css";
import { downloadSheet, readSheet } from "@/lib/excel";
import { fullName } from "@/lib/personName";
import { plural } from "@/lib/plural";
import { STUDENT_EMAIL_DOMAIN, isStudentEmail } from "@/lib/studentEmail";

import type {
  AddStudentsResult,
  ConflictChoices,
  NewStudent,
  StudentConflict,
} from "@/actions/members";

type AddStudentsDialogProps = {
  onAdd: (
    students: NewStudent[],
    choices?: ConflictChoices,
  ) => Promise<AddStudentsResult>;
  onClose: () => void;
};

type StudentForm = Record<keyof NewStudent, string>;

const EMPTY_FORM: StudentForm = {
  studentId: "",
  fName: "",
  lName: "",
  email: "",
  gradClass: "",
};

// Upload columns in template order
const FIELDS: (keyof NewStudent)[] = [
  "studentId",
  "fName",
  "lName",
  "email",
  "gradClass",
];
const TEMPLATE_HEADERS = [
  "Student ID",
  "First Name",
  "Last Name",
  "Email",
  "Grad Class",
];

// Accepted spellings of each upload column, compared lowercase with spaces and symbols removed
const HEADER_ALIASES: Record<keyof NewStudent, string[]> = {
  studentId: ["studentid", "id", "studentnumber"],
  fName: ["firstname", "fname", "first"],
  lName: ["lastname", "lname", "last"],
  email: ["email", "emailaddress", "studentemail"],
  gradClass: ["gradclass", "graduationyear", "gradyear", "classof", "class"],
};

const normalizeHeader = (header: string) =>
  header.toLowerCase().replace(/[^a-z]/g, "");

// Maps sheet rows onto NewStudent. Server validation reports bad values by student ID.
function parseSheetRows(rows: Record<string, unknown>[]): {
  students: NewStudent[];
  errors: string[];
} {
  if (rows.length === 0)
    return { students: [], errors: ["The file has no rows."] };

  const columnFor = {} as StudentForm;
  const headers = Object.keys(rows[0]);
  const missing: string[] = [];
  FIELDS.forEach((field, i) => {
    const header = headers.find((h) =>
      HEADER_ALIASES[field].includes(normalizeHeader(h)),
    );
    if (header) columnFor[field] = header;
    else missing.push(TEMPLATE_HEADERS[i]);
  });
  if (missing.length > 0)
    return {
      students: [],
      errors: [`Missing columns: ${missing.join(", ")}.`],
    };

  const students = rows
    .map(
      (row) =>
        Object.fromEntries(
          FIELDS.map((f) => [f, String(row[columnFor[f]] ?? "").trim()]),
        ) as StudentForm,
    )
    .filter((cells) => FIELDS.some((f) => cells[f]))
    .map((cells) => ({
      studentId: Number(cells.studentId),
      fName: cells.fName,
      lName: cells.lName,
      email: cells.email,
      gradClass: Number(cells.gradClass),
    }));

  return {
    students,
    errors: students.length === 0 ? ["The file has no student rows."] : [],
  };
}

function validateForm(form: StudentForm): Partial<StudentForm> {
  const errors: Partial<StudentForm> = {};
  if (!/^\d+$/.test(form.studentId.trim()))
    errors.studentId = "Enter the school student ID.";
  if (!form.fName.trim()) errors.fName = "First name is required.";
  if (!form.lName.trim()) errors.lName = "Last name is required.";
  if (!isStudentEmail(form.email))
    errors.email = `Enter a student email ending in @${STUDENT_EMAIL_DOMAIN}.`;
  if (!/^\d{4}$/.test(form.gradClass.trim()))
    errors.gradClass = "Enter a year like 2027.";
  return errors;
}

function StudentSummary({ student }: { student: NewStudent }) {
  return (
    <span className="members-conflict-summary">
      <span>{fullName(student)}</span>
      <span>{student.email}</span>
      <span>Class Of {student.gradClass}</span>
    </span>
  );
}

export default function AddStudentsDialog({
  onAdd,
  onClose,
}: AddStudentsDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState("one");
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<StudentForm>>({});
  const [upload, setUpload] = useState<{
    fileName: string;
    students: NewStudent[];
  } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [conflicts, setConflicts] = useState<StudentConflict[]>([]);
  const [choices, setChoices] = useState<ConflictChoices>({});
  const [busy, setBusy] = useState(false);

  const resolving = conflicts.length > 0;

  const submit = async (students: NewStudent[], picked?: ConflictChoices) => {
    setBusy(true);
    try {
      const result = await onAdd(students, picked);
      setErrors(result.errors);
      setConflicts(result.conflicts);
      // Default every conflict to the record already in the system
      setChoices(
        Object.fromEntries(
          result.conflicts.map((c) => [c.incoming.studentId, "existing"]),
        ),
      );
      if (result.errors.length === 0 && result.conflicts.length === 0)
        onClose();
      setUpload(null);
    } catch {
      setErrors(["Something went wrong. Please try again."]);
    } finally {
      setBusy(false);
    }
  };

  const handleAddOne = () => {
    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    submit([
      {
        studentId: Number(form.studentId),
        fName: form.fName,
        lName: form.lName,
        email: form.email,
        gradClass: Number(form.gradClass),
      },
    ]);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = parseSheetRows(await readSheet(file));
      setErrors(parsed.errors);
      setUpload(
        parsed.students.length > 0
          ? { fileName: file.name, students: parsed.students }
          : null,
      );
    } catch {
      setErrors([
        "Could not read that file. Upload an .xlsx, .xls or .csv file.",
      ]);
      setUpload(null);
    }
  };

  const field = (
    key: keyof NewStudent,
    label: string,
    extra?: { type?: string; placeholder?: string },
  ) => (
    <Input
      label={label}
      value={form[key]}
      error={fieldErrors[key]}
      type={extra?.type}
      placeholder={extra?.placeholder}
      onChange={(e) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }));
        setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      }}
    />
  );

  const footer = resolving ? (
    <>
      <SaveButton variant="secondary" onClick={onClose}>
        Cancel
      </SaveButton>
      <SaveButton
        icon="check-lg"
        disabled={busy}
        onClick={() =>
          submit(
            conflicts.map((c) => c.incoming),
            choices,
          )
        }
      >
        Save Choices And Add
      </SaveButton>
    </>
  ) : (
    <>
      <SaveButton variant="secondary" onClick={onClose}>
        Cancel
      </SaveButton>
      {tab === "one" ? (
        <SaveButton icon="person-plus" disabled={busy} onClick={handleAddOne}>
          Add Student
        </SaveButton>
      ) : (
        <SaveButton
          icon="person-plus"
          disabled={busy || !upload}
          onClick={() => upload && submit(upload.students)}
        >
          {upload
            ? `Add ${plural(upload.students.length, "Student")}`
            : "Add Students"}
        </SaveButton>
      )}
    </>
  );

  return (
    <ModalShell
      title={resolving ? "Check Student Records" : "Add Students"}
      width="600px"
      onClose={onClose}
      footer={footer}
    >
      <div className="members-dialog">
        {/* Errors */}
        {errors.length > 0 && (
          <ul className="members-error-list" role="alert">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        {resolving ? (
          /* Conflicts */
          <>
            <p className="club-muted-line">
              These students are already in the system with different details.
              Choose which record to keep.
            </p>
            {conflicts.map(({ existing, incoming }) => (
              <div key={incoming.studentId} className="members-conflict">
                <div className="members-conflict-title">
                  Student {incoming.studentId}
                </div>
                <ChoiceCards
                  options={[
                    {
                      value: "existing",
                      title: "Keep Existing Record",
                      description: <StudentSummary student={existing} />,
                    },
                    {
                      value: "incoming",
                      title: "Use New Record",
                      description: <StudentSummary student={incoming} />,
                    },
                  ]}
                  value={choices[incoming.studentId]}
                  onChange={(value) =>
                    setChoices((prev) => ({
                      ...prev,
                      [incoming.studentId]: value as "existing" | "incoming",
                    }))
                  }
                  ariaLabel={`Record to keep for student ${incoming.studentId}`}
                />
              </div>
            ))}
          </>
        ) : (
          <>
            <Tabs
              tabs={[
                { value: "one", label: "Add One Student" },
                { value: "upload", label: "Upload Excel" },
              ]}
              value={tab}
              onChange={(value) => {
                setTab(value);
                setErrors([]);
              }}
              ariaLabel="How to add students"
            />

            {tab === "one" ? (
              /* Single student */
              <div className="members-add-grid">
                {field("studentId", "Student ID")}
                {field("gradClass", "Grad Class", { placeholder: "Ex. 2027" })}
                {field("fName", "First Name")}
                {field("lName", "Last Name")}
                <div className="members-add-wide">
                  {field("email", "Email", { type: "email" })}
                </div>
              </div>
            ) : (
              /* Excel upload */
              <div className="members-upload">
                <p className="club-muted-line">
                  Upload an Excel or CSV file with the columns Student ID, First
                  Name, Last Name, Email and Grad Class.
                </p>
                <div className="members-upload-buttons">
                  <SaveButton
                    variant="dashed"
                    icon="file-earmark-arrow-up"
                    onClick={() => fileRef.current?.click()}
                  >
                    Choose File
                  </SaveButton>
                  <SaveButton
                    variant="ghost"
                    icon="download"
                    onClick={() =>
                      downloadSheet(
                        [],
                        "Member Upload Template.xlsx",
                        TEMPLATE_HEADERS,
                      )
                    }
                  >
                    Download Template
                  </SaveButton>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  hidden
                  onChange={(e) => {
                    handleFile(e.target.files?.[0]);
                    // Let the same file be picked again after fixing it
                    e.target.value = "";
                  }}
                />
                {upload && (
                  <div className="members-upload-file">
                    <i
                      className="bi bi-file-earmark-spreadsheet"
                      aria-hidden="true"
                    />
                    {upload.fileName} ·{" "}
                    {plural(upload.students.length, "student")} found
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ModalShell>
  );
}
