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
  { month: "Jan", external: 95,  internal: 50  },
  { month: "Feb", external: 90,  internal: 46  },
  { month: "Mar", external: 200,  internal: 48  },
  { month: "Apr", external: 78,  internal: 75  },
  { month: "May", external: 180,  internal: 200 },
  { month: "Jun", external: 150, internal: 400 },
  { month: "Jul", external: 160, internal: 110 },
  { month: "Aug", external: 155, internal: 30  },
  { month: "Sep", external: 145, internal: 350  },
  { month: "Oct", external: 65,  internal: 110 },
];

function formatYAxis(value: number): string {
  if (value === 0) return "0";
  if (value >= 1000) return `${value / 1000}k`;
  return `${value}`;
}

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

const legendItems = [
  { color: "#bef264", label: "External" },
  { color: "#166534", label: "Internal" },
];

export default function TemperatureTrendChart() {
  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-[#1a1a2e]">Temperature Trend</h2>
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
              tickFormatter={formatYAxis}
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 600]}
              ticks={[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500]}
            />

            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: "none" }}
              cursor={{ stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "5 5" }}
            />

            <Line
              type="monotone"
              dataKey="external"
              name="External"
              stroke="#a3e635"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#a3e635", strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="internal"
              name="Internal"
              stroke="#166534"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#166534", strokeWidth: 0 }}
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