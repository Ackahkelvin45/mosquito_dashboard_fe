"use client";

import React, { useMemo } from "react";
import { useMosquitoEvents } from "@/hooks/mosquito";
import type { MosquitoEvent } from "@/queries/mosquito_data/mosquitoDeviceQueries";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export type HistoricalDataRow = {
  device: string;
  date: string;
  sex: string;
  ageGroup: string;
  genus: string;
  species: string;
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
  });
}

interface HistoricalDataTableProps {
  data?: HistoricalDataRow[];
  title?: string;
  isLoading?: boolean;
}

export default function HistoricalDataTable({
  data,
  title = "Historical Data",
  isLoading: isLoadingProp,
}: HistoricalDataTableProps) {
  const shouldFetch = !data;
  const { data: events = [], isLoading: isLoadingQuery, error } = useMosquitoEvents(shouldFetch);
  const isLoading = isLoadingProp ?? (shouldFetch ? isLoadingQuery : false);

  const rows: HistoricalDataRow[] = useMemo(() => {
    if (data) return data;

    const list = (Array.isArray(events) ? events : []) as MosquitoEvent[];
    return list.map((event) => {
      const reading = event.mosquito_reading;
      return {
        device: reading?.device_uuid ?? String(event.device_id ?? "—"),
        date: formatDate(event.timestamp ?? reading?.detection_timestamp),
        sex: reading?.sex ?? "—",
        ageGroup: reading?.age_group ?? "—",
        genus: reading?.genus ?? "—",
        species: reading?.species ?? "—",
      };
    });
  }, [data, events]);

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-raleway font-semibold text-gray-900">{title}</h2>
        {isLoading && <span className="text-xs text-gray-400">Loading…</span>}
        {!isLoading && error && <span className="text-xs text-red-500">Failed to load</span>}
      </div>

      <div className="overflow-hidden rounded-2xl mt-4 border border-secondary/15">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#DAE3F8]/30 font-raleway">
            <tr className="text-gray-700 text-sm">
              <th className="px-6 py-5 font-bold">Device</th>
              <th className="px-6 py-5 font-ibold text-center">Date</th>
              <th className="px-6 py-5 font-ibold text-center">Sex</th>
              <th className="px-6 py-5 font-ibold text-center">Age Group</th>
              <th className="px-6 py-5 font-ibold text-center">Genus</th>
              <th className="px-6 py-5 font-ibold text-right">Species</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                  >
                    <td className="px-5 py-5">
                      <Skeleton width={120} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={120} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={70} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={90} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={90} height={14} />
                    </td>
                    <td className="px-5 py-5 flex justify-end">
                      <Skeleton width={120} height={14} />
                    </td>
                  </tr>
                ))
              : rows.map((row, index) => (
                  <tr
                    key={index}
                    className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                  >
                    <td className="px-5 py-5 font-raleway font-medium">
                      {row.device}
                    </td>
                    <td className="px-5 py-5 font-raleway text-center">
                      {row.date}
                    </td>
                    <td className="px-5 py-5 font-raleway text-center">
                      {row.sex}
                    </td>
                    <td className="px-5 py-5 font-raleway text-center">{row.ageGroup}</td>
                    <td className="px-5 py-5 font-raleway text-center">{row.genus}</td>
                    <td className="px-5 py-5 font-raleway text-right">{row.species}</td>
                  </tr>
                ))}
            {!isLoading && rows.length === 0 && (
              <tr className="border-t border-secondary/15 text-sm">
                <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                  No mosquito events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
