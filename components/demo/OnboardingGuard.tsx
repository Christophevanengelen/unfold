"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMomentum } from "@/lib/momentum-store";

/**
 * Redirects to /demo/onboarding if no birth data exists.
 * Wraps all demo pages except the onboarding flow itself.
 * Shows nothing until real data is available — no flash.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { needsOnboarding, state, isLive, timelinePhases } = useMomentum();
  const router = useRouter();

  useEffect(() => {
    if (needsOnboarding) {
      router.replace("/demo/onboarding");
    }
  }, [needsOnboarding, router]);

  // Block render until we have real data loaded
  // idle = haven't checked birth data yet
  // loading = API call in progress
  // needsOnboarding = about to redirect
  // no phases yet = data not arrived
  if (state === "idle" || state === "loading" || needsOnboarding) {
    return null;
  }

  // API error — let user retry via onboarding
  if (state === "error") {
    return null; // error state already triggers needsOnboarding or shows error in UI
  }

  // Data loaded but empty (shouldn't happen with real API, but safety net)
  if (timelinePhases.length === 0) {
    return null;
  }

  return <>{children}</>;
}
