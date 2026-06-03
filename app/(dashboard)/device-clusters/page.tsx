"use client"

import React, { useState } from 'react'
import { Grid3X3, Search, X, Plus } from 'lucide-react'
import Link from 'next/link'
import DeviceClusterTable, { DeviceCluster } from '@/components/tables/DeviceClusterTable'
import { useClusters } from '@/hooks/device'
import { extractItems, MAX_PAGE_SIZE } from '@/lib/pagination'

function DeviceClustersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  // Cluster search is client-side, so pull a full page (API caps at 100).
  const { data: clustersRaw, isLoading } = useClusters({ page_size: MAX_PAGE_SIZE })
  const clusters = extractItems<DeviceCluster>(clustersRaw)

  const filteredData = clusters.filter((cluster: DeviceCluster) =>
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cluster.description && cluster.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
                      placeholder='Search Cluster Name, Description...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='w-full py-2.5 pr-3 pl-8 border border-gray bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-lg'
                  />
              </div>
          </div>

          <div>
              <Link href="/device-clusters/add" className='bg-primary flex items-center gap-2 text-sm py-2 px-4 text-white font-medium rounded-md hover:opacity-90 transition-opacity'>
                  <Plus size={18} />
                  Add New Cluster
              </Link>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
            <div className='flex flex-row gap-2 items-center mt-2'>
                <span className='text-sm font-medium'>Filter</span>
                <span className='text-sm'>1 active</span>
                <span className='text-sm text-secondary/30'>|</span>
                <span className='text-secondary hover:underline text-sm font-medium cursor-pointer'>Clear all</span>
            </div>
        </div>

        <div className='flex flex-row gap-2 items-center mt-2'>
            <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                <span className='text-sm font-medium text-secondary'>
                    Visibility: All
                </span>
                <X size={16} strokeWidth={1.5} className='text-gray-500 cursor-pointer' />
            </div>
        </div>

        <div className='mt-6'>
            <DeviceClusterTable data={filteredData} isLoading={isLoading} />
        </div>

    </div>
  )
}

export default DeviceClustersPage;

