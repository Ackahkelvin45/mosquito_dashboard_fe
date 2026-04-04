"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Eye, EyeClosed } from "lucide-react"
import Link from "next/link"
import { useCreateCluster } from "@/hooks/device"
import { useAuthStore } from "@/store/authStore"

export default function AddDeviceClusterPage() {
  const router = useRouter()
  const { user_id } = useAuthStore()
  const { mutate: createCluster, isPending, isError, error } = useCreateCluster()
  const [showPassword, setShowPassword] = useState(false)

  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    password: "",
    public: false,
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target as HTMLInputElement
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!user_id) {
      setFormError("User session not found. Please log in again.")
      return
    }

    createCluster(
      {
        name: form.name,
        description: form.description,
        password: form.password,
        public: form.public,
        cluster_admins: [user_id],
      },
      {
        onSuccess: () => {
          router.push("/device-clusters")
        },
        onError: (err) => {
          setFormError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again."
          )
        },
      }
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8">
      {/* Header */}
      <div className="flex flex-row items-center gap-3 mb-8">
        <Link
          href="/device-clusters"
          className="border border-gray-300 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft strokeWidth={1.5} size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Add New Device Cluster</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create a new group for your monitoring devices
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {(formError || isError) && (
        <div
          id="alert-border-2"
          className="flex sm:items-center p-4 mb-6 text-sm border-t-4 bg-[#fef2f2] text-[#991b1b] border-[#fecaca] rounded-md max-w-2xl"
          role="alert"
        >
          <svg
            className="w-4 h-4 shrink-0 mt-0.5 md:mt-0 text-[#991b1b]"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span className="sr-only">Error</span>
          <div className="ms-2 text-sm flex-1">
            {formError ??
              (error instanceof Error
                ? error.message
                : "Failed to create cluster. Please try again.")}
          </div>
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 rounded p-1.5 inline-flex items-center justify-center h-8 w-8 shrink-0 bg-[#fef2f2] text-[#991b1b] hover:bg-[#fecaca] focus:ring-2 focus:ring-[#f87171] focus:outline-none"
            onClick={() => setFormError(null)}
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18 17.94 6M18 18 6.06 6"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
        {/* Row 1 — Name & Password */}
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label htmlFor="name" className="text-dark text-sm mb-2 font-medium block">
              Cluster Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Accra Region Cluster"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-dark text-sm mb-2 font-medium block">
              Cluster Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter cluster password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeClosed strokeWidth={1.5} size={18} />
                ) : (
                  <Eye strokeWidth={1.5} size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Row 2 — Description */}
        <div>
          <label htmlFor="description" className="text-dark text-sm mb-2 font-medium block">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe the purpose of this cluster..."
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md resize-none"
          />
        </div>

        {/* Row 3 — Privacy */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="public"
            name="public"
            checked={form.public}
            onChange={handleChange}
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="public" className="text-sm font-medium text-gray-700">
            Make this cluster public (visible to everyone)
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-row gap-3 mt-2">
          <Link
            href="/device-clusters"
            className="py-2.5 px-6 border border-gray-300 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="py-2.5 px-6 flex items-center justify-center gap-3 bg-linear-to-r from-secondary to-primary font-semibold text-white text-sm rounded-md disabled:opacity-70 disabled:cursor-not-allowed transition-opacity"
          >
            {isPending ? <div className="spinner1" /> : "Create Cluster"}
          </button>
        </div>
      </form>
    </div>
  )
}
