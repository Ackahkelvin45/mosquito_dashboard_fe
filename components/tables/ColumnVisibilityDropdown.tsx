"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Columns3, ChevronDown } from "lucide-react";

// Any column-like object identified by its `header` label.
type ColumnLike = { header: string };

// Manages which columns are selected and derives the visible subset.
export function useColumnVisibility<C extends ColumnLike>(columns: C[]) {
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(columns.map((c) => [c.header, true]))
  );

  // Keep selection in sync if the column set changes.
  useEffect(() => {
    setSelected((prev) =>
      Object.fromEntries(columns.map((c) => [c.header, prev[c.header] ?? true]))
    );
  }, [columns]);

  const visibleColumns = useMemo(
    () => columns.filter((c) => selected[c.header]),
    [columns, selected]
  );

  return { selected, setSelected, visibleColumns };
}

interface ColumnVisibilityDropdownProps<C extends ColumnLike> {
  columns: C[];
  selected: Record<string, boolean>;
  onChange: (next: Record<string, boolean>) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function ColumnVisibilityDropdown<C extends ColumnLike>({
  columns,
  selected,
  onChange,
  disabled = false,
  label = "Columns",
  className = "",
}: ColumnVisibilityDropdownProps<C>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectedCount = columns.filter((c) => selected[c.header]).length;

  const toggle = (header: string) =>
    onChange({ ...selected, [header]: !selected[header] });

  const setAll = (value: boolean) =>
    onChange(Object.fromEntries(columns.map((c) => [c.header, value])));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary/20 bg-white text-sm font-raleway font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Columns3 size={16} className="text-primary" />
        {label} ({selectedCount}/{columns.length})
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-secondary/15 bg-white p-3 shadow-lg font-raleway">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Visible columns
            </span>
            <div className="flex gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAll(true)}
                className="text-primary hover:underline px-2 py-1.5 -mx-1 -my-1.5"
              >
                All
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => setAll(false)}
                className="text-gray-500 hover:underline px-2 py-1.5 -mx-1 -my-1.5"
              >
                None
              </button>
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto flex flex-col gap-1">
            {columns.map((c) => (
              <label
                key={c.header}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!selected[c.header]}
                  onChange={() => toggle(c.header)}
                  className="accent-primary"
                />
                {c.header}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
