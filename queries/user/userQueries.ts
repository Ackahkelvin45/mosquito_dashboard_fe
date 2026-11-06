import { apiFetch } from "@/api/base";
import { appendPagination, type PaginationParams } from "@/lib/pagination";

export type GetUsersFilters = {
    /** Matches first name, last name or email. */
    search?: string;
    role?: string;
    approval_status?: string;
};

export async function getUsers(pagination?: PaginationParams, filters?: GetUsersFilters) {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.role) params.set("role", filters.role);
    if (filters?.approval_status) params.set("approval_status", filters.approval_status);
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
