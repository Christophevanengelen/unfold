/**
 * Connections Store — persists real connections in localStorage.
 * Each connection = a person with birth data, linked via invite code.
 * No mocks — only real data from invite flow.
 */

import type { BirthData } from "@/lib/birth-data";

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
  return newConn;
}

export function updateRelationship(id: string, relationship: RelationshipType): void {
  const all = readAll();
  const conn = all.find((c) => c.id === id);
  if (conn) {
    conn.relationship = relationship;
    writeAll(all);
  }
}

export function removeConnection(id: string): void {
  writeAll(readAll().filter((c) => c.id !== id));
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
  return code;
}

/**
 * Encode birth data into a shareable invite URL.
 * The URL contains everything needed to create a connection.
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
  // Use current origin for the URL
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
