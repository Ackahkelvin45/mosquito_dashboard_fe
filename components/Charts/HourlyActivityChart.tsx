"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import type { DashboardHourlyActivity } from "@/queries/dashboard/dashboardQueries";

export type HourlyGroupBy = "day" | "month" | "year";

// Fixed genus → color assignment (never cycled): identity keeps its hue no
// matter which genera are present. Palette validated for CVD separation and
// contrast on white (dataviz six-checks). Grey is reserved for unknown-ish
// buckets — deliberately recessive, it is absence of identity, not a series.
const GENUS_COLORS: Record<string, string> = {
  anopheles: "#1565C0",
  aedes: "#C96A1B",
  culex: "#1F9D82",
  mixed: "#7E6BB5",
};
const FALLBACK_COLOR = "#9CA3AF"; // unsure / unknown / anything unexpected

const genusColor = (genus: string) => GENUS_COLORS[genus.toLowerCase()] ?? FALLBACK_COLOR;
const genusLabel = (genus: string) =>
  genus.charAt(0).toUpperCase() + genus.slice(1).toLowerCase();

const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

export default function HourlyActivityChart({
  activity,
  groupBy,
  onGroupByChange,
  isLoading,
  hideFilter,
}: {
  activity?: DashboardHourlyActivity;
  groupBy?: HourlyGroupBy;
  onGroupByChange?: (value: HourlyGroupBy) => void;
  isLoading?: boolean;
  hideFilter?: boolean;
}) {
  const [range, setRange] = useState<HourlyGroupBy>("month");
  const effectiveRange = groupBy ?? range;

  const genera = activity?.genera ?? [];
  // Recharts wants flat keys: {hour, label, aedes: 2, anopheles: 1, ...}
  const chartData = (activity?.data ?? []).map((p) => ({
    hour: p.hour,
    label: p.label,
    total: p.total,
    ...p.by_genus,
  }));
  const hasData = (activity?.total ?? 0) > 0;

  return (
    <div className="bg-white rounded-lg font-raleway p-3 border border-gray-200 w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">
            Mosquito Activity by Time of Day
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            When detections happen across the day (UTC)
            {hasData && activity?.peak_hour != null && (
              <> · peak at <span className="font-semibold text-gray-600">{formatHour(activity.peak_hour)}</span></>
            )}
          </p>
        </div>

        {!hideFilter && (
          <select
            value={effectiveRange}
            onChange={(e) => {
              const next = e.target.value as HourlyGroupBy;
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

      <div className="flex-1 min-h-[220px]">
        {isLoading ? (
          <Skeleton height={220} />
        ) : !hasData ? (
          <div className="h-full min-h-[220px] flex items-center justify-center text-sm text-gray-400">
            No detections in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <BarChart data={chartData} barCategoryGap="18%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#6B7280" }}
                tickLine={false}
                axisLine={{ stroke: "#E5E7EB" }}
                interval={2}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10, fill: "#6B7280" }}
                tickLine={false}
                axisLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: "rgba(107,114,128,0.08)" }}
                formatter={(value, name) => [String(value ?? 0), genusLabel(String(name))]}
                labelFormatter={(label) => `Hour ${label}`}
              />
              {genera.length > 1 && (
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{genusLabel(String(value))}</span>
                  )}
                  iconType="circle"
                  iconSize={8}
                />
              )}
              {genera.map((genus) => (
                <Bar
                  key={genus}
                  dataKey={genus}
                  stackId="hour"
                  fill={genusColor(genus)}
                  stroke="#FFFFFF"
                  strokeWidth={1}
                  maxBarSize={26}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
