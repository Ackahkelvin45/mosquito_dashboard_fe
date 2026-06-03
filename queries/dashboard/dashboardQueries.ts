import { apiFetch } from "@/api/base";

export type DashboardGroupBy = "hour" | "day" | "week" | "month";

export type GetDashboardFilters = {
  totals_group_by?: DashboardGroupBy;
  chart_group_by?: DashboardGroupBy;
  gender_group_by?: DashboardGroupBy;
  region_group_by?: DashboardGroupBy;
  sensor_status_group_by?: DashboardGroupBy;
  breakdown_group_by?: DashboardGroupBy;
  correlation_group_by?: DashboardGroupBy;
  genus_heatmap_group_by?: DashboardGroupBy;
  region?: string;
  cluster_id?: number;
  device_id?: number;
};

export type DashboardTotals = {
  total_mosquito_count: number;
  active_devices: number;
  inactive_devices: number;
  total_devices: number;
  average_humidity: number;
  average_internal_temp: number;
  average_battery_voltage: number;
  total_regions_monitored: number;
  group_by: DashboardGroupBy;
  window_start: string;
  window_end: string;
};

export type DashboardChartPoint = Record<string, unknown>;

export type DashboardChart = {
  data: DashboardChartPoint[];
  total: number;
  group_by: DashboardGroupBy;
  window_start: string;
  window_end: string;
};

export type DashboardResponse = {
  totals: DashboardTotals;
  chart: DashboardChart;
  gender_distribution?: {
    male: number;
    female: number;
    group_by?: DashboardGroupBy;
    window_start?: string;
    window_end?: string;
  };
  region_chart?: {
    data: Array<{ region: string; count: number }>;
    group_by?: DashboardGroupBy;
    window_start?: string;
    window_end?: string;
  };
  sensor_status_chart?: {
    data: Array<{
      label: string;
      on_count: number;
      off_count: number;
      timestamp: string;
    }>;
    group_by?: DashboardGroupBy;
    window_start?: string;
    window_end?: string;
  };
  breakdown?: {
    sex: Array<{ name: string; count: number }>;
    genus: Array<{ name: string; count: number }>;
    species: Array<{ name: string; count: number }>;
    age_group: Array<{ name: string; count: number }>;
    group_by?: DashboardGroupBy;
    window_start?: string;
    window_end?: string;
  };
  correlation_chart?: CorrelationChart;
  genus_heatmap?: GenusHeatmap;
  region?: string | null;
  cluster_id?: number | null;
  device_id?: number | null;
};

export type CorrelationPoint = {
  label: string;
  timestamp: string;
  mosquito_count: number;
  temperature: number | null;
  humidity: number | null;
};

export type CorrelationChart = {
  data: CorrelationPoint[];
  temperature_correlation: number | null;
  humidity_correlation: number | null;
  group_by: DashboardGroupBy;
  window_start: string;
  window_end: string;
};

export type GenusHeatmapCell = {
  genus: string;
  label: string;
  timestamp: string;
  count: number;
};

export type GenusHeatmap = {
  genera: string[];
  buckets: string[];
  data: GenusHeatmapCell[];
  group_by: DashboardGroupBy;
  window_start: string;
  window_end: string;
};

export async function getDashboardData(filters?: GetDashboardFilters): Promise<DashboardResponse> {
  const params = new URLSearchParams();
  if (filters?.totals_group_by) params.set("totals_group_by", filters.totals_group_by);
  if (filters?.chart_group_by) params.set("chart_group_by", filters.chart_group_by);
  if (filters?.gender_group_by) params.set("gender_group_by", filters.gender_group_by);
  if (filters?.region_group_by) params.set("region_group_by", filters.region_group_by);
  if (filters?.sensor_status_group_by) params.set("sensor_status_group_by", filters.sensor_status_group_by);
  if (filters?.breakdown_group_by) params.set("breakdown_group_by", filters.breakdown_group_by);
  if (filters?.correlation_group_by) params.set("correlation_group_by", filters.correlation_group_by);
  if (filters?.genus_heatmap_group_by) params.set("genus_heatmap_group_by", filters.genus_heatmap_group_by);
  if (filters?.region) params.set("region", filters.region);
  if (typeof filters?.cluster_id === "number") params.set("cluster_id", String(filters.cluster_id));
  if (typeof filters?.device_id === "number") params.set("device_id", String(filters.device_id));

  const query = params.toString();
  return apiFetch(`/dashboard${query ? `?${query}` : ""}`, { method: "GET" });
}
