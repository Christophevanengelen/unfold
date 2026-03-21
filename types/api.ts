/**
 * UNFOLD API CONTRACTS
 * ====================
 * These TypeScript interfaces define the expected API response shapes.
 * Marie Ange: each interface maps to an API endpoint your backend needs to provide.
 */

// ─── Momentum Scores ───────────────────────────────────────
// GET /api/momentum/daily?date=YYYY-MM-DD
export interface DailyMomentum {
  date: string; // ISO date
  scores: {
    love: MomentumScore;
    health: MomentumScore;
    work: MomentumScore;
  };
  overall: number; // 0-100 composite score
  insight: string; // Daily insight text (localized)
  label?: string; // Human-readable summary ("Strong work momentum")
}

export interface MomentumScore {
  value: number; // 0-100
  trend: "rising" | "stable" | "declining";
  peakHour?: number; // 0-23, optimal hour for this axis
  description: string; // Short description (localized)
}

// Structured 4-line insight (bottom card on every page)
export interface StructuredInsight {
  mainRead: string; // "Today favors Work"
  bestWindow: string; // "Peak around 11am"
  suggestedMove: string; // "Protect 10-12 for focused work"
  caution: string; // "Energy may soften after lunch"
}

// Detailed report (shown on satellite score tap)
export interface DomainDetail {
  scoreTitle: string; // "Work is rising today"
  whatItMeans: string; // "Focus and decision-making are better supported..."
  bestUse: string; // "Do your most demanding task between 10am and 12pm"
  watchOut: string; // "Momentum may soften later..."
  whenItGetsBetter: string; // "Your next stronger work window builds tomorrow afternoon"
  premiumTeaser: string; // "Unlock future peaks and timing windows"
}

// ─── Trend Data ─────────────────────────────────────────────
// GET /api/momentum/trend?from=YYYY-MM-DD&to=YYYY-MM-DD
export interface MomentumTrend {
  period: {
    from: string;
    to: string;
  };
  dataPoints: TrendPoint[];
}

export interface TrendPoint {
  date: string;
  love: number;
  health: number;
  work: number;
  overall: number;
}

// ─── Compatibility ──────────────────────────────────────────
// POST /api/compatibility/check { inviteCode: string }
export interface CompatibilityResult {
  score: number; // 0-100
  partnerName: string;
  synergies: {
    axis: "love" | "health" | "work";
    strength: "strong" | "moderate" | "developing";
    description: string;
  }[];
  sharedPeaks: string[]; // ISO dates of aligned peak moments
  whatMakesYouWork?: string; // Insight about partner dynamics
  bestDaysTogether?: { date: string; context: string }[]; // Annotated shared peaks
}

// ─── Premium: Future Windows ────────────────────────────────
// GET /api/premium/forecast?days=7
export interface ForecastWindow {
  date: string;
  momentum: number; // 0-100 predicted overall
  isPeak: boolean;
  peakAxes: ("love" | "health" | "work")[];
  recommendation: string; // Localized action suggestion
}

// ─── Premium: Monthly Momentum Map ──────────────────────────
// GET /api/premium/monthly-map?month=YYYY-MM
export interface MonthlyMap {
  month: string; // YYYY-MM
  days: {
    date: string;
    overall: number;
    isPeak: boolean;
    isLow: boolean;
  }[];
  summary: {
    peakDays: number;
    averageMomentum: number;
    bestAxis: "love" | "health" | "work";
    trend: "ascending" | "stable" | "descending";
  };
}

// ─── Premium: Peak Alerts ───────────────────────────────────
// GET /api/premium/alerts
export interface PeakAlert {
  id: string;
  date: string;
  time: string; // HH:mm
  axis: "love" | "health" | "work";
  intensity: "moderate" | "strong" | "exceptional";
  message: string; // Localized alert message
}

// ─── Timeline Phases (Momentum History) ─────────────────────
// GET /api/momentum/timeline
export interface TimelinePhase {
  id: string;
  domain: "love" | "health" | "work";
  title: string;
  subtitle: string;
  description: string;
  startDate: string; // ISO date
  endDate?: string; // null = ongoing
  durationWeeks: number;
  intensity: number; // 0-100 — tier: <70 TOC, 70-84 TOCTOC, 85+ TOCTOCTOC
  planets: PlanetaryTransit[]; // 1-5 active transits shaping this phase (TOCTOCTOC min 2)
  status: "past" | "current" | "future";
  guidance?: string; // premium-only
  keyInsight?: string;
  peakMoment?: string;
}

export type PlanetKey =
  | "sun" | "moon" | "mercury" | "venus" | "mars"
  | "jupiter" | "saturn" | "uranus" | "neptune"
  | "solar-eclipse" | "lunar-eclipse";

export interface PlanetaryTransit {
  planet: PlanetKey;
  influence: number; // 0-100 strength of this transit
}

// ─── User Profile ───────────────────────────────────────────
// GET /api/user/profile
export interface UserProfile {
  id: string;
  name: string;
  inviteCode: string;
  plan: "free" | "premium";
  locale: string;
  createdAt: string;
}
