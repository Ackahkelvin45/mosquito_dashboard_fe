// Sensor-reading field access that tolerates BOTH naming conventions.
//
// The backend's SensorDataResponse declares fields like `temp_external` with
// alias `external_temperature` (populate_by_name) — the wire emits the FIELD
// names (temp_external, humidity_internal, …), but parts of this codebase
// were typed against the aliases. Read through these accessors instead of
// touching the raw keys, so a payload in either spelling just works.

import type { SensorReading } from "@/types/api";

export type AnyReading = SensorReading | Record<string, unknown> | null | undefined;

function num(reading: AnyReading, ...keys: string[]): number | null {
  if (!reading) return null;
  const record = reading as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return null;
}

export const internalTemp = (r: AnyReading) => num(r, "temp_internal", "internal_temperature");
export const externalTemp = (r: AnyReading) => num(r, "temp_external", "external_temperature");
export const internalHumidity = (r: AnyReading) => num(r, "humidity_internal", "internal_humidity");
export const externalHumidity = (r: AnyReading) => num(r, "humidity_external", "external_humidity");
export const internalPressure = (r: AnyReading) => num(r, "pressure_internal", "internal_pressure");
export const externalPressure = (r: AnyReading) => num(r, "external_pressure", "pressure_external");
export const batteryVoltage = (r: AnyReading) => num(r, "battery", "battery_voltage");

/** Environment values for filtering: external preferred, internal fallback —
 * the same rule the backend's alert handlers use. */
export const filterTemp = (r: AnyReading) =>
  externalTemp(r) ?? internalTemp(r);
export const filterHumidity = (r: AnyReading) =>
  externalHumidity(r) ?? internalHumidity(r);

/** Display helper: value with unit, or an em dash for "no reading". */
export const fmtReading = (value: number | null, unit: string) =>
  value === null ? "—" : `${value}${unit}`;

/** Online device whose latest reading says the detector board link is down —
 * a quiet period then means "can't detect", not "no mosquitoes". NULL
 * (firmware doesn't report it) is unknown and never warns. */
export const detectorDisconnected = (
  d: { is_active?: boolean; latest_reading?: { esp1_link_alive?: boolean | null } | null } | null | undefined
) => Boolean(d?.is_active) && d?.latest_reading?.esp1_link_alive === false;

export const DETECTOR_DISCONNECTED_MSG = "Detector disconnected — no detections can be recorded";

const pct = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? `${Number((v * 100).toFixed(1))}%` : "—";

/** Model confidence for one detection, as display strings ("—" when missing).
 * taxon_probs/sex_probs carry the real value only under the reported label's
 * key (others are 0, not a softmax), so we read exactly that key. */
export function detectionConfidence(r: Record<string, unknown> | null | undefined) {
  const forLabel = (probs: unknown, label: unknown) =>
    probs && typeof probs === "object" && typeof label === "string"
      ? ((probs as Record<string, unknown>)[label] ?? (probs as Record<string, unknown>)[label.toLowerCase()])
      : undefined;
  return {
    mosqConf: pct(r?.p_mosq),
    genusConf: pct(forLabel(r?.taxon_probs, r?.genus)),
    sexConf: pct(forLabel(r?.sex_probs, r?.sex)),
  };
}
