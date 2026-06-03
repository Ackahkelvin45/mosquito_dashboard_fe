"use client"

import React, { useMemo, useState } from 'react'
import { Grid3X3, Search, X } from 'lucide-react'
import Link from 'next/link'
import UsersTable, { type UserRow } from '@/components/tables/UsersTable'
import { useUsers } from '@/hooks/user'
import Pagination from '@/components/Pagination'
import { resolvePage, DEFAULT_PAGE_SIZE } from '@/lib/pagination'

function UsersPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useUsers({ page, page_size: DEFAULT_PAGE_SIZE })
  const usersPage = useMemo(() => resolvePage<UserRow>(data, page, DEFAULT_PAGE_SIZE), [data, page])

  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8'>
        <div className='flex flex-col sm:flex-row sm:justify-between gap-4'>
          <div className='flex flex-row gap-4 sm:gap-7 items-center w-full sm:w-auto'>

              <div className='border border-gray-300 rounded-lg p-1 shrink-0'>
                  <Grid3X3 strokeWidth={1.5} size={20} />
              </div>

              <div className='relative w-full sm:w-[350px] text-sm'>
                  <Search strokeWidth={1.5} size={20} className='absolute left-1 top-1/2 -translate-y-1/2 text-gray-500' />
                  <input
                      type='search'
                      placeholder='Search Users...'
                      className='w-full py-2.5 pr-3 pl-8 border border-gray bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-lg'
                  />
              </div>
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
                <span className='text-sm'>0</span>
                <span className='text-sm text-secondary/30'>|</span>
                <span className='text-secondary hover:underline text-sm font-medium cursor-pointer'>Clear all</span>
            </div>
        </div>

        {/* Optional active filter display similar to devices page */}
        {/* <div className='flex flex-row gap-2 items-center mt-2'>
            <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                <span className='text-sm font-medium text-secondary'>
                    Role: Admin
                </span>
                <X size={16} strokeWidth={1.5} className='text-gray-500 cursor-pointer' />
            </div>
        </div> */}

        <div>
            <UsersTable data={usersPage.items} isLoading={isLoading} />
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
