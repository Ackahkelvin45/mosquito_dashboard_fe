import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiFetch } from "@/api/base"

// CSV batch import — see mosquito_dashboard_be/app/device/imports.py.
// Format = the /api/v1/export CSV for the same dataset.

export type ImportKind = "sensor-readings" | "mosquito-events"

// Mirrors SENSOR_READING_COLUMNS / MOSQUITO_EVENT_COLUMNS in the backend's
// app/api_access/queries.py (the export column order).
export const EXPORT_COLUMNS: Record<ImportKind, string[]> = {
  "sensor-readings": [
    "id", "timestamp", "device_uuid", "device_name", "region", "community", "cluster_id",
    "external_temperature", "internal_temperature", "external_humidity", "internal_humidity",
    "external_pressure", "internal_pressure", "external_light", "battery_voltage", "trap_status",
    "battery_pct",
  ],
  "mosquito-events": [
    "id", "timestamp", "device_uuid", "device_name", "region", "community", "cluster_id",
    "count", "detection_timestamp", "species", "genus", "age_group", "sex",
    "p_mosq",
  ],
}
// Present in the export, ignored on import.
export const IGNORED_COLUMNS = ["id", "device_name", "region", "community", "cluster_id"]
// Added to the export later; optional on import (absent or empty → stored empty).
export const OPTIONAL_COLUMNS = ["battery_pct", "p_mosq"]

export type ImportReport = {
  kind: ImportKind
  rows_total: number
  error_count: number
  errors: { row: number; error: string }[]
  rows_to_import: number
  rows_skipped: number
  skipped_rows: number[]
  /** Imported anyway: same device + timestamp as a stored row, different values */
  conflict_count: number
  conflict_rows: number[]
  dry_run?: boolean
  imported?: boolean
  batch_id?: number
}

export type DataImport = {
  id: number
  kind: ImportKind
  filename: string | null
  cluster_id: number | null
  rows_total: number
  rows_imported: number
  rows_skipped: number
  imported_by_user_id: number
  created_at: string
}

const KEY = ["imports"]

export const useImports = () =>
  useQuery<DataImport[]>({ queryKey: KEY, queryFn: () => apiFetch("/imports") })

export const useUploadImport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ kind, file, dryRun }: { kind: ImportKind; file: File; dryRun: boolean }): Promise<ImportReport> => {
      const params = new URLSearchParams({ dry_run: String(dryRun), filename: file.name })
      // Raw CSV body, not multipart (the backend has no multipart parser).
      return apiFetch(`/imports/${kind}?${params}`, {
        method: "POST", body: file, headers: { "Content-Type": "text/csv" },
      })
    },
    // A real import changes readings, events and device counts everywhere:
    // refetch every cached query, not just the import list.
    onSuccess: (_, { dryRun }) => {
      if (!dryRun) queryClient.invalidateQueries()
    },
  })
}

export const useDeleteImport = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiFetch(`/imports/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries(),
  })
}
