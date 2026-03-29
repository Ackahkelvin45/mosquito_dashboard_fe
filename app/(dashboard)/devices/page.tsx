"use client"

import React from 'react'
import { Grid3X3, Search, X } from 'lucide-react'
import Link from 'next/link'
import DeviceTable from '@/components/tables/DeviceTable'
import { useDevices } from '@/hooks/device'

function page() {
  const { data, isLoading } = useDevices()

  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8'>
        <div className='flex flex-row justify-between'>
          <div className='flex flex-row gap-7 items-center'>

              <div className='border border-gray-300 rounded-lg p-1'>
                  <Grid3X3 strokeWidth={1.5} size={20} />
              </div>

              <div className='relative w-[350px] text-sm'>
                  <Search strokeWidth={1.5} size={20} className='absolute left-1 top-1/2 -translate-y-1/2 text-gray-500' />
                  <input
                      type='search'
                      placeholder='Search Device, Region...'
                      className='w-full py-2.5 pr-3 pl-8 border border-gray bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-lg'
                  />
              </div>
          </div>

          <div>
              <Link href="/devices/add" className='bg-primary text-sm py-2 px-4 text-white font-medium rounded-md'>
                  Add New Device
              </Link>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
            <div className='flex flex-row gap-2 items-center mt-2'>
                <span className='text-sm font-medium'>Filter</span>
                <span className='text-sm'>1</span>
                <span className='text-sm text-secondary/30'>|</span>
                <span className='text-secondary hover:underline text-sm font-medium cursor-pointer'>Clear all</span>
            </div>
        </div>

        <div className='flex flex-row gap-2 items-center mt-2'>
            <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                <span className='text-sm font-medium text-secondary'>
                    Region: Greater Accra
                </span>
                <X size={16} strokeWidth={1.5} className='text-gray-500 cursor-pointer' />
            </div>
        </div>

        <div>
            <DeviceTable data={data ?? []} isLoading={isLoading} />
        </div>

    </div>
  )
}

export default page