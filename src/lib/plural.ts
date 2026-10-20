// Formats a count with its noun, picking the singular or plural form, e.g.:
//   plural(1, "Student")               -> "1 Student"
//   plural(3, "Student")               -> "3 Students"
//   plural(2, "Category", "Categories") -> "2 Categories"
export function plural(count: number, singular: string, pluralForm?: string): string {
  return `${count} ${count === 1 ? singular : (pluralForm ?? `${singular}s`)}`;
}
