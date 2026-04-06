import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapPin,Tag } from "lucide-react";

// Custom mosquito-trap marker icon
const deviceIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 36px; height: 36px; background: linear-gradient(135deg, #3C2178, #5B4FA0);
      border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
      border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="
        width: 10px; height: 10px; background: white;
        border-radius: 50%; transform: rotate(45deg);
      "></div>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const activeDeviceIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width: 36px; height: 36px; background: linear-gradient(135deg, #16a34a, #22c55e);
      border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
      border: 2px solid white; box-shadow: 0 2px 12px rgba(34,197,94,0.5);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="
        width: 10px; height: 10px; background: white;
        border-radius: 50%; transform: rotate(45deg);
      "></div>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

function FlyToDevice({ device }) {
  const map = useMap();
  useEffect(() => {
    if (device) {
      map.flyTo([device.latitude, device.longitude], 14, { duration: 1.2 });
    }
  }, [device, map]);
  return null;
}

/**
 * @param {{ position: [number, number], zoom: number, devices: any[], selectedDevice: any, onMarkerClick?: (device: any) => void }} props
 */
export default function MapClient({ position, zoom, devices = [], selectedDevice, onMarkerClick }) {
  return (
    <MapContainer
      center={position}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {devices.map((device) => (
        <Marker
          key={device.id}
          position={[device.latitude, device.longitude]}
          icon={selectedDevice?.id === device.id ? activeDeviceIcon : deviceIcon}
          eventHandlers={{
            click: () => onMarkerClick && onMarkerClick(device),
          }}
        >
          <Popup>
            <div  className='font-mulish font-semibold' style={{  minWidth: "160px" }}>
              
              <div  className="flex flex-row items-center gap-1" style={{ fontSize: "13px", color: "#6b7280", marginBottom: "2px" }}>
                <MapPin size={13} /> {device.region}
              </div>
              <div className="flex flex-row items-center gap-1" style={{ fontSize: "13px", color: "#6b7280" }}>
                <Tag size={13} /> {device.name}
              </div>
              <button
                onClick={() => onMarkerClick && onMarkerClick(device)}
               className="bg-primary text-white w-full mt-2 py-1 font-medium rounded-md"
              >
                View Details →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {selectedDevice && <FlyToDevice device={selectedDevice} />}
    </MapContainer>
  );
}