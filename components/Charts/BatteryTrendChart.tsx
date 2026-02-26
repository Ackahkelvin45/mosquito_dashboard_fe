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

const data = [
  { month: "Jan", battery: 280 },
  { month: "Feb", battery: 388  },
  { month: "Mar", battery: 205 },
  { month: "Apr", battery: 185 },
  { month: "May", battery: 368  },
  { month: "Jun", battery: 490  },
  { month: "Jul", battery: 100 },
  { month: "Aug", battery: 148 },
  { month: "Sep", battery: 110 },
  { month: "Oct", battery: 65  },
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
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function BatteryTrendChart() {
  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-[#1a1a2e]">Battery Trend</h2>
        <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none cursor-pointer">
          <option>Year</option>
          <option>Month</option>
          <option>Week</option>
        </select>
      </div>

      <hr className="border-t border-gray-100 my-3" />

      {/* Chart */}
      <div className="h-[360px]">
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
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 650]}
              ticks={[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600]}
            />

            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: "none" }}
              cursor={{ stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "5 5" }}
            />

            <Line
              type="monotone"
              dataKey="battery"
              name="Battery"
              stroke="#84840a"
              strokeWidth={2.5}
              strokeDasharray="10 6"
              dot={false}
              activeDot={{ r: 7, fill: "#84840a", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}