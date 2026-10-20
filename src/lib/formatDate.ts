const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formats an ISO date ("2026-09-27") for display, e.g.:
//   formatDate("2026-09-27")          -> "Sep 27, 2026"
//   formatDate("2026-09-27", "short") -> "Sep 27"
// Blank or unparseable input returns "".
export function formatDate(iso: string | null | undefined, style: "long" | "short" = "long"): string {
  if (!iso) return "";

  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(iso.trim());
  if (!match) return "";

  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  if (!name) return "";

  return style === "short" ? `${name} ${Number(day)}` : `${name} ${Number(day)}, ${year}`;
}

// Short month name for a month index (0 = "Jan").
export function monthName(index: number): string {
  return MONTHS[index] ?? "";
}
