import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/**
 * POST /api/profile/upsert
 * Upserts the user's own profile (device_id scoped).
 *
 * Body: { deviceId, nickname?, displayName?, birthData }
 *   - birthData: { birthDate, birthTime, latitude, longitude, timezone, placeOfBirth }
 *
 * Why: supabase-js on the client has no service_role key (it's server-only),
 * so client-side calls to supabase.from(...).upsert() silently no-op. This
 * route is the server-side path for every profile write.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.deviceId || !body?.birthData?.birthDate) {
      return NextResponse.json({ error: "Missing deviceId or birthData" }, { status: 400 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const bd = body.birthData;
    const displayName = (body.displayName ?? body.nickname ?? bd.nickname ?? "").trim() || null;

    const { error } = await supabase.from("profiles").upsert(
      {
        device_id: body.deviceId,
        nickname: bd.nickname ?? displayName ?? null,
        display_name: displayName,
        birth_date: bd.birthDate,
        birth_time: bd.birthTime ?? null,
        latitude: typeof bd.latitude === "number" ? bd.latitude : null,
        longitude: typeof bd.longitude === "number" ? bd.longitude : null,
        timezone: bd.timezone ?? null,
        place_of_birth: bd.placeOfBirth ?? null,
      },
      { onConflict: "device_id" },
    );

    if (error) {
      console.error("[profile/upsert] supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile/upsert] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
