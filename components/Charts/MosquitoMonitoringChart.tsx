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

const data = [
  { time: "20:00", count: 1.4 },
  { time: "20:10", count: 1.9 },
  { time: "20:20", count: 2.5 },
  { time: "20:30", count: 1.9 },
  { time: "20:40", count: 3.0 },
  { time: "20:50", count: 2.8 },
  { time: "21:00", count: 2.7 },
  { time: "21:10", count: 3.2 },
  { time: "21:20", count: 2.6 },
  { time: "21:30", count: 2.0 },
  { time: "22:00", count: 2.1 },
  { time: "22:30", count: 2.2 },
  { time: "23:00", count: 2.8 },
  { time: "23:10", count: 3.7 },
  { time: "23:20", count: 3.0 },
  { time: "23:40", count: 3.5 },
  { time: "24:00", count: 5.9 },
  { time: "24:10", count: 5.0 },
  { time: "24:20", count: 4.4 },
  { time: "24:30", count: 4.3 },
  { time: "24:40", count: 3.6 },
  { time: "24:50", count: 3.2 },
  { time: "25:00", count: 2.0 },
  { time: "25:10", count: 2.3 },
  { time: "25:20", count: 2.8 },
  { time: "25:30", count: 3.6 },
];

function SpeechBubbleTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="relative px-4 py-2.5 rounded-2xl bg-secondary text-white text-sm font-medium shadow-lg">
      <div className="text-white/90 text-xs mb-0.5">{label}</div>
      <div>Count: {payload[0].value}</div>
      {/* Speech bubble tail */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-10 border-t-secondary"
        aria-hidden
      />
    </div>
  );
}

export default function MosquitoMonitoringChart() {
  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="flex justify-between border-b border-gray pb-4 items-center mb-6">
        <h2 className="text-sm font-medium tracking-wide text-gray-600">
          MOSQUITO MONITORING
        </h2>

        <select className="border border-gray rounded-lg px-3 py-2.5  text-sm text-text-dark focus:ring-0 focus:outline-none  bg-white focus:border-primary">
          <option>Hour</option>
          <option>Day</option>
          <option>Week</option>
        </select>
      </div>

      {/* Chart */}
      <div className="h-[380px]">
        <ResponsiveContainer width="100%"   height="100%">
          <AreaChart data={data}>
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
              dataKey="time"
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[0, 10]}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              content={<SpeechBubbleTooltip />}
              cursor={{ stroke: "#E5E7EB", strokeWidth: 1, strokeDasharray: "4 4" }}
              wrapperStyle={{ outline: "none" }}
            />

            <Area
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#mosquitoGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}