import { useQuery } from "@tanstack/react-query"
import { getAllMosquitoEvents, getMosquitoEventsByDeviceUuid } from "@/queries/mosquito_data/mosquitoDeviceQueries"

export const useMosquitoEvents = (enabled = true) => {
	return useQuery({
		queryKey: ["mosquito-events"],
		queryFn: getAllMosquitoEvents,
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
