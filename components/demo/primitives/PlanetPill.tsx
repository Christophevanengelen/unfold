/**
 * PlanetPill — colored dot + planet label in a tinted capsule.
 * Used in matching windows, detail sheets, and signal cards.
 */

import { planetConfig, type PlanetKey } from "@/lib/domain-config";

interface PlanetPillProps {
  planet: PlanetKey;
  className?: string;
}

export function PlanetPill({ planet, className = "" }: PlanetPillProps) {
  const meta = planetConfig[planet];
  if (!meta) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}
      style={{
        background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
        color: meta.color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}
