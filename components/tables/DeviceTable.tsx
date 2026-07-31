"use client";

import { PencilLine ,Trash2} from "lucide-react";
import React, { useState } from "react";
import Link from "next/link";
import ApproveDeleteDeviceModal from "../modal/ApproveDeleteDeviceModal";
import { useDeleteDevice } from "@/hooks/device";
import { useRole } from "@/hooks/useRole";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DownloadCsvButton from "./DownloadCsvButton";
import ColumnVisibilityDropdown, { useColumnVisibility } from "./ColumnVisibilityDropdown";

export type DeviceRow = {
  name: string;
  // Position and its derived labels are absent until the device reports.
  longitude?: number | null;
  latitude?: number | null;
  region?: string | null;
  community?: string | null;
  description?: string | null;
  gmap_link?: string | null;
  id: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
  total_mosquito_count: number;
  // Computed device liveness (reported within last 24h) — independent of trap on/off.
  is_active?: boolean;
  trap_status?: boolean;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// A single column definition drives both the table cell and the CSV export,
// so hiding a column hides it in both places.
type DeviceColumn = {
  header: string;
  thClass?: string;
  tdClass?: string;
  cell: (row: DeviceRow) => React.ReactNode;
  csv: (row: DeviceRow) => string | number;
};

const DEVICE_COLUMNS: DeviceColumn[] = [
  {
    header: "ID",
    tdClass: "px-5 py-5 font-raleway font-semibold",
    cell: (row) => (
      <Link href={`/devices/${row.id}`} className="text-primary hover:underline">
        #{row.id}
      </Link>
    ),
    csv: (r) => r.id,
  },
  {
    header: "Name",
    tdClass: "px-5 py-5 font-raleway font-medium",
    cell: (r) => r.name,
    csv: (r) => r.name,
  },
  {
    header: "Community",
    tdClass: "px-5 py-5 font-raleway",
    cell: (r) => r.community || <span className="text-gray-400">—</span>,
    csv: (r) => r.community ?? "",
  },
  {
    header: "Region",
    tdClass: "px-5 py-5 font-raleway",
    cell: (r) => r.region || <span className="text-gray-400">—</span>,
    csv: (r) => r.region ?? "",
  },
  {
    header: "Coordinates",
    thClass: "text-center",
    tdClass: "px-5 py-5 font-raleway text-center text-gray-500 text-xs",
    // Null until the device reports a GPS fix — `.toFixed()` on that throws.
    cell: (r) =>
      typeof r.latitude === "number" && typeof r.longitude === "number"
        ? `${r.latitude.toFixed(3)}, ${r.longitude.toFixed(3)}`
        : <span className="text-gray-400">Awaiting GPS</span>,
    csv: (r) =>
      typeof r.latitude === "number" && typeof r.longitude === "number"
        ? `${r.latitude}, ${r.longitude}`
        : "",
  },
  {
    header: "Last Activity",
    thClass: "text-center",
    tdClass: "px-5 py-5 font-raleway text-center",
    cell: (r) => formatDate(r.last_activity),
    csv: (r) => r.last_activity,
  },
  {
    header: "Activity",
    thClass: "text-center",
    tdClass: "px-5 py-5 font-raleway text-center",
    cell: (r) => (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          r.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${r.is_active ? "bg-green-500" : "bg-gray-400"}`} />
        {r.is_active ? "Active" : "Inactive"}
      </span>
    ),
    csv: (r) => (r.is_active ? "Active" : "Inactive"),
  },
  {
    header: "Mosquito Count",
    thClass: "text-right",
    tdClass: "px-5 py-5 font-mulish text-right font-semibold text-black",
    cell: (r) => r.total_mosquito_count,
    csv: (r) => r.total_mosquito_count,
  },
];

interface DeviceTableProps {
  data?: DeviceRow[];
  isLoading?: boolean;
}

const SKELETON_ROWS = 6;

export default function DeviceTable({
  data = [],
  isLoading = false,
}: DeviceTableProps) {
  const [deviceToDelete, setDeviceToDelete] = useState<DeviceRow | null>(null);
  const deleteDeviceMutation = useDeleteDevice();
  const { selected, setSelected, visibleColumns } = useColumnVisibility(DEVICE_COLUMNS);
  // Guests are read-only: no edit/delete actions and no data export.
  const { isGuest } = useRole();

  const csvColumns = visibleColumns.map((c) => ({ header: c.header, accessor: c.csv }));
  // +1 for the Actions column (hidden for guests).
  const colSpan = visibleColumns.length + (isGuest ? 0 : 1);

  const handleConfirmDelete = () => {
    if (deviceToDelete) {
      deleteDeviceMutation.mutate(deviceToDelete.id, {
        onSuccess: () => {
          setDeviceToDelete(null);
        },
      });
    }
  };

  return (
    <div className="bg-white">
      <div className="flex justify-end gap-3">
        <ColumnVisibilityDropdown
          columns={DEVICE_COLUMNS}
          selected={selected}
          onChange={setSelected}
          disabled={isLoading}
        />
        {!isGuest && (
          <DownloadCsvButton
            filename="devices"
            title="Devices"
            columns={csvColumns}
            rows={data}
            disabled={isLoading}
          />
        )}
      </div>
      <div className="overflow-x-auto rounded-2xl mt-4 border border-secondary/15">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead className="bg-[#DAE3F8]/30 font-raleway">
            <tr className="text-gray-700 text-sm">
              {visibleColumns.map((c) => (
                <th key={c.header} className={`px-6 py-5 font-bold ${c.thClass ?? ""}`}>
                  {c.header}
                </th>
              ))}
              {!isGuest && <th className="px-6 py-5 font-bold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                  >
                    {visibleColumns.map((c) => (
                      <td key={c.header} className={c.tdClass ?? "px-5 py-5"}>
                        <Skeleton width={100} height={14} />
                      </td>
                    ))}
                    {!isGuest && (
                      <td className="px-5 py-5 flex gap-2 justify-end">
                        <Skeleton width={50} height={14} />
                      </td>
                    )}
                  </tr>
                ))
              : data.map((row, index) => (
                  <tr
                    key={row.id ?? index}
                    className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                  >
                    {visibleColumns.map((c) => (
                      <td key={c.header} className={c.tdClass ?? "px-5 py-5"}>
                        {c.cell(row)}
                      </td>
                    ))}
                    {!isGuest && (
                      <td className="px-5 py-5 flex gap-2 justify-center items-center font-mulish text-right font-semibold text-black">
                        <Link href={`/devices/${row.id}/edit`}>
                          <PencilLine size={16} className="text-primary"/>
                        </Link>

                        <button onClick={() => setDeviceToDelete(row)}>
                          <Trash2 size={16} className="text-red-500"/>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}

            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-6 py-10 text-center text-sm text-gray-400"
                >
                  No devices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ApproveDeleteDeviceModal
        isOpen={!!deviceToDelete}
        deviceName={deviceToDelete?.name || ""}
        isPending={deleteDeviceMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeviceToDelete(null)}
      />
    </div>
  );
}
