// Shared date helpers for API timestamps. New code should use these; existing
// pages keep their local copies until they're migrated.

// Backend timestamps are naive UTC (no zone suffix); new Date() would read
// them as browser-local time and shift the display outside UTC timezones.
export function parseApiDate(iso: string): Date {
  const hasZone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(iso);
  return new Date(hasZone ? iso : `${iso}Z`);
}

export function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    hour12: true,
  });
}

/** "45s", "12m", "3h 5m", "2d 4h" — for measured durations (response times). */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) return "—";
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 ? `${hours}h ${minutes % 60}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  return hours % 24 ? `${days}d ${hours % 24}h` : `${days}d`;
}

/**
 * Relative label for recent timestamps ("just now", "5m ago", "2h ago",
 * "3d ago"); anything older than a week falls back to the full timestamp.
 */
export function timeAgo(iso: string): string {
  const date = parseApiDate(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatTimestamp(iso);
}
