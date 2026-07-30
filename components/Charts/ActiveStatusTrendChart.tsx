"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceArea,
} from "recharts";
import type { ChartGroupBy, SensorStatusPoint } from "@/queries/device/deviceChartsQueries";
import { useChartZoom, ResetZoomButton, zoomAreaProps } from "./useChartZoom";

interface Props {
  data?: SensorStatusPoint[];
  groupBy: ChartGroupBy;
  onGroupByChange: (v: ChartGroupBy) => void;
  isLoading?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  // Values are 0/1 states for a single device — report the state itself rather
  // than a count. Both 0 means the device had not reported yet.
  const on = payload.find((p: any) => p.dataKey === "on_count")?.value ?? 0;
  const off = payload.find((p: any) => p.dataKey === "off_count")?.value ?? 0;
  const state = on ? "ON" : off ? "OFF" : "No data";
  const color = on ? "#16a34a" : off ? "#dc2626" : "#9ca3af";

  return (
    <div className="bg-[#1a2332] text-white rounded-xl px-4 py-3 text-sm shadow-lg">
      <div className="font-bold mb-1.5">{label}</div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
        <span className="opacity-75">Trap:</span>
        <span className="font-semibold">{state}</span>
      </div>
    </div>
  );
}

// Green = ON, red = OFF — matching the dashboard's sensor status chart.
const legendItems = [
  { color: "#16a34a", label: "ON" },
  { color: "#dc2626", label: "OFF" },
];

const GROUP_BY_OPTIONS: { label: string; value: ChartGroupBy }[] = [
  { label: "Year", value: "year" },
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
  { label: "Day", value: "day" },
];

export default function ActiveStatusTrendChart({ data = [], groupBy, onGroupByChange, isLoading }: Props) {
  const zoom = useChartZoom(data);

  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-[#1a1a2e]">Active Status Trend</h2>
        <select
          value={groupBy}
          onChange={(e) => onGroupByChange(e.target.value as ChartGroupBy)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none cursor-pointer"
        >
          {GROUP_BY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <hr className="border-t border-gray-100 my-3" />

      <div className="h-[280px] relative select-none cursor-crosshair">
        <ResetZoomButton zoom={zoom} />
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={zoom.data} margin={{ top: 20, right: 20, left: 10, bottom: 0 }} {...zoom.chartProps}>
              <CartesianGrid vertical={false} stroke="#f0f0f0" strokeWidth={1} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              {/* Single device: each series is a 0/1 state, so pin the axis to
                  [0,1] with just those two ticks instead of a numeric scale. */}
              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={(v: number) => (v === 1 ? "Yes" : "No")}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ outline: "none" }}
                cursor={{ stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "5 5" }}
              />
              {zoom.refArea && (
                <ReferenceArea {...zoomAreaProps} x1={zoom.refArea.x1} x2={zoom.refArea.x2} />
              )}
              {/* `stepAfter`, not `monotone` — the trap holds its state between
                  reports, so the line must step rather than interpolate. */}
              <Line
                type="stepAfter"
                dataKey="off_count"
                name="OFF"
                stroke="#dc2626"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 7, fill: "#dc2626", strokeWidth: 0 }}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                type="stepAfter"
                dataKey="on_count"
                name="ON"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 7, fill: "#16a34a", strokeWidth: 0 }}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-center gap-6 mt-4">
        {legendItems.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
