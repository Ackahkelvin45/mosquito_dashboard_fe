import { apiFetch } from "@/api/base";

export type ChartGroupBy = "hour" | "day" | "week" | "month" | "year";

export type ChartDataWrapper<T> = {
  data: T[];
  group_by: ChartGroupBy;
  window_start: string;
  window_end: string;
};

export type MosquitoCountPoint = {
  label: string;
  count: number;
  timestamp: string;
};

export type MosquitoTrendPoint = {
  label: string;
  timestamp: string;
  young_male: number;
  old_male: number;
  young_female: number;
  old_female: number;
};

export type MosquitoGenderPoint = {
  label: string;
  timestamp: string;
  male: number;
  female: number;
};

export type SensorStatusPoint = {
  label: string;
  timestamp: string;
  on_count: number;
  off_count: number;
};

export type EnvironmentalPoint = {
  label: string;
  timestamp: string;
  external: number | null;
  internal: number | null;
};

export type BatteryPoint = {
  label: string;
  timestamp: string;
  voltage: number | null;
};

export type DeviceChartsResponse = {
  group_by: ChartGroupBy;
  device_id: number;
  mosquito_count: ChartDataWrapper<MosquitoCountPoint>;
  mosquito_trend: ChartDataWrapper<MosquitoTrendPoint>;
  mosquito_gender: ChartDataWrapper<MosquitoGenderPoint>;
  sensor_status: ChartDataWrapper<SensorStatusPoint>;
  temperature: ChartDataWrapper<EnvironmentalPoint>;
  humidity: ChartDataWrapper<EnvironmentalPoint>;
  pressure: ChartDataWrapper<EnvironmentalPoint>;
  battery: ChartDataWrapper<BatteryPoint>;
};

export async function getDeviceCharts(
  deviceId: string | number,
  groupBy: ChartGroupBy = "month"
): Promise<DeviceChartsResponse> {
  return apiFetch(`/devices/${deviceId}/charts?group_by=${groupBy}`, {
    method: "GET",
  });
}
