import { apiFetch } from "@/api/base";
import { appendPagination, type PaginationParams, type Paginated } from "@/lib/pagination";
import type { Device, SensorReadingWithDevice } from "@/types/api";

export type GetDevicesFilters = {
    name?: string;
    region?: string;
    device_uuid?: string;
    /** General search across name, region, community and UUID. */
    search?: string;
    max_mosquito_count?: number;
    min_mosquito_count?: number;
    created_after?: string;
    longitude?: number;
    latitude?: number;
    /** A single cluster id, or several to match devices in any of them. */
    cluster_id?: number | number[];
    /** true → devices currently on, false → devices off. Omit for all. */
    trap_status?: boolean;
};

export async function getDevices(filters?: GetDevicesFilters, pagination?: PaginationParams): Promise<Paginated<Device>> {
    const params = new URLSearchParams();
    if (filters?.name) params.set("name", filters.name);
    if (filters?.region) params.set("region", filters.region);
    if (filters?.device_uuid) params.set("device_uuid", filters.device_uuid);
    if (filters?.search) params.set("search", filters.search);
    if (typeof filters?.max_mosquito_count === "number") params.set("max_mosquito_count", String(filters.max_mosquito_count));
    if (typeof filters?.min_mosquito_count === "number") params.set("min_mosquito_count", String(filters.min_mosquito_count));
    if (filters?.created_after) params.set("created_after", filters.created_after);
    if (typeof filters?.longitude === "number") params.set("longitude", String(filters.longitude));
    if (typeof filters?.latitude === "number") params.set("latitude", String(filters.latitude));
    if (Array.isArray(filters?.cluster_id)) {
        // cluster_id is repeatable: ?cluster_id=1&cluster_id=2
        filters.cluster_id.forEach((id) => params.append("cluster_id", String(id)));
    } else if (typeof filters?.cluster_id === "number") {
        params.set("cluster_id", String(filters.cluster_id));
    }
    if (typeof filters?.trap_status === "boolean") params.set("trap_status", String(filters.trap_status));
    appendPagination(params, pagination);

    const query = params.toString();

    return apiFetch(`/devices${query ? `?${query}` : ""}`,{
        method: "GET",

    })
}

export async function getDeviceById(id: string | number): Promise<Device> {
    return apiFetch(`/devices/${id}`, {
        method: "GET",
    })
}

export async function getClusters(pagination?: PaginationParams){
    const params = new URLSearchParams();
    appendPagination(params, pagination);
    const query = params.toString();
    return apiFetch(`/devices/clusters${query ? `?${query}` : ""}`,{
        method: "GET",
    })
}

export async function getClusterById(id: string) {
    return apiFetch(`/devices/clusters/${id}`, {
        method: "GET",
    })
}



// Kept as an alias so existing imports keep working; the shape now lives in
// the ONE shared model (types/api.ts).
export type SensorReadingRow = SensorReadingWithDevice;

export type GetAllSensorReadingsFilters = {
    start_date?: string;
    end_date?: string;
    /** Matches device name, UUID or region. */
    search?: string;
    region?: string[];
    device_uuid?: string[];
    /** Super admin only — the backend intersects this with your own scope regardless. */
    cluster_id?: number[];
};

export async function getAllSensorReadings(
    filters?: GetAllSensorReadingsFilters,
    pagination?: PaginationParams
): Promise<Paginated<SensorReadingRow>> {
    const params = new URLSearchParams();
    if (filters?.start_date) params.set("start_date", filters.start_date);
    if (filters?.end_date) params.set("end_date", filters.end_date);
    if (filters?.search) params.set("search", filters.search);
    // Multi-select filters are repeatable: ?region=a&region=b
    filters?.region?.forEach((r) => {
        if (r) params.append("region", r);
    });
    filters?.device_uuid?.forEach((uuid) => {
        if (uuid) params.append("device_uuid", uuid);
    });
    filters?.cluster_id?.forEach((id) => params.append("cluster_id", String(id)));
    appendPagination(params, pagination);
    const query = params.toString();
    return apiFetch(`/devices/sensor-readings${query ? `?${query}` : ""}`, {
        method: "GET",
    });
}

// ── Unregistered-device sightings (SUPER_ADMIN) ──────────────────────────────
// UUIDs publishing MQTT data with no registered device — the backend upserts
// one row per stray UUID so it can be registered (or dismissed) from the UI.

export type UnregisteredSighting = {
  device_uuid: string;
  first_seen: string;
  last_seen: string;
  message_count: number;
  last_topic: string | null;
  /** Last GPS fix seen in its payloads, for prefilling the add-device form */
  latitude: number | null;
  longitude: number | null;
};

export async function getUnregisteredSightings(): Promise<Paginated<UnregisteredSighting>> {
  return apiFetch("/devices/unregistered?page=1&page_size=50");
}
