"use client"

import { useQuery } from "@tanstack/react-query"
import { apiFetch } from "@/api/base"

export const useResearcherRequests = () => {
  return useQuery({
    queryKey: ["researcherRequests"],
    queryFn: async () => {
      return await apiFetch("/auth/researcher-requests/", { method: "GET" }, true)
    },
  })
}
