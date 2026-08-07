"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeftRight, Grid3X3, SlidersHorizontal, X } from 'lucide-react'
import { Search } from 'lucide-react'
import SensorDataTable from '@/components/tables/SensorDataTable'
import MultiSelectDropdown from '@/components/filters/MultiSelectDropdown'
import { useDevices } from '@/hooks/device'
import { useMosquitoFilterOptions } from '@/hooks/mosquito'
import { extractItems, MAX_PAGE_SIZE } from '@/lib/pagination'

const SEARCH_DEBOUNCE_MS = 1000
const DATE_DEBOUNCE_MS = 1000

type DeviceLike = { device_uuid?: string; name?: string }

function toIsoStartOfDay(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00Z`).toISOString()
}

function toIsoEndOfDay(dateOnly: string): string {
  return new Date(`${dateOnly}T23:59:59Z`).toISOString()
}

function SensorDataPage() {
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [regions, setRegions] = useState<string[]>([])
  const [deviceUuids, setDeviceUuids] = useState<string[]>([])
  const [showMoreFilters, setShowMoreFilters] = useState(false)

  const [appliedSearch, setAppliedSearch] = useState("")
  const [appliedStartDate, setAppliedStartDate] = useState("")
  const [appliedEndDate, setAppliedEndDate] = useState("")

  // The dropdown needs every device, so request a full page (API caps at 100).
  const { data: devicesRaw } = useDevices(undefined, { page_size: MAX_PAGE_SIZE })
  const deviceOptions = useMemo(() => {
    return extractItems<DeviceLike>(devicesRaw)
      .filter((d) => typeof d.device_uuid === "string" && d.device_uuid)
      .map((d) => ({ value: d.device_uuid as string, label: d.name || (d.device_uuid as string) }))
  }, [devicesRaw])

  const { data: filterOptions } = useMosquitoFilterOptions()
  const regionOptions = filterOptions?.regions ?? []

  useEffect(() => {
    const timer = setTimeout(() => setAppliedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!startDate && !endDate) {
        setAppliedStartDate("")
        setAppliedEndDate("")
        return
      }

      if (startDate && endDate) {
        const normalizedStart = startDate <= endDate ? startDate : endDate
        const normalizedEnd = startDate <= endDate ? endDate : startDate
        setAppliedStartDate(normalizedStart)
        setAppliedEndDate(normalizedEnd)
      }
    }, DATE_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [startDate, endDate])

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
    const trimmed = appliedSearch.trim()
    const hasDateRange = Boolean(appliedStartDate && appliedEndDate)
    return {
      search: trimmed ? trimmed : undefined,
      start_date: hasDateRange ? toIsoStartOfDay(appliedStartDate) : undefined,
      end_date: hasDateRange ? toIsoEndOfDay(appliedEndDate) : undefined,
      region: regions.length > 0 ? regions : undefined,
      device_uuid: deviceUuids.length > 0 ? deviceUuids : undefined,
    }
  }, [appliedSearch, appliedStartDate, appliedEndDate, regions, deviceUuids])

  const extraFilterCount =
    (regions.length > 0 ? 1 : 0) +
    (deviceUuids.length > 0 ? 1 : 0)

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.start_date || filters.end_date ? 1 : 0) +
    extraFilterCount

  const clearExtraFilters = () => {
    setRegions([])
    setDeviceUuids([])
  }

  const clearAll = () => {
    setSearch("")
    setStartDate("")
    setEndDate("")
    setAppliedSearch("")
    setAppliedStartDate("")
    setAppliedEndDate("")
    clearExtraFilters()
  }

  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8'>
        <div className='flex flex-wrap gap-4 items-center'>

            <div className='border border-gray-300 rounded-lg p-1'>
                <Grid3X3  strokeWidth={1.5} size={20} />
                </div>

                <div className='relative w-full sm:w-[350px] text-sm '>
                <Search  strokeWidth={1.5} size={20} className='absolute left-1 top-1/2 -translate-y-1/2 text-gray-500' />

                    <input
                      type='search'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder='Search device, region...'
                      className='w-full py-2.5 pr-3 pl-8 border border-gray  bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm  focus:border-primary focus:outline-none rounded-lg'
                    />
                </div>

                <div className='flex flex-row gap-2 border border-gray w-full sm:w-auto bg-[#D0CECE]/20 px-4 rounded-lg items-center'>
                    <input
                      type='date'
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className='w-full min-w-0 py-2.5  bg-transparent focus:ring-0 placeholder:text-sm text-sm  focus:border-primary focus:outline-none rounded-md'
                    />
                    <div>
                        <ArrowLeftRight size={16} strokeWidth={1.5} className='text-gray-500' />
                    </div>

                    <input
                      type='date'
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className='w-full min-w-0 py-2.5    bg-transparent focus:ring-0 text-sm  focus:border-primary focus:outline-none'
                    />
                </div>

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
                      <div className='flex flex-col gap-3'>
                        <div className='flex flex-col gap-1'>
                          <label className='text-[11px] text-gray-500 px-1'>Regions</label>
                          <MultiSelectDropdown
                            label='All regions'
                            options={regionOptions.map((r) => ({ value: r, label: r }))}
                            selected={regions}
                            onChange={setRegions}
                            emptyText='No regions'
                            className='w-full'
                          />
                        </div>
                        <div className='flex flex-col gap-1'>
                          <label className='text-[11px] text-gray-500 px-1'>Devices</label>
                          <MultiSelectDropdown
                            label='Devices'
                            options={deviceOptions}
                            selected={deviceUuids}
                            onChange={setDeviceUuids}
                            emptyText='No devices'
                            className='w-full'
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </div>

            <div className='flex flex-col gap-2 w-full'>

                <div className='flex flex-row gap-2 items-center mt-2'>

                    <span className='text-sm font-medium'>Filter</span>
                    <span className='text-sm'>{activeFiltersCount}</span>
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

            <div className='flex flex-row flex-wrap gap-2 items-center mt-2 w-full'>

                {filters.search && (
                  <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg  py-1'>
                      <span className='text-sm font-medium text-secondary'>
                        Search: {filters.search}
                      </span>
                      <button type="button" onClick={() => { setSearch(""); setAppliedSearch(""); }} className="p-1.5 -m-1.5" aria-label="Clear search filter">
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}

                {(filters.start_date || filters.end_date) && (
                  <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg  py-1'>
                      <span className='text-sm font-medium text-secondary'>
                        Date: {appliedStartDate || "—"} - {appliedEndDate || "—"}
                      </span>
                      <button type="button" onClick={() => { setStartDate(""); setEndDate(""); setAppliedStartDate(""); setAppliedEndDate(""); }} className="p-1.5 -m-1.5" aria-label="Clear date filter">
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}

                {filters.region && (
                  <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                      <span className='text-sm font-medium text-secondary'>Regions: {filters.region.join(", ")}</span>
                      <button type="button" onClick={() => setRegions([])} className="p-1.5 -m-1.5" aria-label="Clear region filter">
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}

                {filters.device_uuid && (
                  <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                      <span className='text-sm font-medium text-secondary'>
                        Devices: {filters.device_uuid.length}
                      </span>
                      <button type="button" onClick={() => setDeviceUuids([])} className="p-1.5 -m-1.5" aria-label="Clear device filter">
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}
            </div>

            <div className='w-full'>
                <SensorDataTable filters={filters} />
            </div>

    </div>
  )
}

export default SensorDataPage
