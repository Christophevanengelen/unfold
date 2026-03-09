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
 * Layout: trend curve is absolutely positioned behind this card.
 * Glass effect (semi-transparent bg + backdrop-filter) lets the trend show through.
 * Text is NEVER truncated.
 */
export function StructuredInsightCard({
  insight,
  color,
}: StructuredInsightCardProps) {
  return (
    <div className="relative shrink-0 px-4 pb-3">
      {/* Frosted card — semi-transparent top lets the trend line show through blurred */}
      <div
        className="relative overflow-hidden rounded-xl px-4 py-3.5"
        style={{
          background: `linear-gradient(to bottom, color-mix(in srgb, ${color} 10%, rgba(34, 28, 63, 0.25)) 0%, color-mix(in srgb, ${color} 5%, rgba(34, 28, 63, 0.5)) 50%, color-mix(in srgb, ${color} 3%, rgba(34, 28, 63, 0.7)) 100%)`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
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
