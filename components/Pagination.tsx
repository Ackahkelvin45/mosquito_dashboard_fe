"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

// Build a compact page list with ellipses, e.g. 1 … 4 5 6 … 12
function buildPages(page: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);
  return pages;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  isLoading,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = buildPages(page, totalPages);

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === page || isLoading) return;
    onPageChange(p);
  };

  const navBtn =
    "flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 bg-white transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 font-raleway">
      <span className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-700">{from}–{to}</span> of{" "}
        <span className="font-semibold text-gray-700">{total}</span>
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1 || isLoading}
          className={navBtn}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-gray-400 text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              disabled={isLoading}
              aria-current={p === page ? "page" : undefined}
              className={`h-9 min-w-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-white shadow-sm"
                  : "border border-gray-200 text-gray-600 bg-white hover:border-primary hover:text-primary"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages || isLoading}
          className={navBtn}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
