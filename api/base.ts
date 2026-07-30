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

// A single in-flight refresh shared across all callers. Without this, several
// requests hitting 401 at the same time would each POST /auth/refresh-token with
// the same refresh token; because the backend rotates refresh tokens, only the
// first succeeds and the rest fail with an already-used token, forcing a logout.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setAuth, logout } = useAuthStore.getState()

  if (!refreshToken) {
    logout()
    throw new Error("Not authenticated")
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      // The backend expects refresh_token as a query parameter, not a JSON body.
      const refreshUrl = `${API_URL}/auth/refresh-token?refresh_token=${encodeURIComponent(refreshToken)}`
      const refreshRes = await fetch(refreshUrl, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }).catch(() => null)

      if (!refreshRes || !refreshRes.ok) {
        logout()
        throw new Error("Not authenticated")
      }

      const data = await refreshRes.json()
      setAuth(data.access_token, data.refresh_token, data?.user_id)
      return data.access_token as string
    })().finally(() => {
      // Allow the next genuine 401 (after this new token also expires) to refresh again.
      refreshPromise = null
    })
  }

  return refreshPromise
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  skipAuth = false
) {
  const { accessToken } = useAuthStore.getState()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...toHeaderRecord(options.headers),
  }

  if (accessToken && !skipAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_BACKEND_API_URL is not set. Add it to .env and restart the dev server (env is read at boot)."
    )
  }

  let res: Response
  try {
    res = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: "include" })
  } catch (err) {
    // fetch rejects with a generic TypeError and hides the real reason on
    // `cause` (ECONNREFUSED, ENOTFOUND, UND_ERR_CONNECT_TIMEOUT, TLS errors...).
    // Without unwrapping it, every transport failure looks identical and there
    // is nothing to debug from.
    const cause = (err as { cause?: { code?: string; message?: string } })?.cause
    const reason = cause?.code || cause?.message || (err as Error)?.message || "unknown error"
    console.error(
      `[apiFetch] ${options.method ?? "GET"} ${API_URL}${endpoint} failed: ${reason}`,
      err
    )
    throw new Error(`Network error (${reason}). Please check your connection.`)
  }

  // On 401, refresh the access token (shared across concurrent calls) and retry once.
  // Skipped for login/signup endpoints.
  if (!skipAuth && res.status === 401) {
    const newAccessToken = await refreshAccessToken()
    headers["Authorization"] = `Bearer ${newAccessToken}`
    res = await fetch(`${API_URL}${endpoint}`, { ...options, headers, credentials: "include" })
  }

  if (!res.ok) {
    const json = await res.json().catch(() => null)
    throw new Error(json?.detail || `API error: ${res.status}`)
  }

  const text = await res.text()
  return text ? JSON.parse(text) : null
}