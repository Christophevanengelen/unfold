"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

import { planetConfig, type PlanetKey } from "@/lib/domain-config";

interface StepTimelineTeaserProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 3 — Solar system with orbiting planets.
 * Planets orbit, then the active ones stop in a zone and light up.
 * "These planets are crossing your zone right now."
 */

interface PlanetOrbit {
  key: PlanetKey;
  orbit: number;
  size: number;
  /** Starting angle (random) */
  fromAngle: number;
  /** Final resting angle — active ones cluster in the "zone" (280-340deg) */
  toAngle: number;
  isActive: boolean;
  /** How many full rotations before stopping */
  rotations: number;
}

const PLANETS: PlanetOrbit[] = [
  // Visible sizes, proportional: Sun > Jupiter > Saturn > Neptune/Uranus > Venus > Mars > Mercury > Moon
  { key: "sun",     orbit: 0,   size: 16, fromAngle: 0,   toAngle: 0,   isActive: true,  rotations: 0 },
  { key: "moon",    orbit: 20,  size: 3,  fromAngle: 90,  toAngle: 150, isActive: false, rotations: 3 },
  { key: "mercury", orbit: 32,  size: 3,  fromAngle: 200, toAngle: 45,  isActive: false, rotations: 2 },
  { key: "venus",   orbit: 42,  size: 6,  fromAngle: 320, toAngle: 180, isActive: false, rotations: 2 },
  { key: "mars",    orbit: 54,  size: 4,  fromAngle: 130, toAngle: 120, isActive: false, rotations: 1 },
  { key: "jupiter", orbit: 70,  size: 9,  fromAngle: 60,  toAngle: 300, isActive: true,  rotations: 1 },
  { key: "saturn",  orbit: 84,  size: 8,  fromAngle: 180, toAngle: 330, isActive: true,  rotations: 1 },
  { key: "uranus",  orbit: 96,  size: 6,  fromAngle: 270, toAngle: 200, isActive: false, rotations: 1 },
  { key: "neptune", orbit: 110, size: 6,  fromAngle: 10,  toAngle: 270, isActive: true,  rotations: 1 },
];

const CENTER = 125;
// Installation sequence: sun → rings → planets pop → orbit → settle
const ORBIT_DELAY = 1.4;      // planets start orbiting at 1.4s
const ORBIT_DURATION = 2;
const SETTLE_DELAY = ORBIT_DELAY + ORBIT_DURATION;

// Active planets for sequential spotlight
const ACTIVE_PLANETS = PLANETS.filter(p => p.isActive && p.orbit > 0);

/**
 * Sequential spotlight phases:
 * 0: orbiting (0 - SETTLE_DELAY)
 * 1: first active planet spotlight
 * 2: second active planet spotlight
 * 3: third active planet spotlight
 * 4: all lit + CTA visible
 */
const SPOTLIGHT_START = SETTLE_DELAY + 0.8;  // 4.2s — first planet spotlight
const SPOTLIGHT_INTERVAL = 1.2;               // 1.2s between each planet

export function StepTimelineTeaser({ onNext, onBack }: StepTimelineTeaserProps) {
  // Which active planet is currently spotlighted (-1 = none, 0-N = index, N+1 = all done)
  const [spotlightIndex, setSpotlightIndex] = useState(-1);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    ACTIVE_PLANETS.forEach((_, i) => {
      timers.push(setTimeout(() => setSpotlightIndex(i), (SPOTLIGHT_START + i * SPOTLIGHT_INTERVAL) * 1000));
    });
    // Final phase: all lit + CTA
    timers.push(setTimeout(
      () => setSpotlightIndex(ACTIVE_PLANETS.length),
      (SPOTLIGHT_START + ACTIVE_PLANETS.length * SPOTLIGHT_INTERVAL) * 1000
    ));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <motion.div className="flex h-full flex-col">

      <motion.button
        type="button"
        onClick={onBack}
        className="self-start text-xs font-medium"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-1">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <h1 className="font-display text-2xl font-bold"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}>
          Planets shape
          <br />
          your timing.
        </h1>
      </motion.div>

      <motion.p
        className="mt-2 text-center text-xs leading-relaxed"
        style={{ color: "var(--accent-purple)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        Each one carries a signal. Some are active right now.
      </motion.p>

      <div className="flex-1 relative overflow-hidden">
        <div className="absolute" style={{ width: CENTER * 2, height: CENTER * 2, left: "50%", top: "50%", transform: "translate(-50%, -50%) scale(1.2)" }}>

          {/* Your zone halo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: CENTER * 2,
              height: CENTER * 2,
              left: 0,
              top: 0,
              background: "conic-gradient(from 260deg, transparent 0deg, rgba(124,107,191,0.06) 20deg, rgba(124,107,191,0.12) 50deg, rgba(124,107,191,0.06) 80deg, transparent 100deg)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: SETTLE_DELAY, duration: 0.6 }}
          />

          {/* Orbit rings — staggered from center outward */}
          {PLANETS.filter(p => p.orbit > 0).map((p, i) => (
            <motion.div
              key={`orbit-${p.key}`}
              className="absolute rounded-full"
              style={{
                width: p.orbit * 2,
                height: p.orbit * 2,
                left: CENTER - p.orbit,
                top: CENTER - p.orbit,
                border: `1px solid rgba(255,255,255,0.04)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
          ))}

          {/* Sun — same center as orbit rings, independent layer */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 16, height: 16,
              left: CENTER - 8,
              top: CENTER - 8,
              zIndex: 20,
              backgroundColor: planetConfig.sun.color,
              boxShadow: `0 0 20px ${planetConfig.sun.color}90, 0 0 40px ${planetConfig.sun.color}60, 0 0 80px ${planetConfig.sun.color}30`,
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Planets — orbit then settle, then sequential spotlight */}
          {PLANETS.filter(p => p.orbit > 0).map((p, i) => {
            const config = planetConfig[p.key];
            const totalAngle = p.rotations * 360 + (p.toAngle - p.fromAngle);

            // Find this planet's spotlight index (among active planets)
            const activeIdx = ACTIVE_PLANETS.findIndex(ap => ap.key === p.key);
            const isBeingSpotlighted = activeIdx !== -1 && spotlightIndex === activeIdx;
            const hasBeenSpotlighted = activeIdx !== -1 && spotlightIndex > activeIdx;
            const isLit = isBeingSpotlighted || hasBeenSpotlighted;

            return (
              <motion.div
                key={p.key}
                className="absolute"
                style={{
                  width: p.orbit * 2,
                  height: p.orbit * 2,
                  left: CENTER - p.orbit,
                  top: CENTER - p.orbit,
                  zIndex: isBeingSpotlighted ? 20 : p.isActive ? 10 : 1,
                }}
                initial={{ rotate: p.fromAngle }}
                animate={{ rotate: p.fromAngle + totalAngle }}
                transition={{ delay: ORBIT_DELAY, duration: ORBIT_DURATION, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="absolute"
                  style={{ left: "50%", top: 0, transform: "translate(-50%, -50%)" }}>

                  <motion.div
                    className="relative"
                    initial={{ rotate: -p.fromAngle }}
                    animate={{ rotate: -(p.fromAngle + totalAngle) }}
                    transition={{ delay: ORBIT_DELAY, duration: ORBIT_DURATION, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Planet dot — spotlighted planets scale up and glow */}
                    <motion.div
                      className="rounded-full relative flex items-center justify-center"
                      style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: config.color,
                      }}
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{
                        opacity: p.isActive
                          ? (spotlightIndex >= 0 ? (isLit ? 1 : 0.3) : 1)
                          : (spotlightIndex >= 0 ? 0.2 : 1),
                        scale: isBeingSpotlighted ? 1.6 : (isLit ? 1.2 : 1),
                        boxShadow: isBeingSpotlighted
                          ? `0 0 ${p.size * 5}px ${config.color}90, 0 0 ${p.size * 8}px ${config.color}40`
                          : isLit
                            ? `0 0 ${p.size * 3}px ${config.color}60`
                            : "none",
                      }}
                      transition={{
                        opacity: { delay: spotlightIndex >= 0 ? 0 : 0.8 + i * 0.1, duration: 0.5 },
                        scale: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                        boxShadow: { duration: 0.6 },
                      }}
                    >
                      {/* Pulse ring — only on currently spotlighted planet */}
                      {p.isActive && isBeingSpotlighted && (
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            width: (p.size + 6) * 2,
                            height: (p.size + 6) * 2,
                            border: `1.5px solid ${config.color}`,
                          }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.6, 2] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                      {/* Subtle pulse on already-lit planets */}
                      {p.isActive && hasBeenSpotlighted && (
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            width: (p.size + 4) * 2,
                            height: (p.size + 4) * 2,
                            border: `1px solid ${config.color}`,
                          }}
                          animate={{ opacity: [0, 0.2, 0], scale: [1, 1.3, 1] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    {/* Label — appears when planet is spotlighted or has been */}
                    {p.isActive && (
                      <AnimatePresence>
                        {isLit && (
                          <motion.span
                            className="absolute left-1/2 text-[9px] font-semibold whitespace-nowrap"
                            style={{
                              color: config.color,
                              top: p.size + 6,
                              transform: "translateX(-50%)",
                            }}
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: isBeingSpotlighted ? 1 : 0.7, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                          >
                            {config.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Caption — updates as each planet is spotlighted */}
      <div className="text-center text-sm leading-relaxed px-6 pb-2 h-8">
        <AnimatePresence mode="wait">
          {spotlightIndex >= 0 && spotlightIndex < ACTIVE_PLANETS.length && (
            <motion.p
              key={`spotlight-${spotlightIndex}`}
              style={{ color: planetConfig[ACTIVE_PLANETS[spotlightIndex].key].color }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-semibold">{planetConfig[ACTIVE_PLANETS[spotlightIndex].key].label}</span>
              {" "}is active right now
            </motion.p>
          )}
          {spotlightIndex >= ACTIVE_PLANETS.length && (
            <motion.p
              key="all-done"
              style={{ color: "var(--accent-purple)", opacity: 0.8 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              Which ones are yours?
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* CTA — always in layout, fades in smoothly */}
      <motion.div
        className="mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: spotlightIndex >= ACTIVE_PLANETS.length ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: spotlightIndex >= ACTIVE_PLANETS.length ? "auto" : "none" }}
      >
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center rounded-[20px] bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          Reveal my signal
        </button>
      </motion.div>
    </motion.div>
  );
}
