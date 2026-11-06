"use client";

import React, { useMemo, useState } from "react";
import { useMosquitoEvents } from "@/hooks/mosquito";
import { getAllMosquitoEvents, type GetAllMosquitoEventsFilters, type MosquitoEvent } from "@/queries/mosquito_data/mosquitoDeviceQueries";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DownloadCsvButton from "./DownloadCsvButton";
import ColumnVisibilityDropdown, { useColumnVisibility } from "./ColumnVisibilityDropdown";
import Pagination from "@/components/Pagination";
import { resolvePage, fetchAllPages, DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { useRole } from "@/hooks/useRole";
import { detectionConfidence } from "@/lib/reading";
import type { Exclusion } from "@/types/api";
import ExclusionControl, { ExcludedBadge, exclusionCsv, exclusionTitle, excludedCellClass, useCanManageCluster } from "./ExclusionControl";

export type HistoricalDataRow = Partial<Exclusion> & {
  /** Event id + device uuid/cluster: present on fetched rows, needed for the exclude action. */
  id?: number;
  deviceUuid?: string | null;
  clusterId?: number | null;
  device: string;
  date: string;
  sex: string;
  ageGroup: string;
  genus: string;
  species: string;
  mosqConf: string;
  genusConf: string;
  sexConf: string;
};

// A single column definition drives both the table cell and the CSV export,
// so hiding a column hides it in both places.
type HistoricalColumn = {
  header: string;
  thClass?: string;
  tdClass?: string;
  cell: (row: HistoricalDataRow) => React.ReactNode;
  csv: (row: HistoricalDataRow) => string;
};

const HISTORICAL_COLUMNS: HistoricalColumn[] = [
  {
    header: "Device",
    tdClass: "px-5 whitespace-nowrap py-5 font-raleway font-medium",
    cell: (r) => r.device,
    csv: (r) => r.device,
  },
  {
    header: "Date",
    thClass: "text-center",
    tdClass: "px-5 whitespace-nowrap py-5 font-raleway text-center",
    cell: (r) => r.date,
    csv: (r) => r.date,
  },
  {
    header: "Genus",
    thClass: "text-center",
    tdClass: "px-5 py-5 whitespace-nowrap font-raleway text-center",
    cell: (r) => r.genus,
    csv: (r) => r.genus,
  },
  {
    header: "Species",
    thClass: "text-center",
    tdClass: "px-5 py-5 whitespace-nowrap font-raleway text-center",
    cell: (r) => r.species,
    csv: (r) => r.species,
  },
  {
    header: "Sex",
    thClass: "text-center",
    tdClass: "px-5 whitespace-nowrap py-5 font-raleway text-center",
    cell: (r) => r.sex,
    csv: (r) => r.sex,
  },
  {
    header: "Age Group",
    thClass: "text-right",
    tdClass: "px-5 py-5 whitespace-nowrap font-raleway text-right",
    cell: (r) => r.ageGroup,
    csv: (r) => r.ageGroup,
  },
  { header: "Mosquito confidence", thClass: "text-center", tdClass: "px-5 py-5 whitespace-nowrap font-raleway text-center", cell: (r) => r.mosqConf, csv: (r) => r.mosqConf },
  { header: "Genus confidence", thClass: "text-center", tdClass: "px-5 py-5 whitespace-nowrap font-raleway text-center", cell: (r) => r.genusConf, csv: (r) => r.genusConf },
  { header: "Sex confidence", thClass: "text-center", tdClass: "px-5 py-5 whitespace-nowrap font-raleway text-center", cell: (r) => r.sexConf, csv: (r) => r.sexConf },
  { header: "Excluded", thClass: "text-center", tdClass: "px-5 py-5 whitespace-nowrap font-raleway text-center", cell: (r) => <ExcludedBadge row={r} />, csv: exclusionCsv },
];

function formatDate(iso: string | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

// `||` not `??`: an empty string (MQTT sends sex "") shows as "—" too.
function toRow(event: MosquitoEvent): HistoricalDataRow {
  const reading = event.mosquito_reading;
  return {
    id: event.id,
    deviceUuid: event.device_uuid,
    clusterId: event.cluster_id,
    excluded_at: event.excluded_at ?? null,
    exclusion_reason: event.exclusion_reason ?? null,
    excluded_by_name: event.excluded_by_name ?? null,
    device: (typeof reading?.device_uuid === "string" ? reading.device_uuid : undefined) ?? String(event.device_id ?? "—"),
    date: formatDate(event.timestamp ?? reading?.detection_timestamp),
    sex: reading?.sex || "—",
    ageGroup: reading?.age_group || "—",
    genus: reading?.genus || "—",
    species: reading?.species || "—",
    ...detectionConfidence(reading),
  };
}

interface HistoricalDataTableProps {
  data?: HistoricalDataRow[];
  title?: string;
  isLoading?: boolean;
  filters?: GetAllMosquitoEventsFilters;
}

export default function HistoricalDataTable({
  data,
  title = "Historical Data",
  isLoading: isLoadingProp,
  filters,
}: HistoricalDataTableProps) {
  const shouldFetch = !data;
  const [page, setPage] = useState(1);

  // Reset to the first page whenever the active filters change (render-phase reset).
  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    setPrevFilters(filters);
    setPage(1);
  }

  const { data: response, isLoading: isLoadingQuery, error } = useMosquitoEvents(
    filters,
    { page, page_size: DEFAULT_PAGE_SIZE },
    shouldFetch
  );
  const eventsPage = useMemo(() => resolvePage<MosquitoEvent>(response, page, DEFAULT_PAGE_SIZE), [response, page]);
  const isLoading = isLoadingProp ?? (shouldFetch ? isLoadingQuery : false);

  const rows: HistoricalDataRow[] = useMemo(() => {
    if (data) return data;

    return eventsPage.items.map(toRow);
  }, [data, eventsPage]);

  const { selected, setSelected, visibleColumns } = useColumnVisibility(HISTORICAL_COLUMNS);
  const csvColumns = visibleColumns.map((c) => ({ header: c.header, accessor: c.csv }));
  // Guests are read-only: no data export.
  const { isGuest } = useRole();
  const { anyManaged, manages } = useCanManageCluster();
  // Only fetched rows carry the ids the action needs.
  const showActions = anyManaged && shouldFetch;

  return (
    <div className="bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-raleway font-semibold text-gray-900">{title}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
          {!isLoading && error && <span className="text-xs text-red-500">Failed to load</span>}
          <ColumnVisibilityDropdown
            columns={HISTORICAL_COLUMNS}
            selected={selected}
            onChange={setSelected}
            disabled={isLoading}
          />
          {!isGuest && (
            <DownloadCsvButton
              filename="historical-data"
              title={title}
              columns={csvColumns}
              rows={rows}
              disabled={isLoading}
              fetchAllRows={shouldFetch
                ? (onProgress) => fetchAllPages<MosquitoEvent>((p) => getAllMosquitoEvents(filters, p), onProgress).then((all) => all.map(toRow))
                : undefined}
            />
          )}
        </div>
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
              {showActions && <th className="px-6 py-5 font-bold text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                  >
                    {visibleColumns.map((c) => (
                      <td key={c.header} className={c.tdClass ?? "px-5 py-5"}>
                        <Skeleton width={100} height={14} />
                      </td>
                    ))}
                    {showActions && <td />}
                  </tr>
                ))
              : rows.map((row, index) => (
                  <tr
                    key={row.id ?? index}
                    title={exclusionTitle(row)}
                    className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                  >
                    {visibleColumns.map((c) => (
                      <td key={c.header} className={`${c.tdClass ?? "px-5 py-5"} ${excludedCellClass(row)}`}>
                        {c.cell(row)}
                      </td>
                    ))}
                    {showActions && (
                      <td className="px-5 py-3 text-right">
                        {row.id !== undefined && manages(row.clusterId) && (
                          <ExclusionControl kind="mosquito-events" deviceUuid={row.deviceUuid} rowId={row.id} excluded={!!row.excluded_at} />
                        )}
                      </td>
                    )}
                  </tr>
                ))}
            {!isLoading && rows.length === 0 && (
              <tr className="border-t border-secondary/15 text-sm">
                <td className="px-6 py-8 text-center text-gray-500" colSpan={visibleColumns.length + (showActions ? 1 : 0)}>
                  No mosquito events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {shouldFetch && (
        <Pagination
          page={eventsPage.page}
          totalPages={eventsPage.total_pages}
          total={eventsPage.total}
          pageSize={eventsPage.page_size}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
