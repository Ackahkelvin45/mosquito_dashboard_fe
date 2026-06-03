// PDF export helper built on jsPDF + autotable. Reuses the same CsvColumn
// definitions as the CSV export so a single column model drives both formats.

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { timestampedFilename, type CsvColumn } from "./csv";

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

  autoTable(doc, {
    head: [columns.map((c) => c.header)],
    body: rows.map((row) => columns.map((c) => formatCell(c.accessor(row)))),
    startY,
    margin: { left: marginX, right: marginX },
    styles: { fontSize: 9, cellPadding: 6, overflow: "linebreak" },
    headStyles: { fillColor: [60, 33, 120], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [242, 245, 250] },
  });

  doc.save(timestampedFilename(filename, "pdf"));
}
