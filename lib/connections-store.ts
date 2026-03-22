/**
 * Connections Store — dual-write: localStorage (instant) + Supabase (persistent).
 * Each connection = a person with birth data, linked via invite code.
 */

import type { BirthData } from "@/lib/birth-data";
import {
  addRemoteConnection,
  updateRemoteRelationship,
  removeRemoteConnection,
  getRemoteConnections,
  persistInviteCode,
  type SupabaseConnection,
} from "@/lib/supabase-store";

export type RelationshipType = "partner" | "friend" | "family" | "colleague";

export interface RealConnection {
  id: string;
  name: string;
  initial: string;
  relationship: RelationshipType;
  birthData: BirthData;
  connectedSince: string; // ISO date
  inviteCode: string;
}

const STORAGE_KEY = "unfold_connections";

function readAll(): RealConnection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(connections: RealConnection[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}

export function getConnections(): RealConnection[] {
  return readAll();
}

export function getConnection(id: string): RealConnection | null {
  return readAll().find((c) => c.id === id) ?? null;
}

export function getConnectionByCode(code: string): RealConnection | null {
  return readAll().find((c) => c.inviteCode === code) ?? null;
}

export function addConnection(conn: Omit<RealConnection, "id" | "initial" | "connectedSince">): RealConnection {
  const all = readAll();

  // Don't add duplicates (same invite code)
  const existing = all.find((c) => c.inviteCode === conn.inviteCode);
  if (existing) return existing;

  const newConn: RealConnection = {
    ...conn,
    id: `conn_${Date.now()}`,
    initial: conn.name.charAt(0).toUpperCase(),
    connectedSince: new Date().toISOString(),
  };

  all.push(newConn);
  writeAll(all);

  // Dual-write to Supabase (fire-and-forget)
  addRemoteConnection({
    name: newConn.name,
    initial: newConn.initial,
    relationship: newConn.relationship,
    birthData: newConn.birthData,
    inviteCode: newConn.inviteCode,
  }).catch(() => {});

  return newConn;
}

export function updateRelationship(id: string, relationship: RelationshipType): void {
  const all = readAll();
  const conn = all.find((c) => c.id === id);
  if (conn) {
    conn.relationship = relationship;
    writeAll(all);
    // Dual-write
    updateRemoteRelationship(conn.inviteCode, relationship).catch(() => {});
  }
}

export function removeConnection(id: string): void {
  const all = readAll();
  const conn = all.find((c) => c.id === id);
  if (conn) {
    writeAll(all.filter((c) => c.id !== id));
    // Dual-write
    removeRemoteConnection(conn.inviteCode).catch(() => {});
  }
}

/**
 * Generate an invite code for the current user.
 * Format: UNFOLD-XXXX (4 random alphanumeric chars)
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `UNFOLD-${code}`;
}

const MY_CODE_KEY = "unfold_my_invite_code";

export function getMyInviteCode(): string {
  if (typeof window === "undefined") return "UNFOLD-XXXX";
  let code = localStorage.getItem(MY_CODE_KEY);
  if (!code) {
    code = generateInviteCode();
    localStorage.setItem(MY_CODE_KEY, code);
  }
  // Persist to Supabase (fire-and-forget)
  persistInviteCode(code).catch(() => {});
  return code;
}

/**
 * Sync local connections with Supabase (background, non-blocking).
 * Merges remote connections that don't exist locally.
 */
export async function syncConnections(): Promise<void> {
  try {
    const local = readAll();
    const remote = await getRemoteConnections();

    let changed = false;
    for (const r of remote) {
      if (!local.some((l) => l.inviteCode === r.invite_code)) {
        local.push(remoteToLocal(r));
        changed = true;
      }
    }
    if (changed) writeAll(local);
  } catch {
    // Sync failed silently
  }
}

function remoteToLocal(r: SupabaseConnection): RealConnection {
  return {
    id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: r.name,
    initial: r.initial ?? r.name.charAt(0).toUpperCase(),
    relationship: r.relationship as RelationshipType,
    birthData: {
      nickname: r.name,
      birthDate: r.birth_date ?? "",
      birthTime: r.birth_time ?? "",
      latitude: r.latitude ?? 0,
      longitude: r.longitude ?? 0,
      timezone: r.timezone ?? "Europe/Paris",
      placeOfBirth: r.place_of_birth ?? "",
    },
    connectedSince: r.connected_since,
    inviteCode: r.invite_code,
  };
}

/**
 * Encode birth data into a shareable invite URL.
 */
export function buildInviteUrl(name: string, birthData: BirthData, code: string): string {
  const params = new URLSearchParams({
    name,
    code,
    bd: birthData.birthDate,
    bt: birthData.birthTime,
    lat: String(birthData.latitude),
    lng: String(birthData.longitude),
    tz: birthData.timezone,
    place: birthData.placeOfBirth || "",
  });
  const origin = typeof window !== "undefined" ? window.location.origin : "https://unfold.app";
  return `${origin}/demo/invite/join?${params.toString()}`;
}

/**
 * Decode invite URL params into connection data.
 */
export function parseInviteParams(params: URLSearchParams): {
  name: string;
  code: string;
  birthData: BirthData;
} | null {
  const name = params.get("name");
  const code = params.get("code");
  const bd = params.get("bd");
  const bt = params.get("bt");
  const lat = params.get("lat");
  const lng = params.get("lng");
  const tz = params.get("tz");

  if (!name || !code || !bd || !bt || !lat || !lng || !tz) return null;

  return {
    name,
    code,
    birthData: {
      nickname: name,
      birthDate: bd,
      birthTime: bt,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      timezone: tz,
      placeOfBirth: params.get("place") || "",
    },
  };
}
