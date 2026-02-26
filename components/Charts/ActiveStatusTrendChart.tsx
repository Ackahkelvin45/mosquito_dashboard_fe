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

// ON = 2, OFF = 1 for Y-axis positioning
const data = [
  { month: "Jan", on: 1.6,  off: 1.8 },
  { month: "Feb", on: 1.5,  off: 1.4 },
  { month: "Mar", on: 1.8,  off: 1.5 },
  { month: "Apr", on: 1.85, off: 1.7 },
  { month: "May", on: 1.9,  off: 2.0 },
  { month: "Jun", on: 1.9,  off: 1.95 },
  { month: "Jul", on: 1.3,  off: 1.75 },
  { month: "Aug", on: 1.2,  off: 1.25 },
  { month: "Sep", on: 1.25, off: 1.2  },
  { month: "Oct", on: 1.75, off: 1.8  },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2332] text-white rounded-xl px-4 py-3 text-sm shadow-lg">
      <div className="font-bold mb-1.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: p.color }}
          />
          <span className="opacity-75">{p.name}:</span>
          <span className="font-semibold">{p.value >= 1.7 ? "ON" : "OFF"}</span>
        </div>
      ))}
    </div>
  );
}

const legendItems = [
  { color: "#dc2626", label: "ON" },
  { color: "#16a34a", label: "OFF" },
];

export default function ActiveStatusTrendChart() {
  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-[#1a1a2e]">Active Status Trend</h2>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none cursor-pointer">
          <option>Year</option>
          <option>Month</option>
          <option>Week</option>
        </select>
      </div>

      <hr className="border-t border-gray-100 my-3" />

      {/* Chart */}
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f0f0f0" strokeWidth={1} />

            <XAxis
              dataKey="month"
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />

            <YAxis
              domain={[1, 2.2]}
              ticks={[1.2, 1.4, 1.6, 1.8, 2.0, 2.2]}
              tickFormatter={(v) => (v >= 1.7 ? "ON" : "OFF")}
              tick={{ fill: "#3d4a6b", fontSize: 13, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: "none" }}
              cursor={{ stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "5 5" }}
            />

            {/* Reference lines for ON / OFF */}
            <Line
              type="monotone"
              dataKey="on"
              name="ON"
              stroke="#dc2626"
              strokeWidth={2.5}
              strokeDasharray="10 6"
              dot={false}
              activeDot={{ r: 7, fill: "#dc2626", strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="off"
              name="OFF"
              stroke="#16a34a"
              strokeWidth={2.5}
              strokeDasharray="10 6"
              dot={false}
              activeDot={{ r: 7, fill: "#16a34a", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {legendItems.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ background: color }}
            />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}