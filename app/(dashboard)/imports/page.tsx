'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { FileUp } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import { formatTimestamp } from '@/lib/date'
import {
  EXPORT_COLUMNS, IGNORED_COLUMNS, OPTIONAL_COLUMNS, useDeleteImport, useImports, useUploadImport,
  type ImportKind, type ImportReport,
} from '@/hooks/imports'

const KIND_LABELS: Record<ImportKind, string> = {
  'sensor-readings': 'Sensor readings',
  'mosquito-events': 'Mosquito events',
}

const input = 'border border-gray-300 rounded-lg text-sm px-2 py-1.5'
const th = 'px-4 py-2 text-left text-xs font-semibold text-gray-500 whitespace-nowrap'
const td = 'px-4 py-2 text-sm text-gray-700'

function Report({ report }: { report: ImportReport }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <p className="text-gray-700">
        {report.rows_total} row(s): {report.rows_to_import} to import, {report.rows_skipped} skipped as
        exact duplicates of existing rows, {report.error_count} with errors.
      </p>
      {report.conflict_count > 0 && (
        <p className="text-amber-700">
          {report.conflict_count} row(s) share a device and timestamp with existing data but have
          different values; they will be imported as additional rows
          (rows {report.conflict_rows.join(', ')}{report.conflict_count > report.conflict_rows.length ? ', …' : ''}).
        </p>
      )}
      {report.error_count > 0 && (
        <>
          <p className="text-red-600">
            Nothing will be imported until every row is valid. Fix these rows and validate again.
          </p>
          <div className="max-h-72 overflow-auto border border-red-100 rounded-lg">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-red-50">
                <tr><th className={th}>Row</th><th className={th}>Problem</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.errors.map((e) => (
                  <tr key={e.row}><td className={td}>{e.row}</td><td className={td}>{e.error}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {report.error_count > report.errors.length && (
            <p className="text-xs text-gray-500">Showing the first {report.errors.length} of {report.error_count} errors.</p>
          )}
        </>
      )}
    </div>
  )
}

function UploadForm() {
  const upload = useUploadImport()
  const [kind, setKind] = useState<ImportKind>('sensor-readings')
  const [file, setFile] = useState<File | null>(null)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  const reset = () => { setReport(null); setError(null); setDone(null) }

  const run = (dryRun: boolean) => {
    if (!file) return
    setError(null)
    setDone(null)
    upload.mutate({ kind, file, dryRun }, {
      onSuccess: (r) => {
        if (dryRun) return setReport(r)
        setReport(null)
        setDone(`Imported ${r.rows_to_import} row(s); ${r.rows_skipped} duplicate(s) skipped; ${r.conflict_count} same-time conflict(s).`)
      },
      onError: (err) => {
        // A real import that fails validation returns the same per-row report.
        const detail = (err as Error & { detail?: unknown }).detail
        if (detail && typeof detail === 'object' && 'errors' in detail) setReport(detail as ImportReport)
        setError(err.message)
      },
    })
  }

  const canImport = report !== null && report.error_count === 0 && report.rows_to_import > 0

  return (
    <div className="flex flex-col gap-4 border border-gray-200 rounded-lg p-4">
      <h2 className="font-semibold text-gray-900">Upload a CSV</h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-gray-600">
          Data type
          <select className={input} value={kind} onChange={(e) => { setKind(e.target.value as ImportKind); reset() }}>
            {(Object.keys(KIND_LABELS) as ImportKind[]).map((k) => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-600 max-w-full">
          CSV file (max 5 MB, 50,000 rows)
          <input type="file" accept=".csv,text/csv" className={`${input} max-w-full`}
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); reset() }} />
        </label>
        <button type="button" disabled={!file || upload.isPending} onClick={() => run(true)}
          className="text-sm px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50">
          {upload.isPending && upload.variables?.dryRun ? 'Validating…' : 'Validate'}
        </button>
        <button type="button" disabled={!canImport || upload.isPending} onClick={() => run(false)}
          className="text-sm px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50">
          {upload.isPending && !upload.variables?.dryRun ? 'Importing…' : 'Import'}
        </button>
      </div>

      <div className="text-xs text-gray-600">
        <p>
          Use the same columns as the {KIND_LABELS[kind].toLowerCase()} CSV from the data export (
          <code className="font-mono">GET /api/v1/export?dataset={kind}&amp;format=csv</code>, see{' '}
          <Link href="/apis" className="text-primary hover:underline">API Access</Link>). Timestamps are
          ISO 8601 with a time and Z or an offset (e.g. <code className="font-mono">2026-05-01T12:00:00Z</code>),
          not in the future; mosquito <code className="font-mono">count</code> is always 1; empty cells are
          stored as empty, never 0. <code className="font-mono">{IGNORED_COLUMNS.join(', ')}</code> are
          optional and ignored — the device is matched by <code className="font-mono">device_uuid</code> and
          must be in your cluster. Exclusions are not imported: every imported row is included in analysis,
          and an admin can exclude it afterwards.{' '}
          <code className="font-mono">{OPTIONAL_COLUMNS.filter((c) => EXPORT_COLUMNS[kind].includes(c)).join(', ')}</code>{' '}
          is optional so older exports still import. Rows identical to existing data are skipped; a blank
          optional cell is not compared, but a filled one that differs from the stored value makes the row a
          conflict (imported and flagged).
        </p>
        <p className="mt-1">
          Out-of-range values (battery % outside 0–100, confidence outside 0–1) get the whole file rejected; the{' '}
          <Link href="/data-quality" className="text-primary hover:underline">Data Quality</Link> page lists such
          values already stored.
        </p>
        <p className="mt-1 font-mono break-words">{EXPORT_COLUMNS[kind].join(',')}</p>
      </div>

      {report && <Report report={report} />}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && <p className="text-sm text-green-700">{done}</p>}
    </div>
  )
}

function PastImports() {
  const { data, isLoading, error } = useImports()
  const remove = useDeleteImport()

  const del = (id: number, rows: number) => {
    if (window.confirm(`Delete this import and the ${rows} row(s) it added? This cannot be undone.`)) {
      remove.mutate(id, { onError: (err) => window.alert(err.message) })
    }
  }

  if (isLoading) return <Skeleton count={3} height={36} className="mb-2" />
  if (error) return <p className="text-sm text-red-500">Failed to load imports.</p>
  if (!data || data.length === 0) return <p className="text-sm text-gray-400 py-6 text-center">No imports yet.</p>

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className={th}>Imported</th>
            <th className={th}>Type</th>
            <th className={th}>File</th>
            <th className={th}>Rows added</th>
            <th className={th}>Duplicates skipped</th>
            <th className={th}></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((b) => (
            <tr key={b.id}>
              <td className={td}>{formatTimestamp(b.created_at)}</td>
              <td className={td}>{KIND_LABELS[b.kind]}</td>
              <td className={td}>{b.filename ?? '—'}</td>
              <td className={td}>{b.rows_imported}</td>
              <td className={td}>{b.rows_skipped}</td>
              <td className={td}>
                <button onClick={() => del(b.id, b.rows_imported)} disabled={remove.isPending}
                  className="text-xs text-red-600 underline disabled:opacity-50">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ImportsPage() {
  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <FileUp size={20} /> Import Data
        </h1>
        <p className="text-sm text-gray-500 mt-1 max-w-3xl">
          Add historical sensor readings or mosquito events from a CSV. Validate first to see a
          row-by-row report; the import is all-or-nothing. Imported rows are marked as imported,
          don&apos;t trigger alerts and don&apos;t change a device&apos;s online status. Deleting an
          import removes exactly the rows it added.
        </p>
      </div>
      <UploadForm />
      <h2 className="font-semibold text-gray-900">Past imports</h2>
      <PastImports />
    </div>
  )
}
