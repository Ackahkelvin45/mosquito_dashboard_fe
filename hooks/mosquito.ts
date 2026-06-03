import { useQuery, keepPreviousData } from "@tanstack/react-query"
import {
	getAllMosquitoEvents,
	getMosquitoEventsByDeviceUuid,
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
