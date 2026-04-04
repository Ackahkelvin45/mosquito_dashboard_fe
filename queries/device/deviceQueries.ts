import { apiFetch } from "@/api/base";



export async function getDevices(){
    return apiFetch("/devices/",{
        method: "GET",
      
    })
}

export async function getClusters(){
    return apiFetch("/devices/clusters/",{
        method: "GET",
    })
}

export async function getClusterById(id: string) {
    return apiFetch(`/devices/clusters/${id}/`, {
        method: "GET",
    })
}