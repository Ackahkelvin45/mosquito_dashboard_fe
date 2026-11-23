'use client'
import Link from 'next/link'
import { HeartPulse } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { useDeviceHealth } from '@/hooks/monitoring'
import { formatTimestamp } from '@/lib/date'
import {
  AsOf, FAULT_LEGEND, FaultChips, NotMeasured, fmtBattery, fmtDetector, fmtGps, isSerious,
} from '@/components/devices/DeviceHealth'
import type { DeviceHealthRow } from '@/queries/monitoring/monitoringQueries'

const serious = (d: DeviceHealthRow) => d.faults.filter(isSerious).length

export default function DeviceHealthPage() {
  const { data, isLoading, error } = useDeviceHealth()
  // Most serious (red) faults first, then most faults overall, then name.
  const rows = [...(data?.devices ?? [])].sort(
    (a, b) => serious(b) - serious(a) || b.faults.length - a.faults.length || a.name.localeCompare(b.name),
  )

  const th = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap'
  const td = 'px-4 py-3 align-top text-sm text-gray-700'

  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <HeartPulse size={20} /> Device Health
        </h1>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl">
          Each device&apos;s current state, from its latest live reading. Devices with the most problems
          are listed first. A dash means the device has not reported that value; nothing is estimated.
        </p>
      </div>

      {isLoading ? (
        <Skeleton count={5} height={48} className="mb-2" />
      ) : error ? (
        <p className="text-sm text-red-500">Failed to load device health.</p>
      ) : !data || rows.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No devices to report on.</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className={th}>Device</th>
                  <th scope="col" className={th}>Status</th>
                  <th scope="col" className={th}>Last seen</th>
                  <th scope="col" className={th}>Battery</th>
                  <th scope="col" className={th}>Signal</th>
                  <th scope="col" className={th}>Detector link</th>
                  <th scope="col" className={th}>GPS fix</th>
                  <th scope="col" className={th}>Faults</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td className={td}>
                      <Link href={`/devices/${d.id}`} className="font-medium text-gray-900 underline">{d.name}</Link>
                      <div className="text-xs text-gray-400">{[d.cluster_name, d.region].filter(Boolean).join(' · ')}</div>
                    </td>
                    <td className={td}>
                      {d.is_active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Online</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase">Offline</span>
                      )}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>{d.last_seen ? formatTimestamp(d.last_seen) : 'Never'}</td>
                    <td className={`${td} whitespace-nowrap`}>{fmtBattery(d)}<AsOf at={d.reading_at} /></td>
                    <td className={td}><NotMeasured reason={d.signal_reason} /></td>
                    <td className={`${td} whitespace-nowrap ${d.detector_link === false ? 'text-red-600' : ''}`}>{fmtDetector(d.detector_link)}<AsOf at={d.reading_at} /></td>
                    <td className={`${td} whitespace-nowrap`}>{fmtGps(d.gps_fix)}</td>
                    <td className={td}><FaultChips faults={d.faults} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="text-xs text-gray-500 space-y-1 list-disc pl-5">
            <li>
              <strong>Last seen</strong>: last sensor data. Offline after {data.offline_threshold_min} minutes
              without it. <strong>Battery</strong> is low below {data.battery_low_pct}% (or {data.battery_low_v} V
              when the device sends no percentage). <strong>Signal</strong>: devices do not send signal strength yet.
              Red faults need action; amber ones are data problems. Hover a fault (or open the device) for its details. Battery and detector link are &ldquo;as of&rdquo; the latest reading.
            </li>
            {Object.entries(FAULT_LEGEND).map(([code, f]) => (
              <li key={code}>
                <span className={`font-semibold ${f.serious ? 'text-red-700' : 'text-amber-800'}`}>
                  {f.label}
                </span>
                : {f.text(data.days)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
