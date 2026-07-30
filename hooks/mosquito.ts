import { useQuery, keepPreviousData } from "@tanstack/react-query"
import {
	getAllMosquitoEvents,
	getMosquitoEventsByDeviceUuid,
	getMosquitoFilterOptions,
	type GetAllMosquitoEventsFilters,
	type GetMosquitoEventsByDeviceUuidFilters,
} from "@/queries/mosquito_data/mosquitoDeviceQueries"
import type { PaginationParams } from "@/lib/pagination"

export const useMosquitoEvents = (
	filters?: GetAllMosquitoEventsFilters,
	pagination?: PaginationParams,
	enabled = true
) => {
	return useQuery({
		queryKey: ["mosquito-events", filters ?? {}, pagination ?? null],
		queryFn: () => getAllMosquitoEvents(filters, pagination),
		enabled,
		placeholderData: keepPreviousData,
	})
}

export const useMosquitoFilterOptions = () => {
	return useQuery({
		queryKey: ["mosquito-filter-options"],
		queryFn: getMosquitoFilterOptions,
		// Distinct values change rarely; keep them fresh for 5 minutes.
		staleTime: 5 * 60 * 1000,
	})
}

export const useMosquitoEventsByDeviceUuid = (deviceUuid: string) => {
	return useQuery({
		queryKey: ["mosquito-events", deviceUuid],
		queryFn: () => getMosquitoEventsByDeviceUuid(deviceUuid),
		enabled: !!deviceUuid,
	})
}

export const useMosquitoEventsByDeviceUuidWithFilters = (
	deviceUuid: string,
	filters?: GetMosquitoEventsByDeviceUuidFilters,
	pagination?: PaginationParams
) => {
	return useQuery({
		queryKey: ["mosquito-events", deviceUuid, filters ?? {}, pagination ?? null],
		queryFn: () => getMosquitoEventsByDeviceUuid(deviceUuid, filters, pagination),
		enabled: !!deviceUuid,
		placeholderData: keepPreviousData,
	})
}
