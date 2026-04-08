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

export async function getMosquitoEventsByDeviceUuid(deviceUuid: string): Promise<MosquitoEvent[]> {
	if (!deviceUuid) return [];
	return apiFetch(`/devices/uuid/${encodeURIComponent(deviceUuid)}/mosquito-events`, {
		method: "GET",
	});
}

export async function getAllMosquitoEvents(): Promise<MosquitoEvent[]> {
	return apiFetch("/mosquito", {
		method: "GET",
	});
}



export async function getMosquitoEventDataById() {
	return apiFetch("/mosquito-event-data", {
		method: "GET",
	});
}
