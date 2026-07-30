import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import L from "leaflet";
import { useEffect } from "react";
import { MapPin,Tag } from "lucide-react";

function normalizeCoordinate(value, maxAbs) {
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

function getDeviceLatLng(device) {
  const lat = normalizeCoordinate(device?.latitude, 90);
  const lng = normalizeCoordinate(device?.longitude, 180);
  if (lat === null || lng === null) return null;
  return [lat, lng];
}

// Status colors: green = active sensor, red = inactive sensor
const STATUS_COLORS = {
  active: { from: "#16a34a", to: "#22c55e", glow: "rgba(34,197,94,0.5)" },
  inactive: { from: "#dc2626", to: "#ef4444", glow: "rgba(239,68,68,0.5)" },
};

// Build a mosquito-trap marker icon colored by sensor status.
// `selected` adds a stronger glow so the active selection stays distinguishable.
function buildDeviceIcon({ isActive, selected }) {
  const color = isActive ? STATUS_COLORS.active : STATUS_COLORS.inactive;
  const shadow = selected
    ? `0 2px 14px ${color.glow}`
    : "0 2px 8px rgba(0,0,0,0.3)";
  const border = selected ? "3px solid white" : "2px solid white";
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 36px; height: 36px; background: linear-gradient(135deg, ${color.from}, ${color.to});
        border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
        border: ${border}; box-shadow: ${shadow};
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
}

// A sensor is active when its latest reading reports the trap as running.
function isDeviceActive(device) {
  return Boolean(device?.latest_reading?.trap_status);
}

function FlyToDevice({ device }) {
  const map = useMap();
  useEffect(() => {
    if (!device) return;
    const latLng = getDeviceLatLng(device);
    if (!latLng) return;
    map.flyTo(latLng, 14, { duration: 1.2 });
  }, [device, map]);
  return null;
}

// Flies to a geocoded place picked in the location search. Uses the place's
// bounding box when available so countries/regions frame correctly.
function FlyToLocation({ location }) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    if (location.bounds) {
      map.flyToBounds(location.bounds, { duration: 1.2, maxZoom: 15 });
    } else {
      map.flyTo([location.lat, location.lng], 12, { duration: 1.2 });
    }
  }, [location, map]);
  return null;
}

/**
 * @param {{ position: [number, number], zoom: number, devices: any[], selectedDevice: any, onMarkerClick?: (device: any) => void, flyToLocation?: { lat: number, lng: number, bounds?: [[number, number], [number, number]] | null } | null }} props
 */
export default function MapClient({ position, zoom, devices = [], selectedDevice, onMarkerClick, flyToLocation }) {
  const devicesWithLatLng = devices
    .map((device) => ({ device, latLng: getDeviceLatLng(device) }))
    .filter(({ latLng }) => Boolean(latLng));

  useEffect(() => {
    const invalid = devices.filter((d) => !getDeviceLatLng(d));
    if (invalid.length > 0) {
      console.warn(
        `[MapClient] Skipping ${invalid.length} device(s) with invalid coordinates`,
        invalid.map((d) => ({
          id: d?.id,
          name: d?.name,
          latitude: d?.latitude,
          longitude: d?.longitude,
        }))
      );
    }
  }, [devices]);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <div
        className="font-mulish"
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 8,
          padding: "8px 12px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.2)",
          fontSize: 12,
          color: "#374151",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          Active sensor
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
          Inactive sensor
        </div>
      </div>
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

      {devicesWithLatLng.map(({ device, latLng }) => (
        <Marker
          key={device.id}
          position={latLng}
          icon={buildDeviceIcon({
            isActive: isDeviceActive(device),
            selected: selectedDevice?.id === device.id,
          })}
          eventHandlers={{
            click: () => onMarkerClick && onMarkerClick(device),
          }}
        >
          <Popup>
            <div  className='font-mulish font-semibold' style={{  minWidth: "160px" }}>
              
              <div  className="flex flex-row items-center gap-1" style={{ fontSize: "13px", color: "#6b7280", marginBottom: "2px" }}>
                <MapPin size={13} /> {[device.community, device.region].filter(Boolean).join(', ') || '—'}
              </div>
              <div className="flex flex-row items-center gap-1" style={{ fontSize: "13px", color: "#6b7280" }}>
                <Tag size={13} /> {device.name}
              </div>
	              <button
	                onClick={() => {
	                  if (typeof window !== "undefined" && device?.id != null) {
	                    window.location.assign(`/map/sensor/${device.id}`);
	                    return;
	                  }
	                  if (onMarkerClick) onMarkerClick(device);
	                }}
	               className="bg-primary text-white w-full mt-2 py-1 font-medium rounded-md"
	              >
	                View Details →
	              </button>
            </div>
          </Popup>
        </Marker>
      ))} 

        {selectedDevice && <FlyToDevice device={selectedDevice} />}
        {flyToLocation && <FlyToLocation location={flyToLocation} />}
      </MapContainer>
    </div>
  );
}
