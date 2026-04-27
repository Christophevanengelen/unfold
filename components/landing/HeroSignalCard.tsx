"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lightbulb, ArrowRight, Fire, Lock, ChartLineUp, CalendarMonth,
  Clock, ChevronDown, ChevronUp,
} from "flowbite-react-icons/outline";
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

export interface PastPeak {
  year: number;
  monthKey: string;
  planet: string;
  house: number | null;
  label: string;
  tier: "PEAK";
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
  pastPeaks: PastPeak[];
  lifetime: LifetimeStats | null;
  fromCache?: boolean;
  fallback?: "mock";
}

interface HeroSignalCardProps {
  signal: RealSignal;
  copy: {
    actI: string;
    actII: string;
    actIII: string;
    pastIntro: string;
    pastQuestion: string;
    presentEyebrow: string;
    futureIntro: string;
    futureBody: string;
    nextWindow: string;
    teaserTitle: string;
    teaserBody: string;
    appStoreCta: string;
    activeNowBadge: string;
    finalPitch: string;
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
  const [ys, ms] = start.split("-").map(Number);
  const [ye, me] = end.split("-").map(Number);
  if (ys === ye) {
    return `${MONTH_FR_FULL[ms - 1]} → ${MONTH_FR_FULL[me - 1]} ${ys}`;
  }
  return `${monthLabelShort(start)} ${ys} → ${monthLabelShort(end)} ${ye}`;
}

// ─── Section header (3-act marker) ──────────────────────────

function ActHeader({ act, label }: { act: "I" | "II" | "III"; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full font-display text-[10px] font-bold"
        style={{
          background: "color-mix(in srgb, var(--accent-purple) 18%, transparent)",
          color: "var(--accent-purple)",
          border: "1px solid color-mix(in srgb, var(--accent-purple) 30%, transparent)",
        }}
      >
        {act}
      </span>
      <span
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: "var(--accent-purple)", opacity: 0.85 }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Past peak chip (interactive) ───────────────────────────

function PastPeakRow({ peak, delay }: { peak: PastPeak; delay: number }) {
  const [open, setOpen] = useState(false);
  const planet = planetMeta(peak.planet);
  const house = houseMeta(peak.house);
  const color = house?.color ?? planet?.color ?? "#9585CC";

  return (
    <motion.button
      type="button"
      onClick={() => setOpen((o) => !o)}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="group flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition-colors"
      style={{
        background: open
          ? `color-mix(in srgb, ${color} 10%, transparent)`
          : "var(--bg-secondary, rgba(255,255,255,0.04))",
        border: `1px solid color-mix(in srgb, ${color} ${open ? 28 : 12}%, transparent)`,
      }}
      aria-expanded={open}
    >
      <span
        className="font-display text-xl font-bold tabular-nums"
        style={{ color, opacity: open ? 0.95 : 0.55 }}
      >
        {peak.year}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold text-white/85">
          {planet && <span className="font-mono text-[13px]" style={{ color: planet.color }}>{planet.symbol}</span>}
          <span className="truncate">
            {planet?.label ?? peak.label} {house ? `· ${house.label}` : ""}
          </span>
        </p>
        <AnimatePresence initial={false}>
          {open && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-1 text-[11px] leading-snug text-white/55"
            >
              Cette période a façonné ta relation à {house?.label?.toLowerCase() ?? "cette dimension de ta vie"}.
              Reconnais-tu ce moment&nbsp;?
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <span
        className="shrink-0 rounded-full px-1.5 py-0.5"
        style={{
          background: `color-mix(in srgb, ${color} 18%, transparent)`,
          color,
        }}
      >
        {open ? <ChevronUp width={11} height={11} /> : <ChevronDown width={11} height={11} />}
      </span>
    </motion.button>
  );
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
  const pastPeaks = signal.pastPeaks ?? [];

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
        {/* ═══════════════════ ACT I — PASSÉ ═══════════════════ */}
        {pastPeaks.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-6 pt-6 md:px-8 md:pt-8"
          >
            <ActHeader act="I" label={copy.actI} />
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">
              {copy.pastIntro}
            </p>
            <div className="mt-3 space-y-1.5">
              {pastPeaks.map((p, i) => (
                <PastPeakRow key={`${p.year}-${p.planet}`} peak={p} delay={0.25 + i * 0.08} />
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] italic text-white/50">
              {copy.pastQuestion}
            </p>
          </motion.section>
        )}

        {/* ── divider ── */}
        <div
          className="my-6 mx-6 md:mx-8 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
          aria-hidden
        />

        {/* ═══════════════════ ACT II — AUJOURD'HUI ═══════════════════ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="px-6 md:px-8"
        >
          <ActHeader act="II" label={copy.actII} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 280 }}
            className="mt-3 flex items-center gap-2"
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
                {copy.activeNowBadge}
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

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62 }}
            className="mt-3 font-display text-2xl font-bold leading-tight text-white md:text-[28px]"
          >
            {signal.delineation?.titre ?? planet?.label ?? signal.label}
          </motion.h2>
          {signal.delineation?.sousTitre && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.66 }}
              className="mt-1 text-sm text-white/60"
            >
              {signal.delineation.sousTitre}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-3 flex flex-wrap items-center gap-2"
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

          {signal.delineation?.corps && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78 }}
              className="mt-4 text-[15px] leading-relaxed text-white/85"
            >
              {signal.delineation.corps}
            </motion.p>
          )}

          {signal.delineation?.avecLeRecul && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="mt-4 rounded-2xl px-4 py-3.5"
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
                    Ce que ça veut dire pour toi
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/85">
                    {signal.delineation.avecLeRecul}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.section>

        <div
          className="my-6 mx-6 md:mx-8 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
          aria-hidden
        />

        {/* ═══════════════════ ACT III — FUTUR ═══════════════════ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="px-6 md:px-8"
        >
          <ActHeader act="III" label={copy.actIII} />
          <p className="mt-2 text-[13px] leading-relaxed text-white/70">
            {copy.futureIntro}
          </p>

          {/* Lifetime counts — past vs upcoming as journey markers */}
          {lt && lt.totalLifetime > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/45">
                  <Clock width={10} height={10} /> Derrière toi
                </p>
                <p className="mt-0.5 font-display text-xl font-bold text-white/90">
                  {lt.pastPeak}
                  <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-white/40">
                    pics
                  </span>
                </p>
                <p className="text-[11px] text-white/55">
                  + {lt.pastClear} alignements clairs
                </p>
              </div>
              <div
                className="rounded-xl border px-3 py-2.5"
                style={{
                  borderColor: "color-mix(in srgb, var(--accent-purple) 30%, transparent)",
                  background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
                }}
              >
                <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>
                  <ChartLineUp width={10} height={10} /> Devant toi
                </p>
                <p className="mt-0.5 font-display text-xl font-bold text-white">
                  {lt.upcomingPeak}
                  <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-white/55">
                    pics
                  </span>
                </p>
                <p className="text-[11px] text-white/65">
                  + {lt.upcomingClear} alignements clairs
                </p>
              </div>
            </div>
          )}

          {/* Next major window */}
          {next && (
            <div
              className="mt-4 relative overflow-hidden rounded-2xl px-4 py-4"
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
                  </div>
                  <p className="mt-2 text-[11px] italic text-white/55">
                    {copy.futureBody}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Future blur strip — "tes 12 prochains mois" */}
          {signal.futureMonths.length > 0 && (
            <div className="mt-5">
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
            </div>
          )}
        </motion.section>

        {/* ═══════════════════ FINAL PITCH + CTA ═══════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 px-6 pb-6 md:px-8 md:pb-8"
        >
          <div
            className="rounded-2xl border p-5 text-center"
            style={{
              background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-purple) 14%, transparent), color-mix(in srgb, var(--accent-purple) 4%, transparent))",
              borderColor: "color-mix(in srgb, var(--accent-purple) 30%, transparent)",
            }}
          >
            <p className="font-display text-base font-semibold leading-snug text-white">
              {copy.finalPitch}
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white/85">
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
