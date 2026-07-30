"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { apiFetch } from "@/api/base"
import { appendPagination, type PaginationParams } from "@/lib/pagination"

export const useResearcherRequests = (pagination?: PaginationParams) => {
  return useQuery({
    queryKey: ["researcherRequests", pagination ?? null],
    queryFn: async () => {
      const params = new URLSearchParams()
      appendPagination(params, pagination)
      const query = params.toString()
      // Now an authenticated endpoint — send the token and allow refresh-on-401.
      return await apiFetch(`/auth/researcher-requests${query ? `?${query}` : ""}`, { method: "GET" })
    },
    placeholderData: keepPreviousData,
  })
}
