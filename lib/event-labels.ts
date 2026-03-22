/**
 * Human-friendly labels for API events.
 * Maps planet + aspect + natal point patterns to titles/descriptions.
 */

import { planetConfig, type DomainKey, type PlanetKey } from "@/lib/domain-config";

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
    conjunction: { title: "Transformation profonde", subtitle: "Ce qui ne vous sert plus s'efface", description: "Pluton provoque un changement irréversible. Quelque chose se termine pour que du nouveau puisse émerger." },
    opposition: { title: "Confrontation de pouvoir", subtitle: "La pression extérieure monte", description: "Des forces hors de votre contrôle exigent une adaptation. Ce qui résiste doit évoluer." },
    square: { title: "Tension structurelle", subtitle: "Les anciennes fondations craquent", description: "La résistance signale où la croissance est en retard. Le changement est nécessaire, même s'il est difficile." },
    trine: { title: "Puissance tranquille", subtitle: "La profondeur coule naturellement", description: "La transformation se fait en douceur. Appuyez-vous dessus sans forcer." },
  },
  Neptune: {
    conjunction: { title: "Vision élargie", subtitle: "Les frontières se dissolvent", description: "Neptune dissout les certitudes et ouvre l'intuition. Confusion et inspiration coexistent." },
    opposition: { title: "Retour au réel", subtitle: "Les illusions sont confrontées", description: "Ce que vous teniez pour acquis pourrait ne pas être ce qu'il semble. Clarifiez." },
    square: { title: "Brouillard créatif", subtitle: "La clarté demande de la patience", description: "La confusion est temporaire. Ne forcez pas les décisions pendant cette période." },
    trine: { title: "Flux d'inspiration", subtitle: "La créativité est amplifiée", description: "Un canal naturel s'ouvre pour le travail créatif ou spirituel. Laissez-vous porter." },
  },
  Uranus: {
    conjunction: { title: "Rupture libératrice", subtitle: "L'inattendu arrive", description: "Uranus brise les routines. La libération passe par la disruption — accueillez la surprise." },
    opposition: { title: "Appel à la liberté", subtitle: "Quelque chose doit changer", description: "Des événements extérieurs vous poussent vers plus d'authenticité. Écoutez l'impulsion." },
    square: { title: "Tension électrique", subtitle: "L'agitation monte", description: "La pression de changer est réelle. Canalisez cette énergie au lieu de la subir." },
    trine: { title: "Innovation fluide", subtitle: "Les nouvelles idées se posent en douceur", description: "Le changement vient naturellement. Expérimentez librement." },
  },
  Saturn: {
    conjunction: { title: "Nouvelles fondations", subtitle: "La structure se construit", description: "Saturne récompense la discipline. Engagez-vous sur ce qui compte vraiment." },
    opposition: { title: "Heure des comptes", subtitle: "Les résultats sont testés", description: "Ce que vous avez construit est maintenant évalué par la réalité. Tenez bon." },
    square: { title: "Croissance exigeante", subtitle: "L'effort est requis", description: "Les obstacles révèlent où il reste du travail. La difficulté est le chemin." },
    trine: { title: "Progrès régulier", subtitle: "La discipline paie", description: "Le travail de fond porte ses fruits. Les récompenses sont méritées et durables." },
  },
  Jupiter: {
    conjunction: { title: "Fenêtre d'expansion", subtitle: "Les possibilités se multiplient", description: "Jupiter amplifie tout ce qu'il touche. Les opportunités s'ouvrent — saisissez-les." },
    opposition: { title: "Besoin d'équilibre", subtitle: "L'excès guette", description: "La croissance est possible mais la modération est clé. Ne vous dispersez pas." },
    square: { title: "Tension de croissance", subtitle: "Ambition contre réalité", description: "Poussez en avant mais restez ancré. L'impatience peut coûter cher." },
    trine: { title: "Alignement favorable", subtitle: "Le flux est avec vous", description: "Les choses se mettent en place naturellement. Agissez sur les opportunités qui se présentent." },
  },
};

const ZR_LABELS: Record<string, Partial<EventMeta>> = {
  fortune: { title: "Pic de circonstances", subtitle: "Le timing favorise l'action", description: "Une période de pic pour vos circonstances matérielles et votre vie quotidienne." },
  spirit: { title: "Pic de vocation", subtitle: "Votre direction se clarifie", description: "Votre sens du but s'aiguise. Suivez ce qui résonne avec votre mission." },
  eros: { title: "Pic de désir", subtitle: "L'attraction s'intensifie", description: "Le désir et l'attraction sont amplifiés. Les relations s'activent." },
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
    const lvl = level === 2 ? "Période majeure" : "Période active";
    return {
      title: base.title || "Changement de rythme",
      subtitle: `${lvl}`,
      description: base.description || "Une fenêtre de timing significative est ouverte.",
      keyInsight: level === 2 ? "C'est une période rare et à fort impact." : undefined,
    };
  }

  // Eclipse events
  if (category === "eclipse") {
    const isSolar = label.toLowerCase().includes("solar");
    return {
      title: isSolar ? "Éclipse solaire" : "Éclipse lunaire",
      subtitle: isSolar ? "Un nouveau chapitre s'ouvre" : "Libération émotionnelle",
      description: isSolar
        ? "Les éclipses marquent des tournants. Ce qui est semé maintenant grandit pendant 6 mois."
        : "Ce qui couvait émotionnellement arrive à son point culminant.",
    };
  }

  // Station events
  if (category === "station") {
    const planet = extractPlanet(label);
    const isDirect = label.includes(" SD ");
    return {
      title: isDirect ? "Station directe" : "Station rétrograde",
      subtitle: `${planetConfig[planet]?.label || planet} marque une pause`,
      description: isDirect
        ? "L'élan reprend. La clarté revient après une période de révision."
        : "Une période de révision et de recalibration commence. Ralentissez.",
    };
  }

  // Transit events — look up by planet + aspect
  for (const [planetName, aspects] of Object.entries(TRANSIT_LABELS)) {
    if (label.includes(planetName)) {
      const asp = aspect || "conjunction";
      const meta = aspects[asp];
      if (meta) {
        return {
          title: meta.title || "Transit actif",
          subtitle: meta.subtitle || "Signal détecté",
          description: meta.description || "Un signal planétaire est actif dans votre thème.",
        };
      }
    }
  }

  // Fallback
  return {
    title: "Signal actif",
    subtitle: "Changement de rythme détecté",
    description: "Une configuration planétaire influence cette période.",
  };
}
