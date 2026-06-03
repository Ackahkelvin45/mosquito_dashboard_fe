import { apiFetch } from "@/api/base";
import { appendPagination, type PaginationParams } from "@/lib/pagination";

export type GetDevicesFilters = {
    name?: string;
    region?: string;
    device_uuid?: string;
    max_mosquito_count?: number;
    min_mosquito_count?: number;
    created_after?: string;
    longitude?: number;
    latitude?: number;
    cluster_id?: number;
    /** true → devices currently on, false → devices off. Omit for all. */
    trap_status?: boolean;
};

export async function getDevices(filters?: GetDevicesFilters, pagination?: PaginationParams){
    const params = new URLSearchParams();
    if (filters?.name) params.set("name", filters.name);
    if (filters?.region) params.set("region", filters.region);
    if (filters?.device_uuid) params.set("device_uuid", filters.device_uuid);
    if (typeof filters?.max_mosquito_count === "number") params.set("max_mosquito_count", String(filters.max_mosquito_count));
    if (typeof filters?.min_mosquito_count === "number") params.set("min_mosquito_count", String(filters.min_mosquito_count));
    if (filters?.created_after) params.set("created_after", filters.created_after);
    if (typeof filters?.longitude === "number") params.set("longitude", String(filters.longitude));
    if (typeof filters?.latitude === "number") params.set("latitude", String(filters.latitude));
    if (typeof filters?.cluster_id === "number") params.set("cluster_id", String(filters.cluster_id));
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


