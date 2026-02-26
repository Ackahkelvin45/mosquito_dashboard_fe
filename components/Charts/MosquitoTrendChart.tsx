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

const data = [
  { month: "JAN", youngMale: 0,       oldMale: 0,        youngFemale: 0 },
  { month: "FEB", youngMale: 1200000, oldMale: 450000,   youngFemale: 520000 },
  { month: "MAR", youngMale: 1350000, oldMale: 900000,   youngFemale: 48000 },
  { month: "APR", youngMale: 800000,  oldMale: 500000,  youngFemale: 90000 },
  { month: "MAY", youngMale: 2200200,  oldMale: 4900000,  youngFemale: 650300 },
  { month: "JUN", youngMale: 200000,  oldMale: 240000,   youngFemale: 58000 },
  { month: "JUL", youngMale: 10000,   oldMale: 200000,   youngFemale: 35000 },
  { month: "AUG", youngMale: 2555100,    oldMale: 484000,    youngFemale: 30000 },
  { month: "SEP", youngMale: 480000,  oldMale: 500500,    youngFemale: 380000 },
  { month: "OCT", youngMale: 490000,  oldMale: 420000,   youngFemale: 420000 },
  { month: "NOV", youngMale: 200000,  oldMale: 750000,   youngFemale: 120000 },
  { month: "DEC", youngMale: 5000,    oldMale: 650000,   youngFemale: 5000 },
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
  { color: "#962DFF", label: "Young Male Aedes" },
  { color: "#FF718B", label: "Old male Aedes" },
  { color: "#93AAFD", label: "Young Female aedes" },
];

export default function MosquitoTrendChart() {
  const [activeTab, setActiveTab] = useState<"Species" | "Age">("Age");

  return (
    <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-[#1a1a2e]">
          Mosquito Count Trend By Species and Age
        </h2>

        <div className="flex items-center gap-3">
          {/* Species / Age Toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            {(["Species", "Age"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-medium transition-colors cursor-pointer border-none ${
                  activeTab === tab
                    ? "bg-linear-to-r from-secondary to-primary text-white"
                    : "bg-white text-gray-400"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Year Dropdown */}
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:border-gray-400 cursor-pointer">
            <option>Year</option>
            <option>Month</option>
            <option>Week</option>
          </select>
        </div>
      </div>

      <hr className="border-t border-gray-100 my-3" />

      {/* Chart */}
      <div className="h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
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
              domain={[0, 5500000]}
              ticks={[0, 50000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 550000, 600000, 650000, 700000, 750000, 800000, 850000, 900000, 950000, 1000000, 1050000, 1100000, 1150000, 1200000, 1250000, 1300000, 1350000, 1400000, 1450000, 1500000, 1550000, 1600000, 1650000, 1700000, 1750000, 1800000, 1850000, 1900000, 1950000, 2000000, 2050000, 2100000, 2150000, 2200000, 2250000, 2300000, 2350000, 2400000, 2450000, 2500000, 2550000, 2600000, 2650000, 2700000, 2750000, 2800000, 2850000, 2900000, 2950000, 3000000, 3050000, 3100000, 3150000, 3200000, 3250000, 3300000, 3350000, 3400000, 3450000, 3500000, 3550000, 3600000, 3650000, 3700000, 3750000, 3800000, 3850000, 3900000, 3950000, 4000000, 4050000, 4100000, 4150000, 4200000, 4250000, 4300000, 4350000, 4400000, 4450000, 4500000, 4550000, 4600000, 4650000, 4700000, 4750000, 4800000, 4850000, 4900000, 4950000, 5000000, 5050000, 5100000, 5150000, 5200000, 5250000, 5300000, 5350000, 5400000, 5450000, 5500000]}
            />
            <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: "none" }} />

            <Line
              type="monotone"
              dataKey="youngMale"
              name="Young Male Aedes"
              stroke="#962DFF"
              strokeWidth={2.5}
              strokeDasharray="8 5"
              dot={false}
              activeDot={{ r: 5, fill: "#962DFF", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="oldMale"
              name="Old male Aedes"
              stroke="#FF718B"
              strokeWidth={2.5}
              strokeDasharray="8 5"
              dot={false}
              activeDot={{ r: 5, fill: "#FF718B", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="youngFemale"
              name="Young Female aedes"
              stroke="#93AAFD"
              strokeWidth={2.5}
              strokeDasharray="8 5"
              dot={false}
              activeDot={{ r: 5, fill: "#93AAFD", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        {legendItems.map(({ color, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 text-[13px] text-gray-500 bg-white border border-gray-200 rounded-full px-4 py-1.5"
          >
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