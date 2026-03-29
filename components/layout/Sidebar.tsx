'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import logo from '../../public/images/logo.png'
import name from '../../public/images/name.png'
import Image from 'next/image'
import profile from '../../public/images/profile.png'
import { LayoutDashboard, Map, ChartNoAxesCombined, Satellite } from 'lucide-react'
import Link from 'next/link'
import { useCurrentUser } from '@/hooks/authentication'
const navItems = [
  {
    label: 'Dashboard',
    icon: (
     <LayoutDashboard />
    ),
    href: '/',
  },
  {
    label: 'Map',
    icon: (
     <Map />
    ),
    href: '/map',
  },
  {
    label: 'Historical Data',
    icon: (
    <ChartNoAxesCombined />
    ),
    href: '/historical-data',
  },
   {
    label: 'Devices',
    icon: (
    <Satellite />
    ),
    href: '/devices',
  },
  {
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    href: '/settings',
  },
]

function Sidebar() {
  const pathname = usePathname()
  const { data: user, isLoading } = useCurrentUser()

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'
    : ''
  const initials = user
    ? [user.first_name?.[0], user.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
    : '--'

  return (
    <div className="w-[250px] h-screen  fixed  top-0 left-0  z-50  font-raleway flex flex-col shadow-2xl overflow-hidden">
      {/* Gradient base */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #1a4a80 0%, #1565C0 50%, #2196F3 100%)',
        }}
      />
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 z-1 bg-repeat opacity-65"
        style={{
          backgroundImage: "url('/images/sidebarpattern.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '100% 100%',
          backgroundBlendMode: 'overlay',
          backgroundPosition: 'center',
        }}
      />
      <div className="relative z-10 flex flex-1 flex-col">

        <div className='flex bg-primary/30 flex-row  items-center px-7 gap-3 py-5'>
            <Image src={logo} alt='logo' className='invert brightness-0' width={30} height={30} />
            <Image src={name} alt='name' className='invert brightness-0' width={120} height={80} />
        </div>
      {/* Nav Items */}
      <nav className="flex-1 pt-5 ">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link 
            href={item.href}
            
              key={item.label}
              className={`flex items-center gap-4 w-full px-7 py-3.5 my-3 text-left transition-all duration-300 border-l-[3px]
                ${isActive
                  ? 'text-white font-medium text-base border-secondary'
                  : 'text-white/70 font-normal text-sm border-transparent hover:text-white/70'
                }`}
            >
              <span className={isActive ? 'opacity-100' : 'opacity-50'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 h-px bg-white/10" />

      {/* User Profile */}
      <div className="flex items-center gap-3 px-6 py-5">
        <Image
          src={profile}
          alt={displayName || 'Profile'}
          className="w-11 h-11 rounded-full object-cover border-2 border-white/25 shrink-0 bg-white/10"
          onError={(e) => {
            const img = e.target as HTMLImageElement
            img.style.display = 'none'
            const fallback = img.nextSibling as HTMLElement | null
            if (fallback) fallback.style.display = 'flex'
          }}
        />
        {/* Fallback avatar with user initials */}
        <div className="hidden w-11 h-11 rounded-full bg-white/20 items-center justify-center text-white font-bold text-sm shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <>
              <p className="text-white font-semibold text-sm leading-tight animate-pulse">Loading...</p>
              <p className="text-white/45 text-xs mt-0.5">...</p>
            </>
          ) : (
            <>
              <p className="text-white font-semibold text-sm leading-tight truncate">{displayName || 'User'}</p>
              <p className="text-white/45 text-xs mt-0.5 truncate">{user?.email ?? '—'}</p>
            </>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

export default Sidebar