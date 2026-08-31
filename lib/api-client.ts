/**
 * Centralized API base resolver for hybrid web + Capacitor native.
 *
 * Web (server-rendered): use relative paths → Next.js handles routing.
 * Capacitor (static bundle): no local server → call Vercel directly with Bearer JWT.
 *
 * Usage:
 *   const res = await apiFetch("/api/openai/personalize", { method: "POST", body });
 */

import { isNative } from "@/lib/platform";
import { supabaseAuth } from "@/lib/supabase-auth";

// Domaine du serveur appele par l app quand elle tourne en natif.
// Configurable au build : NEXT_PUBLIC_API_BASE.
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "https://favorable.day";

export function getApiBase(): string {
  return isNative() ? API_BASE : "";
}

/** Adds Bearer token from Supabase session when running in Capacitor. */
async function getAuthHeaders(): Promise<Record<string, string>> {
  if (!isNative()) return {};
  if (!supabaseAuth) return {};
  const { data } = await supabaseAuth.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBase();
  const authHeaders = await getAuthHeaders();
  return fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init?.headers ?? {}),
    },
  });
}
