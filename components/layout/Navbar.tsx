import { Search } from 'lucide-react'
import React from 'react'
import { Bell } from 'lucide-react'

function Navbar() {
  return (
    <div className='w-full h-16 flex items-center  font-raleway z-30 flex-row justify-between px-4  fixed top-0 left-0 right-0 bg-white shadow-sm  pl-[250px] '>

        <div className='px-5'>
            <div className='relative'> 
                <Search strokeWidth={1.5} size={18} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' />
            <input type='search' placeholder='Search' className='w-72 h-full  text-sm border py-2.5 focus:ring-0 focus:outline-none bg-[#F5F5F5] focus:border-primary border-gray  pl-10  p-2 rounded-md' />

            </div>
            </div> 


            <div className='relative'>

                <div className='px-4'>
  <Bell />
                </div>


            </div>
      
    </div>
  )
}

export default Navbar
