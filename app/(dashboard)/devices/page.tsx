"use client"

import React, { useMemo, useState } from 'react'
import { Grid3X3, Search, X } from 'lucide-react'
import Link from 'next/link'
import DeviceTable from '@/components/tables/DeviceTable'
import { useClusters, useDevices } from '@/hooks/device'

type Cluster = {
  id: number
  name: string
}

type SearchField = "name" | "region" | "device_uuid"

function DevicesPage() {
  const [searchField, setSearchField] = useState<SearchField>("name")
  const [searchValue, setSearchValue] = useState("")
  const [clusterId, setClusterId] = useState<string>("all")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")

  const filters = useMemo(() => {
    const trimmed = searchValue.trim()
    const lat = latitude === "" ? undefined : Number(latitude)
    const lng = longitude === "" ? undefined : Number(longitude)

    return {
      name: searchField === "name" && trimmed ? trimmed : undefined,
      region: searchField === "region" && trimmed ? trimmed : undefined,
      device_uuid: searchField === "device_uuid" && trimmed ? trimmed : undefined,
      cluster_id: clusterId === "all" ? undefined : Number(clusterId),
      latitude: Number.isFinite(lat as number) ? (lat as number) : undefined,
      longitude: Number.isFinite(lng as number) ? (lng as number) : undefined,
    }
  }, [clusterId, latitude, longitude, searchField, searchValue])

  const { data, isLoading } = useDevices(filters)
  const { data: clustersRaw } = useClusters()
  const clusters: Cluster[] = useMemo(() => (Array.isArray(clustersRaw) ? (clustersRaw as Cluster[]) : []), [clustersRaw])

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = []
    const trimmed = searchValue.trim()

    if (trimmed) {
      const label =
        searchField === "name" ? `Name: ${trimmed}` :
        searchField === "region" ? `Region: ${trimmed}` :
        `UUID: ${trimmed}`
      chips.push({ key: "search", label, clear: () => setSearchValue("") })
    }

    if (clusterId !== "all") {
      const clusterName = clusters.find((c) => String(c.id) === clusterId)?.name
      chips.push({
        key: "cluster",
        label: `Cluster: ${clusterName || `#${clusterId}`}`,
        clear: () => setClusterId("all"),
      })
    }

    if (latitude !== "") chips.push({ key: "lat", label: `Latitude: ${latitude}`, clear: () => setLatitude("") })
    if (longitude !== "") chips.push({ key: "lng", label: `Longitude: ${longitude}`, clear: () => setLongitude("") })

    return chips
  }, [clusterId, clusters, latitude, longitude, searchField, searchValue])

  const clearAll = () => {
    setSearchField("name")
    setSearchValue("")
    setClusterId("all")
    setLatitude("")
    setLongitude("")
  }

  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8'>
        <div className='flex flex-row justify-between'>
          <div className='flex flex-row gap-7 items-center'>

              <div className='border border-gray-300 rounded-lg p-1'>
                  <Grid3X3 strokeWidth={1.5} size={20} />
              </div>

              <div className='flex flex-row gap-3 items-center'>
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value as SearchField)}
                  className='border border-gray bg-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary'
                >
                  <option value="name">Name</option>
                  <option value="region">Region</option>
                  <option value="device_uuid">UUID</option>
                </select>

              <div className='relative w-[350px] text-sm'>
                  <Search strokeWidth={1.5} size={20} className='absolute left-1 top-1/2 -translate-y-1/2 text-gray-500' />
                  <input
                      type='search'
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder='Search...'
                      className='w-full py-2.5 pr-3 pl-8 border border-gray bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-lg'
                  />
              </div>

              <select
                value={clusterId}
                onChange={(e) => setClusterId(e.target.value)}
                className='border border-gray bg-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary'
              >
                <option value="all">All clusters</option>
                {clusters.map((c) => (
                  <option key={c.id} value={String(c.id)}>{c.name || `Cluster #${c.id}`}</option>
                ))}
              </select>

                <div className='flex flex-col gap-1'>
            <input
              type='number'
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className='w-full py-2 px-3 border border-gray bg-[#D0CECE]/20 text-sm focus:border-primary focus:outline-none rounded-lg'
              placeholder='lat'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <input
              type='number'
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className='w-full py-2 px-3 border border-gray bg-[#D0CECE]/20 text-sm focus:border-primary focus:outline-none rounded-lg'
              placeholder='long'
            />
          </div>
            </div>
          </div>

          <div>
              <Link href="/devices/add" className='bg-primary text-sm py-2 px-4 text-white font-medium rounded-md'>
                  Add New Device
              </Link>
          </div>
        </div>

        <div className='flex flex-col gap-2'>
            <div className='flex flex-row gap-2 items-center mt-2'>
                <span className='text-sm font-medium'>Filter</span>
                <span className='text-sm'>{activeChips.length}</span>
                <span className='text-sm text-secondary/30'>|</span>
                <button
                  type="button"
                  onClick={clearAll}
                  className='text-secondary hover:underline text-sm font-medium'
                >
                  Clear all
                </button>
            </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-6 gap-3 items-end mt-4'>
        
        </div>

        {activeChips.length > 0 && (
          <div className='flex flex-row flex-wrap gap-2 items-center mt-3'>
            {activeChips.map((chip) => (
              <div key={chip.key} className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                <span className='text-sm font-medium text-secondary'>
                  {chip.label}
                </span>
                <button type="button" onClick={chip.clear}>
                  <X size={16} strokeWidth={1.5} className='text-gray-500' />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
            <DeviceTable data={data ?? []} isLoading={isLoading} />
        </div>

    </div>
  )
}

export default DevicesPage
