import { getAdminClient } from "@/lib/db";
import { getAstrolearnPool, getBubblePool } from "@/lib/astrolearn-db";
import { normalizeBirthIsoDate } from "@/lib/european-date";
import {
  getAstrolearnAuthState,
  type ViewSubject,
} from "@/lib/astrolearn-auth";

export type BirthIdentity = {
  label: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
};

export type AstrologySubject = {
  source: "astrolearn" | "unfold";
  label: string;
  personId: string | null;
  username: string | null;
  deviceId: string | null;
  eventsPersonId: number | null;
  eventsUsername: string | null;
  supportsEvents: boolean;
  birth: BirthIdentity;
};

export class AstrologySubjectError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function formatBirthDate(value: unknown): string {
  return normalizeBirthIsoDate(value);
}

function formatBirthTime(value: unknown): string {
  return String(value ?? "00:00").slice(0, 5);
}

function hasCompleteBirthData(birth: BirthIdentity): boolean {
  return Boolean(
    birth.birthDate &&
      birth.birthTime &&
      Number.isFinite(birth.latitude) &&
      Number.isFinite(birth.longitude) &&
      birth.timezone
  );
}

function toCalculatorBirthPayload(birth: BirthIdentity): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    birthDate: birth.birthDate,
    birthTime: birth.birthTime,
    timezone: birth.timezone,
    firstName: birth.firstName,
    lastName: birth.lastName,
    city: birth.city,
    country: birth.country,
  };

  if (Number.isFinite(birth.latitude) && Number.isFinite(birth.longitude)) {
    payload.latitude = birth.latitude;
    payload.longitude = birth.longitude;
  }

  return payload;
}

async function loadAstrolearnSubjectByKey(key: {
  personId?: string;
  username?: string;
}): Promise<AstrologySubject> {
  const personId = key.personId?.trim() ?? "";
  const username = key.username?.trim() ?? "";

  const isBubble = personId.startsWith("bubble:");
  const rawId = isBubble ? personId.slice("bubble:".length) : personId;
  const numericId = /^\d+$/.test(rawId) ? Number(rawId) : null;

  if (isBubble) {
    const pool = getBubblePool();
    const { rows } = await pool.query(
      `SELECT id_person, name, login, birthdate::text AS birthdate, birthtime, latitude, longitude, city, country, timezone
       FROM person WHERE id_person = $1 LIMIT 1`,
      [numericId]
    );
    if (rows.length === 0) {
      throw new AstrologySubjectError(`Bubble person '${rawId}' not found`, 404);
    }
    const person = rows[0];
    const login = person.login || null;
    const label = String(person.name ?? "").trim() || login || String(person.id_person);
    const birth: BirthIdentity = {
      label,
      firstName: label,
      lastName: "",
      birthDate: formatBirthDate(person.birthdate),
      birthTime: formatBirthTime(person.birthtime),
      latitude: Number(person.latitude),
      longitude: Number(person.longitude),
      city: person.city ?? "",
      country: person.country ?? "",
      timezone: person.timezone ?? "UTC",
    };
    if (!hasCompleteBirthData(birth)) {
      throw new AstrologySubjectError("Selected person is missing complete birth data", 422);
    }
    return {
      source: "astrolearn",
      label: birth.label,
      personId: personId,
      username: login,
      deviceId: null,
      eventsPersonId: null,
      eventsUsername: null,
      supportsEvents: false,
      birth,
    };
  }

  const pool = getAstrolearnPool();
  const { rows } = await pool.query(
    `SELECT
       id_person,
       username,
       login,
       first_name,
       last_name,
       birthdate::text AS birthdate,
       birthtime,
       latitude,
       longitude,
       city,
       country,
       timezone
     FROM person
     WHERE
       ($1::int IS NOT NULL AND id_person = $1::int)
       OR ($2 <> '' AND (username = $2 OR login = $2))
       OR ($3 <> '' AND (username = $3 OR login = $3))
     ORDER BY CASE WHEN $1::int IS NOT NULL AND id_person = $1::int THEN 0 ELSE 1 END
     LIMIT 1`,
    [numericId, rawId, username]
  );

  if (rows.length === 0) {
    const label = username || personId;
    throw new AstrologySubjectError(`User '${label}' not found`, 404);
  }

  const person = rows[0];
  const sessionUsername = person.username || person.login || null;
  const birth: BirthIdentity = {
    label: [person.first_name, person.last_name].filter(Boolean).join(" ") || sessionUsername || String(person.id_person),
    firstName: person.first_name ?? "",
    lastName: person.last_name ?? "",
    birthDate: formatBirthDate(person.birthdate),
    birthTime: formatBirthTime(person.birthtime),
    latitude: Number(person.latitude),
    longitude: Number(person.longitude),
    city: person.city ?? "",
    country: person.country ?? "",
    timezone: person.timezone ?? "UTC",
  };

  if (!hasCompleteBirthData(birth)) {
    throw new AstrologySubjectError("Selected person is missing complete birth data", 422);
  }

  return {
    source: "astrolearn",
    label: birth.label,
    personId: String(person.id_person),
    username: sessionUsername,
    deviceId: null,
    eventsPersonId: Number(person.id_person),
    eventsUsername: sessionUsername,
    supportsEvents: true,
    birth,
  };
}

async function loadAstrolearnSubject(username: string): Promise<AstrologySubject> {
  return loadAstrolearnSubjectByKey({ username });
}

async function loadUnfoldSubject(deviceId: string): Promise<AstrologySubject> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "device_id, display_name, nickname, birth_date, birth_time, latitude, longitude, timezone, place_of_birth, email"
    )
    .eq("device_id", deviceId)
    .maybeSingle();

  if (error) {
    throw new AstrologySubjectError(error.message, 500);
  }
  if (!data) {
    throw new AstrologySubjectError(`Unfold profile '${deviceId}' not found`, 404);
  }

  const label =
    data.display_name?.trim() ||
    data.nickname?.trim() ||
    data.email?.trim() ||
    data.device_id;

  const birth: BirthIdentity = {
    label,
    firstName: label,
    lastName: "",
    birthDate: formatBirthDate(data.birth_date),
    birthTime: formatBirthTime(data.birth_time),
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    city: data.place_of_birth ?? "",
    country: "",
    timezone: data.timezone ?? "UTC",
  };

  if (!hasCompleteBirthData(birth)) {
    throw new AstrologySubjectError("Selected Unfold profile is missing complete birth data", 422);
  }

  return {
    source: "unfold",
    label,
    personId: null,
    username: null,
    deviceId: data.device_id,
    eventsPersonId: null,
    eventsUsername: null,
    supportsEvents: false,
    birth,
  };
}

async function loadViewSubject(subject: ViewSubject): Promise<AstrologySubject> {
  if (subject.source === "astrolearn") {
    const resolved = await loadAstrolearnSubjectByKey({
      personId: subject.personId,
      username: subject.username,
    });
    return { ...resolved, label: subject.label || resolved.label };
  }

  const resolved = await loadUnfoldSubject(subject.deviceId);
  return { ...resolved, label: subject.label || resolved.label };
}

export async function resolveAstrologySubject(): Promise<AstrologySubject> {
  const { sessionUser, isAdmin, viewSubject } = await getAstrolearnAuthState();
  if (!sessionUser) {
    throw new AstrologySubjectError("Not authenticated", 401);
  }

  if (isAdmin && viewSubject) {
    return loadViewSubject(viewSubject);
  }

  if (isAdmin) {
    throw new AstrologySubjectError("Select a person to view their chart data", 422);
  }

  return loadAstrolearnSubject(sessionUser);
}

export function getCalculatorRequest(
  subject: AstrologySubject,
  kind:
    | "chart-data"
    | "transits-exact-short"
    | "transits-exact"
    | "transit-cycles"
    | "zodiacal-releasing"
    | "profection"
    | "toctoc-timeline"
    | "toctoc-app"
): { endpoint: string; input: Record<string, unknown> } {
  const birthPayload = toCalculatorBirthPayload(subject.birth);

  if (kind === "chart-data") {
    return { endpoint: "/api/chart-data", input: birthPayload };
  }

  if (subject.source === "astrolearn" && subject.username) {
    const username = subject.username;
    switch (kind) {
      case "transits-exact-short":
        return { endpoint: `/api/transits-exact-short/${username}`, input: birthPayload };
      case "transits-exact":
        return { endpoint: `/api/transits-exact/${username}`, input: birthPayload };
      case "transit-cycles":
        return { endpoint: `/api/transit-cycles/${username}`, input: birthPayload };
      case "zodiacal-releasing":
        return { endpoint: `/api/zodiacal-releasing/${username}`, input: birthPayload };
      case "profection":
        return { endpoint: `/api/profection/${username}`, input: birthPayload };
      case "toctoc-timeline":
        return { endpoint: `/api/toctoc-timeline/${username}`, input: birthPayload };
      case "toctoc-app":
        return { endpoint: `/api/toctoc-app/${username}`, input: birthPayload };
    }
  }

  switch (kind) {
    case "transits-exact-short":
      return { endpoint: "/api/transits-exact-short", input: birthPayload };
    case "transits-exact":
      return { endpoint: "/api/transits-exact", input: birthPayload };
    case "transit-cycles":
      return { endpoint: "/api/transit-cycles", input: birthPayload };
    case "zodiacal-releasing":
      return { endpoint: "/api/zodiacal-releasing", input: birthPayload };
    case "profection":
      return { endpoint: "/api/profection", input: birthPayload };
    case "toctoc-timeline":
      return { endpoint: "/api/toctoc-timeline", input: birthPayload };
    case "toctoc-app":
      return { endpoint: "/api/toctoc-app", input: birthPayload };
  }
}

export function summarizeBirthData(birth: Partial<BirthIdentity>): boolean {
  const identity: BirthIdentity = {
    label: birth.label ?? "",
    firstName: birth.firstName ?? "",
    lastName: birth.lastName ?? "",
    birthDate: birth.birthDate ?? "",
    birthTime: birth.birthTime ?? "",
    latitude: Number(birth.latitude),
    longitude: Number(birth.longitude),
    city: birth.city ?? "",
    country: birth.country ?? "",
    timezone: birth.timezone ?? "",
  };
  return hasCompleteBirthData(identity);
}
