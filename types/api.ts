/**
 * UNFOLD API CONTRACTS — Real TocToc Momentum Engine
 * ===================================================
 * Types match the actual API at https://ai.zebrapad.io/full-suite-spiritual-api
 *
 * 4 endpoints:
 *   POST /toctoc.php          → lifetime event list
 *   POST /toctoc-app.php      → sausages + natal context + house colors
 *   POST /toctoc-year.php     → 3-year rolling window (fast: 2-10s)
 *   POST /toctoc-timeline.php → lifetime monthly chart data
 *
 * Marie Ange: these types ARE the API contract. Build against them.
 */

// ─── Request ──────────────────────────────────────────────
export interface TocTocRequest {
  birthDate: string; // "YYYY-MM-DD"
  birthTime: string; // "HH:MM"
  latitude: number;
  longitude: number;
  timezone: string; // IANA e.g. "Europe/Brussels"
  username?: string; // alternative to coords
  _scanStartDate?: string; // optional: limit scan range
  _scanEndDate?: string;
  year?: number; // for toctoc-year: center year
}

// ─── API Response Wrapper ─────────────────────────────────
export interface TocTocResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

// ─── Event Categories ─────────────────────────────────────
export type EventCategory = "transit" | "station" | "eclipse" | "zr";

// ─── Score Levels (the DNA of TocToc) ─────────────────────
export type TocScore = 1 | 2 | 3 | 4;
export type TocLabel = "toc" | "toc toc" | "toc toc toc" | "toc toc toc toc";

// ─── Base Event (fields on EVERY event) ───────────────────
export interface TocTocEvent {
  id: string; // "tt_42" — unique per request
  color: string; // hex — use directly for rendering
  groupId: string; // links related events (e.g. all passes of same transit)
  date: string; // "YYYY-MM-DD" — start date of event window
  endDate: string; // end date (= date for one-day events)
  score: TocScore; // 1-4 intensity
  label: TocLabel; // "toc toc toc"
  category: EventCategory;
  type: string; // "Pluto conjunction natal Sun"
  isPast: boolean;
  age: number; // person's age at event date
  intensityScore: number; // numeric weight for sizing (can be negative for challenging aspects)
}

// ─── Transit Events ───────────────────────────────────────
export interface TransitEvent extends TocTocEvent {
  category: "transit";
  transitPlanet: TransitPlanet;
  natalPoint: string; // "Sun", "Moon", "Mars", etc.
  aspect: Aspect;
  parileDate: string; // exact date of tightest orb — SHOW THIS as main date
  windowStart: string;
  windowEnd: string;
  exactDates: string[]; // all exact passes (multiple for D/R/D)
  pattern: string; // "Direct-Retrograde-Direct"
  bestOrb: number;
  isReturn: boolean;
  isHalfReturn: boolean;
  isVipTransit: boolean; // outer planet → personal planet (most significant)
  isAList: boolean; // hits ASC or MC
}

export type TransitPlanet =
  | "Pluto" | "Neptune" | "Uranus" | "Saturn" | "Jupiter"
  | "North Node" | "South Node";

export type Aspect = "conjunction" | "square" | "opposition" | "trine";

// ─── Station Events ───────────────────────────────────────
export interface StationEvent extends TocTocEvent {
  category: "station";
  transitPlanet: "Mercury" | "Venus" | "Mars";
  natalPoint: string;
  stationType: "SR" | "SD"; // SR = stations direct, SD = stations retrograde
  orb: number;
  transitLongitude: number;
}

// ─── Eclipse Events ───────────────────────────────────────
export interface EclipseEvent extends TocTocEvent {
  category: "eclipse";
  transitPlanet: "eclipse";
  eclipseType: "solar" | "lunar";
  eclipseLongitude: number;
  eclipseSign: string; // "Aries"
  eclipseAxis: EclipseAxis; // "1-7"
  axisColor: string; // hex — use directly
  eclipseSeriesId: string;
  eclipseSeriesStart: string;
  eclipseSeriesEnd: string;
  lastAxisTouch: string;
  natalPoint: string;
  isVipNatal: boolean;
  isAngle: boolean;
  isVipAspect: boolean; // ★ — orb ≤ 5° to VIP natal planet
  orb: number;
}

export type EclipseAxis = "1-7" | "2-8" | "3-9" | "4-10" | "5-11" | "6-12";

// ─── ZR Events (Zodiacal Releasing) ──────────────────────
export interface ZREvent extends TocTocEvent {
  category: "zr";
  lotType: ZRLotType | ZRLotType[]; // can be merged: ["fortune","eros"]
  level: 2 | 3; // 2 = strongest peak (score 3), 3 = secondary (score 2)
  periodSign: string; // "Leo"
  markers: ZRMarker[];
  isCulmination: boolean;
}

export type ZRLotType = "fortune" | "spirit" | "eros";
export type ZRMarker = "LB" | "Cu" | "pre-LB";

// ─── Union type for any event ─────────────────────────────
export type AnyTocTocEvent = TransitEvent | StationEvent | EclipseEvent | ZREvent;

// ─── Natal Context (from toctoc-app) ─────────────────────
export interface NatalContext {
  [planet: string]: {
    houseLocated: number; // 1-12 (whole sign)
    housesRuled: number[];
    topics: string[];
  };
}

// ─── House Colors (from toctoc-app) ──────────────────────
export type HouseColors = Record<string, string>; // "1" → "#hex", ..., "12" → "#hex"

// ─── Sausage Topic (enriched from toctoc-app) ────────────
export interface SausageTopic {
  house: number;   // 1-12
  color: string;   // hex — use directly for rendering
  label?: string;  // human-readable topic name
}

// ─── Sausage Cycle (D-R-D pass info) ─────────────────────
// When a transit hits the same natal point multiple times (Direct-Retro-Direct),
// cycle tracks which pass this is. NOT a lifetime count.
export interface SausageCycle {
  hitNumber: number;    // which pass (1, 2, 3...)
  totalHits: number;    // total passes expected
  pattern?: string;     // "Direct-Retrograde-Direct"
  allHits: { date: string; hitNumber: number }[];
}

// ─── Sausage (enriched event from toctoc-app) ────────────
export interface Sausage extends TocTocEvent {
  startDate?: string;   // sausage start (may differ from event date)
  width: "thin" | "medium" | "large";
  topics: SausageTopic[];
  cycle?: SausageCycle;
  // Transit-specific (carried from TransitEvent)
  transitPlanet?: string;
  natalPoint?: string;
  aspect?: Aspect;
  parileDate?: string;
  windowStart?: string;
  windowEnd?: string;
  exactDates?: string[];
  pattern?: string;
  isReturn?: boolean;
  isHalfReturn?: boolean;
  isVipTransit?: boolean;
  // Eclipse-specific
  eclipseType?: "solar" | "lunar";
  eclipseAxis?: EclipseAxis;
  axisColor?: string;
  // ZR-specific
  lotType?: ZRLotType | ZRLotType[];
  level?: 2 | 3;
  periodSign?: string;
  markers?: ZRMarker[];
  isCulmination?: boolean;
  // Station-specific
  stationType?: "SR" | "SD";
}

// ─── Person Info ─────────────────────────────────────────
export interface PersonInfo {
  name: string;
  birthDate: string;
  birthTime: string;
  city: string;
  timezone: string;
}

// ─── Natal Points ────────────────────────────────────────
export interface NatalPoint {
  longitude: number;
  sign: string;
  degree: number;
}

// ─── Summary ─────────────────────────────────────────────
export interface TocTocSummary {
  past: ScoreCounts;
  future: ScoreCounts;
  total: ScoreCounts;
}

export interface ScoreCounts {
  toc: number;
  tocToc: number;
  tocTocToc: number;
  tocTocTocToc: number;
}

// ─── Decade Timeline ─────────────────────────────────────
export type DecadeTimeline = Record<string, ScoreCounts>;
// "0-10" → { toc: 1, tocToc: 0, ... }

// ─── toctoc.php Response ─────────────────────────────────
export interface TocTocData {
  person: PersonInfo;
  natalPoints: Record<string, NatalPoint>;
  summary: TocTocSummary;
  timeline: { decades: DecadeTimeline };
  events: AnyTocTocEvent[];
  totalEvents: number;
  computeTimeSeconds: number;
}

// ─── toctoc-app.php Response ─────────────────────────────
// NOTE: API may return double-nested: { success, data: { success, data: { allSausages } } }
// The adapter handles both { data.allSausages } and { data.data.allSausages }.
export interface TocTocAppData {
  person: PersonInfo;
  natalPoints: Record<string, NatalPoint>;
  natalContext: NatalContext;
  houseColors: HouseColors;
  allSausages: Sausage[];
  months: Record<string, MonthBucket>;
  cycles: Record<string, Sausage[]>;
  summary: TocTocSummary;
  timeline: { decades: DecadeTimeline };
  computeTimeSeconds: number;
}

export interface MonthBucket {
  sausages: Sausage[];
  monthScore: number;
  transitScore: number;
  zrScore: number;
}

// ─── Monthly Timeline Event (toctoc-timeline + toctoc-year) ─
export interface MonthlyEvent {
  type: string;
  label: string;
  score: number;
  category: EventCategory;
  color: string;
  exactDate: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  cyclePassNumber: number | null;
  cyclePasses: number | null;
  pattern: string | null;
  eclipseAxis: EclipseAxis | null;
  axisColor: string | null;
  lotType: ZRLotType | null;
  level: number | null;
  periodSign: string | null;
  markers: ZRMarker[] | null;
  isCulmination: boolean;
}

// ─── Monthly Timeline Entry ──────────────────────────────
export interface MonthEntry {
  month: string; // "YYYY-MM"
  zrScore: number;
  transitScore: number;
  totalScore: number;
  age: number;
  isPast: boolean;
  topEvents: MonthlyEvent[];
  // toctoc-year adds these:
  year?: number;
  monthNum?: number;
  isCurrentMonth?: boolean;
}

// ─── Yearly Summary ──────────────────────────────────────
export interface YearSummary {
  year: number;
  sumScore: number;
  isBusy: boolean;
  peakMonthScore: number;
  peakMonth: string;
  avgMonthScore: number;
  positiveMonths: number;
  negativeMonths: number;
  age: number;
  // toctoc-year extras:
  monthCount?: number;
  sumPositive?: number;
  sumNegative?: number;
  neutralMonths?: number;
}

// ─── toctoc-timeline.php Response ────────────────────────
export interface TocTocTimelineData {
  person: PersonInfo;
  natalPoints: Record<string, NatalPoint>;
  fortuneInfo: FortuneInfo;
  summary: TocTocSummary;
  monthlyTimeline: MonthEntry[];
  yearlyTimeline: YearSummary[];
}

export interface FortuneInfo {
  sign: string;
  signIndex: number;
  isDayChart: boolean;
  angularSigns: string[];
  natalSigns: Record<string, string>;
}

// ─── toctoc-year.php Response (fast: 2-10s) ──────────────
export interface TocTocYearData {
  person: PersonInfo;
  window: {
    startDate: string;
    endDate: string;
    years: number[];
    monthCount: number;
  };
  fortuneInfo: FortuneInfo;
  currentMonth: MonthEntry;
  peakUpcomingMonths: MonthEntry[];
  years: YearSummary[];
  months: MonthEntry[];
  computeTimeSeconds: number;
}

// ─── User Profile ────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  inviteCode: string;
  plan: "free" | "premium";
  locale: string;
  createdAt: string;
}

// ─── Connection (for compatibility feature) ──────────────
export interface Connection {
  id: string;
  name: string;
  initial: string;
  relationship: "partner" | "friend" | "family" | "colleague";
  status: "connected" | "pending" | "invited";
  birthData?: TocTocRequest; // needed for client-side compatibility
  connectedSince: string;
  /** @deprecated Compat — old compatibility UI fields */
  todayAlignment?: number;
  todayInsight?: string;
  score?: number;
}

// ─── Compatibility (computed client-side from 2 timelines) ─
export interface CompatibilityResult {
  connectionId: string;
  partnerName: string;
  sharedPeakMonths: SharedPeakMonth[];
  overlapScore: number; // 0-100, computed from shared peaks
  personAEvents: number;
  personBEvents: number;
}

export interface SharedPeakMonth {
  month: string; // "YYYY-MM"
  personAScore: number;
  personBScore: number;
  combinedScore: number;
  topEventsA: MonthlyEvent[];
  topEventsB: MonthlyEvent[];
}

// ─── BACKWARD COMPAT (old types, pre-TocToc pivot) ──────
// TODO: Remove once old components are fully migrated.

/** @deprecated Old daily momentum shape — use MonthEntry instead */
export interface DailyMomentum {
  overall: number;
  insight: string;
  scores: Record<string, { value: number; label: string }>;
}

/** @deprecated Old structured insight shape — use MonthlyEvent instead */
export interface StructuredInsight {
  domain: string;
  title: string;
  body: string;
  score: number;
}

/** @deprecated Old domain detail shape — use Sausage instead */
export interface DomainDetail {
  domain: string;
  score: number;
  trend: string;
  insights: StructuredInsight[];
}

/** @deprecated Old momentum score shape */
export interface MomentumScore {
  overall: number;
  love: number;
  health: number;
  work: number;
}

// ─── Eclipse Axis Colors (reference) ─────────────────────
export const ECLIPSE_AXIS_COLORS: Record<EclipseAxis, string> = {
  "1-7": "#EAB308",  // Yellow (Aries/Libra)
  "2-8": "#94A3B8",  // Blue-grey (Taurus/Scorpio)
  "3-9": "#EA580C",  // Orange (Gemini/Sagittarius)
  "4-10": "#DC2626", // Red (Cancer/Capricorn)
  "5-11": "#0891B2", // Turquoise (Leo/Aquarius)
  "6-12": "#9333EA", // Purple (Virgo/Pisces)
};

// ─── Transit Planet Colors (reference) ───────────────────
export const TRANSIT_PLANET_COLORS: Record<string, string> = {
  Pluto: "#9B1C1C",
  Neptune: "#1D4ED8",
  Uranus: "#0E7490",
  Saturn: "#6B7280",
  Jupiter: "#7E22CE",
  "North Node": "#D97706",
  "South Node": "#D97706",
  eclipse: "#D97706",
  Mercury: "#9CA3AF",
  Venus: "#DB2777",
  Mars: "#DC2626",
  zr: "#059669",
};
