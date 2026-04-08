import { useQuery } from "@tanstack/react-query"
import {
	getAllMosquitoEvents,
	getMosquitoEventsByDeviceUuid,
	type GetAllMosquitoEventsFilters,
	type GetMosquitoEventsByDeviceUuidFilters,
} from "@/queries/mosquito_data/mosquitoDeviceQueries"

export const useMosquitoEvents = (filters?: GetAllMosquitoEventsFilters, enabled = true) => {
	return useQuery({
		queryKey: ["mosquito-events", filters ?? {}],
		queryFn: () => getAllMosquitoEvents(filters),
		enabled,
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
	filters?: GetMosquitoEventsByDeviceUuidFilters
) => {
	return useQuery({
		queryKey: ["mosquito-events", deviceUuid, filters ?? {}],
		queryFn: () => getMosquitoEventsByDeviceUuid(deviceUuid, filters),
		enabled: !!deviceUuid,
	})
}
