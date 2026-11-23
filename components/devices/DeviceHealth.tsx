'use client'
import { useDeviceHealth } from '@/hooks/monitoring'
import { useRole } from '@/hooks/useRole'
import { formatTimestamp } from '@/lib/date'
import type { DeviceHealthRow, HealthFault } from '@/queries/monitoring/monitoringQueries'

// Red = act now; amber = data problem worth a look. Unknown codes fall back to amber.
export const FAULT_LEGEND: Record<string, { label: string; serious: boolean; text: (days: number) => string }> = {
  never_reported: { label: 'Never reported', serious: true, text: () => 'The device has never sent sensor data.' },
  offline: { label: 'Offline', serious: true, text: () => 'No sensor data within the offline threshold.' },
  low_battery: { label: 'Low battery', serious: true, text: () => 'Latest battery reading is below the low-battery alert level.' },
  detector_disconnected: { label: 'Detector disconnected', serious: true, text: () => 'The gateway reports no link to the detector unit.' },
  sensor_missing: {
    label: 'Sensor missing', serious: true,
    text: (days) => `Neither the outside nor the inside sensor sent a temperature (or humidity) value in the last ${days} days. A device with only one of the two sensors is not flagged.`,
  },
  no_gps_fix: { label: 'No GPS fix', serious: false, text: () => 'The stored position is not a usable GPS fix (for example 0,0).' },
  clock_ahead: { label: 'Clock ahead', serious: false, text: (days) => `Readings in the last ${days} days were dated in the future: the device clock is running ahead.` },
  invalid_values: {
    label: 'Invalid values', serious: false,
    text: (days) => `The device sent impossible values in the last ${days} days (test-mode messages included); they were stored as blank.`,
  },
}

export const isSerious = (f: HealthFault) => !!FAULT_LEGEND[f.code]?.serious

export function FaultChips({ faults, showDetail = false }: { faults: HealthFault[]; showDetail?: boolean }) {
  if (faults.length === 0) return <span className="text-xs text-green-700">No faults</span>
  const chip = (f: HealthFault) => (
    <span
      title={f.detail}
      className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
        isSerious(f) ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
      }`}
    >
      {f.label}
      {!showDetail && <span className="sr-only">: {f.detail}</span>}
    </span>
  )
  if (showDetail) {
    return (
      <ul className="space-y-1">
        {faults.map((f) => <li key={f.code} className="text-xs text-gray-600">{chip(f)} {f.detail}</li>)}
      </ul>
    )
  }
  return <div className="flex flex-wrap gap-1">{faults.map((f) => <span key={f.code}>{chip(f)}</span>)}</div>
}

export const fmtBattery = (d: DeviceHealthRow) =>
  d.battery_voltage === null && d.battery_pct === null
    ? '—'
    : [d.battery_voltage !== null && `${d.battery_voltage.toFixed(2)} V`, d.battery_pct !== null && `${d.battery_pct}%`]
        .filter(Boolean).join(' · ')

export const fmtDetector = (v: boolean | null) => (v === null ? '—' : v ? 'Connected' : 'Disconnected')
export const fmtGps = (v: boolean | null) => (v === null ? '—' : v ? 'Yes' : 'No fix')

/** "as of …" under a value taken from the latest reading, so an old value never reads as current. */
export function AsOf({ at }: { at: string | null }) {
  return at ? <div className="text-xs text-gray-400">as of {formatTimestamp(at)}</div> : null
}

export function NotMeasured({ reason }: { reason: string }) {
  return (
    <span className="text-gray-400 cursor-help" title={reason}>
      Not measured<span className="sr-only">: {reason}</span>
    </span>
  )
}

/** Health block for the device detail page. Admins only (the endpoint is admin-scoped). */
export function DeviceHealthPanel({ deviceId }: { deviceId: number }) {
  const { isAdmin, isSuperAdmin } = useRole()
  const { data } = useDeviceHealth(deviceId, isAdmin || isSuperAdmin)
  const d = data?.devices[0]
  if (!d) return null
  const item = 'flex flex-col gap-0.5'
  const label = 'text-xs text-gray-500'
  return (
    <section className="border border-gray-200 rounded-lg p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">Device health</h2>
      <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-700">
        <div className={item}><span className={label}>Last seen</span>{d.last_seen ? formatTimestamp(d.last_seen) : 'Never'}</div>
        <div className={item}><span className={label}>Battery</span>{fmtBattery(d)}<AsOf at={d.reading_at} /></div>
        <div className={item}><span className={label}>Signal</span><NotMeasured reason={d.signal_reason} /></div>
        <div className={item}><span className={label}>Detector link</span>{fmtDetector(d.detector_link)}<AsOf at={d.reading_at} /></div>
        <div className={item}><span className={label}>GPS fix</span>{fmtGps(d.gps_fix)}</div>
      </div>
      <div className="mt-3"><FaultChips faults={d.faults} showDetail /></div>
    </section>
  )
}
