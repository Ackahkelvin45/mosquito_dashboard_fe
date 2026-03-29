import { apiFetch } from "@/api/base";

export type CreateDevicePayload = {
    name: string;
    region: string;
    device_uuid: string;
    latitude: number;
    longitude: number;
    description: string;
    gmap_link: string;
};

export async function createDevice(data: CreateDevicePayload) {
    try {
        const res = await apiFetch("/devices/create", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}