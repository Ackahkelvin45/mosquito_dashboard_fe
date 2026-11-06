import { apiFetch } from "@/api/base";

// Manual trap counts vs the device's AI detections. See
// mosquito_dashboard_be/app/trap_counts. Timestamps are naive UTC.

export const GENERA = ["anopheles", "aedes", "culex", "other"] as const;
export const SEXES = ["female", "male", "unknown"] as const;
export type Genus = (typeof GENERA)[number];
export type Sex = (typeof SEXES)[number];

export type ManualCount = {
  id: number;
  device_id: number;
  period_start: string;
  period_end: string;
  genus: Genus;
  sex: Sex;
  count: number;
  notes: string | null;
  entered_by_user_id: number;
  created_at: string;
  updated_at: string;
};

export type ComparisonGroup = {
  genus: Genus;
  sex: Sex;
  manual: number;
  ai: number;
  /** ai - manual */
  difference: number;
};

export type TrapCollection = {
  device_id: number;
  device_name: string;
  cluster_id: number | null;
  period_start: string;
  period_end: string;
  /** false = no live sensor reading in the period, so an AI 0 is not a measured zero */
  device_reporting: boolean;
  entries: ManualCount[];
  /** Only the genus x sex groups entered by hand; totals cover these */
  groups: ComparisonGroup[];
  manual_total: number;
  ai_total: number;
  /** ai_total - manual_total */
  difference: number;
  /** AI detections in groups nobody counted by hand — shown, never compared */
  ai_not_counted: { genus: Genus; sex: Sex; ai: number }[];
};

export async function getTrapCollections(): Promise<TrapCollection[]> {
  return apiFetch("/trap-counts");
}
