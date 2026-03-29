import { apiFetch } from "@/api/base";



export async function getDevices(){
    return apiFetch("/devices/",{
        method: "GET",
      
    })
}