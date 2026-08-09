import { apiFetch } from "@/api/base";
import type { ApiKeyCreated } from "@/queries/apiKeys/apiKeyQueries";

export type CreateApiKeyPayload = {
    name: string;
    description?: string;
    /** Omit for a key that never expires. */
    expires_in_days?: number;
};

export async function createApiKey(data: CreateApiKeyPayload): Promise<ApiKeyCreated> {
    return apiFetch("/api-keys", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function revokeApiKey(keyId: number) {
    return apiFetch(`/api-keys/${keyId}`, { method: "DELETE" });
}

/** Super admin: revoke every active key belonging to a user. */
export async function revokeUserKeys(userId: number): Promise<{ revoked: number }> {
    return apiFetch(`/api-keys/revoke-user/${userId}`, { method: "POST" });
}
