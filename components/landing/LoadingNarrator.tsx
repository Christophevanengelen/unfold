"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle } from "flowbite-react-icons/solid";
import { planetConfig, type PlanetKey } from "@/lib/domain-config";

interface LoadingNarratorProps {
  /** When true, advance immediately to the final stage. */
  done?: boolean;
}

// ─── Planets being scanned (in order) ─────────────────────
// Mirrors the onboarding StepPreparing scan feed but trimmed to a tighter
// 6-planet sequence so the visitor sees a cohesive 8-12s reveal.

interface ScanStep {
  planet: PlanetKey;
  label: string;
  detail: string;
  delayMs: number;
}

const SCAN_STEPS: ScanStep[] = [
  { planet: "pluto",   label: "Pluton",   detail: "cycles profonds",        delayMs: 400 },
  { planet: "neptune", label: "Neptune",  detail: "fenêtres d'intuition",   delayMs: 1800 },
  { planet: "uranus",  label: "Uranus",   detail: "élans de libération",    delayMs: 3300 },
  { planet: "saturn",  label: "Saturne",  detail: "tests de structure",     delayMs: 5000 },
  { planet: "jupiter", label: "Jupiter",  detail: "portes d'expansion",     delayMs: 6700 },
  { planet: "venus",   label: "Vénus",    detail: "rythmes relationnels",   delayMs: 8200 },
];

// ─── Component ────────────────────────────────────────────

export function LoadingNarrator({ done }: LoadingNarratorProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (done) {
      setVisibleCount(SCAN_STEPS.length);
      return;
    }
    const timers = SCAN_STEPS.map((step, i) =>
      setTimeout(() => setVisibleCount((c) => Math.max(c, i + 1)), step.delayMs),
    );
    return () => timers.forEach(clearTimeout);
  }, [done]);

  const progress = (visibleCount / SCAN_STEPS.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto mt-10 w-full max-w-md"
    >
      <div
        className="landing-glass relative overflow-hidden rounded-3xl px-6 py-7 md:px-8"
        style={{
          border: "1px solid color-mix(in srgb, var(--accent-purple) 20%, transparent)",
          boxShadow: "0 0 60px color-mix(in srgb, var(--accent-purple) 12%, transparent)",
        }}
      >
        {/* ── Orbital planets visualization ── */}
        <PlanetOrbits visibleCount={visibleCount} />

        {/* ── Header copy ── */}
        <div className="mt-5 text-center">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: "var(--accent-purple)", opacity: 0.55 }}
          >
            Lecture de ton thème
          </p>
          <h2 className="mt-1.5 font-display text-lg font-semibold text-white/90 md:text-xl">
            Nous analysons les planètes qui te concernent
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              aria-hidden
            >
              …
            </motion.span>
          </h2>
        </div>

        {/* ── Scan feed ── */}
        <div className="mt-5 space-y-1.5">
          {SCAN_STEPS.map((step, i) => {
            const isVisible = i < visibleCount;
            const isLatest = i === visibleCount - 1 && !done;
            const isDone = i < visibleCount - 1 || done;
            const meta = planetConfig[step.planet];
            const color = meta?.color ?? "#9585CC";

            if (!isVisible) return null;

            return (
              <motion.div
                key={step.planet}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center gap-2.5 rounded-xl px-2 py-1"
              >
                {/* Status dot */}
                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                  {isDone ? (
                    <CheckCircle width={12} height={12} style={{ color }} />
                  ) : (
                    <motion.span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: color }}
                      animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </span>

                {/* Planet symbol + label */}
                <span
                  className="flex items-center gap-1.5 text-[12px] font-medium"
                  style={{
                    color,
                    opacity: isLatest ? 1 : 0.78,
                  }}
                >
                  <span className="font-mono text-[14px]">{meta?.symbol}</span>
                  {step.label}
                </span>

                {/* Detail (latest only, animated) */}
                {isLatest && (
                  <motion.span
                    className="ml-auto text-[10px]"
                    style={{ color: "var(--accent-purple)", opacity: 0.5 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                  >
                    {step.detail}
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Progress bar ── */}
        <div className="mt-5 h-[2px] w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full"
            style={{ background: "var(--accent-purple)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Orbital planets component ────────────────────────────
// 6 planets on concentric elliptical orbits, each one "lighting up"
// progressively as the scan reaches it.

function PlanetOrbits({ visibleCount }: { visibleCount: number }) {
  const W = 320;
  const H = 140;
  const cx = W / 2;
  const cy = H / 2;

  // Each planet sits at a fixed angle on its orbit ring
  const planets = SCAN_STEPS.map((s, i) => ({
    ...s,
    rx: 30 + i * 18, // ellipse semi-major axis
    ry: 14 + i * 8,  // ellipse semi-minor axis
    angle: (i * 60 + 30) * (Math.PI / 180), // distribute around the rings
    period: 12 + i * 3, // seconds per full rotation (slower for outer)
  }));

  return (
    <div className="relative mx-auto" style={{ width: W, height: H }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden
        className="overflow-visible"
      >
        {/* Orbit rings */}
        {planets.map((p, i) => {
          const isReached = i < visibleCount;
          return (
            <ellipse
              key={`ring-${p.planet}`}
              cx={cx}
              cy={cy}
              rx={p.rx}
              ry={p.ry}
              fill="none"
              stroke="currentColor"
              strokeWidth={isReached ? 0.7 : 0.4}
              style={{
                color: isReached ? planetConfig[p.planet]?.color : "white",
                opacity: isReached ? 0.4 : 0.12,
                transition: "opacity 0.6s ease, stroke-width 0.6s ease, color 0.6s ease",
              }}
            />
          );
        })}

        {/* Center sun */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={3.5}
          fill="var(--accent-purple)"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Planets */}
        {planets.map((p, i) => {
          const isReached = i < visibleCount;
          const isLatest = i === visibleCount - 1;
          const meta = planetConfig[p.planet];
          const color = meta?.color ?? "#9585CC";
          // Static position (no orbit motion to keep CPU low)
          const x = cx + p.rx * Math.cos(p.angle);
          const y = cy + p.ry * Math.sin(p.angle);
          const r = isLatest ? 5 : isReached ? 4 : 3;

          return (
            <g key={p.planet}>
              {/* Glow */}
              {isLatest && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill={color}
                  opacity={0.25}
                  animate={{ opacity: [0.15, 0.4, 0.15], r: [9, 14, 9] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <motion.circle
                cx={x}
                cy={y}
                r={r}
                fill={color}
                style={{
                  opacity: isReached ? 1 : 0.15,
                  transition: "opacity 0.7s ease",
                }}
                animate={
                  isLatest
                    ? { scale: [1, 1.18, 1] }
                    : undefined
                }
                transition={
                  isLatest
                    ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                    : undefined
                }
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
