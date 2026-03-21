"use client";

import { motion } from "motion/react";
import type { TocTocYearData } from "@/types/api";

interface MonthlyViewProps {
  data: TocTocYearData;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * MonthlyView — "Ce mois-ci" tab.
 *
 * Ultra-simple. Like a weather app:
 * 1. This month's signal (one boudin, one message)
 * 2. Your next peak (one line)
 * 3. Nothing else.
 */
export function MonthlyView({ data }: MonthlyViewProps) {
  const { currentMonth, peakUpcomingMonths } = data;
  const [y, m] = currentMonth.month.split("-").map(Number);
  const monthName = MONTH_NAMES[m - 1];

  const majorEvents = currentMonth.topEvents.filter(e => e.score >= 3);
  const topEvent = currentMonth.topEvents.sort((a, b) => b.score - a.score)[0];
  const nextPeak = peakUpcomingMonths[0];

  // Boudin color from top event or default purple
  const boudinColor = topEvent?.color ?? "#B07CC2";
  const dots = topEvent ? topEvent.score : 2;

  // Boudin size based on intensity
  const bw = majorEvents.length > 0 ? 44 : 32;
  const bh = majorEvents.length > 0 ? 72 : 52;

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">

      {/* Month name */}
      <motion.p
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
      >
        {monthName} {y}
      </motion.p>

      {/* Boudin */}
      <motion.div
        className="mt-5 relative flex items-center justify-center"
        style={{
          width: bw,
          height: bh,
          borderRadius: bw / 2,
          background: `linear-gradient(135deg, ${boudinColor}, color-mix(in srgb, ${boudinColor} 60%, transparent))`,
          border: `1.5px solid ${boudinColor}`,
          boxShadow: `0 0 30px color-mix(in srgb, ${boudinColor} 30%, transparent)`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className="flex flex-col items-center gap-[3px]">
          {Array.from({ length: dots }).map((_, i) => (
            <div key={i} className="rounded-full"
              style={{ width: 5, height: 5, backgroundColor: "white", opacity: 0.8 }} />
          ))}
        </div>
      </motion.div>

      {/* What's happening */}
      <motion.div
        className="mt-6 max-w-[260px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {topEvent ? (
          <>
            <p className="text-lg font-bold text-text-heading">
              {majorEvents.length > 0
                ? `${majorEvents.length} active signal${majorEvents.length > 1 ? "s" : ""}`
                : "Quiet month"
              }
            </p>
            <p className="mt-2 text-sm text-text-body-subtle leading-relaxed">
              {topEvent.type}
            </p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold text-text-heading">Quiet month</p>
            <p className="mt-2 text-sm text-text-body-subtle">
              No major signals active. A good time to rest and prepare.
            </p>
          </>
        )}
      </motion.div>

      {/* Next peak */}
      {nextPeak && (
        <motion.div
          className="mt-10 rounded-2xl px-6 py-4"
          style={{
            background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent-purple) 12%, transparent)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[9px] font-semibold uppercase tracking-widest text-text-body-subtle">
            Next peak
          </p>
          <p className="mt-1 text-base font-bold text-text-heading">
            {MONTH_NAMES[parseInt(nextPeak.month.split("-")[1]) - 1]}
          </p>
          {nextPeak.topEvents[0] && (
            <p className="mt-0.5 text-xs text-text-body-subtle">
              {nextPeak.topEvents[0].type}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
