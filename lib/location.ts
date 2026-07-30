// Region and community are derived from whatever coordinates a device reports,
// so both are absent until it has reported at least once. Every display site
// must tolerate null rather than assuming a string.

export type HasLocation = {
  region?: string | null;
  community?: string | null;
};

/** "Osu, Greater Accra" — or just whichever part is known, or a dash. */
export function locationLabel(device: HasLocation | null | undefined, fallback = "—"): string {
  const parts = [device?.community, device?.region]
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : fallback;
}

/** Lowercased haystack for client-side search. Never throws on null. */
export function locationSearchText(device: HasLocation | null | undefined): string {
  return [device?.community, device?.region]
    .filter((p): p is string => typeof p === "string")
    .join(" ")
    .toLowerCase();
}
