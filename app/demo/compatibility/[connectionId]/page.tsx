"use client";

import { useParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft, Share2, Sparkles } from "lucide-react";
import { mockCompatibilityResults, mockConnections } from "@/lib/mock-data";
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

export default function ConnectionDetailPage() {
  const params = useParams();
  const connectionId = params.connectionId as string;

  const result = mockCompatibilityResults[connectionId];
  const connection = mockConnections.find((c) => c.id === connectionId);

  if (!result || !connection) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-body-subtle">Connection not found</p>
      </div>
    );
  }

  const { score, synergies, whatMakesYouWork, bestDaysTogether } = result;

  // Arc geometry
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
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header with back button */}
      <motion.div className="mb-4 flex items-center gap-3" variants={fadeInUp}>
        <Link
          href="/demo/compatibility"
          className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          style={{ background: "var(--bg-secondary)" }}
          aria-label="Back to connections"
        >
          <ArrowLeft size={16} strokeWidth={1.5} style={{ color: "var(--text-body-subtle)" }} />
        </Link>
        <div>
          <p className="text-sm text-text-body-subtle">
            Alex & {connection.name}
          </p>
          {(connection.todayAlignment ?? 0) > 0 && (
            <p className="text-[10px] text-text-body-subtle">
              {connection.todayAlignment}% aligned today
            </p>
          )}
        </div>
      </motion.div>

      {/* Today alignment card */}
      <motion.div
        className="mb-4 rounded-2xl px-4 py-3"
        style={{
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-pink) 8%, var(--bg-secondary)), var(--bg-secondary))",
        }}
        variants={fadeInUp}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle">
          Today together
        </p>
        <p className="mt-1 text-[13px] text-text-body">
          {connection.todayInsight}
        </p>
      </motion.div>

      {/* Hero compatibility score */}
      <motion.div
        className="flex flex-col items-center py-2"
        variants={numberEntrance}
        initial="hidden"
        animate="visible"
      >
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`}
              fill="none"
              stroke="var(--border-muted)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={0.5}
            />
          </svg>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-display font-bold leading-none"
              style={{ fontSize: 72, letterSpacing: -2, color: "var(--text-heading)" }}
            >
              <AnimatedNumber value={score} duration={0.8} delay={0.2} />
            </span>
          </div>
        </div>
        <p
          className="mt-1 font-medium uppercase"
          style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-body-subtle)" }}
        >
          Compatibility
        </p>
      </motion.div>

      {/* Synergy breakdown */}
      <motion.div className="mt-4 space-y-2" variants={staggerContainer}>
        <motion.p
          className="font-semibold uppercase"
          style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--text-body-subtle)" }}
          variants={fadeInUp}
        >
          Synergies
        </motion.p>
        {synergies.map((s: { axis: string; score: number; strength: string; description: string }) => (
          <motion.div
            key={s.axis}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{ background: "var(--bg-secondary)" }}
            variants={fadeInUp}
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: axisColors[s.axis] }} />
            <div className="flex-1">
              <span className="text-[13px] font-semibold capitalize text-text-heading">{s.axis}</span>
              <p className="mt-0.5 text-xs text-text-body-subtle">{s.description}</p>
            </div>
            <span className="text-xs font-semibold capitalize" style={{ color: strengthColors[s.strength] }}>
              {s.strength}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* What makes you work */}
      {whatMakesYouWork && (
        <motion.div className="mt-6" variants={fadeInUp}>
          <p className="mb-2 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--text-body-subtle)" }}>
            What makes you work
          </p>
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-pink) 6%, var(--bg-secondary)), var(--bg-secondary))",
              borderLeft: "3px solid var(--accent-pink)",
            }}
          >
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles size={12} strokeWidth={1.5} style={{ color: "var(--accent-pink)" }} />
              <span className="text-[10px] font-semibold uppercase" style={{ letterSpacing: "0.1em", color: "var(--accent-pink)" }}>
                Insight
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-text-body">{whatMakesYouWork}</p>
          </div>
        </motion.div>
      )}

      {/* Best days together */}
      {bestDaysTogether && bestDaysTogether.length > 0 && (
        <motion.div className="mt-6" variants={fadeInUp}>
          <p className="mb-2 font-semibold uppercase" style={{ fontSize: 10, letterSpacing: "0.15em", color: "var(--text-body-subtle)" }}>
            Best days together
          </p>
          <div className="space-y-2">
            {bestDaysTogether.map((day: { date: string; alex: number; partner: number; context?: string }, i: number) => {
              const d = new Date(day.date);
              return (
                <motion.div
                  key={day.date}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3"
                  style={{ background: "color-mix(in srgb, var(--accent-pink) 6%, var(--bg-secondary))" }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                >
                  <div className="flex shrink-0 flex-col items-center rounded-xl px-3 py-2" style={{ background: "color-mix(in srgb, var(--accent-pink) 12%, transparent)" }}>
                    <span className="text-[10px] font-medium uppercase" style={{ color: "var(--text-body-subtle)" }}>
                      {d.toLocaleDateString("en", { month: "short" })}
                    </span>
                    <span className="font-display text-lg font-bold" style={{ color: "var(--accent-pink)" }}>
                      {d.toLocaleDateString("en", { day: "numeric" })}
                    </span>
                  </div>
                  <p className="flex-1 text-xs leading-relaxed text-text-body">{day.context}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Share button */}
      <motion.div className="mt-6" variants={fadeInUp}>
        <Link
          href="/demo/invite/share"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
          style={{ borderColor: "var(--accent-pink)", color: "var(--accent-pink)" }}
        >
          <Share2 size={16} strokeWidth={1.5} />
          Share with {connection.name}
        </Link>
      </motion.div>
    </motion.div>
  );
}
