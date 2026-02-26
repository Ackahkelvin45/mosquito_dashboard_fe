"use client";

type SpeciesRow = {
  species: string;
  date: string;
  count: number;
};

const data: SpeciesRow[] = [
  { species: "Young Male Aedes", date: "01 Dec 2023", count: 69 },
  { species: "Old Male Aedes", date: "01 Dec 2023", count: 24 },
  { species: "Young Female Aedes", date: "01 Dec 2023", count: 56 },
  { species: "Old Female Aedes", date: "01 Dec 2023", count: 70 },
  { species: "Young Male Anopheles", date: "01 Dec 2023", count: 45 },
  { species: "Old Male Anopheles", date: "01 Dec 2023", count: 90 },
];

export default function MosquitoBreakdown() {
  return (
    <div className=" bg-white rounded-lg p-2 border border-gray-200 w-full">
      {/* Title */}
      <div className="pt-3 border-b border-gray" >
      <h2 className=" font-medium font-raleway text-gray-700 mb-6">
        Mosquito Species Breakdown (Global Overview)
      </h2>
      </div>
      

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl mt-4  border border-secondary/15">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead className="bg-[#DAE3F8]/30  font-raleway ">
            <tr className="text-gray-700 text-sm ">
              <th className="px-6 py-5 font-bold ">
                Species & Age Group
              </th>
              <th className="px-6 py-5 font-ibold text-center">
                Date
              </th>
              <th className="px-6 py-5 font-ibold text-right">
                Count
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white">
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-t border-secondary/15  text-sm even:bg-[#F2F5FA]/30 "
              >
                <td className="px-5 py-5 font-raleway font-medium">
                  {row.species}
                </td>
                <td className="px-5 py-5 font-raleway text-center">
                  {row.date}
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