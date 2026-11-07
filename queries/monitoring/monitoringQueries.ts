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
  /** Every ingest failure counts here — unlike notifications, never deduped.
   *  Excludes invalid_value rows (message saved, bad field blanked). */
  errors_24h: number;
  /** invalid_value rows in the last 24h; absent on older backends */
  invalid_values_24h?: number;
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
  /** Admin-excluded from analysis; still counted in these figures. */
  excluded_readings: number;
  last_reading_at: string | null;
  /** % of live readings where the field was null; null when there were no readings */
  null_pct: Record<string, number | null>;
  temperature_out_of_range: number;
  humidity_out_of_range: number;
  battery_pct_out_of_range: number;
  /** null with fewer than 2 readings */
  longest_silence_min: number | null;
  silences_over_threshold: number | null;
  /** Live readings with a server receive time; 0 = delay not measured */
  delay_measured: number;
  /** received_at - timestamp in seconds (server clock - device clock); null when not measured. Negative = device clock ahead. */
  avg_delay_s: number | null;
  min_delay_s: number | null;
  max_delay_s: number | null;
  delayed_over_threshold: number;
  detections: number;
  detections_missing_p_mosq: number;
  detections_missing_genus: number;
  detections_p_mosq_out_of_range: number;
  excluded_detections: number;
  /** Field values received that were impossible (stored as blank) or a missing/unreadable trap status or time (stored as OFF / server time), from the ingest error log */
  invalid_values_received: number;
};

export type DataQualityReport = {
  days: number;
  window_start: string;
  window_end: string;
  offline_threshold_min: number;
  /** Days the ingest error log is kept (bounds invalid_values_received) */
  error_retention_days: number;
  temp_min: number;
  temp_max: number;
  humidity_min: number;
  humidity_max: number;
  devices: DataQualityDevice[];
};

export async function getDataQuality(days: number): Promise<DataQualityReport> {
  return apiFetch(`/monitoring/data-quality?days=${days}`);
}

// Model performance (every signed-in non-guest role, scoped server-side).
// Confidence = the model's own certainty, NOT accuracy. Agreement = manual vs
// AI COUNTS per genus×sex group per collection, NOT per-detection accuracy.
export type PMosqStats = {
  measured: number;
  /** absent or outside 0–1 — excluded from the mean, never treated as 0 */
  missing: number;
  mean: number | null;
  below_low: number;
  below_low_share: number | null;
  buckets: { label: string; count: number }[];
};

/** Probability at the reported genus/sex key. */
export type KeyConfidence = {
  measured: number;
  missing: number;
  zero_at_reported_key: number;
  mean: number | null;
};

export type ModelPerformanceReport = {
  days: number;
  window_start: string;
  window_end: string;
  low_confidence_threshold: number;
  confidence: {
    detections: number;
    p_mosq: PMosqStats;
    genus_confidence: KeyConfidence;
    sex_confidence: KeyConfidence;
    binary_decision_true: number;
    binary_decision_false: number;
    binary_decision_missing: number;
    inference_ms: { measured: number; missing: number; mean_ms: number | null; max_ms: number | null };
    age_group_reported: number;
    by_genus: { genus: string; detections: number; genus_confidence: KeyConfidence }[];
  };
  agreement: {
    collection_rule: string;
    collections: {
      device_id: number;
      device_name: string;
      period_start: string;
      period_end: string;
      device_reporting: boolean;
      manual_total: number;
      ai_total: number;
      abs_difference: number;
    }[];
    collections_compared: number;
    collections_not_reporting: number;
    groups_compared: number;
    groups_exact_match: number;
    exact_match_share: number | null;
    manual_total: number;
    ai_total: number;
    /** Σ |ai − manual| per counted genus×sex group — errors never cancel */
    abs_difference: number;
    by_genus: { genus: string; groups: number; manual: number; ai: number; abs_difference: number }[];
  };
  targets: { name: string; target_pct: number; status: "not_measurable_yet"; reason: string }[];
};

export async function getModelPerformance(days: number): Promise<ModelPerformanceReport> {
  return apiFetch(`/model-performance?days=${days}`);
}

// Surveillance report (/reports/surveillance) — measured figures only; null /
// empty = nothing was measured, never 0-filled. Times are naive UTC.
export type ReportPeriod = "weekly" | "monthly";
type Named = { name: string; count: number };
type Measure = { readings: number; mean: number | null; min: number | null; max: number | null };
type DeviceIssue = {
  device_id: number;
  name: string;
  region: string | null;
  longest_silence_min: number | null;
  silences_over_threshold: number | null;
};

export type SurveillanceReport = {
  generated_at: string;
  period: ReportPeriod;
  period_start: string;
  /** exclusive */
  period_end: string;
  period_complete: boolean;
  previous_start: string;
  previous_end: string;
  scope: string;
  /** scope of the alerts + data-quality sections (own cluster; super admin all) */
  management_scope: string;
  cluster_id: number | null;
  region: string | null;
  summary: {
    detections: number;
    detection_events: number;
    /** true = no device sent anything, so detections=0 is not a measurement */
    no_device_reported: boolean;
    previous_detections: number;
    previous_devices_reporting: number;
    /** null while the period is still running */
    change: number | null;
    /** null while the period is running or when the previous period had 0 */
    change_pct: number | null;
    top_species: string | null;
    devices_reporting: number;
    devices_total: number;
    regions_covered: string[];
  };
  detections: {
    by_genus: Named[];
    by_sex: Named[];
    by_species: Named[];
    by_region: { region: string; count: number; communities: { community: string; count: number }[] }[];
    /** count null = no device reported that day */
    daily: { date: string; devices_reporting: number; count: number | null }[];
    unclassified: number;
  };
  environment: { readings: number; temperature: Measure; humidity: Measure };
  alerts: {
    total: number;
    handled: number;
    by_type: { type: string; count: number; handled: number }[];
    ungrouped_rows: number;
    note: string;
  };
  data_quality: {
    offline_threshold_min: number;
    devices_checked: number;
    no_readings: DeviceIssue[];
    long_silences: DeviceIssue[];
  };
  manual_vs_ai: {
    collections: number;
    collections_compared: number;
    collections_not_reporting: number;
    manual_total: number;
    ai_total: number;
    abs_difference: number;
    rule: string;
    message: string | null;
  };
};

export async function getSurveillanceReport(
  period: ReportPeriod, end: string, region?: string,
): Promise<SurveillanceReport> {
  const params = new URLSearchParams({ period, end });
  if (region) params.set("region", region);
  return apiFetch(`/reports/surveillance?${params}`);
}
