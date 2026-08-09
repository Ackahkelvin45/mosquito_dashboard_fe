"use client"

import React, { useDeferredValue, useState } from 'react'
import { BookOpen, ExternalLink, KeyRound, Plus, Search } from 'lucide-react'
import ApiKeysTable from '@/components/tables/ApiKeysTable'
import CreateApiKeyModal from '@/components/modal/CreateApiKeyModal'
import RevokeApiKeyModal from '@/components/modal/RevokeApiKeyModal'
import { useApiKeys, useRevokeApiKey, useRevokeUserKeys } from '@/hooks/apiKeys'
import { useRole } from '@/hooks/useRole'
import type { ApiKeyFilters, ApiKeyRow } from '@/queries/apiKeys/apiKeyQueries'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

function ApisPage() {
  const { isSuperAdmin } = useRole()
  const [showAll, setShowAll] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRow | null>(null)
  const [revokeAllTarget, setRevokeAllTarget] = useState<ApiKeyRow | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApiKeyFilters['status'] | ''>('')
  const [sort, setSort] = useState<NonNullable<ApiKeyFilters['sort']>>('created_at')

  const adminView = isSuperAdmin && showAll
  // Deferred so typing in the search box doesn't fire a request per keystroke.
  const deferredSearch = useDeferredValue(search)
  const filters: ApiKeyFilters | undefined = adminView
    ? { search: deferredSearch || undefined, status: statusFilter || undefined, sort }
    : undefined

  const { data: keys, isLoading } = useApiKeys(adminView, filters)
  const revokeMutation = useRevokeApiKey()
  const revokeUserMutation = useRevokeUserKeys()

  const handleRevoke = () => {
    if (!revokeTarget) return
    revokeMutation.mutate(revokeTarget.id, {
      onSettled: () => setRevokeTarget(null),
    })
  }

  const handleRevokeAll = () => {
    if (!revokeAllTarget) return
    revokeUserMutation.mutate(revokeAllTarget.user_id, {
      onSettled: () => setRevokeAllTarget(null),
    })
  }

  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
        <div className='flex items-center gap-3'>
          <div className='border border-gray-300 rounded-lg p-1.5 shrink-0'>
            <KeyRound strokeWidth={1.5} size={20} />
          </div>
          <div>
            <h1 className='text-base font-semibold text-gray-900'>API Access</h1>
            <p className='text-xs text-gray-500 mt-0.5'>
              Keys for programmatic, read-only access to{' '}
              {isSuperAdmin ? 'all clusters' : 'your cluster and public clusters'}.
            </p>
          </div>
        </div>

        <div className='flex items-center gap-4'>
          {isSuperAdmin && (
            <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none'>
              <input
                type='checkbox'
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
                className='accent-primary'
              />
              All users&apos; keys
            </label>
          )}
          <button
            onClick={() => setIsCreateOpen(true)}
            className='bg-primary text-sm py-2 px-4 text-white font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5'
          >
            <Plus size={16} />
            Create API Key
          </button>
        </div>
      </div>

      {/* Admin filter bar */}
      {adminView && (
        <div className='flex flex-col sm:flex-row gap-3 mt-4'>
          <div className='relative w-full sm:w-[300px] text-sm'>
            <Search strokeWidth={1.5} size={18} className='absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500' />
            <input
              type='search'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by owner email or key name…'
              className='w-full py-2 pr-3 pl-9 border border-gray-300 bg-[#D0CECE]/10 focus:ring-0 placeholder:text-xs text-sm focus:border-primary focus:outline-none rounded-lg'
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className='py-2 px-3 border border-gray-300 text-sm rounded-lg text-gray-700 focus:border-primary focus:outline-none'
          >
            <option value=''>All statuses</option>
            <option value='active'>Active</option>
            <option value='revoked'>Revoked</option>
            <option value='expired'>Expired</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className='py-2 px-3 border border-gray-300 text-sm rounded-lg text-gray-700 focus:border-primary focus:outline-none'
          >
            <option value='created_at'>Newest first</option>
            <option value='last_used'>Recently used first</option>
          </select>
        </div>
      )}

      {/* Keys table */}
      <ApiKeysTable
        data={keys}
        isLoading={isLoading}
        showOwner={adminView}
        onRevoke={setRevokeTarget}
        onRevokeAllForOwner={adminView ? setRevokeAllTarget : undefined}
      />

      {/* Quickstart card — full reference lives in Swagger + docs/public_api.md */}
      <div className='mt-8 border border-secondary/15 rounded-2xl p-6'>
        <div className='flex items-center gap-2 mb-3'>
          <BookOpen size={18} className='text-primary' />
          <h2 className='text-sm font-semibold text-gray-900'>Using the Data API</h2>
        </div>
        <p className='text-sm text-gray-600 leading-relaxed'>
          Authenticate every request with your key in the{' '}
          <code className='font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded'>X-API-Key</code>{' '}
          header. A key can only read the data its owner can see in this dashboard.
        </p>
        <pre className='bg-gray-900 text-gray-100 text-xs rounded-lg p-4 mt-3 overflow-x-auto'>
{`curl -H "X-API-Key: mk_your_key_here" \\
  "${API_URL}/api/v1/sensor-readings?start_date=2026-01-01T00:00:00&limit=100"`}
        </pre>
        <div className='grid sm:grid-cols-2 gap-x-8 gap-y-1 mt-4 text-sm text-gray-600'>
          <span><code className='font-mono text-xs'>GET /api/v1/sensor-readings</code> — sensor data (cursor-paginated)</span>
          <span><code className='font-mono text-xs'>GET /api/v1/mosquito-events</code> — detections with species</span>
          <span><code className='font-mono text-xs'>GET /api/v1/devices</code> — device metadata</span>
          <span><code className='font-mono text-xs'>GET /api/v1/export</code> — full CSV/JSONL download</span>
        </div>
        <p className='text-xs text-gray-500 mt-4'>
          Rate limits: 120 requests/min, 5 exports/min.{' '}
          {/* Static branded reference page — deliberately NOT the backend /docs,
              which exposes the entire internal API surface. */}
          <a
            href={`/api-reference.html?base=${encodeURIComponent(API_URL ?? '')}`}
            target='_blank'
            rel='noreferrer'
            className='text-primary hover:underline inline-flex items-center gap-0.5'
          >
            Full API reference <ExternalLink size={12} />
          </a>
        </p>
      </div>

      {/* Modals */}
      <CreateApiKeyModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <RevokeApiKeyModal
        isOpen={revokeTarget !== null}
        keyName={revokeTarget?.name ?? ''}
        isPending={revokeMutation.isPending}
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
      <RevokeApiKeyModal
        isOpen={revokeAllTarget !== null}
        keyName=''
        message={
          <>
            Are you sure you want to{' '}
            <span className='font-semibold text-red-600'>revoke every active key</span>{' '}
            belonging to{' '}
            <span className='font-semibold text-gray-900'>{revokeAllTarget?.owner_email}</span>?
            Anything using their keys will immediately lose access. This cannot be undone.
          </>
        }
        isPending={revokeUserMutation.isPending}
        onConfirm={handleRevokeAll}
        onCancel={() => setRevokeAllTarget(null)}
      />
    </div>
  )
}

export default ApisPage
