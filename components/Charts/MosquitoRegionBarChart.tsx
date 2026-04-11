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
import Skeleton from "react-loading-skeleton";

export type RegionGroupBy = "hour" | "day" | "week" | "month";

export type MosquitoRegionPoint = {
  region: string;
  count: number;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: MosquitoRegionPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  return (
    <div className="px-4 py-2 bg-white border border-gray-100 rounded-lg shadow-sm">
      <p className="text-xs text-gray-500 mb-1 font-mulish font-bold uppercase tracking-wider">{data.region}</p>
      <p className="text-sm font-bold text-gray-900 font-mulish">{data.count.toLocaleString()} Mosquitoes</p>
    </div>
  );
}

export default function MosquitoBarChart({
  data = [],
  groupBy,
  onGroupByChange,
  isLoading,
}: {
  data?: MosquitoRegionPoint[];
  groupBy?: RegionGroupBy;
  onGroupByChange?: (value: RegionGroupBy) => void;
  isLoading?: boolean;
}) {
  const [range, setRange] = useState<RegionGroupBy>("month");
  const effectiveRange = groupBy ?? range;

  return (
    <div className="bg-white rounded-lg font-raleway p-8 border   min-h-[550px]  border-gray-100 shadow-md w-full">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-sm text-gray-700 font-semibold tracking-wide uppercase">
          Mosquito Presence by Region
        </h2>

        <select
          value={effectiveRange}
          onChange={(e) => {
            const next = e.target.value as RegionGroupBy;
            if (onGroupByChange) onGroupByChange(next);
            else setRange(next);
          }}
          className="border border-gray rounded-lg focus:ring-0 focus:outline-none focus:border-primary px-4 py-2 text-sm bg-white"
        >
          <option value="hour">Hour</option>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>

      <div className="h-[410px]">
        {isLoading ? (
          <div className="w-full h-full flex items-end gap-4 px-4 bg-gray-50/30 rounded-xl">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton width="100%" height={Math.random() * 200 + 50} />
                <Skeleton width="60%" height={10} />
              </div>
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              barGap={24}
            >
              <CartesianGrid
                strokeDasharray="4 6"
                vertical={false}
                stroke="#F1F1F1"
              />
              <XAxis
                dataKey="region"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#F9FAFB" }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                barSize={32}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill="#1565C0"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
