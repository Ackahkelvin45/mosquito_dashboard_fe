import { apiFetch } from "@/api/base";

export type ApiKeyRow = {
    id: number;
    name: string;
    description: string | null;
    key_prefix: string;
    user_id: number;
    created_at: string;
    expires_at: string | null;
    revoked_at: string | null;
    last_used_at: string | null;
    total_requests: number;
    /** Present only in the super-admin "all keys" listing. */
    owner_email?: string | null;
    revoked_by_email?: string | null;
};

/** Metadata for a freshly created key — `api_key` is shown exactly once. */
export type ApiKeyCreated = ApiKeyRow & { api_key: string };

export type ApiKeyFilters = {
    /** Super-admin listing only: matches owner email or key name. */
    search?: string;
    status?: "active" | "revoked" | "expired";
    sort?: "created_at" | "last_used";
};

export async function getApiKeys(all = false, filters?: ApiKeyFilters): Promise<ApiKeyRow[]> {
    const params = new URLSearchParams();
    if (all) {
        params.set("all", "true");
        if (filters?.search) params.set("search", filters.search);
        if (filters?.status) params.set("status", filters.status);
        if (filters?.sort) params.set("sort", filters.sort);
    }
    const query = params.toString();
    return apiFetch(`/api-keys${query ? `?${query}` : ""}`, { method: "GET" });
}
