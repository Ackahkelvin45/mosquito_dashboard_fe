"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useState } from "react";
import type { ChartGroupBy, MosquitoTrendPoint } from "@/queries/device/deviceChartsQueries";

interface Props {
  data?: MosquitoTrendPoint[];
  groupBy: ChartGroupBy;
  onGroupByChange: (v: ChartGroupBy) => void;
  isLoading?: boolean;
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${value / 1_000_000}M`;
  if (value >= 1_000) return `${value / 1_000}k`;
  return `${value}`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2332] text-white rounded-xl px-4 py-3 text-sm shadow-lg">
      <div className="font-bold mb-1.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="opacity-75">{p.name}:</span>
          <span className="font-semibold">{formatYAxis(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

const legendItems = [
  { color: "#962DFF", label: "Young Male Aedes" },
  { color: "#FF718B", label: "Old Male Aedes" },
  { color: "#93AAFD", label: "Young Female Aedes" },
];

const GROUP_BY_OPTIONS: { label: string; value: ChartGroupBy }[] = [
  { label: "Year", value: "year" },
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
];

export default function MosquitoTrendChart({ data = [], groupBy, onGroupByChange, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<"Species" | "Age">("Age");

  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-[#1a1a2e]">
          Mosquito Count Trend By Species and Age
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(["Species", "Age"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-medium transition-colors cursor-pointer border-none ${
                  activeTab === tab
                    ? "bg-linear-to-r from-secondary to-primary text-white"
                    : "bg-white text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <select
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as ChartGroupBy)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 cursor-pointer"
          >
            {GROUP_BY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <hr className="border-t border-gray-100 my-3" />

      <div className="h-[360px]">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f0f0f0" strokeWidth={1} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: "none" }} />

              <Line
                type="monotone"
                dataKey="young_male"
                name="Young Male Aedes"
                stroke="#962DFF"
                strokeWidth={2.5}
                strokeDasharray="8 5"
                dot={false}
                activeDot={{ r: 5, fill: "#962DFF", strokeWidth: 0 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="old_male"
                name="Old Male Aedes"
                stroke="#FF718B"
                strokeWidth={2.5}
                strokeDasharray="8 5"
                dot={false}
                activeDot={{ r: 5, fill: "#FF718B", strokeWidth: 0 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="young_female"
                name="Young Female Aedes"
                stroke="#93AAFD"
                strokeWidth={2.5}
                strokeDasharray="8 5"
                dot={false}
                activeDot={{ r: 5, fill: "#93AAFD", strokeWidth: 0 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {legendItems.map(({ color, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-[13px] text-gray-500 bg-white border border-gray-200 rounded-full px-4 py-1.5"
          >
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
