"use client";

import { motion } from "motion/react";
import { planetConfig } from "@/lib/domain-config";
import { getTierLabel, type CapsuleData } from "@/lib/capsules";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface CapsuleCardProps {
  capsule: CapsuleData;
  mode: "past" | "present" | "future";
  isActive: boolean;
  onExplore?: () => void;
}

/**
 * CapsuleCard — renders a capsule as a card in the home carousel.
 *
 * Past: colored planets, title, description, occurrence number
 * Present: planets, intensity, title, narrative, timing window
 * Future: blurred planets, teaser, premium lock
 */
export function CapsuleCard({ capsule, mode, isActive, onExplore }: CapsuleCardProps) {
  const tierLabel = getTierLabel(capsule.tier);
  const phase = capsule.phases[0];
  const startLabel = `${capsule.startDate.getDate()} ${MONTH_NAMES[capsule.startDate.getMonth()]} ${capsule.startDate.getFullYear()}`;
  const endLabel = capsule.isCurrent
    ? "Now"
    : `${capsule.endDate.getDate()} ${MONTH_NAMES[capsule.endDate.getMonth()]} ${capsule.endDate.getFullYear()}`;
  const maxIntensity = Math.max(...capsule.domains.map((d) => d.intensity));

  return (
    <div className="relative flex h-full flex-col items-center px-5">
      {/* Mode label */}
      <p
        className="pt-5 text-[10px] font-semibold uppercase tracking-[0.2em]"
        style={{ color: mode === "future" ? "var(--text-disabled)" : "var(--accent-purple)" }}
      >
        {mode === "past" ? "Past" : mode === "present" ? "Now" : "Next"}
      </p>

      {/* Planet dots — the keywords */}
      <div
        className="mt-5 flex flex-wrap justify-center gap-2"
        style={mode === "future" ? { filter: "blur(4px)", opacity: 0.4 } : undefined}
      >
        {capsule.planets.map((planet, i) => {
          const pc = planetConfig[planet];
          return (
            <motion.div
              key={planet}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.8 }}
              transition={{ delay: 0.1 + i * 0.06, type: "spring", stiffness: 300 }}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: `color-mix(in srgb, ${pc.color} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${pc.color} 25%, transparent)`,
              }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: pc.color, boxShadow: `0 0 6px ${pc.color}` }}
              />
              <span className="text-[11px] font-medium" style={{ color: pc.color }}>
                {pc.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Intensity number — large, centered */}
      {mode !== "future" && (
        <motion.div
          className="mt-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 5 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span
            className="font-display leading-none"
            style={{
              fontSize: 72,
              fontWeight: 300,
              letterSpacing: -3,
              color: "var(--accent-purple)",
            }}
          >
            {maxIntensity}
          </span>
          <span
            className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--accent-purple)", opacity: 0.6 }}
          >
            {tierLabel}
          </span>
        </motion.div>
      )}

      {/* Future: blurred intensity placeholder */}
      {mode === "future" && (
        <div className="mt-6 flex flex-col items-center" style={{ filter: "blur(6px)", opacity: 0.3 }}>
          <span
            className="font-display leading-none"
            style={{ fontSize: 72, fontWeight: 300, color: "var(--accent-purple)" }}
          >
            ??
          </span>
          <span
            className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em]"
            style={{ color: "var(--accent-purple)" }}
          >
            {tierLabel}
          </span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Title + narrative */}
      <div className="w-full shrink-0 pb-5">
        {mode !== "future" && phase && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 4 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center"
          >
            <h3
              className="text-base font-semibold leading-tight"
              style={{ color: "var(--text-heading)" }}
            >
              {phase.title}
            </h3>
            <p
              className="mt-1 text-[11px]"
              style={{ color: "var(--text-body-subtle)" }}
            >
              {phase.subtitle}
            </p>

            {/* Occurrence + date range */}
            <p
              className="mt-3 text-[10px] tabular-nums"
              style={{ color: "var(--text-disabled)" }}
            >
              {capsule.tier === "toctoctoc" && capsule.tierOccurrence > 0 ? `#${capsule.tierOccurrence} · ` : ""}{startLabel} — {endLabel}
            </p>

            {/* Explore button */}
            {onExplore && (
              <button
                type="button"
                onClick={onExplore}
                className="mt-3 w-full rounded-2xl py-3 text-xs font-medium transition-transform active:scale-[0.98]"
                style={{
                  background: "color-mix(in srgb, var(--accent-purple) 12%, var(--bg-secondary))",
                  color: "var(--accent-purple)",
                }}
              >
                Explore
              </button>
            )}
          </motion.div>
        )}

        {/* Future: teaser */}
        {mode === "future" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : { opacity: 0.5 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p
              className="text-xs font-medium"
              style={{ color: "var(--text-body-subtle)" }}
            >
              Your next momentum is forming
            </p>
            <p
              className="mt-1 text-[10px]"
              style={{ color: "var(--text-disabled)" }}
            >
              Starts {startLabel}
            </p>
            <div
              className="mt-3 rounded-2xl py-3 text-center text-xs font-medium"
              style={{
                background: "color-mix(in srgb, var(--accent-purple) 8%, var(--bg-secondary))",
                color: "var(--accent-purple)",
                opacity: 0.6,
              }}
            >
              Premium: see what's coming
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
