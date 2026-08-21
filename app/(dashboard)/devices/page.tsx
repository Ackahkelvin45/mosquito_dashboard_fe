"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Grid3X3, Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import DeviceTable, { type DeviceRow } from '@/components/tables/DeviceTable'
import { UnregisteredSightingsSection } from '@/components/devices/UnregisteredSightings'
import MultiSelectDropdown from '@/components/filters/MultiSelectDropdown'
import { useClusters, useDevices } from '@/hooks/device'
import { useRole } from '@/hooks/useRole'
import Pagination from '@/components/Pagination'
import { extractItems, resolvePage, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from '@/lib/pagination'

type Cluster = {
  id: number
  name: string
}

function DevicesPage() {
  const { canFilterByCluster, canManageSystem } = useRole()
  const [searchValue, setSearchValue] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [clusterIds, setClusterIds] = useState<string[]>([])
  const [trapStatuses, setTrapStatuses] = useState<string[]>([])
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [minCount, setMinCount] = useState("")
  const [maxCount, setMaxCount] = useState("")
  const [createdAfter, setCreatedAfter] = useState("")
  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [page, setPage] = useState(1)

  // The general search hits the API, so debounce keystrokes.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue.trim()), 350)
    return () => clearTimeout(timer)
  }, [searchValue])

  // Close the More Filters dropdown when clicking outside it.
  const moreFiltersRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!showMoreFilters) return
    function handleMouseDown(e: MouseEvent) {
      if (moreFiltersRef.current && !moreFiltersRef.current.contains(e.target as Node)) {
        setShowMoreFilters(false)
      }
    }
    document.addEventListener('pointerdown', handleMouseDown)
    return () => document.removeEventListener('pointerdown', handleMouseDown)
  }, [showMoreFilters])

  const filters = useMemo(() => {
    const lat = latitude === "" ? undefined : Number(latitude)
    const lng = longitude === "" ? undefined : Number(longitude)
    const min = minCount === "" ? undefined : Number(minCount)
    const max = maxCount === "" ? undefined : Number(maxCount)

    return {
      search: debouncedSearch || undefined,
      // Multi-select: devices in ANY of the chosen clusters match.
      cluster_id: clusterIds.length > 0 ? clusterIds.map(Number) : undefined,
      latitude: Number.isFinite(lat as number) ? (lat as number) : undefined,
      longitude: Number.isFinite(lng as number) ? (lng as number) : undefined,
      // Trap status has two values, so "On" + "Off" (or nothing) selected
      // means no filter; exactly one selection filters to that status.
      trap_status: trapStatuses.length === 1 ? trapStatuses[0] === "on" : undefined,
      min_mosquito_count: Number.isFinite(min as number) ? (min as number) : undefined,
      max_mosquito_count: Number.isFinite(max as number) ? (max as number) : undefined,
      // created_after expects an ISO date-time; treat the picked day as its start (UTC).
      created_after: createdAfter ? new Date(`${createdAfter}T00:00:00Z`).toISOString() : undefined,
    }
  }, [clusterIds, latitude, longitude, debouncedSearch, trapStatuses, minCount, maxCount, createdAfter])

  // Reset to the first page whenever the filters change (render-phase reset,
  // per the React "you might not need an effect" guidance).
  const [prevFilters, setPrevFilters] = useState(filters)
  if (filters !== prevFilters) {
    setPrevFilters(filters)
    setPage(1)
  }

  const { data, isLoading } = useDevices(filters, { page, page_size: DEFAULT_PAGE_SIZE })
  const devicesPage = useMemo(() => resolvePage<DeviceRow>(data, page, DEFAULT_PAGE_SIZE), [data, page])

  // Clusters power a dropdown, so fetch as many as the API allows in one page.
  const { data: clustersRaw } = useClusters({ page_size: MAX_PAGE_SIZE })
  const clusters: Cluster[] = useMemo(() => extractItems<Cluster>(clustersRaw), [clustersRaw])

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = []
    const trimmed = searchValue.trim()

    if (trimmed) {
      chips.push({ key: "search", label: `Search: ${trimmed}`, clear: () => setSearchValue("") })
    }

    if (clusterIds.length > 0) {
      const names = clusterIds.map(
        (id) => clusters.find((c) => String(c.id) === id)?.name || `#${id}`
      )
      chips.push({
        key: "cluster",
        label: `Clusters: ${names.join(", ")}`,
        clear: () => setClusterIds([]),
      })
    }

    if (latitude !== "") chips.push({ key: "lat", label: `Latitude: ${latitude}`, clear: () => setLatitude("") })
    if (longitude !== "") chips.push({ key: "lng", label: `Longitude: ${longitude}`, clear: () => setLongitude("") })

    if (trapStatuses.length > 0) {
      chips.push({
        key: "trap_status",
        label: `Status: ${trapStatuses.map((s) => (s === "on" ? "On" : "Off")).join(", ")}`,
        clear: () => setTrapStatuses([]),
      })
    }

    if (minCount !== "") chips.push({ key: "min", label: `Min count: ${minCount}`, clear: () => setMinCount("") })
    if (maxCount !== "") chips.push({ key: "max", label: `Max count: ${maxCount}`, clear: () => setMaxCount("") })
    if (createdAfter !== "") chips.push({ key: "created", label: `Created after: ${createdAfter}`, clear: () => setCreatedAfter("") })

    return chips
  }, [clusterIds, clusters, latitude, longitude, searchValue, trapStatuses, minCount, maxCount, createdAfter])

  const clearAll = () => {
    setSearchValue("")
    setClusterIds([])
    setLatitude("")
    setLongitude("")
    setTrapStatuses([])
    setMinCount("")
    setMaxCount("")
    setCreatedAfter("")
  }

  // Filters that live behind the "More Filters" toggle.
  const extraFilterCount =
    [latitude, longitude, minCount, maxCount].filter((v) => v !== "").length +
    (clusterIds.length > 0 ? 1 : 0) +
    (trapStatuses.length > 0 ? 1 : 0)

  const clearExtraFilters = () => {
    setClusterIds([])
    setTrapStatuses([])
    setLatitude("")
    setLongitude("")
    setMinCount("")
    setMaxCount("")
  }

  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8'>
        <UnregisteredSightingsSection />
        <div className='flex flex-col lg:flex-row lg:justify-between gap-4'>
          <div className='flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-center'>

              <div className='border border-gray-300 rounded-lg p-1 w-fit'>
                  <Grid3X3 strokeWidth={1.5} size={20} />
              </div>

              <div className='relative w-full sm:w-[350px] text-sm'>
                  <Search strokeWidth={1.5} size={20} className='absolute left-2 top-1/2 -translate-y-1/2 text-gray-500' />
                  <input
                      type='search'
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder='Search by name, region, community, UUID...'
                      className='w-full py-2.5 pr-3 pl-9 border border-gray bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-lg'
                  />
              </div>

              <input
                type='date'
                value={createdAfter}
                onChange={(e) => setCreatedAfter(e.target.value)}
                title='Created after'
                className='border border-gray bg-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary'
              />

              <div ref={moreFiltersRef} className='relative'>
                <button
                  type="button"
                  onClick={() => setShowMoreFilters((v) => !v)}
                  className={`flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-3 py-2.5 border transition-colors
                    ${showMoreFilters || extraFilterCount > 0
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray hover:bg-gray-50'
                    }`}
                >
                  <SlidersHorizontal size={15} />
                  <span className='whitespace-nowrap'>More Filters</span>
                  {extraFilterCount > 0 && (
                    <span className='bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                      {extraFilterCount}
                    </span>
                  )}
                </button>

                {/* Compact dropdown anchored to the button */}
                {showMoreFilters && (
                  <div className='absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-[300px] bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-20'>
                    <div className='flex items-center justify-between mb-3'>
                      <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Extra Filters</p>
                      {extraFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={clearExtraFilters}
                          className='text-xs font-medium text-primary hover:underline'
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className='flex flex-col gap-3 mb-3'>
                      {canFilterByCluster && (
                        <div className='flex flex-col gap-1'>
                          <label className='text-[11px] text-gray-500 px-1'>Clusters</label>
                          <MultiSelectDropdown
                            label='All clusters'
                            options={clusters.map((c) => ({ value: String(c.id), label: c.name || `Cluster #${c.id}` }))}
                            selected={clusterIds}
                            onChange={setClusterIds}
                            emptyText='No clusters'
                            className='w-full'
                          />
                        </div>
                      )}
                      <div className='flex flex-col gap-1'>
                        <label className='text-[11px] text-gray-500 px-1'>Trap status</label>
                        <MultiSelectDropdown
                          label='All statuses'
                          options={[
                            { value: 'on', label: 'On' },
                            { value: 'off', label: 'Off' },
                          ]}
                          selected={trapStatuses}
                          onChange={setTrapStatuses}
                          className='w-full'
                        />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='flex flex-col gap-1'>
                        <label className='text-[11px] text-gray-500 px-1'>Latitude</label>
                        <input
                          type='number'
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          className='w-full py-2 px-3 border border-gray bg-white text-sm focus:border-primary focus:outline-none rounded-lg'
                          placeholder='e.g. 5.6037'
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='text-[11px] text-gray-500 px-1'>Longitude</label>
                        <input
                          type='number'
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          className='w-full py-2 px-3 border border-gray bg-white text-sm focus:border-primary focus:outline-none rounded-lg'
                          placeholder='e.g. -0.187'
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='text-[11px] text-gray-500 px-1'>Min count</label>
                        <input
                          type='number'
                          min={0}
                          value={minCount}
                          onChange={(e) => setMinCount(e.target.value)}
                          className='w-full py-2 px-3 border border-gray bg-white text-sm focus:border-primary focus:outline-none rounded-lg'
                          placeholder='0'
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='text-[11px] text-gray-500 px-1'>Max count</label>
                        <input
                          type='number'
                          min={0}
                          value={maxCount}
                          onChange={(e) => setMaxCount(e.target.value)}
                          className='w-full py-2 px-3 border border-gray bg-white text-sm focus:border-primary focus:outline-none rounded-lg'
                          placeholder='1000'
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>

          {canManageSystem && (
            <div>
                <Link href="/devices/add" className='bg-primary text-sm py-2 px-4 text-white font-medium rounded-md'>
                    Add New Device
                </Link>
            </div>
          )}
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

        {activeChips.length > 0 && (
          <div className='flex flex-row flex-wrap gap-2 items-center mt-3'>
            {activeChips.map((chip) => (
              <div key={chip.key} className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                <span className='text-sm font-medium text-secondary'>
                  {chip.label}
                </span>
                <button type="button" onClick={chip.clear} className="p-1.5 -m-1.5" aria-label={`Clear ${chip.key} filter`}>
                  <X size={16} strokeWidth={1.5} className='text-gray-500' />
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
            <DeviceTable data={devicesPage.items} isLoading={isLoading} />
            <Pagination
              page={devicesPage.page}
              totalPages={devicesPage.total_pages}
              total={devicesPage.total}
              pageSize={devicesPage.page_size}
              onPageChange={setPage}
              isLoading={isLoading}
            />
        </div>

    </div>
  )
}

export default DevicesPage
