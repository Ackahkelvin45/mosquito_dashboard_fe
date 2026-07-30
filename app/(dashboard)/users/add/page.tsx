"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Eye, EyeClosed } from "lucide-react"
import { useCreateUser } from "@/hooks/user"
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

// Password policy mirrors the backend validator: >=8 chars, a letter, a number,
// and an uppercase letter. Checked client-side so the error is immediate.
function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters long."
  if (!/[a-zA-Z]/.test(pw)) return "Password must contain at least one letter."
  if (!/[0-9]/.test(pw)) return "Password must contain at least one number."
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter."
  return null
}

export default function AddUserPage() {
  const router = useRouter()
  const { isSuperAdmin } = useRole()
  const { mutate: createUser, isPending } = useCreateUser()
  const { data: clustersRaw, isLoading: clustersLoading } = useClusters({ page_size: MAX_PAGE_SIZE })
  const clusters = extractItems<ClusterOption>(clustersRaw)

  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER" as UserRoleValue,
    cluster_id: "",
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match.")
      return
    }
    const pwProblem = passwordProblem(form.password)
    if (pwProblem) {
      setFormError(pwProblem)
      return
    }
    // Super admin picks role + cluster. A cluster admin can only create plain
    // USERS in their own cluster — the backend forces both, so the form doesn't
    // ask, and the fields below are hidden for them.
    if (isSuperAdmin && form.role !== "SUPER_ADMIN" && !form.cluster_id) {
      setFormError("Please assign this user to a cluster.")
      return
    }

    createUser(
      {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        // For a cluster admin these are ignored server-side and forced to
        // USER + their own cluster; send sensible values anyway.
        role: isSuperAdmin ? form.role : "USER",
        cluster_id: isSuperAdmin && form.cluster_id ? Number(form.cluster_id) : undefined,
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

  const selectedRoleHint = ROLE_OPTIONS.find((r) => r.value === form.role)?.hint

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
          <h1 className="text-lg font-semibold text-gray-900">Add New User</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create an account and assign its role and cluster
          </p>
        </div>
      </div>

      {formError && (
        <div className="flex items-start gap-2 p-4 mb-6 text-sm border-t-4 bg-[#fef2f2] text-[#991b1b] border-[#fecaca] rounded-b">
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-3xl">
        {/* Row 1 — names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="first_name" className="text-dark text-sm mb-2 font-medium block">
              First Name <span className="text-red-500">*</span>
            </label>
            <input id="first_name" name="first_name" type="text" placeholder="e.g. Ama"
              value={form.first_name} onChange={handleChange} required minLength={2} className={inputClass} />
          </div>
          <div>
            <label htmlFor="last_name" className="text-dark text-sm mb-2 font-medium block">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input id="last_name" name="last_name" type="text" placeholder="e.g. Mensah"
              value={form.last_name} onChange={handleChange} required minLength={2} className={inputClass} />
          </div>
        </div>

        {/* Row 2 — email */}
        <div>
          <label htmlFor="email" className="text-dark text-sm mb-2 font-medium block">
            Email <span className="text-red-500">*</span>
          </label>
          <input id="email" name="email" type="email" placeholder="e.g. ama@example.com"
            value={form.email} onChange={handleChange} required className={inputClass} />
        </div>

        {/* Row 3 — passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="password" className="text-dark text-sm mb-2 font-medium block">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                value={form.password} onChange={handleChange} required className={inputClass} />
              <button type="button" onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-dark text-sm mb-2 font-medium block">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={form.confirmPassword} onChange={handleChange} required className={inputClass} />
          </div>
        </div>

        {/* Row 4 — role & cluster. Only a super admin chooses these; a cluster
            admin always creates a plain user in their own cluster. */}
        {isSuperAdmin ? (
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
        ) : (
          <p className="rounded-md bg-primary/5 px-4 py-3 text-sm text-gray-600">
            This user will be created as a <span className="font-semibold">User</span> in your cluster
            and will only see your cluster&apos;s data.
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end mt-2">
          <Link href="/users"
            className="flex-1 sm:flex-none text-center rounded-md border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={isPending}
            className="flex-1 sm:flex-none rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-60">
            {isPending ? "Creating..." : "Create User"}
          </button>
        </div>
      </form>
    </div>
  )
}
