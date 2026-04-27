import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase server clients.
 *
 *  - `getAdminClient()` : service-role client. Use ONLY in server-side route
 *    handlers / cron / webhooks. Bypasses RLS. Throws if env vars missing.
 *
 *  - `getUserClient()` : cookie-aware anon client that resolves `auth.uid()`
 *    in RLS policies. Use in route handlers that act on behalf of the
 *    authenticated user (entitlement checks, profile reads, etc).
 *
 *  - `supabase` (legacy) : memoized admin client kept for backwards compat
 *    with the 10 existing importers. Same as `getAdminClient()`. Returns
 *    `null` if env vars missing so existing `if (!supabase) return` guards
 *    keep working without crashes (vs the old `null!` non-null assertion
 *    that crashed at usage time).
 */

let _cachedAdmin: SupabaseClient | null = null;

function readAdminEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function getAdminClient(): SupabaseClient {
  if (_cachedAdmin) return _cachedAdmin;
  const env = readAdminEnv();
  if (!env) {
    throw new Error(
      "[db] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  _cachedAdmin = createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _cachedAdmin;
}

/**
 * Cookie-aware Supabase client for routes that need `auth.uid()`.
 * Reads/writes Supabase auth cookies via Next.js `cookies()` API.
 *
 * Usage:
 *   const supabase = await getUserClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export async function getUserClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "[db] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  // Lazy-import next/headers — only valid in Server Components / route handlers.
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options });
          });
        } catch {
          // setAll throws when called from a Server Component (read-only).
          // Route handlers + Server Actions can write; ignore otherwise.
        }
      },
    },
  }) as SupabaseClient;
}

/**
 * Validate a Bearer JWT (mobile / cross-origin) and return the user.
 * Server-roundtrip checks revocation; never trust raw JWT decode.
 *
 * Usage:
 *   const user = await getUserFromBearer(request.headers.get('authorization'));
 *   if (!user) return new Response('unauthorized', { status: 401 });
 */
export async function getUserFromBearer(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const admin = getAdminClient();
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

// ─── Backwards-compat alias (legacy `import { supabase } from "@/lib/db"`) ─
// Returns null when env is missing so existing `if (!supabase) return` guards
// keep working. Lazy via Proxy so imports don't crash at module-load.

export const supabase: SupabaseClient | null = (() => {
  const env = readAdminEnv();
  if (!env) return null;
  return getAdminClient();
})();
