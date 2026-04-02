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
  Pluto: "pluto",
  "North Node": "north-node",
  "South Node": "south-node",
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
    conjunction: { title: "Transformation profonde", subtitle: "Ce qui ne vous sert plus s'efface", description: "Un changement de fond est en cours. Ce qui a fait son temps se retire pour laisser place à quelque chose de plus juste." },
    opposition: { title: "Confrontation nécessaire", subtitle: "La pression extérieure vous fait grandir", description: "Des forces extérieures exigent une adaptation. Ce qui résiste en vous demande à être vu et ajusté." },
    square: { title: "Tension structurelle", subtitle: "Les anciennes fondations craquent", description: "Vous sentez une résistance. Elle pointe exactement là où un changement est en retard. La difficulté est le signal." },
    trine: { title: "Puissance tranquille", subtitle: "La profondeur coule naturellement", description: "Un changement profond se fait en douceur. Pas besoin de forcer — suivez le mouvement." },
  },
  Neptune: {
    conjunction: { title: "Vision élargie", subtitle: "Les frontières se dissolvent", description: "Vos certitudes bougent et c'est normal. L'intuition prend le relais de la logique. Faites confiance à ce que vous ressentez." },
    opposition: { title: "Retour au réel", subtitle: "Les illusions sont confrontées", description: "Ce que vous teniez pour acquis mérite d'être questionné. La clarté reviendra — laissez-lui le temps." },
    square: { title: "Brouillard créatif", subtitle: "La clarté demande de la patience", description: "Tout semble flou en ce moment. Ne forcez aucune décision importante. La patience est votre meilleur atout." },
    trine: { title: "Flux d'inspiration", subtitle: "La créativité est amplifiée", description: "Un canal naturel s'ouvre pour la création, l'intuition, la rêverie. Laissez-vous porter." },
  },
  Uranus: {
    conjunction: { title: "Rupture libératrice", subtitle: "L'inattendu arrive", description: "Ce qui semblait stable bouge. C'est libérateur, même si ça secoue. Accueillez la surprise." },
    opposition: { title: "Appel à la liberté", subtitle: "Quelque chose doit changer", description: "Des événements vous poussent vers plus d'authenticité. Écoutez l'impulsion — elle sait où elle va." },
    square: { title: "Tension électrique", subtitle: "L'agitation monte", description: "L'envie de changement est réelle et pressante. Canalisez cette énergie au lieu de la subir." },
    trine: { title: "Innovation fluide", subtitle: "Les nouvelles idées se posent en douceur", description: "Le changement vient naturellement. C'est le moment d'expérimenter et d'essayer du neuf." },
  },
  Saturn: {
    conjunction: { title: "Nouvelles fondations", subtitle: "La structure se construit", description: "C'est le moment de bâtir du solide. La discipline investie maintenant portera ses fruits pendant des années." },
    opposition: { title: "Heure des comptes", subtitle: "Les résultats sont testés", description: "Ce que vous avez construit est évalué par la réalité. Ce qui est solide tient. Le reste doit évoluer." },
    square: { title: "Croissance exigeante", subtitle: "L'effort est requis", description: "Les obstacles révèlent où il reste du travail. Chaque difficulté surmontée vous rend plus fort." },
    trine: { title: "Progrès régulier", subtitle: "La discipline paie", description: "Le travail de fond porte ses fruits. Les récompenses sont méritées et durables." },
  },
  Jupiter: {
    conjunction: { title: "Fenêtre d'expansion", subtitle: "Les possibilités se multiplient", description: "Les portes s'ouvrent. Les opportunités sont là — soyez prêt à saisir ce qui se présente." },
    opposition: { title: "Besoin d'équilibre", subtitle: "L'excès guette", description: "La croissance est possible mais la modération est clé. Visez l'essentiel, ne vous dispersez pas." },
    square: { title: "Tension de croissance", subtitle: "Ambition contre réalité", description: "L'ambition pousse, la réalité freine. Ajustez le cap sans perdre l'élan." },
    trine: { title: "Alignement favorable", subtitle: "Le flux est avec vous", description: "Les choses se mettent en place. La chance favorise ceux qui agissent — c'est le moment." },
  },
  "South Node": {
    conjunction: { title: "Libération karmique", subtitle: "Ce qui ne vous sert plus s'efface", description: "Le Noeud Sud active un point de votre thème. Il est temps de lâcher les schémas devenus obsolètes pour faire de la place à ce qui vient." },
    opposition: { title: "Tiraillement ancien", subtitle: "Un vieux réflexe résiste", description: "Un ancien schéma vous retient face à un appel de croissance. Observez ce que vous avez du mal à lâcher." },
    square: { title: "Friction de lâcher-prise", subtitle: "Le passé résiste au présent", description: "Un conflit entre un fonctionnement ancien et ce que la situation exige. Le lâcher-prise est la clé." },
  },
  "North Node": {
    conjunction: { title: "Cap de croissance", subtitle: "La direction se clarifie", description: "Le Noeud Nord pointe exactement vers votre direction de croissance. Les opportunités qui se présentent méritent votre pleine attention." },
    opposition: { title: "Recalibrage de direction", subtitle: "Le cap demande un ajustement", description: "Votre direction de vie est questionnée. C'est une invitation à vérifier que vous avancez vers ce qui compte vraiment." },
    square: { title: "Carrefour de vie", subtitle: "Un choix de direction s'impose", description: "Vous êtes à un carrefour. La tension pousse à choisir entre confort du connu et appel de la croissance." },
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
  level?: number,
  markers?: string[]
): EventMeta {
  // ZR events — differentiate by marker (LB, Cu, pre-LB, peak)
  if (category === "zr") {
    const lt = Array.isArray(lotType) ? lotType[0] : lotType || "fortune";
    const lotLabel = lt === "fortune" ? "circonstances" : lt === "spirit" ? "vocation" : "désir";

    // LB — Loosening of the Bond (major life pivot)
    if (markers?.includes("LB")) {
      return {
        title: "Pivot majeur",
        subtitle: `Votre ${lotLabel} change de cap`,
        description: `Un tournant décisif dans votre ${lotLabel}. Ce qui a été construit arrive à maturité et la séquence "saute" vers un nouveau chapitre. Ce qui a été semé ces dernières années porte ses fruits ou se transforme.`,
        keyInsight: "C'est l'un des pivots les plus marquants de votre timeline. Ce qui change ici redéfinit la direction.",
      };
    }

    // Culmination — 10th sign from the lot (peak of cycle)
    if (markers?.includes("Cu")) {
      return {
        title: "Apogée du cycle",
        subtitle: `Le sommet de votre ${lotLabel}`,
        description: `Ce qui a été construit dans le domaine de votre ${lotLabel} atteint son point culminant. C'est le moment où les résultats deviennent visibles et tangibles.`,
        keyInsight: "Le sommet du cycle — ce que vous avez bâti est maintenant à son plus haut. Observez ce qui se manifeste.",
      };
    }

    // pre-LB — Foreshadowing (seed of a future pivot)
    if (markers?.includes("pre-LB")) {
      return {
        title: "Période graine",
        subtitle: `Un pivot futur se prépare`,
        description: `Ce qui se passe maintenant dans votre ${lotLabel} prépare un tournant futur. Les thèmes qui émergent sont les graines d'un changement majeur à venir dans ~8 ans.`,
        keyInsight: "Période de foreshadowing — ce qui émerge maintenant annonce un pivot futur. Observez les thèmes récurrents.",
      };
    }

    // Regular peak
    const base = ZR_LABELS[lt] || ZR_LABELS.fortune;
    return {
      title: base.title || "Changement de rythme",
      subtitle: base.subtitle || "Le timing est avec vous",
      description: base.description || "Une fenêtre de timing significative est ouverte.",
      keyInsight: level === 2 ? "C'est une période rare et à fort impact. Agissez." : undefined,
    };
  }

  // Eclipse events
  if (category === "eclipse") {
    const isSolar = label.toLowerCase().includes("solar");
    return {
      title: isSolar ? "Nouveau départ" : "Point culminant",
      subtitle: isSolar ? "Un nouveau chapitre s'ouvre" : "Libération émotionnelle",
      description: isSolar
        ? "Un tournant se dessine. Ce qui est semé maintenant grandira pendant les 6 prochains mois."
        : "Ce qui couvait émotionnellement arrive à maturité. C'est le moment de lâcher ce qui ne fonctionne plus.",
    };
  }

  // Station events
  if (category === "station") {
    const isDirect = label.includes(" SD ");
    return {
      title: isDirect ? "Reprise de l'élan" : "Pause et révision",
      subtitle: isDirect ? "La clarté revient" : "Le rythme ralentit",
      description: isDirect
        ? "L'élan reprend après une période de révision. La clarté revient — avancez."
        : "Une période de recul et de recalibration commence. Ralentissez pour mieux repartir.",
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
