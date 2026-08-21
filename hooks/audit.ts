import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getAuditActions, getAuditLogs, type AuditLogFilters } from "@/queries/audit/auditQueries"

export const useAuditLogs = (page: number, filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: ["audit-logs", page, filters ?? null],
    queryFn: () => getAuditLogs(page, 20, filters),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  })
}

export const useAuditActions = () => {
  return useQuery({
    queryKey: ["audit-logs", "actions"],
    queryFn: getAuditActions,
    staleTime: Infinity, // the enum only changes with a deploy
  })
}
