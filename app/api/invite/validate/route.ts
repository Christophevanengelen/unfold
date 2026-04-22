import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/**
 * POST /api/invite/validate
 * Resolves an invite code to its owner's birth data.
 *
 * Lookup path:
 *  1. invite_codes.code → owner_device_id → profiles
 *  2. FALLBACK: profiles.invite_code directly (handles legacy/half-persisted state)
 *
 * Responses:
 *   200 — { name, birthData }
 *   404 — code not found, or owner has no birth_date
 *   503 — supabase unreachable
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const raw = (body?.code ?? "") as string;
    const code = typeof raw === "string" ? raw.trim().toUpperCase() : "";
    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // Primary lookup — via invite_codes
    let ownerDeviceId: string | undefined;
    {
      const { data } = await supabase
        .from("invite_codes")
        .select("owner_device_id")
        .eq("code", code)
        .maybeSingle();
      if (data?.owner_device_id) ownerDeviceId = data.owner_device_id;
    }

    // Fallback lookup — via profiles.invite_code (if invite_codes row is missing)
    if (!ownerDeviceId) {
      const { data } = await supabase
        .from("profiles")
        .select("device_id")
        .eq("invite_code", code)
        .maybeSingle();
      if (data?.device_id) ownerDeviceId = data.device_id;
    }

    if (!ownerDeviceId) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "nickname, display_name, birth_date, birth_time, latitude, longitude, timezone, place_of_birth",
      )
      .eq("device_id", ownerDeviceId)
      .maybeSingle();

    if (!profile?.birth_date) {
      return NextResponse.json(
        { error: "Owner has no birth data" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      name: profile.display_name ?? profile.nickname ?? "Unknown",
      birthData: {
        nickname: profile.nickname ?? "",
        birthDate: profile.birth_date,
        birthTime: profile.birth_time ?? "",
        latitude: profile.latitude ?? 0,
        longitude: profile.longitude ?? 0,
        timezone: profile.timezone ?? "Europe/Paris",
        placeOfBirth: profile.place_of_birth ?? "",
      },
    });
  } catch (err) {
    console.error("[invite/validate] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
