"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartGroupBy, MosquitoCountPoint } from "@/queries/device/deviceChartsQueries";

interface Props {
  data?: MosquitoCountPoint[];
  groupBy: ChartGroupBy;
  onGroupByChange: (v: ChartGroupBy) => void;
  isLoading?: boolean;
}

function SpeechBubbleTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="relative">
      <div className="relative min-w-[110px] rounded-xl bg-[#1a2332] px-4 py-2 text-center text-white shadow-lg">
        <div className="mb-1 text-[11px] opacity-70">total count</div>
        <div className="text-xl font-bold">
          {payload[0].value.toLocaleString()}
        </div>
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 border-y-8 border-y-transparent border-l-8 border-l-[#1a2332]" />
      </div>
    </div>
  );
}

const GROUP_BY_OPTIONS: { label: string; value: ChartGroupBy }[] = [
  { label: "Year", value: "year" },
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
];

export default function MosquitoCountChart({ data = [], groupBy, onGroupByChange, isLoading }: Props) {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">
          Mosquito Count Over Time
        </h2>

        <select
          value={groupBy}
          onChange={(e) => onGroupByChange(e.target.value as ChartGroupBy)}
          className="cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-sm text-slate-900 outline-none focus:border-green-500"
        >
          {GROUP_BY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="h-[320px]">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-gray-100" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="mosquitoGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} stroke="#f1f5f9" strokeWidth={1} />

              <XAxis
                dataKey="label"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={<SpeechBubbleTooltip />}
                cursor={{ stroke: "#16a34a", strokeWidth: 1.5 }}
                wrapperStyle={{ outline: "none" }}
              />

              <Area
                type="monotone"
                dataKey="count"
                stroke="#15803d"
                strokeWidth={2.5}
                fill="url(#mosquitoGreen)"
                dot={false}
                activeDot={{ r: 6, fill: "#15803d", strokeWidth: 0 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
