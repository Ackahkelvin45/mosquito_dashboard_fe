"use client";

import React, { useMemo, useState } from "react";
import { useAllSensorReadings } from "@/hooks/device";
import { getAllSensorReadings, type GetAllSensorReadingsFilters, type SensorReadingRow } from "@/queries/device/deviceQueries";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DownloadCsvButton from "./DownloadCsvButton";
import ColumnVisibilityDropdown, { useColumnVisibility } from "./ColumnVisibilityDropdown";
import Pagination from "@/components/Pagination";
import { resolvePage, fetchAllPages, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { useRole } from "@/hooks/useRole";
import { batteryVoltage, externalHumidity, externalTemp, internalHumidity, internalPressure, internalTemp } from "@/lib/reading";
import ExclusionControl, { ExcludedBadge, exclusionCsv, exclusionTitle, excludedCellClass, useCanManageCluster } from "./ExclusionControl";

type SensorColumn = {
  header: string;
  thClass?: string;
  tdClass?: string;
  cell: (row: SensorReadingRow) => React.ReactNode;
  csv: (row: SensorReadingRow) => string;
};

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const num = (v: number | null | undefined, unit = ""): string =>
  v === null || v === undefined ? "—" : `${Number(v.toFixed(2))}${unit}`;

const centered = "px-5 py-5 whitespace-nowrap font-raleway text-center";

const SENSOR_COLUMNS: SensorColumn[] = [
  {
    header: "Device",
    tdClass: "px-5 whitespace-nowrap py-5 font-raleway font-medium",
    cell: (r) => r.device_name || r.device_uuid || String(r.device_id),
    csv: (r) => r.device_name || r.device_uuid || String(r.device_id),
  },
  {
    header: "Date",
    thClass: "text-center",
    tdClass: centered,
    cell: (r) => formatDate(r.timestamp),
    csv: (r) => r.timestamp ?? "",
  },
  { header: "Int Temp (°C)", thClass: "text-center", tdClass: centered, cell: (r) => num(internalTemp(r)), csv: (r) => num(internalTemp(r)) },
  { header: "Ext Temp (°C)", thClass: "text-center", tdClass: centered, cell: (r) => num(externalTemp(r)), csv: (r) => num(externalTemp(r)) },
  { header: "Int Humidity (%)", thClass: "text-center", tdClass: centered, cell: (r) => num(internalHumidity(r)), csv: (r) => num(internalHumidity(r)) },
  { header: "Ext Humidity (%)", thClass: "text-center", tdClass: centered, cell: (r) => num(externalHumidity(r)), csv: (r) => num(externalHumidity(r)) },
  { header: "Pressure (hPa)", thClass: "text-center", tdClass: centered, cell: (r) => num(internalPressure(r)), csv: (r) => num(internalPressure(r)) },
  { header: "Light", thClass: "text-center", tdClass: centered, cell: (r) => num(r.external_light), csv: (r) => num(r.external_light) },
  { header: "Battery (V)", thClass: "text-center", tdClass: centered, cell: (r) => num(batteryVoltage(r)), csv: (r) => num(batteryVoltage(r)) },
  {
    header: "Trap",
    thClass: "text-right",
    tdClass: "px-5 py-5 whitespace-nowrap font-raleway text-right",
    cell: (r) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.trap_status ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
        {r.trap_status ? "On" : "Off"}
      </span>
    ),
    csv: (r) => (r.trap_status ? "On" : "Off"),
  },
  { header: "Excluded", thClass: "text-center", tdClass: centered, cell: (r) => <ExcludedBadge row={r} />, csv: exclusionCsv },
];

interface SensorDataTableProps {
  title?: string;
  filters?: GetAllSensorReadingsFilters;
}

export default function SensorDataTable({ title = "Sensor Data", filters }: SensorDataTableProps) {
  const [page, setPage] = useState(1);

  // Reset to the first page whenever the active filters change (render-phase reset).
  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setPage(1);
  }

  const { data: response, isLoading, error } = useAllSensorReadings(filters, {
    page,
    page_size: DEFAULT_PAGE_SIZE,
  });
  const readingsPage = useMemo(
    () => resolvePage<SensorReadingRow>(response, page, DEFAULT_PAGE_SIZE),
    [response, page]
  );
  const rows = readingsPage.items;

  const { selected, setSelected, visibleColumns } = useColumnVisibility(SENSOR_COLUMNS);
  const csvColumns = visibleColumns.map((c) => ({ header: c.header, accessor: c.csv }));
  // Guests are read-only: no data export.
  const { isGuest } = useRole();
  const { anyManaged, manages } = useCanManageCluster();

  return (
    <div className="bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-raleway font-semibold text-gray-900">{title}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
          {!isLoading && error && <span className="text-xs text-red-500">Failed to load</span>}
          <ColumnVisibilityDropdown
            columns={SENSOR_COLUMNS}
            selected={selected}
            onChange={setSelected}
            disabled={isLoading}
          />
          {!isGuest && (
            <DownloadCsvButton
              filename="sensor-data"
              title={title}
              columns={csvColumns}
              rows={rows}
              disabled={isLoading}
              fetchAllRows={(onProgress) => fetchAllPages<SensorReadingRow>((p) => getAllSensorReadings(filters, p), onProgress)}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl mt-4 border border-secondary/15">
        <table className="w-full min-w-[900px] text-left border-collapse">
          <thead className="bg-[#DAE3F8]/30 font-raleway">
            <tr className="text-gray-700 text-sm">
              {visibleColumns.map((c) => (
                <th key={c.header} className={`px-6 py-5 font-bold ${c.thClass ?? ""}`}>
                  {c.header}
                </th>
              ))}
              {anyManaged && <th className="px-6 py-5 font-bold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30">
                    {visibleColumns.map((c) => (
                      <td key={c.header} className={c.tdClass ?? "px-5 py-5"}>
                        <Skeleton width={80} height={14} />
                      </td>
                    ))}
                    {anyManaged && <td />}
                  </tr>
                ))
              : rows.map((row, index) => (
                  <tr key={row.id ?? index} title={exclusionTitle(row)} className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30">
                    {visibleColumns.map((c) => (
                      <td key={c.header} className={`${c.tdClass ?? "px-5 py-5"} ${excludedCellClass(row)}`}>
                        {c.cell(row)}
                      </td>
                    ))}
                    {anyManaged && (
                      <td className="px-5 py-3 text-right">
                        {manages(row.cluster_id) && (
                          <ExclusionControl kind="sensor-readings" deviceUuid={row.device_uuid} rowId={row.id} excluded={!!row.excluded_at} />
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            {!isLoading && rows.length === 0 && (
              <tr className="border-t border-secondary/15 text-sm">
                <td className="px-6 py-8 text-center text-gray-500" colSpan={visibleColumns.length + (anyManaged ? 1 : 0)}>
                  No sensor readings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={readingsPage.page}
        totalPages={readingsPage.total_pages}
        total={readingsPage.total}
        pageSize={readingsPage.page_size}
        onPageChange={setPage}
        isLoading={isLoading}
      />
    </div>
  );
}
