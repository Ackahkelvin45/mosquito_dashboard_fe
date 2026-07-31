'use client'
import { Eye, LogIn, Menu, Search } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import NotificationBell from '@/components/notifications/NotificationBell'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

function Navbar() {
  const openSidebar = useUiStore((state) => state.openSidebar)
  const isGuest = useAuthStore((state) => state.isGuest)

  return (
    <div className='w-full h-16 flex items-center font-raleway z-30 flex-row justify-between px-4 fixed top-0 left-0 right-0 bg-white shadow-sm lg:pl-[250px]'>

        <div className='flex items-center gap-2 min-w-0 flex-1'>
            {/* Hamburger — mobile only */}
            <button
              onClick={openSidebar}
              aria-label="Open menu"
              className='p-2 rounded-md text-gray-600 hover:bg-gray-100 lg:hidden shrink-0'
            >
              <Menu size={22} />
            </button>

            <div className='px-1 sm:px-5 min-w-0 flex-1'>
                <div className='relative max-w-72'>
                    <Search strokeWidth={1.5} size={18} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500' />
                    <input type='search' placeholder='Search' className='w-full h-full text-sm border py-2.5 focus:ring-0 focus:outline-none bg-[#F5F5F5] focus:border-primary border-gray pl-10 p-2 rounded-md' />
                </div>
            </div>
        </div>

        {/* Notifications need an account — guests get a badge + sign-in instead. */}
        {isGuest ? (
          <div className='flex items-center gap-3 shrink-0'>
            <span className='hidden sm:flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold'>
              <Eye size={13} />
              Guest Mode
            </span>
            <Link
              href='/login'
              className='flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-colors'
            >
              <LogIn size={14} />
              Sign In
            </Link>
          </div>
        ) : (
          <NotificationBell />
        )}

    </div>
  )
}

export default Navbar
