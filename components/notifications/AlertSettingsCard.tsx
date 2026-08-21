'use client'
import React, { useEffect, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useAlertSettings, useUpdateAlertSettings } from '@/hooks/notification'
import { useRole } from '@/hooks/useRole'

// SUPER_ADMIN only: the system-wide alert thresholds (FR-18 Phase A).
// Edits take effect immediately — no server restart.

const FIELDS: { key: string; label: string; unit: string }[] = [
  { key: 'temp_min', label: 'Temperature min', unit: '°C' },
  { key: 'temp_max', label: 'Temperature max', unit: '°C' },
  { key: 'humidity_min', label: 'Humidity min', unit: '%' },
  { key: 'humidity_max', label: 'Humidity max', unit: '%' },
  { key: 'battery_critical_v', label: 'Battery warning below', unit: 'V' },
  { key: 'battery_urgent_v', label: 'Battery critical below', unit: 'V' },
  { key: 'battery_critical_pct', label: 'Battery warning below', unit: '%' },
  { key: 'battery_urgent_pct', label: 'Battery critical below', unit: '%' },
  { key: 'surge_threshold', label: 'Activity surge above', unit: 'detections' },
  { key: 'surge_window_min', label: 'Surge window', unit: 'min' },
]

export default function AlertSettingsCard() {
  const { canManageSystem } = useRole()
  const { data, isLoading } = useAlertSettings(canManageSystem)
  const update = useUpdateAlertSettings()
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (data?.values) {
      setDraft(Object.fromEntries(
        Object.entries(data.values).map(([k, v]) => [k, String(v)])))
    }
  }, [data])

  if (!canManageSystem) return null

  const dirty = data?.values
    ? Object.entries(draft).some(([k, v]) => v !== String(data.values[k]))
    : false

  const submit = () => {
    setError(null)
    if (!data?.values) return
    const changes: Record<string, number> = {}
    for (const [key, raw] of Object.entries(draft)) {
      const next = Number(raw)
      if (raw.trim() === '' || Number.isNaN(next)) {
        setError(`${key}: not a number`)
        return
      }
      if (next !== data.values[key]) changes[key] = next
    }
    if (!Object.keys(changes).length) return
    update.mutate(changes, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) },
      onError: (e) => setError(e instanceof Error ? e.message : 'Save failed'),
    })
  }

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 font-raleway">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
          <SlidersHorizontal size={15} /> System Alert Thresholds
        </h3>
        <span className={`text-xs font-semibold text-green-600 transition-opacity duration-500 ${saved ? 'opacity-100' : 'opacity-0'}`}>
          Saved
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        These apply to everyone and take effect immediately. Personal thresholds can
        only be stricter than these.
      </p>
      {isLoading || !data ? (
        <p className="text-sm text-gray-400 py-4">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {FIELDS.filter((f) => f.key in (data.values ?? {})).map((f) => {
              const bounds = data.bounds?.[f.key]
              return (
                <label key={f.key} className="block">
                  <span className="block text-xs text-gray-500 mb-1">
                    {f.label} <span className="text-gray-400">({f.unit})</span>
                  </span>
                  <input
                    type="number"
                    value={draft[f.key] ?? ''}
                    min={bounds?.[0]}
                    max={bounds?.[1]}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-full"
                  />
                </label>
              )
            })}
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={!dirty || update.isPending}
            className="mt-4 text-sm font-semibold text-white bg-primary rounded-lg px-4 py-2 disabled:opacity-40"
          >
            Save thresholds
          </button>
        </>
      )}
    </div>
  )
}
