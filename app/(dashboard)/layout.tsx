"use client"

import { ReactNode, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { useRole, type Role } from "@/hooks/useRole"
import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"
import InactivityTimeout from "@/components/auth/InactivityTimeout"

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

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { accessToken, _hasHydrated } = useAuthStore()
  const { role, isLoading: roleLoading } = useRole()

  useEffect(() => {
    if (_hasHydrated && !accessToken) {
      router.replace("/login")
    }
  }, [accessToken, _hasHydrated, router])

  // Keep a user out of a route their role isn't allowed to see.
  const rule = ROUTE_ROLES.find((r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/"))
  const roleBlocked = Boolean(rule && role !== undefined && !rule.allow.includes(role))

  useEffect(() => {
    if (accessToken && !roleLoading && role !== undefined && roleBlocked) {
      router.replace("/")
    }
  }, [accessToken, roleLoading, role, roleBlocked, router])

  if (!_hasHydrated) return null  // wait for localStorage to load
  if (!accessToken) return null   // token confirmed missing, redirect in effect
  if (rule && (roleLoading || role === undefined || roleBlocked)) return null  // gate restricted routes until role is known

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <InactivityTimeout />
      <Sidebar />
      <Navbar />
      <main
        className="p-4 pt-20 lg:pl-[260px] bg-[#F5F5F5] min-h-screen w-full overflow-x-hidden overflow-y-auto"
        style={{ flex: 1, overflow: "auto" }}
      >
        {children}
      </main>
    </div>
  )
}