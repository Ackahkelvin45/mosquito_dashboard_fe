"use client";

import { Loader2, MapPin, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { OpenStreetMapProvider } from "leaflet-geosearch";

type SearchResult = Awaited<ReturnType<OpenStreetMapProvider["search"]>>[number];

export type GeoLocation = {
  label: string;
  lat: number;
  lng: number;
  // [[south, west], [north, east]] — Leaflet flyToBounds format.
  bounds: [[number, number], [number, number]] | null;
};

export default function LocationSearch({
  onSelect,
}: {
  onSelect: (location: GeoLocation) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // leaflet-geosearch pulls in Leaflet, so the provider is created lazily on
  // the client only; the module import at the top is type-only.
  const providerRef = useRef<OpenStreetMapProvider | null>(null);
  // Suppresses the search effect when the query change came from picking a result.
  const skipSearchRef = useRef(false);
  // Identifies the latest request so stale responses are discarded.
  const searchSeqRef = useRef(0);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleMouseDown);
    return () => document.removeEventListener("pointerdown", handleMouseDown);
  }, []);

  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    const q = query.trim();
    if (q.length < 3) {
      searchSeqRef.current += 1;
      setResults([]);
      setIsOpen(false);
      setIsSearching(false);
      return;
    }

    const seq = ++searchSeqRef.current;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        if (!providerRef.current) {
          const { OpenStreetMapProvider: Provider } = await import("leaflet-geosearch");
          providerRef.current = new Provider({
            params: { "accept-language": "en", addressdetails: 0 },
          });
        }
        const found = await providerRef.current.search({ query: q });
        if (seq !== searchSeqRef.current) return;
        setResults(found.slice(0, 6));
        setIsOpen(true);
      } catch {
        if (seq !== searchSeqRef.current) return;
        setResults([]);
        setIsOpen(false);
      } finally {
        if (seq === searchSeqRef.current) setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (r: SearchResult) => {
    if (!Number.isFinite(r.y) || !Number.isFinite(r.x)) return;

    const primary = r.label.split(", ")[0] || r.label;
    skipSearchRef.current = true;
    searchSeqRef.current += 1;
    setQuery(primary);
    setResults([]);
    setIsOpen(false);
    setIsSearching(false);
    onSelect({ label: r.label, lat: r.y, lng: r.x, bounds: r.bounds ?? null });
  };

  const handleClear = () => {
    skipSearchRef.current = true;
    searchSeqRef.current += 1;
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isOpen && results.length > 0) {
      e.preventDefault();
      handleSelect(results[0]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center bg-white rounded-full shadow-lg px-4 py-2.5 gap-3">
        <MapPin size={18} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search country, city, town..."
          className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
        />
        {isSearching && <Loader2 size={15} className="text-gray-400 animate-spin shrink-0" />}
        {query && !isSearching && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2 shrink-0"
            aria-label="Clear location search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto z-[1100]">
          {results.length > 0 ? (
            results.map((r, i) => {
              const [primary, ...rest] = r.label.split(", ");
              return (
                <button
                  key={`${r.x},${r.y},${i}`}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-start gap-2 border-b border-gray-100 last:border-0"
                >
                  <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{primary}</p>
                    {rest.length > 0 && (
                      <p className="text-xs text-gray-400 truncate">{rest.join(", ")}</p>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <p className="px-4 py-3 text-sm text-gray-400">No places found</p>
          )}
        </div>
      )}
    </div>
  );
}
