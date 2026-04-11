"use client";

import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type BreakdownItem = {
  name: string;
  count: number;
};

type BreakdownData = {
  sex: BreakdownItem[];
  genus: BreakdownItem[];
  species: BreakdownItem[];
  age_group: BreakdownItem[];
};

type Category = "sex" | "genus" | "species" | "age_group";

interface MosquitoBreakdownProps {
  data?: BreakdownData;
  groupBy?: string;
  onGroupByChange?: (value: any) => void;
  isLoading?: boolean;
}

export default function MosquitoBreakdown({
  data,
  groupBy,
  onGroupByChange,
  isLoading,
}: MosquitoBreakdownProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("species");

  const categories: { id: Category; label: string }[] = [
    { id: "species", label: "Species" },
    { id: "genus", label: "Genus" },
    { id: "sex", label: "Sex" },
    { id: "age_group", label: "Age Group" },
  ];

  const currentData = data ? data[activeCategory] : [];

  return (
    <div className="bg-white rounded-2xl py-6  font-raleway shadow-sm border border-gray-100 w-full min-h-[520px] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-4 px-6  border-b border-gray-50">
        <div>
          <h2 className="text-sm font-medium tracking-wide text-gray-600 uppercase">
            Mosquito Breakdown
          </h2>
          <p className="text-xs text-gray-400 mt-1">Detailed statistical overview</p>
        </div>

        <select
          value={groupBy}
          onChange={(e) => onGroupByChange?.(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-primary/20 focus:outline-none bg-white focus:border-primary transition-all cursor-pointer"
        >
          <option value="hour">Last hour</option>
          <option value="day">Last day</option>
          <option value="week">Last week</option>
          <option value="month">Last month</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex  pt-2 mb-6 px-6 ">
        {categories.map((cat, index) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-3 font-raleway text-sm font-semibold transition ${
              index === 0 ? "rounded-l-lg" : ""
            } ${index === categories.length - 1 ? "rounded-r-lg" : ""} ${
              activeCategory === cat.id
                ? "bg-linear-to-r from-secondary to-primary text-white shadow-sm"
                : "text-gray-500 bg-gray hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto w-full ">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr className="text-gray-500 text-xs font-mulish  uppercase tracking-wider font-bold">
              <th className="px-6 py-4">Category Name</th>
              <th className="px-6 py-4 text-right">Mosquito Count</th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton width={120} /></td>
                  <td className="px-6 py-4"><Skeleton className="ml-auto" width={60} /></td>
                </tr>
              ))
            ) : currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50/30 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {row.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-mulish font-bold text-gray-900">
                    {row.count.toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-400 font-raleway">
                  No data available for this period
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}