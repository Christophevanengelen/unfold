/**
 * Client-side Supabase sync layer.
 *
 * IMPORTANT: The Supabase JS client (lib/db.ts) uses SUPABASE_SERVICE_ROLE_KEY,
 * which is a server-only env var (no NEXT_PUBLIC_ prefix). In the browser the
 * service-role key is undefined, so supabase-js has no credentials and any
 * direct `.from(...).upsert(...)` is a silent no-op.
 *
 * Every write in this file therefore goes through a server-side API route
 * (`/api/profile/upsert`, `/api/invite/register`, `/api/connection/upsert`)
 * that holds the service role. Reads still go through supabase-js because
 * the app already does them in Server Components / route handlers.
 */

import { supabase } from "@/lib/db";
import { getDeviceId } from "@/lib/device-id";
import type { BirthData } from "@/lib/birth-data";

// ─── Utilities ──────────────────────────────────────────

async function postJson(path: string, body: unknown): Promise<boolean> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const info = await res.text().catch(() => "");
      console.warn(`[supabase-store] ${path} failed`, res.status, info.slice(0, 120));
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[supabase-store] ${path} network error:`, err);
    return false;
  }
}

// ─── Profiles ────────────────────────────────────────────

export async function upsertProfile(birth: BirthData): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  await postJson("/api/profile/upsert", {
    deviceId,
    displayName: birth.nickname,
    birthData: birth,
  });
}

/** Update the user's display name (shown to their connections). */
export async function upsertDisplayName(displayName: string): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  // Reuse upsert endpoint with just a displayName + empty birthData guard.
  // The route requires birthData.birthDate, so read it back from supabase — OR:
  // we call the endpoint only when the profile already has birthData (normal case).
  // Here we short-circuit with a lightweight update via a dedicated call path.
  await postJson("/api/profile/upsert", {
    deviceId,
    displayName,
    // Minimal birthData stub — server will only update display_name if this is
    // provided, but our current route expects birthData.birthDate. Rather than
    // fail, we pull it from localStorage if available.
    birthData: (() => {
      if (typeof window === "undefined") return null;
      try {
        const raw = localStorage.getItem("unfold_birth_data");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })(),
  });
}

// Read path — runs in Server Components too; falls back to direct supabase when available.
export async function getProfile(): Promise<BirthData | null> {
  if (!supabase) return null;
  const deviceId = getDeviceId();
  if (!deviceId) return null;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("device_id", deviceId)
      .maybeSingle();

    if (!data?.birth_date) return null;

    return {
      nickname: data.nickname ?? "",
      birthDate: data.birth_date,
      birthTime: data.birth_time ?? "",
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
      timezone: data.timezone ?? "Europe/Paris",
      placeOfBirth: data.place_of_birth ?? "",
    };
  } catch {
    return null;
  }
}

// ─── Auth linking (Phase 2 stubs) ───────────────────────
// See /Users/jhondoe/.claude/plans/streamed-tumbling-moon.md — "Out of scope".

/** @phase-2 */
export async function linkProfileToAuth(_authUserId: string): Promise<void> {
  return;
}

/** @phase-2 */
export async function getProfileByAuthId(
  _authUserId: string,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<Record<string, any> | null> {
  return null;
}

// ─── Connections ─────────────────────────────────────────

export interface SupabaseConnection {
  id: string;
  name: string;
  initial: string;
  relationship: string;
  birth_date: string | null;
  birth_time: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  place_of_birth: string | null;
  invite_code: string;
  connected_since: string;
}

export async function getRemoteConnections(): Promise<SupabaseConnection[]> {
  if (!supabase) return [];
  const deviceId = getDeviceId();
  if (!deviceId) return [];

  try {
    const { data } = await supabase
      .from("connections")
      .select("*")
      .eq("owner_device_id", deviceId)
      .order("connected_since", { ascending: false });

    return (data ?? []) as SupabaseConnection[];
  } catch {
    return [];
  }
}

export async function addRemoteConnection(conn: {
  name: string;
  initial: string;
  relationship: string;
  birthData?: BirthData;
  inviteCode: string;
}): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  await postJson("/api/connection/upsert", {
    deviceId,
    name: conn.name,
    initial: conn.initial,
    relationship: conn.relationship,
    inviteCode: conn.inviteCode,
    birthData: conn.birthData ?? null,
  });
}

export async function updateRemoteRelationship(
  inviteCode: string,
  relationship: string,
): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  try {
    await fetch("/api/connection/upsert", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, inviteCode, relationship }),
    });
  } catch (err) {
    console.warn("[supabase-store] updateRemoteRelationship failed:", err);
  }
}

export async function renameRemoteConnection(
  inviteCode: string,
  name: string,
  _initial: string,
): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  try {
    await fetch("/api/connection/upsert", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, inviteCode, name }),
    });
  } catch (err) {
    console.warn("[supabase-store] renameRemoteConnection failed:", err);
  }
}

export async function removeRemoteConnection(inviteCode: string): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  try {
    const url = `/api/connection/upsert?deviceId=${encodeURIComponent(
      deviceId,
    )}&inviteCode=${encodeURIComponent(inviteCode)}`;
    await fetch(url, { method: "DELETE" });
  } catch (err) {
    console.warn("[supabase-store] removeRemoteConnection failed:", err);
  }
}

// ─── Invite Codes ────────────────────────────────────────

export async function persistInviteCode(code: string): Promise<void> {
  const deviceId = getDeviceId();
  if (!deviceId) return;
  await postJson("/api/invite/register", { deviceId, code });
}

export async function lookupInviteCode(code: string): Promise<{
  name: string;
  birthData: BirthData;
} | null> {
  try {
    const res = await fetch("/api/invite/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) return null;
    return (await res.json()) as { name: string; birthData: BirthData };
  } catch {
    return null;
  }
}
