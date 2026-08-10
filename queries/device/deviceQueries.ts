import { apiFetch } from "@/api/base";
import { appendPagination, type PaginationParams, type Paginated } from "@/lib/pagination";

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

export async function getDevices(filters?: GetDevicesFilters, pagination?: PaginationParams){
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

export async function getDeviceById(id: string | number) {
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



export type SensorReadingRow = {
    id: number;
    device_id: number;
    timestamp: string;
    temp_external?: number | null;
    temp_internal?: number | null;
    humidity_external?: number | null;
    humidity_internal?: number | null;
    pressure_internal?: number | null;
    external_pressure?: number | null;
    external_light?: number | null;
    battery?: number | null;
    /** 0-100, already normalised for the device's configured battery profile. */
    battery_pct?: number | null;
    trap_status?: boolean | null;
    /** Whether the Gateway currently has a live link to the Listener Unit —
     * false means "no mosquitoes detected" can't be trusted (detector may be offline). */
    esp1_link_alive?: boolean | null;
    device_uuid?: string | null;
    device_name?: string | null;
    region?: string | null;
};

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
