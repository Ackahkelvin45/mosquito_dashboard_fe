"use client"

import React from 'react'
import { Grid3X3, Search, X } from 'lucide-react'
import ReaseacherRequetsTable from '@/components/tables/ReaseacherRequetsTable'
import { useResearcherRequests } from '@/hooks/researcher'

function ResearcherRequestsPage() {
  const { data, isLoading } = useResearcherRequests()

  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8'>
        <div className='flex flex-row justify-between mb-6'>
          <div className='flex flex-row gap-7 items-center flex-1'>
              <div>
                <h1 className='text-xl font-bold text-secondary'>Researcher Requests</h1>
                <p className='text-sm text-gray-500'>Review and approve researcher account applications.</p>
              </div>

              <div className='border border-gray-300 rounded-lg p-1 ml-4'>
                  <Grid3X3 strokeWidth={1.5} size={20} />
              </div>

              <div className='relative w-[350px] text-sm'>
                  <Search strokeWidth={1.5} size={20} className='absolute left-1 top-1/2 -translate-y-1/2 text-gray-500' />
                  <input
                      type='search'
                      placeholder='Search Researcher...'
                      className='w-full py-2.5 pr-3 pl-8 border border-gray bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-lg'
                  />
              </div>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
            <div className='flex flex-row gap-2 items-center'>
                <span className='text-sm font-medium'>Filter Status:</span>
                <div className='flex gap-2 ml-2'>
                    <span className='px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold cursor-pointer border border-primary/20'>All</span>
                    <span className='px-3 py-1 hover:bg-gray-100 text-gray-500 rounded-full text-xs font-semibold cursor-pointer border border-gray-200'>Pending</span>
                    <span className='px-3 py-1 hover:bg-gray-100 text-gray-500 rounded-full text-xs font-semibold cursor-pointer border border-gray-200'>Approved</span>
                    <span className='px-3 py-1 hover:bg-gray-100 text-gray-500 rounded-full text-xs font-semibold cursor-pointer border border-gray-200'>Rejected</span>
                </div>
            </div>
        </div>

        <div className='mt-6'>
            <ReaseacherRequetsTable data={data ?? []} isLoading={isLoading} />
        </div>
    </div>
  )
}

export default ResearcherRequestsPage