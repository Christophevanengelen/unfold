"use client";

import type { RelationshipType } from "@/lib/connections-store";
import { relationshipConfig } from "./relationshipConfig";

interface RelationshipAvatarProps {
  initial: string;
  relationship: RelationshipType;
  /** Ring color = tier color when active/upcoming. Transparent = no ring (calm). */
  ringColor?: string;
  size?: number;
  /** If true, the ring pulses (reserved for active PEAK tier). */
  pulse?: boolean;
}

/**
 * Avatar shared across the compat list + detail strip.
 * Visual: initial on a relationship-tinted disc, with an optional 2px tier-colored ring.
 * The ring acts as the primary signal: pink=PEAK, green=CLEAR, purple=SUBTLE, none=CALM.
 */
export function RelationshipAvatar({
  initial,
  relationship,
  ringColor,
  size = 40,
  pulse,
}: RelationshipAvatarProps) {
  const rel = relationshipConfig[relationship];
  const hasRing = ringColor && ringColor !== "transparent";
  const ringW = 2;
  // When ring is visible, inner disc shrinks so total footprint = `size`.
  const innerSize = hasRing ? size - ringW * 2 : size;

  return (
    <span
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {hasRing && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 0 ${ringW}px ${ringColor}`,
            opacity: 0.9,
          }}
        />
      )}
      {pulse && hasRing && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full animate-ping"
          style={{
            boxShadow: `0 0 0 ${ringW}px ${ringColor}`,
            opacity: 0.35,
          }}
        />
      )}
      <span
        className="inline-flex items-center justify-center rounded-full font-display font-bold text-white"
        style={{
          width: innerSize,
          height: innerSize,
          backgroundColor: rel.color,
          fontSize: Math.max(10, Math.round(innerSize * 0.38)),
        }}
      >
        {initial}
      </span>
    </span>
  );
}
