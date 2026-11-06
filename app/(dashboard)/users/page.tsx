"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Grid3X3, Search, X } from 'lucide-react'
import Link from 'next/link'
import UsersTable, { type UserRow } from '@/components/tables/UsersTable'
import { useUsers } from '@/hooks/user'
import Pagination from '@/components/Pagination'
import { resolvePage, fetchAllPages, DEFAULT_PAGE_SIZE } from '@/lib/pagination'
import { getUsers } from '@/queries/user/userQueries'

const ROLE_LABELS: Record<string, string> = { USER: 'User', ADMIN: 'Admin', SUPER_ADMIN: 'Super Admin' }
const STATUS_LABELS: Record<string, string> = { APPROVED: 'Approved', PENDING: 'Pending', REJECTED: 'Rejected' }
const SELECT_CLASS = 'border border-gray bg-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary'

function UsersPage() {
  const [page, setPage] = useState(1)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState('')
  const [approvalStatus, setApprovalStatus] = useState('')

  // The search hits the API, so debounce keystrokes (same as the devices page).
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue.trim()), 350)
    return () => clearTimeout(timer)
  }, [searchValue])

  const filters = useMemo(() => ({
    search: debouncedSearch || undefined,
    role: role || undefined,
    approval_status: approvalStatus || undefined,
  }), [debouncedSearch, role, approvalStatus])

  // Back to page 1 whenever the filters change (render-phase reset).
  const [prevFilters, setPrevFilters] = useState(filters)
  if (filters !== prevFilters) {
    setPrevFilters(filters)
    setPage(1)
  }

  const { data, isLoading } = useUsers({ page, page_size: DEFAULT_PAGE_SIZE }, filters)
  const usersPage = useMemo(() => resolvePage<UserRow>(data, page, DEFAULT_PAGE_SIZE), [data, page])

  const activeChips: { key: string; label: string; clear: () => void }[] = []
  if (searchValue.trim()) activeChips.push({ key: 'search', label: `Search: ${searchValue.trim()}`, clear: () => setSearchValue('') })
  if (role) activeChips.push({ key: 'role', label: `Role: ${ROLE_LABELS[role]}`, clear: () => setRole('') })
  if (approvalStatus) activeChips.push({ key: 'status', label: `Status: ${STATUS_LABELS[approvalStatus]}`, clear: () => setApprovalStatus('') })

  const clearAll = () => {
    setSearchValue('')
    setRole('')
    setApprovalStatus('')
  }

  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8'>
        <div className='flex flex-col sm:flex-row sm:justify-between gap-4'>
          <div className='flex flex-row flex-wrap gap-4 sm:gap-7 items-center w-full sm:w-auto'>

              <div className='border border-gray-300 rounded-lg p-1 shrink-0'>
                  <Grid3X3 strokeWidth={1.5} size={20} />
              </div>

              <div className='relative w-full sm:w-[350px] text-sm'>
                  <Search strokeWidth={1.5} size={20} className='absolute left-1 top-1/2 -translate-y-1/2 text-gray-500' />
                  <input
                      type='search'
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder='Search by name or email...'
                      className='w-full py-2.5 pr-3 pl-8 border border-gray bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-lg'
                  />
              </div>

              <select value={role} onChange={(e) => setRole(e.target.value)} aria-label='Filter by role' className={SELECT_CLASS}>
                  <option value=''>All roles</option>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>

              <select value={approvalStatus} onChange={(e) => setApprovalStatus(e.target.value)} aria-label='Filter by approval status' className={SELECT_CLASS}>
                  <option value=''>All statuses</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
          </div>

          <div>
              <Link href="/users/add" className='bg-primary text-sm py-2 px-4 text-white font-medium rounded-md hover:bg-primary/90 transition-colors'>
                  Add New User
              </Link>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
            <div className='flex flex-row gap-2 items-center mt-2'>
                <span className='text-sm font-medium'>Filter</span>
                <span className='text-sm'>{activeChips.length}</span>
                <span className='text-sm text-secondary/30'>|</span>
                <button type='button' onClick={clearAll} className='text-secondary hover:underline text-sm font-medium'>
                  Clear all
                </button>
            </div>
        </div>

        {activeChips.length > 0 && (
          <div className='flex flex-row flex-wrap gap-2 items-center mt-3'>
            {activeChips.map((chip) => (
              <div key={chip.key} className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                <span className='text-sm font-medium text-secondary'>{chip.label}</span>
                <button type='button' onClick={chip.clear} className='p-1.5 -m-1.5' aria-label={`Clear ${chip.key} filter`}>
                  <X size={16} strokeWidth={1.5} className='text-gray-500' />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
            <UsersTable
              data={usersPage.items}
              isLoading={isLoading}
              fetchAllRows={(onProgress) => fetchAllPages<UserRow>((p) => getUsers(p, filters), onProgress)}
            />
            <Pagination
              page={usersPage.page}
              totalPages={usersPage.total_pages}
              total={usersPage.total}
              pageSize={usersPage.page_size}
              onPageChange={setPage}
              isLoading={isLoading}
            />
        </div>

    </div>
  )
}

export default UsersPage
