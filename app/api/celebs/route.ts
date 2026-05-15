import { NextResponse } from "next/server";
import { Pool } from "pg";

// Direct connection to the astrolearn DB — credentials confirmed working
const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "astrolearn",
  user: "postgres",
  password: "L{3Agn/Ycr%[<~?XJ5zU",
});

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        id_person,
        TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) AS name,
        birthdate,
        birthtime,
        latitude,
        longitude,
        timezone,
        city
      FROM person
      WHERE is_public_profile_active = true
      ORDER BY first_name, last_name
    `);

    const celebs = rows.map((r) => {
      // birthdate is a JS Date from pg driver → format as YYYY-MM-DD
      const date =
        r.birthdate instanceof Date
          ? r.birthdate.toISOString().split("T")[0]
          : String(r.birthdate ?? "").split("T")[0];

      // birthtime is "HH:mm:ss" → keep HH:mm
      const time = String(r.birthtime ?? "").slice(0, 5);

      return {
        id: r.id_person,
        name: String(r.name ?? "").trim(),
        date,
        time,
        lat: parseFloat(r.latitude) || 0,
        lng: parseFloat(r.longitude) || 0,
        tz: r.timezone ?? "UTC",
        city: r.city ?? "",
      };
    });

    return NextResponse.json(celebs);
  } catch (err) {
    console.error("[/api/celebs] DB error:", err);
    return NextResponse.json({ error: "Failed to load celebrities" }, { status: 500 });
  }
}
