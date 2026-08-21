'use client'
import React from 'react'
import Link from 'next/link'
import { AlertTriangle, MapPin, X } from 'lucide-react'
import { useDismissSighting, useUnregisteredSightings } from '@/hooks/device'
import { useRole } from '@/hooks/useRole'
import { timeAgo } from '@/lib/date'
import type { UnregisteredSighting } from '@/queries/device/deviceQueries'

// Both views of the same data (SUPER_ADMIN only — the hook never fires for
// other roles): the dashboard shows a one-line banner linking here, the
// devices page shows the actionable list with Register/Dismiss.

function registerHref(s: UnregisteredSighting): string {
  const params = new URLSearchParams({ device_uuid: s.device_uuid })
  if (s.latitude !== null && s.longitude !== null) {
    params.set('latitude', String(s.latitude))
    params.set('longitude', String(s.longitude))
  }
  return `/devices/add?${params.toString()}`
}

/** One-line dashboard banner: "N devices are sending data but aren't registered". */
export function UnregisteredBanner() {
  const { canManageSystem } = useRole()
  const { data } = useUnregisteredSightings(canManageSystem)
  const count = data?.total ?? 0
  if (!canManageSystem || count === 0) return null
  return (
    <Link
      href="/devices"
      className="flex items-center gap-2 border border-amber-300 bg-amber-50 text-amber-800 rounded-lg px-4 py-2.5 text-sm hover:bg-amber-100 transition-colors"
    >
      <AlertTriangle size={16} className="shrink-0" />
      <span>
        <span className="font-semibold">{count} device{count === 1 ? ' is' : 's are'}</span>
        {' '}sending data but {count === 1 ? "isn't" : "aren't"} registered — their data is
        being dropped. Click to review.
      </span>
    </Link>
  )
}

/** Devices-page section: each sighting with one-click Register (prefilled) or Dismiss. */
export function UnregisteredSightingsSection() {
  const { canManageSystem } = useRole()
  const { data } = useUnregisteredSightings(canManageSystem)
  const dismiss = useDismissSighting()
  const sightings = data?.items ?? []
  if (!canManageSystem || sightings.length === 0) return null

  return (
    <div className="border border-amber-300 bg-amber-50 rounded-lg p-4 mb-6">
      <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
        <AlertTriangle size={16} />
        Unregistered devices are sending data
      </p>
      <p className="text-xs text-amber-700 mt-1">
        These devices are publishing to the platform but aren&apos;t registered, so their
        data is being dropped. Register them to start capturing it, or dismiss strays.
      </p>
      <ul className="mt-3 divide-y divide-amber-200">
        {sightings.map((s) => (
          <li key={s.device_uuid} className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="min-w-0 flex-1">
              <span className="font-mono text-sm text-amber-900 break-all">{s.device_uuid}</span>
              <p className="text-xs text-amber-700">
                {s.message_count.toLocaleString()} message{s.message_count === 1 ? '' : 's'}
                {' '}· first seen {timeAgo(s.first_seen)} · last {timeAgo(s.last_seen)}
                {s.latitude !== null && s.longitude !== null && (
                  <span className="inline-flex items-center gap-0.5 ml-2">
                    <MapPin size={11} /> has location
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={registerHref(s)}
                className="text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg px-3 py-1.5 transition-colors"
              >
                Register
              </Link>
              <button
                onClick={() => dismiss.mutate(s.device_uuid)}
                disabled={dismiss.isPending}
                title="Dismiss — it will reappear if the device keeps publishing"
                className="text-sm text-amber-700 border border-amber-300 hover:bg-amber-100 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
              >
                <X size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
