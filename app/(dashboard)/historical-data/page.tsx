import React from 'react'
import { ArrowLeftRight, Grid3X3, X } from 'lucide-react'
import { Search } from 'lucide-react'
import HistoricalDataTable from '@/components/tables/HistoricalDataTable'

function page() {
  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8'>
        <div className='flex flex-row gap-7 items-center'>

            <div className='border border-gray-300 rounded-lg p-1'>
                <Grid3X3  strokeWidth={1.5} size={20} />
                </div>

                <div className='relative w-[350px] text-sm '>
                <Search  strokeWidth={1.5} size={20} className='absolute left-1 top-1/2 -translate-y-1/2 text-gray-500' />

                    <input type='search' placeholder='Search  Species,Sensor...' className='w-full py-2.5 pr-3 pl-8 border border-gray  bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm  focus:border-primary focus:outline-none rounded-lg' />
                </div>

                <div className='flex flex-row gap-2 border border-gray  bg-[#D0CECE]/20 px-4  rounded-lg items-center'>
                    <input type='date' className='w-full py-2.5  bg-transparent focus:ring-0 placeholder:text-sm text-sm  focus:border-primary focus:outline-none rounded-md' />
                    <div>
                        <ArrowLeftRight size={16} strokeWidth={1.5} className='text-gray-500' />
                    </div>

                    <input type='date' className='w-full py-2.5    bg-transparent focus:ring-0 text-sm  focus:border-primary focus:outline-none' />
                </div>
            </div>

            <div className='flex flex-col gap-2'>

                <div className='flex flex-row gap-2 items-center mt-2'>

                    <span className='text-sm font-medium'>Filter</span>
                    <span className='text-sm'>2</span>
                    <span className='text-sm text-secondary/30'>|</span>
                    <span className='text-secondary hover:underline text-sm font-medium'>Clear all</span>


                </div>

            </div>

            <div className='flex flex-row gap-2 items-center mt-2'>

                <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg  py-1'>
                    <span className='text-sm font-medium text-secondary'>
                    Search: Young Male Aedes
                    </span>
               

                <X size={16} strokeWidth={1.5} className='text-gray-500' />
                </div>


                <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg  py-1'>
                    <span className='text-sm font-medium text-secondary'>
                    Date: 15 Dec ,2025 - 18 Dec,2026
                    </span>
               

                <X size={16} strokeWidth={1.5} className='text-gray-500' />
                </div>
            </div>

            <div>
                <HistoricalDataTable />
            </div>
      
      
    </div>
  )
}

export default page
