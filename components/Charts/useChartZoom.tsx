"use client";

import { useMemo, useState } from "react";

// Plotly-style zoom for the time-series charts: drag across the plot to zoom
// into that x-range, double-click (or the reset button) to zoom back out.
// Works by slicing the data array, so it fits Recharts' categorical x-axes.
// Bound to both mouse and touch events; hosts need `touch-pan-y` so a
// horizontal drag selects while vertical swipes still scroll the page.

// Structural subset of Recharts' MouseHandlerDataParam, so the handlers can be
// passed straight to a chart's onMouseDown/onMouseMove/onMouseUp.
type ChartMouseState = {
  activeTooltipIndex?: number | string | null;
};

// Shared look for the drag-selection highlight (<ReferenceArea>).
export const zoomAreaProps = {
  fill: "#2563eb",
  fillOpacity: 0.08,
  stroke: "#2563eb",
  strokeOpacity: 0.25,
} as const;

export interface ChartZoom<T> {
  /** The slice of the data currently in view — pass this to the chart. */
  data: T[];
  /** Labels of the in-progress drag selection; render a <ReferenceArea x1 x2> when set. */
  refArea: { x1: string | number; x2: string | number } | null;
  isZoomed: boolean;
  reset: () => void;
  /** Spread onto the chart element (LineChart/AreaChart/ComposedChart). */
  chartProps: {
    onMouseDown: (state: ChartMouseState) => void;
    onMouseMove: (state: ChartMouseState) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onDoubleClick: () => void;
    onTouchStart: (state: ChartMouseState) => void;
    onTouchMove: (state: ChartMouseState) => void;
    onTouchEnd: () => void;
  };
}

export function useChartZoom<T>(fullData: T[], xKey = "label"): ChartZoom<T> {
  // The window is stored with the dataset it was made on, so a new dataset
  // (e.g. group-by switch) silently discards it. Indices are inclusive and
  // absolute into fullData.
  const [zoomed, setZoomed] = useState<{ source: T[]; window: [number, number] } | null>(null);
  const [drag, setDrag] = useState<[number, number] | null>(null);

  const window = zoomed && zoomed.source === fullData ? zoomed.window : null;
  const setWindow = (w: [number, number] | null) =>
    setZoomed(w ? { source: fullData, window: w } : null);

  const windowStart = window ? window[0] : 0;

  const data = useMemo(
    () => (window ? fullData.slice(window[0], window[1] + 1) : fullData),
    [fullData, window]
  );

  // The chart reports indices relative to the rendered (sliced) data.
  const toAbsolute = (state: ChartMouseState): number | null => {
    const i = Number(state?.activeTooltipIndex);
    return Number.isFinite(i) ? i + windowStart : null;
  };

  const labelAt = (index: number): string | number =>
    (fullData[index] as Record<string, string | number>)?.[xKey] ?? "";

  const refArea =
    drag && drag[0] !== drag[1]
      ? {
          x1: labelAt(Math.min(drag[0], drag[1])),
          x2: labelAt(Math.max(drag[0], drag[1])),
        }
      : null;

  const startDrag = (state: ChartMouseState) => {
    const i = toAbsolute(state);
    if (i !== null) setDrag([i, i]);
  };
  const moveDrag = (state: ChartMouseState) => {
    if (!drag) return;
    const i = toAbsolute(state);
    if (i !== null) setDrag([drag[0], i]);
  };
  const endDrag = () => {
    if (drag) {
      const start = Math.max(0, Math.min(drag[0], drag[1]));
      const end = Math.min(fullData.length - 1, Math.max(drag[0], drag[1]));
      // Ignore clicks and one-point selections — nothing to zoom into.
      if (end > start) setWindow([start, end]);
    }
    setDrag(null);
  };

  return {
    data,
    refArea,
    isZoomed: window !== null,
    reset: () => setWindow(null),
    chartProps: {
      onMouseDown: startDrag,
      onMouseMove: moveDrag,
      onMouseUp: endDrag,
      onMouseLeave: () => setDrag(null),
      onDoubleClick: () => setWindow(null),
      onTouchStart: startDrag,
      onTouchMove: moveDrag,
      onTouchEnd: endDrag,
    },
  };
}

/** Overlay pill shown while zoomed; the host container must be `relative`. */
export function ResetZoomButton({ zoom }: { zoom: ChartZoom<unknown> }) {
  if (!zoom.isZoomed) return null;
  return (
    <button
      type="button"
      onClick={zoom.reset}
      title="Show the full range (or double-click the chart)"
      className="absolute right-2 top-2 z-10 rounded-full border border-gray-200 bg-white/95 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
    >
      Reset zoom
    </button>
  );
}
