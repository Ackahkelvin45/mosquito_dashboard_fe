import { apiFetch } from "@/api/base";
import type { Paginated } from "@/lib/pagination";

// System Health (SUPER_ADMIN only) — read-only views over the backend's MQTT
// ingest instrumentation. See mosquito_dashboard_be/app/monitoring.

export type MqttStatus = {
  /** true/false from the live client; null = unknown (API just restarted) */
  broker_connected: boolean | null;
  broker_state_since: string | null;
  /** Last MQTT message from ANY device */
  last_message_at: string | null;
  messages_24h: number;
  /** Every ingest failure counts here — unlike notifications, never deduped */
  errors_24h: number;
  devices_total: number;
  devices_reporting: number;
  silent_devices: { id: number; name: string; last_sensor_data_at: string | null }[];
  offline_threshold_min: number;
};

export type TrafficBucket = {
  bucket_start: string;
  sensor_count: number;
  mosquito_count: number;
  test_count: number;
};

export type MqttError = {
  id: number;
  occurred_at: string;
  error_type:
    | "invalid_payload"
    | "malformed_topic"
    | "unknown_device"
    | "handler_error"
    | "broker_disconnected"
    | string;
  topic: string | null;
  device_uuid: string | null;
  detail: string | null;
};

export async function getMqttStatus(): Promise<MqttStatus> {
  return apiFetch("/monitoring/mqtt/status");
}

export async function getMqttTraffic(hours: number, deviceId?: number): Promise<TrafficBucket[]> {
  const params = new URLSearchParams({ hours: String(hours) });
  if (deviceId !== undefined) params.set("device_id", String(deviceId));
  return apiFetch(`/monitoring/mqtt/traffic?${params.toString()}`);
}

export async function getMqttErrors(
  page: number,
  pageSize = 20,
  errorType?: string,
): Promise<Paginated<MqttError>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (errorType) params.set("error_type", errorType);
  return apiFetch(`/monitoring/mqtt/errors?${params.toString()}`);
}

// Data quality (ADMIN: own cluster; SUPER_ADMIN: all). Live readings only;
// every count is computed server-side, nothing is filled or interpolated.
export type DataQualityDevice = {
  device_id: number;
  device_uuid: string | null;
  name: string;
  cluster_id: number | null;
  region: string | null;
  total_readings: number;
  test_readings: number;
  last_reading_at: string | null;
  /** % of live readings where the field was null; null when there were no readings */
  null_pct: Record<string, number | null>;
  temperature_out_of_range: number;
  humidity_out_of_range: number;
  battery_pct_out_of_range: number;
  /** null with fewer than 2 readings */
  longest_silence_min: number | null;
  silences_over_threshold: number | null;
  detections: number;
  detections_missing_p_mosq: number;
  detections_missing_genus: number;
  detections_p_mosq_out_of_range: number;
};

export type DataQualityReport = {
  days: number;
  window_start: string;
  window_end: string;
  offline_threshold_min: number;
  temp_min: number;
  temp_max: number;
  humidity_min: number;
  humidity_max: number;
  devices: DataQualityDevice[];
};

export async function getDataQuality(days: number): Promise<DataQualityReport> {
  return apiFetch(`/monitoring/data-quality?days=${days}`);
}
