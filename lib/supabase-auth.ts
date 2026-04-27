/**
 * Browser-side Supabase client for Auth.
 * Uses the anon key (safe for client-side).
 * Separate from lib/db.ts which uses service_role for server-side ops.
 */

import { createClient, type User, type AuthChangeEvent, type Session } from "@supabase/supabase-js";
import { detectLocale } from "@/lib/i18n-demo";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseAuth = url && anonKey && anonKey !== "PASTE_YOUR_ANON_KEY_HERE"
  ? createClient(url, anonKey)
  : null;

/**
 * Send the magic-link sign-in email. Locale is auto-detected and stored in
 * user metadata so:
 *   - Future Supabase email templates can branch on `user.user_metadata.locale`
 *   - Welcome emails (Resend) can render in the right language
 *   - Stripe Customer preferred_locales picks it up on first checkout
 *
 * Supabase's built-in OTP email is not yet locale-templated by us — needs
 * dashboard-side template per locale (see launch-playbook.md).
 */
export async function signInWithMagicLink(email: string, redirectTo?: string) {
  if (!supabaseAuth) throw new Error("Supabase not configured");
  const locale = detectLocale();
  const destination = redirectTo ?? (typeof window !== "undefined"
    ? `${window.location.origin}/auth/callback?locale=${locale}`
    : `https://unfold-nine.vercel.app/auth/callback?locale=${locale}`);
  const { error } = await supabaseAuth.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: destination,
      data: { locale },                                 // attached to user metadata
    },
  });
  if (error) throw error;
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
