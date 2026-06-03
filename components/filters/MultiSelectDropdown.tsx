"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type MultiSelectOption = {
  value: string;
  label: string;
};

interface MultiSelectDropdownProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  emptyText?: string;
  className?: string;
}

/**
 * A compact checkbox dropdown for selecting multiple values (e.g. devices).
 * Mirrors the styling of the existing filter controls.
 */
export default function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  disabled = false,
  emptyText = "No options",
  className = "",
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const summary = selected.length > 0 ? `${label} (${selected.length})` : label;

  return (
    <div ref={ref} className={`relative text-sm ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border border-gray bg-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary disabled:opacity-50"
      >
        <span className={selected.length ? "text-text-dark" : "text-gray-500"}>{summary}</span>
        <ChevronDown size={16} className="text-gray-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-gray-400">{emptyText}</div>
          ) : (
            options.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      isSelected ? "bg-primary border-primary" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
