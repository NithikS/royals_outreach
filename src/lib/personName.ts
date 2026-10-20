// A person's name as it comes from the database. Every student, staff and admin
// name is passed to components in this shape, e.g.:
//   { fName: "Aang", lName: "Smith" }
export type PersonName = {
  fName: string;
  lName: string;
};

// Joins first and last name for display, e.g.:
//   fullName({ fName: "Aang", lName: "Smith" }) -> "Aang Smith"
export function fullName(person: PersonName): string {
  return `${person.fName.trim()} ${person.lName.trim()}`.trim();
}

// First letter of the first and last name, uppercased, e.g.:
//   initials({ fName: "Aang", lName: "Smith" }) -> "AS"
export function initials(person: PersonName): string {
  return `${person.fName.trim().charAt(0)}${person.lName.trim().charAt(0)}`.toUpperCase();
}
