"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import Card from '@/components/cards/Card'
import { buildStatCards } from '@/components/cards/dashboardStatCards'
import DateRangeCalendar, { type DateRange } from '@/components/filters/DateRangeCalendar'
import MosquitoMonitoringChart from '@/components/Charts/MosquitoMonitoringChart'
import MosquitoBreakdown from '@/components/tables/MosquitoBreakdownTable'
import MosquitoGenderDistribution from '@/components/Charts/MosquitoGenderDistribution'
import SensorStatusChart from '@/components/Charts/SensorStatusChart'
import MosquitoBarChart from '@/components/Charts/MosquitoRegionBarChart'
import CorrelationChart from '@/components/Charts/CorrelationChart'
import GenusHeatmap from '@/components/Charts/GenusHeatmap'
import { useDashboardRange } from '@/hooks/dashboard'
import "react-loading-skeleton/dist/skeleton.css"

const pad = (n: number) => String(n).padStart(2, "0")
// Local-date ISO strings (no timezone suffix) — the backend treats them as the
// same naive timestamps the sensor data is stored with.
const toIsoStartOfDay = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00:00`
const toIsoEndOfDay = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T23:59:59`
const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const fmtDay = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

const formatLong = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  const day = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  const time = date
    .toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
    .toLowerCase()
  return `${day}, ${time}`
}

const PRESETS: { label: string; days: number | null }[] = [
  { label: "Last 7 Days", days: 7 },
  { label: "Last 14 Days", days: 14 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "This Year", days: null },
]

function DateRangePage() {
  const [range, setRange] = useState<DateRange>({ start: null, end: null })
  const [applied, setApplied] = useState<{ start: Date; end: Date } | null>(null)

  const startIso = applied ? toIsoStartOfDay(applied.start) : undefined
  const endIso = applied ? toIsoEndOfDay(applied.end) : undefined
  const { data, isLoading, isFetching } = useDashboardRange(startIso, endIso)
  const loading = isLoading || isFetching

  const applyPreset = (days: number | null) => {
    const today = stripTime(new Date())
    const start =
      days === null
        ? new Date(today.getFullYear(), 0, 1)
        : new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1))
    setRange({ start, end: today })
  }

  const applyRange = () => {
    if (!range.start) return
    // A single picked day is a valid one-day range.
    setApplied({ start: range.start, end: range.end ?? range.start })
  }

  const clearRange = () => {
    setRange({ start: null, end: null })
    setApplied(null)
  }

  const cards = buildStatCards(data?.totals, loading)

  const monitoringData = useMemo(() => {
    const points = (data?.chart?.data ?? []) as Array<Record<string, unknown>>
    return points.map((p) => ({
      // Backend labels are already span-aware ("04 Aug 15:00" / "04 Aug 26").
      xLabel: typeof p.label === "string" ? p.label : "—",
      tooltipLabel: typeof p.timestamp === "string" ? formatLong(p.timestamp) : undefined,
      count: typeof p.count === "number" ? p.count : Number(p.count ?? 0) || 0,
    }))
  }, [data?.chart?.data])

  const sensorStatusData = useMemo(() => {
    const points = data?.sensor_status_chart?.data ?? []
    return points.map((p) => ({
      xLabel: p.label,
      tooltipLabel: formatLong(p.timestamp),
      on_count: p.on_count ?? 0,
      off_count: p.off_count ?? 0,
    }))
  }, [data?.sensor_status_chart?.data])

  const regionData = useMemo(() => {
    const list = data?.region_chart?.data ?? []
    return list.map((d) => ({
      region: (d.region ?? "").trim() || "Unknown",
      count: d.count ?? 0,
      communities: (d.communities ?? []).map((c) => ({
        community: (c.community ?? "").trim() || "Unknown",
        count: c.count ?? 0,
      })),
    }))
  }, [data?.region_chart?.data])

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg border border-gray text-gray-500 hover:text-primary hover:border-primary transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={16} />
          </Link>
          <span className="text-xl font-semibold font-mulish text-primary">
            Date Range Filter
          </span>
        </div>
        {applied && (
          <span className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-text-dark">{fmtDay(applied.start)}</span>
            {" — "}
            <span className="font-semibold text-text-dark">{fmtDay(applied.end)}</span>
          </span>
        )}
      </div>

      {/* Picker */}
      <div className="bg-white rounded-2xl p-6 font-raleway shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Quick presets */}
          <div className="lg:w-44 shrink-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Quick ranges
            </p>
            <div className="flex flex-row lg:flex-col flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.days)}
                  className="text-left text-sm px-3 py-2 rounded-lg border border-gray text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block border-l border-gray-100" />

          {/* Calendar + actions */}
          <div className="flex-1">
            <DateRangeCalendar value={range} onChange={setRange} />

            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                {range.start ? (
                  <>
                    <span className="font-semibold text-text-dark">{fmtDay(range.start)}</span>
                    {" — "}
                    {range.end ? (
                      <span className="font-semibold text-text-dark">{fmtDay(range.end)}</span>
                    ) : (
                      "pick an end date"
                    )}
                  </>
                ) : (
                  "No dates selected"
                )}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyRange}
                  disabled={!range.start}
                  className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply Filter
                </button>
                <button
                  type="button"
                  onClick={clearRange}
                  disabled={!range.start && !applied}
                  className="px-4 py-2 rounded-lg border border-primary text-sm font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {!applied ? (
        <div className="bg-white rounded-2xl p-12 font-raleway shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="text-primary" size={26} />
          </div>
          <p className="text-base font-semibold text-gray-700">No date range applied yet</p>
          <p className="text-sm text-gray-400 max-w-md">
            Pick a start and end date on the calendar above (or use a quick range), then press
            Apply Filter — every chart and summary card will be scoped to that period.
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <Card
                key={card.title}
                title={card.title}
                value={card.value}
                valueSuffix={card.valueSuffix}
                valueClassName={card.valueClassName}
                description={card.description}
                icon={card.icon}
                bgColor={card.bgColor}
              />
            ))}
          </div>

          <MosquitoMonitoringChart data={monitoringData} isLoading={loading} hideFilter />

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-[65%]">
              <MosquitoBreakdown data={data?.breakdown} isLoading={loading} hideFilter />
            </div>
            <div className="w-full lg:w-[35%]">
              <MosquitoGenderDistribution
                male={data?.gender_distribution?.male}
                female={data?.gender_distribution?.female}
                isLoading={loading}
                hideFilter
              />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-[50%]">
              <SensorStatusChart
                data={sensorStatusData.length > 0 ? sensorStatusData : undefined}
                isLoading={loading}
                hideFilter
              />
            </div>
            <div className="w-full lg:w-[50%]">
              <MosquitoBarChart
                data={regionData.length > 0 ? regionData : undefined}
                communities={data?.region_chart?.communities}
                isLoading={loading}
                hideFilter
              />
            </div>
          </div>

          <CorrelationChart
            data={data?.correlation_chart?.data}
            temperatureCorrelation={data?.correlation_chart?.temperature_correlation}
            humidityCorrelation={data?.correlation_chart?.humidity_correlation}
            isLoading={loading}
            hideFilter
          />

          <GenusHeatmap
            genera={data?.genus_heatmap?.genera}
            buckets={data?.genus_heatmap?.buckets}
            data={data?.genus_heatmap?.data}
            isLoading={loading}
            hideFilter
          />
        </>
      )}
    </div>
  )
}

export default DateRangePage
