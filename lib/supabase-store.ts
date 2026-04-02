/**
 * Supabase persistence layer — profiles, connections, invite codes.
 * Uses device_id as anonymous ownership key (no auth required).
 * All operations are fire-and-forget safe (failures logged, not thrown).
 */

import { supabase } from "@/lib/db";
import { getDeviceId } from "@/lib/device-id";
import type { BirthData } from "@/lib/birth-data";

// ─── Profiles ────────────────────────────────────────────

export async function upsertProfile(birth: BirthData): Promise<void> {
  if (!supabase) return;
  const deviceId = getDeviceId();
  if (!deviceId) return;

  try {
    await supabase.from("profiles").upsert(
      {
        device_id: deviceId,
        nickname: birth.nickname,
        birth_date: birth.birthDate,
        birth_time: birth.birthTime,
        latitude: birth.latitude,
        longitude: birth.longitude,
        timezone: birth.timezone,
        place_of_birth: birth.placeOfBirth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "device_id" }
    );
  } catch (err) {
    console.warn("[supabase-store] upsertProfile failed:", err);
  }
}

export async function getProfile(): Promise<BirthData | null> {
  if (!supabase) return null;
  const deviceId = getDeviceId();
  if (!deviceId) return null;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("device_id", deviceId)
      .single();

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

// ─── Auth linking ───────────────────────────────────────

/** Link the current device's profile to a Supabase Auth user */
export async function linkProfileToAuth(authUserId: string): Promise<void> {
  if (!supabase) return;
  const deviceId = getDeviceId();
  if (!deviceId) return;

  try {
    await supabase
      .from("profiles")
      .update({ auth_user_id: authUserId, updated_at: new Date().toISOString() })
      .eq("device_id", deviceId);
  } catch (err) {
    console.warn("[supabase-store] linkProfileToAuth failed:", err);
  }
}

/** Get a profile by auth user ID (for sign-in recovery) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getProfileByAuthId(authUserId: string): Promise<Record<string, any> | null> {
  if (!supabase) return null;

  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();
    return data;
  } catch {
    return null;
  }
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
  if (!supabase) return;
  const deviceId = getDeviceId();
  if (!deviceId) return;

  // Ensure profile exists first
  await ensureProfile();

  try {
    await supabase.from("connections").insert({
      owner_device_id: deviceId,
      name: conn.name,
      initial: conn.initial,
      relationship: conn.relationship,
      birth_date: conn.birthData?.birthDate ?? null,
      birth_time: conn.birthData?.birthTime ?? null,
      latitude: conn.birthData?.latitude ?? null,
      longitude: conn.birthData?.longitude ?? null,
      timezone: conn.birthData?.timezone ?? null,
      place_of_birth: conn.birthData?.placeOfBirth ?? null,
      invite_code: conn.inviteCode,
    });
  } catch (err) {
    console.warn("[supabase-store] addRemoteConnection failed:", err);
  }
}

export async function updateRemoteRelationship(
  inviteCode: string,
  relationship: string
): Promise<void> {
  if (!supabase) return;
  const deviceId = getDeviceId();
  if (!deviceId) return;

  try {
    await supabase
      .from("connections")
      .update({ relationship })
      .eq("owner_device_id", deviceId)
      .eq("invite_code", inviteCode);
  } catch (err) {
    console.warn("[supabase-store] updateRemoteRelationship failed:", err);
  }
}

export async function removeRemoteConnection(inviteCode: string): Promise<void> {
  if (!supabase) return;
  const deviceId = getDeviceId();
  if (!deviceId) return;

  try {
    await supabase
      .from("connections")
      .delete()
      .eq("owner_device_id", deviceId)
      .eq("invite_code", inviteCode);
  } catch (err) {
    console.warn("[supabase-store] removeRemoteConnection failed:", err);
  }
}

// ─── Invite Codes ────────────────────────────────────────

export async function persistInviteCode(code: string): Promise<void> {
  if (!supabase) return;
  const deviceId = getDeviceId();
  if (!deviceId) return;

  await ensureProfile();

  try {
    // Also store on profile
    await supabase
      .from("profiles")
      .update({ invite_code: code })
      .eq("device_id", deviceId);

    // Store in invite_codes table
    await supabase.from("invite_codes").upsert(
      { code, owner_device_id: deviceId },
      { onConflict: "code" }
    );
  } catch (err) {
    console.warn("[supabase-store] persistInviteCode failed:", err);
  }
}

export async function lookupInviteCode(code: string): Promise<{
  name: string;
  birthData: BirthData;
} | null> {
  if (!supabase) return null;

  try {
    // Find the invite code owner
    const { data: codeData } = await supabase
      .from("invite_codes")
      .select("owner_device_id")
      .eq("code", code)
      .single();

    if (!codeData) return null;

    // Get their profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("device_id", codeData.owner_device_id)
      .single();

    if (!profile?.birth_date) return null;

    return {
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
    };
  } catch {
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────

async function ensureProfile(): Promise<void> {
  if (!supabase) return;
  const deviceId = getDeviceId();
  if (!deviceId) return;

  try {
    await supabase.from("profiles").upsert(
      { device_id: deviceId },
      { onConflict: "device_id" }
    );
  } catch {
    // Profile may already exist
  }
}
