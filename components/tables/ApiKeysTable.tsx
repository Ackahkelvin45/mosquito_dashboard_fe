"use client";

import { Trash2, UserX } from "lucide-react";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import type { ApiKeyRow } from "@/queries/apiKeys/apiKeyQueries";
import { formatTimestamp, parseApiDate, timeAgo } from "@/lib/date";

type KeyStatus = "active" | "revoked" | "expired";

export function keyStatus(row: ApiKeyRow): KeyStatus {
  if (row.revoked_at) return "revoked";
  if (row.expires_at && parseApiDate(row.expires_at).getTime() <= Date.now()) return "expired";
  return "active";
}

const STATUS_STYLES: Record<KeyStatus, string> = {
  active: "bg-green-100 text-green-700",
  revoked: "bg-red-100 text-red-600",
  expired: "bg-gray-200 text-gray-600",
};

interface ApiKeysTableProps {
  data?: ApiKeyRow[];
  isLoading?: boolean;
  showOwner?: boolean;
  onRevoke: (row: ApiKeyRow) => void;
  /** Super-admin view: revoke every key belonging to this row's owner. */
  onRevokeAllForOwner?: (row: ApiKeyRow) => void;
}

const SKELETON_ROWS = 4;

export default function ApiKeysTable({
  data = [],
  isLoading = false,
  showOwner = false,
  onRevoke,
  onRevokeAllForOwner,
}: ApiKeysTableProps) {
  const columnCount = showOwner ? 8 : 7;

  return (
    <div className="overflow-x-auto rounded-2xl mt-4 border border-secondary/15">
      <table className="w-full min-w-[820px] text-left border-collapse">
        <thead className="bg-[#DAE3F8]/30 font-raleway">
          <tr className="text-gray-700 text-sm">
            <th className="px-6 py-5 font-bold">Name</th>
            {showOwner && <th className="px-6 py-5 font-bold">Owner</th>}
            <th className="px-6 py-5 font-bold">Key</th>
            <th className="px-6 py-5 font-bold text-center">Status</th>
            <th className="px-6 py-5 font-bold text-center">Created</th>
            <th className="px-6 py-5 font-bold text-center">Last Used</th>
            <th className="px-6 py-5 font-bold text-center">Expires</th>
            <th className="px-6 py-5 font-bold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <tr key={i} className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <td key={j} className="px-5 py-5">
                    <Skeleton width={j === 0 ? 140 : 90} height={14} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr className="border-t border-secondary/15">
              <td colSpan={columnCount} className="px-6 py-10 text-center text-sm text-gray-500 font-raleway">
                No API keys yet. Create one to access the data API.
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const status = keyStatus(row);
              return (
                <tr key={row.id} className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30">
                  <td className="px-5 py-5 font-raleway">
                    <span className="font-medium text-gray-900">{row.name}</span>
                    {row.description && (
                      <p className="text-xs text-gray-500 mt-0.5 max-w-[220px] truncate">{row.description}</p>
                    )}
                  </td>
                  {showOwner && (
                    <td className="px-5 py-5 font-raleway text-gray-700">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[180px]">{row.owner_email || "—"}</span>
                        {onRevokeAllForOwner && status === "active" && (
                          <button
                            onClick={() => onRevokeAllForOwner(row)}
                            title="Revoke all keys for this user"
                            className="shrink-0 p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <UserX size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                  <td className="px-5 py-5 font-mono text-xs text-gray-600">{row.key_prefix}…</td>
                  <td className="px-5 py-5 text-center">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}>
                      {status}
                    </span>
                    {status === "revoked" && row.revoked_by_email && (
                      <p className="text-[11px] text-gray-400 mt-1 whitespace-nowrap">
                        by {row.revoked_by_email === row.owner_email ? "owner" : row.revoked_by_email}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-5 font-raleway text-center text-gray-700 whitespace-nowrap">
                    {formatTimestamp(row.created_at)}
                  </td>
                  <td className="px-5 py-5 font-raleway text-center text-gray-700 whitespace-nowrap">
                    {row.last_used_at ? timeAgo(row.last_used_at) : "Never"}
                  </td>
                  <td className="px-5 py-5 font-raleway text-center text-gray-700 whitespace-nowrap">
                    {row.expires_at ? formatTimestamp(row.expires_at) : "Never"}
                  </td>
                  <td className="px-5 py-5">
                    <div className="flex justify-end">
                      {status !== "revoked" && (
                        <button
                          onClick={() => onRevoke(row)}
                          className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-xs font-medium transition-colors"
                        >
                          <Trash2 size={14} />
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
