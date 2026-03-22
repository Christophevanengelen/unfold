import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // Look up invite code
    const { data: codeData } = await supabase
      .from("invite_codes")
      .select("owner_device_id, claimed_by_device_id")
      .eq("code", code.toUpperCase())
      .single();

    if (!codeData) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 });
    }

    // Get owner profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, birth_date, birth_time, latitude, longitude, timezone, place_of_birth")
      .eq("device_id", codeData.owner_device_id)
      .single();

    if (!profile?.birth_date) {
      return NextResponse.json({ error: "Owner has no birth data" }, { status: 404 });
    }

    return NextResponse.json({
      name: profile.nickname ?? "Unknown",
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
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
