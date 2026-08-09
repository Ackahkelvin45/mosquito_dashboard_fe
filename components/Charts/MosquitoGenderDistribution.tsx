"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";

export type GenderGroupBy = "day" | "month" | "year";

export default function MosquitoGenderDistribution({
  male,
  female,
  groupBy,
  onGroupByChange,
  isLoading,
  hideFilter,
}: {
  male?: number;
  female?: number;
  groupBy?: GenderGroupBy;
  onGroupByChange?: (value: GenderGroupBy) => void;
  isLoading?: boolean;
  hideFilter?: boolean;
}) {
  const [range, setRange] = useState<GenderGroupBy>("month");
  const effectiveRange = groupBy ?? range;

  const data = [
    { name: "Male", value: typeof male === "number" ? male : 0, color: "#3DBB5D" },
    { name: "Female", value: typeof female === "number" ? female : 0, color: "#F04362" },
  ];
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-white rounded-lg font-raleway p-3 border border-gray-200 w-full">
      {/* Header */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            Mosquito Gender Distribution
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Share of female vs male mosquitoes detected</p>
        </div>

        {!hideFilter && (
          <select
            value={effectiveRange}
            onChange={(e) => {
              const next = e.target.value as GenderGroupBy;
              if (onGroupByChange) onGroupByChange(next);
              else setRange(next);
            }}
            className="border border-gray focus:ring-0 focus:outline-none focus:border-primary rounded-xl px-4 py-2 text-sm bg-white"
          >
            <option value="year">Last Year</option>
            <option value="month">Last Month</option>
            <option value="day">Today</option>
          </select>
        )}
      </div>

      <hr className="mb-8 border-gray-200" />

      {isLoading ? (
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 pb-8">
          <div className="space-y-8 w-full sm:w-1/3 p-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton circle width={12} height={12} />
                <div className="flex flex-col gap-1">
                  <Skeleton width={60} height={14} />
                  <Skeleton width={40} height={10} />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full max-w-[350px] h-[240px] sm:h-[400px] flex items-center justify-center">
            <Skeleton circle width={200} height={200} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          {/* Legend */}
          <div className="space-y-4 sm:space-y-8 self-start sm:self-auto">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700 ">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pie Chart */}
          <div className="w-full max-w-[350px] h-[240px] sm:h-[400px] relative">
            <ResponsiveContainer>
              <PieChart>
                <Tooltip
                  formatter={(value?: number, name?: string) => {
                    const num = value ?? 0;
                    if (!total) return [`${num} (0%)`, name ?? ""];
                    return [
                      `${num} (${Math.round((num / total) * 100)}%)`,
                      name ?? "",
                    ];
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    fontSize: "12px",
                  }}
                />

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={0}
                  outerRadius="85%"
                  paddingAngle={0}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
