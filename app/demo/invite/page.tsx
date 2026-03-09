"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { mockCompatibility } from "@/lib/mock-data";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function InvitePrompt() {
  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Blurred compatibility preview */}
      <motion.div
        className="relative mt-4 overflow-hidden rounded-2xl border border-border-light bg-bg-secondary p-6"
        variants={fadeInUp}
      >
        {/* Blur overlay */}
        <div className="absolute inset-0 z-10 backdrop-blur-sm" />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full bg-bg-brand/90 px-4 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5 -mt-0.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-xs font-semibold text-text-on-brand">Invite to unlock</span>
          </div>
        </div>

        {/* Mock compatibility content (blurred) */}
        <div className="text-center">
          <p className="text-xs text-text-body-subtle">Compatibility</p>
          <p className="mt-2 font-display text-5xl font-bold text-accent-purple">
            {mockCompatibility.score}%
          </p>
          <p className="mt-1 text-sm text-text-body">
            with {mockCompatibility.partnerName}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            {mockCompatibility.synergies.map((s) => (
              <div key={s.axis} className="text-center">
                <div className="h-2 w-16 rounded-full bg-brand-4" />
                <p className="mt-1 text-xs capitalize text-text-body-subtle">{s.axis}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div className="mt-8 text-center" variants={fadeInUp}>
        <h1 className="font-display text-2xl font-bold leading-tight text-text-heading">
          See how your
          <br />
          rhythms align
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-body">
          Invite someone you care about. Discover when your days sync.
        </p>
      </motion.div>

      {/* Benefits */}
      <motion.div className="mt-6 space-y-2" variants={fadeInUp}>
        {[
          "See your compatibility score",
          "Discover shared peak moments",
          "Understand your rhythms together",
        ].map((benefit, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-soft">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm text-text-body">{benefit}</p>
          </div>
        ))}
      </motion.div>

      {/* CTAs */}
      <motion.div className="mt-auto space-y-3 pt-6" variants={fadeInUp}>
        <Link
          href="/demo/invite/share"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
        >
          Send Invite
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </Link>
        <Link
          href="/demo"
          className="flex w-full items-center justify-center rounded-full py-3 text-sm font-medium text-text-body-subtle transition-colors hover:text-text-body"
        >
          Skip for now
        </Link>
      </motion.div>
    </motion.div>
  );
}
