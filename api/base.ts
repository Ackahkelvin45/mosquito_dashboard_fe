import { useAuthStore } from "@/store/authStore"

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL

function toHeaderRecord(h: RequestInit["headers"]): Record<string, string> {
  if (!h) return {}
  if (h instanceof Headers) {
    const o: Record<string, string> = {}
    h.forEach((v, k) => { o[k] = v })
    return o
  }
  if (Array.isArray(h)) return Object.fromEntries(h) as Record<string, string>
  return { ...h }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  skipAuth = false
) {
  const { accessToken, logout, setAuth } = useAuthStore.getState()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...toHeaderRecord(options.headers),
  }

  if (accessToken && !skipAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: "include" })
  } catch {
    throw new Error("Network error. Please check your connection.")
  }

  // Refresh token logic, skip for login/signup
  if (!skipAuth && res.status === 401) {
    const { refreshToken } = useAuthStore.getState()

    const refreshRes = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (refreshRes.ok) {
      const data = await refreshRes.json()
      setAuth(data.access_token, data.refresh_token,data?.user_id)
      headers["Authorization"] = `Bearer ${data.access_token}`
      res = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: "include" })
    } else {
      logout()
      throw new Error("Not authenticated")
    }
  }

  if (!res.ok) {
    const json = await res.json().catch(() => null)
    throw new Error(json?.detail || `API error: ${res.status}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}