'use client'
import React, { useState } from 'react'
import { ScrollText } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import Pagination from '@/components/Pagination'
import { useAuditActions, useAuditLogs } from '@/hooks/audit'
import { formatTimestamp, timeAgo } from '@/lib/date'
import type { AuditLogEntry } from '@/queries/audit/auditQueries'

// Action name -> readable label + severity tint for the pill.
function actionMeta(action: string): { label: string; className: string } {
  const label = action.toLowerCase().split('_').join(' ')
  if (action.includes('FAILED')) return { label, className: 'bg-red-50 text-red-600' }
  if (action.includes('DELETED') || action.includes('REVOKED') || action.includes('DISMISSED'))
    return { label, className: 'bg-amber-50 text-amber-700' }
  if (action.includes('LOGIN') || action.includes('TWO_FACTOR') || action.includes('PASSWORD'))
    return { label, className: 'bg-blue-50 text-blue-700' }
  return { label, className: 'bg-gray-100 text-gray-600' }
}

function detailSummary(entry: AuditLogEntry): string {
  const parts: string[] = []
  if (entry.target_type) parts.push(`${entry.target_type} ${entry.target_id ?? ''}`.trim())
  if (entry.detail) {
    const d = entry.detail as Record<string, unknown>
    if (typeof d.reason === 'string') parts.push(`reason: ${d.reason}`)
    if (d.changed && typeof d.changed === 'object')
      parts.push(`changed: ${Object.keys(d.changed as object).join(', ')}`)
    if (Array.isArray(d.fields)) parts.push(`fields: ${(d.fields as string[]).join(', ')}`)
    if (typeof d.email === 'string') parts.push(d.email)
    if (d.changes && typeof d.changes === 'object')
      parts.push(Object.entries(d.changes as Record<string, unknown>)
        .map(([k, v]) => `${k}=${v}`).join(', '))
  }
  return parts.join(' · ')
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const [actorEmail, setActorEmail] = useState('')

  const { data, isLoading } = useAuditLogs(page, {
    action: action || undefined,
    actor_email: actorEmail.trim() || undefined,
  })
  const { data: actions } = useAuditActions()

  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8 gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <ScrollText size={20} /> Audit Log
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Who did what, and when — sign-ins, configuration changes, and alert-setting
          changes. Kept for 24 months.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg text-sm px-2 py-1.5"
        >
          <option value="">All actions</option>
          {(actions ?? []).map((a) => (
            <option key={a} value={a}>{actionMeta(a).label}</option>
          ))}
        </select>
        <input
          value={actorEmail}
          onChange={(e) => { setActorEmail(e.target.value); setPage(1) }}
          placeholder="Filter by actor email…"
          className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 flex-1 max-w-xs"
        />
      </div>

      {isLoading ? (
        <Skeleton count={8} height={40} className="mb-1" />
      ) : (data?.items?.length ?? 0) === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No audit entries match.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-secondary/15">
          <table className="w-full text-sm">
            <thead className="bg-[#DAE3F8]/30 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data?.items ?? []).map((entry) => {
                const meta = actionMeta(entry.action)
                return (
                  <tr key={entry.id}>
                    <td className="px-4 py-2.5 whitespace-nowrap text-gray-500"
                        title={formatTimestamp(entry.occurred_at)}>
                      {timeAgo(entry.occurred_at)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 break-all">
                      {entry.actor_email ?? <span className="text-gray-400">system</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-semibold rounded px-2 py-0.5 capitalize ${meta.className}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{detailSummary(entry)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={data?.total_pages ?? 1}
        total={data?.total ?? 0}
        pageSize={20}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  )
}
