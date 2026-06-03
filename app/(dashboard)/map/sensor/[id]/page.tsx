"use client";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import SensorMetricCard from "@/components/cards/SensorMetricCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import humidityIcon from '@/public/images/humidity.png'
import temperatureIcon from '@/public/images/temperature.png'
import pressureIcon from '@/public/images/pressure.png'
import batteryIcon from '@/public/images/battery.png'
import MosquitoCountChart from "@/components/Charts/MosquitoCountChart";
import MosquitoTrendChart from "@/components/Charts/MosquitoTrendChart";
import MosquitoGenderChart from "@/components/Charts/MosquitoGenderChart";
import ActiveStatusTrendChart from "@/components/Charts/ActiveStatusTrendChart";
import TemperatureTrendChart from "@/components/Charts/TemperatureTrendChart";
import HumidityTrendChart from "@/components/Charts/HumidityTrendChart";
import PressureTrendChart from "@/components/Charts/PressureTrendChart";
import BatteryTrendChart from "@/components/Charts/BatteryTrendChart";

const MapWithNoSSR = dynamic(
  () => import("@/components/map/MapClient").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[320px] bg-gray-100 rounded-xl flex items-center justify-center">
        <span className="text-gray-500 text-sm">Loading map...</span>
      </div>
    ),
  }
);

import { useDevice, useDeviceCharts } from "@/hooks/device";
import { useMosquitoEventsByDeviceUuidWithFilters } from "@/hooks/mosquito";
import { extractItems, MAX_PAGE_SIZE } from "@/lib/pagination";
import type { MosquitoEvent, MosquitoRange } from "@/queries/mosquito_data/mosquitoDeviceQueries";
import type { ChartGroupBy } from "@/queries/device/deviceChartsQueries";
import DownloadCsvButton from "@/components/tables/DownloadCsvButton";
import ColumnVisibilityDropdown, { useColumnVisibility } from "@/components/tables/ColumnVisibilityDropdown";

function formatTimestamp(iso: string | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12:true
  });
}

type MosquitoTableRow = { species: string; genus: string; ageGroup: string; sex: string; iso: string };

// A single column definition drives both the table cell and the CSV export,
// so hiding a column hides it in both places.
type MosquitoColumn = {
  header: string;
  thClass?: string;
  tdClass?: string;
  cell: (row: MosquitoTableRow) => React.ReactNode;
  csv: (row: MosquitoTableRow) => string;
};

const MOSQUITO_COLUMNS: MosquitoColumn[] = [
  {
    header: "Genus",
    tdClass: "px-5 py-4 font-medium text-gray-800",
    cell: (r) => r.genus,
    csv: (r) => r.genus,
  },
  {
    header: "Species",
    thClass: "text-center",
    tdClass: "px-5 py-4 text-gray-600 text-center",
    cell: (r) => r.species,
    csv: (r) => r.species,
  },
  {
    header: "Age Group",
    thClass: "text-center",
    tdClass: "px-5 py-4 text-gray-600 text-center",
    cell: (r) => r.ageGroup,
    csv: (r) => r.ageGroup,
  },
  {
    header: "Sex",
    thClass: "text-center",
    tdClass: "px-5 py-4 text-gray-600 text-center",
    cell: (r) => r.sex,
    csv: (r) => r.sex,
  },
  {
    header: "Timestamp",
    thClass: "text-right",
    tdClass: "px-5 py-4 text-gray-600 text-right",
    cell: (r) => formatTimestamp(r.iso),
    csv: (r) => formatTimestamp(r.iso),
  },
];

function normalizeCoordinate(value: unknown, maxAbs: number): number | null {
  const numeric = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(numeric)) return null;
  if (Math.abs(numeric) <= maxAbs) return numeric;
  const divisors = [1_000_000, 100_000, 10_000, 1_000];
  for (const divisor of divisors) {
    const scaled = numeric / divisor;
    if (Number.isFinite(scaled) && Math.abs(scaled) <= maxAbs) return scaled;
  }
  return null;
}

export default function SensorDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: device, isLoading } = useDevice(id || "");
  const [activeTab, setActiveTab] = useState<"readings" | "graphs">("readings");
  const [range, setRange] = useState<MosquitoRange>("month");
  const [chartGroupBy, setChartGroupBy] = useState<ChartGroupBy>("month");

  const deviceUuid = device?.device_uuid ?? "";
  const { data: mosquitoEventsPage, isLoading: isMosquitoLoading } = useMosquitoEventsByDeviceUuidWithFilters(deviceUuid, { range }, { page_size: MAX_PAGE_SIZE });
  const { data: charts, isLoading: isChartsLoading } = useDeviceCharts(id || "", chartGroupBy);

  const { mosquitoTableRows, totalMosquitoCount } = useMemo(() => {
    const events = extractItems<MosquitoEvent>(mosquitoEventsPage);
    const rows: { species: string; genus: string; ageGroup: string; sex: string; iso: string }[] = [];
    let total = 0;

    for (const event of events) {
      const batchIso = typeof event.timestamp === "string" ? event.timestamp : "";
      const individuals = Array.isArray(event.individual_readings) ? event.individual_readings : [];
      const single = event.mosquito_reading;

      const batchCount = typeof event.count === "number" ? event.count : 0;
      if (batchCount > 0) total += batchCount;

      // Newer API shape: one mosquito_reading per event.
      if (single && typeof single === "object") {
        if (!batchCount) total += 1;
        const genus = single?.genus ?? "—";
        const species = single?.species ?? "—";
        const ageGroup = single?.age_group ?? "—";
        const sex = single?.sex ?? "—";
        // Show event.timestamp primarily (user asked for timestamp)
        const iso = batchIso || (typeof single?.detection_timestamp === "string" ? single.detection_timestamp : "");
        rows.push({
          species,
          genus,
          ageGroup,
          sex,
          iso: iso || "",
        });
        continue;
      }

      if (individuals.length === 0) {
        if (batchCount > 0 || batchIso) {
          rows.push({
            species: "—",
            genus: "—",
            ageGroup: "—",
            sex: "—",
            iso: batchIso,
          });
        }
        continue;
      }

      // Prefer total from individuals if backend didn't set count
      if (!batchCount) total += individuals.length;

      for (const reading of individuals) {
        const genus = reading?.genus ?? "—";
        const species = reading?.species ?? "—";
        const ageGroup = reading?.age_group ?? "—";
        const sex = reading?.sex ?? "—";
        const iso = batchIso || (typeof reading?.detection_timestamp === "string" ? reading.detection_timestamp : "");
        rows.push({
          species,
          genus,
          ageGroup,
          sex,
          iso: iso || "",
        });
      }
    }

    rows.sort((a, b) => {
      const aTime = a.iso ? new Date(a.iso).getTime() : 0;
      const bTime = b.iso ? new Date(b.iso).getTime() : 0;
      return bTime - aTime;
    });
    return { mosquitoTableRows: rows, totalMosquitoCount: total };
  }, [mosquitoEventsPage]);

  const { selected, setSelected, visibleColumns } = useColumnVisibility(MOSQUITO_COLUMNS);
  const mosquitoCsvColumns = visibleColumns.map((c) => ({ header: c.header, accessor: c.csv }));

  const mapCenter: [number, number] = useMemo(
    () => {
        const lat = normalizeCoordinate(device?.latitude, 90);
        const lng = normalizeCoordinate(device?.longitude, 180);
        if (lat !== null && lng !== null) return [lat, lng];
        return [5.6037, -0.187]; // Ghana fallback
    },
    [device]
  );

  return (
    <div className="flex flex-col font-raleway gap-4 w-full ">
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

        <div className="flex flex-col min-w-0">
          <span className="font-semibold">
            {isLoading ? <Skeleton width={180} height={16} /> : (device?.name ?? `Sensor ${id ?? ""}`)}
          </span>
          {isLoading ? (
            <span className="text-xs text-gray-400">
              <Skeleton width={260} height={12} />
            </span>
          ) : device && (
            <span className="text-xs text-gray-400 break-words">
              {device.region} • {device.device_uuid} • Last activity: {formatTimestamp(device.last_activity)}
            </span>
          )}
        </div>


        <div className="text-sm flex flex-row gap-3 items-center">
          <span>Status:</span>
          {isLoading ? (
            <Skeleton width={70} height={14} />
          ) : (
            <span
              className={`font-semibold ${
                !device?.latest_reading
                  ? "text-gray-400"
                  : device.latest_reading.trap_status
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {!device?.latest_reading
                ? "No data"
                : device.latest_reading.trap_status
                ? "Online"
                : "Offline"}
            </span>
          )}
        </div>
         
        </div>
      {/* Map */}
      <div className="relative w-full mt-2 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className="h-[400px] w-full">
          <MapWithNoSSR 
            position={mapCenter} 
            zoom={9} 
            devices={device ? [device] : []} 
            selectedDevice={device} 
            onMarkerClick={() => {}}
          />
        </div>
       
      </div>

      

      {/* Content */}
      <div className="bg-white rounded-b-2xl rounded-t-xl border border-t-0 border-gray-200 shadow-sm p-6">
        {/* Tabs */}
      <div className="flex   px-1 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("readings")}
          className={`px-5 py-3 font-raleway text-sm font-semibold rounded-l-lg  transition ${
            activeTab === "readings"
              ? "bg-linear-to-r from-secondary to-primary text-white shadow-sm"
              : "text-gray-500 bg-gray hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Current Readings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("graphs")}
          className={`px-5 py-3 font-raleway text-sm font-semibold rounded-r-lg  transition ${
            activeTab === "graphs"
              ? "bg-linear-to-r from-secondary to-primary text-white shadow-sm"
              : "text-gray-500 bg-gray  hover:text-gray-700 hover:bg-gray-50"
          }`}
        >
          Graphs and Tables
        </button>
      </div>
        {activeTab === "readings" && (
          <div className="flex flex-col gap-6 mt-10">
            {/* Mosquito Species and Age Count */}
            <div>
              <div className="flex flex-wrap items-center border-b border-gray pb-2 justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-raleway font-semibold text-gray-800">
                    Mosquito Events
                  </h2>
                  {isMosquitoLoading ? (
                    <Skeleton width={80} height={20} />
                  ) : (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Total: {totalMosquitoCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <ColumnVisibilityDropdown
                    columns={MOSQUITO_COLUMNS}
                    selected={selected}
                    onChange={setSelected}
                    disabled={isMosquitoLoading}
                  />
                  <DownloadCsvButton
                    filename={`mosquito-events-${device?.device_uuid ?? id ?? ""}`}
                    title="Mosquito Events"
                    columns={mosquitoCsvColumns}
                    rows={mosquitoTableRows}
                    disabled={isMosquitoLoading}
                  />
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value as MosquitoRange)}
                    className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-0  text-gray-700 bg-white y focus:border-primary outline-none"
                  >
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-secondary/15 ">
                <table className="w-full text-left border-collapse border-secondary/15  font-raleway">
                  <thead className="bg-[#DAE3F8]/30">
                    <tr className="text-gray-700 text-sm">
                      {visibleColumns.map((c) => (
                        <th key={c.header} className={`px-5 py-4 font-semibold ${c.thClass ?? ""}`}>
                          {c.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {isMosquitoLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <tr
                            key={i}
                            className="border-t border-secondary/15 text-sm even:bg-[#F2F5FA]/30"
                          >
                            {visibleColumns.map((c) => (
                              <td key={c.header} className={c.tdClass ?? "px-5 py-4"}>
                                <Skeleton width={100} height={14} />
                              </td>
                            ))}
                          </tr>
                        ))
                      : mosquitoTableRows.map((row, index) => (
                          <tr
                            key={`${row.species}-${row.genus}-${row.iso}-${index}`}
                            className="border-t  border-secondary/15  text-sm even:bg-[#F2F5FA]/30"
                          >
                            {visibleColumns.map((c) => (
                              <td key={c.header} className={c.tdClass ?? "px-5 py-4"}>
                                {c.cell(row)}
                              </td>
                            ))}
                          </tr>
                        ))}
                    {!isMosquitoLoading && mosquitoTableRows.length === 0 && (
                      <tr className="border-t border-secondary/15 text-sm">
                        <td className="px-5 py-6 text-gray-500 text-center" colSpan={visibleColumns.length}>
                          No mosquito events for this device yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Environmental sensor cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SensorMetricCard
                title="Temperature"
                icon={temperatureIcon.src}
                iconBg="rgba(21, 101, 192, 0.15)"
                lines={[
                  { label: "external", value: `${device?.latest_reading?.external_temperature || 0} °C` },
                  { label: "Internal", value: `${device?.latest_reading?.internal_temperature || 0} °C` },
                ]}
              />
              <SensorMetricCard
                title="Humidity"
                icon={humidityIcon.src}
                iconBg="rgba(21, 101, 192, 0.15)"
                lines={[
                  { label: "external", value: `${device?.latest_reading?.external_humidity || 0} %` },
                  { label: "Internal", value: `${device?.latest_reading?.internal_humidity || 0} %` },
                ]}
              />
              <SensorMetricCard
                title="Pressure"
                icon={pressureIcon.src}
                iconBg="rgba(21, 101, 192, 0.15)"
                lines={[
                  { label: "external", value: `${device?.latest_reading?.external_pressure || 0} hPa` },
                  { label: "Internal", value: `${device?.latest_reading?.internal_pressure || 0} hPa` },
                ]}
              />
              <SensorMetricCard
                title="Battery"
                icon={batteryIcon.src}
                iconBg="rgba(251, 191, 36, 0.2)"
                lines={[{ label: "Reading", value: `${device?.latest_reading?.battery_voltage || 0} V` }]}
              />
            </div>
          </div>
        )}

        {activeTab === "graphs" && (
          <div className="py-8 gap-10 flex flex-col font-raleway">
            <MosquitoCountChart
              data={charts?.mosquito_count?.data}
              groupBy={chartGroupBy}
              onGroupByChange={setChartGroupBy}
              isLoading={isChartsLoading}
            />
            <MosquitoTrendChart
              data={charts?.mosquito_trend?.data}
              seriesKeys={charts?.mosquito_trend?.series_keys}
              groupBy={chartGroupBy}
              onGroupByChange={setChartGroupBy}
              isLoading={isChartsLoading}
            />
            <MosquitoGenderChart
              data={charts?.mosquito_gender?.data}
              groupBy={chartGroupBy}
              onGroupByChange={setChartGroupBy}
              isLoading={isChartsLoading}
            />
            <ActiveStatusTrendChart
              data={charts?.sensor_status?.data}
              groupBy={chartGroupBy}
              onGroupByChange={setChartGroupBy}
              isLoading={isChartsLoading}
            />
            <TemperatureTrendChart
              data={charts?.temperature?.data}
              groupBy={chartGroupBy}
              onGroupByChange={setChartGroupBy}
              isLoading={isChartsLoading}
            />
            <HumidityTrendChart
              data={charts?.humidity?.data}
              groupBy={chartGroupBy}
              onGroupByChange={setChartGroupBy}
              isLoading={isChartsLoading}
            />
            <PressureTrendChart
              data={charts?.pressure?.data}
              groupBy={chartGroupBy}
              onGroupByChange={setChartGroupBy}
              isLoading={isChartsLoading}
            />
            <BatteryTrendChart
              data={charts?.battery?.data}
              groupBy={chartGroupBy}
              onGroupByChange={setChartGroupBy}
              isLoading={isChartsLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}
