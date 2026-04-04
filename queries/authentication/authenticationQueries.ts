import { apiFetch } from "@/api/base";



export async function getCurrentUser(){
    return apiFetch("/auth/me",{
        method: "GET",
      
    })
}