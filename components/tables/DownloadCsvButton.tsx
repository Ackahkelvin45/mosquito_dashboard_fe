"use client";

import React, { useEffect, useRef, useState } from "react";
import { Download, ChevronDown, FileText, FileSpreadsheet } from "lucide-react";
import { downloadCsv, type CsvColumn } from "@/lib/csv";
import { downloadPdf } from "@/lib/pdf";

interface DownloadButtonProps<T> {
  filename: string;
  columns: CsvColumn<T>[];
  rows: T[];
  disabled?: boolean;
  label?: string;
  /** Heading printed at the top of the PDF; defaults to the label. */
  title?: string;
  className?: string;
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
}: DownloadButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDisabled = disabled || rows.length === 0;

  // Close the dropdown when clicking outside.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const run = (fn: () => void) => {
    if (columns.length === 0) return;
    fn();
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isDisabled}
        title={rows.length === 0 ? "No data to export" : label}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary/20 bg-white text-sm font-raleway font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Download size={16} />
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-secondary/15 bg-white p-1.5 shadow-lg font-raleway">
          <button
            type="button"
            onClick={() => run(() => downloadCsv(filename, columns, rows))}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileSpreadsheet size={15} className="text-green-600" />
            Download CSV
          </button>
          <button
            type="button"
            onClick={() => run(() => downloadPdf(filename, columns, rows, { title: title ?? label }))}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText size={15} className="text-red-500" />
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
