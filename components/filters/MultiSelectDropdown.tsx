"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type MultiSelectOption = {
  value: string;
  label: string;
  /** Optional secondary text (e.g. an email) shown under the label. */
  description?: string;
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
 * A searchable multi-select combobox: an input that opens a checkbox dropdown
 * on focus, filters options as you type, and keeps the list open while
 * ticking multiple values. Mirrors the styling of the existing filter controls.
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
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description ?? "").toLowerCase().includes(q)
    );
  }, [options, query]);

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const placeholder = selected.length > 0 ? `${label} (${selected.length})` : label;

  return (
    <div ref={ref} className={`relative text-sm ${className}`}>
      <div
        className={`flex w-full items-center gap-2 border border-gray bg-white rounded-lg px-3 focus-within:border-primary ${disabled ? "opacity-50" : "cursor-text"}`}
        onClick={() => {
          if (!disabled) {
            setOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={`min-w-0 flex-1 py-2.5 bg-transparent outline-none ${
            selected.length > 0
              ? "placeholder:text-text-dark placeholder:font-medium"
              : "placeholder:text-gray-500"
          }`}
        />
        {selected.length > 0 && (
          <span className="bg-primary/10 text-primary text-xs font-bold rounded-full px-2 py-0.5 shrink-0">
            {selected.length}
          </span>
        )}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => {
              if (o) setQuery("");
              return !o;
            });
          }}
          aria-label={open ? "Close options" : "Show options"}
        >
          <ChevronDown
            size={16}
            className={`text-gray-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-gray-400">
              {options.length === 0 ? emptyText : "No matches"}
            </div>
          ) : (
            filtered.map((opt) => {
              const isSelected = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      isSelected ? "bg-primary border-primary" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{opt.label}</span>
                    {opt.description && (
                      <span className="block truncate text-xs text-gray-400">{opt.description}</span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
