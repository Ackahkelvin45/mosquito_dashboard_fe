"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceArea,
} from "recharts";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import type { DashboardGroupBy, CorrelationPoint } from "@/queries/dashboard/dashboardQueries";
import { useChartZoom, ResetZoomButton, zoomAreaProps } from "./useChartZoom";

interface Props {
  data?: CorrelationPoint[];
  temperatureCorrelation?: number | null;
  humidityCorrelation?: number | null;
  groupBy?: DashboardGroupBy;
  onGroupByChange?: (v: DashboardGroupBy) => void;
  isLoading?: boolean;
  hideFilter?: boolean;
}

// Pearson r interpretation for a quick human-readable hint.
function describeCorrelation(r: number | null | undefined): string {
  if (r === null || r === undefined) return "Not enough data";
  const a = Math.abs(r);
  const strength = a >= 0.7 ? "strong" : a >= 0.4 ? "moderate" : a >= 0.2 ? "weak" : "negligible";
  const dir = r > 0 ? "positive" : r < 0 ? "negative" : "no";
  return `${strength} ${dir} correlation`;
}

type TooltipEntry = { dataKey?: string | number; name?: string; value?: number | null; color?: string };

function CorrelationTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-4 py-2.5 rounded-2xl bg-white text-sm shadow-lg border border-gray-200">
      <div className="text-gray-500 text-xs mb-1">{label}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold">{p.value ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

function CorrelationBadge({ label, r, color }: { label: string; r: number | null | undefined; color: string }) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-100 px-4 py-2.5 bg-gray-50/50">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-lg font-bold" style={{ color }}>
        {r === null || r === undefined ? "—" : r.toFixed(3)}
      </span>
      <span className="text-[11px] text-gray-400">{describeCorrelation(r)}</span>
    </div>
  );
}

const GROUP_BY_OPTIONS: { value: DashboardGroupBy; label: string }[] = [
  { value: "year", label: "Last Year" },
  { value: "month", label: "Last Month" },
  { value: "day", label: "Today" },
];

export default function CorrelationChart({
  data = [],
  temperatureCorrelation,
  humidityCorrelation,
  groupBy,
  onGroupByChange,
  isLoading,
  hideFilter,
}: Props) {
  const [range, setRange] = useState<DashboardGroupBy>(groupBy ?? "month");
  const effectiveRange = groupBy ?? range;
  const zoom = useChartZoom(data);

  return (
    <div className="bg-white rounded-lg font-raleway shadow-md p-6 sm:p-8 w-full">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-semibold">Mosquito Count vs Temperature &amp; Humidity</h2>
          <p className="text-xs text-gray-400 mt-0.5">Correlation with external sensor readings</p>
        </div>

        {!hideFilter && (
          <select
            value={effectiveRange}
            onChange={(e) => {
              const next = e.target.value as DashboardGroupBy;
              setRange(next);
              onGroupByChange?.(next);
            }}
            className="border border-gray rounded-lg focus:ring-0 focus:outline-none focus:border-primary px-4 py-2 text-gray-700 text-sm"
          >
            {GROUP_BY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <CorrelationBadge label="Temperature (Pearson r)" r={temperatureCorrelation} color="#EF4444" />
        <CorrelationBadge label="Humidity (Pearson r)" r={humidityCorrelation} color="#1565C0" />
      </div>

      <div className="border-t border-gray mb-6" />

      <div className="relative select-none cursor-crosshair" style={{ width: "100%", height: 340 }}>
        <ResetZoomButton zoom={zoom} />
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50/30 rounded-xl">
            <Skeleton width="100%" height="100%" />
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            No correlation data available.
          </div>
        ) : (
          <ResponsiveContainer>
            <ComposedChart data={zoom.data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} {...zoom.chartProps}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                fontSize={12}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                fontSize={12}
              />
              <Tooltip content={<CorrelationTooltip />} />

              {zoom.refArea && (
                <ReferenceArea
                  {...zoomAreaProps}
                  yAxisId="left"
                  x1={zoom.refArea.x1}
                  x2={zoom.refArea.x2}
                />
              )}

              <Bar yAxisId="left" dataKey="mosquito_count" name="Mosquito Count" fill="#93AAFD" radius={[4, 4, 0, 0]} barSize={18} />
              <Line yAxisId="right" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#EF4444" strokeWidth={2.5} dot={false} connectNulls />
              <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#1565C0" strokeWidth={2.5} dot={false} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-center gap-6 mt-6 flex-wrap">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: "#93AAFD" }} /><span className="text-gray-600 text-sm">Mosquito Count</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} /><span className="text-gray-600 text-sm">Temperature</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: "#1565C0" }} /><span className="text-gray-600 text-sm">Humidity</span></div>
      </div>
    </div>
  );
}
