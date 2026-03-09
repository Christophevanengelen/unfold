"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Share2, Sparkles } from "lucide-react";
import { mockCompatibility, mockUser } from "@/lib/mock-data";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { fadeInUp, staggerContainer, numberEntrance, arcDraw } from "@/lib/animations";

const strengthColors: Record<string, string> = {
  strong: "var(--accent-green)",
  moderate: "var(--accent-orange)",
  developing: "var(--accent-blue)",
};

const axisColors: Record<string, string> = {
  love: "var(--accent-pink)",
  health: "var(--accent-green)",
  work: "var(--accent-blue)",
};

export default function CompatibilityPage() {
  const { score, partnerName, synergies, sharedPeaks, whatMakesYouWork, bestDaysTogether } = mockCompatibility;

  // Arc geometry for compatibility ring — same approach as HeroScore
  const size = 140;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const startAngle = 135;
  const endAngle = 45;
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const startX = center + radius * Math.cos(startRad);
  const startY = center + radius * Math.sin(startRad);
  const endX = center + radius * Math.cos(endRad);
  const endY = center + radius * Math.sin(endRad);
  const fillRatio = Math.min(score / 100, 1);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-6">
        <p className="text-sm text-text-body-subtle">
          {mockUser.name} & {partnerName}
        </p>
      </motion.div>

      {/* Hero compatibility score */}
      <motion.div
        className="flex flex-col items-center py-4"
        variants={numberEntrance}
        initial="hidden"
        animate="visible"
      >
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background arc */}
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

          {/* Filled arc */}
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="absolute inset-0"
          >
            <motion.path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`}
              fill="none"
              stroke="var(--accent-pink)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              variants={arcDraw}
              initial="hidden"
              animate="visible"
              style={{ pathLength: fillRatio }}
            />
          </svg>

          {/* Score centered */}
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
        </div>

        {/* Label */}
        <p
          className="mt-1 font-medium uppercase"
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "var(--text-body-subtle)",
          }}
        >
          Compatibility
        </p>
      </motion.div>

      {/* Synergy breakdown */}
      <motion.div className="mt-6 space-y-3" variants={staggerContainer}>
        <motion.p
          className="font-semibold uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.15em",
            color: "var(--text-body-subtle)",
          }}
          variants={fadeInUp}
        >
          Synergies
        </motion.p>

        {synergies.map((s) => (
          <motion.div
            key={s.axis}
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{ background: "var(--bg-secondary)" }}
            variants={fadeInUp}
          >
            {/* Axis dot */}
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: axisColors[s.axis] || "var(--accent-purple)" }}
            />

            {/* Content */}
            <div className="flex-1">
              <span className="text-[13px] font-semibold capitalize text-text-heading">
                {s.axis}
              </span>
              <p className="mt-0.5 text-xs text-text-body-subtle">
                {s.description}
              </p>
            </div>

            {/* Strength indicator */}
            <span
              className="text-xs font-semibold capitalize"
              style={{ color: strengthColors[s.strength] || "var(--text-body-subtle)" }}
            >
              {s.strength}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* What makes you work — insight card */}
      {whatMakesYouWork && (
        <motion.div className="mt-8" variants={fadeInUp}>
          <p
            className="mb-3 font-semibold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "var(--text-body-subtle)",
            }}
          >
            What makes you work
          </p>
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--accent-pink) 6%, var(--bg-secondary)), var(--bg-secondary))",
              borderLeft: "3px solid var(--accent-pink)",
            }}
          >
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles
                size={12}
                strokeWidth={1.5}
                style={{ color: "var(--accent-pink)" }}
              />
              <span
                className="text-[10px] font-semibold uppercase"
                style={{
                  letterSpacing: "0.1em",
                  color: "var(--accent-pink)",
                }}
              >
                Insight
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-text-body">
              {whatMakesYouWork}
            </p>
          </div>
        </motion.div>
      )}

      {/* Best days together */}
      {bestDaysTogether && bestDaysTogether.length > 0 && (
        <motion.div className="mt-8" variants={fadeInUp}>
          <p
            className="mb-3 font-semibold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "var(--text-body-subtle)",
            }}
          >
            Your Best Days Together
          </p>
          <div className="space-y-2">
            {bestDaysTogether.map((day, i) => {
              const d = new Date(day.date);
              return (
                <motion.div
                  key={day.date}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{
                    background:
                      "color-mix(in srgb, var(--accent-pink) 6%, var(--bg-secondary))",
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  {/* Date pill */}
                  <div
                    className="flex shrink-0 flex-col items-center rounded-xl px-3 py-2"
                    style={{
                      background:
                        "color-mix(in srgb, var(--accent-pink) 12%, transparent)",
                    }}
                  >
                    <span
                      className="text-[10px] font-medium uppercase"
                      style={{ color: "var(--text-body-subtle)" }}
                    >
                      {d.toLocaleDateString("en", { month: "short" })}
                    </span>
                    <span
                      className="font-display text-lg font-bold"
                      style={{ color: "var(--accent-pink)" }}
                    >
                      {d.toLocaleDateString("en", { day: "numeric" })}
                    </span>
                  </div>
                  {/* Context */}
                  <p className="flex-1 text-xs leading-relaxed text-text-body">
                    {day.context}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Share button */}
      <motion.div className="mt-8" variants={fadeInUp}>
        <Link
          href="/demo/invite"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
          style={{
            borderColor: "var(--accent-pink)",
            color: "var(--accent-pink)",
          }}
        >
          <Share2 size={16} strokeWidth={1.5} />
          Share with {partnerName}
        </Link>
      </motion.div>
    </motion.div>
  );
}
