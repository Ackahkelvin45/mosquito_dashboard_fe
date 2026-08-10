import { useQuery } from "@tanstack/react-query"
import { getDashboardData, type DashboardGroupBy } from "@/queries/dashboard/dashboardQueries"

// Live surveillance data — polled so the landing-page stats reflect new
// readings/detections without the user having to navigate away and back
// (matches hooks/device.ts, hooks/mosquito.ts).
const LIVE_REFETCH_MS = 30_000

export const useDashboardTotals = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "totals", groupBy],
		queryFn: () => getDashboardData({ totals_group_by: groupBy }),
		select: (data) => data.totals,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useMosquitoChart = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "chart", groupBy],
		queryFn: () => getDashboardData({ chart_group_by: groupBy }),
		select: (data) => data.chart,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useMosquitoBreakdown = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "breakdown", groupBy],
		queryFn: () => getDashboardData({ breakdown_group_by: groupBy }),
		select: (data) => data.breakdown,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useGenderDistribution = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "gender", groupBy],
		queryFn: () => getDashboardData({ gender_group_by: groupBy }),
		select: (data) => data.gender_distribution,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useRegionBreakdown = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "region", groupBy],
		queryFn: () => getDashboardData({ region_group_by: groupBy }),
		select: (data) => data.region_chart,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useSensorStatus = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "sensor_status", groupBy],
		queryFn: () => getDashboardData({ sensor_status_group_by: groupBy }),
		select: (data) => data.sensor_status_chart,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useCorrelationChart = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "correlation", groupBy],
		queryFn: () => getDashboardData({ correlation_group_by: groupBy }),
		select: (data) => data.correlation_chart,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useGenusHeatmap = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "genus_heatmap", groupBy],
		queryFn: () => getDashboardData({ genus_heatmap_group_by: groupBy }),
		select: (data) => data.genus_heatmap,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

// Custom date range — one call scopes EVERY section (totals, charts, breakdown,
// correlation, heatmap) to the same window, so the whole response is returned.
// Not polled: a user-picked historical range isn't "live now" data.
export const useDashboardRange = (startDate?: string, endDate?: string) => {
	return useQuery({
		queryKey: ["dashboard", "range", startDate, endDate],
		queryFn: () => getDashboardData({ start_date: startDate, end_date: endDate }),
		enabled: Boolean(startDate && endDate),
	})
}
