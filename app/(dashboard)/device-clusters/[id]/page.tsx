"use client"

import React, { use } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Info, Users, Monitor, Calendar } from "lucide-react"
import Link from "next/link"
import { useCluster } from "@/hooks/device"
import DeviceTable from "@/components/tables/DeviceTable"

function formatDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export default function DeviceClusterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // React 19 / Next 15 compatible way to unwrap params
  const { id } = use(params)
  const { data: cluster, isLoading, isError } = useCluster(id)

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8 items-center justify-center">
        <div className="spinner1" />
      </div>
    )
  }

  if (isError || !cluster) {
    return (
      <div className="w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8 items-center justify-center text-gray-500">
        <p>Failed to load cluster details.</p>
        <button onClick={() => router.back()} className="mt-4 text-primary underline">
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-row items-center justify-between mb-8">
        <div className="flex flex-row items-center gap-3">
          <Link
            href="/device-clusters"
            className="border border-gray-300 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft strokeWidth={1.5} size={18} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              {cluster.name}
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                  cluster.public ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                }`}
              >
                {cluster.public ? "Public" : "Private"}
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-mono text-xs">
              UUID: {cluster.cluster_uuid}
            </p>
          </div>
        </div>
      </div>

      {/* Cluster Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <Info size={16} />
            <span>Description</span>
          </div>
          <p className="text-sm text-gray-800 line-clamp-3">
            {cluster.description || "No description provided."}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <Monitor size={16} />
            <span>Devices</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {cluster.devices?.length || 0}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <Users size={16} />
            <span>Admins</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {cluster.admins?.length || 0}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <Calendar size={16} />
            <span>Created At</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 mt-1">
            {cluster.created_at ? formatDate(cluster.created_at) : "N/A"}
          </p>
        </div>
      </div>

      {/* Devices Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Devices in Cluster</h2>
        </div>
        <div className=" rounded-lg overflow-hidden">
          {/* We reuse the generic DeviceTable passing the devices inside this cluster specifically */}
          <DeviceTable data={cluster.devices || []} isLoading={false} />
        </div>
      </div>
    </div>
  )
}
