"use client";

import {
  Thermometer,
  Droplets,
  Gauge,
  Battery,
  Maximize2,
  Wifi,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import SensorMetricCard from "@/components/cards/SensorMetricCard";
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

const speciesData = [
  { species: "Young Male Aedes", date: "01 Dec 2023, 2:00 pm", count: 69 },
  { species: "Old Male Aedes", date: "01 Dec 2023, 2:00 pm", count: 69 },
  { species: "Young Female Aedes", date: "01 Dec 2023, 2:00 pm", count: 69 },
  { species: "Old Female Aedes", date: "01 Dec 2023, 2:00 pm", count: 69 },
  { species: "Young Male Anopheles", date: "01 Dec 2023, 2:00 pm", count: 69 },
  { species: "Old Male Anopheles", date: "01 Dec 2023, 2:00 pm", count: 90 },
  { species: "Young Female Anopheles", date: "01 Dec 2023, 2:00 pm", count: 69 },
  { species: "Old Female Anopheles", date: "01 Dec 2023, 2:00 pm", count: 69 },
  { species: "Young Male Culex", date: "01 Dec 2023, 2:00 pm", count: 69 },
];

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

import { useDevice } from "@/hooks/device";

export default function SensorDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { data: device, isLoading } = useDevice(id || "");
  const [activeTab, setActiveTab] = useState<"readings" | "graphs">("readings");
  const [mapLayerOn, setMapLayerOn] = useState(true);

  const mapCenter: [number, number] = useMemo(
    () => {
        if (device?.latitude && device?.longitude) {
            return [device.latitude, device.longitude];
        }
        return [5.6037, -0.187];
    },
    [device]
  );

  return (
    <div className="flex flex-col font-raleway gap-4 w-full ">
         <div className="flex-row  justify-between flex items-center gap-2">

        <span className="font-semibold">Sensor 20</span>


        <div className=" text-sm  flex flex-row gap-3 items-center">

            <span>Satatus:</span>

<svg width="37" height="30" viewBox="0 0 37 30" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
<rect y="-11" width="37" height="52" fill="url(#pattern0_45_1190)"/>
<defs>
<pattern id="pattern0_45_1190" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlinkHref="#image0_45_1190" transform="matrix(0.01 0 0 0.00711538 0 0.144231)"/>
</pattern>
<image id="image0_45_1190" width="100" height="100" preserveAspectRatio="none" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFXElEQVR4nO2cXUxcRRTH74MfiR8vGvuirX33I0Z958HQnQGkagomMGcpSwX64ItIBbSaSMFIk9paWgRjTKmrsjsDS7VYa1OEtDHiU60I3caXNjxYbH21iow5y9KSFfbeXXZnlr3nl/wTshCYOX9m7syZM9dxCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIIgCIJwByIVW4QM7ATJeoXi34Hil0GyG0Lxv0FxXQwS2BfJbiT7dhr7ClFWt3Nk22anEKgbCWwFxfeC4rO2gwW2zZLsV5DszRpZ9qhxI4JR9qRQbBAUW7AdCCgwCcX+FZJ9BVH+bN6NaIhsewAU7wfJF213HApdki/iP61QpZvyYgZI/rKQ7E/rHVUbS0Lx60HFduTMiKpI1V1C8o9sdww2uiTrbex/5s51mSEGS+8Fyb6x3hlVNDoTilXen+XIKLkPJP+hADqhi0vsPP6jZ2QGDi2/j4xQrFLvGd+lu6Za9IELb+ve6c6E8Gv8DL+HP5Pl7z/z6hi727Mhfn1m1A2X647JZj0Q369j1wb16PzxtBq5dkwPxHt0+2SzDg6XZfb3JOv1ZEZttKzadmDAgtommnT4ap+rCWvp86t9um2iMUNTeE36kaFKNyVTA9ovCp14QffNvpe1Eanqm+nWDaPbPS+J6yPsoTUNAcmO2Q4QGNTusep1jYq1FL5yVDefrPJqyiermlE3UvaUn3bgu8eq9dDcxzk3Y1lDcwPeTJF8sWaEP7HK6OAR20ECg9NUPkbGaiMlNOphJSb5FymjI7AVk2K2AwWGlMtnhpuOzHR7aBNbwOOL26NjKYWu/aD2iSZjZiyrbeIV13bVKt6x0pBZv+wzwgamqlR9duWol33K9JIZkYottgNlSh2TzcbNWFbHZJNr+2oVe8RJHLsWQLBMaCC+35oh/fEe1/YJxYO49+i1HSgTCo1u95QOyZcwzVIfez59OyU/5CQLEnSxa8/4LmtmLKv1bIPbCDnlgGK/2Q6WCe376XXrhnROtbi18zKOkOu2g2VCH/z8jnVDDlzYm76dks3jCLlpO1gmdHi607ohh395N20bheR/kSHzBWYITVnHC27K8sVDvWuqxboh+358zdND3RfL3tbxBuuGtJ4NeVj2+mVjGKtMbM5smRH73evG0E+pk0s91gzpj7/v3kZZBg6W0tsOlCm1W0wuYtrfU3IxUdyApfQFEDDIszAFjqd4ps0Ie0m/S3bxdrWJDLxlO1im1D7RaNyQN753P6ACydpuGYKXTPx016NvptuYGUdmujy0iS387xYWKDZkO1BgSFg3ZWLqWipycK/REoqFV70V5acyoOaTVYlSnXyZ8eVcv6cyICwuCUYDj61eKKf4p7YDBYZNycdIyahQTrIBZy2wrNEvuS1ICuumsFQnl88ML9PUkhn8Dxh+7sE1DUlMXYrtsB0ksCAs1cHqkPWMCk+rqZUaDryU1oxbU5dP0imQItwrYHUIFiR4SbNgOgR34Ljpy/g6gmIHnUwu7AjJxmwHCCwK8054Bo7Hrpg2x/MUFH6Nn2GisD7bCzuSf10yXnKHk/H9QsXO2w4MFJmEYucaT1Tck5EZK03x+0iBXEqy01lf+ky5b+jLZwrkzAjc37GDGU9Tbqsvvy2JIQfCpW1QsRedvL1aQ/JDfrq6AOt8tUbaK2u5QqjyxxMvn5H8H+sdV4X58plaFXjaMQ1WzuO9Biyltx0IsC3JLgrJ2wvm3Vl42oXV20LyD4Xi3wrJLi09c4qp7ovdxD4l+3YKp288dg1Gyh+2HX+CIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCIAiCcDYC/wGARvs8/cGYpAAAAABJRU5ErkJggg=="/>
</defs>
</svg>

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
                <h2 className="text-lg font-raleway font-semibold  text-gray-800">
                  Mosquito Species and Age Count
                </h2>
                <select className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-0  text-gray-700 bg-white y focus:border-primary outline-none">
                  <option>Hour</option>
                  <option>Day</option>
                  <option>Week</option>
                </select>
              </div>
              <div className="overflow-hidden rounded-xl border border-secondary/15 ">
                <table className="w-full text-left border-collapse border-secondary/15  font-raleway">
                  <thead className="bg-[#DAE3F8]/30">
                    <tr className="text-gray-700 text-sm">
                      <th className="px-5 py-4 font-semibold">
                        Species & Age Group
                      </th>
                      <th className="px-5 py-4 font-semibold text-center">
                        Date
                      </th>
                      <th className="px-5 py-4 font-semibold text-right">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {speciesData.map((row, index) => (
                      <tr
                        key={`${row.species}-${index}`}
                        className="border-t  border-secondary/15  text-sm even:bg-[#F2F5FA]/30"
                      >
                        <td className="px-5 py-4 font-medium text-gray-800">
                          {row.species}
                        </td>
                        <td className="px-5 py-4 text-gray-600 text-center">
                          {row.date}
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-900 text-right">
                          {row.count}
                        </td>
                      </tr>
                    ))}
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
          <div className="py-8 text-center gap-10 flex flex-col text-gray-500 font-raleway">
            <MosquitoCountChart />
            <MosquitoTrendChart />
            <MosquitoGenderChart/>
            <ActiveStatusTrendChart/>
            <TemperatureTrendChart/>
            <HumidityTrendChart/>
            <PressureTrendChart/>
            <BatteryTrendChart/>
          </div>
        )}
      </div>
    </div>
  );
}
