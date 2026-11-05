"use client";

import { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import PageTitle from "@/app/components/pageTitle";
import FormSection, { FormSectionSpan } from "@/app/components/formSection";
import Select from "@/app/components/select";
import Input from "@/app/components/input";
import SaveButton from "@/app/components/saveButton";
import DetailList, { type DetailItem } from "@/app/components/detailList";
import Badge from "@/app/components/badge";
import EmptyState from "@/app/components/emptyState";
import { STATUS_TONE, type HourRequestStatus } from "@/app/components/requestRow";
import "@/app/css/student.css";
import { useToast } from "@/app/context/ToastContext";
import { formatDate } from "@/lib/formatDate";
import { formatHours } from "@/lib/formatHours";
import {
  MAX_HOURS_PER_ENTRY,
  validateLoggedHours,
  type LoggedHoursErrors,
  type LoggedHoursFields,
} from "@/lib/validateLoggedHours";

import { logHours, type LogHoursCategory, type LogHoursClub } from "@/actions/hours";

type LogHoursUIProps = {
  clubs: LogHoursClub[];
  /** The school's date, so the default date matches the server's check. */
  today: string;
};

type Submitted = { status: HourRequestStatus; line: string };

const STEPS = [
  { title: "Club And Category", icon: "list-check" },
  { title: "Opportunity Details", icon: "pencil" },
  { title: "Review And Submit", icon: "send" },
];

const emptyFields = (today: string): LoggedHoursFields => ({
  opportunityName: "",
  orgName: "",
  date: today,
  hours: "",
  coordinatorName: "",
  coordinatorEmail: "",
  message: "",
});

const categoryHint = (category: LogHoursCategory | undefined) => {
  if (!category) return undefined;
  const { categoryName, needsEmailVerification, needsClubConfirmation } = category;
  if (needsEmailVerification && needsClubConfirmation) {
    return `${categoryName} hours need coordinator email verification, then your club reviews them.`;
  }
  if (needsEmailVerification) return `${categoryName} hours need coordinator email verification.`;
  if (needsClubConfirmation) return "No coordinator verification needed. Your club reviews this request.";
  return "No verification needed. These hours count as soon as you submit.";
};

export default function LogHoursUI({ clubs, today }: LogHoursUIProps) {
  const { showToast } = useToast();

  const [step, setStep] = useState(0);
  const [clubId, setClubId] = useState(clubs[0]?.clubId ?? 0);
  const [categoryId, setCategoryId] = useState(clubs[0]?.categories[0]?.categoryId ?? 0);
  const [fields, setFields] = useState(() => emptyFields(today));
  const [errors, setErrors] = useState<LoggedHoursErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);

  const club = clubs.find((c) => c.clubId === clubId);
  const category = club?.categories.find((c) => c.categoryId === categoryId);
  const needsEmail = category?.needsEmailVerification ?? false;

  const update = (key: keyof LoggedHoursFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const changeClub = (id: number) => {
    setClubId(id);
    setCategoryId(clubs.find((c) => c.clubId === id)?.categories[0]?.categoryId ?? 0);
  };

  const next = () => {
    if (step === 1) {
      const found = validateLoggedHours(fields, { needsEmailVerification: needsEmail, today });
      setErrors(found);
      if (Object.keys(found).length > 0) return;
    }
    setSubmitError("");
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const back = () => {
    setSubmitError("");
    setStep((s) => Math.max(0, s - 1));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !club || !category) return;

    setIsSubmitting(true);
    try {
      const result = await logHours({ ...fields, clubId: club.clubId, categoryId: category.categoryId });
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      setSubmitted({
        status: result.status,
        line: `${formatHours(Number(fields.hours))} for ${fields.opportunityName.trim()} with ${club.clubName}.`,
      });
      showToast(result.status === "Approved" ? "Hours added." : "Hours submitted.", "success");
    } catch {
      showToast("Could not submit your hours. Please try again.", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keeps the club and category so a student can log several entries in a row
  const reset = () => {
    setFields(emptyFields(today));
    setErrors({});
    setSubmitError("");
    setSubmitted(null);
    setStep(0);
  };

  const review: DetailItem[] = [
    { label: "Club", value: club?.clubName },
    { label: "Category", value: category?.categoryName },
    { label: "Opportunity", value: fields.opportunityName.trim() },
    { label: "Organization", value: fields.orgName.trim() },
    { label: "Date", value: formatDate(fields.date) },
    { label: "Hours", value: formatHours(Number(fields.hours)) },
    ...(needsEmail
      ? [
          { label: "Coordinator", value: fields.coordinatorName.trim() },
          { label: "Coordinator Email", value: fields.coordinatorEmail.trim().toLowerCase() },
        ]
      : []),
    ...(fields.message.trim() ? [{ label: "Message", value: fields.message.trim(), full: true }] : []),
  ];

  return (
    <div className="log-hours">
      {/* Header */}
      <PageTitle align="left" subtitle="Submit service hours for approval.">
        Log Hours
      </PageTitle>

      {clubs.length === 0 ? (
        <EmptyState
          icon="people"
          message="You are not in any clubs yet. Ask your club sponsor to add you."
        />
      ) : submitted ? (
        /* Done */
        <FormSection title="Hours Submitted" tone="blue" header="bar" centered className="log-hours-body">
          <i className="bi bi-check-circle-fill log-hours-done-icon" aria-hidden="true" />
          <h2 className="log-hours-done-title">
            {submitted.status === "Approved" ? "Hours added." : "Hours submitted for approval."}
          </h2>
          <p className="log-hours-done-line">{submitted.line}</p>
          <Badge tone={STATUS_TONE[submitted.status]}>{submitted.status}</Badge>
          <SaveButton icon="plus-circle" onClick={reset} className="log-hours-done-action">
            Log More Hours
          </SaveButton>
        </FormSection>
      ) : (
        <div className="log-hours-body">
          <LogHoursStepper step={step} />

          <FormSection
            title={STEPS[step].title}
            tone="none"
            footer={
              <>
                <div>
                  {step > 0 && (
                    <SaveButton variant="secondary" icon="arrow-left" onClick={back} disabled={isSubmitting}>
                      Back
                    </SaveButton>
                  )}
                </div>
                {step < STEPS.length - 1 ? (
                  <SaveButton iconRight="arrow-right" onClick={next} disabled={!category}>
                    Next
                  </SaveButton>
                ) : (
                  <SaveButton icon="send" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Hours"}
                  </SaveButton>
                )}
              </>
            }
          >
            {/* Step 1: club and category */}
            {step === 0 && (
              <>
                <Select
                  label="Club"
                  options={clubs.map((c) => ({ value: String(c.clubId), label: c.clubName }))}
                  value={String(clubId)}
                  onChange={(e) => changeClub(Number(e.target.value))}
                />
                {club && club.categories.length > 0 ? (
                  <Select
                    label="Category"
                    options={club.categories.map((c) => ({ value: String(c.categoryId), label: c.categoryName }))}
                    value={String(categoryId)}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    hint={categoryHint(category)}
                  />
                ) : (
                  <Select
                    label="Category"
                    placeholder="No Categories"
                    disabled
                    error={`${club?.clubName} has no categories open to you yet. Ask your club sponsor.`}
                  />
                )}
              </>
            )}

            {/* Step 2: opportunity details */}
            {step === 1 && (
              <>
                <FormSectionSpan>
                  <Input
                    label="Opportunity Name"
                    value={fields.opportunityName}
                    onChange={update("opportunityName")}
                    error={errors.opportunityName}
                  />
                </FormSectionSpan>
                <Input
                  label="Organization Name"
                  value={fields.orgName}
                  onChange={update("orgName")}
                  error={errors.orgName}
                />
                <Input
                  label="Date"
                  type="date"
                  value={fields.date}
                  onChange={update("date")}
                  error={errors.date}
                />
                <FormSectionSpan>
                  <Input
                    label="Hours"
                    type="number"
                    suffix="hrs"
                    value={fields.hours}
                    onChange={update("hours")}
                    step="any"
                    hint={`Up to ${MAX_HOURS_PER_ENTRY} hours. Partial hours like 1.5 or 0.25 are fine.`}
                    error={errors.hours}
                  />
                </FormSectionSpan>
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
                      hint="We email this person to approve your request."
                      error={errors.coordinatorEmail}
                    />
                  </>
                )}
                <FormSectionSpan>
                  <Input
                    label="Message (Optional)"
                    multiline
                    rows={3}
                    placeholder="Anything the approver should know."
                    value={fields.message}
                    onChange={update("message")}
                    error={errors.message}
                  />
                </FormSectionSpan>
                {/* TODO: photos upload to the club's OneDrive folder (logged_hours.image_id) */}
                <FormSectionSpan>
                  <SaveButton variant="dashed" icon="camera" fullWidth disabled>
                    Add A Photo (Optional)
                  </SaveButton>
                  <p className="log-hours-note">Photo uploads are coming soon.</p>
                </FormSectionSpan>
              </>
            )}

            {/* Step 3: review */}
            {step === 2 && (
              <FormSectionSpan>
                <DetailList items={review} columns={2} />
                {submitError && (
                  <p className="log-hours-error" role="alert">
                    {submitError}
                  </p>
                )}
              </FormSectionSpan>
            )}
          </FormSection>
        </div>
      )}
    </div>
  );
}

function LogHoursStepper({ step }: { step: number }) {
  return (
    <ol className="log-hours-stepper">
      {STEPS.map((s, i) => {
        const state = i < step ? "done" : i === step ? "current" : "upcoming";
        return (
          <li
            key={s.title}
            className={`log-hours-step log-hours-step-${state}`}
            aria-current={state === "current" ? "step" : undefined}
          >
            <span className="log-hours-step-icon">
              <i className={`bi bi-${state === "done" ? "check-lg" : s.icon}`} aria-hidden="true" />
            </span>
            <span className="log-hours-step-label">{s.title}</span>
          </li>
        );
      })}
    </ol>
  );
}
