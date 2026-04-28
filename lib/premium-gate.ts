// ─── Premium Gate — Feature access management ──────────────
//
// Architecture:
//  - `usePremiumStatus()` hook is the canonical source for React components.
//    It fetches /api/billing/me on mount for verified server-side state,
//    and caches the result in memory + localStorage for instant UI.
//  - `isPremium()` is a SYNCHRONOUS fallback for non-hook callsites (e.g.
//    outside React). It reads the in-memory cache first, then localStorage.
//    Never trust localStorage alone — always call the hook when in React.
//  - `setPremiumStatus()` updates localStorage + memory cache + dispatches
//    "unfold:plan-changed" so all mounted hooks re-render.

"use client";

import { useState, useEffect, useRef } from "react";

const PLAN_KEY = "unfold_plan";
const AI_CALLS_KEY = "unfold_ai_calls";

// In-memory cache — shared across all callsites on same page load.
// Default: false (fail-closed). Updated by hook after /api/billing/me.
let _cachedPremium: boolean | null = null;

export type PlanType = "free" | "premium";

export const PREMIUM_FEATURES = {
  FUTURE_CAPSULES: { premium: true, freeLimit: 0, label: "Capsules futures" },
  AI_UNLIMITED: { premium: true, freeLimit: 1, label: "IA personnalisée" }, // free = 1/week
  DAILY_BRIEFING: { premium: true, freeLimit: 0, label: "Briefing quotidien" },
  WEEKLY_DIGEST: { premium: true, freeLimit: 0, label: "Digest hebdomadaire" },
  UNLIMITED_CONNECTIONS: { premium: true, freeLimit: 1, label: "Connexions illimitées" },
  ADVANCED_COMPATIBILITY: { premium: true, freeLimit: 0, label: "Compatibilité avancée" },
} as const;

export type PremiumFeature = keyof typeof PREMIUM_FEATURES;

// ─── Synchronous read (for non-React code) ───────────────
// Returns the in-memory cache if populated, otherwise localStorage.
// NEVER use this in React render — use usePremiumStatus() instead.
export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  if (_cachedPremium !== null) return _cachedPremium;
  try {
    return localStorage.getItem(PLAN_KEY) === "premium";
  } catch {
    return false;
  }
}

export function getPlan(): PlanType {
  return isPremium() ? "premium" : "free";
}

// Update status — called after billing API confirms plan change.
// Dispatches event so all usePremiumStatus() hooks re-render immediately.
export function setPremiumStatus(plan: PlanType): void {
  if (typeof window === "undefined") return;
  const isPrem = plan === "premium";
  _cachedPremium = isPrem;
  try {
    localStorage.setItem(PLAN_KEY, plan);
  } catch {
    // Storage full or blocked — memory cache is still updated
  }
  // Signal all mounted hooks to re-read
  window.dispatchEvent(new CustomEvent("unfold:plan-changed", { detail: plan }));
}

// ─── React hook — canonical way to read premium status ───
//
// Lifecycle:
//  1. Renders with `false` (safe default — shows paywall, never skips it)
//  2. On mount: reads localStorage for instant pre-flight (avoids flicker if
//     user legitimately has premium cached)
//  3. On mount: fetches /api/billing/me for verified server state
//  4. Re-runs when "unfold:plan-changed" event fires (e.g. post-purchase)
export function usePremiumStatus(): boolean {
  // Start false — never assume premium before verification
  const [isPrem, setIsPrem] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Step 1: Instant pre-flight from memory or localStorage
    const cached = isPremium();
    setIsPrem(cached);

    // Step 2: Verify via server (runs once per mount)
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetch("/api/billing/me", {
        headers: { "Cache-Control": "no-store" },
        credentials: "include",
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data: { plan?: string } | null) => {
          if (!data) return;
          const serverPremium = data.plan === "premium";
          // Update cache + localStorage with verified value
          _cachedPremium = serverPremium;
          try { localStorage.setItem(PLAN_KEY, serverPremium ? "premium" : "free"); } catch {}
          setIsPrem(serverPremium);
        })
        .catch(() => {
          // Network error — keep localStorage value as fallback
          // (fail-open for existing premium users, fail-closed for new users)
        });
    }

    // Step 3: React to plan changes (e.g. post-checkout success redirect)
    const handleChange = (e: Event) => {
      const plan = (e as CustomEvent<PlanType>).detail;
      setIsPrem(plan === "premium");
    };
    window.addEventListener("unfold:plan-changed", handleChange);
    return () => window.removeEventListener("unfold:plan-changed", handleChange);
  }, []);

  return isPrem;
}

// ─── Full billing state hook (plan + trial countdown + source) ───
//
// Use this instead of usePremiumStatus() when you need more than a boolean:
// trial countdown, source (stripe/apple/google), period end, loading state.
export interface BillingState {
  isPremium: boolean;
  status: "trialing" | "active" | "past_due" | "canceled" | "expired" | "none" | "unauthenticated";
  trialEnd?: string;       // ISO date — only set when status==="trialing"
  currentPeriodEnd?: string;
  source?: "stripe" | "apple" | "google";
  loading: boolean;
}

export function useBillingState(): BillingState {
  const [state, setState] = useState<BillingState>({
    isPremium: false,
    status: "none",
    loading: true,
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    const cached = isPremium();
    setState((s) => ({ ...s, isPremium: cached }));

    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetch("/api/billing/me", {
        headers: { "Cache-Control": "no-store" },
        credentials: "include",
      })
        .then((r) => (r.ok ? r.json() : null))
        .then(
          (data: {
            plan?: string;
            status?: string;
            trialEnd?: string;
            currentPeriodEnd?: string;
            source?: string;
          } | null) => {
            if (!data) { setState((s) => ({ ...s, loading: false })); return; }
            const prem = data.plan === "premium";
            _cachedPremium = prem;
            try { localStorage.setItem(PLAN_KEY, prem ? "premium" : "free"); } catch {}
            setState({
              isPremium: prem,
              status: (data.status ?? "none") as BillingState["status"],
              trialEnd: data.trialEnd,
              currentPeriodEnd: data.currentPeriodEnd,
              source: data.source as BillingState["source"],
              loading: false,
            });
          }
        )
        .catch(() => setState((s) => ({ ...s, loading: false })));
    }

    const handleChange = (e: Event) => {
      const plan = (e as CustomEvent<PlanType>).detail;
      setState((s) => ({ ...s, isPremium: plan === "premium" }));
    };
    window.addEventListener("unfold:plan-changed", handleChange);
    return () => window.removeEventListener("unfold:plan-changed", handleChange);
  }, []);

  return state;
}

// ─── Feature access ───────────────────────────────────────

export function canUseFeature(feature: PremiumFeature): boolean {
  if (isPremium()) return true;

  const config = PREMIUM_FEATURES[feature];
  if (feature === "AI_UNLIMITED") {
    return canMakeAiCall();
  }
  return config.freeLimit > 0;
}

// ─── AI call tracking (weekly reset) ─────────────────────

interface AiCallData {
  count: number;
  weekStart: string; // ISO date of Monday
}

function getCurrentWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

function getAiCallData(): AiCallData {
  if (typeof window === "undefined") return { count: 0, weekStart: getCurrentWeekStart() };
  try {
    const raw = localStorage.getItem(AI_CALLS_KEY);
    if (!raw) return { count: 0, weekStart: getCurrentWeekStart() };
    const data: AiCallData = JSON.parse(raw);
    const currentWeek = getCurrentWeekStart();
    if (data.weekStart !== currentWeek) {
      return { count: 0, weekStart: currentWeek };
    }
    return data;
  } catch {
    return { count: 0, weekStart: getCurrentWeekStart() };
  }
}

export function getAiCallsThisWeek(): number {
  return getAiCallData().count;
}

export function incrementAiCalls(): void {
  if (typeof window === "undefined") return;
  try {
    const data = getAiCallData();
    data.count += 1;
    localStorage.setItem(AI_CALLS_KEY, JSON.stringify(data));
  } catch {
    // Silent fail
  }
}

export function canMakeAiCall(): boolean {
  if (isPremium()) return true;
  return getAiCallData().count < 1; // free = max 1/week
}
