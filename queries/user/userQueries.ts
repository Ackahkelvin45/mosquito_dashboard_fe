import { apiFetch } from "@/api/base";
import { appendPagination, type PaginationParams } from "@/lib/pagination";

export async function getUsers(pagination?: PaginationParams) {
    const params = new URLSearchParams();
    appendPagination(params, pagination);
    const query = params.toString();
    return apiFetch(`/auth/users${query ? `?${query}` : ""}`, {
        method: "GET",
    }, true);
}
