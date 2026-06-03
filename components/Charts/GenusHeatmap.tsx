"use client";

import { useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";
import type { DashboardGroupBy, GenusHeatmapCell } from "@/queries/dashboard/dashboardQueries";

interface Props {
  genera?: string[];
  buckets?: string[];
  data?: GenusHeatmapCell[];
  groupBy: DashboardGroupBy;
  onGroupByChange: (v: DashboardGroupBy) => void;
  isLoading?: boolean;
}

const GROUP_BY_OPTIONS: DashboardGroupBy[] = ["hour", "day", "week", "month"];

// Blend white → primary based on the count's share of the max cell value.
function cellStyle(count: number, max: number): React.CSSProperties {
  if (max <= 0 || count <= 0) return { background: "#F4F6FB", color: "#9ca3af" };
  const ratio = count / max;
  return {
    background: `rgba(21, 101, 192, ${0.12 + ratio * 0.78})`,
    color: ratio > 0.5 ? "#ffffff" : "#1a1a2e",
  };
}

export default function GenusHeatmap({
  genera = [],
  buckets = [],
  data = [],
  groupBy,
  onGroupByChange,
  isLoading,
}: Props) {
  const [range, setRange] = useState<DashboardGroupBy>(groupBy);
  const effectiveRange = groupBy ?? range;

  // lookup[genus][label] = count
  const { lookup, max } = useMemo(() => {
    const map: Record<string, Record<string, number>> = {};
    let maxVal = 0;
    data.forEach((cell) => {
      if (!map[cell.genus]) map[cell.genus] = {};
      map[cell.genus][cell.label] = cell.count;
      if (cell.count > maxVal) maxVal = cell.count;
    });
    return { lookup: map, max: maxVal };
  }, [data]);

  const hasData = genera.length > 0 && buckets.length > 0;

  return (
    <div className="bg-white rounded-lg font-raleway shadow-md p-6 sm:p-8 w-full">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-semibold">Genus Distribution Heatmap</h2>
          <p className="text-xs text-gray-400 mt-0.5">Mosquito counts by genus over time</p>
        </div>

        <select
          value={effectiveRange}
          onChange={(e) => {
            const next = e.target.value as DashboardGroupBy;
            setRange(next);
            onGroupByChange(next);
          }}
          className="border border-gray rounded-lg focus:ring-0 focus:outline-none focus:border-primary px-4 py-2 text-gray-700 text-sm"
        >
          {GROUP_BY_OPTIONS.map((o) => (
            <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="border-t border-gray mb-6" />

      {isLoading ? (
        <Skeleton height={300} />
      ) : !hasData ? (
        <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">
          No genus data available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 text-left text-xs font-semibold text-gray-500 px-2 py-1">
                  Genus
                </th>
                {buckets.map((b) => (
                  <th key={b} className="text-[11px] font-medium text-gray-400 px-1 py-1 whitespace-nowrap text-center min-w-[44px]">
                    {b}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {genera.map((genus) => (
                <tr key={genus}>
                  <td className="sticky left-0 bg-white z-10 text-xs font-medium text-gray-700 px-2 py-1 whitespace-nowrap">
                    {genus}
                  </td>
                  {buckets.map((b) => {
                    const count = lookup[genus]?.[b] ?? 0;
                    return (
                      <td
                        key={b}
                        title={`${genus} • ${b}: ${count}`}
                        className="text-center text-xs font-semibold rounded-md h-10 min-w-[44px]"
                        style={cellStyle(count, max)}
                      >
                        {count}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      {hasData && !isLoading && (
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-400">
          <span>0</span>
          <div className="h-2.5 w-32 rounded-full" style={{ background: "linear-gradient(to right, #F4F6FB, rgba(21,101,192,0.9))" }} />
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
