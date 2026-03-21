/**
 * Human-friendly labels for API events.
 * Maps planet + aspect + natal point patterns to titles/descriptions.
 */

import type { DomainKey, PlanetKey } from "@/lib/domain-config";

// ─── Planet name → PlanetKey mapping ────────────────────────

const PLANET_MAP: Record<string, PlanetKey> = {
  Sun: "sun",
  Moon: "moon",
  Mercury: "mercury",
  Venus: "venus",
  Mars: "mars",
  Jupiter: "jupiter",
  Saturn: "saturn",
  Uranus: "uranus",
  Neptune: "neptune",
  Pluto: "neptune", // closest PlanetKey — no "pluto" in our design system
  "North Node": "sun", // karmic, solar-like
  "South Node": "moon", // karmic, lunar-like
  eclipse: "solar-eclipse",
};

/** Extract PlanetKey from an API event label like "Jupiter conjunction natal Sun" */
export function extractPlanet(label: string): PlanetKey {
  // Try transit planet (first word or known planet name)
  for (const [name, key] of Object.entries(PLANET_MAP)) {
    if (label.startsWith(name)) return key;
  }
  // ZR labels: "ZR L2 — Leo (fortune)"
  if (label.includes("ZR")) return "jupiter"; // ZR is Jupiter-based technique
  // Eclipse
  if (label.toLowerCase().includes("eclipse")) return "solar-eclipse";
  // Fallback
  return "mercury";
}

/** Extract natal point from label for domain mapping */
export function extractNatalPoint(label: string): string | null {
  const match = label.match(/natal\s+(\w+)/);
  return match ? match[1] : null;
}

// ─── Domain mapping ─────────────────────────────────────────

const NATAL_DOMAIN: Record<string, DomainKey> = {
  Sun: "health",
  Moon: "love",
  Mercury: "work",
  Venus: "love",
  Mars: "health",
  Jupiter: "work",
  Saturn: "work",
  Ascendant: "health",
  MC: "work",
};

const LOT_DOMAIN: Record<string, DomainKey> = {
  fortune: "work",
  spirit: "work",
  eros: "love",
  victory: "work",
  necessity: "health",
  courage: "health",
};

export function inferDomain(
  category: string,
  label: string,
  lotType?: string
): DomainKey {
  // ZR events — use lot type
  if (category === "zr" && lotType) {
    const lt = Array.isArray(lotType) ? lotType[0] : lotType;
    return LOT_DOMAIN[lt] || "work";
  }
  // Transit/station — use natal point
  const natal = extractNatalPoint(label);
  if (natal && NATAL_DOMAIN[natal]) return NATAL_DOMAIN[natal];
  // Eclipse — default to love (axis of renewal)
  if (category === "eclipse") return "love";
  // Fallback
  return "work";
}

// ─── Score → Intensity mapping ──────────────────────────────

/** Convert API score (1-4) to intensity (0-100) for tier calculation.
 *  Score 1 (toc)           → intensity <70  → tier TOC (left lane, thin)
 *  Score 2 (toc toc)       → intensity 70-84 → tier TOCTOC (center lane, medium)
 *  Score 3 (toc toc toc)   → intensity 85-92 → tier TOCTOCTOC (right lane, large)
 *  Score 4 (toc toc toc toc) → intensity 93-98 → tier TOCTOCTOC (right lane, large)
 */
export function scoreToIntensity(
  score: number,
  cyclePasses?: number
): number {
  const ranges: Record<number, [number, number]> = {
    1: [45, 65],     // TOC — subtle
    2: [70, 82],     // TOCTOC — clear
    3: [85, 92],     // TOCTOCTOC — peak
    4: [93, 98],     // TOCTOCTOC — exceptional peak
  };
  const [min, max] = ranges[Math.abs(score)] || [50, 60];
  // Multi-pass transits are more intense within their band
  const passBoost = cyclePasses && cyclePasses >= 3 ? 0.8 : cyclePasses === 2 ? 0.5 : 0;
  return Math.min(100, Math.round(min + (max - min) * (0.5 + passBoost * 0.5)));
}

// ─── Title/description generation ───────────────────────────

interface EventMeta {
  title: string;
  subtitle: string;
  description: string;
  keyInsight?: string;
}

const TRANSIT_LABELS: Record<string, Record<string, Partial<EventMeta>>> = {
  Pluto: {
    conjunction: { title: "Deep Transformation", subtitle: "Identity reshapes", description: "Pluto brings permanent change — what no longer serves you falls away." },
    opposition: { title: "Power Confrontation", subtitle: "External pressure builds", description: "Forces outside your control demand adaptation." },
    square: { title: "Structural Tension", subtitle: "Old foundations crack", description: "Resistance signals where growth is overdue." },
    trine: { title: "Quiet Power", subtitle: "Depth flows naturally", description: "Transformation happens easily — lean into it." },
  },
  Neptune: {
    conjunction: { title: "Vision Opens", subtitle: "Boundaries dissolve", description: "Neptune dissolves certainty and opens intuition." },
    opposition: { title: "Reality Check", subtitle: "Illusions confronted", description: "What you assumed may not be what it seems." },
    square: { title: "Creative Fog", subtitle: "Clarity requires patience", description: "Confusion is temporary — don't force decisions." },
    trine: { title: "Inspired Flow", subtitle: "Creativity heightened", description: "A natural channel opens for creative or spiritual work." },
  },
  Uranus: {
    conjunction: { title: "Breakthrough", subtitle: "The unexpected arrives", description: "Uranus shatters routines — liberation comes through disruption." },
    opposition: { title: "Freedom Call", subtitle: "Something must change", description: "External events push you toward authenticity." },
    square: { title: "Electric Tension", subtitle: "Restlessness builds", description: "The pressure to change is real — channel it." },
    trine: { title: "Effortless Innovation", subtitle: "New ideas land smoothly", description: "Change comes naturally — experiment freely." },
  },
  Saturn: {
    conjunction: { title: "New Foundation", subtitle: "Structure builds", description: "Saturn rewards discipline — commit to what matters." },
    opposition: { title: "Accountability", subtitle: "Results are tested", description: "What you've built is now evaluated by reality." },
    square: { title: "Growing Pains", subtitle: "Effort required", description: "Obstacles reveal where more work is needed." },
    trine: { title: "Steady Progress", subtitle: "Discipline pays off", description: "Hard work flows — rewards are earned and real." },
  },
  Jupiter: {
    conjunction: { title: "Expansion Window", subtitle: "Amplified clarity", description: "Jupiter expands whatever it touches — opportunities multiply." },
    opposition: { title: "Overreach Check", subtitle: "Balance needed", description: "Growth is possible but moderation is key." },
    square: { title: "Growth Tension", subtitle: "Ambition vs reality", description: "Push forward but stay grounded." },
    trine: { title: "Lucky Break", subtitle: "Flow and fortune align", description: "Things fall into place — act on opportunities." },
  },
};

const ZR_LABELS: Record<string, Partial<EventMeta>> = {
  fortune: { title: "Fortune Peak", subtitle: "Circumstances shift", description: "A peak period for material circumstances — timing favors action." },
  spirit: { title: "Purpose Surge", subtitle: "Calling intensifies", description: "Your sense of direction sharpens — follow what resonates." },
  eros: { title: "Desire Wave", subtitle: "Connection deepens", description: "Attraction and desire are heightened — relationships activate." },
};

export function getEventMeta(
  category: string,
  label: string,
  aspect?: string,
  lotType?: string,
  level?: number
): EventMeta {
  // ZR events
  if (category === "zr") {
    const lt = Array.isArray(lotType) ? lotType[0] : lotType || "fortune";
    const base = ZR_LABELS[lt] || ZR_LABELS.fortune;
    const lvl = level === 2 ? "Major" : "Active";
    return {
      title: base.title || "Momentum Shift",
      subtitle: `${lvl} ${base.subtitle || "period"}`,
      description: base.description || "A significant timing window is open.",
      keyInsight: level === 2 ? "This is a rare, high-impact period." : undefined,
    };
  }

  // Eclipse events
  if (category === "eclipse") {
    const isSolar = label.toLowerCase().includes("solar");
    return {
      title: isSolar ? "Solar Eclipse" : "Lunar Eclipse",
      subtitle: isSolar ? "New chapter opens" : "Emotional release",
      description: isSolar
        ? "Eclipses mark turning points — seeds planted now grow for 6 months."
        : "What's been building emotionally comes to a head.",
    };
  }

  // Station events
  if (category === "station") {
    const planet = extractPlanet(label);
    const isDirect = label.includes(" SD ");
    return {
      title: isDirect ? "Station Direct" : "Station Retrograde",
      subtitle: `${planet} pauses and shifts`,
      description: isDirect
        ? "Forward momentum resumes — clarity returns."
        : "A period of review and recalibration begins.",
    };
  }

  // Transit events — look up by planet + aspect
  for (const [planetName, aspects] of Object.entries(TRANSIT_LABELS)) {
    if (label.includes(planetName)) {
      const asp = aspect || "conjunction";
      const meta = aspects[asp];
      if (meta) {
        return {
          title: meta.title || "Transit Active",
          subtitle: meta.subtitle || "Signal detected",
          description: meta.description || "A planetary signal is active in your chart.",
        };
      }
    }
  }

  // Fallback
  return {
    title: "Signal Active",
    subtitle: "Momentum shift detected",
    description: "A planetary configuration is influencing this period.",
  };
}
