// Lightweight CSV export helper. No dependencies — builds a CSV string from
// typed column definitions and triggers a browser download via a Blob.

export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
};

// Escapes a single CSV cell: stringifies, neutralises formula injection
// (cells starting with = + - @ are a known spreadsheet attack vector), and
// wraps in quotes when the value contains a comma, quote or newline.
function escapeCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";

  let str = String(value);

  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const headerLine = columns.map((c) => escapeCell(c.header)).join(",");
  const dataLines = rows.map((row) =>
    columns.map((c) => escapeCell(c.accessor(row))).join(",")
  );
  return [headerLine, ...dataLines].join("\r\n");
}

// Appends a timestamp so repeated downloads don't overwrite each other.
export function timestampedFilename(filename: string, ext: string): string {
  const base = filename.replace(new RegExp(`\\.${ext}$`, "i"), "");
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${base}_${stamp}.${ext}`;
}

export function downloadCsv<T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[]
): void {
  if (typeof window === "undefined") return;

  const csv = toCsv(columns, rows);
  // Prepend a BOM so Excel reads UTF-8 characters correctly.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = timestampedFilename(filename, "csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
