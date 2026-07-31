"use client"

import { useCurrentUser } from "@/hooks/authentication"
import { useAuthStore } from "@/store/authStore"

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN" | "GUEST"

/**
 * Role/permission helpers derived from the authenticated user — or the
 * anonymous GUEST principal when the visitor chose "View as Guest".
 *
 * These gate what the UI SHOWS. The backend enforces the same rules regardless
 * of the client, so hiding a control here is purely for a clean experience —
 * never the actual security boundary.
 */
export function useRole() {
  const isGuest = useAuthStore((s) => s.isGuest)
  // useCurrentUser is disabled in guest mode, so this never hits /auth/me then.
  const { data, isLoading } = useCurrentUser()
  const role: Role | undefined = isGuest ? "GUEST" : ((data?.role as Role | undefined) ?? undefined)
  const clusterId = isGuest ? null : ((data?.cluster_id as number | null | undefined) ?? null)

  const isSuperAdmin = role === "SUPER_ADMIN"
  const isAdmin = role === "ADMIN"
  const isUser = role === "USER"

  return {
    isLoading: isGuest ? false : isLoading,
    role,
    clusterId,
    isSuperAdmin,
    isAdmin,
    isUser,
    // Anonymous read-only visitor: every mutating/managing capability is off.
    isGuest,
    // A super admin manages the whole system; only they see cross-cluster
    // controls (cluster filters, add device/cluster).
    canManageSystem: isSuperAdmin,
    // Super admins and cluster admins can manage users (admins are scoped
    // server-side to their own cluster).
    canManageUsers: isSuperAdmin || isAdmin,
    // Only a super admin filters BY cluster — everyone else has just one.
    canFilterByCluster: isSuperAdmin,
  }
}
