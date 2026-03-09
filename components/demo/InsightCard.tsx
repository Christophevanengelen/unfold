"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

interface InsightCardProps {
  text: string;
}

export function InsightCard({ text }: InsightCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--bg-brand-soft) 40%, var(--bg-primary)), var(--bg-primary))",
      }}
      variants={fadeInUp}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: "var(--accent-purple)" }}
      />

      <div className="flex gap-2.5 px-5 py-4">
        <Sparkles
          size={16}
          strokeWidth={1.5}
          className="mt-0.5 shrink-0 text-accent-purple"
        />
        <div>
          <p
            className="mb-1.5 font-semibold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.15em",
              color: "var(--text-brand)",
            }}
          >
            Insight
          </p>
          <p className="text-sm leading-relaxed text-text-body">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}
