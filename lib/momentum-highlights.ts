/**
 * toctoc-highlights — "biggest boudin" endpoint client.
 *
 * Returns yearly astrological summary + peak years without the heavy monthly
 * array (~50 KB vs ~500 KB for the full toctoc-timeline). Use this when you
 * need the user's biggest/busiest years but not month-by-month detail.
 *
 * Backend: C:\wamp64\www\ai.zebrapad.io\full-suite-spiritual-api\toctoc-highlights.php
 * Proxied: POST /api/toctoc  { endpoint: "toctoc-highlights", ...birthData }
 */

/** One entry in the yearlyTimeline[] array — one row per year. */
export interface YearlyEntry {
  year: number;
  age: number;
  /** Cumulative yearly score (sum of all monthly scores) */
  sumScore: number;
  /** Highest single-month score in that year */
  peakMonthScore: number;
  /** Peak month string "YYYY-MM" */
  peakMonth: string;
  /** Average monthly score */
  avgMonthScore: number;
  /** "Busy year" flag */
  isBusy: boolean;
  positiveMonths: number;
  negativeMonths: number;
  neutralMonths: number;
  monthCount: number;
  /** Only present on biggestYear, stripped from yearlyTimeline entries */
  months?: Array<{ month: string; totalScore: number; age: number; isPast: boolean }>;
}

export interface PeakYear {
  year: number;
  age: number;
  peakMonthScore: number;
  peakMonth: string; // "YYYY-MM"
}

export interface AverageYear {
  year: number;
  age: number;
  avgMonthScore: number;
}

export interface HighlightsSummary {
  /** Top years sorted by highest single-month peak score */
  peakYears: PeakYear[];
  /** Top years sorted by highest average monthly score */
  bestAverageYears: AverageYear[];
  /** Most challenging years (lowest/most negative average) */
  challengingYears: AverageYear[];
  /** Overall average monthly score across all scanned years */
  overallAverage: number;
  statistics: {
    scannedYears: number;
    scannedMonths: number;
    avgPositiveMonthsPerYear: number;
    avgNegativeMonthsPerYear: number;
    avgNeutralMonthsPerYear: number;
    avgPositiveScorePerYear: number;
    avgNegativeScorePerYear: number;
    pctPositiveMonths: number;
    pctNegativeMonths: number;
  };
}

export interface HighlightsResponse {
  success: boolean;
  /** Yearly entries (~52 entries, months[] stripped to keep payload small) */
  yearlyTimeline: YearlyEntry[];
  /** Pre-computed summary: peak years, best average years, statistics */
  summary: HighlightsSummary;
  /** The year with the highest cumulative sumScore — includes months[] detail */
  biggestYear: YearlyEntry | null;
}

/**
 * Fetch highlights for a person by birth data.
 *
 * @example
 * const h = await fetchHighlights({
 *   birthDate: "1980-10-24",
 *   birthTime: "01:41",
 *   latitude: 50.85,
 *   longitude: 4.35,
 *   timezone: "Europe/Brussels",
 * });
 * console.log("Biggest year:", h?.biggestYear?.year);
 * console.log("Peak years:", h?.summary.peakYears.slice(0, 3));
 */
export async function fetchHighlights(birthData: {
  birthDate: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  username?: string;
}): Promise<HighlightsResponse | null> {
  try {
    const res = await fetch("/api/toctoc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: "toctoc-highlights", ...birthData }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Handle both flat and wrapped response shapes from the calculator
    return (data?.data ?? data) as HighlightsResponse;
  } catch {
    return null;
  }
}

/**
 * Given a highlights response, return the 3 busiest past years as simple
 * { year, age, label } objects — ready to display in the onboarding reveal.
 */
export function getBusiestPastYears(
  highlights: HighlightsResponse,
  currentYear = new Date().getFullYear(),
  count = 3,
): Array<{ year: number; age: number; sumScore: number; peakScore: number }> {
  return [...highlights.yearlyTimeline]
    .filter((e) => e.year < currentYear && e.isBusy)
    .sort((a, b) => b.sumScore - a.sumScore)
    .slice(0, count)
    .map((e) => ({ year: e.year, age: e.age, sumScore: e.sumScore, peakScore: e.peakMonthScore }));
}
