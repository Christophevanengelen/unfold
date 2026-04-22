"use client";

interface TierPulseProps {
  color: string;
  size?: number;
}

/**
 * Breathing dot — surfaces active PEAK windows in the list.
 * Style = Apple Find My "nearby" indicator: inner dot + expanding ping ring.
 */
export function TierPulse({ color, size = 8 }: TierPulseProps) {
  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{ background: color, opacity: 0.4 }}
      />
      <span
        className="relative inline-block rounded-full"
        style={{ width: size, height: size, background: color }}
      />
    </span>
  );
}
