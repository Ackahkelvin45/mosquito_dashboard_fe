import { useQuery } from "@tanstack/react-query"
import {
  getMqttErrors,
  getMqttStatus,
  getMqttTraffic,
} from "@/queries/monitoring/monitoringQueries"

// System Health is a live operations view — poll faster than the data pages.
// Status cards refresh every 10s; charts/feeds every 30s (matches the
// LIVE_REFETCH_MS convention in hooks/dashboard.ts).
const STATUS_REFETCH_MS = 10_000
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
