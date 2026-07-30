"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { useUpdateDevice, useDevice, useClusters } from "@/hooks/device"
import { extractItems, MAX_PAGE_SIZE } from "@/lib/pagination"

export default function EditDevicePage() {
  const router = useRouter()
  const params = useParams()
  const deviceId = params.id as string

  const { data: device, isLoading: isDeviceLoading } = useDevice(deviceId)
  const { mutate: updateDevice, isPending, isError, error } = useUpdateDevice()
  const { data: clustersRaw, isLoading: isClustersLoading } = useClusters({ page_size: MAX_PAGE_SIZE })
  const clusters = extractItems<{ id: number; name: string }>(clustersRaw)

  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    region: "",
    latitude: "",
    longitude: "",
    description: "",
    gmap_link: "",
    device_uuid: "",
    cluster_id: "",
  })

  useEffect(() => {
    if (device) {
      setForm({
        name: device.name || "",
        region: device.region || "",
        latitude: device.latitude?.toString() || "",
        longitude: device.longitude?.toString() || "",
        description: device.description || "",
        gmap_link: device.gmap_link || "",
        device_uuid: device.device_uuid || "",
        cluster_id: device.cluster_id?.toString() || "",
      })
    }
  }, [device])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!form.cluster_id) {
        setFormError("Please select a device cluster.")
        return
    }

    updateDevice(
      {
        deviceId,
        data: {
            name: form.name,
            region: form.region,
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
            description: form.description,
            gmap_link: form.gmap_link,
            device_uuid: form.device_uuid,
            cluster_id: parseInt(form.cluster_id),
        }
      },
      {
        onSuccess: () => {
          router.push("/devices")
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

  if (isDeviceLoading) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-white rounded-lg py-8 px-8">
            <div className="spinner1" />
        </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8">

      {/* Header */}
      <div className="flex flex-row items-center gap-3 mb-8">
        <Link
          href="/devices"
          className="border border-gray-300 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft strokeWidth={1.5} size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Edit Device</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Update device information for #{deviceId}
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
                : "Failed to update device. Please try again.")}
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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 w-full "
      >
        {/* Row 1 — Name & Region */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="name"
              className="text-dark text-sm mb-2 font-medium block"
            >
              Device Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. Device Alpha"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="region"
              className="text-dark text-sm mb-2 font-medium block"
            >
              Region
            </label>
            <input
              type="text"
              id="region"
              name="region"
              placeholder="e.g. Greater Accra"
              value={form.region}
              onChange={handleChange}
              required
              className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
            />
          </div>
        </div>

        {/* Row 2 — Latitude & Longitude */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="latitude"
              className="text-dark text-sm mb-2 font-medium block"
            >
              Latitude
            </label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              placeholder="e.g. 5.603"
              value={form.latitude}
              onChange={handleChange}
              step="any"
              required
              className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
            />
          </div>

          <div>
            <label
              htmlFor="longitude"
              className="text-dark text-sm mb-2 font-medium block"
            >
              Longitude
            </label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              placeholder="e.g. -0.187"
              value={form.longitude}
              onChange={handleChange}
              step="any"
              required
              className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
            />
          </div>
        </div>

        {/* Row 3 — Device UUID & Cluster */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
                <label
                    htmlFor="device_uuid"
                    className="text-dark text-sm mb-2 font-medium block"
                >
                    Device ID <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="device_uuid"
                    name="device_uuid"
                    placeholder="e.g. ESP32_001"
                    value={form.device_uuid}
                    onChange={handleChange}
                    required
                    className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
                />
                {/* Editing this re-points the MQTT routing key: the device keeps
                    publishing under its old ID and its data stops arriving. */}
                <p className="mt-1.5 text-xs text-amber-700">
                    Changing this stops incoming data unless the firmware is updated to match.
                    It listens on{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px]">
                        mosquito_dashboard/{form.device_uuid.trim() || "<device-id>"}/sensor_data
                    </code>
                </p>
            </div>

            <div>
                <label
                    htmlFor="cluster_id"
                    className="text-dark text-sm mb-2 font-medium block"
                >
                    Device Cluster
                </label>
                <select
                    id="cluster_id"
                    name="cluster_id"
                    value={form.cluster_id}
                    onChange={handleChange}
                    required
                    className="w-full py-2.5 px-3 border border-gray bg-white focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md disabled:bg-gray-50 transition-colors"
                >
                    <option value="" disabled>Select cluster...</option>
                    {isClustersLoading ? (
                        <option value="" disabled>Loading clusters...</option>
                    ) : (
                        clusters.map((cluster) => (
                            <option key={cluster.id} value={cluster.id}>
                                {cluster.name}
                            </option>
                        ))
                    )}
                </select>
                {clusters.length === 0 && !isClustersLoading && (
                    <p className="text-[11px] text-orange-600 mt-1">No clusters found. Please create one first.</p>
                )}
            </div>
        </div>

        {/* Row 4 — Google Maps Link */}
        <div>
          <label
            htmlFor="gmap_link"
            className="text-dark text-sm mb-2 font-medium block"
          >
            Google Maps Link
          </label>
          <input
            type="url"
            id="gmap_link"
            name="gmap_link"
            placeholder="https://maps.google.com/..."
            value={form.gmap_link}
            onChange={handleChange}
            className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md"
          />
        </div>

        {/* Row 5 — Description */}
        <div>
          <label
            htmlFor="description"
            className="text-dark text-sm mb-2 font-medium block"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Briefly describe the device location or purpose..."
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full py-2.5 px-3 border border-gray focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-md resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-row gap-3 mt-2">
          <Link
            href="/devices"
            className="py-2.5 px-6 border border-gray-300 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending || isClustersLoading}
            className="py-2.5 px-6 flex items-center justify-center gap-3 bg-linear-to-r from-secondary to-primary font-semibold text-white text-sm rounded-md disabled:opacity-70 disabled:cursor-not-allowed transition-opacity"
          >
            {isPending ? <div className="spinner1" /> : "Update Device"}
          </button>
        </div>
      </form>
    </div>
  )
}
