"use client";

import { Activity, Logs, X, Search, Thermometer, BatteryCharging, Clock, Gauge, Droplets } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";

// ------- Mock data -------
const mockCountData = {
  title: "Mosquito Counts",
  items: [
    { label: "Young Male Aedes", value: 30, trend: "up" },
    { label: "Old Male Aedes", value: 60, trend: "down" },
    { label: "Young Female Aedes", value: 30, trend: "up" },
    { label: "Old Female Aedes", value: 10, trend: "up" },
  ],
};

const mockDeviceStatus = {
  title: "Sensor 20",
  batteryVoltage: 30,
  trapStatus: true,
  lastReceivedTimestamp: "20:00 PM",
  latitude: 35.6,
  longitude: 10.9,
  regionId: "Kumasi",
};

const mockEnvData = {
  title: "Sensor 20",
  internalTemperature: 29.4,
  internalPressure: 12.3,
  internalHumidity: 45.8,
  externalTemperature: 30.5,
  externalHumidity: 50.6,
  externalPressure: 0.2,
};

// ------- Helpers -------

function TrendArrow({ trend }: { trend: "up" | "down" }) {
  return trend === "up" ? (
    <span className="text-green-500 text-base leading-none">▲</span>
  ) : (
    <span className="text-red-500 text-base leading-none">▼</span>
  );
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
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-1.5">
        {children}
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
    </div>
  );
}

// ------- Tab content -------

function CountTab() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mx-4 mb-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">{mockCountData.title}</h2>
      <hr className="border-gray-100 mb-2" />
      <div>
        {mockCountData.items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <span className="text-sm text-gray-700">{item.label}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              <TrendArrow trend={item.trend as "up" | "down"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeviceStatusTab() {
  const d = mockDeviceStatus;
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mx-4 mb-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">{d.title}</h2>
      <hr className="border-gray-100 mb-2" />
      <Row label="Battery Voltage" icon={<BatteryCharging size={15} />}>
        <span className="text-sm font-semibold">{d.batteryVoltage}%</span>
      </Row>
      <Row label="Trap Status">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{d.trapStatus ? "ON" : "OFF"}</span>
          <div
            className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
              d.trapStatus ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                d.trapStatus ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      </Row>
      <Row label="Last Received Timestamp" icon={<Clock size={15} />}>
        <span className="text-sm font-semibold">{d.lastReceivedTimestamp}</span>
      </Row>
      <Row label="Latitude">
        <span className="text-sm font-semibold">{d.latitude}</span>
      </Row>
      <Row label="Longitude">
        <span className="text-sm font-semibold">{d.longitude}</span>
      </Row>
      <Row label="Region ID">
        <span className="text-sm font-bold">{d.regionId}</span>
      </Row>
    </div>
  );
}

function EnvDataTab() {
  const e = mockEnvData;
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 mx-4 mb-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">{e.title}</h2>
      <hr className="border-gray-100 mb-2" />
      <Row label="Internal Temperature" icon={<Thermometer size={15} />}>
        <span className="text-sm font-semibold">{e.internalTemperature} °C</span>
      </Row>
      <Row label="Internal Pressure" icon={<Gauge size={15} />}>
        <span className="text-sm font-semibold">{e.internalPressure} hPa</span>
      </Row>
      <Row label="Internal Humidity" icon={<Droplets size={15} />}>
        <span className="text-sm font-semibold">{e.internalHumidity} %</span>
      </Row>
      <Row label="External Temperature" icon={<Thermometer size={15} />}>
        <span className="text-sm font-semibold">{e.externalTemperature} °C</span>
      </Row>
      <Row label="External Humidity" icon={<Droplets size={15} />}>
        <span className="text-sm font-semibold">{e.externalHumidity} %</span>
      </Row>
      <Row label="External Pressure" icon={<Gauge size={15} />}>
        <span className="text-sm font-semibold">{e.externalPressure} hPaPa</span>
      </Row>
    </div>
  );
}

// ------- Count icon -------
function CountIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width="24" height="24" fill={`url(#ci_${active})`} />
      <defs>
        <pattern id={`ci_${active}`} patternContentUnits="objectBoundingBox" width="1" height="1">
          <use
            xlinkHref="#count_img"
            transform="scale(0.0416667)"
            style={{ filter: active ? "brightness(0) invert(1)" : "none" }}
          />
        </pattern>
        <image
          id="count_img"
          width="24"
          height="24"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABR0lEQVR4nOWUq0uEQRTFf4raDCL+Az7igsVs9QmKxW4SDBsMGxaxCBbFYDOKli3+C4LFIgpq0yA2H2jwUXZXLpwPhtkZP9D5WMEDw3LZM/fce+beD/4bpoFH4KCo5J9AE6inTj4BfCh5dpJh2Km8EIFRoCGR4yIEDCVgEFgvSiDD3xeYA86Bd/3Oe/+v/WZMZ/SY7qQ0gCmHM6ZF2/+JwJWSPgPbwJPik5x7C8CZpuxWXXaFiHdKuKJ4V7HZFcNioGs7GyHyiOzoBAaAU5FNOIZNcazbHceFh9iFHqAsn7Nqqt8I9AJL2hGz5l53zKoW9AMXXqs1oJt8jHv3rMgW1DySWVTR5MQwJFv7vM/IUYj8FnispuyKwR+MPcWvIfKhFshNXs+Z+UvxXoAt4EaxPXYSTAaKsrNKQsxq0WxfroFloCOlQHvxBSeFfyw4NmerAAAAAElFTkSuQmCC"
        />
      </defs>
    </svg>
  );
}

// ------- Main Page -------
type TabValue = "count" | "device-status" | "environmental-data";

export default function MapPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("count");
  const [query, setQuery] = useState("");

  const tabs: { label: string; value: TabValue; icon: (active: boolean) => React.ReactNode }[] = [
    {
      label: "Count",
      value: "count",
      icon: (active) => <CountIcon active={active} />,
    },
    {
      label: "Device Status",
      value: "device-status",
      icon: (_active) => <Activity size={16} />,
    },
    {
      label: "Environmental Data",
      value: "environmental-data",
      icon: (_active) => <Thermometer size={16} />,
    },
  ];

  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map/MapClient"), {
        loading: () => (
          <div className="w-full flex justify-center items-center h-screen">
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

  const position: [number, number] = [5.6037, -0.187];

  return (
    <div className="h-full w-full font-raleway relative">
      {/* Map fills full area */}
      <div className="absolute rounded-lg inset-0">
        <Map position={position} zoom={11} />
      </div>

      {/* Floating search bar — shifts right when sidebar opens */}
      <div
        className={`absolute top-4 z-[1000] transition-all duration-300 ease-in-out
          ${isOpen ? "left-[340px] right-4" : "left-20 right-4"}`}
      >
        <div className="w-[350px]">
          <div className="flex items-center bg-white rounded-full shadow-lg px-4 py-2.5 gap-3">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search location..."
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full  z-[1000] shadow-lg bg-white 
          transition-all duration-300 ease-in-out overflow-hidden flex flex-col
          ${isOpen ? "w-[400px]" : "w-16"}`}
      >
        {/* Toggle button */}
        <div
          className={`w-full flex shrink-0 ${
            isOpen ? "justify-end" : "justify-center"
          } items-center p-4`}
        >
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-md hover:bg-gray-200 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Logs size={20} />}
          </button>
        </div>

        {/* Content — only rendered when open */}
        {isOpen && (
          <>
            {/* Tab switcher */}
            <div className="px-4 pb-3 shrink-0">
              <div className="flex items-center bg-white rounded-xl p-1 shadow-sm gap-1">
                {tabs.map((tab) => {
                  const active = activeTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value)}
                      className={`flex items-center gap-1 px-2 py-2 rounded-lg text-[12px] font-semibold transition-all duration-300 flex-1 justify-center
                        ${
                          active
                            ? "bg-linear-to-r from-secondary to-primary text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <span className={active ? "text-white" : "text-gray-600"}>
                        {tab.icon(active)}
                      </span>
                      <span className="whitespace-nowrap leading-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable tab content */}
            <div className="flex-1 overflow-y-auto pt-1">
              {activeTab === "count" && <CountTab />}
              {activeTab === "device-status" && <DeviceStatusTab />}
              {activeTab === "environmental-data" && <EnvDataTab />}
            </div>

            {/* Footer */}
            <div className="shrink-0 px-4 py-4 border-t border-gray-200">
              <div className="flex justify-end">
                <Link href='/map/sensor/20' className="text-sm font-semibold text-primary   flex items-center gap-1.5 transition-colors">
                  View Dashboard <span>→</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}