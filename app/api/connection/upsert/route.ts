import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";

/**
 * POST /api/connection/upsert
 * Add / update a connection owned by the caller device.
 *
 * Body: {
 *   deviceId,
 *   name, initial?, relationship,
 *   inviteCode,
 *   birthData?: { birthDate?, birthTime?, latitude?, longitude?, timezone?, placeOfBirth? }
 * }
 *
 * Uses (owner_device_id, invite_code) unique constraint for upsert.
 */
async function handlePost(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.deviceId || !body?.name || !body?.relationship || !body?.inviteCode) {
      return NextResponse.json(
        { error: "Missing deviceId, name, relationship, or inviteCode" },
        { status: 400 },
      );
    }
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    // Ensure owner profile exists (FK constraint)
    const { error: profileErr } = await supabase
      .from("profiles")
      .upsert({ device_id: body.deviceId }, { onConflict: "device_id", ignoreDuplicates: true });
    if (profileErr) {
      console.warn("[connection/upsert] profile ensure error:", profileErr.message);
    }

    const bd = body.birthData ?? {};
    const code = String(body.inviteCode).trim().toUpperCase();
    const initial = (body.initial ?? String(body.name).charAt(0)).toUpperCase();

    const { error } = await supabase
      .from("connections")
      .upsert(
        {
          owner_device_id: body.deviceId,
          name: body.name,
          initial,
          relationship: body.relationship,
          invite_code: code,
          birth_date: bd.birthDate ?? null,
          birth_time: bd.birthTime ?? null,
          latitude: typeof bd.latitude === "number" ? bd.latitude : null,
          longitude: typeof bd.longitude === "number" ? bd.longitude : null,
          timezone: bd.timezone ?? null,
          place_of_birth: bd.placeOfBirth ?? null,
        },
        { onConflict: "owner_device_id,invite_code" },
      );

    if (error) {
      console.error("[connection/upsert] supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[connection/upsert] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/connection/upsert — update relationship or name for a given invite_code.
 * Body: { deviceId, inviteCode, relationship?, name? }
 */
async function handlePatch(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body?.deviceId || !body?.inviteCode) {
      return NextResponse.json({ error: "Missing deviceId or inviteCode" }, { status: 400 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }

    const patch: Record<string, string> = {};
    if (body.relationship) patch.relationship = body.relationship;
    if (body.name) {
      patch.name = body.name;
      patch.initial = String(body.name).charAt(0).toUpperCase();
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: true });
    }

    const code = String(body.inviteCode).trim().toUpperCase();
    const { error } = await supabase
      .from("connections")
      .update(patch)
      .eq("owner_device_id", body.deviceId)
      .eq("invite_code", code);

    if (error) {
      console.error("[connection/upsert PATCH] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[connection/upsert PATCH] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/connection/upsert?deviceId=...&inviteCode=...
 */
async function handleDelete(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const deviceId = url.searchParams.get("deviceId");
    const inviteCode = url.searchParams.get("inviteCode");
    if (!deviceId || !inviteCode) {
      return NextResponse.json({ error: "Missing deviceId or inviteCode" }, { status: 400 });
    }
    if (!supabase) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    }
    const code = inviteCode.trim().toUpperCase();
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("owner_device_id", deviceId)
      .eq("invite_code", code);
    if (error) {
      console.error("[connection/upsert DELETE] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[connection/upsert DELETE] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// Les en-tetes CORS doivent etre sur la reponse REELLE, pas seulement sur le
// preflight : sans eux le navigateur jette le resultat malgre un preflight
// accepte. C est ce qui empechait l app d enregistrer les profils.
export const POST = corsHandler(handlePost);
export const PATCH = corsHandler(handlePatch);
export const DELETE = corsHandler(handleDelete);
