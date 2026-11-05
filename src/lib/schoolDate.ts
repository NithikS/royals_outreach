// HSE is in Fishers, Indiana, so "today" is the school's date, not the server's.
const SCHOOL_TIME_ZONE = "America/Indiana/Indianapolis";

// Today's date at the school as an ISO date, e.g. "2026-10-27".
export function schoolToday(): string {
  // en-CA formats dates as YYYY-MM-DD
  return new Date().toLocaleDateString("en-CA", { timeZone: SCHOOL_TIME_ZONE });
}
