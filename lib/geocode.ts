/**
 * Geocoding client — wraps our /api/geocode proxy (Open-Meteo).
 * Returns city name + lat/lng/timezone in one call.
 * No API key required.
 */

export interface GeoResult {
  id: number;
  name: string;
  displayName: string; // "Brussels, Belgium"
  latitude: number;
  longitude: number;
  timezone: string; // IANA, e.g. "Europe/Brussels"
  country: string;
  admin1?: string; // region/state
}

interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
  admin1?: string;
}

function toGeoResult(r: OpenMeteoResult): GeoResult {
  const parts = [r.name, r.admin1, r.country].filter(Boolean);
  return {
    id: r.id,
    name: r.name,
    displayName: parts.join(", "),
    latitude: r.latitude,
    longitude: r.longitude,
    timezone: r.timezone ?? "UTC",
    country: r.country ?? "",
    admin1: r.admin1,
  };
}

/** Search for cities matching a query string. Returns up to 6 results. */
export async function searchCities(query: string): Promise<GeoResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(
      `/api/geocode?q=${encodeURIComponent(query.trim())}`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: OpenMeteoResult[] };
    return (data.results ?? []).map(toGeoResult);
  } catch {
    return [];
  }
}
