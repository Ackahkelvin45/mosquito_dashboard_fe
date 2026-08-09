import { apiFetch } from "@/api/base";
import { appendPagination, type PaginationParams } from "@/lib/pagination";

export async function getUsers(pagination?: PaginationParams) {
    const params = new URLSearchParams();
    appendPagination(params, pagination);
    const query = params.toString();
    // /auth/users now requires authentication, so send the token (skipAuth=false)
    // and let a 401 trigger the shared refresh-and-retry.
    return apiFetch(`/auth/users${query ? `?${query}` : ""}`, {
        method: "GET",
    });
}

export async function getUserById(userId: number | string) {
    return apiFetch(`/auth/users/${userId}`, {
        method: "GET",
    });
}
