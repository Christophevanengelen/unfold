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

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { apiFetch } from "@/lib/api-client";

const PLAN_KEY = "unfold_plan";
const AI_CALLS_KEY = "unfold_ai_calls";
const PLAN_CHANGE_EVENT = "unfold:plan-changed";

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

// ─── Dev bypass ──────────────────────────────────────────
// Set NEXT_PUBLIC_DEV_FORCE_PREMIUM=true in .env to skip auth/Stripe
// and get instant premium access for local testing.
const DEV_FORCE_PREMIUM =
  process.env.NEXT_PUBLIC_DEV_FORCE_PREMIUM === "true";

// ─── Synchronous read (for non-React code) ───────────────
// Returns the in-memory cache if populated, otherwise localStorage.
// NEVER use this in React render — use usePremiumStatus() instead.
export function isPremium(): boolean {
  if (DEV_FORCE_PREMIUM) return true;
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
  window.dispatchEvent(new CustomEvent(PLAN_CHANGE_EVENT, { detail: plan }));
}

// ─── Le magasin du drapeau premium ───────────────────────
//
// Le plan vit HORS de React : cache memoire + localStorage, ecrits par
// setPremiumStatus() et par la reponse de /api/billing/me. Les deux hooks le
// lisaient par useState(false) + useEffect qui rappelait isPremium() apres le
// montage. Resultat : un abonne voyait le PAYWALL a la premiere image, puis le
// contenu — un clignotement sur l ecran meme qu il a paye. React 19 le signale
// (set-state-in-effect : « cascading renders »).
//
// useSyncExternalStore est le motif du depot pour ce cas exact — voir
// lib/use-locale.ts et lib/messages.ts. La vraie valeur est lue des la
// premiere image cliente, et l abonnement remplace les ecouteurs manuels.
function abonnerPlan(prevenir: () => void): () => void {
  window.addEventListener(PLAN_CHANGE_EVENT, prevenir);
  return () => window.removeEventListener(PLAN_CHANGE_EVENT, prevenir);
}

// Le serveur n a ni cache ni stockage. On rend `false` : fail-closed, on montre
// le paywall plutot que de promettre un contenu qu on devrait retirer ensuite.
function lirePlanServeur(): boolean {
  return false;
}

/** Le drapeau premium tel qu il vit hors de React, sans rendu en trop. */
function usePlanPremium(): boolean {
  return useSyncExternalStore(abonnerPlan, isPremium, lirePlanServeur);
}

// ─── React hook — canonical way to read premium status ───
//
// Lifecycle:
//  1. Renders with `false` (safe default — shows paywall, never skips it)
//  2. On mount: reads localStorage for instant pre-flight (avoids flicker if
//     user legitimately has premium cached)
//  3. On mount: fetches /api/billing/me for verified server state
//  4. Re-runs when "unfold:plan-changed" event fires (e.g. post-purchase)
// Le contournement de developpement sort APRES les hooks, pas avant.
//
// Ecrit en premier, `if (DEV_FORCE_PREMIUM) return true;` sautait useState,
// useRef et useEffect. Cela ne casse rien aujourd hui parce que le drapeau est
// une constante de build : l ordre des hooks reste le meme a chaque rendu.
//
// Mais c est une regle de React, pas un detail de style. Le jour ou ce drapeau
// devient dynamique — un reglage, un essai gratuit, une bascule a distance —
// l ordre des hooks change en cours de vie du composant, et React associe alors
// l etat d un hook a un autre. Le bug qui en resulte ne ressemble pas a un bug
// de permission : c est un compteur qui affiche la mauvaise valeur, un champ
// qui garde le texte d un autre. On ne le relie jamais a cette ligne.
//
// Les hooks s executent donc toujours ; seule la VALEUR RENVOYEE change.
export function usePremiumStatus(): boolean {
  // Lu du magasin, pas d un useState corrige par effet. Voir la note plus haut.
  const isPrem = usePlanPremium();
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Le hook tourne toujours — c est le point — mais son CORPS ne fait rien en
    // mode contournement : la promesse « no API call » est conservee.
    if (DEV_FORCE_PREMIUM) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Verification serveur. Le resultat n est pas pousse dans un useState : il
    // est ecrit dans le magasin par setPremiumStatus(), qui previent TOUS les
    // hooks montes — y compris ceux d un autre composant qui affiche le meme
    // plan. Un seul endroit ecrit, tout le monde suit.
    apiFetch("/api/billing/me", {
      headers: { "Cache-Control": "no-store" },
      credentials: "include",
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data: { plan?: string } | null) => {
        if (!data) return;
        setPremiumStatus(data.plan === "premium" ? "premium" : "free");
      })
      .catch(() => {
        // Network error — keep localStorage value as fallback
        // (fail-open for existing premium users, fail-closed for new users)
      });
  }, []);

  // Dev bypass — instant premium, no API call. Voir la note ci-dessus.
  if (DEV_FORCE_PREMIUM) return true;
  return isPrem;
}

// ─── Full billing state hook (plan + trial countdown + source) ───
//
// Use this instead of usePremiumStatus() when you need more than a boolean:
// trial countdown, source (stripe/apple/google), period end, loading state.
export interface BillingState {
  isPremium: boolean;
  status: "trialing" | "active" | "lifetime" | "past_due" | "canceled" | "expired" | "none" | "unauthenticated";
  trialEnd?: string;       // ISO date — only set when status==="trialing"
  currentPeriodEnd?: string;
  source?: "stripe" | "apple" | "google";
  loading: boolean;
}

export function useBillingState(): BillingState {
  // Le drapeau premium vient du magasin — meme raison que dans
  // usePremiumStatus. Seuls les DETAILS que le serveur est seul a connaitre
  // (statut, fin d essai, source) restent en useState : ils arrivent dans une
  // promesse, donc apres le rendu, ce qui est le travail legitime d un effet.
  const isPremiumStore = usePlanPremium();
  const [details, setDetails] = useState<Omit<BillingState, "isPremium">>({
    status: "none",
    loading: true,
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (DEV_FORCE_PREMIUM) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    apiFetch("/api/billing/me", {
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
          if (!data) { setDetails((d) => ({ ...d, loading: false })); return; }
          setPremiumStatus(data.plan === "premium" ? "premium" : "free");
          setDetails({
            status: (data.status ?? "none") as BillingState["status"],
            trialEnd: data.trialEnd,
            currentPeriodEnd: data.currentPeriodEnd,
            source: data.source as BillingState["source"],
            loading: false,
          });
        }
      )
      .catch(() => setDetails((d) => ({ ...d, loading: false })));
  }, []);

  // Dev bypass — voir la note au-dessus de usePremiumStatus : les hooks
  // tournent toujours, seule la valeur renvoyee change.
  if (DEV_FORCE_PREMIUM) {
    return { isPremium: true, status: "active", loading: false };
  }
  return { ...details, isPremium: isPremiumStore };
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
