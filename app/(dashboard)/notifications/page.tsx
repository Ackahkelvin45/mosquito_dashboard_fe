"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, ArchiveRestore, CheckCheck, Loader2, Mail, MailOpen, Search, Trash2, X } from 'lucide-react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import NotificationItem from '@/components/notifications/NotificationItem'
import NotificationPreferencesCard from '@/components/notifications/NotificationPreferences'
import AlertSettingsCard from '@/components/notifications/AlertSettingsCard'
import DeleteNotificationModal from '@/components/modal/DeleteNotificationModal'
import { safeUrl } from '@/lib/url'
import {
  useArchive,
  useDeleteNotification,
  useMarkAllRead,
  useMarkRead,
  useMarkUnread,
  useNotificationsInfinite,
  useUnarchive,
  useUnreadCount,
} from '@/hooks/notification'
import type {
  GetNotificationsFilters,
  Notification,
  NotificationCategory,
  NotificationSeverity,
} from '@/queries/notification/notificationQueries'

type Tab = 'all' | 'unread' | 'archived'

const TABS: { value: Tab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'archived', label: 'Archived' },
]

const CATEGORIES: NotificationCategory[] = [
  'MOSQUITO', 'SENSOR', 'DEVICE', 'ACCOUNT', 'RESEARCH', 'CLUSTER', 'SYSTEM',
]

const SEVERITIES: NotificationSeverity[] = ['INFO', 'SUCCESS', 'WARNING', 'CRITICAL']

// "MOSQUITO" → "Mosquito"
function enumLabel(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase()
}

const SKELETON_ROWS = 6

function NotificationsPage() {
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('all')
  const [category, setCategory] = useState<NotificationCategory | ''>('')
  const [severity, setSeverity] = useState<NotificationSeverity | ''>('')
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null)

  // The search hits the API, so debounce keystrokes.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue.trim()), 350)
    return () => clearTimeout(timer)
  }, [searchValue])

  const filters = useMemo<GetNotificationsFilters>(() => ({
    unread_only: tab === 'unread' ? true : undefined,
    archived: tab === 'archived',
    category: category || undefined,
    severity: severity || undefined,
    search: debouncedSearch || undefined,
    sort: 'newest',
  }), [tab, category, severity, debouncedSearch])

  // When the filters change the infinite query restarts from page 1 on its own
  // (new query key); the transient UI state tied to the old list is reset here
  // in render phase (per the React "you might not need an effect" guidance).
  const [prevFilters, setPrevFilters] = useState(filters)
  if (filters !== prevFilters) {
    setPrevFilters(filters)
    if (deleteTarget) setDeleteTarget(null)
  }

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useNotificationsInfinite(filters)

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data])
  const total = data?.pages[0]?.total ?? 0

  const { data: unreadData } = useUnreadCount()
  const unreadCount = unreadData?.count ?? 0

  const markRead = useMarkRead()
  const markUnread = useMarkUnread()
  const markAllRead = useMarkAllRead()
  const archive = useArchive()
  const unarchive = useUnarchive()
  const deleteNotification = useDeleteNotification()

  // Infinite scroll: fetch the next page when the sentinel scrolls into view.
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = []
    const trimmed = searchValue.trim()

    if (trimmed) {
      chips.push({ key: 'search', label: `Search: ${trimmed}`, clear: () => setSearchValue('') })
    }
    if (category) {
      chips.push({ key: 'category', label: `Category: ${enumLabel(category)}`, clear: () => setCategory('') })
    }
    if (severity) {
      chips.push({ key: 'severity', label: `Severity: ${enumLabel(severity)}`, clear: () => setSeverity('') })
    }
    return chips
  }, [searchValue, category, severity])

  const clearAll = () => {
    setSearchValue('')
    setCategory('')
    setSeverity('')
  }

  const handleRowClick = (notification: Notification) => {
    if (!notification.read_at) markRead.mutate(notification.id)
    if (notification.action_url) router.push(safeUrl(notification.action_url))
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteNotification.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    })
  }

  const emptyText =
    tab === 'archived'
      ? 'No archived notifications.'
      : tab === 'unread'
        ? "You're all caught up."
        : 'No notifications yet.'

  return (
    <div className='w-full flex flex-col gap-4 font-raleway'>
      <div className='w-full flex flex-col bg-white rounded-lg py-6 px-4 sm:py-8 sm:px-8'>

        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div>
            <h1 className='text-xl font-semibold text-primary'>Notifications</h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {unreadCount > 0 ? (
                <>
                  You have <span className='font-mulish font-semibold'>{unreadCount}</span> unread{' '}
                  {unreadCount === 1 ? 'notification' : 'notifications'}.
                </>
              ) : (
                "You're all caught up."
              )}
            </p>
          </div>
          <button
            type='button'
            onClick={() => markAllRead.mutate()}
            disabled={unreadCount === 0 || markAllRead.isPending}
            className='bg-primary text-sm py-2 px-4 text-white font-medium rounded-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-fit'
          >
            {markAllRead.isPending ? <Loader2 size={15} className='animate-spin' /> : <CheckCheck size={15} />}
            Mark all read
          </button>
        </div>

        {/* Tabs */}
        <div className='flex flex-row flex-wrap gap-2 mt-5'>
          {TABS.map((t) => (
            <button
              key={t.value}
              type='button'
              onClick={() => setTab(t.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                tab === t.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t.label}
              {t.value === 'unread' && unreadCount > 0 && (
                <span
                  className={`ml-2 text-xs font-bold font-mulish rounded-full px-2 py-0.5 ${
                    tab === 'unread' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                  }`}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center mt-4'>
          <div className='relative w-full sm:w-[320px] text-sm'>
            <Search strokeWidth={1.5} size={20} className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-500' />
            <input
              type='search'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder='Search notifications...'
              className='w-full py-2.5 pr-3 pl-9 border border-gray bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-lg'
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NotificationCategory | '')}
            aria-label='Filter by category'
            className='border border-gray bg-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary'
          >
            <option value=''>All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{enumLabel(c)}</option>
            ))}
          </select>

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as NotificationSeverity | '')}
            aria-label='Filter by severity'
            className='border border-gray bg-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary'
          >
            <option value=''>All severities</option>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{enumLabel(s)}</option>
            ))}
          </select>
        </div>

        <div className='flex flex-row gap-2 items-center mt-3'>
          <span className='text-sm font-medium'>Filter</span>
          <span className='text-sm font-mulish'>{activeChips.length}</span>
          <span className='text-sm text-secondary/30'>|</span>
          <button
            type='button'
            onClick={clearAll}
            className='text-secondary hover:underline text-sm font-medium'
          >
            Clear all
          </button>
        </div>

        {activeChips.length > 0 && (
          <div className='flex flex-row flex-wrap gap-2 items-center mt-3'>
            {activeChips.map((chip) => (
              <div key={chip.key} className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                <span className='text-sm font-medium text-secondary'>{chip.label}</span>
                <button type='button' onClick={chip.clear} aria-label={`Clear ${chip.key} filter`} className='p-1.5 -m-1.5'>
                  <X size={16} strokeWidth={1.5} className='text-gray-500' />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* List */}
        <div className='rounded-2xl border border-secondary/15 overflow-hidden mt-5'>
          {isLoading ? (
            <div className='flex flex-col divide-y divide-gray-100'>
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <div key={i} className='flex items-start gap-3 px-4 py-4 sm:px-5'>
                  <Skeleton circle width={36} height={36} />
                  <div className='flex-1'>
                    <Skeleton width='40%' height={14} />
                    <Skeleton width='85%' height={12} />
                    <Skeleton width={70} height={10} />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className='text-center text-sm text-gray-400 py-12'>
              Couldn&apos;t load notifications. Please try again.
            </p>
          ) : items.length === 0 ? (
            <p className='text-center text-sm text-gray-400 py-12'>{emptyText}</p>
          ) : (
            <div className='flex flex-col divide-y divide-gray-100'>
              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleRowClick(notification)}
                  actions={
                    <div
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      className='flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity'
                    >
                      {notification.read_at ? (
                        <button
                          type='button'
                          aria-label='Mark as unread'
                          title='Mark as unread'
                          onClick={() => markUnread.mutate(notification.id)}
                          className='hover:bg-primary/10 p-2 rounded-md transition-colors'
                        >
                          <Mail size={16} className='text-primary' />
                        </button>
                      ) : (
                        <button
                          type='button'
                          aria-label='Mark as read'
                          title='Mark as read'
                          onClick={() => markRead.mutate(notification.id)}
                          className='hover:bg-primary/10 p-2 rounded-md transition-colors'
                        >
                          <MailOpen size={16} className='text-primary' />
                        </button>
                      )}
                      {notification.archived_at ? (
                        <button
                          type='button'
                          aria-label='Unarchive'
                          title='Unarchive'
                          onClick={() => unarchive.mutate(notification.id)}
                          className='hover:bg-gray-100 p-2 rounded-md transition-colors'
                        >
                          <ArchiveRestore size={16} className='text-gray-500' />
                        </button>
                      ) : (
                        <button
                          type='button'
                          aria-label='Archive'
                          title='Archive'
                          onClick={() => archive.mutate(notification.id)}
                          className='hover:bg-gray-100 p-2 rounded-md transition-colors'
                        >
                          <Archive size={16} className='text-gray-500' />
                        </button>
                      )}
                      <button
                        type='button'
                        aria-label='Delete'
                        title='Delete'
                        onClick={() => setDeleteTarget(notification)}
                        className='hover:bg-red-500/10 p-2 rounded-md transition-colors'
                      >
                        <Trash2 size={16} className='text-red-500' />
                      </button>
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Infinite-scroll sentinel + manual fallback */}
        <div ref={sentinelRef} aria-hidden className='h-px' />
        {hasNextPage && (
          <button
            type='button'
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className='mx-auto mt-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-secondary/20 bg-white text-sm font-raleway font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isFetchingNextPage && <Loader2 size={14} className='animate-spin' />}
            {isFetchingNextPage ? 'Loading...' : 'Load more'}
          </button>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <p className='text-xs text-gray-400 mt-3 font-mulish'>
            Showing {items.length} of {total}
          </p>
        )}
      </div>

      {/* Preferences */}
      <NotificationPreferencesCard />

      {/* SUPER_ADMIN only — renders null for everyone else */}
      <AlertSettingsCard />

      <DeleteNotificationModal
        isOpen={deleteTarget !== null}
        notificationTitle={deleteTarget?.title ?? ''}
        isPending={deleteNotification.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default NotificationsPage
