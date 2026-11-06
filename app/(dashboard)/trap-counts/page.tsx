'use client'
import React, { useState } from 'react'
import { FlaskConical, Plus, Trash2 } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { useRole } from '@/hooks/useRole'
import {
  useAllDevices, useCreateTrapCounts, useDeleteTrapCount, useTrapCollections, useUpdateTrapCount,
} from '@/hooks/trapCounts'
import { formatTimestamp } from '@/lib/date'
import {
  GENERA, SEXES, type Genus, type ManualCount, type Sex, type TrapCollection,
} from '@/queries/trapCounts/trapCountQueries'

const GENUS_LABELS: Record<Genus, string> = {
  anopheles: 'Anopheles', aedes: 'Aedes', culex: 'Culex', other: 'Other / unidentified',
}
const SEX_LABELS: Record<Sex, string> = { female: 'Female', male: 'Male', unknown: 'Unknown' }

type Row = { genus: Genus; sex: Sex; count: string; notes: string }
const emptyRow = (): Row => ({ genus: 'anopheles', sex: 'female', count: '', notes: '' })

const input = 'border border-gray-300 rounded-lg text-sm px-2 py-1.5'
const th = 'px-4 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap'
const td = 'px-4 py-2 text-sm text-gray-700'

function Diff({ value }: { value: number }) {
  if (value === 0) return <span className="text-gray-400">0</span>
  return <span className="font-semibold text-amber-700">{value > 0 ? `+${value}` : value}</span>
}

function EntryForm() {
  const { isSuperAdmin, clusterId, isLoading: roleLoading } = useRole()
  // Only devices the user may add counts for: own cluster (super admin: all).
  const { data: allDevices } = useAllDevices(
    isSuperAdmin ? undefined : { cluster_id: clusterId ?? undefined },
    !roleLoading && (isSuperAdmin || clusterId != null),
  )
  const devices = (allDevices ?? []).filter((d) => isSuperAdmin || d.cluster_id === clusterId)
  const create = useCreateTrapCounts()
  const [deviceId, setDeviceId] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [rows, setRows] = useState<Row[]>([emptyRow()])
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const setRow = (i: number, patch: Partial<Row>) =>
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)
    if (new Date(end) <= new Date(start)) return setError('The trap must be emptied after it was set.')
    create.mutate(
      {
        device_id: Number(deviceId),
        // datetime-local is browser-local time; send it as UTC.
        period_start: new Date(start).toISOString(),
        period_end: new Date(end).toISOString(),
        entries: rows.map((r) => ({
          genus: r.genus, sex: r.sex, count: Number(r.count), notes: r.notes.trim() || undefined,
        })),
      },
      {
        onSuccess: () => { setRows([emptyRow()]); setSaved(true) },
        onError: (err) => setError(err.message),
      },
    )
  }

  if (!isSuperAdmin && clusterId == null) {
    return <p className="text-sm text-gray-500">You are not assigned to a cluster, so you cannot enter trap counts.</p>
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 border border-gray-200 rounded-lg p-4">
      <h2 className="font-semibold text-gray-900">Enter a collection</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Device
          <select required className={input} value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
            <option value="">Select a device</option>
            {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Trap set (your local time)
          <input required type="datetime-local" className={input} value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Trap emptied (your local time)
          <input required type="datetime-local" className={input} value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select aria-label="Genus" className={input} value={r.genus} onChange={(e) => setRow(i, { genus: e.target.value as Genus })}>
              {GENERA.map((g) => <option key={g} value={g}>{GENUS_LABELS[g]}</option>)}
            </select>
            <select aria-label="Sex" className={input} value={r.sex} onChange={(e) => setRow(i, { sex: e.target.value as Sex })}>
              {SEXES.map((s) => <option key={s} value={s}>{SEX_LABELS[s]}</option>)}
            </select>
            <input aria-label="Count" required type="number" min={0} step={1} placeholder="Count"
              className={`${input} w-24`} value={r.count} onChange={(e) => setRow(i, { count: e.target.value })} />
            <input aria-label="Notes" type="text" maxLength={500} placeholder="Notes (optional)"
              className={`${input} flex-1 min-w-40`} value={r.notes} onChange={(e) => setRow(i, { notes: e.target.value })} />
            {rows.length > 1 && (
              <button type="button" aria-label="Remove row" onClick={() => setRows(rows.filter((_, j) => j !== i))}
                className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setRows([...rows, emptyRow()])}
          className="self-start flex items-center gap-1 text-sm text-primary hover:underline">
          <Plus size={14} /> Add genus / sex
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-700">Counts saved.</p>}
      <button type="submit" disabled={create.isPending}
        className="self-start text-sm px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50">
        {create.isPending ? 'Saving…' : 'Save counts'}
      </button>
    </form>
  )
}

function CollectionCard({ c }: { c: TrapCollection }) {
  const { isSuperAdmin, isAdmin, clusterId } = useRole()
  const canEdit = isSuperAdmin || (isAdmin && c.cluster_id === clusterId)
  const update = useUpdateTrapCount()
  const remove = useDeleteTrapCount()
  const entryFor = (g: Genus, s: Sex): ManualCount | undefined =>
    c.entries.find((e) => e.genus === g && e.sex === s)

  const edit = (entry: ManualCount) => {
    const value = window.prompt(`New count for ${GENUS_LABELS[entry.genus]} ${SEX_LABELS[entry.sex]}`, String(entry.count))
    if (value === null) return
    const count = Number(value)
    if (!Number.isInteger(count) || count < 0) return window.alert('Count must be a whole number, 0 or more.')
    update.mutate({ id: entry.id, count }, { onError: (err) => window.alert(err.message) })
  }
  const del = (entry: ManualCount) => {
    if (window.confirm(`Delete the ${GENUS_LABELS[entry.genus]} ${SEX_LABELS[entry.sex]} count?`)) {
      remove.mutate(entry.id, { onError: (err) => window.alert(err.message) })
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">{c.device_name}</p>
          <p className="text-xs text-gray-500">{formatTimestamp(c.period_start)} → {formatTimestamp(c.period_end)}</p>
        </div>
        {!c.device_reporting && (
          <span className="text-xs font-medium px-2 py-1 rounded bg-red-50 text-red-700">
            Device not reporting in this period — AI counts are not a measured zero
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className={th}>Genus</th>
              <th className={th}>Sex</th>
              <th className={th}>Manual</th>
              <th className={th}>AI</th>
              <th className={th}>Difference (AI − manual)</th>
              <th className={th}>Notes</th>
              {canEdit && <th className={th}></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {c.groups.map((g) => {
              const entry = entryFor(g.genus, g.sex)
              return (
                <tr key={`${g.genus}-${g.sex}`}>
                  <td className={td}>{GENUS_LABELS[g.genus]}</td>
                  <td className={td}>{SEX_LABELS[g.sex]}</td>
                  <td className={td}>{g.manual}</td>
                  <td className={td}>{c.device_reporting ? g.ai : <span className="text-gray-400">{g.ai}</span>}</td>
                  <td className={td}><Diff value={g.difference} /></td>
                  <td className={`${td} text-gray-500`}>{entry?.notes ?? ''}</td>
                  {canEdit && (
                    <td className={`${td} whitespace-nowrap`}>
                      {entry && (
                        <>
                          <button onClick={() => edit(entry)} className="text-xs underline mr-3">Edit</button>
                          <button onClick={() => del(entry)} className="text-xs text-red-600 underline">Delete</button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
            <tr className="bg-gray-50 font-semibold">
              <td className={td} colSpan={2}>Total (counted groups)</td>
              <td className={td}>{c.manual_total}</td>
              <td className={td}>{c.ai_total}</td>
              <td className={td}><Diff value={c.difference} /></td>
              <td className={td} colSpan={canEdit ? 2 : 1}></td>
            </tr>
          </tbody>
        </table>
      </div>
      {c.ai_not_counted.length > 0 && (
        <p className="px-4 py-3 border-t border-gray-100 text-xs text-gray-600">
          <span className="font-semibold">AI detections in groups not counted manually</span> (not compared):{' '}
          {c.ai_not_counted.map((g) => `${GENUS_LABELS[g.genus]} ${SEX_LABELS[g.sex].toLowerCase()} ${g.ai}`).join(' · ')}
        </p>
      )}
    </div>
  )
}

export default function TrapCountsPage() {
  const { data, isLoading, error } = useTrapCollections()

  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <FlaskConical size={20} /> Trap Counts
        </h1>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl">
          Mosquitoes counted by hand when a trap is emptied, compared with what the device&apos;s AI
          detected over the same period (live detections only; test-mode events are left out).
          Only the genus/sex groups entered for a collection are compared and totalled; AI
          detections in other groups are listed separately, never treated as a manual 0.
        </p>
      </div>

      <EntryForm />

      <h2 className="font-semibold text-gray-900">Collections</h2>
      {isLoading ? (
        <Skeleton count={3} height={48} className="mb-2" />
      ) : error ? (
        <p className="text-sm text-red-500">Failed to load trap counts.</p>
      ) : !data || data.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">No manual counts entered yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((c) => <CollectionCard key={`${c.device_id}-${c.period_start}-${c.period_end}`} c={c} />)}
        </div>
      )}
    </div>
  )
}
