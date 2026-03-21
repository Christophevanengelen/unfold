"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { mockCompatibility, mockToday, mockUser } from "@/lib/mock-data";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function InviteWaiting() {
  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="font-display text-2xl font-bold text-text-heading">
          Invite sent
        </h1>
        <p className="mt-1 text-sm text-text-body-subtle">
          Waiting for {mockCompatibility.partnerName} to join
        </p>
      </motion.div>

      {/* Your today's score (still works solo) */}
      <motion.div
        className="mt-6 flex items-center gap-4 rounded-xl border border-border-light bg-bg-secondary p-4"
        variants={fadeInUp}
      >
        <ScoreRing
          score={mockToday.overall}
          size={56}
          strokeWidth={3}
          delay={0.3}
        />
        <div>
          <p className="text-sm font-semibold text-text-heading">
            Your momentum today
          </p>
          <p className="text-xs text-text-body-subtle">
            Score: {mockToday.overall} &middot; Keep building your data
          </p>
        </div>
      </motion.div>

      {/* Partner waiting card */}
      <motion.div
        className="mt-4 rounded-2xl border-2 border-dashed border-border-base bg-bg-secondary/50 p-5"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-3">
          {/* Pulsing avatar placeholder */}
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-4">
              <span className="font-display text-lg font-bold text-text-body-subtle">
                {mockCompatibility.partnerName.charAt(0)}
              </span>
            </div>
            <motion.div
              className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg-secondary bg-accent-orange"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-heading">
              {mockCompatibility.partnerName}&apos;s invite is pending
            </p>
            <p className="text-xs text-text-body-subtle">
              Sent just now
            </p>
          </div>
        </div>

        {/* Remind button */}
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border-base bg-bg-primary py-2.5 text-xs font-medium text-text-body transition-colors hover:bg-bg-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
          </svg>
          Remind {mockCompatibility.partnerName}
        </button>
      </motion.div>

      {/* Blurred compatibility preview */}
      <motion.div
        className="relative mt-4 overflow-hidden rounded-2xl border border-border-light bg-bg-secondary p-4"
        variants={fadeInUp}
      >
        <div className="absolute inset-0 z-10 backdrop-blur-[6px]" />
        <div className="text-center opacity-60">
          <p className="font-display text-3xl font-bold text-accent-purple">
            {mockCompatibility.score}%
          </p>
          <p className="mt-1 text-xs text-text-body-subtle">Compatibility</p>
          <div className="mt-3 flex justify-center gap-3">
            {mockCompatibility.synergies.map((s: { axis: string; score: number; strength: string }) => (
              <div key={s.axis} className="h-1.5 w-14 rounded-full bg-brand-4" />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.p
        className="mt-3 text-center text-xs text-text-body-subtle"
        variants={fadeInUp}
      >
        Meanwhile, your own momentum data is building...
      </motion.p>

      {/* Navigation */}
      <motion.div className="mt-auto space-y-3 pt-4" variants={fadeInUp}>
        <Link
          href="/demo/invite/connected"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
        >
          Preview: Connected
        </Link>
        <Link
          href="/demo"
          className="flex w-full items-center justify-center rounded-full py-3 text-sm font-medium text-text-body-subtle transition-colors hover:text-text-body"
        >
          Back to Today
        </Link>
      </motion.div>
    </motion.div>
  );
}
