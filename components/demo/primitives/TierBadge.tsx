/**
 * TierBadge — PEAK / CLEAR / SUBTLE intensity pill.
 * Used in matching windows and timeline cards.
 */

interface TierBadgeProps {
  tier: "PEAK" | "CLEAR" | "SUBTLE";
  color: string;
  className?: string;
}

const TIER_LABELS: Record<string, string> = {
  PEAK: "Fort",
  CLEAR: "Clair",
  SUBTLE: "Subtil",
};

export function TierBadge({ tier, color, className = "" }: TierBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${className}`}
      style={{
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      {TIER_LABELS[tier] ?? tier}
    </span>
  );
}
