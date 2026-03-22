"use client";

import { motion } from "motion/react";
import type { TocTocYearData } from "@/types/api";
import { houseConfig, type HouseNumber } from "@/lib/domain-config";
import { SAFE_TOP, SAFE_BOTTOM } from "@/lib/layout-constants";

interface MonthlyViewProps {
  data: TocTocYearData;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Translate mock events into human-readable domain insights
// In production this comes from the API's natalContext + house mapping
const MOCK_MONTHLY_INSIGHT = {
  domain: 10 as HouseNumber, // Career
  title: "Career is activated",
  body: "A momentum period is building around your professional life. Decisions carry more weight this month.",
  action: "Focus on the projects that matter most.",
};

const MOCK_SECONDARY = {
  domain: 4 as HouseNumber, // Home
  title: "Home is shifting",
  body: "Something is moving around your living situation or family roots.",
};

const MOCK_NEXT_PEAK = {
  month: "June",
  domain: 7 as HouseNumber, // Couple
  title: "A relationship window opens",
};

export function MonthlyView({ data }: MonthlyViewProps) {
  const { currentMonth } = data;
  const [y, m] = currentMonth.month.split("-").map(Number);
  const monthName = MONTH_NAMES[m - 1];

  const primary = MOCK_MONTHLY_INSIGHT;
  const primaryHouse = houseConfig[primary.domain];

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-none px-5" style={{ paddingTop: `${SAFE_TOP}px`, paddingBottom: `${SAFE_BOTTOM}px` }}>

      {/* Month header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--accent-purple)", opacity: 0.5 }}>
          {monthName} {y}
        </p>
      </motion.div>

      {/* Primary domain card */}
      <motion.div
        className="mt-5 rounded-2xl p-5"
        style={{
          background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent-purple) 12%, transparent)",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: primaryHouse.color }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: primaryHouse.color }}>
            {primaryHouse.label}
          </span>
        </div>
        <p className="text-base font-bold text-text-heading">{primary.title}</p>
        <p className="mt-2 text-sm text-text-body-subtle leading-relaxed">{primary.body}</p>
        <p className="mt-3 text-xs font-medium" style={{ color: "var(--accent-purple)" }}>
          {primary.action}
        </p>
      </motion.div>

      {/* Secondary signal */}
      <motion.div
        className="mt-3 rounded-2xl p-4"
        style={{
          background: "color-mix(in srgb, var(--accent-purple) 4%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent-purple) 8%, transparent)",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: houseConfig[MOCK_SECONDARY.domain].color }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: houseConfig[MOCK_SECONDARY.domain].color }}>
            {houseConfig[MOCK_SECONDARY.domain].label}
          </span>
        </div>
        <p className="text-sm font-semibold text-text-heading">{MOCK_SECONDARY.title}</p>
        <p className="mt-1 text-xs text-text-body-subtle leading-relaxed">{MOCK_SECONDARY.body}</p>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Next peak */}
      <motion.div
        className="mt-6 mb-2 flex items-center gap-4 rounded-2xl px-5 py-3.5"
        style={{
          background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent-purple) 12%, transparent)",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-widest text-text-body-subtle">Next peak</p>
          <p className="mt-0.5 text-sm font-bold text-text-heading">{MOCK_NEXT_PEAK.month}</p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: houseConfig[MOCK_NEXT_PEAK.domain].color }} />
          <span className="text-xs text-text-body-subtle">{MOCK_NEXT_PEAK.title}</span>
        </div>
      </motion.div>
    </div>
  );
}
