"use client";

import { motion } from "motion/react";
import { OnboardingProgress } from "./OnboardingProgress";
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
// Total animation: 0.5s delay + 2s orbit + 0.5s settle
const ORBIT_DURATION = 2;
const SETTLE_DELAY = ORBIT_DURATION + 0.5;

export function StepTimelineTeaser({ onNext, onBack }: StepTimelineTeaserProps) {
  return (
    <motion.div className="flex h-full flex-col">
      <OnboardingProgress current={2} />

      <motion.button
        type="button"
        onClick={onBack}
        className="mt-4 self-start text-xs font-medium"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-1">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
        style={{ color: "var(--accent-purple)", opacity: 0.45 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        transition={{ delay: 0.4 }}
      >
        The domain tells you what. The planets tell you why.
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

          {/* Orbit rings */}
          {PLANETS.filter(p => p.orbit > 0).map(p => (
            <div
              key={`orbit-${p.key}`}
              className="absolute rounded-full"
              style={{
                width: p.orbit * 2,
                height: p.orbit * 2,
                left: CENTER - p.orbit,
                top: CENTER - p.orbit,
                border: `1px solid rgba(255,255,255,0.04)`,
              }}
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
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          />

          {/* Planets — orbit then settle */}
          {PLANETS.filter(p => p.orbit > 0).map((p, i) => {
            const config = planetConfig[p.key];

            // Orbit animation: from fromAngle, rotate N full turns, land on toAngle
            const totalAngle = p.rotations * 360 + (p.toAngle - p.fromAngle);

            return (
              <motion.div
                key={p.key}
                className="absolute"
                style={{
                  width: p.orbit * 2,
                  height: p.orbit * 2,
                  left: CENTER - p.orbit,
                  top: CENTER - p.orbit,
                  zIndex: p.isActive ? 10 : 1,
                }}
                initial={{ rotate: p.fromAngle }}
                animate={{ rotate: p.fromAngle + totalAngle }}
                transition={{ delay: 0.5, duration: ORBIT_DURATION, ease: [0.2, 0.8, 0.2, 1] }}
              >
                {/* Planet at 12 o'clock — dot centered on orbit, label below (absolute) */}
                <div className="absolute"
                  style={{ left: "50%", top: 0, transform: "translate(-50%, -50%)" }}>

                  {/* Counter-rotate the content so labels stay horizontal */}
                  <motion.div
                    className="relative"
                    initial={{ rotate: -p.fromAngle }}
                    animate={{ rotate: -(p.fromAngle + totalAngle) }}
                    transition={{ delay: 0.5, duration: ORBIT_DURATION, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    {/* Dot — centered on orbit point */}
                    <motion.div
                      className="rounded-full relative flex items-center justify-center"
                      style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: config.color,
                      }}
                      initial={{ opacity: 0.7 }}
                      animate={{
                        opacity: 1,
                        scale: p.isActive ? 1.2 : 1,
                        boxShadow: p.isActive ? `0 0 ${p.size * 3}px ${config.color}60` : "none",
                      }}
                      transition={{ delay: SETTLE_DELAY, duration: 0.5 }}
                    >
                      {p.isActive && (
                        <motion.div
                          className="absolute rounded-full"
                          style={{
                            width: (p.size + 4) * 2,
                            height: (p.size + 4) * 2,
                            border: `1px solid ${config.color}`,
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.3, 0], scale: [1, 1.4, 1] }}
                          transition={{ delay: SETTLE_DELAY + 0.5, duration: 2.5, repeat: Infinity }}
                        />
                      )}
                    </motion.div>
                    {/* Label — absolute below dot, doesn't affect dot position */}
                    {p.isActive && (
                      <motion.span
                        className="absolute left-1/2 text-[9px] font-semibold whitespace-nowrap"
                        style={{ color: config.color, top: p.size + 6, transform: "translateX(-50%)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        transition={{ delay: SETTLE_DELAY + 0.3, duration: 0.4 }}
                      >
                        {config.label}
                      </motion.span>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.p
        className="text-center text-sm leading-relaxed px-6 pb-2"
        style={{ color: "var(--accent-purple)", opacity: 0.6 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: SETTLE_DELAY + 0.5 }}
      >
        Some are passing through your zone.
        <br />
        Which ones? It depends on you.
      </motion.p>

      <motion.div
        className="pt-2 pb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          Find out
        </button>
      </motion.div>
    </motion.div>
  );
}
