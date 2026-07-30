"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceArea,
} from "recharts";
import Skeleton from "react-loading-skeleton";
import { useChartZoom, ResetZoomButton, zoomAreaProps } from "./useChartZoom";

export type MosquitoMonitoringPoint = {
  xLabel: string;
  tooltipLabel?: string;
  count: number;
};

function SpeechBubbleTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload?: MosquitoMonitoringPoint }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const tooltipLabel = payload?.[0]?.payload?.tooltipLabel ?? label;

  return (
    <div className="relative px-4 py-2.5 rounded-2xl bg-secondary text-white text-sm font-medium shadow-lg">
      <div className="text-white/90 text-xs mb-0.5">{tooltipLabel}</div>
      <div>Count: {payload[0].value}</div>
      {/* Speech bubble tail */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-10 border-t-secondary"
        aria-hidden
      />
    </div>
  );
}

export type MonitoringGroupBy = "day" | "month" | "year";

export default function MosquitoMonitoringChart({
  data = [],
  groupBy,
  onGroupByChange,
  isLoading,
  hideFilter,
}: {
  data?: MosquitoMonitoringPoint[];
  groupBy?: MonitoringGroupBy;
  onGroupByChange?: (value: MonitoringGroupBy) => void;
  isLoading?: boolean;
  hideFilter?: boolean;
}) {
  const zoom = useChartZoom(data, "xLabel");
  // Scale the y-axis to the visible slice so zooming in rescales vertically too.
  const maxCount = Math.max(0, ...zoom.data.map((p) => (typeof p.count === "number" ? p.count : 0)));
  const yMax = Math.max(1, Math.ceil(maxCount * 1.2));
  const tickCount = yMax <= 6 ? yMax + 1 : 6;

  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between border-b border-gray pb-4 items-center mb-6">
        <h2 className="text-sm font-medium tracking-wide text-gray-600">
          MOSQUITO MONITORING
        </h2>

        {!hideFilter && (
          <select
            value={groupBy}
            onChange={(e) => onGroupByChange?.(e.target.value as MonitoringGroupBy)}
            className="border border-gray rounded-lg px-3 py-2.5 text-sm text-text-dark focus:ring-0 focus:outline-none bg-white focus:border-primary"
          >
            <option value="year">Last Year</option>
            <option value="month">Last Month</option>
            <option value="day">Today</option>
          </select>
        )}
      </div>

      {/* Chart — grows to fill the card so it matches the summary cards' height.
          The plot is absolutely positioned rather than a normal-flow child: this
          box gets its 380px from min-height, which leaves `height: auto`, and a
          percentage height (ResponsiveContainer's height="100%") resolves to 0
          against auto. Filling the containing block with inset-0 gives the
          chart a definite height in every layout — without it the chart
          silently disappears wherever the card is not itself height-constrained
          (e.g. the date-range page). */}
      <div className="flex-1 min-h-[380px] relative select-none cursor-crosshair">
        <ResetZoomButton zoom={zoom} />
        <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50/30 rounded-xl">
             <Skeleton width="100%" height="100%" containerClassName="w-full h-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={zoom.data} {...zoom.chartProps}>
              <defs>
                <linearGradient id="mosquitoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1565C0" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1565C0" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 6"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="xLabel"
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, yMax]}
                tickCount={tickCount}
                allowDecimals={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={<SpeechBubbleTooltip />}
                cursor={{ stroke: "#E5E7EB", strokeWidth: 1, strokeDasharray: "4 4" }}
                wrapperStyle={{ outline: "none" }}
              />

              {zoom.refArea && (
                <ReferenceArea {...zoomAreaProps} x1={zoom.refArea.x1} x2={zoom.refArea.x2} />
              )}

              <Area
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#mosquitoGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
        </div>
      </div>
    </div>
  );
}
