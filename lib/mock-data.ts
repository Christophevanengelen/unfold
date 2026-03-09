import type {
  DailyMomentum,
  MomentumTrend,
  CompatibilityResult,
  ForecastWindow,
  MonthlyMap,
  PeakAlert,
  UserProfile,
} from "@/types/api";

// ─── Mock User ──────────────────────────────────────────────
export const mockUser: UserProfile = {
  id: "usr_demo_001",
  name: "Alex",
  inviteCode: "UNFOLD-AX7K",
  plan: "premium",
  locale: "en",
  createdAt: "2026-01-15T00:00:00Z",
};

// ─── Yesterday / Today / Tomorrow ───────────────────────────
export const mockYesterday: DailyMomentum = {
  date: "2026-03-08",
  scores: {
    love: { value: 72, trend: "stable", peakHour: 19, description: "Steady emotional connections" },
    health: { value: 85, trend: "rising", peakHour: 7, description: "High physical vitality" },
    work: { value: 61, trend: "declining", peakHour: 14, description: "Creative blocks easing" },
  },
  overall: 73,
  insight: "Your health momentum peaked early — mornings were your window.",
};

export const mockToday: DailyMomentum = {
  date: "2026-03-09",
  scores: {
    love: { value: 78, trend: "rising", peakHour: 20, description: "Strong relational momentum" },
    health: { value: 69, trend: "stable", peakHour: 10, description: "Balanced energy levels" },
    work: { value: 82, trend: "rising", peakHour: 11, description: "Peak creative clarity" },
  },
  overall: 76,
  insight: "Your work momentum is rising — late morning is your peak window.",
};

export const mockTomorrow: DailyMomentum = {
  date: "2026-03-10",
  scores: {
    love: { value: 84, trend: "rising", peakHour: 18, description: "Deepening connections ahead" },
    health: { value: 71, trend: "stable", peakHour: 8, description: "Steady vitality" },
    work: { value: 67, trend: "declining", peakHour: 15, description: "Strategic pause recommended" },
  },
  overall: 74,
  insight: "Tomorrow favors love — evening is your strongest relational window.",
};

// ─── Trend Data ─────────────────────────────────────────────
export const mockTrend: MomentumTrend = {
  period: { from: "2026-03-03", to: "2026-03-09" },
  dataPoints: [
    { date: "2026-03-03", love: 65, health: 70, work: 75, overall: 70 },
    { date: "2026-03-04", love: 68, health: 72, work: 71, overall: 70 },
    { date: "2026-03-05", love: 74, health: 68, work: 78, overall: 73 },
    { date: "2026-03-06", love: 71, health: 80, work: 69, overall: 73 },
    { date: "2026-03-07", love: 69, health: 83, work: 65, overall: 72 },
    { date: "2026-03-08", love: 72, health: 85, work: 61, overall: 73 },
    { date: "2026-03-09", love: 78, health: 69, work: 82, overall: 76 },
  ],
};

// ─── Compatibility ──────────────────────────────────────────
export const mockCompatibility: CompatibilityResult = {
  score: 87,
  partnerName: "Jordan",
  synergies: [
    { axis: "love", strength: "strong", description: "Deep emotional resonance" },
    { axis: "work", strength: "moderate", description: "Complementary creative rhythms" },
    { axis: "health", strength: "developing", description: "Growing vitality alignment" },
  ],
  sharedPeaks: ["2026-03-12", "2026-03-18", "2026-03-24"],
};

// ─── Premium: 7-Day Forecast ────────────────────────────────
export const mockForecast: ForecastWindow[] = [
  { date: "2026-03-10", momentum: 74, isPeak: false, peakAxes: [], recommendation: "Focus on relationships" },
  { date: "2026-03-11", momentum: 79, isPeak: false, peakAxes: ["work"], recommendation: "Great day for presentations" },
  { date: "2026-03-12", momentum: 91, isPeak: true, peakAxes: ["love", "work"], recommendation: "Exceptional day — seize the moment" },
  { date: "2026-03-13", momentum: 72, isPeak: false, peakAxes: [], recommendation: "Recovery and reflection" },
  { date: "2026-03-14", momentum: 68, isPeak: false, peakAxes: [], recommendation: "Prioritize rest" },
  { date: "2026-03-15", momentum: 83, isPeak: false, peakAxes: ["health"], recommendation: "Peak energy for exercise" },
  { date: "2026-03-16", momentum: 88, isPeak: true, peakAxes: ["love"], recommendation: "Ideal for meaningful conversations" },
];

// ─── Premium: Monthly Map ───────────────────────────────────
export const mockMonthlyMap: MonthlyMap = {
  month: "2026-03",
  days: Array.from({ length: 31 }, (_, i) => ({
    date: `2026-03-${String(i + 1).padStart(2, "0")}`,
    overall: Math.round(55 + Math.random() * 40),
    isPeak: [3, 12, 16, 22, 28].includes(i + 1),
    isLow: [7, 14, 20].includes(i + 1),
  })),
  summary: {
    peakDays: 5,
    averageMomentum: 74,
    bestAxis: "love",
    trend: "ascending",
  },
};

// ─── Premium: Peak Alerts ───────────────────────────────────
export const mockAlerts: PeakAlert[] = [
  { id: "alert_1", date: "2026-03-12", time: "11:00", axis: "work", intensity: "exceptional", message: "Exceptional creative window approaching" },
  { id: "alert_2", date: "2026-03-12", time: "19:00", axis: "love", intensity: "strong", message: "Strong relational momentum tonight" },
  { id: "alert_3", date: "2026-03-16", time: "18:00", axis: "love", intensity: "exceptional", message: "Peak connection window this weekend" },
];
