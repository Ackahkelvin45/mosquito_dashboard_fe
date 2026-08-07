"use client"

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import Card from '@/components/cards/Card'
import MosquitoMonitoringChart from '@/components/Charts/MosquitoMonitoringChart'
import MosquitoBreakdown from '@/components/tables/MosquitoBreakdownTable'
import MosquitoGenderDistribution from '@/components/Charts/MosquitoGenderDistribution'
import SensorStatusChart from '@/components/Charts/SensorStatusChart'
import MosquitoBarChart from '@/components/Charts/MosquitoRegionBarChart'
import CorrelationChart from '@/components/Charts/CorrelationChart'
import GenusHeatmap from '@/components/Charts/GenusHeatmap'
import {
  useDashboardTotals,
  useMosquitoChart,
  useMosquitoBreakdown,
  useGenderDistribution,
  useRegionBreakdown,
  useSensorStatus,
  useCorrelationChart,
  useGenusHeatmap
} from '@/hooks/dashboard'
import type { DashboardChartPoint, DashboardGroupBy } from '@/queries/dashboard/dashboardQueries'
import { buildStatCards } from '@/components/cards/dashboardStatCards'
import DashboardExportButton from '@/components/DashboardExportButton'
import { useRole } from '@/hooks/useRole'
import "react-loading-skeleton/dist/skeleton.css";

function Dashboard() {
  // The date-range page isn't part of the guest surface — hide its entry point.
  const { isGuest } = useRole()
  const [generalGroupBy, setGeneralGroupBy] = useState<DashboardGroupBy>("month")
  const [totalsGroupBy, setTotalsGroupBy] = useState<DashboardGroupBy>("month")
  const [chartGroupBy, setChartGroupBy] = useState<DashboardGroupBy>("month")
  const [genderGroupBy, setGenderGroupBy] = useState<DashboardGroupBy>("month")
  const [regionGroupBy, setRegionGroupBy] = useState<DashboardGroupBy>("month")
  const [sensorStatusGroupBy, setSensorStatusGroupBy] = useState<DashboardGroupBy>("month")
  const [breakdownGroupBy, setBreakdownGroupBy] = useState<DashboardGroupBy>("month")
  const [correlationGroupBy, setCorrelationGroupBy] = useState<DashboardGroupBy>("month")
  const [genusHeatmapGroupBy, setGenusHeatmapGroupBy] = useState<DashboardGroupBy>("month")

  // The general filter re-scopes every chart and the summary cards at once;
  // each chart's own filter can still override it individually afterwards.
  const applyGeneralFilter = (value: DashboardGroupBy) => {
    setGeneralGroupBy(value)
    setTotalsGroupBy(value)
    setChartGroupBy(value)
    setGenderGroupBy(value)
    setRegionGroupBy(value)
    setSensorStatusGroupBy(value)
    setBreakdownGroupBy(value)
    setCorrelationGroupBy(value)
    setGenusHeatmapGroupBy(value)
  }

  // Skeletons only on isLoading (first fetch with an empty cache — including
  // group-by changes, which are new query keys). Background refetches of
  // already-cached data update silently instead of re-showing skeletons.
  const { data: totalsData, isLoading: isTotalsLoading } = useDashboardTotals(totalsGroupBy)
  const { data: chartData, isLoading: isChartLoading } = useMosquitoChart(chartGroupBy)
  const { data: genderData, isLoading: isGenderLoading } = useGenderDistribution(genderGroupBy)
  const { data: breakdownDataResponse, isLoading: isBreakdownLoading } = useMosquitoBreakdown(breakdownGroupBy)
  const { data: regionDataResponse, isLoading: isRegionLoading } = useRegionBreakdown(regionGroupBy)
  const { data: sensorStatusResponse, isLoading: isSensorStatusLoading } = useSensorStatus(sensorStatusGroupBy)
  const { data: correlationData, isLoading: isCorrelationLoading } = useCorrelationChart(correlationGroupBy)
  const { data: genusHeatmapData, isLoading: isGenusHeatmapLoading } = useGenusHeatmap(genusHeatmapGroupBy)

  const totals = totalsData
  const chart = chartData
  const breakdownData = breakdownDataResponse
  const regionData = regionDataResponse

  const monitoringData = useMemo(() => {
    const points = (Array.isArray(chart?.data) ? chart?.data : []) as DashboardChartPoint[]

    const getCount = (p: DashboardChartPoint): number => {
      const record = p as Record<string, unknown>
      const raw =
        record.count ??
        record.value ??
        record.total ??
        record.mosquito_count
      if (typeof raw === "number") return raw
      if (typeof raw === "string") {
        const n = Number(raw)
        return Number.isFinite(n) ? n : 0
      }
      return 0
    }

    const getTimestampIso = (p: DashboardChartPoint): string | null => {
      const record = p as Record<string, unknown>
      const ts = record.timestamp
      if (typeof ts === "string") return ts

      const label = record.label
      if (typeof label === "string" && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
        return `${label}T00:00:00Z`
      }
      return null
    }

    const formatShort = (iso: string): string => {
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return "—"

      if (chartGroupBy === "day") {
        return new Intl.DateTimeFormat("en-GB", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(date).toLowerCase()
      }

      // Yearly buckets span a year of dates, so the label needs the year too.
      const parts = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        ...(chartGroupBy === "year" ? { year: "2-digit" as const } : {}),
      }).formatToParts(date)
      const day = parts.find((p) => p.type === "day")?.value ?? "—"
      const month = parts.find((p) => p.type === "month")?.value ?? "—"
      const year = parts.find((p) => p.type === "year")?.value
      return year ? `${day} ${month} ${year}` : `${day} ${month}`
    }

    const formatLong = (iso: string): string => {
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return "—"

      const dateParts = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).formatToParts(date)
      const day = dateParts.find((p) => p.type === "day")?.value ?? "—"
      const month = dateParts.find((p) => p.type === "month")?.value ?? "—"
      const year = dateParts.find((p) => p.type === "year")?.value ?? "—"
      const time = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date).toLowerCase()

      return `${day} ${month}, ${year}, ${time}`
    }

    return points.map((p) => ({
      xLabel: (() => {
        const iso = getTimestampIso(p)
        return iso ? formatShort(iso) : "—"
      })(),
      tooltipLabel: (() => {
        const iso = getTimestampIso(p)
        return iso ? formatLong(iso) : "—"
      })(),
      count: getCount(p),
    }))
  }, [chart?.data, chartGroupBy])

  const sensorStatusData = useMemo(() => {
    const points = sensorStatusResponse?.data ?? []

    const formatShort = (iso: string): string => {
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return "—"

      if (sensorStatusGroupBy === "day") {
        return new Intl.DateTimeFormat("en-GB", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(date).toLowerCase()
      }

      // Yearly buckets span a year of dates, so the label needs the year too.
      const parts = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        ...(sensorStatusGroupBy === "year" ? { year: "2-digit" as const } : {}),
      }).formatToParts(date)
      const day = parts.find((p) => p.type === "day")?.value ?? "—"
      const month = parts.find((p) => p.type === "month")?.value ?? "—"
      const year = parts.find((p) => p.type === "year")?.value
      return year ? `${day} ${month} ${year}` : `${day} ${month}`
    }

    const formatLong = (iso: string): string => {
      const date = new Date(iso)
      if (Number.isNaN(date.getTime())) return "—"

      const dateParts = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).formatToParts(date)
      const day = dateParts.find((p) => p.type === "day")?.value ?? "—"
      const month = dateParts.find((p) => p.type === "month")?.value ?? "—"
      const year = dateParts.find((p) => p.type === "year")?.value ?? "—"
      const time = new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(date).toLowerCase()

      return `${day} ${month}, ${year}, ${time}`
    }

    return points.map((p) => ({
      xLabel: formatShort(p.timestamp),
      tooltipLabel: formatLong(p.timestamp),
      on_count: p.on_count ?? 0,
      off_count: p.off_count ?? 0,
    }))
  }, [sensorStatusResponse?.data, sensorStatusGroupBy])

  const cards = buildStatCards(totals, isTotalsLoading)

  return (
    <div className="flex flex-col gap-4">

        <div className="flex flex-wrap items-center justify-between gap-3 px-2 mb-2">
          <h1 className="text-xl font-semibold font-mulish text-primary">
            Dashboard
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <DashboardExportButton
              sections={{
                totals: totalsData,
                chart: chartData,
                gender_distribution: genderData,
                breakdown: breakdownDataResponse,
                region_chart: regionDataResponse,
                sensor_status_chart: sensorStatusResponse,
                correlation_chart: correlationData,
                genus_heatmap: genusHeatmapData,
              }}
              disabled={
                isTotalsLoading || isChartLoading || isGenderLoading ||
                isBreakdownLoading || isRegionLoading || isSensorStatusLoading ||
                isCorrelationLoading || isGenusHeatmapLoading
              }
            />
            {!isGuest && (
              <Link
                href="/date-range"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-sm transition-colors"
              >
                <CalendarDays size={16} />
                Date Range Filter
              </Link>
            )}
            <div className="flex items-center gap-2">
              <label htmlFor="general-filter" className="text-sm font-semibold text-text-dark whitespace-nowrap">
                General Filter:
              </label>
              <select
                id="general-filter"
                value={generalGroupBy}
                onChange={(e) => applyGeneralFilter(e.target.value as DashboardGroupBy)}
                className="border border-gray rounded-lg px-3 py-2 text-sm text-text-dark focus:ring-0 focus:outline-none bg-white focus:border-primary"
              >
                <option value="year">Last Year</option>
                <option value="month">Last Month</option>
                <option value="day">Today</option>
              </select>
            </div>
          </div>
        </div>

        <div className='flex flex-col lg:flex-row gap-4 lg:items-stretch'>
        <div className="w-full lg:w-[65%] flex">
        <MosquitoMonitoringChart
          data={monitoringData}
          groupBy={chartGroupBy}
          onGroupByChange={(value) => { setChartGroupBy(value); }}
          isLoading={isChartLoading}
        />
	      </div>
	      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2 gap-4 w-full lg:w-[35%]">
	          <div className="col-span-full flex items-center justify-between gap-2">
	            <span className="text-base font-bold text-gray-700">Summary Cards</span>
	            <select
	              value={totalsGroupBy}
	              onChange={(e) => setTotalsGroupBy(e.target.value as DashboardGroupBy)}
	              className="border border-gray rounded-lg px-3 py-2 text-sm text-text-dark focus:ring-0 focus:outline-none bg-white focus:border-primary"
	            >
	              <option value="year">Last Year</option>
	              <option value="month">Last Month</option>
	              <option value="day">Today</option>
	            </select>
	          </div>
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
        </div>

        <div className='flex flex-col lg:flex-row gap-4 mt-2'>

            <div className='w-full lg:w-[65%]'>
                <MosquitoBreakdown
                  data={breakdownData}
                  groupBy={breakdownGroupBy}
                  onGroupByChange={(val) => setBreakdownGroupBy(val)}
                  isLoading={isBreakdownLoading}
                />
            </div>
	            <div className='w-full lg:w-[35%]'>
	                <MosquitoGenderDistribution
	                  male={genderData?.male}
	                  female={genderData?.female}
	                  groupBy={genderGroupBy}
	                  onGroupByChange={(value) => setGenderGroupBy(value)}
                    isLoading={isGenderLoading}
	                />
	            </div>
</div>
    
<div className='flex flex-col lg:flex-row gap-4 mt-2 '>

	    <div className='w-full lg:w-[50%]'>
	        <SensorStatusChart
	          data={sensorStatusData.length > 0 ? sensorStatusData : undefined}
	          groupBy={sensorStatusGroupBy}
	          onGroupByChange={(value) => setSensorStatusGroupBy(value)}
            isLoading={isSensorStatusLoading}
	        />

	    </div>
	    <div className='w-full lg:w-[50%]'>
	        <MosquitoBarChart
	          data={(() => {
	            const list = regionData?.data ?? []
	            return list.length > 0
	              ? list.map((d) => ({
	                  region: (d.region ?? "").trim() || "Unknown",
	                  count: d.count ?? 0,
	                  communities: (d.communities ?? []).map((c) => ({
	                    community: (c.community ?? "").trim() || "Unknown",
	                    count: c.count ?? 0,
	                  })),
	                }))
	              : undefined
	          })()}
	          communities={regionData?.communities}
	          groupBy={regionGroupBy}
	          onGroupByChange={(value) => setRegionGroupBy(value)}
            isLoading={isRegionLoading}
	        />
	    </div>

    </div>

    <div className='mt-2'>
        <CorrelationChart
          data={correlationData?.data}
          temperatureCorrelation={correlationData?.temperature_correlation}
          humidityCorrelation={correlationData?.humidity_correlation}
          groupBy={correlationGroupBy}
          onGroupByChange={(value) => setCorrelationGroupBy(value)}
          isLoading={isCorrelationLoading}
        />
    </div>

    <div className='mt-2'>
        <GenusHeatmap
          genera={genusHeatmapData?.genera}
          buckets={genusHeatmapData?.buckets}
          data={genusHeatmapData?.data}
          groupBy={genusHeatmapGroupBy}
          onGroupByChange={(value) => setGenusHeatmapGroupBy(value)}
          isLoading={isGenusHeatmapLoading}
        />
    </div>
    </div>
  )
}

export default Dashboard
