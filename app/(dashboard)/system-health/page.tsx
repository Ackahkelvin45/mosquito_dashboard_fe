'use client'
import React, { useState } from 'react'
import {
  Activity, AlertTriangle, ChevronLeft, ChevronRight,
  Radio, Satellite, Wifi, WifiOff,
} from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'
import { useMqttErrors, useMqttStatus, useMqttTraffic } from '@/hooks/monitoring'
import { useDevices } from '@/hooks/device'
import { formatTimestamp, parseApiDate, timeAgo } from '@/lib/date'
import type { MqttError } from '@/queries/monitoring/monitoringQueries'

// Plain-language explanations so a non-technical reader knows what each
// failure actually means and what to do about it.
const ERROR_META: Record<string, { label: string; explain: string }> = {
  unknown_device: {
    label: 'Unregistered device',
    explain: 'A device sent data but is not registered, so its data is being dropped. Register it to start capturing.',
  },
  invalid_payload: {
    label: 'Unreadable message',
    explain: 'A message arrived but could not be read (broken format). If this repeats for one device, its firmware may need attention.',
  },
  malformed_topic: {
    label: 'Wrong address',
    explain: 'A message was sent to an address the system does not recognise.',
  },
  handler_error: {
    label: 'Processing failed',
    explain: 'A message was received but saving it failed — this is a system issue worth reporting to the developers.',
  },
  broker_disconnected: {
    label: 'Broker connection lost',
    explain: 'The server lost its connection to the message broker. Data sent during the gap may be missing.',
  },
}

function StatusCard({ title, value, sub, icon, tone }: {
  title: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon: React.ReactNode
  tone: 'green' | 'red' | 'amber' | 'gray'
}) {
  const tones = {
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    gray: 'bg-gray-100 text-gray-500',
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-start gap-3">
      <div className={`rounded-lg p-2.5 ${tones[tone]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-900 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function SystemHealthPage() {
  const [hours, setHours] = useState(24)
  const [deviceId, setDeviceId] = useState<number | undefined>(undefined)
  const [errorPage, setErrorPage] = useState(1)
  const [errorType, setErrorType] = useState<string | undefined>(undefined)

  const { data: status, isLoading: statusLoading } = useMqttStatus()
  const { data: traffic, isLoading: trafficLoading } = useMqttTraffic(hours, deviceId)
  const { data: errors, isLoading: errorsLoading } = useMqttErrors(errorPage, errorType)
  const { data: devicesPage } = useDevices(undefined, { page: 1, page_size: 100 })

  // "Fresh" = a message arrived within the offline threshold.
  const lastMsgMs = status?.last_message_at
    ? Date.now() - parseApiDate(status.last_message_at).getTime()
    : null
  const pipelineFresh = lastMsgMs !== null && status
    ? lastMsgMs < status.offline_threshold_min * 60_000
    : false

  const chartData = (traffic ?? []).map((b) => ({
    ...b,
    hour: parseApiDate(b.bucket_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }))

  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">System Health</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live view of the data pipeline — whether traps are reaching the server, how much
          data is flowing, and anything that went wrong. Updates automatically.
        </p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatusCard
          title="Message broker"
          tone={status?.broker_connected === true ? 'green'
            : status?.broker_connected === false ? 'red' : 'gray'}
          icon={status?.broker_connected === false ? <WifiOff size={20} /> : <Wifi size={20} />}
          value={statusLoading ? <Skeleton width={90} />
            : status?.broker_connected === true ? 'Connected'
            : status?.broker_connected === false ? 'Disconnected'
            : 'Unknown'}
          sub={status?.broker_state_since ? `since ${formatTimestamp(status.broker_state_since)}` : undefined}
        />
        <StatusCard
          title="Last message received"
          tone={pipelineFresh ? 'green' : 'amber'}
          icon={<Radio size={20} />}
          value={statusLoading ? <Skeleton width={90} />
            : status?.last_message_at ? timeAgo(status.last_message_at) : 'Never'}
          sub={status ? `${status.messages_24h.toLocaleString()} messages in the last 24h` : undefined}
        />
        <StatusCard
          title="Devices reporting"
          tone={status && status.devices_total > 0 && status.devices_reporting === status.devices_total
            ? 'green' : status && status.devices_reporting === 0 ? 'red' : 'amber'}
          icon={<Satellite size={20} />}
          value={statusLoading ? <Skeleton width={70} />
            : `${status?.devices_reporting ?? 0} of ${status?.devices_total ?? 0}`}
          sub={status ? `within the last ${status.offline_threshold_min} min` : undefined}
        />
        <StatusCard
          title="Errors (24h)"
          tone={status && status.errors_24h > 0 ? 'red' : 'green'}
          icon={<AlertTriangle size={20} />}
          value={statusLoading ? <Skeleton width={50} /> : String(status?.errors_24h ?? 0)}
          sub="every failure counts — see the feed below"
        />
      </div>

      {/* Silent devices */}
      {status && status.silent_devices.length > 0 && (
        <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
            <AlertTriangle size={16} />
            {status.silent_devices.length} device(s) have gone quiet
          </p>
          <ul className="mt-2 text-sm text-amber-800 flex flex-wrap gap-x-6 gap-y-1">
            {status.silent_devices.map((d) => (
              <li key={d.id}>
                <a href={`/devices/${d.id}`} className="underline">{d.name}</a>
                <span className="text-amber-600">
                  {' '}— {d.last_sensor_data_at ? `last heard ${timeAgo(d.last_sensor_data_at)}` : 'never reported'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Traffic chart */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Activity size={16} /> Incoming data
            </h2>
            <p className="text-xs text-gray-500">Messages received per hour, by type</p>
          </div>
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded-lg text-sm px-2 py-1.5"
              value={deviceId ?? ''}
              onChange={(e) => setDeviceId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">All devices</option>
              {(devicesPage?.items ?? []).map((d: { id: number; name: string }) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {[6, 24, 72].map((h) => (
              <button
                key={h}
                onClick={() => setHours(h)}
                className={`text-sm px-3 py-1.5 rounded-lg border ${
                  hours === h ? 'bg-gray-900 text-white border-gray-900'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {trafficLoading ? (
            <Skeleton height="100%" />
          ) : (
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="sensor_count" name="Sensor readings" stackId="a" fill="#1565C0" />
                <Bar dataKey="mosquito_count" name="Mosquito detections" stackId="a" fill="#3AC35C" />
                <Bar dataKey="test_count" name="Test mode" stackId="a" fill="#9CA3AF" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Error feed */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={16} /> Problem feed
            </h2>
            <p className="text-xs text-gray-500">
              Every ingest failure from the last 7 days, newest first
            </p>
          </div>
          <select
            className="border border-gray-300 rounded-lg text-sm px-2 py-1.5"
            value={errorType ?? ''}
            onChange={(e) => { setErrorType(e.target.value || undefined); setErrorPage(1) }}
          >
            <option value="">All problem types</option>
            {Object.entries(ERROR_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        {errorsLoading ? (
          <Skeleton count={4} height={44} className="mb-2" />
        ) : (errors?.items?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No problems recorded {errorType ? 'for this type' : ''} — the pipeline is clean. 🎉
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {(errors?.items ?? []).map((e: MqttError) => {
              const meta = ERROR_META[e.error_type] ?? { label: e.error_type, explain: '' }
              return (
                <li key={e.id} className="py-2.5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span className="shrink-0 text-xs font-semibold text-red-600 bg-red-50 rounded px-2 py-0.5">
                    {meta.label}
                  </span>
                  <span className="text-sm text-gray-700 min-w-0">
                    {e.device_uuid && <span className="font-mono text-xs mr-1">{e.device_uuid}</span>}
                    {meta.explain}
                    {e.detail && <span className="text-gray-400"> ({e.detail})</span>}
                  </span>
                  <span className="sm:ml-auto shrink-0 text-xs text-gray-400" title={formatTimestamp(e.occurred_at)}>
                    {timeAgo(e.occurred_at)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}

        {(errors?.total_pages ?? 0) > 1 && (
          <div className="flex items-center justify-end gap-2 mt-3 text-sm text-gray-600">
            <button
              disabled={errorPage <= 1}
              onClick={() => setErrorPage((p) => p - 1)}
              className="border border-gray-300 rounded-lg p-1.5 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            Page {errorPage} of {errors?.total_pages}
            <button
              disabled={errorPage >= (errors?.total_pages ?? 1)}
              onClick={() => setErrorPage((p) => p + 1)}
              className="border border-gray-300 rounded-lg p-1.5 disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
