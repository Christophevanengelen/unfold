// @ts-nocheck
"use client";

import type { StructuredInsight } from "@/types/api";

interface StructuredInsightCardProps {
  insight: StructuredInsight;
  color: string;
}

/**
 * Structured 4-line mini-report — centered text, no box.
 * Main read is the 2-second headline, rest is supporting detail.
 * Text is NEVER truncated.
 */
export function StructuredInsightCard({
  insight,
  color,
}: StructuredInsightCardProps) {
  return (
    <div className="shrink-0 px-5 pb-2 text-center">
      {/* Headline — primary read */}
      <p
        className="text-sm font-semibold leading-tight"
        style={{ color: "var(--accent-purple)" }}
      >
        {insight.mainRead}
      </p>

      {/* Supporting lines */}
      <div className="mt-1.5 space-y-0.5">
        <p
          className="text-xs leading-snug"
          style={{ color: "var(--accent-purple)", opacity: 0.65 }}
        >
          {insight.bestWindow}
        </p>
        <p
          className="text-xs leading-snug"
          style={{ color: "var(--accent-purple)", opacity: 0.65 }}
        >
          {insight.suggestedMove}
        </p>
      </div>
    </div>
  );
}
