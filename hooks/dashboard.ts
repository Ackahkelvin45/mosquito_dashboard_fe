import { useQuery } from "@tanstack/react-query"
import { getDashboardData, type DashboardGroupBy } from "@/queries/dashboard/dashboardQueries"

export const useDashboardTotals = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "totals", groupBy],
		queryFn: () => getDashboardData({ totals_group_by: groupBy }),
		select: (data) => data.totals,
	})
}

export const useMosquitoChart = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "chart", groupBy],
		queryFn: () => getDashboardData({ chart_group_by: groupBy }),
		select: (data) => data.chart,
	})
}

export const useMosquitoBreakdown = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "breakdown", groupBy],
		queryFn: () => getDashboardData({ breakdown_group_by: groupBy }),
		select: (data) => data.breakdown,
	})
}

export const useGenderDistribution = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "gender", groupBy],
		queryFn: () => getDashboardData({ gender_group_by: groupBy }),
		select: (data) => data.gender_distribution,
	})
}

export const useRegionBreakdown = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "region", groupBy],
		queryFn: () => getDashboardData({ region_group_by: groupBy }),
		select: (data) => data.region_chart,
	})
}

export const useSensorStatus = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "sensor_status", groupBy],
		queryFn: () => getDashboardData({ sensor_status_group_by: groupBy }),
		select: (data) => data.sensor_status_chart,
	})
}

export const useCorrelationChart = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "correlation", groupBy],
		queryFn: () => getDashboardData({ correlation_group_by: groupBy }),
		select: (data) => data.correlation_chart,
	})
}

export const useGenusHeatmap = (groupBy: DashboardGroupBy) => {
	return useQuery({
		queryKey: ["dashboard", "genus_heatmap", groupBy],
		queryFn: () => getDashboardData({ genus_heatmap_group_by: groupBy }),
		select: (data) => data.genus_heatmap,
	})
}

// Custom date range — one call scopes EVERY section (totals, charts, breakdown,
// correlation, heatmap) to the same window, so the whole response is returned.
export const useDashboardRange = (startDate?: string, endDate?: string) => {
	return useQuery({
		queryKey: ["dashboard", "range", startDate, endDate],
		queryFn: () => getDashboardData({ start_date: startDate, end_date: endDate }),
		enabled: Boolean(startDate && endDate),
	})
}
