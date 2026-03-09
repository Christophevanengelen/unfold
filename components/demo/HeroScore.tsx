"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { arcDraw, numberEntrance, getScoreZone, formatDelta } from "@/lib/animations";

interface HeroScoreProps {
  score: number;
  delta: number;
  label: string;
  onTap?: () => void;
}

export function HeroScore({ score, delta, label, onTap }: HeroScoreProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  function handleTap() {
    if (onTap) {
      onTap();
    } else {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    }
  }
  const zone = getScoreZone(score);

  // Arc geometry: 270° sweep on a 140px diameter circle
  const size = 140;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  // 270° arc: starts at 135° (bottom-left), sweeps 270° to 45° (bottom-right)
  const startAngle = 135;
  const endAngle = 45;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const startX = center + radius * Math.cos(startRad);
  const startY = center + radius * Math.sin(startRad);
  const endX = center + radius * Math.cos(endRad);
  const endY = center + radius * Math.sin(endRad);

  // Score-based fill ratio (0-100 maps to arc)
  const fillRatio = Math.min(score / 100, 1);

  // Color mapping based on zone
  const arcColor =
    zone.zone === "thriving"
      ? "var(--accent-green)"
      : zone.zone === "maintaining"
        ? "var(--accent-orange)"
        : "var(--danger)";

  const deltaColor =
    delta > 0
      ? "var(--accent-green)"
      : delta < 0
        ? "var(--danger)"
        : "var(--text-body-subtle)";

  const deltaArrow = delta > 0 ? "\u2191" : delta < 0 ? "\u2193" : "";

  return (
    <motion.div
      className="flex flex-col items-center py-4"
      variants={numberEntrance}
      initial="hidden"
      animate="visible"
    >
      {/* Arc + number container — clickable */}
      <button
        type="button"
        className="relative cursor-pointer transition-transform active:scale-[0.97]"
        style={{ width: size, height: size }}
        onClick={handleTap}
      >
        {/* Background arc (track) */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
        >
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`}
            fill="none"
            stroke="var(--border-muted)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.5}
          />
        </svg>

        {/* Filled arc (progress) — breathing pulse */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="absolute inset-0"
          style={{ animation: "arc-breathe 3s ease-in-out infinite" }}
        >
          <motion.path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`}
            fill="none"
            stroke={arcColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            variants={arcDraw}
            initial="hidden"
            animate="visible"
            style={{
              pathLength: fillRatio,
            }}
          />
        </svg>

        {/* Score number centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-bold leading-none"
            style={{
              fontSize: 72,
              letterSpacing: -2,
              color: "var(--text-heading)",
            }}
          >
            <AnimatedNumber value={score} duration={0.8} />
          </span>
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              className="absolute -bottom-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium"
              style={{
                background: "var(--bg-brand)",
                color: "var(--text-on-brand)",
              }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              Full day reading coming soon
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Label */}
      <p
        className="mt-1 font-medium uppercase"
        style={{
          fontSize: 11,
          letterSpacing: "0.15em",
          color: "var(--text-body-subtle)",
        }}
      >
        {label}
      </p>

      {/* Delta */}
      {delta !== 0 && (
        <motion.p
          className="mt-1 text-xs font-medium"
          style={{ color: deltaColor }}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          {deltaArrow} {Math.abs(delta)} since yesterday
        </motion.p>
      )}
    </motion.div>
  );
}
