"use client";

import React, { useState } from "react";
import { useSetRowExclusion } from "@/hooks/device";
import { useRole } from "@/hooks/useRole";
import type { ExclusionKind } from "@/actions/deviceMutation";
import type { Exclusion } from "@/types/api";

// Same limit as the backend (ExclusionRequest.reason).
const REASON_MAX = 500;

/** Who may exclude rows of a device: super admin, or an admin of the device's
 * own cluster (same rule as the backend's manages_cluster). UI gating only. */
export function useCanManageCluster() {
  const { isSuperAdmin, isAdmin, clusterId } = useRole();
  return {
    anyManaged: isSuperAdmin || (isAdmin && clusterId !== null),
    manages: (deviceClusterId: number | null | undefined) =>
      isSuperAdmin || (isAdmin && clusterId !== null && deviceClusterId === clusterId),
  };
}

/** Hover text for an excluded row; undefined when included. */
export function exclusionTitle(row: Partial<Exclusion>): string | undefined {
  if (!row.excluded_at) return undefined;
  // excluded_by_name is only sent to viewers who manage the device.
  const by = row.excluded_by_name;
  return `Excluded from analysis: ${row.exclusion_reason ?? ""}${by ? ` (by ${by})` : ""}`;
}

/** Greys out an excluded row's data cells (not the action cell). */
export const excludedCellClass = (row: Partial<Exclusion>) => (row.excluded_at ? "opacity-50" : "");

/** CSV cell for the "Excluded" column. */
export const exclusionCsv = (row: Partial<Exclusion>) => (row.excluded_at ? `Yes: ${row.exclusion_reason ?? ""}` : "");

/** Visible "Excluded" cell. The reason is shown as text (truncated; tap to
 * expand), not only in `title`, which phones never display. */
export function ExcludedBadge({ row }: { row: Partial<Exclusion> }) {
  if (!row.excluded_at) return null;
  return (
    <details className="max-w-[12rem] text-left text-xs">
      <summary className="cursor-pointer list-none">
        <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">Excluded</span>
        <span className="block truncate text-gray-600 mt-1">{row.exclusion_reason}</span>
      </summary>
      <p className="mt-1 whitespace-normal break-words text-gray-700">
        {row.exclusion_reason}
        {row.excluded_by_name && <span className="block text-gray-500">by {row.excluded_by_name}</span>}
      </p>
    </details>
  );
}

interface ExclusionControlProps {
  kind: ExclusionKind;
  deviceUuid: string | null | undefined;
  rowId: number;
  excluded: boolean;
}

/** Exclude (asks for a reason inline) / Include (asks to confirm inline). */
export default function ExclusionControl({ kind, deviceUuid, rowId, excluded }: ExclusionControlProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const mutation = useSetRowExclusion();
  if (!deviceUuid) return null;

  const close = () => {
    setOpen(false);
    setReason("");
    mutation.reset();
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!excluded && !trimmed) return;
    mutation.mutate(
      { kind, deviceUuid, rowId, reason: excluded ? null : trimmed },
      { onSuccess: close },
    );
  };

  const btn = "px-2.5 py-1 rounded-md text-xs font-semibold disabled:opacity-40";
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`${btn} border border-secondary/20 text-primary hover:bg-primary/5`}>
        {excluded ? "Include" : "Exclude"}
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="flex flex-wrap items-center justify-end gap-1.5">
      {excluded ? (
        <span className="text-xs text-gray-700">Include in analysis again?</span>
      ) : (
        <input
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={REASON_MAX}
          placeholder="Reason (required, publicly visible)"
          aria-label="Reason for excluding — visible to anyone who can see this data, including public viewers"
          title="Visible to anyone who can see this data, including public viewers"
          className="w-40 border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-primary"
        />
      )}
      {!excluded && (
        <span className="w-full text-right text-[11px] text-gray-500">
          The reason is visible to anyone who can see this data, including public viewers.
        </span>
      )}
      <button type="submit" disabled={mutation.isPending || (!excluded && !reason.trim())} className={`${btn} bg-primary text-white`}>
        {mutation.isPending ? "Saving…" : excluded ? "Include" : "Exclude"}
      </button>
      <button type="button" onClick={close} disabled={mutation.isPending} className={`${btn} text-gray-500 hover:bg-gray-50`}>
        Cancel
      </button>
      {mutation.error && <span className="w-full text-right text-xs text-red-500">{mutation.error.message}</span>}
    </form>
  );
}
