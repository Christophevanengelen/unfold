"use client";

import { motion } from "motion/react";
import { Lightbulb, ArrowRight, Fire, Lock, ChartLineUp, CalendarMonth } from "flowbite-react-icons/outline";
import { houseConfig, planetConfig, type PlanetKey, type HouseNumber } from "@/lib/domain-config";
import { AppStoreBadges } from "./AppStoreBadges";

// ─── Types ──────────────────────────────────────────────────

export interface FutureMonth {
  monthKey: string;
  tier: "PEAK" | "CLEAR" | "SUBTLE";
  color: string;
  score: number;
}

export interface NextMajor {
  startMonth: string;
  endMonth: string;
  planet: string;
  house: number | null;
  tier: "PEAK" | "CLEAR";
}

export interface LifetimeStats {
  pastPeak: number;
  pastClear: number;
  upcomingPeak: number;
  upcomingClear: number;
  totalLifetime: number;
}

export interface RealSignal {
  boudinId: string;
  planet: string;
  house: number | null;
  tier: "PEAK" | "CLEAR" | "SUBTLE";
  score: number;
  color: string;
  label: string;
  category: string;
  startDate: string;
  endDate: string;
  delineation: {
    titre?: string;
    sousTitre?: string;
    corps?: string;
    avecLeRecul?: string;
    domainesActives?: string[];
  } | null;
  futureMonths: FutureMonth[];
  nextMajor: NextMajor | null;
  lifetime: LifetimeStats | null;
  fromCache?: boolean;
  fallback?: "mock";
}

interface HeroSignalCardProps {
  signal: RealSignal;
  copy: {
    eyebrow: string;
    teaserTitle: string;
    teaserBody: string;
    appStoreCta: string;
    nextWindow: string;
    lifetimeLine: string;
    activeTitle: string;
  };
}

// ─── Helpers ────────────────────────────────────────────────

function tierDisplayLabel(tier: "PEAK" | "CLEAR" | "SUBTLE"): string {
  if (tier === "PEAK") return "Moment fort";
  if (tier === "CLEAR") return "Signal clair";
  return "Signal subtil";
}

function planetMeta(planet: string) {
  return planetConfig[planet as PlanetKey] ?? null;
}

function houseMeta(house: number | null) {
  if (!house) return null;
  return houseConfig[house as HouseNumber] ?? null;
}

const MONTH_FR_FULL = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTH_FR_SHORT = [
  "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin",
  "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc.",
];

function monthLabelFull(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `${MONTH_FR_FULL[m - 1]} ${y}`;
}
function monthLabelShort(monthKey: string): string {
  const [, m] = monthKey.split("-").map(Number);
  return MONTH_FR_SHORT[m - 1] ?? monthKey;
}
function nextWindowRange(start: string, end: string): string {
  if (start === end) return monthLabelFull(start);
  const [ys] = start.split("-").map(Number);
  const [ye] = end.split("-").map(Number);
  // Vague format: "Mai → Juillet 2026" or "Déc. 2026 → Févr. 2027" if straddles year
  if (ys === ye) {
    const [, ms] = start.split("-").map(Number);
    const [, me] = end.split("-").map(Number);
    return `${MONTH_FR_FULL[ms - 1]} → ${MONTH_FR_FULL[me - 1]} ${ys}`;
  }
  return `${monthLabelShort(start)} ${ys} → ${monthLabelShort(end)} ${ye}`;
}

// ─── Component ──────────────────────────────────────────────

export function HeroSignalCard({ signal, copy }: HeroSignalCardProps) {
  const planet = planetMeta(signal.planet);
  const house = houseMeta(signal.house);
  const houseColor = house?.color ?? signal.color;
  const isFallback = signal.fallback === "mock";
  const lt = signal.lifetime;
  const next = signal.nextMajor;
  const nextPlanet = next ? planetMeta(next.planet) : null;
  const nextHouse = next ? houseMeta(next.house) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className="mx-auto mt-10 w-full max-w-md"
    >
      <div
        className="landing-glass relative overflow-hidden rounded-3xl"
        style={{
          border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)",
          boxShadow: "0 0 60px color-mix(in srgb, var(--accent-purple) 15%, transparent)",
        }}
      >
        {/* Header — context banner */}
        <div className="px-6 pt-6 md:px-8 md:pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
            className="flex items-center gap-2"
          >
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: `color-mix(in srgb, ${houseColor} 14%, transparent)`,
                border: `1px solid color-mix(in srgb, ${houseColor} 28%, transparent)`,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: houseColor, animation: "pulse 2s ease-in-out infinite" }}
              />
              <Fire width={10} height={10} style={{ color: houseColor }} />
              <span className="text-[10px] font-semibold tracking-wide" style={{ color: houseColor }}>
                {copy.eyebrow}
              </span>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{
                background: `color-mix(in srgb, ${signal.color} 22%, transparent)`,
                color: signal.color,
              }}
            >
              {tierDisplayLabel(signal.tier)}
            </span>
            {isFallback && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/40">
                Aperçu
              </span>
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-3 font-display text-2xl font-bold leading-tight text-white md:text-[28px]"
          >
            {signal.delineation?.titre ?? planet?.label ?? signal.label}
          </motion.h2>
          {signal.delineation?.sousTitre && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
              className="mt-1 text-sm text-white/60"
            >
              {signal.delineation.sousTitre}
            </motion.p>
          )}
        </div>

        {/* Pills row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex flex-wrap items-center gap-2 px-6 md:px-8"
        >
          {planet && (
            <span
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                background: `color-mix(in srgb, ${planet.color} 18%, transparent)`,
                color: planet.color,
                border: `1px solid color-mix(in srgb, ${planet.color} 30%, transparent)`,
              }}
            >
              <span className="font-mono text-[12px]">{planet.symbol}</span>
              {planet.label}
            </span>
          )}
          {house && (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                background: `color-mix(in srgb, ${house.color} 14%, transparent)`,
                color: house.color,
                border: `1px solid color-mix(in srgb, ${house.color} 26%, transparent)`,
              }}
            >
              {house.label}
            </span>
          )}
        </motion.div>

        {/* Narrative body */}
        {signal.delineation?.corps && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-5 px-6 md:px-8"
          >
            <p className="text-[15px] leading-relaxed text-white/85">
              {signal.delineation.corps}
            </p>
          </motion.div>
        )}

        {/* "Avec le recul" insight */}
        {signal.delineation?.avecLeRecul && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58 }}
            className="mt-5 mx-6 md:mx-8 rounded-2xl px-4 py-3.5"
            style={{
              background: `color-mix(in srgb, ${houseColor} 10%, transparent)`,
              border: `1px solid color-mix(in srgb, ${houseColor} 18%, transparent)`,
            }}
          >
            <div className="flex items-start gap-2">
              <Lightbulb width={14} height={14} style={{ color: houseColor, marginTop: 2 }} />
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: houseColor }}
                >
                  Avec le recul
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-white/85">
                  {signal.delineation.avecLeRecul}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lifetime stats — counts past/upcoming */}
        {lt && lt.totalLifetime > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-6 mx-6 md:mx-8"
          >
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
              <ChartLineUp width={11} height={11} />
              {copy.lifetimeLine}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wider text-white/45">Derrière toi</p>
                <p className="mt-0.5 font-display text-xl font-bold text-white/90">
                  {lt.pastPeak}
                  <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
                    pics
                  </span>
                </p>
                <p className="text-[11px] text-white/55">+ {lt.pastClear} alignements clairs</p>
              </div>
              <div
                className="rounded-xl border px-3 py-2.5"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent-purple) 30%, transparent)",
                  background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
                }}
              >
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                  Devant toi
                </p>
                <p className="mt-0.5 font-display text-xl font-bold text-white">
                  {lt.upcomingPeak}
                  <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-white/55">
                    pics
                  </span>
                </p>
                <p className="text-[11px] text-white/65">+ {lt.upcomingClear} alignements clairs</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next major window — vague but real */}
        {next && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
            className="mt-4 mx-6 md:mx-8"
          >
            <div
              className="relative overflow-hidden rounded-2xl px-4 py-4"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${nextHouse?.color ?? "var(--accent-purple)"} 14%, transparent), color-mix(in srgb, var(--accent-purple) 6%, transparent))`,
                border: `1px solid color-mix(in srgb, ${nextHouse?.color ?? "var(--accent-purple)"} 24%, transparent)`,
              }}
            >
              <div className="flex items-start gap-2">
                <CalendarMonth width={14} height={14} style={{ color: nextHouse?.color ?? "var(--accent-purple)", marginTop: 2 }} />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.18em]"
                    style={{ color: nextHouse?.color ?? "var(--accent-purple)" }}
                  >
                    {copy.nextWindow}
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-white">
                    {nextWindowRange(next.startMonth, next.endMonth)}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {nextPlanet && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: `color-mix(in srgb, ${nextPlanet.color} 16%, transparent)`,
                          color: nextPlanet.color,
                        }}
                      >
                        {nextPlanet.symbol} {nextPlanet.label}
                      </span>
                    )}
                    {nextHouse && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background: `color-mix(in srgb, ${nextHouse.color} 14%, transparent)`,
                          color: nextHouse.color,
                        }}
                      >
                        {nextHouse.label}
                      </span>
                    )}
                    <span className="text-[10px] text-white/45">— jour exact dans l&apos;app</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Future blur strip */}
        {signal.futureMonths.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.78 }}
            className="mt-6 px-6 md:px-8"
          >
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
              <Lock width={10} height={10} />
              {copy.teaserTitle}
            </p>
            <div className="relative">
              <ul
                className="flex items-end gap-1 overflow-hidden"
                aria-hidden
                style={{ filter: "blur(4px)", opacity: 0.55 }}
              >
                {signal.futureMonths.slice(0, 12).map((m) => (
                  <li key={m.monthKey} className="flex flex-1 flex-col items-center gap-1">
                    <span
                      className="block w-full rounded-full"
                      style={{
                        height: 8 + m.score * 4,
                        background: `linear-gradient(180deg, ${m.color}, color-mix(in srgb, ${m.color} 50%, transparent))`,
                      }}
                    />
                    <span className="text-[9px] text-white/40">{monthLabelShort(m.monthKey)}</span>
                  </li>
                ))}
              </ul>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                <span className="rounded-full bg-black/40 p-2 backdrop-blur-md">
                  <Lock width={14} height={14} className="text-white/80" />
                </span>
              </div>
            </div>
            <p className="mt-2 text-[12px] text-white/55">{copy.teaserBody}</p>
          </motion.div>
        )}

        {/* App Store CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.88 }}
          className="mt-6 px-6 pb-6 md:px-8 md:pb-8"
        >
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white/85">
              <ArrowRight width={12} height={12} style={{ color: "var(--accent-purple)" }} />
              {copy.appStoreCta}
            </p>
            <div className="mt-3">
              <AppStoreBadges />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
