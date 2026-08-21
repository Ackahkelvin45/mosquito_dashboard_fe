"use client";

import { Activity, Logs, X, Search, SlidersHorizontal, Thermometer, BatteryCharging, Clock, Gauge, Droplets, MapPin, Wifi, WifiOff } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useClusters, useDevices } from "@/hooks/device";
import { useRole } from "@/hooks/useRole";
import { filterHumidity, filterTemp, fmtReading, internalHumidity, internalPressure, internalTemp, externalHumidity, externalPressure, externalTemp } from "@/lib/reading";
import LocationSearch, { type GeoLocation } from "@/components/map/LocationSearch";
import MultiSelectDropdown from "@/components/filters/MultiSelectDropdown";
import { extractItems, MAX_PAGE_SIZE } from "@/lib/pagination";
import { locationLabel, locationSearchText } from "@/lib/location";
import type React from "react";

// ------- MapClient props type (mirrors MapClient.jsx interface) -------
type MapClientProps = {
  position: [number, number];
  zoom: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  devices: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedDevice: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMarkerClick: (device: any) => void;
  flyToLocation?: GeoLocation | null;
};

// ------- Helpers -------
function formatTimestamp(iso: string | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return date.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function Row({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </div>
      <div className="flex items-center gap-1.5 min-w-0 text-right">{children}</div>
    </div>
  );
}

// ------- Tab content -------
type LatestReading = {
  id: number;
  device_id: number;
  timestamp: string;
  external_temperature: number;
  internal_temperature: number;
  external_humidity: number;
  internal_humidity: number;
  internal_pressure: number;
  external_pressure: number;
  external_light: number;
  battery_voltage: number;
  trap_status: boolean;
};

type Device = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  region?: string | null;
  community?: string | null;
  description: string;
  gmap_link: string;
  last_activity: string;
  created_at: string;
  updated_at: string;
  total_mosquito_count: number;
  cluster_id: number;
  device_uuid: string;
  is_active?: boolean;
  latest_reading?: LatestReading;
};

type Cluster = {
  id: number;
  name: string;
};

function normalizeCoordinate(value: unknown, maxAbs: number): number | null {
  const numeric = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(numeric)) return null;
  if (Math.abs(numeric) <= maxAbs) return numeric;

  // Some devices/backends store coordinates as scaled integers (e.g. microdegrees).
  const divisors = [1_000_000, 100_000, 10_000, 1_000];
  for (const divisor of divisors) {
    const scaled = numeric / divisor;
    if (Number.isFinite(scaled) && Math.abs(scaled) <= maxAbs) return scaled;
  }

  return null;
}

function getDeviceLatLng(device: Device | null): [number, number] | null {
  if (!device) return null;
  const lat = normalizeCoordinate(device.latitude, 90);
  const lng = normalizeCoordinate(device.longitude, 180);
  if (lat === null || lng === null) return null;
  return [lat, lng];
}

function extractDevices(value: unknown): Device[] {
  return extractItems<Device>(value);
}

function DeviceStatusTab({ device }: { device: Device | null }) {
  if (!device) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 mx-4 mb-4 text-center text-sm text-gray-400">
        Select a device on the map to view status.
      </div>
    );
  }

  const r = device.latest_reading;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mx-4 mb-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-900">{device.name}</h2>
        <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">
          #{device.id}
        </span>
      </div>
      <hr className="border-gray-100 mb-2" />

      <Row label="Region" icon={<MapPin size={14} />}>
        <span className="text-sm font-semibold text-gray-900">{locationLabel(device)}</span>
      </Row>

      <Row label="Battery Voltage" icon={<BatteryCharging size={14} />}>
        <span className="text-sm font-semibold">
          {r ? `${r.battery_voltage}V` : "—"}
        </span>
      </Row>

      <Row label="Trap Status">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{r ? (r.trap_status ? "On" : "Off") : "—"}</span>
          {r && (
            <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${r.trap_status ? "bg-green-500" : "bg-gray-300"}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${r.trap_status ? "translate-x-4" : "translate-x-0"}`} />
            </div>
          )}
        </div>
      </Row>

      <Row label="Last Reading" icon={<Clock size={14} />}>
        <span className="text-sm font-semibold text-gray-700">{formatTimestamp(r?.timestamp)}</span>
      </Row>

      <Row label="Latitude">
        <span className="text-sm font-semibold font-mono break-all">{device.latitude}</span>
      </Row>

      <Row label="Longitude">
        <span className="text-sm font-semibold font-mono break-all">{device.longitude}</span>
      </Row>

      <Row label="Connectivity">
        {device.is_active ? (
          <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
            <Wifi size={14} /> Online
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm font-semibold text-red-500">
            <WifiOff size={14} /> Offline
          </span>
        )}
      </Row>
    </div>
  );
}

function EnvDataTab({ device }: { device: Device | null }) {
  if (!device || !device.latest_reading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-5 mx-4 mb-4 text-center text-sm text-gray-400">
        {device ? "No sensor readings available yet." : "Select a device on the map to view data."}
      </div>
    );
  }

  const r = device.latest_reading;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mx-4 mb-4">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-gray-900">{device.name}</h2>
        <span className="text-xs text-gray-400">{formatTimestamp(r.timestamp)}</span>
      </div>
      <hr className="border-gray-100 mb-2" />

      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Internal</p>
        <Row label="Temperature" icon={<Thermometer size={14} />}>
          <span className="text-sm font-semibold">{fmtReading(internalTemp(r), " °C")}</span>
        </Row>
        <Row label="Humidity" icon={<Droplets size={14} />}>
          <span className="text-sm font-semibold">{fmtReading(internalHumidity(r), " %")}</span>
        </Row>
        <Row label="Pressure" icon={<Gauge size={14} />}>
          <span className="text-sm font-semibold">{fmtReading(internalPressure(r), " hPa")}</span>
        </Row>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">External</p>
        <Row label="Temperature" icon={<Thermometer size={14} />}>
          <span className="text-sm font-semibold">{fmtReading(externalTemp(r), " °C")}</span>
        </Row>
        <Row label="Humidity" icon={<Droplets size={14} />}>
          <span className="text-sm font-semibold">{fmtReading(externalHumidity(r), " %")}</span>
        </Row>
        <Row label="Pressure" icon={<Gauge size={14} />}>
          <span className="text-sm font-semibold">{fmtReading(externalPressure(r), " hPa")}</span>
        </Row>
        <Row label="Light" icon={<span className="text-xs">☀️</span>}>
          <span className="text-sm font-semibold">{r.external_light} lux</span>
        </Row>
      </div>
    </div>
  );
}

function CountTab({ device }: { device: Device | null }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mx-4 mb-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">Mosquito Count</h2>
      <hr className="border-gray-100 mb-2" />
      {device ? (
        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-gray-700">Total Count</span>
          <span className="text-sm font-bold text-gray-900">{device.total_mosquito_count}</span>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 py-4">Select a device on the map.</p>
      )}
    </div>
  );
}

// ------- Count icon -------
function CountIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <rect width="24" height="24" fill={`url(#ci_${active})`} />
      <defs>
        <pattern id={`ci_${active}`} patternContentUnits="objectBoundingBox" width="1" height="1">
          <use xlinkHref="#count_img" transform="scale(0.0416667)" style={{ filter: active ? "brightness(0) invert(1)" : "none" }} />
        </pattern>
        <image id="count_img" width="24" height="24" preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABR0lEQVR4nOWUq0uEQRTFf4raDCL+Az7igsVs9QmKxW4SDBsMGxaxCBbFYDOKli3+C4LFIgpq0yA2H2jwUXZXLpwPhtkZP9D5WMEDw3LZM/fce+beD/4bpoFH4KCo5J9AE6inTj4BfCh5dpJh2Km8EIFRoCGR4yIEDCVgEFgvSiDD3xeYA86Bd/3Oe/+v/WZMZ/SY7qQ0gCmHM6ZF2/+JwJWSPgPbwJPik5x7C8CZpuxWXXaFiHdKuKJ4V7HZFcNioGs7GyHyiOzoBAaAU5FNOIZNcazbHceFh9iFHqAsn7Nqqt8I9AJL2hGz5l53zKoW9AMXXqs1oJt8jHv3rMgW1DySWVTR5MQwJFv7vM/IUYj8FnispuyKwR+MPcWvIfKhFshNXs+Z+UvxXoAt4EaxPXYSTAaKsrNKQsxq0WxfroFloCOlQHvxBSeFfyw4NmerAAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  );
}

// ------- Main Page -------
type TabValue = "count" | "device-status" | "environmental-data";

export default function MapPage() {
  const { canFilterByCluster } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("device-status");
  const [query, setQuery] = useState("");
  const [clusterIds, setClusterIds] = useState<string[]>([]);
  const [trapStatuses, setTrapStatuses] = useState<string[]>([]);
  // FR-13: connectivity (online/offline markers) + environmental thresholds,
  // both filtered client-side — the payload already carries is_active and
  // latest_reading, so no extra requests.
  const [connectivity, setConnectivity] = useState<string[]>([]);
  const [tempMin, setTempMin] = useState("");
  const [tempMax, setTempMax] = useState("");
  const [humidityMin, setHumidityMin] = useState("");
  const [humidityMax, setHumidityMax] = useState("");
  const [createdAfter, setCreatedAfter] = useState("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<GeoLocation | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  // Below sm the search/filter stack covers most of the map, so it starts
  // collapsed behind a single toggle there; sm+ always shows it.
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // trap_status / created_after are applied server-side; cluster + search stay client-side.
  const deviceFilters = useMemo(
    () => ({
      // Both statuses selected = no filter, same as none selected.
      trap_status: trapStatuses.length === 1 ? trapStatuses[0] === "on" : undefined,
      created_after: createdAfter ? new Date(`${createdAfter}T00:00:00Z`).toISOString() : undefined,
    }),
    [trapStatuses, createdAfter]
  );

  // The map plots every device, so request a full page (API caps at 100).
  const { data: devicesRaw, isLoading } = useDevices(deviceFilters, { page_size: MAX_PAGE_SIZE });
  const devices = extractDevices(devicesRaw);

  const { data: clustersRaw } = useClusters({ page_size: MAX_PAGE_SIZE });
  const clusters: Cluster[] = extractItems<Cluster>(clustersRaw);

  const clusterFilteredDevices =
    clusterIds.length === 0
      ? devices
      : devices.filter((d) => clusterIds.includes(String(d.cluster_id)));

  const parsedEnv = {
    tempMin: tempMin === "" ? null : Number(tempMin),
    tempMax: tempMax === "" ? null : Number(tempMax),
    humidityMin: humidityMin === "" ? null : Number(humidityMin),
    humidityMax: humidityMax === "" ? null : Number(humidityMax),
  };
  const envFilterActive = Object.values(parsedEnv).some((v) => v !== null && !Number.isNaN(v));

  const filteredDevices = clusterFilteredDevices.filter((d) => {
    // Both selected = no filter, same convention as the trap dropdown.
    if (connectivity.length === 1) {
      const wantOnline = connectivity[0] === "online";
      if (Boolean(d.is_active) !== wantOnline) return false;
    }
    if (envFilterActive) {
      const t = filterTemp(d.latest_reading);
      const h = filterHumidity(d.latest_reading);
      // A device with no reading can't prove it matches an env constraint.
      if (parsedEnv.tempMin !== null && !Number.isNaN(parsedEnv.tempMin) && (t === null || t < parsedEnv.tempMin)) return false;
      if (parsedEnv.tempMax !== null && !Number.isNaN(parsedEnv.tempMax) && (t === null || t > parsedEnv.tempMax)) return false;
      if (parsedEnv.humidityMin !== null && !Number.isNaN(parsedEnv.humidityMin) && (h === null || h < parsedEnv.humidityMin)) return false;
      if (parsedEnv.humidityMax !== null && !Number.isNaN(parsedEnv.humidityMax) && (h === null || h > parsedEnv.humidityMax)) return false;
    }
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      locationSearchText(d).includes(q) ||
      d.device_uuid.toLowerCase().includes(q)
    );
  });

  const handleMarkerClick = (device: Device) => {
    setSelectedDevice(device);
    setIsOpen(true);
  };

  const activeExtraCount =
    (clusterIds.length > 0 ? 1 : 0) + (trapStatuses.length > 0 ? 1 : 0) +
    (connectivity.length > 0 ? 1 : 0) + (envFilterActive ? 1 : 0);

  const tabs: { label: string; value: TabValue; icon: (active: boolean) => React.ReactNode }[] = [
    { label: "Count", value: "count", icon: (active) => <CountIcon active={active} /> },
    { label: "Device Status", value: "device-status", icon: () => <Activity size={16} /> },
    { label: "Environmental Data", value: "environmental-data", icon: () => <Thermometer size={16} /> },
  ];

  const Map = useMemo(
    () =>
      dynamic<MapClientProps>(() => import("@/components/map/MapClient"), {
        loading: () => (
          <div className="w-full flex justify-center items-center h-full">
            <div className="spinner">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} />
              ))}
            </div>
          </div>
        ),
        ssr: false,
      }),
    []
  );

  // Default center: Ghana
  const defaultCenter: [number, number] = [5.6037, -0.187];
  const position = getDeviceLatLng(selectedDevice) ?? defaultCenter;

  return (
    <div className="h-full w-full font-raleway relative">
      {/* Map fills full area */}
      <div className="absolute rounded-lg inset-0">
        <Map
          position={position}
          zoom={8}
          devices={filteredDevices}
          selectedDevice={selectedDevice}
          onMarkerClick={handleMarkerClick}
          flyToLocation={searchedLocation}
        />
      </div>

      {/* Floating search bar */}
      <div
        className={`absolute top-4 z-[1000] transition-all duration-300 ease-in-out
          ${isOpen ? "hidden lg:block left-[420px] right-4" : "left-20 right-4"}`}
      >
        <button
          onClick={() => setMobileFiltersOpen((v) => !v)}
          className="sm:hidden mb-2 inline-flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2.5 text-sm font-medium text-gray-700"
        >
          {mobileFiltersOpen ? <X size={15} /> : <Search size={15} />}
          {mobileFiltersOpen ? "Hide filters" : "Search & filters"}
          {!mobileFiltersOpen && activeExtraCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeExtraCount}
            </span>
          )}
        </button>
        <div className={`${mobileFiltersOpen ? "flex" : "hidden"} sm:flex flex-col gap-2`}>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-start gap-3">
            {/* Location search (geocoding) */}
            <div className="w-full sm:w-[280px]">
              <LocationSearch onSelect={setSearchedLocation} />
            </div>

            {/* Device search */}
            <div className="w-full sm:w-[280px]">
              <div className="flex items-center bg-white rounded-full shadow-lg px-4 py-2.5 gap-3">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search device name, UUID..."
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />
                {isLoading && (
                  <span className="text-xs text-gray-400 animate-pulse">Loading…</span>
                )}
                {query && (
                  <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2 shrink-0">
                    <X size={16} />
                  </button>
                )}
              </div>
              {/* Dropdown search results */}
              {query && filteredDevices.length > 0 && (
                <div className="mt-1 bg-white rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {filteredDevices.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { handleMarkerClick(d); setQuery(""); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-0"
                    >
                      <MapPin size={14} className="text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-400">{locationLabel(d)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Created-after date */}
            <div className="w-full sm:w-[170px] relative">
              <input
                type="date"
                value={createdAfter}
                onChange={(e) => setCreatedAfter(e.target.value)}
                title="Created after"
                className="w-full bg-white rounded-full shadow-lg px-4 py-2.5 text-sm text-gray-700 outline-none border border-transparent focus:border-primary"
              />
              {createdAfter && (
                <button
                  onClick={() => setCreatedAfter("")}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 -m-1.5"
                  aria-label="Clear created after"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* More filters toggle — far right */}
            <div className="w-full sm:w-auto sm:ml-auto">
              <button
                onClick={() => setShowMoreFilters((v) => !v)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-full shadow-lg px-4 py-2.5 text-sm font-medium transition-colors
                  ${showMoreFilters || activeExtraCount > 0
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <SlidersHorizontal size={15} />
                <span className="whitespace-nowrap">More Filters</span>
                {activeExtraCount > 0 && (
                  <span className="bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {activeExtraCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Extra filters panel */}
          {showMoreFilters && (
            <div className="w-full sm:w-[420px] sm:ml-auto bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Extra Filters</p>
                {activeExtraCount > 0 && (
                  <button
                    onClick={() => {
                      setClusterIds([]); setTrapStatuses([]); setConnectivity([]);
                      setTempMin(""); setTempMax(""); setHumidityMin(""); setHumidityMax("");
                    }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Only a super admin filters by cluster; everyone else is
                    already scoped to their own cluster server-side. */}
                {canFilterByCluster && (
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Clusters</label>
                    <MultiSelectDropdown
                      label="All clusters"
                      options={clusters.map((c) => ({ value: String(c.id), label: c.name || `Cluster #${c.id}` }))}
                      selected={clusterIds}
                      onChange={setClusterIds}
                      emptyText="No clusters"
                      className="w-full"
                    />
                  </div>
                )}
                <div className="flex-1">
                  {/* Trap on/off — NOT what the marker colors show (that's
                      connectivity); keep the labels visibly distinct. */}
                  <label className="block text-xs text-gray-500 mb-1">Trap Status (on/off)</label>
                  <MultiSelectDropdown
                    label="All statuses"
                    options={[
                      { value: "on", label: "Trap On" },
                      { value: "off", label: "Trap Off" },
                    ]}
                    selected={trapStatuses}
                    onChange={setTrapStatuses}
                    className="w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Connectivity (marker color)</label>
                  <MultiSelectDropdown
                    label="Online & offline"
                    options={[
                      { value: "online", label: "Online" },
                      { value: "offline", label: "Offline" },
                    ]}
                    selected={connectivity}
                    onChange={setConnectivity}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-gray-500 mb-1">
                  Environmental range (latest reading; devices without one are hidden while set)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input type="number" placeholder="Temp ≥ °C" value={tempMin}
                    onChange={(e) => setTempMin(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-full" />
                  <input type="number" placeholder="Temp ≤ °C" value={tempMax}
                    onChange={(e) => setTempMax(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-full" />
                  <input type="number" placeholder="Humidity ≥ %" value={humidityMin}
                    onChange={(e) => setHumidityMin(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-full" />
                  <input type="number" placeholder="Humidity ≤ %" value={humidityMax}
                    onChange={(e) => setHumidityMax(e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm w-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full z-[1000] shadow-lg bg-white
          transition-all duration-300 ease-in-out overflow-hidden flex flex-col
          ${isOpen ? "w-full sm:w-[400px]" : "w-16"}`}
      >
        {/* Toggle button */}
        <div className={`w-full flex shrink-0 ${isOpen ? "justify-end" : "justify-center"} items-center p-4`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2.5 -m-1.5 rounded-md hover:bg-gray-200 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Logs size={20} />}
          </button>
        </div>

        {/* Content — only rendered when open */}
        {isOpen && (
          <>
            {/* Selected device header */}
            {selectedDevice && (
              <div className="px-4 pb-3 shrink-0">
                <div className="bg-primary/5 rounded-xl px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Selected Device</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedDevice.name}</p>
                    <p className="text-xs text-gray-400">{locationLabel(selectedDevice)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDevice(null)}
                    className="text-gray-400 hover:text-gray-600 p-2 -m-2 shrink-0"
                    aria-label="Deselect device"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Tab switcher */}
            <div className="px-4 pb-3 shrink-0">
              <div className="flex items-center bg-white rounded-xl p-1 shadow-sm gap-1">
                {tabs.map((tab) => {
                  const active = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      title={tab.label}
                      className={`flex items-center gap-1 px-2 py-2 rounded-lg text-[12px] font-semibold transition-all duration-300 flex-1 min-w-0 justify-center
                        ${active
                          ? "bg-linear-to-r from-secondary to-primary text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <span className={active ? "text-white" : "text-gray-600"}>
                        {tab.icon(active)}
                      </span>
                      <span className="truncate leading-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable tab content */}
            <div className="flex-1 overflow-y-auto pt-1">
              {activeTab === "count" && <CountTab device={selectedDevice} />}
              {activeTab === "device-status" && <DeviceStatusTab device={selectedDevice} />}
              {activeTab === "environmental-data" && <EnvDataTab device={selectedDevice} />}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {devices.length} device{devices.length !== 1 ? "s" : ""} on map
                </span>
                {selectedDevice && (
                  <Link
                    href={`/map/sensor/${selectedDevice.id}`}
                    className="text-sm font-semibold text-primary flex items-center gap-1.5 transition-colors hover:underline"
                  >
                    View Sensor <span>→</span>
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
