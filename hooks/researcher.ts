"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { apiFetch } from "@/api/base"
import { appendPagination, type PaginationParams } from "@/lib/pagination"

export type ResearcherRequestFilters = {
  /** pending | approved | rejected */
  status?: string
  /** Matches applicant first name, last name or email. */
  search?: string
}

export async function getResearcherRequests(pagination?: PaginationParams, filters?: ResearcherRequestFilters) {
  const params = new URLSearchParams()
  if (filters?.status) params.set("status", filters.status)
  if (filters?.search) params.set("search", filters.search)
  appendPagination(params, pagination)
  const query = params.toString()
  // Now an authenticated endpoint — send the token and allow refresh-on-401.
  return await apiFetch(`/auth/researcher-requests${query ? `?${query}` : ""}`, { method: "GET" })
}

export const useResearcherRequests = (pagination?: PaginationParams, filters?: ResearcherRequestFilters) => {
  return useQuery({
    queryKey: ["researcherRequests", pagination ?? null, filters ?? null],
    queryFn: () => getResearcherRequests(pagination, filters),
    placeholderData: keepPreviousData,
  })
}
