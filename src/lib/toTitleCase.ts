// Capitalizes the first letter of each name segment, lowercasing the rest.
// Handles multi-part names joined by spaces, hyphens, or apostrophes, e.g.:
//   "mary jane" -> "Mary Jane"
//   "o'brien"   -> "O'Brien"
//   "smith-jones" -> "Smith-Jones"
export function toTitleCase(name: string | null | undefined): string | null | undefined {
  if (!name) return name;

  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return trimmed;

  return trimmed.replace(/[a-zA-Z]+/g, (word) =>
    word[0].toUpperCase() + word.slice(1).toLowerCase(),
  );
}
