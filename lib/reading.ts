// Sensor-reading field access that tolerates BOTH naming conventions.
//
// The backend's SensorDataResponse declares fields like `temp_external` with
// alias `external_temperature` (populate_by_name) — the wire emits the FIELD
// names (temp_external, humidity_internal, …), but parts of this codebase
// were typed against the aliases. Read through these accessors instead of
// touching the raw keys, so a payload in either spelling just works.

export type AnyReading = Record<string, unknown> | null | undefined;

function num(reading: AnyReading, ...keys: string[]): number | null {
  if (!reading) return null;
  for (const key of keys) {
    const value = reading[key];
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
