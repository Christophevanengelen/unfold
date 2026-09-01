/**
 * PlanetPill — colored dot + planet label in a tinted capsule.
 * Used in matching windows, detail sheets, and signal cards.
 */

import { planetConfig, type PlanetKey } from "@/lib/domain-config";
import { useTheme } from "next-themes";
import { texteLisible } from "@/lib/contraste";
import { useLocale } from "@/lib/use-locale";
import { perso } from "@/lib/perso-i18n";

interface PlanetPillProps {
  /** null quand le moteur nomme un point qu on ne sait pas representer. */
  planet: PlanetKey | null;
  className?: string;
}

export function PlanetPill({ planet, className = "" }: PlanetPillProps) {
  // Les hooks AVANT tout retour anticipe. J avais place ce `return` au-dessus
  // de useTheme, ce qui est la faute meme que j ai corrigee dans
  // lib/premium-gate.ts ce matin : un hook saute selon une condition, et React
  // associe alors l etat d un hook a un autre.
  const { resolvedTheme } = useTheme();
  const locale = useLocale();

  // Rien plutot qu une planete inventee. Avant, un point inconnu — Chiron,
  // l Ascendant, un lot du zodiacal releasing — devenait « Soleil ».
  if (!planet) return null;
  const meta = planetConfig[planet];
  if (!meta) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}
      style={{
        background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
        // Voir lib/contraste.ts : peindre le texte dans la couleur qui teinte
        // son propre fond les fait converger.
        color: texteLisible(meta.color, resolvedTheme === "light" ? "clair" : "sombre"),
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {perso(meta.cleLabel, locale)}
    </span>
  );
}
