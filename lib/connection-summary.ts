/**
 * Connection summary — condenses a full ConnectionBriefResult into the
 * "what's happening now / soon / later" shape rendered in the list row.
 *
 * Pure function — no network, no caching. Feed it the brief, get a summary.
 * The brief itself comes from `fetchConnectionBrief()`, which already has
 * L1 (IndexedDB) + L2 (Supabase connection_cache) caching — so calling this
 * per-connection on the list is fast on warm cache.
 */

import type { ConnectionBriefResult, ActivePeriod } from "@/lib/connection-brief-api";
import type { MatchingWindow } from "@/lib/matching-narratives";

export type SummaryStatus = "active" | "upcoming" | "calm";
export type SummaryTier = "PEAK" | "CLEAR" | "SUBTLE";

export interface ConnectionSummary {
  /** Tier of the currently-active window, or null if nothing active this month. */
  currentTier: SummaryTier | null;
  /** Color tinted for the current tier (UI ring). "transparent" when calm. */
  currentTierColor: string;
  /** Month of the next window in the future (YYYY-MM), or null if none. */
  nextWindowMonthKey: string | null;
  /** Tier of the next window. */
  nextWindowTier: SummaryTier | null;
  /** Days until the next future window starts. null when nothing upcoming. */
  daysUntilNext: number | null;
  /** Bucket used to order the list. */
  status: SummaryStatus;
  /** Planet that best represents the active/nearest window (for the micro-preview dot). */
  planet?: string;
  /** Headline rendered as the 1-line micro-preview on the row (FR). */
  headlineFR: string;
  /** Ordering score — higher = higher in list. Combines status bucket + tier. */
  sortScore: number;
}

const TIER_WEIGHT: Record<SummaryTier, number> = { PEAK: 3, CLEAR: 2, SUBTLE: 1 };
const STATUS_WEIGHT: Record<SummaryStatus, number> = { active: 300, upcoming: 150, calm: 0 };

const MONTH_SHORT_FR = [
  "jan", "fév", "mar", "avr", "mai", "juin",
  "jul", "aoû", "sep", "oct", "nov", "déc",
];

function capitalize(s: string): string {
  return s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function prettyPlanet(p: string | undefined | null): string {
  if (!p) return "";
  const map: Record<string, string> = {
    saturn: "Saturne",
    jupiter: "Jupiter",
    venus: "Vénus",
    mars: "Mars",
    moon: "Lune",
    sun: "Soleil",
    mercury: "Mercure",
    uranus: "Uranus",
    neptune: "Neptune",
    pluto: "Pluton",
    "north-node": "Nœud nord",
    "south-node": "Nœud sud",
    "solar-eclipse": "Éclipse solaire",
    "lunar-eclipse": "Éclipse lunaire",
    zr: "Chapitre ZR",
  };
  return map[p] ?? capitalize(p);
}

function headline({
  status,
  tier,
  daysUntilNext,
  planet,
  nextWindowMonthKey,
}: {
  status: SummaryStatus;
  tier: SummaryTier | null;
  daysUntilNext: number | null;
  planet?: string;
  nextWindowMonthKey: string | null;
}): string {
  const p = prettyPlanet(planet);
  if (status === "active") {
    const base =
      tier === "PEAK" ? "Fenêtre forte maintenant"
        : tier === "CLEAR" ? "Alignement clair en cours"
          : "Alignement subtil en cours";
    return p ? `${base} · ${p}` : base;
  }
  if (status === "upcoming" && daysUntilNext !== null) {
    const when =
      daysUntilNext <= 0 ? "aujourd'hui"
        : daysUntilNext === 1 ? "demain"
          : daysUntilNext <= 14 ? `dans ${daysUntilNext} j`
            : nextWindowMonthKey
              ? (() => {
                const [, m] = nextWindowMonthKey.split("-").map(Number);
                return `en ${MONTH_SHORT_FR[m - 1]}`;
              })()
              : `dans ${daysUntilNext} j`;
    const base =
      tier === "PEAK" ? `Fenêtre forte ${when}`
        : tier === "CLEAR" ? `Alignement clair ${when}`
          : `Alignement ${when}`;
    return p ? `${base} · ${p}` : base;
  }
  return "Calme ce mois";
}

function planetOfPeriod(period: ActivePeriod | undefined): string | undefined {
  if (!period) return undefined;
  // Prefer the higher-scoring of the two people's primary signals
  const a = period.personAFocus?.primarySignal;
  const b = period.personBFocus?.primarySignal;
  const pick =
    !a ? b
      : !b ? a
        : (a.score ?? 0) >= (b.score ?? 0) ? a : b;
  if (!pick) return undefined;
  const raw = String(pick.planetOrType ?? "").trim();
  if (!raw) return undefined;
  if (pick.category === "eclipse") {
    return raw.toLowerCase().includes("solar") ? "solar-eclipse" : "lunar-eclipse";
  }
  // ZR signals don't map to a planet — use the category label instead.
  if (pick.category === "zr") return "zr";
  return raw
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Extract the list-row summary from a full brief result.
 * `today` param lets tests lock the date; default = now.
 */
export function extractSummary(
  result: ConnectionBriefResult | null | undefined,
  today: Date = new Date(),
): ConnectionSummary {
  if (!result || result.periods.length === 0) {
    return {
      currentTier: null,
      currentTierColor: "transparent",
      nextWindowMonthKey: null,
      nextWindowTier: null,
      daysUntilNext: null,
      status: "calm",
      headlineFR: "Calme ce mois",
      sortScore: 0,
    };
  }

  const currentWindow: MatchingWindow | undefined = result.windows.find((w) => w.status === "active");
  const currentPeriod = currentWindow
    ? result.periods.find((p) => p.monthKey === currentWindow.monthKey)
    : undefined;

  const upcomingWindow = result.windows.find((w) => w.status === "upcoming");
  const upcomingPeriod = upcomingWindow
    ? result.periods.find((p) => p.monthKey === upcomingWindow.monthKey)
    : undefined;

  // Active path
  if (currentWindow) {
    const tier = currentWindow.tier as SummaryTier;
    const planet = planetOfPeriod(currentPeriod);
    return {
      currentTier: tier,
      currentTierColor: currentWindow.tierColor,
      nextWindowMonthKey: upcomingWindow?.monthKey ?? null,
      nextWindowTier: (upcomingWindow?.tier as SummaryTier) ?? null,
      daysUntilNext: upcomingWindow?.daysLeft ?? null,
      status: "active",
      planet,
      headlineFR: headline({
        status: "active",
        tier,
        daysUntilNext: null,
        planet,
        nextWindowMonthKey: null,
      }),
      sortScore: STATUS_WEIGHT.active + TIER_WEIGHT[tier] * 10 + (currentPeriod?.tierScore ?? 0),
    };
  }

  // Upcoming path (< 30 days)
  if (upcomingWindow && upcomingWindow.daysLeft <= 30) {
    const tier = upcomingWindow.tier as SummaryTier;
    const planet = planetOfPeriod(upcomingPeriod);
    return {
      currentTier: null,
      currentTierColor: upcomingWindow.tierColor,
      nextWindowMonthKey: upcomingWindow.monthKey,
      nextWindowTier: tier,
      daysUntilNext: upcomingWindow.daysLeft,
      status: "upcoming",
      planet,
      headlineFR: headline({
        status: "upcoming",
        tier,
        daysUntilNext: upcomingWindow.daysLeft,
        planet,
        nextWindowMonthKey: upcomingWindow.monthKey,
      }),
      sortScore: STATUS_WEIGHT.upcoming + TIER_WEIGHT[tier] * 10 + (upcomingPeriod?.tierScore ?? 0),
    };
  }

  // Anything beyond 30 days = calm
  const firstFuture = result.windows.find(
    (w) => w.status === "upcoming" || w.status === "active",
  );
  const firstFuturePeriod = firstFuture
    ? result.periods.find((p) => p.monthKey === firstFuture.monthKey)
    : undefined;
  const planet = planetOfPeriod(firstFuturePeriod);
  return {
    currentTier: null,
    currentTierColor: "transparent",
    nextWindowMonthKey: firstFuture?.monthKey ?? null,
    nextWindowTier: (firstFuture?.tier as SummaryTier) ?? null,
    daysUntilNext: firstFuture?.daysLeft ?? null,
    status: "calm",
    planet,
    headlineFR: "Calme ce mois",
    sortScore: STATUS_WEIGHT.calm,
  };
  // Silence unused param lint (reserved for future server-side TTL logic)
  void today;
}
