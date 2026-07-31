import { apiFetch } from "@/api/base";

export type CreateDevicePayload = {
    name: string;
    cluster_id: number;
    // All optional: the device reports its own position, and region/community
    // are reverse-geocoded from those coordinates rather than typed in.
    region?: string;
    community?: string;
    device_uuid?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    gmap_link?: string;
};

export type UpdateDevicePayload = Partial<CreateDevicePayload>;

export type CreateDeviceClusterPayload = {
    name: string;
    description: string;
    public: boolean;
    cluster_admins: number[];
    // Member users assigned to the cluster (sets their cluster_id).
    users?: number[];
};

// Partial update: omitted fields are left unchanged by the backend; `users`
// replaces the member list when sent (members dropped from it are unassigned).
export type UpdateDeviceClusterPayload = Partial<CreateDeviceClusterPayload>;


export async function createDevice(data: CreateDevicePayload) {
    try {
        const res = await apiFetch("/devices", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function createDeviceCluster(data: CreateDeviceClusterPayload) {
    try {
        const res = await apiFetch("/devices/clusters", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function updateDeviceCluster(clusterId: string | number, data: UpdateDeviceClusterPayload) {
    try {
        const res = await apiFetch(`/devices/clusters/${clusterId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function deleteDevice(deviceId: string | number) {
    try {
        const res = await apiFetch(`/devices/${deviceId}`, {
            method: "DELETE",
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
export async function updateDevice(deviceId: string | number, data: UpdateDevicePayload) {
    try {
        const res = await apiFetch(`/devices/${deviceId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
