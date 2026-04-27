"use client";

/**
 * /auth/callback
 *
 * Handles both Supabase auth flows:
 *  - Implicit:  #access_token=... (email confirmation, signup)
 *  - PKCE:      ?code=...         (magic-link sign-in, OAuth)
 *
 * After a successful session, redirects to the `returnTo` search param
 * (defaults to /demo/pricing so the checkout flow continues).
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseAuth } from "@/lib/supabase-auth";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handle = async () => {
      if (!supabaseAuth) {
        router.replace("/demo?auth_error=config");
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo") ?? "/demo/pricing";
      const hash = window.location.hash;

      // --- Implicit flow: #access_token in URL fragment ---
      if (hash && hash.includes("access_token=")) {
        // The Supabase browser client auto-processes the hash on getSession()
        // Give it a tick to parse the fragment, then read the session.
        await new Promise<void>((res) => setTimeout(res, 100));
        const { data, error } = await supabaseAuth.auth.getSession();
        if (error || !data.session) {
          console.error("[auth/callback] implicit session error:", error?.message);
          router.replace("/demo?auth_error=session");
          return;
        }
        router.replace(returnTo);
        return;
      }

      // --- PKCE flow: ?code= in query string ---
      const code = params.get("code");
      if (code) {
        try {
          const { error } = await supabaseAuth.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("[auth/callback] PKCE exchange error:", error.message);
            router.replace("/demo?auth_error=exchange_failed");
            return;
          }
          router.replace(returnTo);
        } catch (err) {
          console.error("[auth/callback] unexpected error:", err);
          router.replace("/demo?auth_error=server");
        }
        return;
      }

      // Nothing to process
      router.replace("/demo?auth_error=missing_code");
    };

    handle();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg-primary, #1B1535)",
      }}
    >
      <div
        style={{
          color: "var(--text-body-subtle, rgba(255,255,255,0.5))",
          fontSize: 14,
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.02em",
        }}
      >
        Signing you in…
      </div>
    </div>
  );
}
