import { NextResponse } from "next/server";
import { Pool } from "pg";

/**
 * Connexion a la base astrolearn.
 *
 * ─── POURQUOI CE FICHIER A CHANGE LE 02/09/2026 ────────────────────────────
 *
 * Le mot de passe Postgres etait ecrit ici EN CLAIR, et ce depot est PUBLIC.
 * Il etait donc lisible par n importe qui, et il l est encore dans l historique
 * git — le retirer du fichier ne le retire pas des commits passes.
 *
 * **Ce mot de passe doit etre considere comme compromis et change.** Le
 * supprimer d ici ferme la porte pour la suite ; il reste a tourner la clef.
 *
 * La chaine vient desormais de l environnement. Sans elle, la route refuse au
 * lieu de tenter une connexion avec des identifiants devines.
 */
const CHAINE = process.env.ASTROLEARN_DATABASE_URL?.trim();

const pool = CHAINE ? new Pool({ connectionString: CHAINE }) : null;

export async function GET() {
  if (!pool) {
    // Pas de chaine de connexion : on le dit, on ne devine pas.
    return NextResponse.json(
      { ok: false, raison: "base_non_configuree" },
      { status: 503 },
    );
  }
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
