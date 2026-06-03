"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { ArrowLeftRight, Grid3X3, X } from 'lucide-react'
import { Search } from 'lucide-react'
import HistoricalDataTable from '@/components/tables/HistoricalDataTable'
import MultiSelectDropdown from '@/components/filters/MultiSelectDropdown'
import { useDevices } from '@/hooks/device'

const SEARCH_DEBOUNCE_MS = 1000
const DATE_DEBOUNCE_MS = 1000

type DeviceLike = { device_uuid?: string; name?: string }

function toIsoStartOfDay(dateOnly: string): string {
  return new Date(`${dateOnly}T00:00:00Z`).toISOString()
}

function toIsoEndOfDay(dateOnly: string): string {
  return new Date(`${dateOnly}T23:59:59Z`).toISOString()
}

function extractDevices(value: unknown): DeviceLike[] {
  if (Array.isArray(value)) return value as DeviceLike[]
  if (value && typeof value === "object") {
    const maybe = value as { data?: unknown }
    if (Array.isArray(maybe.data)) return maybe.data as DeviceLike[]
  }
  return []
}

function HistoricalDataPage() {
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [region, setRegion] = useState("")
  const [genus, setGenus] = useState("")
  const [species, setSpecies] = useState("")
  const [deviceUuids, setDeviceUuids] = useState<string[]>([])

  const [appliedSearch, setAppliedSearch] = useState("")
  const [appliedStartDate, setAppliedStartDate] = useState("")
  const [appliedEndDate, setAppliedEndDate] = useState("")
  const [appliedRegion, setAppliedRegion] = useState("")
  const [appliedGenus, setAppliedGenus] = useState("")
  const [appliedSpecies, setAppliedSpecies] = useState("")

  const { data: devicesRaw } = useDevices()
  const deviceOptions = useMemo(() => {
    return extractDevices(devicesRaw)
      .filter((d) => typeof d.device_uuid === "string" && d.device_uuid)
      .map((d) => ({ value: d.device_uuid as string, label: d.name || (d.device_uuid as string) }))
  }, [devicesRaw])

  // Debounce all free-text inputs together.
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(search)
      setAppliedRegion(region)
      setAppliedGenus(genus)
      setAppliedSpecies(species)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search, region, genus, species])

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

  const filters = useMemo(() => {
    const trimmed = appliedSearch.trim()
    const trimmedRegion = appliedRegion.trim()
    const trimmedGenus = appliedGenus.trim()
    const trimmedSpecies = appliedSpecies.trim()
    const hasDateRange = Boolean(appliedStartDate && appliedEndDate)
    const start_date = hasDateRange ? toIsoStartOfDay(appliedStartDate) : undefined
    const end_date = hasDateRange ? toIsoEndOfDay(appliedEndDate) : undefined
    return {
      search: trimmed ? trimmed : undefined,
      start_date,
      end_date,
      region: trimmedRegion ? trimmedRegion : undefined,
      genus: trimmedGenus ? trimmedGenus : undefined,
      species: trimmedSpecies ? trimmedSpecies : undefined,
      device_uuid: deviceUuids.length > 0 ? deviceUuids : undefined,
    }
  }, [appliedSearch, appliedStartDate, appliedEndDate, appliedRegion, appliedGenus, appliedSpecies, deviceUuids])

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.start_date || filters.end_date ? 1 : 0) +
    (filters.region ? 1 : 0) +
    (filters.genus ? 1 : 0) +
    (filters.species ? 1 : 0) +
    (filters.device_uuid ? 1 : 0)

  const clearAll = () => {
    setSearch("")
    setStartDate("")
    setEndDate("")
    setRegion("")
    setGenus("")
    setSpecies("")
    setDeviceUuids([])
    setAppliedSearch("")
    setAppliedStartDate("")
    setAppliedEndDate("")
    setAppliedRegion("")
    setAppliedGenus("")
    setAppliedSpecies("")
  }

  const inputClass =
    'w-full sm:w-auto py-2.5 px-3 border border-gray bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm focus:border-primary focus:outline-none rounded-lg'

  return (
    <div className='w-full h-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8'>
        <div className='flex flex-wrap gap-4 lg:gap-7 items-center'>

            <div className='border border-gray-300 rounded-lg p-1'>
                <Grid3X3  strokeWidth={1.5} size={20} />
                </div>

                <div className='relative w-full sm:w-[350px] text-sm '>
                <Search  strokeWidth={1.5} size={20} className='absolute left-1 top-1/2 -translate-y-1/2 text-gray-500' />

                    <input
                      type='search'
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder='Search species, genus, device...'
                      className='w-full py-2.5 pr-3 pl-8 border border-gray  bg-[#D0CECE]/20 focus:ring-0 placeholder:text-sm text-sm  focus:border-primary focus:outline-none rounded-lg'
                    />
                </div>

                <div className='flex flex-row gap-2 border border-gray w-full sm:w-auto bg-[#D0CECE]/20 px-4 rounded-lg items-center'>
                    <input
                      type='date'
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className='w-full py-2.5  bg-transparent focus:ring-0 placeholder:text-sm text-sm  focus:border-primary focus:outline-none rounded-md'
                    />
                    <div>
                        <ArrowLeftRight size={16} strokeWidth={1.5} className='text-gray-500' />
                    </div>

                    <input
                      type='date'
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className='w-full py-2.5    bg-transparent focus:ring-0 text-sm  focus:border-primary focus:outline-none'
                    />
                </div>
            </div>

            {/* Secondary filters */}
            <div className='flex flex-wrap gap-3 items-center mt-4 w-full'>
                <input
                  type='text'
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder='Region'
                  className={inputClass}
                />
                <input
                  type='text'
                  value={genus}
                  onChange={(e) => setGenus(e.target.value)}
                  placeholder='Genus'
                  className={inputClass}
                />
                <input
                  type='text'
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  placeholder='Species'
                  className={inputClass}
                />
                <MultiSelectDropdown
                  label='Devices'
                  options={deviceOptions}
                  selected={deviceUuids}
                  onChange={setDeviceUuids}
                  emptyText='No devices'
                  className='w-full sm:w-56'
                />
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
                      <button type="button" onClick={() => { setSearch(""); setAppliedSearch(""); }}>
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}

                {(filters.start_date || filters.end_date) && (
                  <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg  py-1'>
                      <span className='text-sm font-medium text-secondary'>
                        Date: {appliedStartDate || "—"} - {appliedEndDate || "—"}
                      </span>
                      <button type="button" onClick={() => { setStartDate(""); setEndDate(""); setAppliedStartDate(""); setAppliedEndDate(""); }}>
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}

                {filters.region && (
                  <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                      <span className='text-sm font-medium text-secondary'>Region: {filters.region}</span>
                      <button type="button" onClick={() => { setRegion(""); setAppliedRegion(""); }}>
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}

                {filters.genus && (
                  <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                      <span className='text-sm font-medium text-secondary'>Genus: {filters.genus}</span>
                      <button type="button" onClick={() => { setGenus(""); setAppliedGenus(""); }}>
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}

                {filters.species && (
                  <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                      <span className='text-sm font-medium text-secondary'>Species: {filters.species}</span>
                      <button type="button" onClick={() => { setSpecies(""); setAppliedSpecies(""); }}>
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}

                {filters.device_uuid && (
                  <div className='flex flex-row gap-2 items-center bg-[#3C2178]/5 px-2 rounded-lg py-1'>
                      <span className='text-sm font-medium text-secondary'>
                        Devices: {filters.device_uuid.length}
                      </span>
                      <button type="button" onClick={() => setDeviceUuids([])}>
                        <X size={16} strokeWidth={1.5} className='text-gray-500' />
                      </button>
                  </div>
                )}
            </div>

            <div className='w-full'>
                <HistoricalDataTable filters={filters} />
            </div>


    </div>
  )
}

export default HistoricalDataPage
