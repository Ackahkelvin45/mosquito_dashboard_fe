"use client";

import DownloadCsvButton from "@/components/tables/DownloadCsvButton";
import type { CsvColumn } from "@/lib/csv";
import { useRole } from "@/hooks/useRole";
import type { DashboardResponse } from "@/queries/dashboard/dashboardQueries";

// Long format: one row per data point, so every dashboard section fits the
// same four columns in a single CSV/PDF.
type Row = { section: string; item: string; metric: string; value: string | number };

// The full DashboardResponse (date-range page) or the same sections assembled
// from the per-chart hooks (main dashboard) — all optional.
export type DashboardExportSections = Partial<
  Pick<
    DashboardResponse,
    | "totals"
    | "chart"
    | "gender_distribution"
    | "region_chart"
    | "sensor_status_chart"
    | "breakdown"
    | "correlation_chart"
    | "genus_heatmap"
  >
>;

const COLUMNS: CsvColumn<Row>[] = [
  { header: "Section", accessor: (r) => r.section },
  { header: "Item", accessor: (r) => r.item },
  { header: "Metric", accessor: (r) => r.metric },
  { header: "Value", accessor: (r) => r.value },
];

export function buildDashboardExportRows(s: DashboardExportSections): Row[] {
  const rows: Row[] = [];

  const t = s.totals;
  if (t) {
    const entries: Array<[string, number | null | undefined]> = [
      ["Total Mosquito Count", t.total_mosquito_count],
      ["Reporting Devices", t.active_devices],
      ["Total Devices", t.total_devices],
      ["Avg Humidity (%)", t.average_humidity],
      ["Avg Internal Temp (°C)", t.average_internal_temp],
      ["Avg Battery (V)", t.average_battery_voltage],
      ["Regions Monitored", t.total_regions_monitored],
    ];
    for (const [metric, value] of entries) {
      if (value !== null && value !== undefined) {
        rows.push({ section: "Summary", item: "", metric, value });
      }
    }
  }

  for (const p of s.chart?.data ?? []) {
    const rec = p as Record<string, unknown>;
    const raw = rec.count ?? rec.value ?? rec.total ?? rec.mosquito_count;
    const n = typeof raw === "number" ? raw : Number(raw ?? 0) || 0;
    rows.push({
      section: "Mosquito Monitoring",
      item: String(rec.label ?? rec.timestamp ?? ""),
      metric: "Mosquito Count",
      value: n,
    });
  }

  const g = s.gender_distribution;
  if (g) {
    rows.push({ section: "Gender Distribution", item: "female", metric: "Mosquito Count", value: g.female ?? 0 });
    rows.push({ section: "Gender Distribution", item: "male", metric: "Mosquito Count", value: g.male ?? 0 });
  }

  const b = s.breakdown;
  if (b) {
    const cats: Array<[string, Array<{ name: string; count: number }> | undefined]> = [
      ["Genus", b.genus],
      ["Species", b.species],
      ["Sex", b.sex],
      ["Age Group", b.age_group],
    ];
    for (const [label, list] of cats) {
      for (const r of list ?? []) {
        rows.push({ section: `Breakdown — ${label}`, item: r.name, metric: "Mosquito Count", value: r.count });
      }
    }
  }

  for (const p of s.sensor_status_chart?.data ?? []) {
    rows.push({ section: "Sensor Status", item: p.label, metric: "Traps On", value: p.on_count ?? 0 });
    rows.push({ section: "Sensor Status", item: p.label, metric: "Traps Off", value: p.off_count ?? 0 });
  }

  for (const r of s.region_chart?.data ?? []) {
    const region = (r.region ?? "").trim() || "Unknown";
    rows.push({ section: "Regions", item: region, metric: "Mosquito Count", value: r.count ?? 0 });
    for (const c of r.communities ?? []) {
      rows.push({
        section: "Regions",
        item: `${region} — ${(c.community ?? "").trim() || "Unknown"}`,
        metric: "Mosquito Count",
        value: c.count ?? 0,
      });
    }
  }

  const cor = s.correlation_chart;
  for (const p of cor?.data ?? []) {
    rows.push({ section: "Correlation", item: p.label, metric: "Mosquito Count", value: p.mosquito_count ?? 0 });
    if (p.temperature != null) {
      rows.push({ section: "Correlation", item: p.label, metric: "Temperature (°C)", value: p.temperature });
    }
    if (p.humidity != null) {
      rows.push({ section: "Correlation", item: p.label, metric: "Humidity (%)", value: p.humidity });
    }
  }
  if (cor?.temperature_correlation != null) {
    rows.push({ section: "Correlation", item: "", metric: "Temperature correlation (r)", value: cor.temperature_correlation });
  }
  if (cor?.humidity_correlation != null) {
    rows.push({ section: "Correlation", item: "", metric: "Humidity correlation (r)", value: cor.humidity_correlation });
  }

  for (const c of s.genus_heatmap?.data ?? []) {
    rows.push({ section: "Genus Heatmap", item: `${c.genus} @ ${c.label}`, metric: "Mosquito Count", value: c.count });
  }

  return rows;
}

export default function DashboardExportButton({
  sections,
  disabled,
}: {
  sections: DashboardExportSections;
  disabled?: boolean;
}) {
  // Guests are read-only: no data export.
  const { isGuest } = useRole();
  if (isGuest) return null;

  return (
    <DownloadCsvButton
      filename="dashboard-export"
      title="Dashboard Export"
      label="Export All"
      columns={COLUMNS}
      rows={buildDashboardExportRows(sections)}
      disabled={disabled}
    />
  );
}
