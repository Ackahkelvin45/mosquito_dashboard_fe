"use client"

import { ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const { accessToken, _hasHydrated } = useAuthStore()

  useEffect(() => {
    if (_hasHydrated && !accessToken) {
      router.replace("/login")
    }
  }, [accessToken, _hasHydrated, router])

  if (!_hasHydrated) return null  // wait for localStorage to load
  if (!accessToken) return null   // token confirmed missing, redirect in effect

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Navbar />
      <main
        className="p-4 pt-20 pl-[260px] bg-[#F5F5F5] min-h-screen overflow-y-auto"
        style={{ flex: 1, overflow: "auto" }}
      >
        {children}
      </main>
    </div>
  )
}