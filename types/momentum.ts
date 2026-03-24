/**
 * Momentum Phase — core timeline data type.
 * Represents a single event/phase on the user's life timeline.
 * Populated from API sausage data via lib/momentum-adapter.ts.
 */

import type { DomainKey, PlanetKey } from "@/lib/domain-config";

export interface MomentumPhase {
  id: string;
  domain: DomainKey;
  title: string;
  subtitle: string;
  description: string;
  startDate: string; // ISO date
  endDate?: string; // null = ongoing or future
  durationWeeks: number;
  intensity: number; // 0-100 — visual intensity
  score?: number; // 1-4 raw API score — determines tier directly (1=TOC, 2=TOCTOC, 3-4=TOCTOCTOC)
  planets: PlanetKey[]; // 1-5 planetary transits active during this phase
  /** @deprecated Use apiTopics instead — topicColors was redundant */
  topicColors?: string[];
  status: "past" | "current" | "future";
  guidance?: string; // premium-only
  keyInsight?: string;
  peakMoment?: string;
  color?: string; // hex color from API sausage — used for boudin rendering
  /** Raw API sausage data for detail sheet rendering */
  apiLabel?: string;           // "Saturn opposition natal Sun"
  apiCategory?: string;        // "transit" | "zr" | "eclipse" | "station"
  transitPlanet?: string;      // "Saturn"
  natalPoint?: string;         // "Sun"
  aspect?: string;             // "conjunction" | "square" | "opposition" | "trine"
  cycle?: { hitNumber: number; totalHits: number; pattern: string; allHits: { date: string; hitNumber: number }[] };
  apiTopics?: { house: number; color: string; topic: string; source: string }[];
  lotType?: string;
  zrLevel?: number;
  periodSign?: string;
  markers?: string[];
  eclipseType?: string;
  /** @deprecated API does not provide lifetime counts. Always undefined from adapter. */
  lifetimeNumber?: number;
  /** @deprecated API does not provide lifetime counts. Always undefined from adapter. */
  lifetimeTotal?: number;
  isVipTransit?: boolean;
  // Transit window data (from API sausage)
  windowStart?: string;
  windowEnd?: string;
  exactDates?: string[];
  parileDate?: string;     // exact date of tightest orb
  isReturn?: boolean;      // Saturn/Jupiter return
  isHalfReturn?: boolean;  // half-return (opposition to natal position)
  stationType?: string;    // "SR" (stations retrograde) or "SD" (stations direct)
  /** Index in the API response — fallback for TocToc personalize calls */
  boudinIndex?: number;
  /** Sausage ID from API — primary key for TocToc personalize calls */
  boudinId?: string;
}
