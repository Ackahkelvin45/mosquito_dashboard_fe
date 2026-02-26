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
  { week: "Week 1", on: 1, off: 1 },
  { week: "Week 1", on: 1.1, off: 1.05 },
  { week: "Week 1", on: 1.0, off: 1.02 },
  { week: "Week 1", on: 0.4, off: 0.45 },
  { week: "Week 2", on: 1.1, off: 0.95 },
  { week: "Week 2", on: 1.05, off: 1.15 },
  { week: "Week 2", on: 0.3, off: 0.4 },
  { week: "Week 3", on: 1.2, off: 1.1 },
  { week: "Week 3", on: 0.5, off: 1.25 },
  { week: "Week 3", on: 1.1, off: 0.4 },
  { week: "Week 4", on: 1.0, off: 1.2 },
  { week: "Week 4", on: 0.35, off: 1.3 },
  { week: "Week 4", on: 1.05, off: 1.2 },
];

export default function SensorStatusChart() {
  const [range, setRange] = useState("Month");

  return (
    <div className="bg-white rounded-lg  font-raleway shadow-md p-8 w-full ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-base  font-semibold ">
          Sensor Status overtime
        </h2>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border border-gray rounded-lg focus:ring-0 focus:outline-none focus:border-primary px-4 py-2 text-gray-700"
        >
          <option>Month</option>
          <option>Week</option>
          <option>Year</option>
        </select>
      </div>

      <div className="border-t border-gray mb-6"></div>

      {/* Chart */}
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="5 5" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              fontSize={12}
            />
            <YAxis
              domain={[0, 1.4]}
              ticks={[0.4, 1]}
              tickFormatter={(value) => (value >= 1 ? "On" : "off")}
              tick={{ fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              fontSize={12}
            />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="off"
              stroke="#EF4444"
              strokeWidth={3}
              dot={false}
            
               
            />
            <Line
              type="monotone"
              dataKey="on"
              stroke="#22C55E"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">off</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">on</span>
        </div>
      </div>
    </div>
  );
}