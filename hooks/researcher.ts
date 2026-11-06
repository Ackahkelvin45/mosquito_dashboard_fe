"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { apiFetch } from "@/api/base"
import { appendPagination, type PaginationParams } from "@/lib/pagination"

export async function getResearcherRequests(pagination?: PaginationParams) {
  const params = new URLSearchParams()
  appendPagination(params, pagination)
  const query = params.toString()
  // Now an authenticated endpoint — send the token and allow refresh-on-401.
  return await apiFetch(`/auth/researcher-requests${query ? `?${query}` : ""}`, { method: "GET" })
}

export const useResearcherRequests = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ["researcherRequests", pagination ?? null],
    queryFn: () => getResearcherRequests(pagination),
    placeholderData: keepPreviousData,
  })
}
