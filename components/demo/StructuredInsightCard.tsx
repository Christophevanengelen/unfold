"use client";

import type { StructuredInsight } from "@/types/api";

interface StructuredInsightCardProps {
  insight: StructuredInsight;
  color: string;
}

/**
 * Structured 4-line mini-report — replaces narrative paragraphs.
 * Main read is the 2-second headline, rest is supporting detail.
 *
 * Layout: slight negative margin overlaps the bottom of the trend area.
 * A frosted glow gradient at the top hints at the hidden trend line.
 * Text is NEVER truncated.
 */
export function StructuredInsightCard({
  insight,
  color,
}: StructuredInsightCardProps) {
  return (
    <div className="relative shrink-0 px-4 pb-3" style={{ marginTop: -16 }}>
      {/* Glow gradient — hints at the hidden trend line underneath */}
      <div
        className="pointer-events-none absolute inset-x-4 top-0 h-6 rounded-t-xl"
        style={{
          background: `linear-gradient(to bottom, color-mix(in srgb, ${color} 15%, transparent), transparent)`,
          filter: "blur(6px)",
        }}
      />

      <div
        className="relative rounded-xl px-4 py-3.5"
        style={{
          background: `color-mix(in srgb, ${color} 6%, var(--bg-secondary))`,
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Headline — primary read */}
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: "var(--text-heading)" }}
        >
          {insight.mainRead}
        </p>

        {/* Supporting lines */}
        <div className="mt-2 space-y-1.5">
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            {insight.bestWindow}
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            {insight.suggestedMove}
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-body-subtle)", opacity: 0.7 }}
          >
            {insight.caution}
          </p>
        </div>
      </div>
    </div>
  );
}
