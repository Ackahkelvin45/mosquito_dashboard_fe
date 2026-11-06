// PDF export helper built on jsPDF + autotable. Reuses the same CsvColumn
// definitions as the CSV export so a single column model drives both formats.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { timestampedFilename, type CsvColumn } from "./csv";

// jsPDF builds the whole document synchronously on the main thread; tens of
// thousands of rows freeze the tab. Past this, the PDF says plainly that it
// is partial and points to CSV, which has no limit.
export const PDF_MAX_ROWS = 5000;

function formatCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function downloadPdf<T>(
  filename: string,
  columns: CsvColumn<T>[],
  rows: T[],
  opts?: { title?: string }
): void {
  if (typeof window === "undefined") return;
  if (columns.length === 0) return;

  // Wider tables read better in landscape.
  const orientation = columns.length > 5 ? "landscape" : "portrait";
  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });

  const marginX = 40;
  let startY = 40;

  if (opts?.title) {
    doc.setFontSize(14);
    doc.text(opts.title, marginX, startY);
    startY += 18;
  }

  const shown = rows.length > PDF_MAX_ROWS ? rows.slice(0, PDF_MAX_ROWS) : rows;
  if (shown.length < rows.length) {
    doc.setFontSize(10);
    doc.setTextColor(180, 0, 0);
    doc.text(
      `Partial export: first ${shown.length.toLocaleString()} of ${rows.length.toLocaleString()} rows. Download CSV for all rows.`,
      marginX,
      startY
    );
    doc.setTextColor(0, 0, 0);
    startY += 16;
  }

  autoTable(doc, {
    head: [columns.map((c) => c.header)],
    body: shown.map((row) => columns.map((c) => formatCell(c.accessor(row)))),
    startY,
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
    headStyles: { fillColor: [60, 33, 120], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [242, 245, 250] },
  });

  doc.save(timestampedFilename(filename, "pdf"));
}
