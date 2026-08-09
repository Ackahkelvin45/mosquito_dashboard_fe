"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { useUser, useUpdateUser } from "@/hooks/user"
import { useClusters } from "@/hooks/device"
import { useRole } from "@/hooks/useRole"
import { extractItems, MAX_PAGE_SIZE } from "@/lib/pagination"
import type { UserRoleValue } from "@/actions/userMutation"

type ClusterOption = { id: number; name: string }

const ROLE_OPTIONS: { value: UserRoleValue; label: string; hint: string }[] = [
  { value: "USER", label: "User", hint: "Views their cluster's data and downloads reports." },
  { value: "ADMIN", label: "Cluster Admin", hint: "Manages users and edits devices in their cluster." },
  { value: "SUPER_ADMIN", label: "Super Admin", hint: "Full access to every cluster and all configuration." },
]

type FormState = {
  first_name: string
  last_name: string
  email: string
  role: UserRoleValue
  cluster_id: string
  is_active: boolean
}

export default function EditUserPage() {
  const params = useParams()
  const userId = params?.id as string
  const router = useRouter()
  const { isSuperAdmin } = useRole()
  const { data: user, isLoading, error } = useUser(userId)
  const { mutate: update, isPending } = useUpdateUser()
  const { data: clustersRaw, isLoading: clustersLoading } = useClusters({ page_size: MAX_PAGE_SIZE })
  const clusters = extractItems<ClusterOption>(clustersRaw)

  const [formError, setFormError] = useState<string | null>(null)
  // Prefilled from the fetched user on first load (render-phase init).
  const [form, setForm] = useState<FormState | null>(null)
  if (user && form === null) {
    setForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email ?? "",
      role: (user.role as UserRoleValue) ?? "USER",
      cluster_id: user.cluster_id != null ? String(user.cluster_id) : "",
      is_active: user.is_active ?? true,
    })
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setFormError(null)

    if (isSuperAdmin && form.role !== "SUPER_ADMIN" && !form.cluster_id) {
      setFormError("Please assign this user to a cluster.")
      return
    }

    update(
      {
        userId,
        data: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          is_active: form.is_active,
          // Role/cluster changes are super-admin decisions; a cluster admin's
          // form doesn't offer them, so don't send them at all.
          ...(isSuperAdmin
            ? {
                role: form.role,
                cluster_id:
                  form.role === "SUPER_ADMIN" || !form.cluster_id
                    ? null
                    : Number(form.cluster_id),
              }
            : {}),
        },
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            router.push("/users")
          } else {
            setFormError(result.error)
          }
        },
        onError: (err) => {
          setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
        },
      }
    )
  }

  const inputClass =
    "w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"

  const selectedRoleHint = form ? ROLE_OPTIONS.find((r) => r.value === form.role)?.hint : undefined

  return (
    <div className="w-full h-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8">
      {/* Header */}
      <div className="flex flex-row items-center gap-3 mb-8">
        <Link
          href="/users"
          className="border border-gray-300 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft strokeWidth={1.5} size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Edit User</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user ? `Update ${[user.first_name, user.last_name].filter(Boolean).join(" ") || user.email}` : "Update account details, role and cluster"}
          </p>
        </div>
      </div>

      {error != null && (
        <div className="flex items-start gap-2 p-4 mb-6 text-sm border-t-4 bg-[#fef2f2] text-[#991b1b] border-[#fecaca] rounded-b">
          <span>Could not load this user. They may not exist or you may not have access.</span>
        </div>
      )}

      {formError && (
        <div className="flex items-start gap-2 p-4 mb-6 text-sm border-t-4 bg-[#fef2f2] text-[#991b1b] border-[#fecaca] rounded-b">
          <span>{formError}</span>
        </div>
      )}

      {isLoading || !form ? (
        <div className="flex flex-col gap-5 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Skeleton height={42} />
            <Skeleton height={42} />
          </div>
          <Skeleton height={42} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Skeleton height={42} />
            <Skeleton height={42} />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-3xl">
          {/* Row 1 — names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="first_name" className="text-dark text-sm mb-2 font-medium block">
                First Name <span className="text-red-500">*</span>
              </label>
              <input id="first_name" name="first_name" type="text"
                value={form.first_name} onChange={handleChange} required minLength={2} className={inputClass} />
            </div>
            <div>
              <label htmlFor="last_name" className="text-dark text-sm mb-2 font-medium block">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input id="last_name" name="last_name" type="text"
                value={form.last_name} onChange={handleChange} required minLength={2} className={inputClass} />
            </div>
          </div>

          {/* Row 2 — email */}
          <div>
            <label htmlFor="email" className="text-dark text-sm mb-2 font-medium block">
              Email <span className="text-red-500">*</span>
            </label>
            <input id="email" name="email" type="email"
              value={form.email} onChange={handleChange} required className={inputClass} />
          </div>

          {/* Row 3 — role & cluster. Only a super admin may change these. */}
          {isSuperAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="role" className="text-dark text-sm mb-2 font-medium block">
                  Role <span className="text-red-500">*</span>
                </label>
                <select id="role" name="role" value={form.role} onChange={handleChange} required
                  className={`${inputClass} bg-white`}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {selectedRoleHint && <p className="mt-1.5 text-xs text-gray-500">{selectedRoleHint}</p>}
              </div>

              <div>
                <label htmlFor="cluster_id" className="text-dark text-sm mb-2 font-medium block">
                  Cluster {form.role !== "SUPER_ADMIN" && <span className="text-red-500">*</span>}
                </label>
                <select id="cluster_id" name="cluster_id" value={form.cluster_id} onChange={handleChange}
                  disabled={form.role === "SUPER_ADMIN" || clustersLoading}
                  className={`${inputClass} bg-white disabled:bg-gray-50 disabled:text-gray-400`}>
                  <option value="">
                    {clustersLoading ? "Loading clusters..." : "Select a cluster"}
                  </option>
                  {clusters.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  {form.role === "SUPER_ADMIN"
                    ? "Super admins aren't tied to a cluster — they see every cluster."
                    : "The user will only see data from this cluster (and public clusters)."}
                </p>
              </div>
            </div>
          )}

          {/* Row 4 — account status */}
          <label className="flex items-center gap-3 select-none cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((prev) => (prev ? { ...prev, is_active: e.target.checked } : prev))}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm text-gray-700">
              Account active
              <span className="block text-xs text-gray-400">Inactive users cannot log in or receive notifications.</span>
            </span>
          </label>

          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-2">
            <Link href="/users"
              className="flex-1 sm:flex-none text-center rounded-md border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={isPending}
              className="flex-1 sm:flex-none rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60">
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
