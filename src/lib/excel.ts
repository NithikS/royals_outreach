// Browser-side Excel helpers. SheetJS is loaded on first use to keep it out of the page bundle.

type SheetRow = Record<string, string | number>;

// Downloads rows as an .xlsx file; the first row's keys become the header row, e.g.:
//   downloadSheet([{ "Student ID": 12345, "First Name": "Aang" }], "Members.xlsx")
export async function downloadSheet(rows: SheetRow[], fileName: string, headers?: string[]): Promise<void> {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(rows, { header: headers });
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Sheet1");
  XLSX.writeFile(book, fileName);
}

// Reads the first sheet of an uploaded .xlsx, .xls or .csv file into one object per row,
// keyed by the header row. Blank cells come back as "".
export async function readSheet(file: File): Promise<Record<string, unknown>[]> {
  const XLSX = await import("xlsx");
  const book = XLSX.read(await file.arrayBuffer());
  const sheet = book.Sheets[book.SheetNames[0]];
  return sheet ? XLSX.utils.sheet_to_json(sheet, { defval: "" }) : [];
}
