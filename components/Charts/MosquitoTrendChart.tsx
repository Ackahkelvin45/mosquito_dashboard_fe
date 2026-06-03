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
import { useMemo } from "react";
import type { ChartGroupBy, MosquitoTrendPoint } from "@/queries/device/deviceChartsQueries";

interface Props {
  data?: MosquitoTrendPoint[];
  /** The dynamic series keys ("{age_group}_{sex}") to render. */
  seriesKeys?: string[];
  groupBy: ChartGroupBy;
  onGroupByChange: (v: ChartGroupBy) => void;
  isLoading?: boolean;
}

// A repeating palette so any number of dynamic series get a stable, distinct colour.
const PALETTE = [
  "#962DFF",
  "#FF718B",
  "#93AAFD",
  "#3AC35C",
  "#FFB648",
  "#1565C0",
  "#E63946",
  "#2A9D8F",
  "#9C6ADE",
  "#F4A261",
];

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${value / 1_000_000}M`;
  if (value >= 1_000) return `${value / 1_000}k`;
  return `${value}`;
}

// "adult_female" -> "Adult Female"
function humanizeKey(key: string): string {
  return key
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type TooltipEntry = { dataKey?: string | number; name?: string; value?: number; color?: string };

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2332] text-white rounded-xl px-4 py-3 text-sm shadow-lg">
      <div className="font-bold mb-1.5">{label}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="opacity-75">{p.name}:</span>
          <span className="font-semibold">{formatYAxis(p.value ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}

const GROUP_BY_OPTIONS: { label: string; value: ChartGroupBy }[] = [
  { label: "Year", value: "year" },
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
  { label: "Day", value: "day" },
];

export default function MosquitoTrendChart({
  data = [],
  seriesKeys,
  groupBy,
  onGroupByChange,
  isLoading,
}: Props) {
  // Resolve the keys to render: prefer the explicit list, else derive from the data.
  const keys = useMemo(() => {
    if (seriesKeys && seriesKeys.length > 0) return seriesKeys;
    const set = new Set<string>();
    data.forEach((p) => Object.keys(p.series ?? {}).forEach((k) => set.add(k)));
    return Array.from(set).sort();
  }, [seriesKeys, data]);

  // Recharts needs each series value as a top-level field, so flatten the series map.
  const chartData = useMemo(
    () =>
      data.map((p) => ({
        label: p.label,
        timestamp: p.timestamp,
        ...(p.series ?? {}),
      })),
    [data]
  );

  const colorFor = (key: string) => PALETTE[keys.indexOf(key) % PALETTE.length];

  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-2">
        <h2 className="text-base font-bold text-[#1a1a2e]">
          Mosquito Count Trend By Age and Sex
        </h2>

        <div className="flex items-center gap-3">
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
        ) : keys.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
            No trend data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
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

              {keys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={humanizeKey(key)}
                  stroke={colorFor(key)}
                  strokeWidth={2.5}
                  strokeDasharray="8 5"
                  dot={false}
                  activeDot={{ r: 5, fill: colorFor(key), strokeWidth: 0 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {keys.map((key) => (
          <div
            key={key}
            className="flex items-center gap-2 text-[13px] text-gray-500 bg-white border border-gray-200 rounded-full px-4 py-1.5"
          >
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: colorFor(key) }} />
            {humanizeKey(key)}
          </div>
        ))}
      </div>
    </div>
  );
}
