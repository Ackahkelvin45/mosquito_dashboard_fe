import { apiFetch } from "@/api/base";

export async function getUsers() {
    return apiFetch("/auth/users", {
        method: "GET",
    }, true); // Setting skipAuth=true temporarily if it's not well-defined, or false. Wait, usually endpoints need auth. I'll omit skipAuth or put it as false but maybe just use the 2-arg version.
}
