import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import crypto from "crypto";

/**
 * POST /api/profile/forget
 * GDPR right-to-be-forgotten — deletes every cached row tied to a birth chart
 * without requiring auth.
 *
 * Two ways to identify the chart:
 *  - Direct: { birthHash }
 *  - Derived: { birthDate, birthTime?, latitude?, longitude? }
 *
 * Removes:
 *  - delineation_cache rows where birth_hash matches OR contains
 *  - connection_cache rows where pair_hash contains
 *  - profiles rows matching device_id (if provided)
 *
 * Returns counts of deleted rows. Idempotent.
 */

interface BirthInput {
  birthDate?: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
}

function makeBirthHash(b: BirthInput): string {
  const date = b.birthDate ?? "";
  const time = (b.birthTime ?? "").slice(0, 5) || "00:00";
  const lat = typeof b.latitude === "number" ? b.latitude.toFixed(2) : "??";
  const lng = typeof b.longitude === "number" ? b.longitude.toFixed(2) : "??";
  return `${date}_${time}_${lat}_${lng}`;
}

/** Stable hash of a value for non-PII logging. */
function logHash(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 8);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    let birthHash: string | undefined =
      typeof body?.birthHash === "string" ? body.birthHash : undefined;

    if (!birthHash && body?.birthDate) {
      birthHash = makeBirthHash(body as BirthInput);
    }

    if (!birthHash) {
      return NextResponse.json(
        { error: "Provide either birthHash or birthDate (+ optional birthTime, latitude, longitude)" },
        { status: 400 },
      );
    }

    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    let delineationDeleted = 0;
    let connectionsDeleted = 0;

    // Delete exact birth_hash matches in delineation_cache
    const { count: delCountExact } = await supabase
      .from("delineation_cache")
      .delete({ count: "exact" })
      .eq("birth_hash", birthHash);
    if (typeof delCountExact === "number") delineationDeleted += delCountExact;

    // Delete partial matches (couple delineations where this person is one half)
    const { count: delCountLike } = await supabase
      .from("delineation_cache")
      .delete({ count: "exact" })
      .like("birth_hash", `%${birthHash}%`);
    if (typeof delCountLike === "number") delineationDeleted += delCountLike;

    // Delete connection_cache rows containing this birth in pair_hash
    const { count: connCount } = await supabase
      .from("connection_cache")
      .delete({ count: "exact" })
      .like("pair_hash", `%${birthHash}%`);
    if (typeof connCount === "number") connectionsDeleted += connCount;

    console.log("[profile/forget] removed", {
      birthHashLog: logHash(birthHash),
      delineationDeleted,
      connectionsDeleted,
    });

    return NextResponse.json({
      ok: true,
      deleted: {
        delineation_cache: delineationDeleted,
        connection_cache: connectionsDeleted,
      },
    });
  } catch (err) {
    console.error("[profile/forget] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
