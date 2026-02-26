"use client";

import React from "react";

export type HistoricalDataRow = {
  species: string;
  date: string;
  sensor: string;
  count: number;
};

const defaultData: HistoricalDataRow[] = [
  { species: "Young Male Aedes", date: "01 Dec 2023", sensor: "sensor 14", count: 69 },
  { species: "Young Male Aedes", date: "01 Dec 2023", sensor: "sensor 14", count: 69 },
  { species: "Young Male Aedes", date: "01 Dec 2023", sensor: "sensor 14", count: 69 },
  { species: "Young Male Aedes", date: "01 Dec 2023", sensor: "sensor 14", count: 69 },
  { species: "Young Male Aedes", date: "01 Dec 2023", sensor: "sensor 14", count: 69 },
  { species: "Young Male Aedes", date: "01 Dec 2023", sensor: "sensor 14", count: 69 },
  { species: "Young Male Aedes", date: "01 Dec 2023", sensor: "sensor 14", count: 69 },
];

interface HistoricalDataTableProps {
  data?: HistoricalDataRow[];
  title?: string;
}

export default function HistoricalDataTable({
  data = defaultData,
  title = "Historical Data",
}: HistoricalDataTableProps) {
  return (
    <div className="bg-white">
     

      <div className="overflow-hidden rounded-2xl mt-4 border border-secondary/15">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#DAE3F8]/30 font-raleway">
            <tr className="text-gray-700 text-sm">
              <th className="px-6 py-5 font-bold">Species & Age Group</th>
              <th className="px-6 py-5 font-ibold text-center">Date</th>
              <th className="px-6 py-5 font-ibold text-center">Sensor</th>
              <th className="px-6 py-5 font-ibold text-right">Count</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
              >
                <td className="px-5 py-5 font-raleway font-medium">
                  {row.species}
                </td>
                <td className="px-5 py-5 font-raleway text-center">
                  {row.date}
                </td>
                <td className="px-5 py-5 font-raleway text-center">
                  {row.sensor}
                </td>
                <td className="px-5 py-5 font-mulish text-right font-semibold text-black">
                  {row.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
