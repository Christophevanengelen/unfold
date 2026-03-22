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
  /** Topic colors from API — each topic = one dot in the sausage */
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
  lifetimeNumber?: number;
  lifetimeTotal?: number;
  isVipTransit?: boolean;
}
