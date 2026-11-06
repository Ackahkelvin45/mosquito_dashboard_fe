import { useQuery } from "@tanstack/react-query"
import {
  getDataQuality,
  getModelPerformance,
  getMqttErrors,
  getMqttStatus,
  getMqttTraffic,
  getSurveillanceReport,
  type ReportPeriod,
} from "@/queries/monitoring/monitoringQueries"

// System Health is a live operations view — poll faster than the data pages.
// Status cards refresh every 10s; charts/feeds every 30s (matches the
// LIVE_REFETCH_MS convention in hooks/dashboard.ts).
export const STATUS_REFETCH_MS = 10_000
const FEED_REFETCH_MS = 30_000

export const useMqttStatus = () => {
  return useQuery({
    queryKey: ["monitoring", "mqtt-status"],
    queryFn: getMqttStatus,
    refetchInterval: STATUS_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}

export const useMqttTraffic = (hours: number, deviceId?: number) => {
  return useQuery({
    queryKey: ["monitoring", "mqtt-traffic", hours, deviceId ?? null],
    queryFn: () => getMqttTraffic(hours, deviceId),
    refetchInterval: FEED_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}

export const useMqttErrors = (page: number, errorType?: string) => {
  return useQuery({
    queryKey: ["monitoring", "mqtt-errors", page, errorType ?? null],
    queryFn: () => getMqttErrors(page, 20, errorType),
    refetchInterval: FEED_REFETCH_MS,
    refetchOnWindowFocus: true,
  })
}

// Aggregates over days of readings — no polling, just refetch on focus.
export const useDataQuality = (days: number) => {
  return useQuery({
    queryKey: ["monitoring", "data-quality", days],
    queryFn: () => getDataQuality(days),
    refetchOnWindowFocus: true,
  })
}

export const useModelPerformance = (days: number) => {
  return useQuery({
    queryKey: ["model-performance", days],
    queryFn: () => getModelPerformance(days),
    // Heavy aggregate (up to 365 days); React Query refetches on focus by default.
    refetchOnWindowFocus: false,
  })
}

export const useSurveillanceReport = (period: ReportPeriod, end: string, region?: string) => {
  return useQuery({
    queryKey: ["reports", "surveillance", period, end, region ?? null],
    queryFn: () => getSurveillanceReport(period, end, region),
    enabled: Boolean(end),
    refetchOnWindowFocus: false,
  })
}
