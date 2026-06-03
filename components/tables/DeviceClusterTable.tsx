"use client";

import { PencilLine, Trash2, Users, Monitor } from "lucide-react";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Link from "next/link";
import DownloadCsvButton from "./DownloadCsvButton";
import type { CsvColumn } from "@/lib/csv";

export type DeviceCluster = {
  id: number;
  cluster_uuid: string;
  name: string;
  description: string;
  public: boolean;
  created_at: string;
  updated_at: string;
  devices: any[];
  admins: any[];
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface DeviceClusterTableProps {
  data?: DeviceCluster[];
  isLoading?: boolean;
}

const SKELETON_ROWS = 6;

const CSV_COLUMNS: CsvColumn<DeviceCluster>[] = [
  { header: "ID", accessor: (r) => r.id },
  { header: "Cluster Name", accessor: (r) => r.name },
  { header: "Cluster UUID", accessor: (r) => r.cluster_uuid },
  { header: "Description", accessor: (r) => r.description },
  { header: "Visibility", accessor: (r) => (r.public ? "Public" : "Private") },
  { header: "Devices", accessor: (r) => r.devices?.length || 0 },
  { header: "Admins", accessor: (r) => r.admins?.length || 0 },
  { header: "Created At", accessor: (r) => r.created_at },
];

export default function DeviceClusterTable({
  data = [],
  isLoading = false,
}: DeviceClusterTableProps) {
  return (
    <div className="bg-white">
      <div className="flex justify-end">
        <DownloadCsvButton
          filename="device-clusters"
          title="Device Clusters"
          columns={CSV_COLUMNS}
          rows={data}
          disabled={isLoading}
        />
      </div>
      <div className="overflow-x-auto rounded-2xl mt-4 border border-secondary/15">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead className="bg-[#DAE3F8]/30 font-raleway">
            <tr className="text-gray-700 text-sm">
              <th className="px-6 py-5 font-bold">Cluster Name</th>
              <th className="px-6 py-5 font-bold">Description</th>
              <th className="px-6 py-5 font-bold text-center">Visibility</th>
              <th className="px-6 py-5 font-bold text-center">Devices</th>
              <th className="px-6 py-5 font-bold text-center">Admins</th>
              <th className="px-6 py-5 font-bold text-right">Created At</th>
              <th className="px-6 py-5 font-bold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {isLoading
              ? Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr
                    key={i}
                    className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                  >
                    <td className="px-5 py-5">
                      <Skeleton width={120} height={14} />
                    </td>
                    <td className="px-5 py-5">
                      <Skeleton width={150} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={60} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={40} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={40} height={14} />
                    </td>
                    <td className="px-5 py-5 flex justify-end">
                      <Skeleton width={90} height={14} />
                    </td>
                    <td className="px-5 py-5">
                        <Skeleton width={50} height={14} />
                    </td>
                  </tr>
                ))
              : data.map((row, index) => (
                  <tr
                    key={row.id ?? index}
                    className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                  >
                    <td className="px-5 py-5 font-raleway font-medium">
                      <Link 
                        href={`/device-clusters/${row.id}`} 
                        className="text-primary hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-5 py-5 font-raleway text-gray-600 truncate max-w-[200px]">
                      {row.description || "No description"}
                    </td>
                    <td className="px-5 py-5 font-raleway text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${row.public ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {row.public ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-5 py-5 font-raleway text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Monitor size={14} className="text-gray-400" />
                        <span>{row.devices?.length || 0}</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 font-raleway text-center">
                        <div className="flex items-center justify-center gap-1.5">
                            <Users size={14} className="text-gray-400" />
                            <span>{row.admins?.length || 0}</span>
                        </div>
                    </td>
                    <td className="px-5 py-5 font-raleway text-right">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-5 py-5 flex gap-2 justify-center items-center font-mulish text-right font-semibold text-black">
                      <button title="Edit Cluster">
                        <PencilLine size={16} className="text-primary hover:scale-110 transition-transform" />
                      </button>
                      <button title="Delete Cluster">
                        <Trash2 size={16} className="text-red-500 hover:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}

            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-sm text-gray-400"
                >
                  No device clusters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}