"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { mockUser } from "@/lib/mock-data";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const shareButtons = [
  {
    label: "Message",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: "bg-accent-green text-white",
  },
  {
    label: "WhatsApp",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
    color: "bg-accent-green text-white",
  },
  {
    label: "Email",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    color: "bg-accent-blue text-white",
  },
  {
    label: "Copy Link",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    color: "bg-brand-8 text-white",
  },
];

export default function InviteShare() {
  const [copied, setCopied] = useState(false);

  const inviteMessage = `I use Unfold to see my timing signals. Compare our timelines: unfold.app/invite/${mockUser.inviteCode}`;

  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <Link href="/demo/compatibility" className="flex items-center gap-1 text-sm text-text-body-subtle hover:text-text-body">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </Link>
        <h1 className="mt-4 font-display text-2xl font-bold text-text-heading">
          Share your code
        </h1>
        <p className="mt-1 text-sm text-text-body-subtle">
          Send this to anyone you want to compare timelines with.
        </p>
      </motion.div>

      {/* Big code display */}
      <motion.div
        className="mt-8 rounded-2xl py-6 text-center"
        style={{
          background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)",
        }}
        variants={fadeInUp}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle">Your code</p>
        <p className="mt-2 font-mono text-2xl font-bold tracking-[0.15em]" style={{ color: "var(--accent-purple)" }}>
          {mockUser.inviteCode}
        </p>
      </motion.div>

      {/* Message preview */}
      <motion.div
        className="mt-4 rounded-2xl px-4 py-3"
        style={{ background: "var(--bg-secondary)" }}
        variants={fadeInUp}
      >
        <p className="text-xs text-text-body-subtle leading-relaxed">
          {inviteMessage}
        </p>
      </motion.div>

      {/* Share buttons */}
      <motion.div className="mt-5 grid grid-cols-2 gap-3" variants={fadeInUp}>
        {shareButtons.map((btn) => (
          <motion.button
            key={btn.label}
            className={`flex items-center justify-center gap-2 rounded-xl ${btn.color} px-4 py-3 text-sm font-medium shadow-sm transition-transform active:scale-95`}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (btn.label === "Copy Link") {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
          >
            {btn.icon}
            {btn.label === "Copy Link" && copied ? "Copied!" : btn.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Back to connections */}
      <motion.div className="mt-auto pt-6" variants={fadeInUp}>
        <Link
          href="/demo/compatibility"
          className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition-transform active:scale-95"
          style={{ border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)", color: "var(--accent-purple)" }}
        >
          Back to connections
        </Link>
      </motion.div>
    </motion.div>
  );
}
