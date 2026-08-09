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
import Skeleton from "react-loading-skeleton";

export type SensorStatusGroupBy = "day" | "month" | "year";

export type SensorStatusPoint = {
  xLabel: string;
  tooltipLabel?: string;
  on_count: number;
  off_count: number;
};

function StatusTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: SensorStatusPoint } & Record<string, unknown>>;
}) {
  if (!active || !payload?.length) return null;
  const point = payload?.[0]?.payload;
  if (!point) return null;

  return (
    <div className="px-4 py-2.5 rounded-2xl bg-white text-sm shadow-lg border border-gray-200">
      <div className="text-gray-500 text-xs mb-0.5">{point.tooltipLabel ?? point.xLabel}</div>
      <div className="flex gap-3">
        <span className="text-green-600 font-semibold">On: {point.on_count}</span>
        <span className="text-red-500 font-semibold">Off: {point.off_count}</span>
      </div>
    </div>
  );
}

export default function SensorStatusChart({
  data = [],
  groupBy,
  onGroupByChange,
  isLoading,
  hideFilter,
}: {
  data?: SensorStatusPoint[];
  groupBy?: SensorStatusGroupBy;
  onGroupByChange?: (value: SensorStatusGroupBy) => void;
  isLoading?: boolean;
  hideFilter?: boolean;
}) {
  const [range, setRange] = useState<SensorStatusGroupBy>("month");
  const effectiveRange = groupBy ?? range;

  const maxValue = Math.max(
    0,
    ...data.map((p) => Math.max(p.on_count ?? 0, p.off_count ?? 0))
  );
  const yMax = Math.max(1, Math.ceil(maxValue * 1.2));

  return (
    <div className="bg-white rounded-lg font-raleway shadow-md p-4 sm:p-8 w-full">
      {/* Header */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <div>
          <h2 className="text-base font-semibold ">
            Sensor Status Over Time
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">How many traps were switched on vs off at each point in time</p>
        </div>

        {!hideFilter && (
          <select
            value={effectiveRange}
            onChange={(e) => {
              const next = e.target.value as SensorStatusGroupBy;
              if (onGroupByChange) onGroupByChange(next);
              else setRange(next);
            }}
            className="border border-gray rounded-lg focus:ring-0 focus:outline-none focus:border-primary px-4 py-2 text-sm text-gray-700"
          >
            <option value="year">Last Year</option>
            <option value="month">Last Month</option>
            <option value="day">Today</option>
          </select>
        )}
      </div>

      <div className="border-t border-gray mb-6"></div>

      {/* Chart */}
      <div className="w-full h-[240px] sm:h-[350px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50/30 rounded-xl">
             <Skeleton width="100%" height="100%" />
          </div>
        ) : (
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} />
              <XAxis
                dataKey="xLabel"
                tick={{ fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <YAxis
                domain={[0, yMax]}
                allowDecimals={false}
                tick={{ fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <Tooltip content={<StatusTooltip />} />

              <Line
                type="monotone"
                dataKey="off_count"
                stroke="#EF4444"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="on_count"
                stroke="#22C55E"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">on</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">off</span>
        </div>
      </div>
    </div>
  );
}
