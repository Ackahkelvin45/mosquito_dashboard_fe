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
  { month: "Jan", female: 95000,  male: 48000 },
  { month: "Feb", female: 88000,  male: 90000 },
  { month: "Mar", female: 72000,  male: 85000 },
  { month: "Apr", female: 62000,  male: 55000 },
  { month: "May", female: 68000,  male: 38000 },
  { month: "Jun", female: 16500, male: 35000 },
  { month: "Jul", female: 210000, male: 55000 },
  { month: "Aug", female: 220000, male: 88000 },
  { month: "Sep", female: 130000, male: 75000 },
  { month: "Oct", female: 65000,  male: 40000 },
];

function formatYAxis(value: number): string {
  if (value >= 1000000) return `${value / 1000000}M`;
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
          <span className="font-semibold">{formatYAxis(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

const legendItems = [
  { color: "#f9a8b8", label: "Female" },
  { color: "#166534", label: "Male" },
];

export default function MosquitoGenderChart() {
  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-[#1a1a2e]">
          Mosquito Count by Gender
        </h2>
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
              domain={[0, 550000]}
              ticks={[0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 110000, 120000, 130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000, 210000, 220000, 230000, 240000, 250000, 260000, 270000, 280000, 290000, 300000, 310000, 320000, 330000, 340000, 350000, 360000, 370000, 380000, 390000, 400000, 410000, 420000, 430000, 440000, 450000, 460000, 470000, 480000, 490000, 500000, 510000, 520000, 530000, 540000, 550000]}
            />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: "none" }}
              cursor={{ stroke: "#9ca3af", strokeWidth: 1, strokeDasharray: "5 5" }}
            />

            <Line
              type="monotone"
              dataKey="female"
              name="Female"
              stroke="#f9a8b8"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "#f9a8b8", strokeWidth: 0 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="male"
              name="Male"
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