import type {
  Connection,
  DailyMomentum,
  MomentumTrend,
  CompatibilityResult,
  ForecastWindow,
  MonthlyMap,
  PeakAlert,
  UserProfile,
  StructuredInsight,
  DomainDetail,
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
  label: "Health led the day",
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
  label: "Strong work momentum",
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
  label: "Love is building",
};

// ─── Trend Data ─────────────────────────────────────────────
export const mockTrend: MomentumTrend = {
  period: { from: "2026-03-03", to: "2026-03-09" },
  dataPoints: [
    { date: "2026-03-03", love: 68, health: 72, work: 74, overall: 71 },
    { date: "2026-03-04", love: 62, health: 68, work: 70, overall: 67 },
    { date: "2026-03-05", love: 70, health: 65, work: 68, overall: 68 },
    { date: "2026-03-06", love: 82, health: 78, work: 85, overall: 82 },
    { date: "2026-03-07", love: 75, health: 80, work: 72, overall: 76 },
    { date: "2026-03-08", love: 64, health: 70, work: 62, overall: 65 },
    { date: "2026-03-09", love: 78, health: 69, work: 82, overall: 76 },
  ],
};

// ─── Connections ────────────────────────────────────────────
export const mockConnections: Connection[] = [
  {
    id: "conn_jordan",
    name: "Jordan",
    initial: "J",
    relationship: "partner",
    status: "connected",
    score: 87,
    todayAlignment: 92,
    todayInsight: "Both peaking in Work — great day to collaborate",
    connectedSince: "2026-01-20T00:00:00Z",
  },
  {
    id: "conn_sam",
    name: "Sam",
    initial: "S",
    relationship: "friend",
    status: "connected",
    score: 74,
    todayAlignment: 68,
    todayInsight: "Your Health rhythms align — go for a run together",
    connectedSince: "2026-02-05T00:00:00Z",
  },
  {
    id: "conn_maya",
    name: "Maya",
    initial: "M",
    relationship: "colleague",
    status: "connected",
    score: 81,
    todayAlignment: 85,
    todayInsight: "Strong Work alignment — schedule that key meeting",
    connectedSince: "2026-02-14T00:00:00Z",
  },
  {
    id: "conn_chris",
    name: "Chris",
    initial: "C",
    relationship: "family",
    status: "pending",
    score: 0,
    todayAlignment: 0,
    todayInsight: "Invite pending — check in with Chris",
    connectedSince: "2026-03-15T00:00:00Z",
  },
];

// ─── Compatibility Results (per connection) ─────────────────
export const mockCompatibilityResults: Record<string, CompatibilityResult> = {
  conn_jordan: {
    connectionId: "conn_jordan",
    score: 87,
    partnerName: "Jordan",
    synergies: [
      { axis: "love", strength: "strong", description: "Deep emotional resonance" },
      { axis: "work", strength: "moderate", description: "Complementary creative rhythms" },
      { axis: "health", strength: "developing", description: "Growing vitality alignment" },
    ],
    sharedPeaks: ["2026-03-12", "2026-03-18", "2026-03-24"],
    whatMakesYouWork: "You balance each other — when Alex peaks in work, Jordan's love energy creates grounding.",
    bestDaysTogether: [
      { date: "2026-03-12", context: "Both peak in love — ideal for deep conversations" },
      { date: "2026-03-18", context: "Shared work momentum — great for collaboration" },
      { date: "2026-03-24", context: "Aligned vitality — perfect for an active day together" },
    ],
  },
  conn_sam: {
    connectionId: "conn_sam",
    score: 74,
    partnerName: "Sam",
    synergies: [
      { axis: "love", strength: "moderate", description: "Warm emotional support" },
      { axis: "work", strength: "developing", description: "Different work rhythms" },
      { axis: "health", strength: "strong", description: "Shared vitality peaks" },
    ],
    sharedPeaks: ["2026-03-15", "2026-03-22"],
    whatMakesYouWork: "Your health rhythms sync naturally — you push each other to stay active.",
    bestDaysTogether: [
      { date: "2026-03-15", context: "Shared health peak — perfect for outdoor activity" },
      { date: "2026-03-22", context: "Both feeling social — ideal for group plans" },
    ],
  },
  conn_maya: {
    connectionId: "conn_maya",
    score: 81,
    partnerName: "Maya",
    synergies: [
      { axis: "love", strength: "developing", description: "Building trust over time" },
      { axis: "work", strength: "strong", description: "Creative powerhouse together" },
      { axis: "health", strength: "moderate", description: "Balanced energy patterns" },
    ],
    sharedPeaks: ["2026-03-11", "2026-03-19", "2026-03-25"],
    whatMakesYouWork: "Your work signals amplify each other — meetings on aligned days produce breakthrough ideas.",
    bestDaysTogether: [
      { date: "2026-03-11", context: "Both in creative flow — brainstorm day" },
      { date: "2026-03-19", context: "Work peak overlap — tackle the hardest problem" },
      { date: "2026-03-25", context: "Balanced momentum — good for planning sessions" },
    ],
  },
};

// Legacy alias — components that import mockCompatibility still work
export const mockCompatibility: CompatibilityResult = mockCompatibilityResults.conn_jordan;

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

// ─── 30-Day Trend (Premium) ─────────────────────────────────
export const mockTrend30D: MomentumTrend = {
  period: { from: "2026-02-08", to: "2026-03-09" },
  dataPoints: [
    { date: "2026-02-08", love: 60, health: 65, work: 70, overall: 65 },
    { date: "2026-02-09", love: 63, health: 68, work: 66, overall: 66 },
    { date: "2026-02-10", love: 58, health: 72, work: 63, overall: 64 },
    { date: "2026-02-11", love: 62, health: 70, work: 68, overall: 67 },
    { date: "2026-02-12", love: 67, health: 66, work: 74, overall: 69 },
    { date: "2026-02-13", love: 71, health: 64, work: 77, overall: 71 },
    { date: "2026-02-14", love: 80, health: 62, work: 72, overall: 71 },
    { date: "2026-02-15", love: 76, health: 67, work: 69, overall: 71 },
    { date: "2026-02-16", love: 72, health: 71, work: 65, overall: 69 },
    { date: "2026-02-17", love: 68, health: 74, work: 62, overall: 68 },
    { date: "2026-02-18", love: 64, health: 78, work: 60, overall: 67 },
    { date: "2026-02-19", love: 61, health: 80, work: 64, overall: 68 },
    { date: "2026-02-20", love: 66, health: 76, work: 70, overall: 71 },
    { date: "2026-02-21", love: 70, health: 73, work: 75, overall: 73 },
    { date: "2026-02-22", love: 74, health: 69, work: 79, overall: 74 },
    { date: "2026-02-23", love: 77, health: 65, work: 82, overall: 75 },
    { date: "2026-02-24", love: 73, health: 68, work: 78, overall: 73 },
    { date: "2026-02-25", love: 69, health: 72, work: 74, overall: 72 },
    { date: "2026-02-26", love: 65, health: 76, work: 70, overall: 70 },
    { date: "2026-02-27", love: 62, health: 79, work: 66, overall: 69 },
    { date: "2026-02-28", love: 66, health: 82, work: 63, overall: 70 },
    { date: "2026-03-01", love: 70, health: 78, work: 67, overall: 72 },
    { date: "2026-03-02", love: 73, health: 74, work: 71, overall: 73 },
    { date: "2026-03-03", love: 65, health: 70, work: 75, overall: 70 },
    { date: "2026-03-04", love: 68, health: 72, work: 71, overall: 70 },
    { date: "2026-03-05", love: 74, health: 68, work: 78, overall: 73 },
    { date: "2026-03-06", love: 71, health: 80, work: 69, overall: 73 },
    { date: "2026-03-07", love: 69, health: 83, work: 65, overall: 72 },
    { date: "2026-03-08", love: 72, health: 85, work: 61, overall: 73 },
    { date: "2026-03-09", love: 78, health: 69, work: 82, overall: 76 },
  ],
};

// ─── Deltas (Today - Yesterday) ─────────────────────────────
export const mockDeltas = {
  love: mockToday.scores.love.value - mockYesterday.scores.love.value,     // +6
  health: mockToday.scores.health.value - mockYesterday.scores.health.value, // -16
  work: mockToday.scores.work.value - mockYesterday.scores.work.value,     // +21
  overall: mockToday.overall - mockYesterday.overall,                       // +3
};

// ─── Enhanced Insights ──────────────────────────────────────
export const mockInsightsEnhanced = {
  today: "Work jumped +21 points since yesterday. You're approaching a peak \u2014 protect your 11am focus window. Health dipped, though \u2014 consider a short walk today.",
  yesterday: "Your health peaked at 85 yesterday morning but dropped today. Sleep quality may be the driver. Love stayed steady \u2014 evening connections were strong.",
  crossDomain: "When your Work score rises fast (+21), Health often dips the next day. Pacing your energy across both could sustain the momentum longer.",
};

// ─── Weekly Recap ───────────────────────────────────────────
export const mockWeeklyRecap = {
  period: { from: "2026-03-03", to: "2026-03-09" },
  bestDay: { date: "2026-03-09", overall: 76, highlight: "Work" },
  worstDay: { date: "2026-03-04", overall: 70, highlight: "Work" },
  longestStreak: { axis: "health" as const, days: 3, label: "Health above 70" },
  mostImproved: { axis: "work" as const, delta: 21, label: "Work +21 in one day" },
  averageMomentum: 73,
  peakDays: 1,
};

// ─── Daily Signal ────────────────────────────────────────────
export const mockSignal = {
  strongestAxis: "work" as const,
  peakHour: 11,
  signalText: "Today favors Work. Peak window: 11am.",
  actionText: "Block 10-12 for your most important creative task.",
};

// ─── Structured Insights (4-line mini-reports) ──────────────
type TimeView = "yesterday" | "today" | "tomorrow";
type DomainOrOverall = "overall" | "love" | "health" | "work";

export const mockStructuredInsights: Record<TimeView, Record<DomainOrOverall, StructuredInsight>> = {
  yesterday: {
    overall: {
      mainRead: "Yesterday was a health day.",
      bestWindow: "Your peak hit at 7am.",
      suggestedMove: "Morning energy drove the day.",
      caution: "Work stayed lower — creative blocks were present.",
    },
    love: {
      mainRead: "Love held steady yesterday.",
      bestWindow: "Evening connections were strongest around 7pm.",
      suggestedMove: "Conversations carried warmth late in the day.",
      caution: "Morning clarity was lower — timing mattered.",
    },
    health: {
      mainRead: "Health peaked yesterday morning.",
      bestWindow: "Your strongest window was around 7am.",
      suggestedMove: "Physical energy was high — morning movement paid off.",
      caution: "Energy dropped by afternoon.",
    },
    work: {
      mainRead: "Work was quieter yesterday.",
      bestWindow: "A small window opened around 2pm.",
      suggestedMove: "Afternoon brought some focus back.",
      caution: "Creative blocks made deep work difficult.",
    },
  },
  today: {
    overall: {
      mainRead: "Today favors Work.",
      bestWindow: "Peak around 11am.",
      suggestedMove: "Protect 10-12 for your most important creative task.",
      caution: "Energy may soften after lunch.",
    },
    love: {
      mainRead: "Love gains momentum tonight.",
      bestWindow: "Conversations flow better after 8pm.",
      suggestedMove: "Save meaningful exchanges for the evening.",
      caution: "Don't force clarity too early in the day.",
    },
    health: {
      mainRead: "Health stays steady today.",
      bestWindow: "Morning supports balance and reset.",
      suggestedMove: "Use the morning for movement or recovery.",
      caution: "Avoid overloading the second half of the day.",
    },
    work: {
      mainRead: "Work is strongest today.",
      bestWindow: "Peak around 11am.",
      suggestedMove: "Protect 10-12 for focused, high-value work.",
      caution: "Energy may soften after lunch — avoid stacking meetings.",
    },
  },
  tomorrow: {
    overall: {
      mainRead: "Tomorrow opens for Love.",
      bestWindow: "Evening is your strongest window.",
      suggestedMove: "Plan meaningful conversations for after 6pm.",
      caution: "Work momentum dips — avoid big decisions.",
    },
    love: {
      mainRead: "A strong love window is opening.",
      bestWindow: "Evening around 6pm builds momentum.",
      suggestedMove: "Plan a meaningful connection for tomorrow night.",
      caution: "Morning may feel slower — patience helps.",
    },
    health: {
      mainRead: "Health holds steady tomorrow.",
      bestWindow: "Morning around 8am supports vitality.",
      suggestedMove: "Start with gentle movement or a reset routine.",
      caution: "Avoid pushing too hard in the afternoon.",
    },
    work: {
      mainRead: "Work slows down tomorrow.",
      bestWindow: "A small window opens around 3pm.",
      suggestedMove: "Use it for light planning, not heavy execution.",
      caution: "Creative energy is lower — save big tasks for another day.",
    },
  },
};

// ─── Domain Detail Reports (satellite tap) ──────────────────
export const mockDomainDetails: Record<TimeView, Record<"love" | "health" | "work", DomainDetail>> = {
  yesterday: {
    love: {
      scoreTitle: "Love held steady yesterday",
      whatItMeans: "Emotional connections were present but not at their peak.",
      bestUse: "Evening conversations carried the most warmth.",
      watchOut: "Morning clarity was lower, making important talks harder.",
      whenItGetsBetter: "Today brings rising momentum — tonight is stronger.",
      premiumTeaser: "Unlock future peaks and timing windows.",
    },
    health: {
      scoreTitle: "Health peaked yesterday",
      whatItMeans: "Physical vitality was high, especially in the morning.",
      bestUse: "Early movement and activity had the best returns.",
      watchOut: "Energy dropped significantly by afternoon.",
      whenItGetsBetter: "Today is steadier — morning still supports balance.",
      premiumTeaser: "Unlock future peaks and timing windows.",
    },
    work: {
      scoreTitle: "Work was quieter yesterday",
      whatItMeans: "Creative blocks made focused output harder than usual.",
      bestUse: "A small afternoon window offered some concentration.",
      watchOut: "Forcing deep work in the morning backfired.",
      whenItGetsBetter: "Today brings a strong surge — protect your late morning.",
      premiumTeaser: "Unlock future peaks and timing windows.",
    },
  },
  today: {
    love: {
      scoreTitle: "Love is rising today",
      whatItMeans: "Relational momentum builds through the day, peaking tonight.",
      bestUse: "Save meaningful conversations for after 8pm.",
      watchOut: "Don't force emotional clarity too early — evening is better.",
      whenItGetsBetter: "Tomorrow evening is even stronger for connection.",
      premiumTeaser: "Unlock future peaks and timing windows.",
    },
    health: {
      scoreTitle: "Health stays steady today",
      whatItMeans: "Energy levels are balanced — not a peak, but reliable.",
      bestUse: "Use the morning for movement or a reset routine.",
      watchOut: "Avoid overloading the second half of the day.",
      whenItGetsBetter: "Tomorrow morning supports another steady window.",
      premiumTeaser: "Unlock future peaks and timing windows.",
    },
    work: {
      scoreTitle: "Work is rising today",
      whatItMeans: "Focus and decision-making are better supported than usual.",
      bestUse: "Do your most demanding task between 10am and 12pm.",
      watchOut: "Momentum may soften after lunch — avoid stacking low-value meetings.",
      whenItGetsBetter: "Your next stronger work window builds again tomorrow afternoon.",
      premiumTeaser: "Unlock future peaks and timing windows.",
    },
  },
  tomorrow: {
    love: {
      scoreTitle: "Love builds tomorrow",
      whatItMeans: "Deep connection energy is rising toward the evening.",
      bestUse: "Plan a meaningful conversation or quality time for after 6pm.",
      watchOut: "Morning may feel slower for emotional clarity — be patient.",
      whenItGetsBetter: "This is already one of your stronger windows this week.",
      premiumTeaser: "Unlock future peaks and timing windows.",
    },
    health: {
      scoreTitle: "Health holds tomorrow",
      whatItMeans: "Vitality stays moderate — a reliable baseline for the day.",
      bestUse: "Start with gentle movement around 8am.",
      watchOut: "Avoid pushing too hard in the afternoon.",
      whenItGetsBetter: "A stronger health window builds later this week.",
      premiumTeaser: "Unlock future peaks and timing windows.",
    },
    work: {
      scoreTitle: "Work dips tomorrow",
      whatItMeans: "Creative focus is lower — not ideal for heavy execution.",
      bestUse: "Use a small 3pm window for light planning or reviews.",
      watchOut: "Avoid big decisions or high-stakes presentations.",
      whenItGetsBetter: "Work momentum rebuilds strongly the day after.",
      premiumTeaser: "Unlock future peaks and timing windows.",
    },
  },
};

// ─── Premium: Peak Alerts ───────────────────────────────────
export const mockAlerts: PeakAlert[] = [
  { id: "alert_1", date: "2026-03-12", time: "11:00", axis: "work", intensity: "exceptional", message: "Exceptional creative window approaching" },
  { id: "alert_2", date: "2026-03-12", time: "19:00", axis: "love", intensity: "strong", message: "Strong relational momentum tonight" },
  { id: "alert_3", date: "2026-03-16", time: "18:00", axis: "love", intensity: "exceptional", message: "Peak connection window this weekend" },
];
