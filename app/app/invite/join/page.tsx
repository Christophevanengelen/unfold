"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { parseInviteParams } from "@/lib/connections-store";

/**
 * /demo/invite/join?name=X&code=X&bd=X&bt=X&lat=X&lng=X&tz=X
 *
 * Landing page when someone clicks an invite link.
 * Saves the invite data to sessionStorage, then redirects to:
 * - Onboarding (if no birth data yet)
 * - Connected page (if already onboarded)
 */

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const parsed = parseInviteParams(searchParams);
    if (!parsed) {
      // Invalid link — go to compatibility
      router.replace("/demo/compatibility");
      return;
    }

    // Save invite data in sessionStorage so it survives onboarding
    sessionStorage.setItem("unfold_pending_invite", JSON.stringify(parsed));

    // Check if user has birth data
    const hasBirthData = localStorage.getItem("unfold_birth_data");
    if (hasBirthData) {
      // Already onboarded — go straight to connected page
      const params = searchParams.toString();
      router.replace(`/demo/invite/connected?${params}`);
    } else {
      // Needs onboarding first — redirect there
      // After onboarding, the app will check for pending invite
      router.replace("/demo/onboarding");
    }
  }, [router, searchParams]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div
          className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--accent-purple)", borderRightColor: "var(--accent-purple)" }}
        />
        <p className="mt-3 text-sm text-text-body-subtle">Connexion en cours...</p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><p className="text-sm text-text-body-subtle">Chargement...</p></div>}>
      <JoinContent />
    </Suspense>
  );
}
