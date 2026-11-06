"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, ChevronDown, FileText, FileSpreadsheet } from "lucide-react";
import { downloadCsv, type CsvColumn } from "@/lib/csv";
import { downloadPdf, PDF_MAX_ROWS } from "@/lib/pdf";

interface DownloadButtonProps<T> {
  filename: string;
  columns: CsvColumn<T>[];
  rows: T[];
  disabled?: boolean;
  label?: string;
  /** Heading printed at the top of the PDF; defaults to the label. */
  title?: string;
  className?: string;
  /** Paged tables: loads the WHOLE filtered result on download (CSV and PDF),
   * so the export isn't just the page on screen. Omit when `rows` is already complete. */
  fetchAllRows?: (onProgress: (loaded: number, total: number) => void) => Promise<T[]>;
}

// A single "Download" button with a dropdown offering CSV and PDF exports.
// (Kept the file/export name for backwards compatibility with existing imports.)
export default function DownloadCsvButton<T>({
  filename,
  columns,
  rows,
  disabled = false,
  label = "Download",
  title,
  className = "",
  fetchAllRows,
}: DownloadButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Non-null while fetching every page for an export.
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [failed, setFailed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const isDisabled = disabled || rows.length === 0 || progress !== null;

  // Close the dropdown when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, [open]);

  const run = async (fn: (rows: T[]) => void) => {
    if (columns.length === 0) return;
    setOpen(false);
    if (!fetchAllRows) return fn(rows);
    setFailed(false);
    setNotice(null);
    setProgress({ loaded: 0, total: 0 });
    try {
      fn(await fetchAllRows((loaded, total) => setProgress({ loaded, total })));
    } catch {
      setFailed(true);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isDisabled}
        title={rows.length === 0 ? "No data to export" : label}
        aria-busy={progress !== null}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary/20 bg-white text-sm font-raleway font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Download size={16} />
        {progress
          ? `Exporting ${progress.loaded.toLocaleString()}${progress.total ? ` of ${progress.total.toLocaleString()}` : ""}…`
          : failed
          ? "Export failed — retry"
          : label}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-secondary/15 bg-white p-1.5 shadow-lg font-raleway">
          <button
            type="button"
            onClick={() => run((all) => downloadCsv(filename, columns, all))}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileSpreadsheet size={15} className="text-green-600" />
            Download CSV
          </button>
          <button
            type="button"
            onClick={() =>
              run((all) => {
                downloadPdf(filename, columns, all, { title: title ?? label });
                if (all.length > PDF_MAX_ROWS)
                  setNotice(`PDF holds the first ${PDF_MAX_ROWS.toLocaleString()} of ${all.length.toLocaleString()} rows — use CSV for all.`);
              })
            }
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText size={15} className="text-red-500" />
            Download PDF
          </button>
        </div>
      )}
      {notice && <p className="mt-1 max-w-xs text-xs text-amber-700">{notice}</p>}
    </div>
  );
}
