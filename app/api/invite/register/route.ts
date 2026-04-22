import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/**
 * POST /api/invite/register
 * Persists the caller's invite code (server-side, uses service_role).
 *
 * Body: { deviceId, code }
 *
 * Idempotent — safe to call on every getMyInviteCode(). Ensures both
 * `invite_codes` row and `profiles.invite_code` are up to date so validate
 * lookups work no matter which table is queried.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const deviceId: string | undefined = body?.deviceId;
    const rawCode: unknown = body?.code;
    const code = typeof rawCode === "string" ? rawCode.trim().toUpperCase() : "";

    if (!deviceId || !code) {
      return NextResponse.json({ error: "Missing deviceId or code" }, { status: 400 });
    }
    if (!/^UNFOLD-[A-Z0-9]{4}$/.test(code)) {
      return NextResponse.json({ error: "Invalid code shape" }, { status: 400 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // Ensure a profile row exists so the FK constraint on invite_codes is satisfied
    const { error: profileErr } = await supabase
      .from("profiles")
      .upsert({ device_id: deviceId }, { onConflict: "device_id", ignoreDuplicates: true });
    if (profileErr) {
      console.warn("[invite/register] profile ensure error:", profileErr.message);
    }

    // Write the code to the profile (primary path used by lookups)
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ invite_code: code })
      .eq("device_id", deviceId);
    if (updateErr) {
      console.warn("[invite/register] profile.invite_code update error:", updateErr.message);
    }

    // Write to invite_codes (canonical lookup table)
    const { error: codeErr } = await supabase
      .from("invite_codes")
      .upsert({ code, owner_device_id: deviceId }, { onConflict: "code" });
    if (codeErr) {
      console.error("[invite/register] invite_codes error:", codeErr.message);
      return NextResponse.json({ error: codeErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[invite/register] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
