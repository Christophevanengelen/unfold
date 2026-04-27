"use client";

/**
 * /[locale]/auth/callback — relay page.
 *
 * Supabase's site URL may be configured with a locale prefix
 * (e.g. https://unfold-nine.vercel.app/en) which causes the email
 * confirmation redirect to land here instead of /auth/callback.
 *
 * This page immediately forwards the full URL (preserving both the
 * query string AND the hash fragment) to the canonical callback handler.
 */

import { useEffect } from "react";

export default function LocaleAuthCallbackRelay() {
  useEffect(() => {
    // Preserve ?code=, ?returnTo= AND #access_token= intact
    const search = window.location.search;
    const hash = window.location.hash;
    window.location.replace(`/auth/callback${search}${hash}`);
  }, []);

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
        }}
      >
        Signing you in…
      </div>
    </div>
  );
}
