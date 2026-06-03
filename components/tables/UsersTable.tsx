"use client";

import { PencilLine, Trash2 } from "lucide-react";
import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DownloadCsvButton from "./DownloadCsvButton";
import type { CsvColumn } from "@/lib/csv";

export type UserRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
  created_at: string;
};

function formatDate(iso: string): string {
  if (!iso) return "N/A";
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface UsersTableProps {
  data?: UserRow[];
  isLoading?: boolean;
}

const SKELETON_ROWS = 6;

const CSV_COLUMNS: CsvColumn<UserRow>[] = [
  { header: "ID", accessor: (r) => r.id },
  { header: "First Name", accessor: (r) => r.first_name },
  { header: "Last Name", accessor: (r) => r.last_name },
  { header: "Email", accessor: (r) => r.email },
  { header: "Role", accessor: (r) => r.role || "User" },
  { header: "Date Joined", accessor: (r) => r.created_at },
];

export default function UsersTable({
  data = [],
  isLoading = false,
}: UsersTableProps) {
  return (
    <div className="bg-white">
      <div className="flex justify-end">
        <DownloadCsvButton
          filename="users"
          title="Users"
          columns={CSV_COLUMNS}
          rows={data}
          disabled={isLoading}
        />
      </div>
      <div className="overflow-x-auto rounded-2xl mt-4 border border-secondary/15">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead className="bg-[#DAE3F8]/30 font-raleway">
            <tr className="text-gray-700 text-sm">
              <th className="px-6 py-5 font-bold">Name</th>
              <th className="px-6 py-5 font-bold">Email</th>
              <th className="px-6 py-5 font-bold text-center">Role</th>
              <th className="px-6 py-5 font-bold text-center">Date Joined</th>
              <th className="px-6 py-5 font-bold text-right">Actions</th>
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
                      <Skeleton width={150} height={14} />
                    </td>
                    <td className="px-5 py-5">
                      <Skeleton width={180} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={90} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={90} height={14} />
                    </td>
                    <td className="px-5 py-5 flex justify-end gap-2">
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
                      {(row.first_name || row.last_name) ? `${row.first_name || ''} ${row.last_name || ''}`.trim() : 'Unknown'}
                    </td>
                    <td className="px-5 py-5 font-raleway text-gray-700">
                      {row.email || 'N/A'}
                    </td>
                    <td className="px-5 py-5 font-raleway text-center">
                       <span className="bg-secondary/10 text-secondary py-1 px-3 rounded-full text-xs font-semibold capitalize">
                          {row.role || "User"}
                       </span>
                    </td>
                    <td className="px-5 py-5 font-raleway text-center text-gray-500">
                      {formatDate(row.created_at)}
                    </td>
                    <td className="px-5 py-5 flex gap-2 justify-end items-center font-mulish text-right font-semibold text-black">
                      <button className="hover:bg-primary/10 p-1.5 rounded-md transition-colors">
                        <PencilLine size={16} className="text-primary" />
                      </button>

                      <button className="hover:bg-red-500/10 p-1.5 rounded-md transition-colors">
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}

            {!isLoading && data.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
