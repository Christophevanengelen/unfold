// ─── Premium Gate — Feature access management ──────────────
// localStorage-first for instant sync checks.
// Supabase sync when available (future).

const PLAN_KEY = "unfold_plan";
const AI_CALLS_KEY = "unfold_ai_calls";

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

// ─── Plan status ──────────────────────────────────────────

export function isPremium(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PLAN_KEY) === "premium";
  } catch {
    return false;
  }
}

export function getPlan(): PlanType {
  return isPremium() ? "premium" : "free";
}

export function setPremiumStatus(plan: PlanType): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PLAN_KEY, plan);
    // Future: sync to Supabase if available
    // const supabase = createClient(); supabase.from("users").update({ plan })...
  } catch {
    // Storage full or blocked — silent fail
  }
}

// ─── Feature access ───────────────────────────────────────

export function canUseFeature(feature: PremiumFeature): boolean {
  if (isPremium()) return true;

  // Free users: check per-feature limits
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
    // Reset if new week
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
