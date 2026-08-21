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
