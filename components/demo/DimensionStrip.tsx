"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Sparkline } from "@/components/ui/Sparkline";
import { formatDelta, getDeltaColor, fadeInUp, staggerFast } from "@/lib/animations";
import { ChevronRight } from "flowbite-react-icons/outline";
import { DOMAINS, domainConfig, type DomainKey } from "@/lib/domain-config";
import type { DailyMomentum } from "@/types/api";

interface DimensionStripProps {
  scores: DailyMomentum["scores"];
  deltas: { love: number; health: number; work: number };
  trendData: { love: number[]; health: number[]; work: number[] };
  onAxisTap?: (axis: DomainKey) => void;
}

export function DimensionStrip({
  scores,
  deltas,
  trendData,
  onAxisTap,
}: DimensionStripProps) {
  const [tappedAxis, setTappedAxis] = useState<string | null>(null);

  function handleTap(axis: DomainKey) {
    if (onAxisTap) {
      onAxisTap(axis);
    } else {
      setTappedAxis(axis);
      setTimeout(() => setTappedAxis(null), 2000);
    }
  }

  return (
    <motion.div
      className="space-y-4"
      variants={staggerFast}
      initial="hidden"
      animate="visible"
    >
      {DOMAINS.map((key, i) => {
        const config = domainConfig[key];
        const score = scores[key];
        const delta = deltas[key];
        const deltaColor = getDeltaColor(delta);

        return (
          <div key={key} className="relative">
            <motion.button
              className="flex w-full items-center gap-3 rounded-xl px-1 py-1 transition-colors active:scale-[0.98] active:bg-bg-secondary"
              variants={fadeInUp}
              onClick={() => handleTap(key)}
              type="button"
            >
              {/* Color dot + name */}
              <div className="flex items-center gap-2 w-[72px] shrink-0">
                <span
                  className={`h-2 w-2 rounded-full ${config.dotClass}`}
                />
                <span className="text-[13px] font-semibold text-text-heading">
                  {config.label.charAt(0) + config.label.slice(1).toLowerCase()}
                </span>
              </div>

              {/* Score */}
              <span
                className="font-display text-2xl font-bold text-text-heading"
                style={{ letterSpacing: -1, minWidth: 32 }}
              >
                <AnimatedNumber value={score.value} duration={0.6} delay={0.3 + i * 0.1} />
              </span>

              {/* Delta */}
              <span className={`text-xs font-medium ${deltaColor}`} style={{ minWidth: 28 }}>
                {formatDelta(delta)}
              </span>

              {/* Sparkline (fills remaining space) */}
              <div className="ml-auto flex items-center gap-1.5">
                <Sparkline
                  data={trendData[key]}
                  width={56}
                  height={18}
                  color={config.color}
                  delay={0.6 + i * 0.1}
                />
                <ChevronRight
                  className="h-3.5 w-3.5 text-text-body-subtle"
                />
              </div>
            </motion.button>

            {/* Coming soon tooltip */}
            <AnimatePresence>
              {tappedAxis === key && (
                <motion.div
                  className="absolute right-0 -top-8 z-10 rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: "var(--bg-brand)",
                    color: "var(--text-on-brand)",
                  }}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  Coming soon
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </motion.div>
  );
}
