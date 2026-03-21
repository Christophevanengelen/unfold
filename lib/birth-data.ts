/**
 * Birth data persistence layer — localStorage-based for the demo.
 * Stores user birth info needed for Momentum Engine API calls.
 */

const STORAGE_KEY = "unfold_birth_data";

export interface BirthData {
  nickname: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM
  latitude: number;
  longitude: number;
  timezone: string;
  placeOfBirth: string;
}

export function saveBirthData(data: BirthData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getBirthData(): BirthData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BirthData;
  } catch {
    return null;
  }
}

export function hasBirthData(): boolean {
  return getBirthData() !== null;
}

export function clearBirthData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Simple city → coords lookup for the demo. Extend as needed. */
export const CITY_COORDS: Record<
  string,
  { lat: number; lng: number; tz: string }
> = {
  Brussels: { lat: 50.8503, lng: 4.3517, tz: "Europe/Brussels" },
  Paris: { lat: 48.8566, lng: 2.3522, tz: "Europe/Paris" },
  London: { lat: 51.5074, lng: -0.1278, tz: "Europe/London" },
  "New York": { lat: 40.7128, lng: -74.006, tz: "America/New_York" },
  "Los Angeles": { lat: 34.0522, lng: -118.2437, tz: "America/Los_Angeles" },
  Tokyo: { lat: 35.6762, lng: 139.6503, tz: "Asia/Tokyo" },
  Sydney: { lat: -33.8688, lng: 151.2093, tz: "Australia/Sydney" },
  Madrid: { lat: 40.4168, lng: -3.7038, tz: "Europe/Madrid" },
  Berlin: { lat: 52.52, lng: 13.405, tz: "Europe/Berlin" },
  Amsterdam: { lat: 52.3676, lng: 4.9041, tz: "Europe/Amsterdam" },
  Rome: { lat: 41.9028, lng: 12.4964, tz: "Europe/Rome" },
  Lisbon: { lat: 38.7223, lng: -9.1393, tz: "Europe/Lisbon" },
  Barcelona: { lat: 41.3874, lng: 2.1686, tz: "Europe/Madrid" },
  Montreal: { lat: 45.5017, lng: -73.5673, tz: "America/Montreal" },
  Dubai: { lat: 25.2048, lng: 55.2708, tz: "Asia/Dubai" },
  Singapore: { lat: 1.3521, lng: 103.8198, tz: "Asia/Singapore" },
  "São Paulo": { lat: -23.5505, lng: -46.6333, tz: "America/Sao_Paulo" },
  Mumbai: { lat: 19.076, lng: 72.8777, tz: "Asia/Kolkata" },
  Casablanca: { lat: 33.5731, lng: -7.5898, tz: "Africa/Casablanca" },
  Dakar: { lat: 14.7167, lng: -17.4677, tz: "Africa/Dakar" },
};

/** Resolve a city name to coordinates. Returns Brussels as fallback. */
export function resolveCity(city: string): {
  lat: number;
  lng: number;
  tz: string;
} {
  // Exact match
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  // Case-insensitive match
  const lower = city.toLowerCase();
  const match = Object.entries(CITY_COORDS).find(
    ([k]) => k.toLowerCase() === lower
  );
  if (match) return match[1];
  // Fallback
  return CITY_COORDS.Brussels;
}
