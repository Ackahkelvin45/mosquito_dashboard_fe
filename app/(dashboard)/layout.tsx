"use client"

import { ReactNode, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { useRole, type Role } from "@/hooks/useRole"
import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"
import InactivityTimeout from "@/components/auth/InactivityTimeout"
import GuestBanner from "@/components/layout/GuestBanner"

interface DashboardLayoutProps {
  children: ReactNode
}

// Route prefix → roles allowed to see it. Anything not listed is open to every
// authenticated user. Central place so route access can't drift per-page.
// (The backend enforces the same rules; this is UX only.)
const ROUTE_ROLES: { prefix: string; allow: Role[] }[] = [
  { prefix: "/device-clusters", allow: ["SUPER_ADMIN"] },
  { prefix: "/devices/add", allow: ["SUPER_ADMIN"] },
  { prefix: "/users", allow: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/approval", allow: ["SUPER_ADMIN"] },
]

// Guests may only browse the public read-only pages: Dashboard, Devices
// (viewing, never add/edit) and Historical Data. Everything else redirects
// home. (The backend rejects guest requests everywhere else anyway.)
function isGuestAllowedPath(pathname: string): boolean {
  if (pathname === "/") return true
  if (pathname === "/historical-data" || pathname.startsWith("/historical-data/")) return true
  if (pathname === "/devices" || pathname.startsWith("/devices/")) {
    if (pathname.startsWith("/devices/add")) return false
    if (/^\/devices\/[^/]+\/edit(\/|$)/.test(pathname)) return false
    return true
  }
  return false
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { accessToken, isGuest, _hasHydrated } = useAuthStore()
  const { role, isLoading: roleLoading } = useRole()

  useEffect(() => {
    if (_hasHydrated && !accessToken && !isGuest) {
      router.replace("/login")
    }
  }, [accessToken, isGuest, _hasHydrated, router])

  // Keep a user out of a route their role isn't allowed to see.
  const rule = ROUTE_ROLES.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"))
  const roleBlocked = Boolean(rule && role !== undefined && !rule.allow.includes(role))
  const guestBlocked = isGuest && !isGuestAllowedPath(pathname)

  useEffect(() => {
    if (guestBlocked) {
      router.replace("/")
      return
    }
    if (accessToken && !roleLoading && role !== undefined && roleBlocked) {
      router.replace("/")
    }
  }, [accessToken, roleLoading, role, roleBlocked, guestBlocked, router])

  if (!_hasHydrated) return null  // wait for localStorage to load
  if (!accessToken && !isGuest) return null   // credentials confirmed missing, redirect in effect
  if (guestBlocked) return null   // guest on a restricted route, redirect in effect
  if (rule && (roleLoading || role === undefined || roleBlocked)) return null  // gate restricted routes until role is known

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Guests have no session to expire — the timeout would bounce them to login. */}
      {!isGuest && <InactivityTimeout />}
      <Sidebar />
      <Navbar />
      <main
        className="p-4 pt-20 lg:pl-[260px] bg-[#F5F5F5] min-h-screen w-full overflow-x-hidden overflow-y-auto"
        style={{ flex: 1, overflow: "auto" }}
      >
        {isGuest && <GuestBanner />}
        {children}
      </main>
    </div>
  )
}
