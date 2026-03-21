"use client";

import { motion } from "motion/react";
import { OnboardingProgress } from "./OnboardingProgress";
import { planetConfig, type PlanetKey } from "@/lib/domain-config";

interface StepTimelineTeaserProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 3 — Solar system visualization.
 * Planets on orbits, with active ones highlighted + labeled.
 * The "this is what shapes your timing" moment.
 */

interface PlanetOrbit {
  key: PlanetKey;
  orbit: number; // radius in px
  size: number;  // dot size
  speed: number; // rotation duration in seconds
  startAngle: number; // initial angle in degrees
  isActive: boolean;  // highlighted for this momentum
}

const PLANETS: PlanetOrbit[] = [
  { key: "sun",     orbit: 0,   size: 14, speed: 0,   startAngle: 0,   isActive: true },
  { key: "moon",    orbit: 24,  size: 6,  speed: 8,   startAngle: 60,  isActive: false },
  { key: "mercury", orbit: 38,  size: 5,  speed: 12,  startAngle: 200, isActive: false },
  { key: "venus",   orbit: 52,  size: 6,  speed: 16,  startAngle: 320, isActive: false },
  { key: "mars",    orbit: 66,  size: 6,  speed: 22,  startAngle: 130, isActive: false },
  { key: "jupiter", orbit: 82,  size: 9,  speed: 30,  startAngle: 250, isActive: true },
  { key: "saturn",  orbit: 98,  size: 8,  speed: 38,  startAngle: 40,  isActive: true },
  { key: "uranus",  orbit: 112, size: 6,  speed: 50,  startAngle: 160, isActive: false },
  { key: "neptune", orbit: 126, size: 6,  speed: 60,  startAngle: 300, isActive: true },
];

const CENTER = 148;

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

      {/* Solar system */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative" style={{ width: CENTER * 2, height: CENTER * 2 }}>

          {/* Your zone — a subtle arc highlighting where active planets cluster */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 280,
              height: 280,
              left: CENTER - 140,
              top: CENTER - 140,
              background: "conic-gradient(from 220deg, transparent 0deg, rgba(124,107,191,0.08) 30deg, rgba(124,107,191,0.12) 80deg, rgba(124,107,191,0.08) 130deg, transparent 160deg)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
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
                border: `1px solid rgba(255,255,255,${p.isActive ? 0.08 : 0.03})`,
              }}
            />
          ))}

          {/* Planets */}
          {PLANETS.map((p, i) => {
            const config = planetConfig[p.key];
            const angle = p.startAngle * (Math.PI / 180);
            const x = CENTER + p.orbit * Math.cos(angle);
            const y = CENTER + p.orbit * Math.sin(angle);

            return (
              <motion.div
                key={p.key}
                className="absolute flex flex-col items-center"
                style={{
                  left: x,
                  top: y,
                  transform: "translate(-50%, -50%)",
                  zIndex: p.isActive ? 10 : 1,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              >
                {/* Pulse ring for active planets */}
                {p.isActive && p.orbit > 0 && (
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: p.size + 14,
                      height: p.size + 14,
                      border: `1.5px solid ${config.color}`,
                      opacity: 0.3,
                      left: -(14 / 2),
                      top: -(14 / 2),
                    }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {/* Planet dot */}
                <div
                  className="rounded-full relative"
                  style={{
                    width: p.isActive && p.orbit > 0 ? p.size + 4 : p.size,
                    height: p.isActive && p.orbit > 0 ? p.size + 4 : p.size,
                    backgroundColor: config.color,
                    opacity: p.isActive ? 1 : 0.25,
                    boxShadow: p.isActive
                      ? `0 0 ${p.size * 3}px ${config.color}60`
                      : "none",
                  }}
                />
                {/* Label for active planets */}
                {p.isActive && p.orbit > 0 && (
                  <motion.span
                    className="mt-1.5 text-[9px] font-semibold whitespace-nowrap"
                    style={{ color: config.color, opacity: 0.9 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ delay: 0.6 + i * 0.08 }}
                  >
                    {config.label}
                  </motion.span>
                )}
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
        transition={{ delay: 1.2 }}
      >
        Three planets are crossing your zone right now.
        <br />
        They shape what you feel.
      </motion.p>

      <motion.div
        className="pt-2 pb-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          Make it personal
        </button>
      </motion.div>
    </motion.div>
  );
}
