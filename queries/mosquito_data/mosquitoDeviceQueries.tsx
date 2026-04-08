import { apiFetch } from "@/api/base";

export type MosquitoEvent = {
	id: number;
	timestamp: string;
	device_id?: number;
	device_uuid?: string;
	count?: number;
	individual_readings?: MosquitoIndividualReading[];
	mosquito_reading?: MosquitoIndividualReading;
	[key: string]: unknown;
};

export type MosquitoIndividualReading = {
	detection_timestamp: string;
	species: string | null;
	genus: string | null;
	age_group: string | null;
	sex: string | null;
	id: number;
	batch_id: number;
	device_uuid?: string;
	[key: string]: unknown;
};

export async function getMosquitoEventsByDeviceUuid(
	deviceUuid: string,
	filters?: GetMosquitoEventsByDeviceUuidFilters
): Promise<MosquitoEvent[]> {
	if (!deviceUuid) return [];

	const params = new URLSearchParams();
	if (filters?.range) {
		params.set("range", filters.range);
	}
	const query = params.toString();

	return apiFetch(`/devices/uuid/${encodeURIComponent(deviceUuid)}/mosquito-events${query ? `?${query}` : ""}`, {
		method: "GET",
	});
}

export type GetAllMosquitoEventsFilters = {
	start_date?: string;
	end_date?: string;
	search?: string;
};

export type MosquitoRange = "hour" | "day" | "week" | "month";

export type GetMosquitoEventsByDeviceUuidFilters = {
	range?: MosquitoRange;
};

export async function getAllMosquitoEvents(filters?: GetAllMosquitoEventsFilters): Promise<MosquitoEvent[]> {
	const params = new URLSearchParams();
	if (filters?.start_date) params.set("start_date", filters.start_date);
	if (filters?.end_date) params.set("end_date", filters.end_date);
	if (filters?.search) params.set("search", filters.search);
	const query = params.toString();

	return apiFetch(`/mosquito${query ? `?${query}` : ""}`, {
		method: "GET",
	});
}



export async function getMosquitoEventDataById() {
	return apiFetch("/mosquito-event-data", {
		method: "GET",
	});
}
