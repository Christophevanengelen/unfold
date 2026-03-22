"use client";

import { motion } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MiniStatusBar } from "@/components/ui/MiniStatusBar";
import { BottomNav } from "@/components/ui/BottomNav";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { MonthLabel } from "@/components/ui/MonthLabel";
import type { TranslationMap } from "@/lib/i18n";

// ─── Local translation helper ────────────────────────────────
function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// ─── Timeline entry data ─────────────────────────────────────
interface TimelineEntry {
  title: string;
  date: string;
  intensity: number;
  tier: string;
  planets: { color: string }[];
  status: "past" | "current" | "future";
  highlight?: boolean;
}

const TIMELINE_ENTRIES: TimelineEntry[] = [
  {
    title: "Creative Surge",
    date: "Nov '25 \u2014 Jan '26",
    intensity: 78,
    tier: "CLEAR",
    planets: [{ color: "#4BBFAF" }, { color: "#8B5CF6" }],
    status: "past",
  },
  {
    title: "Vitality Surge",
    date: "Jan \u2014 Mar '26",
    intensity: 85,
    tier: "PEAK",
    planets: [{ color: "#E5A940" }, { color: "#D06050" }],
    status: "past",
  },
  {
    title: "Strategic Positioning",
    date: "Jul '24 \u2014 now",
    intensity: 89,
    tier: "PEAK",
    planets: [{ color: "#5B7FC2" }, { color: "#E5A940" }, { color: "#4BBFAF" }],
    status: "current",
    highlight: true,
  },
  {
    title: "Connection Catalyst",
    date: "Apr \u2014 Jun '26",
    intensity: 88,
    tier: "PEAK",
    planets: [{ color: "#D87EA0" }, { color: "#5B7FC2" }],
    status: "future",
  },
  {
    title: "Acceleration Phase",
    date: "May \u2014 Jul '26",
    intensity: 94,
    tier: "PEAK",
    planets: [{ color: "#E5A940" }, { color: "#5B7FC2" }, { color: "#4BBFAF" }, { color: "#D06050" }],
    status: "future",
  },
];

// ─── Single timeline entry row ───────────────────────────────
function TimelineRow({ entry, index }: { entry: TimelineEntry; index: number }) {
  const isFuture = entry.status === "future";
  const isCurrent = entry.highlight;

  return (
    <motion.div
      className="relative flex items-start gap-3 py-2.5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "tween",
        duration: 0.5,
        delay: 0.3 + index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ opacity: isFuture ? 0.55 : 1 }}
    >
      {/* Dot on spine */}
      <div className="relative z-10 mt-1 flex flex-shrink-0 items-center justify-center" style={{ width: 14 }}>
        <div
          className="rounded-full"
          style={{
            width: isCurrent ? 10 : 7,
            height: isCurrent ? 10 : 7,
            background: isCurrent ? "var(--accent-purple)" : "color-mix(in srgb, var(--accent-purple) 60%, transparent)",
            boxShadow: isCurrent ? "0 0 10px rgba(149, 133, 204, 0.6), 0 0 20px rgba(149, 133, 204, 0.3)" : "none",
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold leading-tight"
            style={{ color: isCurrent ? "#fff" : "var(--text-heading)" }}
          >
            {entry.title}
          </span>
          {isCurrent && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wider"
              style={{
                background: "color-mix(in srgb, var(--accent-purple) 30%, transparent)",
                color: "#C1A7FF",
                border: "1px solid color-mix(in srgb, var(--accent-purple) 40%, transparent)",
              }}
            >
              NOW
            </span>
          )}
        </div>

        <span
          className="mt-0.5 block text-[9px]"
          style={{ color: "var(--text-disabled)" }}
        >
          {entry.date}
        </span>

        {/* Planet dots + tier */}
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex gap-0.5">
            {entry.planets.map((p, j) => (
              <div
                key={j}
                className="h-[5px] w-[5px] rounded-full"
                style={{
                  background: p.color,
                  boxShadow: `0 0 3px ${p.color}`,
                }}
              />
            ))}
          </div>
          <span
            className="text-[7px] font-semibold tracking-wider"
            style={{ color: "color-mix(in srgb, var(--accent-purple) 70%, transparent)" }}
          >
            {entry.tier}
          </span>
        </div>
      </div>

      {/* Intensity value */}
      <div className="flex-shrink-0 pt-0.5">
        <span
          className="text-[13px] font-bold tabular-nums"
          style={{ color: isCurrent ? "#C1A7FF" : "var(--text-body-subtle)" }}
        >
          {entry.intensity}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────
interface TimelineShowcaseProps {
  translations: TranslationMap;
}

export function TimelineShowcase({ translations }: TimelineShowcaseProps) {
  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <SectionHeader
          translations={translations}
          eyebrowKey="timeline.eyebrow"
          eyebrowFallback="Your story"
          titleKey="timeline.title"
          titleFallback="Your rhythm has a story"
          subtitleKey="timeline.subtitle"
          subtitleFallback="Every momentum period from birth to now — and what's forming ahead. Planets reveal the pattern."
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
              aria-label="Unfold app showing a vertical momentum timeline from past phases through the current period into future phases"
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

                {/* Timeline header inside phone */}
                <div className="px-5 pt-3 pb-2">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: "color-mix(in srgb, var(--accent-purple) 70%, transparent)" }}
                  >
                    YOUR TIMELINE
                  </p>
                </div>

                {/* Vertical timeline */}
                <div className="relative flex-1 overflow-hidden px-5 pb-6">
                  {/* Spine line */}
                  <div
                    className="absolute top-0 bottom-0"
                    aria-hidden="true"
                    style={{
                      left: "calc(1.25rem + 6px)",
                      width: 1,
                      background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent-purple) 35%, transparent) 10%, color-mix(in srgb, var(--accent-purple) 35%, transparent) 85%, transparent)",
                    }}
                  />

                  {/* Entries */}
                  {TIMELINE_ENTRIES.map((entry, i) => (
                    <TimelineRow key={entry.title} entry={entry} index={i} />
                  ))}

                  {/* Fade at bottom to imply continuation */}
                  <div
                    className="pointer-events-none absolute right-0 bottom-0 left-0 h-16"
                    aria-hidden="true"
                    style={{
                      background: "linear-gradient(to top, var(--bg-primary), transparent)",
                    }}
                  />
                </div>

                <BottomNav active="timeline" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Caption below phone */}
        <ScrollReveal variant="fadeUp" delay={0.3} className="mt-10 text-center">
          <p className="text-sm text-brand-10/60">
            {t(
              translations,
              "timeline.caption",
              "From birth to what\u2019s forming ahead \u2014 your complete momentum map."
            )}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
