import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";

/**
 * POST /api/profile/link-auth
 *
 * Called client-side after a magic-link sign-in (onAuthStateChange fires SIGNED_IN).
 * Links the device_id profile row to the authenticated user's auth.users ID.
 *
 * Body: { deviceId: string }
 * Auth: Bearer JWT from supabaseAuth session (or cookie session on web)
 */
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  let body: { deviceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const { deviceId } = body;
  if (!deviceId) {
    return NextResponse.json({ error: "deviceId required" }, { status: 400 });
  }

  const db = getAdminClient();

  // Set auth_user_id on the profile row for this device
  const { error: profileErr } = await db
    .from("profiles")
    .update({ auth_user_id: userId })
    .eq("device_id", deviceId)
    .is("auth_user_id", null); // only update if not already linked to another account

  if (profileErr) {
    console.error("[profile/link-auth] update error:", profileErr.message);
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  // Also push device_id into device_ids array (for cross-device lookup)
  await db.rpc("append_device_id", { p_user_id: userId, p_device_id: deviceId }).then(
    ({ error }) => error && console.warn("[profile/link-auth] append_device_id:", error.message)
  );

  return NextResponse.json({ ok: true });
}
