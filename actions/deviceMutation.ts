import { apiFetch } from "@/api/base";

export type CreateDevicePayload = {
    name: string;
    region: string;
    device_uuid: string;
    latitude: number;
    longitude: number;
    description: string;
    gmap_link: string;
    cluster_id: number;
};

export type UpdateDevicePayload = Partial<CreateDevicePayload>;

export type CreateDeviceClusterPayload = {
    name: string;
    description: string;
    password: string;
    public: boolean;
    cluster_admins: number[];
};


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
