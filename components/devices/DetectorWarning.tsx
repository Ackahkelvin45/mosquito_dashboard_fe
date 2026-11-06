import { AlertTriangle } from "lucide-react";
import { detectorDisconnected, DETECTOR_DISCONNECTED_MSG } from "@/lib/reading";
import type { Device } from "@/types/api";

/** Renders only for an online device whose latest reading has esp1_link_alive === false. */
export default function DetectorWarning({ device, compact = false }: { device: Device | null | undefined; compact?: boolean }) {
  if (!detectorDisconnected(device)) return null;
  return (
    <span
      role="status"
      title={DETECTOR_DISCONNECTED_MSG}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-semibold"
    >
      <AlertTriangle size={14} aria-hidden="true" className="shrink-0" />
      {compact ? "Detector disconnected" : DETECTOR_DISCONNECTED_MSG}
    </span>
  );
}
