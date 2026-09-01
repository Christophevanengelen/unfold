"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMomentum } from "@/lib/momentum-store";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

/**
 * Redirects to /demo/onboarding if no birth data exists.
 * Shows a smooth loading skeleton while data loads — no blank flash.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const locale = detectLocale();
  const { needsOnboarding, state, isLive, timelinePhases } = useMomentum();
  const router = useRouter();

  useEffect(() => {
    if (needsOnboarding) {
      router.replace("/app/onboarding");
    }
  }, [needsOnboarding, router]);

  // Redirect in progress
  if (needsOnboarding) return null;

  // Data is loading — show smooth skeleton instead of blank
  if (state === "idle" || state === "loading") {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-5 w-5 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "var(--accent-purple)",
            borderRightColor: "var(--accent-purple)",
            opacity: 0.5,
          }}
        />
      </div>
    );
  }

  // API error — let user retry
  if (state === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-text-body-subtle">Connexion perdue</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full px-4 py-2 text-xs font-medium"
          style={{ background: "var(--surface-light)", color: "var(--accent-purple)" }}
        >
          {perso("garde.reessayer", locale)}
        </button>
      </div>
    );
  }

  // Data loaded but both sources empty — redirect to onboarding
  if (timelinePhases.length === 0 && !isLive) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-body-subtle">{perso("garde.aucun", locale)}</p>
      </div>
    );
  }

  return <>{children}</>;
}
