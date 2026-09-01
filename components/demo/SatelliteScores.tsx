"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { DOMAINS, domainConfig, type DomainKey } from "@/lib/domain-config";
import { Heart, ClipboardCheck, Briefcase } from "flowbite-react-icons/outline";

/**
 * Le nom d icone de la configuration, resolu en composant.
 *
 * Ce fichier commençait par `@ts-nocheck`, et cela cachait un vrai plantage :
 * il appelait `config.icon({ size: 12 })` alors que domainConfig n expose
 * qu un `iconName` — une CHAINE. « config.icon is not a function » des le
 * premier rendu.
 *
 * La suppression de type ne masquait pas une gene de typage : elle masquait un
 * composant qui ne pouvait pas fonctionner. C est pour cela qu on ne desactive
 * pas la verification sur un fichier entier.
 */
const ICONES: Record<string, React.ComponentType<{ size?: number }>> = {
  heart: Heart,
  "clipboard-check": ClipboardCheck,
  briefcase: Briefcase,
};
import { formatDelta, getDeltaColor } from "@/lib/animations";

interface SatelliteScoresProps {
  love: number;
  health: number;
  work: number;
  deltas: { love: number; health: number; work: number };
  isActive: boolean;
}

/**
 * Three mini score indicators for the Overall page.
 * Display-only — users swipe to domain cards for details.
 * Uses centralized domain config — icons, colors, labels from one source.
 */
export function SatelliteScores({ love, health, work, deltas, isActive }: SatelliteScoresProps) {
  const values: Record<DomainKey, number> = { love, health, work };

  return (
    <div className="flex items-center justify-center gap-10">
      {DOMAINS.map((key) => {
        const config = domainConfig[key];
        const delta = deltas[key];

        return (
          <div
            key={key}
            className="flex flex-col items-center gap-1"
          >
            {/* Score number — thin weight */}
            <span
              className="font-display text-xl"
              style={{ color: "var(--accent-purple)", fontWeight: 300 }}
            >
              <AnimatedNumber value={values[key]} duration={1.4} delay={0.7} isActive={isActive} />
            </span>

            {/* Delta indicator */}
            <span
              className={`text-[10px] font-semibold ${getDeltaColor(delta)}`}
              style={{ minHeight: 14 }}
            >
              {formatDelta(delta)}
            </span>

            {/* Label with icon */}
            <div
              className="inline-flex items-center justify-center gap-1"
              style={{ color: config.color }}
            >
              <span className="flex shrink-0 items-center" style={{ height: 12 }}>
                {(() => {
                  const Icone = ICONES[config.iconName];
                  return Icone ? <Icone size={12} /> : null;
                })()}
              </span>
              <span
                className="font-medium leading-none"
                style={{ fontSize: 9, letterSpacing: "0.12em" }}
              >
                {config.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
