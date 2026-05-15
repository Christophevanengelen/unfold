import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "astrolearn",
  user: "postgres",
  password: "L{3Agn/Ycr%[<~?XJ5zU",
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_events (
      id          SERIAL PRIMARY KEY,
      username    TEXT NOT NULL,
      event_date  TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT 'WORK',
      subcategory TEXT NOT NULL DEFAULT '',
      detail      TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

export async function GET(_req: NextRequest) {
  const cookieStore = await cookies();
  const username = cookieStore.get("astrolearn_session")?.value;
  if (!username) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await ensureTable();
    const { rows } = await pool.query(
      `SELECT id AS id_event, username AS id_user, event_date, category, subcategory, detail
       FROM user_events WHERE username = $1 ORDER BY event_date ASC`,
      [username]
    );
    return NextResponse.json({ data: rows });
  } catch (err) {
    console.error("[/api/astrolearn/events GET]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const username = cookieStore.get("astrolearn_session")?.value;
  if (!username) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    await ensureTable();
    const body = await req.json();
    const { event_date, category, subcategory, detail } = body;

    if (!event_date) return NextResponse.json({ error: "event_date required" }, { status: 400 });

    const { rows } = await pool.query(
      `INSERT INTO user_events (username, event_date, category, subcategory, detail)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id AS id_event, username AS id_user, event_date, category, subcategory, detail`,
      [username, event_date, category || "WORK", subcategory || "", detail || ""]
    );
    return NextResponse.json({ data: rows[0] });
  } catch (err) {
    console.error("[/api/astrolearn/events POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cookieStore = await cookies();
  const username = cookieStore.get("astrolearn_session")?.value;
  if (!username) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await pool.query(
      `DELETE FROM user_events WHERE id = $1 AND username = $2`,
      [id, username]
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/astrolearn/events DELETE]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
