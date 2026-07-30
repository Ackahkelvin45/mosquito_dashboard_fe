"use client"

import { useCurrentUser } from "@/hooks/authentication"

export type Role = "USER" | "ADMIN" | "SUPER_ADMIN"

/**
 * Role/permission helpers derived from the authenticated user.
 *
 * These gate what the UI SHOWS. The backend enforces the same rules regardless
 * of the client, so hiding a control here is purely for a clean experience —
 * never the actual security boundary.
 */
export function useRole() {
  const { data, isLoading } = useCurrentUser()
  const role = (data?.role as Role | undefined) ?? undefined
  const clusterId = (data?.cluster_id as number | null | undefined) ?? null

  const isSuperAdmin = role === "SUPER_ADMIN"
  const isAdmin = role === "ADMIN"
  const isUser = role === "USER"

  return {
    isLoading,
    role,
    clusterId,
    isSuperAdmin,
    isAdmin,
    isUser,
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
