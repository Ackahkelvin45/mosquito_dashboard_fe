'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import logo from '../../public/images/logo.png'
import name from '../../public/images/name.png'
import Image from 'next/image'
import profile from '../../public/images/profile.png'
import {
  LayoutDashboard, Map, ChartNoAxesCombined, Satellite, CirclePile,
  UserRoundPlus, ShieldUser, Bell, ChevronDown, ChevronRight,
  EllipsisVertical, LogOut, User, X
} from 'lucide-react'
import Link from 'next/link'
import { useCurrentUser } from '@/hooks/authentication'
import { useRole } from '@/hooks/useRole'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useRouter } from 'next/navigation'

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  subItems?: { label: string; href: string }[];
  // Which roles may see this item. Omitted = everyone.
  roles?: Array<'SUPER_ADMIN' | 'ADMIN' | 'USER'>;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={19} />,
    href: '/',
  },
  {
    label: 'Map',
    icon: <Map size={19} />,
    href: '/map',
  },
  {
    label: 'Historical Data',
    icon: <ChartNoAxesCombined size={19} />,
    href: '/historical-data',
  },
  {
    label: 'Devices',
    icon: <Satellite size={19} />,
    href: '/devices',
  },
  {
    label: 'Device Clusters',
    icon: <CirclePile size={19} />,
    href: '/device-clusters',
    roles: ['SUPER_ADMIN'],
  },
  {
    label: 'Users',
    icon: <UserRoundPlus size={19} />,
    href: '/users',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  {
    label: 'Approvals',
    icon: <ShieldUser size={19} />,
    href: '/approvals',
    roles: ['SUPER_ADMIN'],
    subItems: [
      { label: 'Researchers', href: '/approval/research' },
    ]
  },
  {
    label: 'Notifications',
    icon: <Bell size={19} />,
    href: '/notifications',
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
  const router = useRouter()
  const { data: user, isLoading } = useCurrentUser()
  const { role } = useRole()
  // Show a nav item only if it has no role restriction or includes this role.
  // Until the role is known, restricted items stay hidden (avoids a flash).
  const visibleNavItems = navItems.filter(
    (item) => !item.roles || (role !== undefined && item.roles.includes(role))
  )
  const logoutAction = useAuthStore((state) => state.logout)
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen)
  const closeSidebar = useUiStore((state) => state.closeSidebar)
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false)

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User'
    : ''
  const initials = user
    ? [user.first_name?.[0], user.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
    : '--'

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  const handleLogout = () => {
    logoutAction()
    router.push('/login')
  }

  React.useEffect(() => {
    // Open dropdown if a subitem is active
    navItems.forEach(item => {
      if (item.subItems?.some(sub => pathname === sub.href || pathname.startsWith(sub.href))) {
        setOpenDropdown(item.label)
      }
    })
  }, [pathname])

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => {
    closeSidebar()
  }, [pathname, closeSidebar])

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-300
          ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
    <div className={`w-[250px] h-screen fixed top-0 left-0 z-50 font-raleway flex flex-col shadow-2xl overflow-hidden
      transition-transform duration-300 ease-in-out lg:translate-x-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

        <div className='flex bg-primary/30 flex-row items-center px-7 gap-3 py-5'>
            <Image src={logo} alt='logo' className='invert brightness-0' width={30} height={30} />
            <Image src={name} alt='name' className='invert brightness-0' width={120} height={80} />
            <button
              onClick={closeSidebar}
              aria-label="Close menu"
              className='ml-auto p-1 rounded-md text-white/80 hover:bg-white/10 lg:hidden'
            >
              <X size={20} />
            </button>
        </div>
      {/* Nav Items */}
      <nav className="flex-1 pt-5 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const isDropdownOpen = openDropdown === item.label

          return (
            <div key={item.label}>
              {hasSubItems ? (
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className={`flex items-center gap-4 w-full px-7 py-3 transition-all duration-300 border-l-[3px] group
                    ${isActive || isDropdownOpen
                      ? 'text-white font-medium border-secondary'
                      : 'text-white/70 font-normal border-transparent hover:text-white'
                    }`}
                >
                  <span className={isActive || isDropdownOpen ? 'opacity-100' : 'opacity-50'}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-sm text-left">{item.label}</span>
                  {isDropdownOpen ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
                </button>
              ) : (
                <Link 
                  href={item.href}
                  className={`flex items-center gap-4 w-full px-7 py-3.5 my-1 text-left transition-all duration-300 border-l-[3px]
                    ${isActive
                      ? 'text-white font-medium text-base border-secondary'
                      : 'text-white/70 font-normal text-sm border-transparent hover:text-white'
                    }`}
                >
                  <span className={isActive ? 'opacity-100' : 'opacity-50'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )}

              {/* Sub items */}
              {hasSubItems && (
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {item.subItems?.map((sub) => {
                    const isSubActive = pathname === sub.href
                    return (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={`flex items-center gap-4 w-full pl-16 pr-7 py-2 my-0.5 transition-all duration-300 text-sm
                          ${isSubActive 
                            ? 'text-white font-medium bg-white/10' 
                            : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                      >
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>


      {/* Divider */}
      <div className="mx-6 h-px bg-white/10" />

      {/* User Profile Section */}
      <div className="relative flex flex-row items-center justify-center w-full px-5">
        {/* Account Flyout Menu */}
        {isAccountMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 z-40 bg-black/5" 
              onClick={() => setIsAccountMenuOpen(false)}
            />
            {/* Menu */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-[210px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="p-3 flex flex-col gap-1.5">
                <Link
                  href="/settings"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center w-full gap-3 px-6 py-5">
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
          <div className="hidden w-11 h-11 rounded-full bg-white/20 items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {isLoading ? (
              <div className="space-y-1">
                <div className="h-4 w-20 bg-white/20 rounded animate-pulse" />
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-white font-semibold text-sm leading-tight truncate">{displayName || 'User'}</p>
                <p className="text-white/45 text-xs mt-0.5 truncate">{user?.email ?? '—'}</p>
              </>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
          className="flex items-center justify-center p-2 hover:bg-white/10 rounded-full transition-colors mr-2 h-10 w-10 shrink-0"
        >
          <EllipsisVertical strokeWidth={1.5} size={20} className="text-white shrink-0" />
        </button>
      </div>
    </div>
  </div>
  </>
)

}

export default Sidebar