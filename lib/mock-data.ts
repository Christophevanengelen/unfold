/**
 * UNFOLD — Mock data matching the REAL TocToc API responses.
 *
 * Every object here mirrors the actual JSON from:
 *   - toctoc.php (events)
 *   - toctoc-app.php (sausages + natal context)
 *   - toctoc-year.php (3-year window)
 *   - toctoc-timeline.php (lifetime)
 *
 * Person: "Alex" — born 1980-10-24 01:41 Brussels
 */

import type {
  UserProfile,
  PersonInfo,
  TocTocSummary,
  DecadeTimeline,
  TransitEvent,
  StationEvent,
  EclipseEvent,
  ZREvent,
  AnyTocTocEvent,
  Sausage,
  NatalContext,
  HouseColors,
  MonthEntry,
  YearSummary,
  MonthlyEvent,
  TocTocYearData,
  TocTocAppData,
  Connection,
  NatalPoint,
  FortuneInfo,
} from "@/types/api";

// ─── User & Person ───────────────────────────────────────

export const mockUser: UserProfile = {
  id: "usr_demo_001",
  name: "Alex",
  inviteCode: "UNFOLD-AX7K",
  plan: "premium",
  locale: "fr",
  createdAt: "2026-01-15T00:00:00Z",
};

export const mockPerson: PersonInfo = {
  name: "Alex",
  birthDate: "1980-10-24",
  birthTime: "01:41",
  city: "Brussels",
  timezone: "Europe/Brussels",
};

// ─── Natal Points ────────────────────────────────────────

export const mockNatalPoints: Record<string, NatalPoint> = {
  Sun:     { longitude: 210.5, sign: "Scorpio",     degree: 0.5 },
  Moon:    { longitude: 45.2,  sign: "Taurus",      degree: 15.2 },
  Mercury: { longitude: 225.8, sign: "Scorpio",     degree: 15.8 },
  Venus:   { longitude: 188.3, sign: "Libra",       degree: 8.3 },
  Mars:    { longitude: 275.1, sign: "Capricorn",   degree: 5.1 },
  Jupiter: { longitude: 156.4, sign: "Virgo",       degree: 6.4 },
  Saturn:  { longitude: 190.7, sign: "Libra",       degree: 10.7 },
  ASC:     { longitude: 130.0, sign: "Leo",         degree: 10.0 },
  MC:      { longitude: 40.0,  sign: "Taurus",      degree: 10.0 },
};

// ─── Fortune Info ────────────────────────────────────────

export const mockFortuneInfo: FortuneInfo = {
  sign: "Aquarius",
  signIndex: 10,
  isDayChart: false,
  angularSigns: ["Leo", "Scorpio", "Aquarius", "Taurus"],
  natalSigns: { Sun: "Scorpio", Moon: "Taurus", ASC: "Leo" },
};

// ─── Natal Context (whole sign houses) ───────────────────

export const mockNatalContext: NatalContext = {
  Sun:     { houseLocated: 4,  housesRuled: [1],     topics: ["Foyer", "Identité"] },
  Moon:    { houseLocated: 10, housesRuled: [12],    topics: ["Carrière", "Intériorité"] },
  Mercury: { houseLocated: 4,  housesRuled: [2, 11], topics: ["Foyer", "Argent", "Réseau"] },
  Venus:   { houseLocated: 3,  housesRuled: [3, 10], topics: ["Communication", "Carrière"] },
  Mars:    { houseLocated: 6,  housesRuled: [4, 9],  topics: ["Quotidien", "Foyer", "Horizon"] },
  Jupiter: { houseLocated: 2,  housesRuled: [5, 8],  topics: ["Argent", "Créativité", "Transformations"] },
  Saturn:  { houseLocated: 3,  housesRuled: [6, 7],  topics: ["Communication", "Quotidien", "Couple"] },
  ASC:     { houseLocated: 1,  housesRuled: [],      topics: ["Identité"] },
  MC:      { houseLocated: 10, housesRuled: [],      topics: ["Carrière"] },
};

// ─── House Colors ────────────────────────────────────────

export const mockHouseColors: HouseColors = {
  "1":  "#EF4444", "2":  "#F97316", "3":  "#EAB308", "4":  "#22C55E",
  "5":  "#14B8A6", "6":  "#06B6D4", "7":  "#3B82F6", "8":  "#6366F1",
  "9":  "#8B5CF6", "10": "#A855F7", "11": "#D946EF", "12": "#EC4899",
};

// ─── Transit Events ──────────────────────────────────────

const transitPlutoSun: TransitEvent = {
  id: "tt_7", color: "#9B1C1C", groupId: "Pluto_conjunction_Sun",
  date: "2026-04-01", endDate: "2026-11-20",
  score: 4, label: "toc toc toc toc", category: "transit",
  type: "Pluto conjunction natal Sun",
  isPast: false, age: 45.6, intensityScore: 63000,
  transitPlanet: "Pluto", natalPoint: "Sun", aspect: "conjunction",
  parileDate: "2026-06-12",
  windowStart: "2026-05-13", windowEnd: "2026-07-12",
  exactDates: ["2026-06-12", "2026-09-03", "2026-11-18"],
  pattern: "Direct-Retrograde-Direct",
  bestOrb: 0.04, isReturn: false, isHalfReturn: false,
  isVipTransit: true, isAList: false,
};

const transitSaturnMoon: TransitEvent = {
  id: "tt_12", color: "#6B7280", groupId: "Saturn_square_Moon",
  date: "2025-08-15", endDate: "2025-09-10",
  score: 3, label: "toc toc toc", category: "transit",
  type: "Saturn square natal Moon",
  isPast: true, age: 44.8, intensityScore: -9100,
  transitPlanet: "Saturn", natalPoint: "Moon", aspect: "square",
  parileDate: "2025-08-28",
  windowStart: "2025-08-21", windowEnd: "2025-09-04",
  exactDates: ["2025-08-28"],
  pattern: "Single",
  bestOrb: 0.8, isReturn: false, isHalfReturn: false,
  isVipTransit: true, isAList: false,
};

const transitNeptuneMercury: TransitEvent = {
  id: "tt_15", color: "#1D4ED8", groupId: "Neptune_opposition_Mercury",
  date: "2026-01-10", endDate: "2026-03-20",
  score: 3, label: "toc toc toc", category: "transit",
  type: "Neptune opposition natal Mercury",
  isPast: false, age: 45.2, intensityScore: -31500,
  transitPlanet: "Neptune", natalPoint: "Mercury", aspect: "opposition",
  parileDate: "2026-02-15",
  windowStart: "2026-01-25", windowEnd: "2026-03-08",
  exactDates: ["2026-02-15"],
  pattern: "Single",
  bestOrb: 0.3, isReturn: false, isHalfReturn: false,
  isVipTransit: true, isAList: false,
};

const transitUranusVenus: TransitEvent = {
  id: "tt_18", color: "#0E7490", groupId: "Uranus_trine_Venus",
  date: "2027-03-01", endDate: "2027-04-15",
  score: 2, label: "toc toc", category: "transit",
  type: "Uranus trine natal Venus",
  isPast: false, age: 46.4, intensityScore: 23100,
  transitPlanet: "Uranus", natalPoint: "Venus", aspect: "trine",
  parileDate: "2027-03-22",
  windowStart: "2027-03-08", windowEnd: "2027-04-05",
  exactDates: ["2027-03-22"],
  pattern: "Single",
  bestOrb: 0.6, isReturn: false, isHalfReturn: false,
  isVipTransit: true, isAList: false,
};

const transitJupiterMars: TransitEvent = {
  id: "tt_20", color: "#7E22CE", groupId: "Jupiter_conjunction_Mars",
  date: "2026-09-01", endDate: "2026-09-20",
  score: 2, label: "toc toc", category: "transit",
  type: "Jupiter conjunction natal Mars",
  isPast: false, age: 45.9, intensityScore: 7350,
  transitPlanet: "Jupiter", natalPoint: "Mars", aspect: "conjunction",
  parileDate: "2026-09-10",
  windowStart: "2026-09-03", windowEnd: "2026-09-17",
  exactDates: ["2026-09-10"],
  pattern: "Single",
  bestOrb: 0.9, isReturn: false, isHalfReturn: false,
  isVipTransit: true, isAList: false,
};

const transitSaturnReturn: TransitEvent = {
  id: "tt_3", color: "#6B7280", groupId: "Saturn_conjunction_Saturn",
  date: "2009-09-01", endDate: "2010-08-15",
  score: 3, label: "toc toc toc", category: "transit",
  type: "Saturn Return (conjunction natal Saturn)",
  isPast: true, age: 29.0, intensityScore: 7840,
  transitPlanet: "Saturn", natalPoint: "Saturn", aspect: "conjunction",
  parileDate: "2009-11-15",
  windowStart: "2009-11-08", windowEnd: "2009-11-22",
  exactDates: ["2009-11-15", "2010-03-20", "2010-07-25"],
  pattern: "Direct-Retrograde-Direct",
  bestOrb: 0.1, isReturn: true, isHalfReturn: false,
  isVipTransit: false, isAList: false,
};

const transitNodeSun: TransitEvent = {
  id: "tt_25", color: "#D97706", groupId: "NorthNode_conjunction_Sun",
  date: "2025-04-01", endDate: "2025-05-10",
  score: 4, label: "toc toc toc toc", category: "transit",
  type: "North Node conjunction natal Sun",
  isPast: true, age: 44.5, intensityScore: 29400,
  transitPlanet: "North Node", natalPoint: "Sun", aspect: "conjunction",
  parileDate: "2025-04-20",
  windowStart: "2025-04-06", windowEnd: "2025-05-04",
  exactDates: ["2025-04-20"],
  pattern: "Single",
  bestOrb: 0.5, isReturn: false, isHalfReturn: false,
  isVipTransit: true, isAList: false,
};

// ─── Station Events ──────────────────────────────────────

const stationVenusMoon: StationEvent = {
  id: "tt_23", color: "#DB2777", groupId: "station_Venus_Moon",
  date: "2026-03-01", endDate: "2026-03-01",
  score: 2, label: "toc toc", category: "station",
  type: "Venus SD conjunct natal Moon",
  isPast: false, age: 45.4, intensityScore: 20,
  transitPlanet: "Venus", natalPoint: "Moon",
  stationType: "SD", orb: 0.9, transitLongitude: 15.7,
};

const stationMarsMercury: StationEvent = {
  id: "tt_30", color: "#DC2626", groupId: "station_Mars_Mercury",
  date: "2027-01-15", endDate: "2027-01-15",
  score: 1, label: "toc", category: "station",
  type: "Mars SR conjunct natal Mercury",
  isPast: false, age: 46.2, intensityScore: 10,
  transitPlanet: "Mars", natalPoint: "Mercury",
  stationType: "SR", orb: 1.4, transitLongitude: 225.0,
};

// ─── Eclipse Events ──────────────────────────────────────

const eclipseSolarAries: EclipseEvent = {
  id: "tt_31", color: "#D97706", groupId: "eclipse_1-7_2024",
  date: "2025-03-29", endDate: "2025-03-29",
  score: 1, label: "toc", category: "eclipse",
  type: "Solar Eclipse conjunct natal Sun",
  isPast: true, age: 44.4, intensityScore: 156,
  transitPlanet: "eclipse",
  eclipseType: "solar", eclipseLongitude: 8.9, eclipseSign: "Aries",
  eclipseAxis: "1-7", axisColor: "#EAB308",
  eclipseSeriesId: "eclipse_1-7_2024",
  eclipseSeriesStart: "2024-04-08", eclipseSeriesEnd: "2025-09-21",
  lastAxisTouch: "2025-09-21",
  natalPoint: "Sun", isVipNatal: true, isAngle: false,
  isVipAspect: true, orb: 3.2,
};

const eclipseLunarTaurus: EclipseEvent = {
  id: "tt_33", color: "#D97706", groupId: "eclipse_2-8_2025",
  date: "2025-09-07", endDate: "2025-09-07",
  score: 2, label: "toc toc", category: "eclipse",
  type: "Lunar Eclipse on natal Moon axis",
  isPast: true, age: 44.9, intensityScore: 120,
  transitPlanet: "eclipse",
  eclipseType: "lunar", eclipseLongitude: 44.8, eclipseSign: "Taurus",
  eclipseAxis: "2-8", axisColor: "#94A3B8",
  eclipseSeriesId: "eclipse_2-8_2025",
  eclipseSeriesStart: "2025-03-14", eclipseSeriesEnd: "2027-02-20",
  lastAxisTouch: "2027-02-20",
  natalPoint: "Moon", isVipNatal: true, isAngle: false,
  isVipAspect: true, orb: 0.4,
};

const eclipseSolarVirgo: EclipseEvent = {
  id: "tt_35", color: "#D97706", groupId: "eclipse_6-12_2027",
  date: "2027-02-06", endDate: "2027-02-06",
  score: 1, label: "toc", category: "eclipse",
  type: "Solar Eclipse in Virgo",
  isPast: false, age: 46.3, intensityScore: 60,
  transitPlanet: "eclipse",
  eclipseType: "solar", eclipseLongitude: 162.5, eclipseSign: "Virgo",
  eclipseAxis: "6-12", axisColor: "#9333EA",
  eclipseSeriesId: "eclipse_6-12_2027",
  eclipseSeriesStart: "2027-02-06", eclipseSeriesEnd: "2028-08-02",
  lastAxisTouch: "2028-08-02",
  natalPoint: "Jupiter", isVipNatal: true, isAngle: false,
  isVipAspect: false, orb: 6.1,
};

// ─── ZR Events ───────────────────────────────────────────

const zrFortuneLeo: ZREvent = {
  id: "tt_5", color: "#059669", groupId: "zr_fortune_Leo_L2",
  date: "2026-01-14", endDate: "2027-08-22",
  score: 3, label: "toc toc toc", category: "zr",
  type: "ZR L2 Peak — Leo (Fortune)",
  isPast: false, age: 45.2, intensityScore: 60,
  lotType: "fortune", level: 2, periodSign: "Leo",
  markers: [], isCulmination: false,
};

const zrSpiritScorpio: ZREvent = {
  id: "tt_8", color: "#059669", groupId: "zr_spirit_Scorpio_L2",
  date: "2024-06-01", endDate: "2025-12-15",
  score: 3, label: "toc toc toc", category: "zr",
  type: "ZR L2 Peak — Scorpio (Spirit)",
  isPast: true, age: 43.6, intensityScore: 60,
  lotType: "spirit", level: 2, periodSign: "Scorpio",
  markers: ["Cu"], isCulmination: true,
};

const zrErosCancer: ZREvent = {
  id: "tt_10", color: "#059669", groupId: "zr_eros_Cancer_L3",
  date: "2026-05-01", endDate: "2026-08-15",
  score: 2, label: "toc toc", category: "zr",
  type: "ZR L3 Peak — Cancer (Eros)",
  isPast: false, age: 45.5, intensityScore: 20,
  lotType: "eros", level: 3, periodSign: "Cancer",
  markers: [], isCulmination: false,
};

const zrFortuneMerged: ZREvent = {
  id: "tt_40", color: "#059669", groupId: "zr_fortune_eros_Aries_L2",
  date: "2019-03-01", endDate: "2021-07-15",
  score: 3, label: "toc toc toc", category: "zr",
  type: "ZR L2 Peak — Aries (Fortune + Eros)",
  isPast: true, age: 38.4, intensityScore: 60,
  lotType: ["fortune", "eros"], level: 2, periodSign: "Aries",
  markers: ["LB"], isCulmination: false,
};

const zrSpiritGemini: ZREvent = {
  id: "tt_42", color: "#059669", groupId: "zr_spirit_Gemini_L3",
  date: "2015-01-01", endDate: "2016-06-30",
  score: 2, label: "toc toc", category: "zr",
  type: "ZR L3 Peak — Gemini (Spirit)",
  isPast: true, age: 34.2, intensityScore: 20,
  lotType: "spirit", level: 3, periodSign: "Gemini",
  markers: [], isCulmination: false,
};

// ─── All Events (chronological) ──────────────────────────

export const mockEvents: AnyTocTocEvent[] = [
  transitSaturnReturn,   // 2009-2010 (past)
  zrSpiritGemini,        // 2015-2016 (past)
  zrFortuneMerged,       // 2019-2021 (past)
  zrSpiritScorpio,       // 2024-2025 (past)
  eclipseSolarAries,     // 2025-03 (past)
  transitNodeSun,        // 2025-04 (past)
  transitSaturnMoon,     // 2025-08 (past)
  eclipseLunarTaurus,    // 2025-09 (past)
  transitNeptuneMercury, // 2026-01 (current area)
  zrFortuneLeo,          // 2026-01 → 2027-08 (current)
  stationVenusMoon,      // 2026-03 (now)
  transitPlutoSun,       // 2026-04 → 2026-11 (upcoming, score 4!)
  zrErosCancer,          // 2026-05 → 2026-08
  transitJupiterMars,    // 2026-09
  stationMarsMercury,    // 2027-01
  eclipseSolarVirgo,     // 2027-02
  transitUranusVenus,    // 2027-03
].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

// ─── Summary ─────────────────────────────────────────────

export const mockSummary: TocTocSummary = {
  past:   { toc: 3, tocToc: 4, tocTocToc: 5, tocTocTocToc: 1 },
  future: { toc: 2, tocToc: 3, tocTocToc: 2, tocTocTocToc: 1 },
  total:  { toc: 5, tocToc: 7, tocTocToc: 7, tocTocTocToc: 2 },
};

// ─── Decade Timeline ─────────────────────────────────────

export const mockDecades: DecadeTimeline = {
  "0-10":  { toc: 1, tocToc: 0, tocTocToc: 0, tocTocTocToc: 0 },
  "10-20": { toc: 2, tocToc: 1, tocTocToc: 1, tocTocTocToc: 0 },
  "20-30": { toc: 3, tocToc: 3, tocTocToc: 2, tocTocTocToc: 0 },
  "30-40": { toc: 4, tocToc: 4, tocTocToc: 3, tocTocTocToc: 1 },
  "40-50": { toc: 5, tocToc: 5, tocTocToc: 4, tocTocTocToc: 2 },
  "50-60": { toc: 3, tocToc: 2, tocTocToc: 1, tocTocTocToc: 0 },
  "60-70": { toc: 2, tocToc: 1, tocTocToc: 0, tocTocTocToc: 0 },
  "70-80": { toc: 1, tocToc: 0, tocTocToc: 0, tocTocTocToc: 0 },
};

// ─── Helper: make MonthlyEvent from any event ────────────

function toMonthlyEvent(e: AnyTocTocEvent): MonthlyEvent {
  return {
    type: e.type,
    label: e.label,
    score: e.score,
    category: e.category,
    color: e.color,
    exactDate: e.category === "transit" ? (e as TransitEvent).parileDate : (e.category === "station" ? e.date : null),
    periodStart: e.category === "zr" ? e.date : null,
    periodEnd: e.category === "zr" ? e.endDate : null,
    cyclePassNumber: e.category === "transit" ? 1 : null,
    cyclePasses: e.category === "transit" ? (e as TransitEvent).exactDates.length : null,
    pattern: e.category === "transit" ? (e as TransitEvent).pattern : null,
    eclipseAxis: e.category === "eclipse" ? (e as EclipseEvent).eclipseAxis : null,
    axisColor: e.category === "eclipse" ? (e as EclipseEvent).axisColor : null,
    lotType: e.category === "zr" ? (Array.isArray((e as ZREvent).lotType) ? ((e as ZREvent).lotType as string[])[0] : (e as ZREvent).lotType as string) as MonthlyEvent["lotType"] : null,
    level: e.category === "zr" ? (e as ZREvent).level : null,
    periodSign: e.category === "zr" ? (e as ZREvent).periodSign : null,
    markers: e.category === "zr" ? (e as ZREvent).markers : null,
    isCulmination: e.category === "zr" ? (e as ZREvent).isCulmination : false,
  };
}

// ─── Mock toctoc-year.php response ───────────────────────

function buildMockMonths(): MonthEntry[] {
  const months: MonthEntry[] = [];
  for (let y = 2025; y <= 2027; y++) {
    for (let m = 1; m <= 12; m++) {
      const monthStr = `${y}-${String(m).padStart(2, "0")}`;
      const monthDate = new Date(y, m - 1, 15);
      const age = 44 + (monthDate.getTime() - new Date(1980, 9, 24).getTime()) / (365.25 * 24 * 3600 * 1000);

      // Find events active this month
      const activeEvents = mockEvents.filter(e => {
        const start = new Date(e.date);
        const end = new Date(e.endDate);
        const monthStart = new Date(y, m - 1, 1);
        const monthEnd = new Date(y, m, 0);
        return start <= monthEnd && end >= monthStart;
      });

      const topEvents = activeEvents.map(toMonthlyEvent);
      const zrScore = activeEvents.filter(e => e.category === "zr").reduce((s, e) => s + e.intensityScore, 0);
      const transitScore = activeEvents.filter(e => e.category !== "zr").reduce((s, e) => s + e.intensityScore, 0);

      months.push({
        month: monthStr,
        year: y,
        monthNum: m,
        zrScore,
        transitScore,
        totalScore: zrScore + transitScore,
        age: Math.round(age * 10) / 10,
        isPast: monthDate < new Date(),
        isCurrentMonth: monthStr === "2026-03",
        topEvents,
      });
    }
  }
  return months;
}

const mockMonths = buildMockMonths();

// ─── Mock Year Summaries ─────────────────────────────────

function buildYearSummaries(): YearSummary[] {
  return [2025, 2026, 2027].map(year => {
    const yearMonths = mockMonths.filter(m => m.year === year);
    const scores = yearMonths.map(m => m.totalScore);
    const peakIdx = scores.indexOf(Math.max(...scores));
    const positive = yearMonths.filter(m => m.totalScore > 0);
    const negative = yearMonths.filter(m => m.totalScore < 0);
    return {
      year,
      sumScore: scores.reduce((a, b) => a + b, 0),
      isBusy: scores.some(s => Math.abs(s) > 10000),
      peakMonthScore: scores[peakIdx] ?? 0,
      peakMonth: yearMonths[peakIdx]?.month ?? `${year}-01`,
      avgMonthScore: Math.round(scores.reduce((a, b) => a + b, 0) / 12),
      positiveMonths: positive.length,
      negativeMonths: negative.length,
      age: year - 1980,
      monthCount: 12,
      sumPositive: positive.reduce((s, m) => s + m.totalScore, 0),
      sumNegative: negative.reduce((s, m) => s + m.totalScore, 0),
      neutralMonths: yearMonths.filter(m => m.totalScore === 0).length,
    };
  });
}

// ─── Current Month ───────────────────────────────────────

const currentMonth = mockMonths.find(m => m.isCurrentMonth) ?? mockMonths[0];

// ─── Peak Upcoming Months ────────────────────────────────

const peakUpcoming = mockMonths
  .filter(m => !m.isPast && !m.isCurrentMonth && m.totalScore > 0)
  .sort((a, b) => b.totalScore - a.totalScore)
  .slice(0, 3);

// ─── Full toctoc-year Response ───────────────────────────

export const mockTocTocYear: TocTocYearData = {
  person: mockPerson,
  window: {
    startDate: "2025-01-01",
    endDate: "2027-12-31",
    years: [2025, 2026, 2027],
    monthCount: 36,
  },
  fortuneInfo: mockFortuneInfo,
  currentMonth,
  peakUpcomingMonths: peakUpcoming,
  years: buildYearSummaries(),
  months: mockMonths,
  computeTimeSeconds: 3.2,
};

// ─── Sausages (enriched events from toctoc-app) ─────────

function eventToSausage(e: AnyTocTocEvent): Sausage {
  const width = e.score >= 4 ? "large" : e.score >= 3 ? "medium" : "thin";
  const topics: string[] = [];

  if (e.category === "transit" || e.category === "station") {
    const np = e.category === "transit" ? (e as TransitEvent).natalPoint : (e as StationEvent).natalPoint;
    const ctx = mockNatalContext[np];
    if (ctx) topics.push(...ctx.topics);
  } else if (e.category === "zr") {
    // ZR topics from house of period sign (simplified for mock)
    topics.push("Circonstances");
  } else if (e.category === "eclipse") {
    const ec = e as EclipseEvent;
    const [h1, h2] = ec.eclipseAxis.split("-");
    topics.push(`Axe ${h1}-${h2}`);
  }

  return {
    ...e,
    width,
    topics: topics.map((t, i) => ({ house: (i + 1) as number, color: e.color, label: t })),
    cycle: e.category === "transit" ? {
      hitNumber: 1,
      totalHits: (e as TransitEvent).exactDates.length,
      pattern: (e as TransitEvent).pattern,
      allHits: (e as TransitEvent).exactDates.map((d, i) => ({ date: d, hitNumber: i + 1 })),
    } : undefined,
  };
}

export const mockSausages: Sausage[] = mockEvents.map(eventToSausage);

// ─── Full toctoc-app Response ────────────────────────────

export const mockTocTocApp: TocTocAppData = {
  person: mockPerson,
  natalPoints: mockNatalPoints,
  natalContext: mockNatalContext,
  houseColors: mockHouseColors,
  allSausages: mockSausages,
  months: Object.fromEntries(
    mockMonths.map(m => [m.month, {
      sausages: mockSausages.filter(s => {
        const start = new Date(s.date);
        const end = new Date(s.endDate);
        const [y, mo] = m.month.split("-").map(Number);
        const monthStart = new Date(y, mo - 1, 1);
        const monthEnd = new Date(y, mo, 0);
        return start <= monthEnd && end >= monthStart;
      }),
      monthScore: m.totalScore,
      transitScore: m.transitScore,
      zrScore: m.zrScore,
    }])
  ),
  cycles: Object.fromEntries(
    mockSausages
      .filter(s => s.category === "transit")
      .reduce((acc, s) => {
        if (!acc.has(s.groupId)) acc.set(s.groupId, []);
        acc.get(s.groupId)!.push(s);
        return acc;
      }, new Map<string, Sausage[]>())
  ),
  summary: mockSummary,
  timeline: { decades: mockDecades },
  computeTimeSeconds: 45.2,
};

// ─── Connections (for compatibility feature) ─────────────

export const mockConnections: Connection[] = [
  {
    id: "conn_jordan", name: "Jordan", initial: "J",
    relationship: "partner", status: "connected",
    connectedSince: "2026-01-20T00:00:00Z",
    todayAlignment: 87, todayInsight: "Deep emotional resonance today — great day to connect.", score: 87,
    birthData: {
      birthDate: "1982-05-15", birthTime: "14:30",
      latitude: 48.8566, longitude: 2.3522, timezone: "Europe/Paris",
    },
  },
  {
    id: "conn_sam", name: "Sam", initial: "S",
    relationship: "friend", status: "connected",
    connectedSince: "2026-02-05T00:00:00Z",
    todayAlignment: 74, todayInsight: "Energy patterns complement each other — good for activities.", score: 74,
    birthData: {
      birthDate: "1985-11-03", birthTime: "08:15",
      latitude: 51.5074, longitude: -0.1278, timezone: "Europe/London",
    },
  },
  {
    id: "conn_maya", name: "Maya", initial: "M",
    relationship: "colleague", status: "connected",
    connectedSince: "2026-02-14T00:00:00Z",
    todayAlignment: 81, todayInsight: "Professional alignment is strong today.", score: 81,
  },
];

// ─── BACKWARD COMPAT EXPORTS (old pre-TocToc API shapes) ─────
// TODO: Remove once old components are fully migrated.

import type { DailyMomentum, StructuredInsight, DomainDetail } from "@/types/api";

/** @deprecated Use mockTocTocYear.currentMonth instead */
export const mockToday: DailyMomentum = {
  overall: 78,
  insight: "Strong creative momentum today — ideal for big decisions.",
  scores: {
    love:   { value: 82, label: "Love" },
    health: { value: 71, label: "Health" },
    work:   { value: 80, label: "Work" },
  },
};

/** @deprecated */
export const mockYesterday: DailyMomentum = {
  overall: 72,
  insight: "A quieter day — recovery phase.",
  scores: {
    love:   { value: 75, label: "Love" },
    health: { value: 68, label: "Health" },
    work:   { value: 73, label: "Work" },
  },
};

/** @deprecated */
export const mockTomorrow: DailyMomentum = {
  overall: 85,
  insight: "Peak day incoming — momentum builds.",
  scores: {
    love:   { value: 88, label: "Love" },
    health: { value: 80, label: "Health" },
    work:   { value: 87, label: "Work" },
  },
};

/** @deprecated */
export const mockDeltas = { overall: 6, love: 7, health: 3, work: 7 };

/** @deprecated */
export const mockTrend = [65, 70, 72, 78, 85, 80, 77];

/** @deprecated */
export const mockStructuredInsights: StructuredInsight[] = [
  { domain: "love",   title: "Heart opening",    body: "Venus trine Moon amplifies emotional connections.", score: 82 },
  { domain: "health", title: "Recovery phase",    body: "Saturn eases, giving space for physical renewal.",  score: 71 },
  { domain: "work",   title: "Creative surge",    body: "Jupiter energy fuels bold professional moves.",     score: 80 },
];

/** @deprecated */
export const mockDomainDetails: Record<string, DomainDetail> = {
  love:   { domain: "love",   score: 82, trend: "up",     insights: [mockStructuredInsights[0]] },
  health: { domain: "health", score: 71, trend: "stable", insights: [mockStructuredInsights[1]] },
  work:   { domain: "work",   score: 80, trend: "up",     insights: [mockStructuredInsights[2]] },
};

/** @deprecated */
export const mockForecast = [
  { date: "Mon", momentum: 78, isPeak: false },
  { date: "Tue", momentum: 82, isPeak: false },
  { date: "Wed", momentum: 91, isPeak: true },
  { date: "Thu", momentum: 85, isPeak: false },
  { date: "Fri", momentum: 79, isPeak: false },
  { date: "Sat", momentum: 88, isPeak: true },
  { date: "Sun", momentum: 74, isPeak: false },
];

/** @deprecated Use CompatibilityResult instead */
export const mockCompatibility = {
  score: 87,
  partnerName: "Jordan",
  synergies: [
    { axis: "love",   score: 92, strength: "strong" as const },
    { axis: "health", score: 78, strength: "moderate" as const },
    { axis: "work",   score: 91, strength: "strong" as const },
  ],
};

/** @deprecated Use CompatibilityResult instead */
export const mockCompatibilityResults: Record<string, {
  score: number;
  synergies: { axis: string; score: number; strength: string; description: string }[];
  weeklySync: { day: string; alex: number; partner: number }[];
  whatMakesYouWork?: string;
  bestDaysTogether?: { date: string; alex: number; partner: number; context: string }[];
}> = {
  conn_jordan: {
    score: 87,
    synergies: [
      { axis: "love",   score: 92, strength: "strong",     description: "Deep emotional resonance — your rhythms align naturally." },
      { axis: "health", score: 78, strength: "moderate",   description: "Complementary energy patterns with some tension points." },
      { axis: "work",   score: 91, strength: "strong",     description: "Powerful professional synergy — great for collaborations." },
    ],
    weeklySync: [
      { day: "Mon", alex: 72, partner: 68 },
      { day: "Tue", alex: 78, partner: 82 },
      { day: "Wed", alex: 85, partner: 80 },
      { day: "Thu", alex: 80, partner: 85 },
      { day: "Fri", alex: 76, partner: 79 },
      { day: "Sat", alex: 88, partner: 90 },
      { day: "Sun", alex: 70, partner: 65 },
    ],
  },
  conn_sam: {
    score: 74,
    synergies: [
      { axis: "love",   score: 68, strength: "developing", description: "Growing connection — needs attention." },
      { axis: "health", score: 82, strength: "strong",     description: "Great workout partners — similar energy cycles." },
      { axis: "work",   score: 72, strength: "moderate",   description: "Different approaches but complementary strengths." },
    ],
    weeklySync: [
      { day: "Mon", alex: 72, partner: 75 },
      { day: "Tue", alex: 78, partner: 70 },
      { day: "Wed", alex: 85, partner: 82 },
      { day: "Thu", alex: 80, partner: 78 },
      { day: "Fri", alex: 76, partner: 80 },
      { day: "Sat", alex: 88, partner: 72 },
      { day: "Sun", alex: 70, partner: 76 },
    ],
  },
  conn_maya: {
    score: 81,
    synergies: [
      { axis: "love",   score: 75, strength: "moderate",   description: "Warm connection with good rapport." },
      { axis: "health", score: 80, strength: "strong",     description: "Motivating presence — energizes each other." },
      { axis: "work",   score: 88, strength: "strong",     description: "Excellent professional alignment." },
    ],
    weeklySync: [
      { day: "Mon", alex: 72, partner: 80 },
      { day: "Tue", alex: 78, partner: 76 },
      { day: "Wed", alex: 85, partner: 88 },
      { day: "Thu", alex: 80, partner: 82 },
      { day: "Fri", alex: 76, partner: 78 },
      { day: "Sat", alex: 88, partner: 85 },
      { day: "Sun", alex: 70, partner: 72 },
    ],
  },
};
