"use server"

import { apiFetch } from "@/api/base"

export type LoginResult =
  | { success: true; access_token: string; refresh_token: string }
  | { success: false; error: string }

export async function loginUser(data: { email: string; password: string }): Promise<LoginResult> {
  try {                                        // ✅ wrap everything
    const res = await apiFetch(
      "/auth/login",
      { method: "POST", body: JSON.stringify(data) },
      true
    )
    return { success: true, access_token: res.access_token, refresh_token: res.refresh_token }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed. Please try again."
    return { success: false, error: message }  // ✅ return, never throw
  }
}