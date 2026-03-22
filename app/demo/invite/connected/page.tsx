"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const CONFETTI_COLORS = [
  "#B07CC2", "#D89EA0", "#6BA89A", "#9585CC", "#50C4D6", "#C4A86B",
];

const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  const dist = 60 + (i % 3) * 30;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 3 + (i % 3),
    delay: i * 0.03,
  };
});

export default function ConnectedPage() {
  const searchParams = useSearchParams();
  const partnerName = searchParams.get("name") ?? "someone";

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6">

      {/* Confetti burst */}
      <div className="relative mb-8">
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: "50%",
              top: "50%",
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
            transition={{ delay: 0.3 + p.delay, duration: 0.8, ease: "easeOut" }}
          />
        ))}

        {/* Success check */}
        <motion.div
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <motion.path
              d="M20 6L9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h1
        className="font-display text-xl font-bold text-text-heading"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Connected with {partnerName}!
      </motion.h1>

      <motion.p
        className="mt-2 max-w-[240px] text-sm text-text-body-subtle leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Your timelines are now linked. See when your momentum periods overlap.
      </motion.p>

      {/* CTA */}
      <motion.div
        className="mt-8 w-full max-w-[240px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Link
          href="/demo/compatibility/conn_jordan"
          className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          See timing windows
        </Link>
      </motion.div>

      <motion.div
        className="mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
      >
        <Link
          href="/demo/compatibility"
          className="text-xs text-text-body-subtle"
        >
          Back to connections
        </Link>
      </motion.div>
    </div>
  );
}
