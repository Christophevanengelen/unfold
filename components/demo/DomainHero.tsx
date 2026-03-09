"use client";

import { DomainHeroLove } from "./DomainHeroLove";
import { DomainHeroHealth } from "./DomainHeroHealth";
import { DomainHeroWork } from "./DomainHeroWork";

type DomainKey = "love" | "health" | "work";

interface DomainHeroProps {
  domain: DomainKey;
  score: number;
  peakHour: number;
  isActive: boolean;
}

/**
 * Router component — renders the correct domain hero
 * based on the `domain` prop.
 */
export function DomainHero({ domain, score, peakHour, isActive }: DomainHeroProps) {
  switch (domain) {
    case "love":
      return <DomainHeroLove score={score} isActive={isActive} />;
    case "health":
      return <DomainHeroHealth score={score} isActive={isActive} />;
    case "work":
      return <DomainHeroWork score={score} peakHour={peakHour} isActive={isActive} />;
    default:
      return null;
  }
}
