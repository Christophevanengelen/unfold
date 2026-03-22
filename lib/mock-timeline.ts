import type { DomainKey, PlanetKey } from "@/lib/domain-config";

// ─── User birth data (for calculations) ─────────────────────
// Full birth datetime as the API requires — position in the sky
// at the exact moment of birth determines planetary scope
export const USER_BIRTH_DATE = "1986-05-14";
export const USER_BIRTH_TIME = "03:42"; // 3:42 AM — early Taurus, Pisces rising
export const USER_BIRTH_PLACE = "Lyon, France"; // lat 45.76, lon 4.84

// ─── Momentum Phase (life phase on the timeline) ────────────
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

// ─── Mock Timeline ──────────────────────────────────────────
// Realistic distribution: phases come in waves, not evenly spaced.
// The API calculates these from planetary transits relative to birth chart.
// Intensity maps to tier: TOC (<70), TOCTOC (70-84), TOCTOCTOC (85+)

export const mockTimeline: MomentumPhase[] = [
  // ═══ CHILDHOOD & TEENS (age 0-18) ═════════════════════════

  // ═══ CHILDHOOD & TEENS (age 0-18) — mostly single-transit phases ═══

  { id: "child-01", domain: "health", title: "First Steps", subtitle: "Body awakens",
    description: "The earliest phase your chart registers. A period of rapid physical development where the body's natural rhythm first becomes visible.",
    startDate: "1988-09-01", endDate: "1989-06-01", durationWeeks: 39, intensity: 48, planets: ["mars"],
    status: "past",
    keyInsight: "Your body's baseline rhythm was set here.", peakMoment: "Spring '89 — the season of first independence." },

  { id: "child-02", domain: "love", title: "Family Imprint", subtitle: "Bonds that shape everything",
    description: "The family constellation during this period created your relational blueprint. How love was given and received became your default setting.",
    startDate: "1992-01-01", endDate: "1993-03-01", durationWeeks: 61, intensity: 72, planets: ["moon", "venus"],
    status: "past",
    keyInsight: "The love patterns from this phase still echo in your adult relationships.", peakMoment: "A moment of safety that became your reference point." },

  { id: "child-03", domain: "work", title: "Curiosity Spark", subtitle: "First taste of mastery",
    description: "School, a hobby, or a random obsession — something clicked and you experienced flow for the first time. The seed of your professional identity.",
    startDate: "1995-09-01", endDate: "1996-06-01", durationWeeks: 39, intensity: 65, planets: ["mercury"],
    status: "past",
    keyInsight: "The curiosity born here became your career compass.", peakMoment: "The day you forgot time because you were so absorbed." },

  { id: "child-04", domain: "health", title: "First Awareness", subtitle: "Body discovers rhythm",
    description: "A summer of sports where everything flowed naturally, before you could name what rhythm even meant.",
    startDate: "1998-03-01", endDate: "1998-09-15", durationWeeks: 28, intensity: 55, planets: ["sun"],
    status: "past",
    keyInsight: "This was the seed of your relationship with physical energy.", peakMoment: "Summer '98 — the season everything felt effortless." },

  { id: "child-05", domain: "love", title: "First Bond", subtitle: "Learning what connection means",
    description: "A formative friendship that taught you what it feels like to genuinely matter to someone.",
    startDate: "2001-09-01", endDate: "2002-06-15", durationWeeks: 41, intensity: 75, planets: ["venus", "jupiter"],
    status: "past",
    keyInsight: "This connection shaped your template for trust.", peakMoment: "A moment of unexpected loyalty." },

  { id: "child-06", domain: "work", title: "First Challenge", subtitle: "Testing limits",
    description: "An exam, a competition, a project that demanded more than you thought you had. You discovered you could push through.",
    startDate: "2003-01-01", endDate: "2003-09-01", durationWeeks: 35, intensity: 68, planets: ["saturn"],
    status: "past",
    keyInsight: "You learned that effort compounds.", peakMoment: "The result that surprised even you." },

  // ═══ TWENTIES (age 18-30) ═════════════════════════════════

  { id: "life-01", domain: "work", title: "Ambition Ignites", subtitle: "Seeing what's possible",
    description: "Something lit a fire — a project, a mentor, a glimpse of what you could become.",
    startDate: "2005-01-01", endDate: "2005-11-01", durationWeeks: 43, intensity: 72, planets: ["jupiter", "mercury"],
    status: "past",
    keyInsight: "The ambition born here still drives your decisions today.", peakMoment: "The moment someone believed in you before you did." },

  { id: "life-02", domain: "health", title: "Physical Peak", subtitle: "Young and unstoppable",
    description: "Your body was at its most resilient. Late nights had no cost, recovery was instant, energy was unlimited.",
    startDate: "2006-06-01", endDate: "2007-03-01", durationWeeks: 39, intensity: 86, planets: ["mars", "sun"],
    status: "past",
    keyInsight: "This set an unrealistic baseline you chased for years after.", peakMoment: "The summer you felt invincible." },

  { id: "life-03", domain: "love", title: "Heart Opening", subtitle: "Vulnerability rewarded",
    description: "A relationship that demanded real openness. You discovered that vulnerability creates deeper bonds than protection.",
    startDate: "2008-04-01", endDate: "2009-02-01", durationWeeks: 44, intensity: 88, planets: ["venus", "neptune", "moon"],
    status: "past",
    keyInsight: "You learned that love requires risk.", peakMoment: "The night you said something you'd never said before." },

  { id: "life-04", domain: "work", title: "First Real Win", subtitle: "Proof of concept",
    description: "Your first meaningful professional success. Not luck — earned. This gave you the confidence to bet on yourself.",
    startDate: "2009-09-01", endDate: "2010-04-01", durationWeeks: 30, intensity: 80, planets: ["sun", "jupiter"],
    status: "past",
    keyInsight: "This win proved you could create, not just consume.", peakMoment: "The email, the call, the handshake that made it real." },

  { id: "life-05", domain: "health", title: "Breakdown & Rebuild", subtitle: "Forced reset",
    description: "Burnout forced a complete physical reset. What felt like collapse was actually recalibration.",
    startDate: "2010-06-01", endDate: "2011-01-15", durationWeeks: 33, intensity: 45, planets: ["saturn"],
    status: "past",
    keyInsight: "Ignoring the body has consequences.", peakMoment: "The morning the worst was over." },

  { id: "life-06", domain: "love", title: "Relational Clarity", subtitle: "Knowing what you want",
    description: "After enough experience, the pattern became clear. You stopped choosing excitement and started choosing alignment.",
    startDate: "2011-09-01", endDate: "2012-05-01", durationWeeks: 35, intensity: 70, planets: ["venus"],
    status: "past",
    keyInsight: "Clarity in love only comes from experience.", peakMoment: "Choosing someone for the right reasons for the first time." },

  // ═══ THIRTIES (age 30-40) ═════════════════════════════════

  { id: "life-07", domain: "work", title: "Professional Identity", subtitle: "Becoming who you are",
    description: "You stopped doing a job and started building a career. Identity crystallized around skill and contribution.",
    startDate: "2012-09-01", endDate: "2013-08-01", durationWeeks: 48, intensity: 78, planets: ["saturn", "mercury"],
    status: "past",
    keyInsight: "Work became identity, not just income.", peakMoment: "The project that felt like purpose." },

  { id: "life-08", domain: "health", title: "Discipline Era", subtitle: "Structure over chaos",
    description: "Random wellness became structured routine. Gym, sleep, nutrition — all got systems.",
    startDate: "2014-01-01", endDate: "2014-10-01", durationWeeks: 39, intensity: 73, planets: ["mars", "saturn"],
    status: "past",
    keyInsight: "Structure freed up mental energy for everything else.", peakMoment: "The month everything ran on autopilot." },

  { id: "life-09", domain: "love", title: "Deep Commitment", subtitle: "All in",
    description: "A relationship reached the point of no return — in the best way. Full investment, full trust, full vulnerability.",
    startDate: "2015-06-01", endDate: "2016-04-01", durationWeeks: 44, intensity: 91, planets: ["venus", "moon", "solar-eclipse"],
    status: "past",
    keyInsight: "Going all-in was the only way to get what you wanted.", peakMoment: "The decision that changed your life trajectory." },

  { id: "life-10", domain: "health", title: "Peak Physical Era", subtitle: "Everything clicking",
    description: "Sleep, nutrition, movement, energy — all aligned. Physical prime that amplified everything.",
    startDate: "2017-03-01", endDate: "2018-06-01", durationWeeks: 65, intensity: 91, planets: ["sun", "mars", "jupiter"],
    status: "past",
    keyInsight: "When health peaks, everything else becomes easier.", peakMoment: "Running further than you thought possible." },

  { id: "life-11", domain: "work", title: "Mastery Phase", subtitle: "Compounding returns",
    description: "Years of foundation paid off. Output became effortless. Recognition followed naturally.",
    startDate: "2019-01-01", endDate: "2020-03-01", durationWeeks: 61, intensity: 88, planets: ["mercury", "jupiter", "sun"],
    status: "past",
    keyInsight: "Mastery is time compounding.", peakMoment: "The moment everything clicked." },

  { id: "life-12", domain: "love", title: "Deep Reckoning", subtitle: "Truth in relationships",
    description: "A period that forced honesty. Some bonds broke. Others became unbreakable.",
    startDate: "2021-01-01", endDate: "2021-11-01", durationWeeks: 43, intensity: 58, planets: ["lunar-eclipse"],
    status: "past",
    keyInsight: "The people who survived this phase are your real ones.", peakMoment: "A conversation that changed everything." },

  { id: "life-13", domain: "health", title: "Recalibration", subtitle: "New baseline forming",
    description: "After years of pushing, the body demanded a new rhythm. Not decline — adaptation.",
    startDate: "2022-06-01", endDate: "2023-04-01", durationWeeks: 43, intensity: 55, planets: ["neptune"],
    status: "past",
    keyInsight: "Sustainability replaced intensity.", peakMoment: "Accepting that different doesn't mean less." },

  { id: "life-14", domain: "work", title: "Strategic Pivot", subtitle: "Direction over speed",
    description: "Less about doing more, more about doing right. Quality of decisions over quantity of output.",
    startDate: "2023-09-01", endDate: "2024-06-01", durationWeeks: 39, intensity: 74, planets: ["uranus", "mercury"],
    status: "past",
    keyInsight: "This pivot set up the next 5 years.", peakMoment: "Walking away from good to chase great." },

  // ═══ RECENT PAST (last 12 months) ═════════════════════════

  { id: "recent-01", domain: "work", title: "Foundation Building", subtitle: "Clarity in career direction",
    description: "Deep professional grounding. Projects gained traction, skills sharpened.",
    startDate: "2025-06-01", endDate: "2025-08-15", durationWeeks: 11, intensity: 62, planets: ["mercury"],
    status: "past",
    keyInsight: "The groundwork made later acceleration possible.", peakMoment: "A breakthrough idea during a quiet afternoon." },

  { id: "recent-02", domain: "love", title: "Emotional Opening", subtitle: "Vulnerability as strength",
    description: "Conversations carried unusual depth. Relationships deepened through honest exchange.",
    startDate: "2025-07-10", endDate: "2025-09-20", durationWeeks: 10, intensity: 81, planets: ["venus", "neptune"],
    status: "past",
    keyInsight: "The openness reshaped how others see you.", peakMoment: "A conversation in late August changed everything." },

  { id: "recent-03", domain: "health", title: "Physical Reset", subtitle: "Body recalibration",
    description: "Sleep improved, routines solidified. The body found a new baseline.",
    startDate: "2025-09-01", endDate: "2025-11-10", durationWeeks: 10, intensity: 58, planets: ["moon"],
    status: "past",
    keyInsight: "This reset prevented building burnout.", peakMoment: "Mid-October — sustained energy you hadn't felt in months." },

  { id: "recent-04", domain: "work", title: "Creative Surge", subtitle: "Ideas flowing faster than execution",
    description: "Output accelerated. Creative blocks dissolved. Small efforts, outsized results.",
    startDate: "2025-11-01", endDate: "2026-01-05", durationWeeks: 9, intensity: 78, planets: ["mercury", "uranus"],
    status: "past",
    keyInsight: "More value in 9 weeks than the previous 6 months.", peakMoment: "December 12 — the pitch that landed." },

  { id: "recent-05", domain: "love", title: "Relational Deepening", subtitle: "From connection to commitment",
    description: "Existing bonds strengthened through consistent presence.",
    startDate: "2025-12-15", endDate: "2026-02-10", durationWeeks: 8, intensity: 76, planets: ["venus", "moon"],
    status: "past",
    keyInsight: "Depth > breadth.", peakMoment: "New Year's Eve — genuine alignment." },

  { id: "recent-06", domain: "health", title: "Vitality Surge", subtitle: "Peak physical momentum",
    description: "Everything clicked — sleep, nutrition, movement. Mental clarity followed.",
    startDate: "2026-01-20", endDate: "2026-03-01", durationWeeks: 6, intensity: 85, planets: ["sun", "mars"],
    status: "past",
    keyInsight: "When health peaks, everything accelerates.", peakMoment: "February 14 — you woke up feeling unstoppable." },

  // ═══ CURRENT ═══════════════════════════════════════════════

  { id: "current-01", domain: "work", title: "Strategic Positioning", subtitle: "Right moves, right timing",
    description: "Decisions carry unusual weight. Career moves, project pivots, or bold asks made now have an amplified effect. Everything you've built is converging into a single window of opportunity.",
    startDate: "2024-07-01", endDate: undefined, durationWeeks: 90, intensity: 89, planets: ["jupiter", "sun", "mercury"],
    status: "current",
    keyInsight: "Decision window. What you choose now shapes your next 2 years.",
    guidance: "Block time for the decision you've been avoiding.", peakMoment: "The clarity you feel today is the peak." },

  { id: "current-02", domain: "love", title: "Quiet Presence", subtitle: "Being there matters more than doing",
    description: "Relational energy is steady, not dramatic. Show up consistently.",
    startDate: "2026-02-01", endDate: undefined, durationWeeks: 7, intensity: 65, planets: ["moon"],
    status: "current",
    keyInsight: "Low intensity doesn't mean low importance.",
    guidance: "One genuine check-in with someone you care about." },

  // ═══ NEAR FUTURE (next 18 months) ═════════════════════════

  { id: "future-01", domain: "health", title: "Recovery Window", subtitle: "Strategic pause incoming",
    description: "Energy may dip before it rebuilds. Preparation, not setback.",
    startDate: "2026-04-01", endDate: "2026-05-15", durationWeeks: 6, intensity: 52, planets: ["saturn"],
    status: "future",
    guidance: "Pre-schedule lighter weeks in April.", keyInsight: "The dip is the setup." },

  { id: "future-02", domain: "love", title: "Connection Catalyst", subtitle: "New relational energy emerging",
    description: "Heightened relational magnetism. Emotional availability peaks.",
    startDate: "2026-04-15", endDate: "2026-06-01", durationWeeks: 7, intensity: 88, planets: ["venus", "jupiter", "solar-eclipse"],
    status: "future",
    guidance: "Say yes to social invitations in late April.", keyInsight: "Your next important relationship shift." },

  { id: "future-03", domain: "work", title: "Acceleration Phase", subtitle: "Momentum compounds",
    description: "Everything reaches critical mass. Outputs multiply. The harvest.",
    startDate: "2026-05-01", endDate: "2026-07-15", durationWeeks: 11, intensity: 94, planets: ["sun", "jupiter", "mercury", "mars"],
    status: "future",
    guidance: "Start preparing now.", keyInsight: "Biggest professional momentum window of the year." },

  { id: "future-04", domain: "health", title: "Energy Rebuilding", subtitle: "Sustained vitality returns",
    description: "Energy rebuilds to a new baseline. Physical capacity expands.",
    startDate: "2026-06-01", endDate: "2026-08-01", durationWeeks: 9, intensity: 79, planets: ["mars", "sun"],
    status: "future",
    guidance: "Habits set in June become your default.", keyInsight: "Body catches up with ambition." },

  { id: "future-05", domain: "love", title: "Intimacy Deepening", subtitle: "Beyond words",
    description: "Communication evolves. Less talking, more understanding. Bonds become intuitive.",
    startDate: "2026-09-01", endDate: "2026-12-01", durationWeeks: 13, intensity: 74, planets: ["neptune", "venus"],
    status: "future",
    guidance: "Let silence be comfortable.", keyInsight: "The best relationships stop needing explanation." },

  { id: "future-06", domain: "work", title: "Consolidation", subtitle: "Locking in gains",
    description: "After acceleration, systematize what worked. Build structure around success.",
    startDate: "2026-10-01", endDate: "2027-01-01", durationWeeks: 13, intensity: 68, planets: ["saturn"],
    status: "future",
    guidance: "Document everything while it's fresh.", keyInsight: "Structure preserves momentum." },

  // ═══ FAR FUTURE (age 41-55+) ══════════════════════════════

  { id: "far-01", domain: "work", title: "Leadership Emergence", subtitle: "From execution to influence",
    description: "A shift from doing to leading. Others follow your direction naturally.",
    startDate: "2027-02-01", endDate: "2027-09-01", durationWeeks: 30, intensity: 85, planets: ["sun", "jupiter"],
    status: "future",
    guidance: "Delegation starts the transition.", keyInsight: "Next level requires letting go." },

  { id: "far-02", domain: "love", title: "Relational Harvest", subtitle: "Bonds that last",
    description: "The relationships you've cultivated bear fruit. Deep trust creates an unshakeable foundation.",
    startDate: "2027-06-01", endDate: "2028-03-01", durationWeeks: 39, intensity: 90, planets: ["venus", "moon", "lunar-eclipse"],
    status: "future",
    guidance: "Invest in what survived everything.", keyInsight: "The best is yet to come." },

  { id: "far-03", domain: "health", title: "Sustained Vitality", subtitle: "The new baseline holds",
    description: "The body finds sustainable rhythm. Energy becomes reliable infrastructure.",
    startDate: "2028-01-01", endDate: "2029-01-01", durationWeeks: 52, intensity: 76, planets: ["mars", "saturn"],
    status: "future",
    guidance: "Consistency over intensity.", keyInsight: "Health becomes background infrastructure." },

  { id: "far-04", domain: "work", title: "Legacy Building", subtitle: "What outlasts you",
    description: "Focus shifts from personal achievement to lasting impact. Mentoring, building, creating things that endure.",
    startDate: "2029-06-01", endDate: "2030-09-01", durationWeeks: 65, intensity: 82, planets: ["saturn", "jupiter"],
    status: "future",
    guidance: "Choose what to build for others.", keyInsight: "The most meaningful work serves beyond yourself." },

  { id: "far-05", domain: "love", title: "Generational Bond", subtitle: "Love that teaches",
    description: "Relationships become vehicles for wisdom transfer. What you've learned gets passed forward.",
    startDate: "2030-03-01", endDate: "2031-06-01", durationWeeks: 65, intensity: 85, planets: ["venus", "sun", "neptune"],
    status: "future",
    guidance: "Share what took you decades to learn.", keyInsight: "Love matures into legacy." },

  { id: "far-06", domain: "health", title: "Wisdom Body", subtitle: "Knowing before thinking",
    description: "Physical intuition peaks. The body knows what it needs without being told. Effortless maintenance.",
    startDate: "2032-01-01", endDate: "2033-06-01", durationWeeks: 78, intensity: 70, planets: ["neptune"],
    status: "future",
    guidance: "Trust what your body tells you.", keyInsight: "The body becomes your most reliable advisor." },

  { id: "far-07", domain: "work", title: "Second Mastery", subtitle: "Depth beyond skill",
    description: "A new dimension of competence emerges. Not just good — wise. Pattern recognition becomes instinctive.",
    startDate: "2034-01-01", endDate: "2035-06-01", durationWeeks: 78, intensity: 87, planets: ["mercury", "saturn", "uranus"],
    status: "future",
    guidance: "Apply old lessons to new challenges.", keyInsight: "Mastery has layers. This is the next one." },

  { id: "far-08", domain: "love", title: "Unconditional Phase", subtitle: "Love without conditions",
    description: "Relationships shed their transactional layers. Pure presence. Pure acceptance.",
    startDate: "2036-01-01", endDate: "2037-06-01", durationWeeks: 78, intensity: 92, planets: ["venus", "neptune", "moon", "solar-eclipse"],
    status: "future",
    guidance: "Stop keeping score.", keyInsight: "The highest form of love asks for nothing." },

  { id: "far-09", domain: "health", title: "Graceful Adaptation", subtitle: "Evolving with the body",
    description: "Each decade brings new rhythms. This phase is about embracing change rather than fighting it.",
    startDate: "2038-01-01", endDate: "2039-06-01", durationWeeks: 78, intensity: 62, planets: ["moon"],
    status: "future",
    guidance: "Adapt, don't resist.", keyInsight: "Grace is strength expressed differently." },
];

// ─── Helper: get user age from a date ────────────────────────
export function getAgeAtDate(date: Date): number {
  const birth = new Date(USER_BIRTH_DATE + "T00:00:00");
  let age = date.getFullYear() - birth.getFullYear();
  const m = date.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && date.getDate() < birth.getDate())) age--;
  return age;
}

// ─── Helper: get date from age ───────────────────────────────
export function getDateFromAge(age: number): Date {
  const birth = new Date(USER_BIRTH_DATE + "T00:00:00");
  return new Date(birth.getFullYear() + age, birth.getMonth(), birth.getDate());
}

// ─── Helper: get current age ─────────────────────────────────
export function getCurrentAge(): number {
  return getAgeAtDate(new Date());
}

// ─── Helper: filter by domain ────────────────────────────────
export function getPhasesByDomain(domain: DomainKey): MomentumPhase[] {
  return mockTimeline.filter((p) => p.domain === domain);
}

// ─── Helper: get current phases ──────────────────────────────
export function getCurrentPhases(): MomentumPhase[] {
  return mockTimeline.filter((p) => p.status === "current");
}

// ─── Helper: format date range ───────────────────────────────
export function formatDateRange(start: string, end?: string): string {
  const fmt = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en", { month: "short", year: "numeric" });
  };
  if (!end) return `${fmt(start)} — now`;
  return `${fmt(start)} — ${fmt(end)}`;
}
