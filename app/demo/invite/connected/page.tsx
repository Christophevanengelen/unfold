"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { mockCompatibility } from "@/lib/mock-data";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const CONFETTI_COLORS = [
  "var(--accent-purple)",
  "var(--accent-pink)",
  "var(--accent-blue)",
  "var(--accent-green)",
  "var(--accent-orange)",
];

// Pre-computed particle data (avoids SSR/client mismatch entirely)
const PARTICLES = Array.from({ length: 20 }, (_, i) => {
  // Use deterministic values based on golden ratio distribution
  const phi = (1 + Math.sqrt(5)) / 2;
  const t = ((i * phi) % 1);
  const t2 = (((i + 7) * phi) % 1);
  const t3 = (((i + 13) * phi) % 1);
  return {
    x: t * 300 - 150,
    rotation: t2 * 360,
    yMid: -80 - t3 * 60,
    yEnd: 100 + t * 100,
    duration: 1.8 + t2 * 0.8,
    delay: t3 * 0.5,
    w: Math.round((4 + t * 4) * 100) / 100,
    h: Math.round((4 + t2 * 4) * 100) / 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  };
});

// Client-only confetti burst (decorative, no SSR needed)
function ConfettiBurst() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/4"
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
          animate={{
            opacity: [1, 1, 0],
            x: [0, p.x * 0.5, p.x],
            y: [0, p.yMid, p.yEnd],
            rotate: [0, p.rotation],
            scale: [1, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
          style={{ background: p.color }}
        >
          <div
            className="rounded-sm"
            style={{ width: p.w, height: p.h }}
          />
        </motion.div>
      ))}
    </>
  );
}

export default function InviteConnected() {
  const strengthColors: Record<string, string> = {
    strong: "bg-accent-green",
    moderate: "bg-accent-blue",
    developing: "bg-accent-orange",
  };

  return (
    <motion.div
      className="relative flex h-full flex-col overflow-hidden"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Confetti particles (client-only) */}
      <ConfettiBurst />

      {/* Celebration header */}
      <motion.div
        className="relative z-10 mt-8 text-center"
        variants={fadeInUp}
      >
        <motion.div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-soft"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        <h1 className="font-display text-2xl font-bold text-text-heading">
          You&apos;re connected with
          <br />
          {mockCompatibility.partnerName}!
        </h1>
      </motion.div>

      {/* Compatibility score ring */}
      <motion.div
        className="relative z-10 mt-8 flex justify-center"
        variants={fadeInUp}
      >
        <div className="flex flex-col items-center">
          <ScoreRing
            score={mockCompatibility.score}
            size={120}
            strokeWidth={6}
            delay={0.8}
          />
          <p className="mt-2 text-sm font-medium text-text-body">
            Compatibility
          </p>
        </div>
      </motion.div>

      {/* Synergy bars */}
      <motion.div
        className="relative z-10 mt-6 space-y-3 rounded-xl border border-border-light bg-bg-secondary p-4"
        variants={fadeInUp}
      >
        <p className="text-xs font-semibold text-text-heading">Synergy</p>
        {mockCompatibility.synergies.map((synergy) => (
          <div key={synergy.axis} className="flex items-center gap-3">
            <span className="w-12 text-xs capitalize text-text-body-subtle">
              {synergy.axis}
            </span>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-brand-3">
                <motion.div
                  className={`h-2 rounded-full ${strengthColors[synergy.strength] || "bg-brand-6"}`}
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      synergy.strength === "strong"
                        ? "85%"
                        : synergy.strength === "moderate"
                          ? "60%"
                          : "35%",
                  }}
                  transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
            <span className="text-xs capitalize text-text-body-subtle">
              {synergy.strength}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Tomorrow teaser */}
      <motion.p
        className="relative z-10 mt-4 text-center text-sm text-text-body-subtle"
        variants={fadeInUp}
      >
        Tomorrow you&apos;ll see your first day together
      </motion.p>

      {/* CTA */}
      <motion.div className="relative z-10 mt-auto pt-6" variants={fadeInUp}>
        <Link
          href="/demo/compatibility"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
        >
          View Compatibility
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </motion.div>
    </motion.div>
  );
}
