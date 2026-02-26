"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { useState } from "react";

const data = [
  { region: "Kumasi", value: 30 },
  { region: "Accra", value: 13 },
  { region: "Tamale", value: 18 },
  { region: "Kumasi", value: 15 },
  { region: "Cape coast", value: 26 },
  { region: "Tema", value: 13 },
  { region: "S", value: 21 },
];

export default function MosquitoBarChart() {
  const [range, setRange] = useState("Month");

  return (
    <div className="bg-white rounded-lg  font-raleway shadow-md p-8 w-full ">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className=" font-semibold ">
          Mosquito Count by Region
        </h2>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border border-gray-300 focus:ring-0 focus:outline-none focus:border-primary rounded-xl px-4 py-2 text-gray-700"
        >
          <option>Month</option>
          <option>Week</option>
          <option>Year</option>
        </select>
      </div>

      <div className="border-t mb-6"></div>

      {/* Chart */}
      <div style={{ width: "100%", height:400 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="5 5"
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="region"
              tick={{ fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              fontSize={12}
            />
            <YAxis
              domain={[10, 35]}
              ticks={[10, 20, 30]}
              tick={{ fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                background: "white",
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
              }}
              labelStyle={{ display: "none" }}
              cursor={{ fill: "transparent" }}
            />

            <Bar
              dataKey="value"
              radius={[12, 12, 0, 0]}
              barSize={45}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    "#1565C0"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}