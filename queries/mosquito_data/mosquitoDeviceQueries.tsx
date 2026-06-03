import { apiFetch } from "@/api/base";
import { appendPagination, DEFAULT_PAGE_SIZE, type PaginationParams, type Paginated } from "@/lib/pagination";

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
	filters?: GetMosquitoEventsByDeviceUuidFilters,
	pagination?: PaginationParams
): Promise<Paginated<MosquitoEvent>> {
	if (!deviceUuid) return { items: [], total: 0, page: 1, page_size: DEFAULT_PAGE_SIZE, total_pages: 0 };

	const params = new URLSearchParams();
	if (filters?.range) {
		params.set("range", filters.range);
	}
	appendPagination(params, pagination);
	const query = params.toString();

	return apiFetch(`/devices/uuid/${encodeURIComponent(deviceUuid)}/mosquito-events${query ? `?${query}` : ""}`, {
		method: "GET",
	});
}

export type GetAllMosquitoEventsFilters = {
	start_date?: string;
	end_date?: string;
	search?: string;
	region?: string;
	/** Pass multiple uuids to filter several devices at once. */
	device_uuid?: string[];
	genus?: string;
	species?: string;
};

export type MosquitoRange = "hour" | "day" | "week" | "month";

export type GetMosquitoEventsByDeviceUuidFilters = {
	range?: MosquitoRange;
};

export async function getAllMosquitoEvents(
	filters?: GetAllMosquitoEventsFilters,
	pagination?: PaginationParams
): Promise<Paginated<MosquitoEvent>> {
	const params = new URLSearchParams();
	if (filters?.start_date) params.set("start_date", filters.start_date);
	if (filters?.end_date) params.set("end_date", filters.end_date);
	if (filters?.search) params.set("search", filters.search);
	if (filters?.region) params.set("region", filters.region);
	if (filters?.genus) params.set("genus", filters.genus);
	if (filters?.species) params.set("species", filters.species);
	// device_uuid is repeatable: ?device_uuid=a&device_uuid=b
	filters?.device_uuid?.forEach((uuid) => {
		if (uuid) params.append("device_uuid", uuid);
	});
	appendPagination(params, pagination);
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
