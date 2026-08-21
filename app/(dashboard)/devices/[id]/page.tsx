"use client";

import {
  Thermometer,
  Droplets,
  Gauge,
  Battery,
  ChevronLeft,
  Activity,
  Info,
  MapPinned,
  Cpu,
  Map,
  ArrowRight,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useMemo, use } from "react";
import Link from "next/link";
import { useDevice } from "@/hooks/device";
import SensorMetricCard from "@/components/cards/SensorMetricCard";
import humidityIcon from "@/public/images/humidity.png";
import temperatureIcon from "@/public/images/temperature.png";
import pressureIcon from "@/public/images/pressure.png";
import batteryIcon from "@/public/images/battery.png";

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

export default function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { data: device, isLoading, isError } = useDevice(id);

  const mapCenter: [number, number] = useMemo(() => {
    if (device?.latitude && device?.longitude) {
      return [device.latitude, device.longitude];
    }
    return [5.6037, -0.187];
  }, [device]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8 items-center justify-center">
        <div className="spinner1" />
      </div>
    );
  }

  if (isError || !device) {
    return (
      <div className="w-full h-full flex flex-col bg-white font-raleway rounded-lg py-8 px-8 items-center justify-center text-gray-500">
        <p>Failed to load device details.</p>
        <button onClick={() => router.back()} className="mt-4 text-primary underline">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-white font-raleway rounded-lg py-6 px-4 sm:py-8 sm:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex flex-row items-center gap-3">
          <Link
            href="/devices"
            className="border border-gray-300 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft strokeWidth={1.5} size={18} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              {device.name}
              <span className="text-sm font-normal text-gray-500 flex items-center gap-1 break-all">
                <Cpu size={14} /> ID: {device.device_uuid}
              </span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Last Activity: {device.last_activity ? new Date(device.last_activity).toLocaleString() : "N/A"}
              {/* Telemetry heartbeat drives the Online badge; it diverging from
                  Last Activity means the device is alive but its sensor loop is down. */}
              <span className="ml-3">
                Last Telemetry: {device.last_sensor_data_at ? new Date(device.last_sensor_data_at).toLocaleString() : "Never"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-4 items-center">
          <div className="flex flex-row gap-2 items-center text-sm">
            <span className="font-medium text-gray-600">Device:</span>
            {device.is_active ? (
               <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Online</span>
            ) : (
               <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold uppercase">Offline</span>
            )}
          </div>
          <div className="flex flex-row gap-2 items-center text-sm">
            <span className="font-medium text-gray-600">Trap:</span>
            {device.latest_reading?.trap_status ? (
               <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">On</span>
            ) : (
               <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase">Off</span>
            )}
          </div>

          <Link
            href={`/map/sensor/${id}`}
            className="flex flex-row items-center gap-2 bg-linear-to-r from-secondary to-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
          >
            Move to Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <Info size={16} />
            <span>Description</span>
          </div>
          <p className="text-sm text-gray-800 line-clamp-3">
            {device.description || "No description provided."}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <MapPinned size={16} />
            <span>Region</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {device.region || "N/A"}
          </p>
          <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mt-auto">
            {device.latitude}, {device.longitude}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <Activity size={16} />
            <span>Total Mosquitoes</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {device.total_mosquito_count?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <Map size={16} />
            <span>Maps</span>
          </div>
          {device.gmap_link ? (
            <a
              href={device.gmap_link}
              target="_blank"
              rel="noreferrer"
              className="mt-1 text-sm font-semibold text-secondary hover:underline"
            >
              Open in Google Maps
            </a>
          ) : (
            <p className="text-sm text-gray-400">No link available</p>
          )}
        </div>
      </div>

      {/* Map Section */}
      <div className="relative w-full mb-8 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
        <div className="h-[320px] w-full">
          <MapWithNoSSR 
            position={mapCenter} 
            zoom={13} 
            devices={[device]} 
            selectedDevice={device} 
            onMarkerClick={() => {}}
          />
        </div>
      </div>

      {/* Environmental Readings Card - Simplified */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Activity size={18} className="text-primary"/>
            Current Readings
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SensorMetricCard
            title="Temperature"
            icon={temperatureIcon.src}
            iconBg="rgba(21, 101, 192, 0.15)"
            lines={[
              { label: "External", value: `${device.latest_reading?.external_temperature || 0} °C` },
              { label: "Internal", value: `${device.latest_reading?.internal_temperature || 0} °C` },
            ]}
          />
          <SensorMetricCard
            title="Humidity"
            icon={humidityIcon.src}
            iconBg="rgba(21, 101, 192, 0.15)"
            lines={[
              { label: "External", value: `${device.latest_reading?.external_humidity || 0} %` },
              { label: "Internal", value: `${device.latest_reading?.internal_humidity || 0} %` },
            ]}
          />
          <SensorMetricCard
            title="Pressure"
            icon={pressureIcon.src}
            iconBg="rgba(21, 101, 192, 0.15)"
            lines={[
              { label: "Internal", value: `${device.latest_reading?.internal_pressure || 0} hPa` },

              { label: "External", value: `${device.latest_reading?.external_pressure || 0} hPa` },
            ]}
          />
          <SensorMetricCard
            title="Battery"
            icon={batteryIcon.src}
            iconBg="rgba(251, 191, 36, 0.2)"
            lines={[{ label: "Reading", value: `${device.latest_reading?.battery_voltage || 0} V` }]}
          />
        </div>
      </div>
    </div>
  );
}
