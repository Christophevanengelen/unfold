"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MiniStatusBar } from "@/components/ui/MiniStatusBar";
import { MockBottomNav } from "@/components/ui/MockBottomNav";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { Star, Lock, Lightbulb, Fire } from "flowbite-react-icons/outline";
import { planetConfig, houseConfig, type PlanetKey, type HouseNumber } from "@/lib/domain-config";
import type { TranslationMap } from "@/lib/i18n";

// ─── Translation helper ────────────────────────────────────
function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// ─── Types ─────────────────────────────────────────────────
type Tier = "toc" | "toctoc" | "toctoctoc";
type Status = "past" | "current" | "future";

interface PreviewCapsule {
  id: string;
  title: string;
  subtitle: string;
  narrative: string;
  insight: string;
  dateLabel: string;
  duration: string;
  intensity: number;
  score: number;
  tier: Tier;
  planets: PlanetKey[];
  house: HouseNumber;
  status: Status;
}

// ─── Tour state machine ────────────────────────────────────
type TourPhase =
  | "idle"
  | "briefing"
  | "scrolling"
  | "highlight"
  | "detail-opening"
  | "detail-reading"
  | "detail-closing"
  | "premium-tease"
  | "reset";

const TOUR_TIMINGS: Record<string, number> = {
  briefing: 3000,
  scrolling: 1200,
  highlight: 1000,
  "detail-opening": 800,
  "detail-reading": 4000,
  "detail-closing": 600,
  "premium-tease": 3000,
  reset: 1500,
};

// ─── Realistic mock data ───────────────────────────────────

const CAPSULES: PreviewCapsule[] = [
  {
    id: "c1",
    title: "Restructuration profonde",
    subtitle: "Pluton tension personnel V\u00e9nus",
    narrative: "Vos rep\u00e8res financiers sont bousculés. Ce que vous teniez pour acquis m\u00e9rite d'\u00eatre questionn\u00e9. C'est inconfortable, mais c'est exactement l\u00e0 o\u00f9 la croissance est possible.",
    insight: "Les d\u00e9cisions financi\u00e8res de cette p\u00e9riode posent de nouvelles fondations.",
    dateLabel: "Nov 2024 \u2014 Jan 2025",
    duration: "2 mois 15 jours",
    intensity: 81,
    score: 3,
    tier: "toctoctoc",
    planets: ["pluto", "venus"],
    house: 2,
    status: "past",
  },
  {
    id: "c2",
    title: "\u00c9lan cr\u00e9atif",
    subtitle: "Jupiter activation personnel Soleil",
    narrative: "Les portes s'ouvrent sur vos projets cr\u00e9atifs. Votre envie d'exprimer quelque chose de personnel trouve enfin sa fen\u00eatre. Saisissez ce qui se pr\u00e9sente.",
    insight: "La joie de cette p\u00e9riode est une ressource qui reste.",
    dateLabel: "Jan \u2014 Avr 2025",
    duration: "3 mois",
    intensity: 74,
    score: 2,
    tier: "toctoc",
    planets: ["jupiter", "sun"],
    house: 5,
    status: "past",
  },
  {
    id: "c3",
    title: "Repositionnement strat\u00e9gique",
    subtitle: "Saturne flux personnel Jupiter",
    narrative: "Votre carri\u00e8re est sous les projecteurs. Ce que vous construisez maintenant va durer. La discipline que vous investissez porte d\u00e9j\u00e0 ses fruits — continuez.",
    insight: "C'est le moment de prendre position professionnellement.",
    dateLabel: "F\u00e9v \u2014 Juil 2026",
    duration: "5 mois 8 jours",
    intensity: 91,
    score: 4,
    tier: "toctoctoc",
    planets: ["saturn", "jupiter", "uranus"],
    house: 10,
    status: "current",
  },
  {
    id: "c4",
    title: "Ouverture relationnelle",
    subtitle: "Neptune flux personnel V\u00e9nus",
    narrative: "L'inspiration coule dans vos relations. Cr\u00e9ativit\u00e9, intuition, r\u00eaverie \u2014 laissez-vous porter sans chercher \u00e0 contr\u00f4ler.",
    insight: "Une relation importante va \u00eatre activ\u00e9e.",
    dateLabel: "Jun \u2014 Sep 2026",
    duration: "3 mois 12 jours",
    intensity: 85,
    score: 3,
    tier: "toctoc",
    planets: ["neptune", "venus"],
    house: 7,
    status: "future",
  },
  {
    id: "c5",
    title: "Fen\u00eatre de transformation",
    subtitle: "Pluton activation personnel Lune",
    narrative: "Quelque chose de profond se transforme en vous. Ce qui ne fonctionne plus s'efface pour laisser place au neuf.",
    insight: "Acceptez ce qui \u00e9merge, m\u00eame si c'est inconfortable.",
    dateLabel: "Ao\u00fb \u2014 D\u00e9c 2026",
    duration: "4 mois",
    intensity: 94,
    score: 4,
    tier: "toctoctoc",
    planets: ["pluto", "moon"],
    house: 8,
    status: "future",
  },
];

const BRIEFING = {
  summary: "Saturne stabilise votre axe carri\u00e8re tandis que Jupiter ouvre de nouveaux possibles. Une d\u00e9cision en attente trouve sa fen\u00eatre de r\u00e9solution.",
  action: "Planifiez cette conversation que vous repoussez. Le signal est clair.",
  domains: [10, 3, 5] as HouseNumber[],
};

const CURRENT_INDEX = CAPSULES.findIndex((c) => c.status === "current");
const FUTURE_INDEX = CAPSULES.findIndex((c) => c.status === "future");

// ─── Tier helpers ──────────────────────────────────────────
function tierLabel(tier: Tier): string {
  if (tier === "toctoctoc") return "Moment fort";
  if (tier === "toctoc") return "Signal clair";
  return "Signal subtil";
}

// ─── Mini Daily Briefing ───────────────────────────────────
function MiniDailyBriefing() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="mx-4 mb-3 rounded-xl px-3.5 py-3"
      style={{
        background: "rgba(124, 107, 191, 0.06)",
        border: "1px solid rgba(124, 107, 191, 0.12)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <Star style={{ width: 10, height: 10, color: "var(--accent-purple)", opacity: 0.7 }} />
        <span className="text-[8px] font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--accent-purple)", opacity: 0.7 }}>
          Aujourd&apos;hui
        </span>
      </div>
      <p className="text-[10px] leading-relaxed mb-2" style={{ color: "var(--text-body)" }}>
        {BRIEFING.summary}
      </p>
      <p className="text-[9px] font-medium mb-2.5" style={{ color: "var(--accent-purple)" }}>
        {BRIEFING.action}
      </p>
      <div className="flex gap-1.5">
        {BRIEFING.domains.map((h) => {
          const hm = houseConfig[h];
          return (
            <div key={h} className="flex items-center gap-1 rounded-full px-2 py-0.5"
              style={{ background: `color-mix(in srgb, ${hm.color} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${hm.color} 20%, transparent)` }}>
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: hm.color }} />
              <span className="text-[7px] font-medium" style={{ color: hm.color }}>{hm.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Capsule Row ───────────────────────────────────────────
function CapsuleRow({
  capsule,
  isHighlighted,
  onClick,
}: {
  capsule: PreviewCapsule;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  const isFuture = capsule.status === "future";
  const isCurrent = capsule.status === "current";
  const hm = houseConfig[capsule.house];

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex items-start gap-3 py-2.5 w-full text-left transition-all duration-300"
      style={{ opacity: isFuture ? 0.5 : 1 }}
    >
      {/* Spine dot */}
      <div className="relative z-10 mt-1.5 flex flex-shrink-0 items-center justify-center" style={{ width: 14 }}>
        <motion.div
          className="rounded-full"
          animate={isHighlighted ? {
            boxShadow: ["0 0 0 0 rgba(149,133,204,0)", "0 0 0 6px rgba(149,133,204,0.3)", "0 0 0 0 rgba(149,133,204,0)"],
          } : {}}
          transition={isHighlighted ? { duration: 1.5, repeat: Infinity } : {}}
          style={{
            width: isCurrent ? 10 : 7,
            height: isCurrent ? 10 : 7,
            background: isCurrent ? "var(--accent-purple)" : `color-mix(in srgb, var(--accent-purple) 50%, transparent)`,
            boxShadow: isCurrent ? "0 0 10px rgba(149,133,204,0.6)" : "none",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* House pill + NOW badge */}
        <div className="flex items-center gap-1.5 mb-1">
          <div className="flex items-center gap-1 rounded-full px-1.5 py-0.5"
            style={{
              background: `color-mix(in srgb, ${hm.color} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${hm.color} 15%, transparent)`,
            }}>
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: hm.color }} />
            <span className="text-[7px] font-medium" style={{ color: hm.color }}>{hm.label}</span>
          </div>
          {isCurrent && (
            <span className="rounded-full px-1.5 py-0.5 text-[6px] font-bold uppercase tracking-wider"
              style={{
                background: "color-mix(in srgb, var(--accent-purple) 25%, transparent)",
                color: "var(--accent-purple)",
                border: "1px solid color-mix(in srgb, var(--accent-purple) 35%, transparent)",
              }}>
              En cours
            </span>
          )}
        </div>

        {/* Title */}
        <span className="text-[11px] font-semibold leading-tight block"
          style={{ color: isCurrent ? "#fff" : "var(--text-heading)" }}>
          {capsule.title}
        </span>

        {/* Date */}
        <span className="mt-0.5 block text-[8px]" style={{ color: "var(--text-disabled)" }}>
          {capsule.dateLabel}
        </span>

        {/* Planet dots + tier */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex gap-0.5">
            {capsule.planets.map((pk) => {
              const pc = planetConfig[pk];
              return (
                <div key={pk} className="h-[5px] w-[5px] rounded-full"
                  style={{ background: pc.color, boxShadow: `0 0 4px ${pc.color}` }} />
              );
            })}
          </div>
          <span className="text-[7px] font-semibold uppercase tracking-wider"
            style={{ color: "color-mix(in srgb, var(--accent-purple) 60%, transparent)" }}>
            {capsule.tier === "toctoctoc" ? "PEAK" : capsule.tier === "toctoc" ? "CLEAR" : "SUBTLE"}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 pt-1">
        <span className="text-[12px] font-bold tabular-nums"
          style={{ color: isCurrent ? "var(--accent-purple)" : "var(--text-body-subtle)" }}>
          {capsule.score}/4
        </span>
      </div>
    </button>
  );
}

// ─── Preview Detail Sheet ──────────────────────────────────
function PreviewDetailSheet({
  capsule,
  onClose,
}: {
  capsule: PreviewCapsule;
  onClose: () => void;
}) {
  const hm = houseConfig[capsule.house];
  const isCurrent = capsule.status === "current";

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="absolute inset-x-0 bottom-0 z-50 flex flex-col"
        style={{
          maxHeight: "78%",
          borderRadius: "1.25rem 1.25rem 0 0",
          background: "var(--bg-secondary)",
          boxShadow: "0 -4px 30px rgba(0,0,0,0.4)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center py-2.5">
          <div className="h-1 w-10 rounded-full" style={{ background: "var(--border-base, rgba(149,133,204,0.2))" }} />
        </div>

        <div className="overflow-y-auto px-5 pb-6" style={{ maxHeight: "calc(78vh - 20px)" }}>
          {/* Context banner */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: `color-mix(in srgb, ${hm.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${hm.color} 25%, transparent)`,
              }}>
              {isCurrent && (
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: hm.color }} />
              )}
              <Fire size={10} style={{ color: hm.color }} />
              <span className="text-[9px] font-semibold" style={{ color: hm.color }}>
                {isCurrent ? "Signal actif" : capsule.status === "past" ? "Vous y \u00e9tiez" : "\u00c0 venir"}
              </span>
            </div>
            {capsule.score >= 3 && (
              <span className="rounded-full px-1.5 py-0.5 text-[7px] font-bold"
                style={{
                  background: "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
                  color: "var(--accent-purple)",
                }}>
                {capsule.score}/4
              </span>
            )}
          </div>

          {/* Tier + title */}
          <div className="mb-1">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em]"
              style={{ color: "var(--accent-purple)" }}>
              {tierLabel(capsule.tier)}
            </span>
          </div>
          <h3 className="font-display text-lg font-bold mb-1"
            style={{ color: "var(--text-heading)", letterSpacing: "-0.01em" }}>
            {capsule.title}
          </h3>

          {/* Date + duration */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px]" style={{ color: "var(--text-body-subtle)" }}>
              {capsule.dateLabel}
            </span>
            <span className="rounded-full px-2 py-0.5 text-[8px] font-medium"
              style={{
                background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)",
                color: "var(--accent-purple)",
              }}>
              {capsule.duration}
            </span>
          </div>

          {/* House topic pill */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: `color-mix(in srgb, ${hm.color} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${hm.color} 20%, transparent)`,
              }}>
              <div className="h-2 w-2 rounded-full" style={{ background: hm.color }} />
              <span className="text-[10px] font-medium" style={{ color: hm.color }}>{hm.label}</span>
            </div>
          </div>

          {/* Planet pills (staggered) */}
          <div className="flex flex-wrap gap-2 mb-3">
            {capsule.planets.map((pk, i) => {
              const pc = planetConfig[pk];
              return (
                <motion.div
                  key={pk}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 300 }}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                  style={{
                    background: `color-mix(in srgb, ${pc.color} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${pc.color} 25%, transparent)`,
                  }}
                >
                  <div className="h-2 w-2 rounded-full"
                    style={{ background: pc.color, boxShadow: `0 0 6px ${pc.color}` }} />
                  <span className="text-[10px] font-medium" style={{ color: pc.color }}>{pc.label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Transit label */}
          <p className="text-[10px] italic mb-4" style={{ color: "var(--text-body-subtle)" }}>
            {capsule.subtitle}
          </p>

          {/* Story section */}
          <div className="mb-4">
            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] block mb-1.5"
              style={{ color: "var(--accent-purple)" }}>
              {isCurrent ? "Ce qui se d\u00e9roule" : capsule.status === "past" ? "Ce qui s'est pass\u00e9" : "Ce qui vous attend"}
            </span>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-[11px] leading-relaxed"
              style={{ color: "var(--text-body)" }}>
              {capsule.narrative}
            </motion.p>
          </div>

          {/* Insight card */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="rounded-xl px-3.5 py-3 mb-4"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 8%, var(--bg-tertiary, var(--bg-primary)))",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <Lightbulb size={10} style={{ color: "var(--accent-purple)" }} />
              <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                {"Signal cl\u00e9"}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-body)" }}>
              {capsule.insight}
            </p>
          </motion.div>

          {/* Personalized whisper */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center text-[8px] italic"
            style={{ color: "var(--text-disabled)" }}>
            {"Personnalis\u00e9 par l\u2019IA pour votre profil"}
          </motion.p>
        </div>
      </motion.div>
    </>
  );
}

// ─── Premium Blur Overlay ──────────────────────────────────
function PreviewPremiumOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-x-0 bottom-0 z-40 flex flex-col items-center justify-center gap-3 px-6 text-center"
      style={{
        top: "35%",
        background: "linear-gradient(160deg, rgba(27,21,53,0.8) 0%, rgba(27,21,53,0.6) 50%, rgba(124,107,191,0.15) 100%)",
        backdropFilter: "blur(6px)",
        borderRadius: "1.25rem 1.25rem 0 0",
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
        className="flex items-center justify-center rounded-full"
        style={{
          width: 32, height: 32,
          background: "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)",
        }}
      >
        <Lock size={14} style={{ color: "var(--accent-purple)" }} />
      </motion.div>
      <div>
        <p className="font-display text-sm font-semibold" style={{ color: "var(--text-heading)" }}>
          {"D\u00e9verrouille ton futur"}
        </p>
        <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "var(--text-body-subtle)" }}>
          {"Acc\u00e8de \u00e0 tes signaux futurs et anticipe tes moments cl\u00e9s"}
        </p>
      </div>
      <div
        className="rounded-full px-5 py-2 text-[10px] font-semibold"
        style={{
          background: "var(--accent-purple)",
          color: "#fff",
          boxShadow: "0 0 20px color-mix(in srgb, var(--accent-purple) 40%, transparent), 0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        Voir les plans
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────
interface TimelineShowcaseProps {
  translations: TranslationMap;
}

export function TimelineShowcase({ translations }: TimelineShowcaseProps) {
  const [phase, setPhase] = useState<TourPhase>("idle");
  const [openCapsule, setOpenCapsule] = useState<PreviewCapsule | null>(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const [tourPaused, setTourPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // Start tour when visible
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true;
          setPhase("briefing");
        }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Tour state machine
  const advance = useCallback((next: TourPhase) => {
    if (cancelRef.current || tourPaused) return;
    setPhase(next);
  }, [tourPaused]);

  useEffect(() => {
    if (tourPaused || phase === "idle") return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    const delay = (ms: number, fn: () => void) => {
      timers.push(setTimeout(fn, ms));
    };

    switch (phase) {
      case "briefing":
        setShowBriefing(true);
        setOpenCapsule(null);
        setShowPremium(false);
        setHighlightId(null);
        delay(TOUR_TIMINGS.briefing, () => {
          setShowBriefing(false);
          delay(400, () => advance("scrolling"));
        });
        break;

      case "scrolling":
        // Scroll to current capsule
        if (scrollRef.current) {
          const rowH = 82; // approximate row height
          const target = CURRENT_INDEX * rowH;
          scrollRef.current.scrollTo({ top: target, behavior: "smooth" });
        }
        delay(TOUR_TIMINGS.scrolling, () => advance("highlight"));
        break;

      case "highlight":
        setHighlightId(CAPSULES[CURRENT_INDEX].id);
        delay(TOUR_TIMINGS.highlight, () => advance("detail-opening"));
        break;

      case "detail-opening":
        setOpenCapsule(CAPSULES[CURRENT_INDEX]);
        delay(TOUR_TIMINGS["detail-opening"], () => advance("detail-reading"));
        break;

      case "detail-reading":
        delay(TOUR_TIMINGS["detail-reading"], () => advance("detail-closing"));
        break;

      case "detail-closing":
        setOpenCapsule(null);
        setHighlightId(null);
        delay(TOUR_TIMINGS["detail-closing"], () => advance("premium-tease"));
        break;

      case "premium-tease":
        // Scroll to first future capsule and show premium overlay
        if (scrollRef.current && FUTURE_INDEX >= 0) {
          const rowH = 82;
          const target = FUTURE_INDEX * rowH;
          scrollRef.current.scrollTo({ top: target, behavior: "smooth" });
        }
        delay(600, () => setShowPremium(true));
        delay(TOUR_TIMINGS["premium-tease"], () => advance("reset"));
        break;

      case "reset":
        setShowPremium(false);
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
        delay(TOUR_TIMINGS.reset, () => advance("briefing"));
        break;
    }

    return () => timers.forEach(clearTimeout);
  }, [phase, tourPaused, advance]);

  // Manual interaction — pause tour
  const handleCapsuleClick = useCallback((capsule: PreviewCapsule) => {
    setTourPaused(true);
    setShowBriefing(false);
    setShowPremium(false);
    if (capsule.status === "future") {
      setOpenCapsule(null);
      setShowPremium(true);
    } else {
      setOpenCapsule(capsule);
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setOpenCapsule(null);
    setShowPremium(false);
    // Resume tour after delay
    setTimeout(() => {
      setTourPaused(false);
      setPhase("reset");
    }, 1500);
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <SectionHeader
          translations={translations}
          eyebrowKey="timeline.eyebrow"
          eyebrowFallback="Your story"
          titleKey="timeline.title"
          titleFallback="Your rhythm has a story"
          subtitleKey="timeline.subtitle"
          subtitleFallback="Every momentum period from birth to now \u2014 and what\u2019s forming ahead. Tap to explore."
        />

        {/* Phone mockup */}
        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.1}>
          <div className="phone-glow-wrap">
            <div
              className="relative overflow-hidden"
              style={{
                width: 375,
                height: 812,
                borderRadius: "2.5rem",
                border: "1px solid color-mix(in srgb, var(--brand-6) 40%, transparent)",
                background: "var(--bg-primary)",
              }}
              role="img"
              aria-label="Unfold app interactive preview showing a momentum timeline with AI briefing and detail sheets"
            >
              {/* Gradient mesh */}
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  background: [
                    "radial-gradient(ellipse 140% 45% at 50% -5%, var(--gradient-top) 0%, transparent 65%)",
                    "radial-gradient(circle 250px at 90% 90%, var(--gradient-right) 0%, transparent 70%)",
                  ].join(", "),
                }}
              />

              <div className="relative z-10 flex h-full flex-col">
                <MiniStatusBar />

                {/* View toggle */}
                <div className="flex justify-center px-5 pt-1 pb-2">
                  <ViewToggle />
                </div>

                {/* Daily briefing (conditional) */}
                <AnimatePresence>
                  {showBriefing && <MiniDailyBriefing />}
                </AnimatePresence>

                {/* Timeline label */}
                <div className="px-5 pt-1 pb-2">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: "color-mix(in srgb, var(--accent-purple) 60%, transparent)" }}>
                    Votre timeline
                  </p>
                </div>

                {/* Scrollable timeline */}
                <div className="relative flex-1 overflow-hidden">
                  {/* Spine */}
                  <div className="absolute top-0 bottom-0" aria-hidden="true"
                    style={{
                      left: "calc(1.25rem + 6px)",
                      width: 1,
                      background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent-purple) 30%, transparent) 10%, color-mix(in srgb, var(--accent-purple) 30%, transparent) 85%, transparent)",
                    }}
                  />

                  <div ref={scrollRef} className="h-full overflow-y-auto px-5 no-scrollbar">
                    {CAPSULES.map((capsule) => (
                      <CapsuleRow
                        key={capsule.id}
                        capsule={capsule}
                        isHighlighted={highlightId === capsule.id}
                        onClick={() => handleCapsuleClick(capsule)}
                      />
                    ))}
                    {/* Bottom spacer */}
                    <div className="h-12" />
                  </div>

                  {/* Bottom fade */}
                  <div
                    className="pointer-events-none absolute right-0 bottom-0 left-0 h-16"
                    aria-hidden="true"
                    style={{ background: "linear-gradient(to top, var(--bg-primary), transparent)" }}
                  />
                </div>

                <MockBottomNav active="timeline" />
              </div>

              {/* Detail sheet overlay */}
              <AnimatePresence>
                {openCapsule && (
                  <PreviewDetailSheet capsule={openCapsule} onClose={handleCloseDetail} />
                )}
              </AnimatePresence>

              {/* Premium overlay */}
              <AnimatePresence>
                {showPremium && <PreviewPremiumOverlay />}
              </AnimatePresence>
            </div>
          </div>
        </ScrollReveal>

        {/* Caption below phone */}
        <ScrollReveal variant="fadeUp" delay={0.3} className="mt-10 text-center">
          <p className="text-sm text-brand-10/60">
            {t(translations, "timeline.caption", "De la naissance \u00e0 ce qui se forme \u2014 votre carte compl\u00e8te de momentum.")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
