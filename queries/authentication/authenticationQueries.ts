import { apiFetch } from "@/api/base";



export async function getCurrentUser(){
    return apiFetch("/auth/me",{
        method: "GET",
      
    })
}
export type SecuritySettings = { two_factor_login_enabled: boolean }

export async function getSecuritySettings(): Promise<SecuritySettings> {
  return apiFetch("/auth/security-settings")
}
