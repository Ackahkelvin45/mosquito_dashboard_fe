import { apiFetch } from "@/api/base";

export async function getResearcherRequests() {
    return apiFetch("/auth/researcher-requests/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    }, true);
}
