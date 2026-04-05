"use client";

import { PencilLine ,Trash2} from "lucide-react";
import React from "react";
import Link from "next/link";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export type DeviceRow = {
  name: string;
  longitude: number;
  latitude: number;
  region: string;
  description: string;
  gmap_link: string;
  id: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
  total_mosquito_count: number;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface DeviceTableProps {
  data?: DeviceRow[];
  isLoading?: boolean;
}

const SKELETON_ROWS = 6;

export default function DeviceTable({
  data = [],
  isLoading = false,
}: DeviceTableProps) {
  return (
    <div className="bg-white">
      <div className="overflow-hidden rounded-2xl mt-4 border border-secondary/15">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#DAE3F8]/30 font-raleway">
            <tr className="text-gray-700 text-sm">
              <th className="px-6 py-5 font-bold">ID</th>
              <th className="px-6 py-5 font-bold">Name</th>
              <th className="px-6 py-5 font-bold">Region</th>
              <th className="px-6 py-5 font-bold text-center">Coordinates</th>
              <th className="px-6 py-5 font-bold text-center">Last Activity</th>
              <th className="px-6 py-5 font-bold text-right">Mosquito Count</th>
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
                      <Skeleton width={40} height={14} />
                    </td>
                    <td className="px-5 py-5">
                      <Skeleton width={120} height={14} />
                    </td>
                    <td className="px-5 py-5">
                      <Skeleton width={100} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={130} height={14} />
                    </td>
                    <td className="px-5 py-5 text-center">
                      <Skeleton width={90} height={14} />
                    </td>
                    <td className="px-5 py-5 flex justify-end">
                      <Skeleton width={50} height={14} />
                    </td>
                    <td className="px-5 py-5"></td>
                  </tr>
                ))
              : data.map((row, index) => (
                  <tr
                    key={row.id ?? index}
                    className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                  >
                    <td className="px-5 py-5 font-raleway font-semibold">
                      <Link href={`/devices/${row.id}`} className="text-primary hover:underline">
                        #{row.id}
                      </Link>
                    </td>
                    <td className="px-5 py-5 font-raleway font-medium">
                      {row.name}
                    </td>
                    <td className="px-5 py-5 font-raleway">{row.region}</td>
                    <td className="px-5 py-5 font-raleway text-center text-gray-500 text-xs">
                      {row.latitude.toFixed(3)}, {row.longitude.toFixed(3)}
                    </td>
                    <td className="px-5 py-5 font-raleway text-center">
                      {formatDate(row.last_activity)}
                    </td>
                    <td className="px-5 py-5 font-mulish text-right font-semibold text-black">
                      {row.total_mosquito_count}
                    </td>
                    <td className="px-5 py-5  flex gap-2   justify-center items-center g font-mulish text-right font-semibold text-black">
                      <button>
                        <PencilLine size={16} className="text-primary"/>
                      </button>

                      <button>
                        <Trash2 size={16} className="text-red-500"/>
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
                  No devices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}