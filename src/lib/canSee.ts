// Role-based visibility for the Club Executive Panel side nav and sections.
// Staff (assigned sponsor) and Admin see every section. A Student (club exec)
// only sees the sections a staff sponsor has opened to execs.

export type ClubRole = "Staff" | "Student" | "Admin";

export type ClubSection =
  | "overview"
  | "config"
  | "categories"
  | "groups"
  | "requests"
  | "progress"
  | "lookup"
  | "opportunities"
  | "export"
  | "images"
  | "roles";

const STUDENT_SECTIONS: ClubSection[] = [
  "overview",
  "requests",
  "progress",
  "opportunities",
  "images",
];

export function canSee(section: ClubSection, role: ClubRole): boolean {
  if (role === "Staff" || role === "Admin") return true;
  return STUDENT_SECTIONS.includes(section);
}
