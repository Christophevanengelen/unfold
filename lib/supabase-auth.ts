/**
 * Browser-side Supabase client for Auth.
 * Uses the anon key (safe for client-side).
 * Separate from lib/db.ts which uses service_role for server-side ops.
 */

import { createClient, type User, type AuthChangeEvent, type Session } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseAuth = url && anonKey && anonKey !== "PASTE_YOUR_ANON_KEY_HERE"
  ? createClient(url, anonKey)
  : null;

export async function signUp(email: string, password: string) {
  if (!supabaseAuth) throw new Error("Supabase not configured");
  const { data, error } = await supabaseAuth.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  if (!supabaseAuth) throw new Error("Supabase not configured");
  const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabaseAuth) return;
  await supabaseAuth.auth.signOut();
}

export async function getSession() {
  if (!supabaseAuth) return null;
  const { data } = await supabaseAuth.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  if (!supabaseAuth) return null;
  const { data } = await supabaseAuth.auth.getUser();
  return data.user;
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  if (!supabaseAuth) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabaseAuth.auth.onAuthStateChange(callback);
}
