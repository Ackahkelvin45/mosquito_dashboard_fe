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
