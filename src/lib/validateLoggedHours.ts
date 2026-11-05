// Checks the Opportunity Details step of Log Hours. The form runs it before moving on
// and the server runs it again before saving.

export type LoggedHoursFields = {
  opportunityName: string;
  orgName: string;
  /** ISO date, e.g. "2026-10-10". */
  date: string;
  /** Kept as typed so a half-entered number can be shown back. */
  hours: string;
  coordinatorName: string;
  coordinatorEmail: string;
  message: string;
};

export type LoggedHoursErrors = Partial<Record<keyof LoggedHoursFields, string>>;

export const MAX_HOURS_PER_ENTRY = 24;
// logged_hours.hours is numeric(6, 2), so 0.25 is fine but 0.333 is not
const HOURS_PATTERN = /^(\d+(\.\d{1,2})?|\.\d{1,2})$/;
const MAX_NAME_LENGTH = 120;
export const MAX_MESSAGE_LENGTH = 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isRealDate = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const parsed = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso;
};

// Trims every field and collapses repeated spaces in the one-line ones.
export function cleanLoggedHours(fields: LoggedHoursFields): LoggedHoursFields {
  const line = (value: string) => String(value ?? "").trim().replace(/\s+/g, " ");
  return {
    opportunityName: line(fields.opportunityName),
    orgName: line(fields.orgName),
    date: line(fields.date),
    hours: line(fields.hours),
    coordinatorName: line(fields.coordinatorName),
    coordinatorEmail: line(fields.coordinatorEmail).toLowerCase(),
    message: String(fields.message ?? "").trim(),
  };
}

// The checks the club panel shares when an exec edits or adds hours.
export function opportunityNameError(name: string): string | undefined {
  if (!name) return "Enter the opportunity name.";
  if (name.length > MAX_NAME_LENGTH) return `Keep this under ${MAX_NAME_LENGTH} characters.`;
}

export function dateError(date: string, today: string): string | undefined {
  if (!date) return "Enter the date served.";
  if (!isRealDate(date)) return "Enter a real date.";
  if (date > today) return "The date cannot be in the future.";
}

export function hoursError(value: string): string | undefined {
  const hours = Number(value);
  if (!value) return "Enter the hours.";
  if (!HOURS_PATTERN.test(value)) return "Enter a number with up to 2 decimal places, like 1.5.";
  if (hours <= 0 || hours > MAX_HOURS_PER_ENTRY) return `Enter more than 0 and up to ${MAX_HOURS_PER_ENTRY} hours.`;
}

export function validateLoggedHours(
  fields: LoggedHoursFields,
  { needsEmailVerification, today }: { needsEmailVerification: boolean; today: string },
): LoggedHoursErrors {
  const f = cleanLoggedHours(fields);
  const errors: LoggedHoursErrors = {};
  const tooLong = (value: string) => value.length > MAX_NAME_LENGTH;

  const opportunityProblem = opportunityNameError(f.opportunityName);
  if (opportunityProblem) errors.opportunityName = opportunityProblem;

  if (!f.orgName) errors.orgName = "Enter the organization name.";
  else if (tooLong(f.orgName)) errors.orgName = `Keep this under ${MAX_NAME_LENGTH} characters.`;

  const dateProblem = dateError(f.date, today);
  if (dateProblem) errors.date = dateProblem;

  const hoursProblem = hoursError(f.hours);
  if (hoursProblem) errors.hours = hoursProblem;

  if (needsEmailVerification) {
    if (!f.coordinatorName) errors.coordinatorName = "Enter the coordinator's name.";
    else if (tooLong(f.coordinatorName)) errors.coordinatorName = `Keep this under ${MAX_NAME_LENGTH} characters.`;

    if (!f.coordinatorEmail) errors.coordinatorEmail = "Enter the coordinator's email.";
    else if (!EMAIL_PATTERN.test(f.coordinatorEmail)) errors.coordinatorEmail = "Enter a valid email.";
  }

  if (f.message.length > MAX_MESSAGE_LENGTH) errors.message = `Keep this under ${MAX_MESSAGE_LENGTH} characters.`;

  return errors;
}
