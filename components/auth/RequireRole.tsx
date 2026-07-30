"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRole, type Role } from "@/hooks/useRole"

/**
 * Page-level guard: renders children only for the allowed roles, otherwise
 * redirects. The backend enforces the same rules — this just keeps a user out
 * of a page whose actions they couldn't perform anyway.
 */
export default function RequireRole({
  allow,
  children,
  redirectTo = "/",
}: {
  allow: Role[]
  children: React.ReactNode
  redirectTo?: string
}) {
  const router = useRouter()
  const { role, isLoading } = useRole()
  const permitted = role !== undefined && allow.includes(role)

  useEffect(() => {
    if (!isLoading && role !== undefined && !permitted) {
      router.replace(redirectTo)
    }
  }, [isLoading, role, permitted, router, redirectTo])

  // Wait for the role before showing anything, and render nothing while an
  // unauthorized user is being redirected.
  if (isLoading || role === undefined || !permitted) return null
  return <>{children}</>
}
