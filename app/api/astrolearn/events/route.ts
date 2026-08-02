import { NextRequest, NextResponse } from "next/server";
import { getAstrolearnPool } from "@/lib/astrolearn-db";
import {
  AstrologySubjectError,
  resolveAstrologySubject,
} from "@/lib/astrology-subject";

const EVENT_SELECT = `
  SELECT
    id_event,
    id_user::text AS id_user,
    TO_CHAR(event_date, 'YYYYMMDD') AS event_date,
    category,
    subcategory,
    detail
  FROM person_event
`;

async function resolvePersonId(subject: {
  eventsPersonId: number | null;
  eventsUsername: string | null;
}): Promise<number | null> {
  if (subject.eventsPersonId) {
    return subject.eventsPersonId;
  }

  if (!subject.eventsUsername) {
    return null;
  }

  const pool = getAstrolearnPool();
  const { rows } = await pool.query<{ id_person: number }>(
    `SELECT id_person
     FROM person
     WHERE username = $1 OR login = $1
     LIMIT 1`,
    [subject.eventsUsername]
  );
  return rows[0]?.id_person ?? null;
}

function normalizeEventDate(raw: string): string | null {
  const compact = raw.replace(/-/g, "");
  if (!/^\d{8}$/.test(compact)) return null;

  const iso = `${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`;
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.toISOString().slice(0, 10) !== iso) return null;

  return iso;
}

export async function GET(_req: NextRequest) {
  try {
    const subject = await resolveAstrologySubject();
    if (!subject.supportsEvents) {
      return NextResponse.json({ data: [] });
    }

    const idPerson = await resolvePersonId(subject);
    if (!idPerson) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const pool = getAstrolearnPool();
    const { rows } = await pool.query(
      `${EVENT_SELECT}
       WHERE id_person = $1
       ORDER BY event_date ASC`,
      [idPerson]
    );
    return NextResponse.json({ data: rows });
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/events GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const subject = await resolveAstrologySubject();
    if (!subject.supportsEvents) {
      return NextResponse.json(
        { error: "Life events are only available for AstroLearn users" },
        { status: 403 }
      );
    }

    const idPerson = await resolvePersonId(subject);
    if (!idPerson) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { event_date, category, subcategory, detail, rating } = body;
    if (!event_date) return NextResponse.json({ error: "event_date required" }, { status: 400 });

    const normalizedDate = normalizeEventDate(String(event_date));
    if (!normalizedDate) {
      return NextResponse.json({ error: "event_date not valid" }, { status: 400 });
    }

    const pool = getAstrolearnPool();
    const { rows } = await pool.query(
      `INSERT INTO person_event (id_user, id_person, event_date, category, subcategory, detail, rating)
       VALUES ($1, $2, $3::date, $4, $5, $6, $7)
       RETURNING
         id_event,
         id_user::text AS id_user,
         TO_CHAR(event_date, 'YYYYMMDD') AS event_date,
         category,
         subcategory,
         detail`,
      [
        idPerson,
        idPerson,
        normalizedDate,
        category || "WORK",
        subcategory || "",
        detail || "",
        rating || "A",
      ]
    );
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/events POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const subject = await resolveAstrologySubject();
    if (!subject.supportsEvents) {
      return NextResponse.json(
        { error: "Life events are only available for AstroLearn users" },
        { status: 403 }
      );
    }

    const idPerson = await resolvePersonId(subject);
    if (!idPerson) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const pool = getAstrolearnPool();
    await pool.query(`DELETE FROM person_event WHERE id_event = $1 AND id_person = $2`, [
      id,
      idPerson,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/events DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
