/**
 * TierBadge — PEAK / CLEAR / SUBTLE intensity pill.
 * Used in matching windows and timeline cards.
 */

import { useLocale } from "@/lib/use-locale";
import { perso } from "@/lib/perso-i18n";

interface TierBadgeProps {
  tier: "PEAK" | "CLEAR" | "SUBTLE";
  color: string;
  className?: string;
}

/**
 * La table portait « Fort », « Clair », « Subtil » — du francais en dur, servi
 * aux dix langues, sur la pastille qui dit a quel point une periode compte.
 * Ce sont desormais des CLEFS, lues dans lib/perso-i18n.ts.
 */
const CLES_TIER: Record<string, string> = {
  PEAK: "intensite.fort",
  CLEAR: "intensite.clair",
  SUBTLE: "intensite.subtil",
};

export function TierBadge({ tier, color, className = "" }: TierBadgeProps) {
  const locale = useLocale();
  const cle = CLES_TIER[tier];

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${className}`}
      style={{
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        color,
      }}
    >
      {cle ? perso(cle, locale) : tier}
    </span>
  );
}
