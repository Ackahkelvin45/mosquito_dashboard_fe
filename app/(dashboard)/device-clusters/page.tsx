"use client"

import React, { useState } from 'react'
import { Grid3X3, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import DeviceClusterTable, { DeviceCluster } from '@/components/tables/DeviceClusterTable'
import { getClusters } from '@/queries/device/deviceQueries'
import { fetchAllPages } from '@/lib/pagination'

function DeviceClustersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  // Search is client-side and the BE has no cluster search, so load every
  // page (100 at a time) instead of just the first. The table and its export
  // both read this full list. Key sits under "clusters" so the existing
  // cluster mutations' invalidateQueries(["clusters"]) still refresh it.
  // ponytail: one request per 100 clusters; switch to server-side search/paging if counts reach the thousands.
  const { data: clusters = [], isLoading } = useQuery({
    queryKey: ["clusters", "all"],
    queryFn: () => fetchAllPages<DeviceCluster>(getClusters),
  })

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
                <span className='text-sm'>{searchTerm ? 1 : 0}</span>
                <span className='text-sm text-secondary/30'>|</span>
                <button type='button' onClick={() => setSearchTerm('')} className='text-secondary hover:underline text-sm font-medium'>
                  Clear all
                </button>
            </div>
        </div>

        <div className='mt-6'>
            <DeviceClusterTable data={filteredData} isLoading={isLoading} />
        </div>

    </div>
  )
}

export default DeviceClustersPage;

