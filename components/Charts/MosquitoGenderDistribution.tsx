"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const data = [
  { name: "Male", value: 200, color: "#3DBB5D" },
  { name: "Female", value: 142, color: "#F04362" },
];

const total = data.reduce((acc, item) => acc + item.value, 0);

export default function MosquitoGenderDistribution() {
  return (
    <div className="bg-white rounded-lg font-raleway  p-3 border border-gray-200 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm  font-semibold text-gray-800">
          Mosquito Gender Distribution
        </h2>

        <select className="border border-gray  focus:ring-0 focus:outline-none focus:border-primary rounded-xl px-4 py-2 text-sm  bg-white">
          <option>Hour</option>
          <option>Day</option>
          <option>Week</option>
        </select>
      </div>

      <hr className="mb-8 border-gray-200" />

      <div className="flex items-center justify-between">
        {/* Legend */}
        <div className="space-y-8">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm font-medium text-gray-700 ">
                {item.name}
              </span>
              <span className="text-xs text-gray-400">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div className="w-[350px] h-[400px] relative">
          <ResponsiveContainer>
            <PieChart>
              <Tooltip
                formatter={(value?: number, name?: string) => {
                  const num = value ?? 0
                  return [
                    `${num} (${Math.round((num / total) * 100)}%)`,
                    name ?? '',
                  ]
                }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  fontSize: "12px",
                }}
              />

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={0}
                outerRadius={100}
                paddingAngle={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

      
        </div>
      </div>
    </div>
  );
}