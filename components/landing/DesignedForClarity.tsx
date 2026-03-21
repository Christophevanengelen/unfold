"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { planetConfig, type PlanetKey } from "@/lib/domain-config";
import type { TranslationMap } from "@/lib/i18n";

interface DesignedForClarityProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

const DEMO_PLANETS: PlanetKey[] = ["moon", "jupiter", "mercury", "sun"];
const DEMO_INTENSITY = 89;

// Combination insight — what all 4 planets together mean
const COMBINATION_INSIGHT = {
  headline: "A rare alignment of clarity",
  body: "Moon × Jupiter × Mercury × Sun — emotional depth meets expansive thinking, sharpened communication, and radiant confidence. This combination amplifies every decision you make today.",
};

// Planet detail content — one per planet
const PLANET_DETAILS: Record<PlanetKey, { headline: string; body: string; timing: string }> = {
  moon: {
    headline: "Emotional clarity peaks today",
    body: "The Moon transit amplifies intuition and emotional awareness. Your ability to read situations is heightened — trust your first impressions.",
    timing: "Peak window: 2pm — 6pm",
  },
  jupiter: {
    headline: "Expansion energy is building",
    body: "Jupiter's transit opens doors to growth and opportunity. Big-picture thinking comes naturally — ideal for strategic decisions and bold moves.",
    timing: "Peak window: 10am — 2pm",
  },
  mercury: {
    headline: "Communication sharpens",
    body: "Mercury amplifies clarity in how you express and process ideas. Writing, negotiation, and problem-solving are at their peak right now.",
    timing: "Peak window: 9am — 1pm",
  },
  sun: {
    headline: "Confidence and vitality surge",
    body: "The Sun transit lights up your core energy. Leadership feels natural, visibility increases, and your presence carries more weight today.",
    timing: "Peak window: 11am — 3pm",
  },
  venus: { headline: "", body: "", timing: "" },
  mars: { headline: "", body: "", timing: "" },
  saturn: { headline: "", body: "", timing: "" },
  uranus: { headline: "", body: "", timing: "" },
  neptune: { headline: "", body: "", timing: "" },
  "solar-eclipse": { headline: "", body: "", timing: "" },
  "lunar-eclipse": { headline: "", body: "", timing: "" },
};

// ─── Decorative phone status bar ─────────────────────────────
function MiniStatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-2.5 pb-1.5">
      <span className="text-[10px] font-medium" style={{ color: "var(--text-body-subtle)" }}>
        9:41
      </span>
      <div className="flex gap-1">
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--text-body-subtle)" }} />
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--text-body-subtle)" }} />
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--text-body-subtle)" }} />
      </div>
    </div>
  );
}

export function DesignedForClarity({ translations }: DesignedForClarityProps) {
  const [activePlanet, setActivePlanet] = useState<PlanetKey | null>(null);
  const [started, setStarted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Start animation when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Auto-cycle: combination → planet → combination → planet → ...
  useEffect(() => {
    if (!started || hasInteracted) return;

    // Sequence: null (combo), moon, null (combo), jupiter, null (combo), mercury, null (combo), sun, repeat
    let idx = 0;
    const sequence: (PlanetKey | null)[] = DEMO_PLANETS.flatMap((p) => [null, p]);

    const cycle = () => {
      setActivePlanet(sequence[idx]);
      idx = (idx + 1) % sequence.length;
      // Show combination for 3s, individual planet for 3s
      autoTimerRef.current = setTimeout(cycle, 3000);
    };
    // Start with combination insight visible for 3s
    autoTimerRef.current = setTimeout(cycle, 3000);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [started, hasInteracted]);

  // Handle user tap on a planet pill
  const handlePlanetTap = (planet: PlanetKey) => {
    setHasInteracted(true);
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);

    if (activePlanet === planet) {
      setActivePlanet(null);
    } else {
      setActivePlanet(planet);
    }
  };

  const activeDetail = activePlanet ? PLANET_DETAILS[activePlanet] : null;
  const activeCfg = activePlanet ? planetConfig[activePlanet] : null;

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header text */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t(translations, "clarity.title", "Designed for daily clarity")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t(translations, "clarity.subtitle", "Every screen delivers exactly what you need. Nothing more.")}
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm font-medium text-logo-lavender/70">
            <span>{t(translations, "clarity.p1", "Read in 3 seconds")}</span>
            <span aria-hidden="true" className="text-brand-10/30">|</span>
            <span>{t(translations, "clarity.p2", "One screen, one answer")}</span>
            <span aria-hidden="true" className="text-brand-10/30">|</span>
            <span>{t(translations, "clarity.p3", "Premium, not noisy")}</span>
          </div>
        </ScrollReveal>

        {/* Phone mockup — interactive planet detail */}
        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.1}>
          <div
            ref={sectionRef}
            className="phone-parallax relative overflow-hidden"
            style={{
              width: 320,
              height: 594,
              borderRadius: "2.25rem",
              boxShadow: "0 8px 60px rgba(20, 15, 45, 0.6), 0 2px 20px rgba(20, 15, 45, 0.35)",
              background: "var(--bg-primary)",
            }}
            role="group"
            aria-label="Unfold app — tap any planet to see its transit detail"
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

              {/* Capsule view */}
              <div className="flex flex-col items-center px-5 pt-3">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "var(--accent-purple)" }}
                >
                  Now
                </p>

                {/* Planet pills — all clickable */}
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {DEMO_PLANETS.map((planet) => {
                    const pc = planetConfig[planet];
                    const isHighlighted = planet === activePlanet;
                    return (
                      <button
                        key={planet}
                        type="button"
                        onClick={() => handlePlanetTap(planet)}
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 transition-all duration-300"
                        style={{
                          background: isHighlighted
                            ? `color-mix(in srgb, ${pc.color} 25%, transparent)`
                            : `color-mix(in srgb, ${pc.color} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${pc.color} ${isHighlighted ? 50 : 25}%, transparent)`,
                          transform: isHighlighted ? "scale(1.08)" : "scale(1)",
                          boxShadow: isHighlighted ? `0 0 12px color-mix(in srgb, ${pc.color} 30%, transparent)` : "none",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: pc.color, boxShadow: `0 0 4px ${pc.color}` }}
                        />
                        <span className="text-[10px] font-medium" style={{ color: pc.color }}>
                          {pc.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Intensity */}
                <div className="mt-4 flex flex-col items-center">
                  <span
                    className="font-display leading-none"
                    style={{
                      fontSize: 56,
                      fontWeight: 300,
                      letterSpacing: -2,
                      color: "var(--accent-purple)",
                    }}
                  >
                    {DEMO_INTENSITY}
                  </span>
                  <span
                    className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em]"
                    style={{ color: "var(--accent-purple)", opacity: 0.6 }}
                  >
                    TOCTOCTOC
                  </span>
                </div>

                {/* Combination insight — what all planets mean together */}
                <AnimatePresence>
                  {!activePlanet && started && (
                    <motion.div
                      className="mt-4 mx-2 rounded-2xl px-4 py-3"
                      style={{
                        background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)",
                      }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--text-heading)" }}
                      >
                        {COMBINATION_INSIGHT.headline}
                      </p>
                      <p
                        className="mt-1.5 text-[9px] leading-relaxed"
                        style={{ color: "var(--text-body-subtle)" }}
                      >
                        {COMBINATION_INSIGHT.body}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tap hint — disappears once user interacts */}
                {!hasInteracted && !activePlanet && (
                  <motion.p
                    className="mt-3 text-[9px]"
                    style={{ color: "var(--text-body-subtle)", opacity: 0.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 1 }}
                  >
                    Tap a planet to explore
                  </motion.p>
                )}
              </div>

              {/* Planet detail sheet — opens for any selected planet */}
              <AnimatePresence mode="wait">
                {activePlanet && activeCfg && activeDetail && activeDetail.headline && (
                  <motion.div
                    key={activePlanet}
                    className="absolute inset-x-0 bottom-0 rounded-t-3xl"
                    style={{
                      background: "var(--bg-secondary)",
                      borderTop: `2px solid ${activeCfg.color}`,
                    }}
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="px-5 pt-5 pb-8">
                      {/* Drag handle */}
                      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-brand-10/20" />

                      {/* Planet header */}
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{ background: `color-mix(in srgb, ${activeCfg.color} 20%, transparent)` }}
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ background: activeCfg.color, boxShadow: `0 0 8px ${activeCfg.color}` }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-heading)" }}>
                            {activeCfg.label}
                          </p>
                          <p className="text-[10px]" style={{ color: "var(--text-body-subtle)" }}>
                            Active transit
                          </p>
                        </div>
                      </div>

                      {/* Detail content */}
                      <h4
                        className="mt-4 text-base font-semibold"
                        style={{ color: "var(--text-heading)" }}
                      >
                        {activeDetail.headline}
                      </h4>
                      <p
                        className="mt-2 text-xs leading-relaxed"
                        style={{ color: "var(--text-body-subtle)" }}
                      >
                        {activeDetail.body}
                      </p>
                      <p
                        className="mt-3 text-[10px] font-medium"
                        style={{ color: activeCfg.color }}
                      >
                        {activeDetail.timing}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
