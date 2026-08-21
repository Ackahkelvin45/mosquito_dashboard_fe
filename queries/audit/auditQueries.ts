import { apiFetch } from "@/api/base";
import type { Paginated } from "@/lib/pagination";

// FR-27 audit log (SUPER_ADMIN only).

export type AuditLogEntry = {
  id: number;
  occurred_at: string;
  actor_user_id: number | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  detail: Record<string, unknown> | null;
  ip: string | null;
};

export type AuditLogFilters = {
  action?: string;
  actor_email?: string;
  start_date?: string;
  end_date?: string;
};

export async function getAuditLogs(
  page: number,
  pageSize = 20,
  filters?: AuditLogFilters,
): Promise<Paginated<AuditLogEntry>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (filters?.action) params.set("action", filters.action);
  if (filters?.actor_email) params.set("actor_email", filters.actor_email);
  if (filters?.start_date) params.set("start_date", filters.start_date);
  if (filters?.end_date) params.set("end_date", filters.end_date);
  return apiFetch(`/audit-logs?${params.toString()}`);
}

export async function getAuditActions(): Promise<string[]> {
  return apiFetch("/audit-logs/actions");
}
