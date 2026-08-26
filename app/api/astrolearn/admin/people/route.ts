import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";
import { requireAdminSession } from "@/lib/astrolearn-auth";
import { getAstrolearnPool, getBubblePool } from "@/lib/astrolearn-db";
import { summarizeBirthData } from "@/lib/astrology-subject";
import { normalizeBirthIsoDate, parseEuropeanDateInput } from "@/lib/european-date";

import type { PersonResult, PeopleSource } from "@/types/astrolearn";
export type { PersonResult, PeopleSource };

function clampLimit(raw: string | null): number {
  const parsed = Number(raw ?? "25");
  if (!Number.isFinite(parsed)) return 25;
  return Math.max(1, Math.min(50, Math.floor(parsed)));
}

function formatDate(value: unknown): string {
  return normalizeBirthIsoDate(value);
}

function formatTime(value: unknown): string {
  return String(value ?? "").slice(0, 5);
}

async function searchAstrolearnPeople(
  query: string,
  limit: number,
  createdBy?: number | null
): Promise<PersonResult[]> {
  const pool = getAstrolearnPool();
  const pattern = `%${query}%`;
  const birthDate = parseEuropeanDateInput(query);
  const { rows } = await pool.query(
    `SELECT
       id_person::text AS id_person,
       username,
       login,
       first_name,
       last_name,
       name,
       birthdate::text AS birthdate,
       birthtime,
       latitude,
       longitude,
       city,
       country,
       timezone,
       profile_picture
     FROM person
     WHERE
       birthdate IS NOT NULL
       AND birthtime IS NOT NULL
       AND latitude IS NOT NULL
       AND longitude IS NOT NULL
       AND COALESCE(TRIM(timezone), '') <> ''
       AND ($5::int IS NULL OR created_by = $5::int)
       AND (
         $1 = ''
         OR username ILIKE $2
         OR login ILIKE $2
         OR COALESCE(name, '') ILIKE $2
         OR COALESCE(first_name, '') ILIKE $2
         OR COALESCE(last_name, '') ILIKE $2
         OR COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') ILIKE $2
         OR TO_CHAR(birthdate, 'DD/MM/YYYY') ILIKE $2
         OR birthdate::text ILIKE $2
         OR ($3::date IS NOT NULL AND birthdate = $3::date)
       )
     ORDER BY first_name NULLS LAST, last_name NULLS LAST, username NULLS LAST
     LIMIT $4`,
    [query, pattern, birthDate, limit, createdBy ?? null]
  );

  return rows.map((row: any) => {
    const username = row.username || row.login || "";
    const label =
      [row.first_name, row.last_name].filter(Boolean).join(" ").trim() ||
      String(row.name ?? "").trim() ||
      username ||
      String(row.id_person);
    const birthDateValue = formatDate(row.birthdate);
    const birthTime = formatTime(row.birthtime);

    return {
      id: String(row.id_person),
      source: "astrolearn" as const,
      label,
      personId: String(row.id_person),
      ...(username ? { username } : {}),
      birthDate: birthDateValue,
      birthTime,
      city: row.city ?? "",
      ...(row.profile_picture ? { picture: row.profile_picture } : {}),
      hasCompleteBirthData: summarizeBirthData({
        birthDate: birthDateValue,
        birthTime,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        timezone: row.timezone ?? "",
      }),
    };
  });
}

async function searchBubblePeople(query: string, limit: number): Promise<PersonResult[]> {
  const pool = getBubblePool();
  const pattern = `%${query}%`;
  const birthDate = parseEuropeanDateInput(query);
  const { rows } = await pool.query(
    `SELECT
       id_person::text AS id_person,
       name,
       login,
       birthdate::text AS birthdate,
       birthtime,
       latitude,
       longitude,
       city,
       country,
       timezone
     FROM person
     WHERE
       birthdate IS NOT NULL
       AND birthtime IS NOT NULL
       AND latitude IS NOT NULL
       AND longitude IS NOT NULL
       AND COALESCE(TRIM(timezone), '') <> ''
       AND (
         $1 = ''
         OR name ILIKE $2
         OR login ILIKE $2
         OR TO_CHAR(birthdate, 'DD/MM/YYYY') ILIKE $2
         OR birthdate::text ILIKE $2
         OR ($3::date IS NOT NULL AND birthdate = $3::date)
       )
     ORDER BY name NULLS LAST
     LIMIT $4`,
    [query, pattern, birthDate, limit]
  );

  return rows.map((row: any) => {
    const login = String(row.login ?? "").trim();
    const label = String(row.name ?? "").trim() || login || String(row.id_person);
    const birthDateValue = formatDate(row.birthdate);
    const birthTime = formatTime(row.birthtime);

    return {
      id: `bubble-${row.id_person}`,
      source: "astrolearn" as const,
      label,
      personId: `bubble:${row.id_person}`,
      ...(login ? { username: login } : {}),
      birthDate: birthDateValue,
      birthTime,
      city: row.city ?? "",
      hasCompleteBirthData: summarizeBirthData({
        birthDate: birthDateValue,
        birthTime,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        timezone: row.timezone ?? "",
      }),
    };
  });
}

async function searchUnfoldPeople(query: string, limit: number): Promise<PersonResult[]> {
  const supabase = getAdminClient();
  const birthDate = parseEuropeanDateInput(query);
  let request = supabase
    .from("profiles")
    .select(
      "device_id, display_name, nickname, email, birth_date, birth_time, latitude, longitude, timezone, place_of_birth"
    )
    .not("birth_date", "is", null)
    .not("birth_time", "is", null)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .not("timezone", "is", null)
    .neq("timezone", "")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (birthDate) {
    request = request.eq("birth_date", birthDate);
  } else if (query) {
    const pattern = `%${query}%`;
    request = request.or(
      [
        `device_id.ilike.${pattern}`,
        `display_name.ilike.${pattern}`,
        `nickname.ilike.${pattern}`,
        `email.ilike.${pattern}`,
        `birth_date.ilike.${pattern}`,
      ].join(",")
    );
  }

  const { data, error } = await request;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const label =
      row.display_name?.trim() ||
      row.nickname?.trim() ||
      row.email?.trim() ||
      row.device_id;
    const birthDate = formatDate(row.birth_date);
    const birthTime = formatTime(row.birth_time);

    return {
      id: row.device_id,
      source: "unfold" as const,
      label,
      deviceId: row.device_id,
      birthDate,
      birthTime,
      city: row.place_of_birth ?? "",
      hasCompleteBirthData: summarizeBirthData({
        birthDate,
        birthTime,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        timezone: row.timezone ?? "",
      }),
    };
  });
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = request.nextUrl;
  const source = (searchParams.get("source") ?? "") as PeopleSource;
  const query = (searchParams.get("q") ?? "").trim();
  const limit = clampLimit(searchParams.get("limit"));

  if (!["mine", "astrolearn", "bubble", "unfold"].includes(source)) {
    return NextResponse.json(
      { error: "source must be mine, astrolearn, bubble, or unfold" },
      { status: 400 }
    );
  }

  const adminPersonId = process.env.ASTROLEARN_ADMIN_PERSON_ID
    ? Number(process.env.ASTROLEARN_ADMIN_PERSON_ID)
    : null;

  try {
    let people: PersonResult[];

    if (source === "mine") {
      people = await searchAstrolearnPeople(query, limit, adminPersonId);
    } else if (source === "astrolearn") {
      people = await searchAstrolearnPeople(query, limit, null);
    } else if (source === "bubble") {
      people = await searchBubblePeople(query, limit);
    } else {
      people = await searchUnfoldPeople(query, limit);
    }

    return NextResponse.json({ data: people.filter((p) => p.hasCompleteBirthData) });
  } catch (err) {
    console.error("[/api/astrolearn/admin/people]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
