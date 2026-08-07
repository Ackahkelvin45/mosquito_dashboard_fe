"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useMemo, useState } from "react";
import Skeleton from "react-loading-skeleton";

export type RegionGroupBy = "day" | "month" | "year";

export type MosquitoRegionCommunity = {
  community: string;
  count: number;
};

export type MosquitoRegionPoint = {
  region: string;
  count: number;
  /** Per-community breakdown; when absent the bar is drawn as a single block. */
  communities?: MosquitoRegionCommunity[];
};

// Validated categorical palette — these eight hues clear the colourblind and
// normal-vision separation floors for ADJACENT marks, which is exactly what
// stacked segments are.
const PALETTE = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

// Stable slot for a community name — the same name always starts from the same
// hue, whatever else is in the response. Deriving the slot from the name rather
// than from its index is what stops a region/date filter from repainting the
// communities that survive it.
function hueSlot(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % PALETTE.length;
}

/**
 * Assign a colour to every community.
 *
 * A community belongs to exactly one region, so two communities are only ever
 * seen side by side when they share a bar — that is the only place their colours
 * are required to differ. Each community starts from its own name-derived hue
 * (stable across filters), and if two communities in the SAME region land on the
 * same hue the later one steps to the next free slot. So all eight hues stay in
 * play, no community is ever folded into an "Other" bucket, and no bar shows the
 * same fill twice.
 */
function buildColorMap(
  communities: string[],
  points: MosquitoRegionPoint[]
): Record<string, string> {
  const regionOf = new Map<string, string>();
  points.forEach((p) => {
    (p.communities ?? []).forEach((c) => regionOf.set(c.community, p.region));
  });

  const colors: Record<string, string> = {};
  // Hues already spent inside each region, so a bar never repeats a fill.
  const usedInRegion = new Map<string, Set<string>>();

  // Alphabetical (the order the API sends) keeps collision-stepping deterministic.
  [...communities].sort().forEach((name) => {
    const region = regionOf.get(name) ?? "";
    const used = usedInRegion.get(region) ?? new Set<string>();
    const start = hueSlot(name);

    // Walk from this community's own slot until a hue is free in its region.
    let color = PALETTE[start];
    for (let step = 0; step < PALETTE.length; step += 1) {
      const candidate = PALETTE[(start + step) % PALETTE.length];
      if (!used.has(candidate)) {
        color = candidate;
        break;
      }
    }

    used.add(color);
    usedInRegion.set(region, used);
    colors[name] = color;
  });

  return colors;
}

type StackRow = Record<string, string | number>;

// Axis labels only. The tooltip and legend keep the full name.
function shortenRegion(name: string): string {
  return String(name).replace(/\s+Region$/i, "");
}

function CustomTooltip({
  active,
  payload,
  label,
  colors,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; dataKey?: string | number }>;
  label?: string;
  colors: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;

  // Only communities that actually contributed to this bar.
  const rows = payload
    .filter((p) => typeof p.value === "number" && p.value > 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const total = rows.reduce((sum, p) => sum + (p.value ?? 0), 0);

  return (
    <div className="px-4 py-3 bg-white border border-gray-100 rounded-lg shadow-md sm:min-w-[210px] max-w-[85vw]">
      <p className="text-xs text-gray-500 mb-0.5 font-mulish font-bold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900 font-mulish mb-2">
        {total.toLocaleString()} Mosquitoes
      </p>
      <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
        {rows.map((p) => {
          const name = String(p.dataKey ?? p.name ?? "");
          return (
            <div key={name} className="flex items-center gap-2 text-xs">
              <span
                className="w-2 h-2 rounded-sm inline-block shrink-0"
                style={{ background: colors[name] }}
              />
              <span className="font-semibold text-gray-900 tabular-nums">
                {(p.value ?? 0).toLocaleString()}
              </span>
              <span className="text-gray-500 truncate">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MosquitoBarChart({
  data = [],
  communities,
  groupBy,
  onGroupByChange,
  isLoading,
  hideFilter,
}: {
  data?: MosquitoRegionPoint[];
  /** Every community in the response, alphabetical — the stable colour order. */
  communities?: string[];
  groupBy?: RegionGroupBy;
  onGroupByChange?: (value: RegionGroupBy) => void;
  isLoading?: boolean;
  hideFilter?: boolean;
}) {
  const [range, setRange] = useState<RegionGroupBy>("month");
  const effectiveRange = groupBy ?? range;

  // Prefer the API's stable ordering; fall back to deriving it from the points
  // so the chart still stacks if only `data` is supplied.
  const communityKeys = useMemo(() => {
    if (communities && communities.length > 0) return communities;
    const set = new Set<string>();
    data.forEach((p) => (p.communities ?? []).forEach((c) => set.add(c.community)));
    return Array.from(set).sort();
  }, [communities, data]);

  const colors = useMemo(() => buildColorMap(communityKeys, data), [communityKeys, data]);

  // Recharts stacks need each community as a top-level field on the row.
  const rows = useMemo<StackRow[]>(
    () =>
      data.map((p) => {
        const row: StackRow = { region: p.region, __total: p.count };
        (p.communities ?? []).forEach((c) => {
          row[c.community] = c.count;
        });
        return row;
      }),
    [data]
  );

  // No community detail (older API, or every device missing a community) —
  // fall back to one flat bar per region rather than rendering nothing.
  const stacked = communityKeys.length > 0;

  return (
    <div className="bg-white rounded-lg font-raleway p-4 sm:p-8 border sm:min-h-[550px] border-gray-100 shadow-md w-full flex flex-col">
      <div className="flex flex-wrap gap-3 justify-between items-start mb-6 sm:mb-10">
        <div>
          <h2 className="text-sm text-gray-700 font-semibold tracking-wide uppercase">
            Mosquito Presence by Region
          </h2>
          {stacked && (
            <p className="text-xs text-gray-400 mt-1 normal-case tracking-normal">
              Each bar is split by the communities monitored in that region
            </p>
          )}
        </div>

        {!hideFilter && (
          <select
            value={effectiveRange}
            onChange={(e) => {
              const next = e.target.value as RegionGroupBy;
              if (onGroupByChange) onGroupByChange(next);
              else setRange(next);
            }}
            className="border border-gray rounded-lg focus:ring-0 focus:outline-none focus:border-primary px-4 py-2 text-sm bg-white"
          >
            <option value="year">Last Year</option>
            <option value="month">Last Month</option>
            <option value="day">Today</option>
          </select>
        )}
      </div>

      <div className="h-[300px] sm:h-[410px]">
        {isLoading ? (
          <div className="w-full h-full flex items-end gap-4 px-4 bg-gray-50/30 rounded-xl">
            {[220, 180, 140, 110, 80].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton width="100%" height={h} />
                <Skeleton width="60%" height={10} />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            No regional data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#F1F1F1" />
              <XAxis
                dataKey="region"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
                // Every tick must show — dropping regions from the axis would
                // leave unlabelled bars. "Region" is on every name and so
                // carries no information; stripping it plus angling the labels
                // is what lets all 16 fit, even on narrow plots.
                interval={0}
                angle={-60}
                textAnchor="end"
                height={70}
                tickFormatter={shortenRegion}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip
                content={<CustomTooltip colors={colors} />}
                cursor={{ fill: "#F9FAFB" }}
              />

              {stacked ? (
                communityKeys.map((key) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key}
                    stackId="region"
                    fill={colors[key]}
                    maxBarSize={38}
                    // A 2px surface-coloured edge keeps adjacent segments from
                    // bleeding into one another.
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))
              ) : (
                <Bar dataKey="__total" name="Mosquitoes" fill={PALETTE[0]} maxBarSize={38} radius={[6, 6, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend — identity never rests on colour alone. */}
      {stacked && !isLoading && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6">
          {communityKeys.map((key) => (
            <div key={key} className="flex items-center gap-2 text-[12px] text-gray-500 min-w-0 break-words">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                style={{ background: colors[key] }}
              />
              {key}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
