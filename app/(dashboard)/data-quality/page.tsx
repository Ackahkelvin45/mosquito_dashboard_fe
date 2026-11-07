'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { ClipboardCheck } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { useDataQuality } from '@/hooks/monitoring'
import { formatTimestamp } from '@/lib/date'
import type { DataQualityDevice } from '@/queries/monitoring/monitoringQueries'

const FIELD_LABELS: Record<string, string> = {
  external_temperature: 'Ext temp',
  internal_temperature: 'Int temp',
  external_humidity: 'Ext humidity',
  internal_humidity: 'Int humidity',
  external_pressure: 'Ext pressure',
  internal_pressure: 'Int pressure',
  external_light: 'Light',
  battery_voltage: 'Battery V',
  battery_pct: 'Battery %',
  esp1_link_alive: 'Listener link',
}

const DAY_OPTIONS = [7, 30, 90]

// A count is only a problem when it's above zero — keep zeros quiet.
function Count({ value }: { value: number }) {
  return <span className={value > 0 ? 'font-semibold text-red-600' : 'text-gray-400'}>{value}</span>
}

function MissingFields({ d }: { d: DataQualityDevice }) {
  if (d.total_readings === 0) return <span className="text-gray-400">—</span>
  const missing = Object.entries(d.null_pct).filter(([, pct]) => pct !== null && pct > 0)
  if (missing.length === 0) return <span className="text-gray-400">None</span>
  return (
    <ul className="space-y-0.5">
      {missing.map(([field, pct]) => (
        <li key={field} className={pct === 100 ? 'text-red-600' : 'text-amber-700'}>
          {FIELD_LABELS[field] ?? field}: {pct}%
        </li>
      ))}
    </ul>
  )
}

function secs(s: number) {
  const a = Math.abs(s)
  const one = (v: number) => Math.round(v * 10) / 10
  if (a < 120) return `${s} s`
  if (a < 2 * 3600) return `${one(s / 60)} min`
  if (a < 2 * 86400) return `${one(s / 3600)} h`
  return `${one(s / 86400)} d`
}

function Delay({ d, threshold }: { d: DataQualityDevice; threshold: number }) {
  // Counted by receive time, so it can be > 0 even when no delay was measured
  // (readings stamped past the window end, e.g. a clock years ahead).
  const clockAhead = (
    <div
      className={`text-xs ${d.clock_ahead_count ? 'text-amber-700 font-semibold' : 'text-gray-400'}`}
      title="Readings dated more than 5 min after they arrived — the device clock is running ahead. Stored with the device's time."
    >
      clock ahead: {d.clock_ahead_count ?? '—'}
    </div>
  )
  if (d.delay_measured === 0 || d.avg_delay_s === null || d.max_delay_s === null || d.min_delay_s === null) {
    return (
      <div className="space-y-0.5">
        <span className="text-gray-400">Not measured</span>
        {!!d.clock_ahead_count && clockAhead}
      </div>
    )
  }
  return (
    <div className="space-y-0.5">
      <div>avg {secs(d.avg_delay_s)}</div>
      <div>max {secs(d.max_delay_s)}</div>
      {d.min_delay_s < 0 && <div className="text-xs text-amber-700">min {secs(d.min_delay_s)} (device clock ahead)</div>}
      {d.delayed_over_threshold > 0 && (
        <div className="text-xs text-red-600">{d.delayed_over_threshold} over {threshold} min</div>
      )}
      {clockAhead}
      <div className="text-xs text-gray-400">{d.delay_measured.toLocaleString()} measured</div>
    </div>
  )
}

export default function DataQualityPage() {
  const [days, setDays] = useState(7)
  const { data, isLoading, error } = useDataQuality(days)

  const th = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap'
  const td = 'px-4 py-3 align-top text-sm text-gray-700'

  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardCheck size={20} /> Data Quality
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-3xl">
            How complete and plausible each device&apos;s data is. Based on live readings only;
            test-mode readings are counted separately and left out of everything else.
            Nothing here is estimated or filled in.
          </p>
        </div>
        <div className="flex gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`text-sm px-3 py-1.5 rounded-lg border ${
                days === d ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton count={5} height={48} className="mb-2" />
      ) : error ? (
        <p className="text-sm text-red-500">Failed to load the data-quality report.</p>
      ) : !data || data.devices.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No devices to report on.</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className={th}>Device</th>
                  <th className={th}>Readings</th>
                  <th className={th}>Last reading</th>
                  <th className={th}>Missing values</th>
                  <th className={th}>Temp out of range</th>
                  <th className={th}>Humidity out of range</th>
                  <th className={th}>Battery % invalid</th>
                  <th className={th}>Longest silence</th>
                  <th className={th}>Silences &gt; {data.offline_threshold_min} min</th>
                  <th className={th}>Delay</th>
                  <th className={th}>Detections</th>
                  <th className={th}>No confidence</th>
                  <th className={th}>No genus</th>
                  <th className={th}>Confidence invalid</th>
                  <th className={th}>Invalid values received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.devices.map((d) => (
                  <tr key={d.device_id}>
                    <td className={td}>
                      <Link href={`/devices/${d.device_id}`} className="font-medium text-gray-900 underline">{d.name}</Link>
                      {d.region && <div className="text-xs text-gray-400">{d.region}</div>}
                    </td>
                    <td className={td}>
                      {d.total_readings === 0
                        ? <span className="text-red-600">No readings</span>
                        : d.total_readings.toLocaleString()}
                      {d.test_readings > 0 && (
                        <div className="text-xs text-gray-400">+{d.test_readings} test</div>
                      )}
                      {d.excluded_readings > 0 && (
                        <div className="text-xs text-gray-400" title="Excluded from analysis by an admin; still counted here">incl. {d.excluded_readings} excluded</div>
                      )}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>{formatTimestamp(d.last_reading_at)}</td>
                    <td className={`${td} whitespace-nowrap`}><MissingFields d={d} /></td>
                    <td className={td}>{d.total_readings ? <Count value={d.temperature_out_of_range} /> : '—'}</td>
                    <td className={td}>{d.total_readings ? <Count value={d.humidity_out_of_range} /> : '—'}</td>
                    <td className={td}>{d.total_readings ? <Count value={d.battery_pct_out_of_range} /> : '—'}</td>
                    <td className={`${td} whitespace-nowrap`}>
                      {d.longest_silence_min === null ? '—' : `${d.longest_silence_min} min`}
                    </td>
                    <td className={td}>
                      {d.silences_over_threshold === null ? '—' : <Count value={d.silences_over_threshold} />}
                    </td>
                    <td className={`${td} whitespace-nowrap`}><Delay d={d} threshold={data.offline_threshold_min} /></td>
                    <td className={td}>
                      {d.detections.toLocaleString()}
                      {d.excluded_detections > 0 && (
                        <div className="text-xs text-gray-400" title="Excluded from analysis by an admin; still counted here">incl. {d.excluded_detections} excluded</div>
                      )}
                    </td>
                    <td className={td}>{d.detections ? <Count value={d.detections_missing_p_mosq} /> : '—'}</td>
                    <td className={td}>{d.detections ? <Count value={d.detections_missing_genus} /> : '—'}</td>
                    <td className={td}>{d.detections ? <Count value={d.detections_p_mosq_out_of_range} /> : '—'}</td>
                    <td className={td}><Count value={d.invalid_values_received} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="text-xs text-gray-500 space-y-1 list-disc pl-5">
            <li>
              <strong>Missing values</strong>: share of readings where the device reported no valid
              value for that field. 100% can also mean the device&apos;s firmware never sends that field
              (e.g. Light), not that a sensor is faulty.
            </li>
            <li>
              <strong>Out of range</strong> uses the alert thresholds: temperature {data.temp_min}–{data.temp_max} °C,
              humidity {data.humidity_min}–{data.humidity_max} % (external sensor, or internal when external is
              missing). Battery % must be 0–100.
            </li>
            <li>
              <strong>Silences</strong>: time between two consecutive readings, measured by the device&apos;s
              own clock. Counted when longer than the {data.offline_threshold_min}-minute offline threshold.
              A silence that is still going on (no reading since then) is included.
            </li>
            <li>
              <strong>Delay</strong>: how long after its own timestamp a reading reached the server
              (server receive time minus the device&apos;s clock), average and longest. A device clock that
              is wrong skews this; a negative value means the device clock is ahead of the server.
              &ldquo;Over {data.offline_threshold_min} min&rdquo; counts readings that arrived later than the
              offline threshold. &ldquo;Clock ahead&rdquo; counts readings dated more than 5 min after they
              arrived (the device clock is running ahead); they are stored with the device&apos;s time. Only readings sent live by the device are measured: readings stored before this
              was recorded, CSV-imported readings, manually posted (HTTP) readings and readings without a device
              timestamp have no receive time, so a device with only those shows &ldquo;Not measured&rdquo;.
            </li>
            <li>
              <strong>Confidence</strong> is the model&apos;s mosquito confidence (p_mosq); valid values are 0–1.
            </li>
            <li>
              <strong>Invalid values received</strong>: values the device sent that were impossible or could
              not be stored: battery % outside 0–100 or fractional, confidence outside 0–1, a reading that is
              not a number, or text too long for its field. They were stored as blank, never corrected or
              shortened. A missing or unreadable trap status or time is also counted: those fields can&apos;t be
              blank, so they were stored as OFF or as the server&apos;s time. The raw value is listed on System Health.
              &ldquo;Battery % invalid&rdquo; and &ldquo;Confidence invalid&rdquo; count older readings
              stored before this check. Counted by when they arrived, test mode included; the error log
              keeps {data.error_retention_days} days, so longer periods only count the most recent days.
            </li>
          </ul>
        </>
      )}
    </div>
  )
}
