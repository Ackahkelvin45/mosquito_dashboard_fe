import { useQuery } from "@tanstack/react-query"
import { getDashboardData, type DashboardGroupBy } from "@/queries/dashboard/dashboardQueries"

// Live surveillance data — polled so the landing-page stats reflect new
// readings/detections without the user having to navigate away and back
// (matches hooks/device.ts, hooks/mosquito.ts).
const LIVE_REFETCH_MS = 30_000

// clusterIds is the super-admin-only cluster filter (empty/undefined = all
// clusters they're allowed to see — see useRole().canFilterByCluster). The
// backend intersects it with the caller's own scope regardless, so passing
// it for a non-super-admin is harmless, just redundant.

export const useDashboardTotals = (groupBy: DashboardGroupBy, clusterIds?: number[]) => {
	return useQuery({
		queryKey: ["dashboard", "totals", groupBy, clusterIds ?? null],
		queryFn: () => getDashboardData({ totals_group_by: groupBy, cluster_id: clusterIds }),
		select: (data) => data.totals,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useMosquitoChart = (groupBy: DashboardGroupBy, clusterIds?: number[]) => {
	return useQuery({
		queryKey: ["dashboard", "chart", groupBy, clusterIds ?? null],
		queryFn: () => getDashboardData({ chart_group_by: groupBy, cluster_id: clusterIds }),
		select: (data) => data.chart,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useMosquitoBreakdown = (groupBy: DashboardGroupBy, clusterIds?: number[]) => {
	return useQuery({
		queryKey: ["dashboard", "breakdown", groupBy, clusterIds ?? null],
		queryFn: () => getDashboardData({ breakdown_group_by: groupBy, cluster_id: clusterIds }),
		select: (data) => data.breakdown,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useGenderDistribution = (groupBy: DashboardGroupBy, clusterIds?: number[]) => {
	return useQuery({
		queryKey: ["dashboard", "gender", groupBy, clusterIds ?? null],
		queryFn: () => getDashboardData({ gender_group_by: groupBy, cluster_id: clusterIds }),
		select: (data) => data.gender_distribution,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useRegionBreakdown = (groupBy: DashboardGroupBy, clusterIds?: number[]) => {
	return useQuery({
		queryKey: ["dashboard", "region", groupBy, clusterIds ?? null],
		queryFn: () => getDashboardData({ region_group_by: groupBy, cluster_id: clusterIds }),
		select: (data) => data.region_chart,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useSensorStatus = (groupBy: DashboardGroupBy, clusterIds?: number[]) => {
	return useQuery({
		queryKey: ["dashboard", "sensor_status", groupBy, clusterIds ?? null],
		queryFn: () => getDashboardData({ sensor_status_group_by: groupBy, cluster_id: clusterIds }),
		select: (data) => data.sensor_status_chart,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useCorrelationChart = (groupBy: DashboardGroupBy, clusterIds?: number[]) => {
	return useQuery({
		queryKey: ["dashboard", "correlation", groupBy, clusterIds ?? null],
		queryFn: () => getDashboardData({ correlation_group_by: groupBy, cluster_id: clusterIds }),
		select: (data) => data.correlation_chart,
		refetchInterval: LIVE_REFETCH_MS,
		refetchOnWindowFocus: true,
	})
}

export const useGenusHeatmap = (groupBy: DashboardGroupBy, clusterIds?: number[]) => {
	return useQuery({
		queryKey: ["dashboard", "genus_heatmap", groupBy, clusterIds ?? null],
		queryFn: () => getDashboardData({ genus_heatmap_group_by: groupBy, cluster_id: clusterIds }),
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
