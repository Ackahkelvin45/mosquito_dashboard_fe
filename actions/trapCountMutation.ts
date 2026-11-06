import { apiFetch } from "@/api/base";
import type { Genus, ManualCount, Sex } from "@/queries/trapCounts/trapCountQueries";

export type CreateTrapCountsPayload = {
  device_id: number;
  /** ISO 8601 with zone; the backend stores naive UTC */
  period_start: string;
  period_end: string;
  entries: { genus: Genus; sex: Sex; count: number; notes?: string }[];
};

export async function createTrapCounts(data: CreateTrapCountsPayload): Promise<ManualCount[]> {
  return apiFetch("/trap-counts", { method: "POST", body: JSON.stringify(data) });
}

export async function updateTrapCount(id: number, data: { count?: number; notes?: string | null }): Promise<ManualCount> {
  return apiFetch(`/trap-counts/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deleteTrapCount(id: number) {
  return apiFetch(`/trap-counts/${id}`, { method: "DELETE" });
}
