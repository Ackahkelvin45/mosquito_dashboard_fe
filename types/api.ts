// The ONE definition of what the backend sends — every page imports these
// instead of declaring its own copy.
//
// Ground truth: mosquito_dashboard_be/app/device/schema.py (DeviceResponse /
// SensorDataResponse). CAUTION: FastAPI serialises responses BY ALIAS, so the
// wire carries the ALIASES (`external_temperature`, `battery_voltage`, …),
// typed below as sent. Prefer the accessors in lib/reading.ts.

/** One sensor reading (SensorDataResponse). Null = "no valid reading" —
 * deliberate (see MQTT_Schema_Reference.pdf), never coerce to 0. */
export type SensorReading = {
  id: number;
  device_id: number;
  timestamp: string;
  external_temperature: number | null;
  internal_temperature: number | null;
  external_humidity: number | null;
  internal_humidity: number | null;
  internal_pressure: number | null;
  external_pressure: number | null;
  external_light: number | null;
  /** Battery VOLTAGE (profile-dependent range) — not a percentage. */
  battery_voltage: number | null;
  /** 0-100, already normalised for the device's configured battery profile. */
  battery_pct: number | null;
  trap_status: boolean | null;
  /** Gateway↔Listener link. false = "no detections" cannot be trusted. */
  esp1_link_alive: boolean | null;
} & Exclusion;

/** Admin exclusion flag on a reading/event. The row is still listed (greyed
 * out) but left out of every chart, total and report. Null = included. */
export type Exclusion = {
  excluded_at: string | null;
  exclusion_reason: string | null;
  /** Only sent to viewers who manage the device's cluster; null otherwise. */
  excluded_by_name: string | null;
};

/** Fleet-wide reading rows (SensorReadingWithDeviceResponse). */
export type SensorReadingWithDevice = SensorReading & {
  device_uuid: string | null;
  device_name: string | null;
  region: string | null;
  cluster_id: number | null;
};

/** A device (DeviceResponse) as every device endpoint returns it. */
export type Device = {
  id: number;
  name: string;
  device_uuid: string | null;
  description: string | null;
  /** Nullable until the device's first GPS fix. */
  longitude: number | null;
  latitude: number | null;
  /** Derived from coordinates by reverse geocoding. */
  region: string | null;
  community: string | null;
  gmap_link: string | null;
  /** Last seen — bumped by ANY message. */
  last_activity: string;
  /** Liveness heartbeat — sensor_data only; drives is_active. Null = never. */
  last_sensor_data_at: string | null;
  location_updated_at: string | null;
  created_at: string;
  updated_at: string;
  total_mosquito_count: number;
  cluster_id: number | null;
  /** Server-computed: sensor_data within the offline threshold. */
  is_active: boolean;
  latest_reading: SensorReading | null;
};

/** A device cluster (DeviceClusterResponse). */
export type Cluster = {
  id: number;
  cluster_uuid: string;
  name: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  devices?: Device[];
};

/** Minimal projection for pages that only need identity (filter dropdowns). */
export type DeviceLike = Partial<Pick<Device, "device_uuid" | "name">>;
