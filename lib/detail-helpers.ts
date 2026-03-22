/**
 * Detail Sheet Helpers — narrative generation for capsule detail panels
 * Personalizes content based on time context (past/current/future)
 * and life domain (12 houses).
 */

import { houseConfig, planetConfig, type HouseNumber, type PlanetKey } from "@/lib/domain-config";

// ─── Time Context ────────────────────────────────────────

export type TimeContext = "past" | "current" | "future";

export interface TimeContextMeta {
  context: TimeContext;
  bannerLabel: string;
  bannerIcon: "clock" | "bolt" | "calendar";
  storyLabel: string;
  insightLabel: string;
}

export function getTimeContext(isCurrent: boolean, isFuture: boolean): TimeContextMeta {
  if (isCurrent) return {
    context: "current",
    bannerLabel: "En cours",
    bannerIcon: "bolt",
    storyLabel: "Ce qui se déroule",
    insightLabel: "Insight pour maintenant",
  };
  if (isFuture) return {
    context: "future",
    bannerLabel: "À venir",
    bannerIcon: "calendar",
    storyLabel: "Ce qui vous attend",
    insightLabel: "À anticiper",
  };
  return {
    context: "past",
    bannerLabel: "Vous y étiez",
    bannerIcon: "clock",
    storyLabel: "Ce qui s'est passé",
    insightLabel: "Insight clé",
  };
}

// ─── Tier Labels ─────────────────────────────────────────

export function getTierLabel(tier: "toc" | "toctoc" | "toctoctoc"): string {
  if (tier === "toctoctoc") return "Moment fort";
  if (tier === "toctoc") return "Signal clair";
  return "Signal subtil";
}

// ─── Domain Key → House Number bridge ────────────────────

const DOMAIN_TO_HOUSE: Record<string, HouseNumber> = {
  love: 7,      // Couple
  health: 6,    // Quotidien
  work: 10,     // Carrière
  identity: 1,
  money: 2,
  communication: 3,
  home: 4,
  creativity: 5,
  relationships: 7,
  transformations: 8,
  horizon: 9,
  career: 10,
  network: 11,
  inner: 12,
};

export function domainKeyToHouse(domain: string): HouseNumber {
  return DOMAIN_TO_HOUSE[domain] ?? 10;
}

// ─── Domain Narrative ────────────────────────────────────

const DOMAIN_NARRATIVES: Record<TimeContext, Record<HouseNumber, string>> = {
  past: {
    1: "Cette période a remué votre identité. C'est là que vous avez changé votre manière de vous présenter au monde.",
    2: "Votre rapport à l'argent et aux ressources a été activé. Les décisions financières de cette époque ont laissé des traces.",
    3: "Vos échanges et votre façon de communiquer ont été au centre. Messages importants, déplacements, apprentissages.",
    4: "Votre foyer et vos racines ont été secoués. Déménagement, famille, besoin d'ancrage — quelque chose a bougé en profondeur.",
    5: "Votre créativité et votre désir de plaisir étaient à leur pic. Romance, projets fun, expression personnelle.",
    6: "Votre quotidien a été réorganisé. Santé, routines, charge de travail — les habitudes se sont transformées.",
    7: "Vos relations proches ont été au premier plan. Couple, partenariats, engagements — un vis-à-vis important.",
    8: "Vous avez traversé une zone de transformation. Crises, héritages, tabous — ce qui était caché est remonté.",
    9: "Votre horizon s'est élargi. Voyages, études, quête de sens — un appel vers quelque chose de plus grand.",
    10: "Votre carrière et votre réputation ont été activées. Promotion, visibilité, responsabilités — votre place dans le monde.",
    11: "Votre réseau et vos projets collectifs ont été en mouvement. Nouvelles alliances, communautés, espoirs partagés.",
    12: "Une période d'intériorité. Retrait, lâcher-prise, travail invisible — les fondations se posaient en silence.",
  },
  current: {
    1: "Votre identité est en mouvement. Comment vous vous présentez au monde est en train de changer — laissez-vous surprendre.",
    2: "Votre domaine financier est actif. Portez attention à vos revenus, vos dépenses, et ce à quoi vous accordez de la valeur.",
    3: "Vos échanges sont amplifiés. Un message, une conversation ou un déplacement peut tout changer en ce moment.",
    4: "Votre foyer demande votre attention. Logement, famille, racines — quelque chose bouge chez vous, au sens propre ou figuré.",
    5: "Votre créativité est en plein élan. C'est le moment d'oser, de jouer, de créer. Romance et plaisir sont favorisés.",
    6: "Votre quotidien se réorganise. Santé, routines, charge de travail — ajustez ce qui ne fonctionne plus.",
    7: "Vos relations sont au centre. Le dialogue avec l'autre — partenaire, associé, adversaire — est essentiel maintenant.",
    8: "Vous êtes dans une zone de transformation. Acceptez ce qui émerge — crises, profondeur, vérités cachées.",
    9: "Votre horizon s'élargit. Voyages, études, nouvelles perspectives — suivez l'appel de ce qui est lointain.",
    10: "Votre carrière est sous les projecteurs. Réputation, statut, décisions visibles — c'est le moment d'agir.",
    11: "Votre réseau est en effervescence. Amis, projets, communautés — les bonnes connexions se font maintenant.",
    12: "Une période d'intériorité s'installe. Prenez du recul, écoutez ce qui se passe en coulisses. Le silence porte.",
  },
  future: {
    1: "Un signal arrive sur votre identité. Préparez-vous à revoir comment vous vous montrez au monde.",
    2: "Une fenêtre financière s'ouvre bientôt. Revenus, investissements, rapport à la valeur — restez attentif.",
    3: "Vos échanges vont s'intensifier. Communication, déplacements, apprentissages — des messages clés approchent.",
    4: "Votre foyer sera activé. Logement, famille, racines — préparez-vous à des mouvements dans votre vie privée.",
    5: "La créativité et le plaisir arrivent. Une fenêtre pour la romance, l'expression, les projets qui font vibrer.",
    6: "Votre quotidien va être bousculé. Santé, routines, organisation — anticipez les ajustements nécessaires.",
    7: "Vos relations seront au premier plan. Couple, partenariats, engagements — un chapitre relationnel s'ouvre.",
    8: "Une zone de transformation approche. Ce qui est enfoui remontera — accueillez le changement en profondeur.",
    9: "Votre horizon va s'élargir. Voyages, études, quête de sens — une expansion se prépare.",
    10: "Votre carrière va être activée. Visibilité, responsabilités, reconnaissance — positionnez-vous maintenant.",
    11: "Votre réseau va bouger. Nouvelles alliances, projets collectifs — les bonnes rencontres sont devant vous.",
    12: "Une période d'intériorité approche. Prévoyez du temps pour le recul, la réflexion, le lâcher-prise.",
  },
};

export function getDomainNarrative(domain: string, context: TimeContext): string {
  const house = domainKeyToHouse(domain);
  return DOMAIN_NARRATIVES[context][house] ?? "";
}

// ─── Planet Narrative ────────────────────────────────────

const PLANET_MEANINGS: Record<PlanetKey, string> = {
  sun: "met en lumière ce qui compte vraiment",
  moon: "remue les émotions et les besoins profonds",
  mercury: "accélère les échanges et les décisions",
  venus: "active l'attraction, les valeurs et la douceur",
  mars: "pousse à l'action, parfois au conflit",
  jupiter: "ouvre des portes et élargit les possibles",
  saturn: "teste ce qui est solide et demande de la rigueur",
  uranus: "amène des surprises et des ruptures libératrices",
  neptune: "dissout les certitudes et invite à l'intuition",
  "solar-eclipse": "marque un nouveau départ puissant",
  "lunar-eclipse": "ferme un chapitre et libère de l'espace",
};

export function getPlanetNarrative(planets: PlanetKey[]): string {
  if (planets.length === 0) return "";
  if (planets.length === 1) {
    const p = planetConfig[planets[0]];
    return `${p.label} ${PLANET_MEANINGS[planets[0]]}.`;
  }
  // Multi-planet: compose
  const parts = planets.slice(0, 3).map(pk => {
    const p = planetConfig[pk];
    return `${p.label} ${PLANET_MEANINGS[pk]}`;
  });
  if (parts.length === 2) return `${parts[0]}, tandis que ${parts[1]}.`;
  return `${parts[0]}. ${parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(". ")}.`;
}

// ─── Duration Formatting ─────────────────────────────────

export function formatDuration(startDate: Date, endDate: Date): string {
  const diffMs = endDate.getTime() - startDate.getTime();
  const totalDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  const months = Math.floor(totalDays / 30);
  const days = totalDays - months * 30;
  if (months === 0) return `${totalDays} jours`;
  if (days === 0) return months === 1 ? "1 mois" : `${months} mois`;
  return months === 1
    ? `1 mois ${days} jours`
    : `${months} mois ${days} jours`;
}

// ─── Progress ────────────────────────────────────────────

export function getProgressPercent(startDate: Date, endDate: Date): number {
  const now = Date.now();
  if (now >= endDate.getTime()) return 100;
  if (now <= startDate.getTime()) return 0;
  return Math.round(((now - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100);
}

// ─── Rarity Text ─────────────────────────────────────────

export function getRarityText(tierOccurrence: number, tierTotal: number, tier: string): string | null {
  if (tier !== "toctoctoc" || tierOccurrence <= 0) return null;
  return `sur ${tierTotal} dans votre vie`;
}

// ─── Guidance by context ─────────────────────────────────

export function getContextualGuidance(
  domain: string,
  context: TimeContext,
  existingGuidance?: string,
  peakMoment?: string,
): string {
  const house = domainKeyToHouse(domain);
  const label = houseConfig[house]?.label?.toLowerCase() ?? "cette zone";

  if (context === "current") {
    return existingGuidance ?? `Ce signal est actif. Plus vous investissez dans votre ${label}, plus vous créez d'élan.`;
  }
  if (context === "future") {
    return `Cette fenêtre approche. L'énergie va favoriser votre ${label}. Commencez à remarquer les thèmes liés.`;
  }
  // Past
  return peakMoment ?? `La croissance de cette période est toujours en vous. Votre ${label} en porte la trace.`;
}

// ─── Transit Narrative (from real API data) ─────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PLANET_FR: Record<string, string> = {
  Pluto: "Pluton", Neptune: "Neptune", Uranus: "Uranus", Saturn: "Saturne",
  Jupiter: "Jupiter", Mars: "Mars", Venus: "Vénus", Mercury: "Mercure",
  Sun: "Soleil", Moon: "Lune", "North Node": "Noeud Nord", "South Node": "Noeud Sud",
  Ascendant: "Ascendant", MC: "Milieu du Ciel",
};
const ASPECT_FR: Record<string, string> = {
  conjunction: "en conjonction avec",
  square: "en carré avec",
  opposition: "en opposition avec",
  trine: "en trigone avec",
  sextile: "en sextile avec",
};
function fr(name: string): string { return PLANET_FR[name] || name; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTransitNarrative(phase: any): string {
  if (!phase) return "";
  const cat = phase.apiCategory;
  const planet = phase.transitPlanet;
  const natal = phase.natalPoint;
  const aspect = phase.aspect;

  if (cat === "transit" && planet && natal && aspect) {
    return `${fr(planet)} est ${ASPECT_FR[aspect] || "en aspect avec"} votre ${fr(natal)} natal.`;
  }

  if (cat === "eclipse") {
    const type = phase.eclipseType === "solar" ? "solaire" : "lunaire";
    return `Une éclipse ${type} active votre ${fr(natal || "thème")} natal.`;
  }

  if (cat === "zr") {
    const lotLabels: Record<string, string> = { fortune: "Circonstances", spirit: "Vocation", eros: "Désir" };
    const lot = lotLabels[phase.lotType] || phase.lotType || "Fortune";
    const sign = phase.periodSign || "";
    const level = phase.zrLevel === 2 ? "majeure" : "secondaire";
    return `Période ${level} du Lot de ${lot}${sign ? ` en ${sign}` : ""}.`;
  }

  if (cat === "station") {
    return `${fr(planet || "Planète")} en station — une pause qui intensifie son effet sur votre ${fr(natal || "thème")}.`;
  }

  return "";
}

// ─── Translate API label to French ──────────────────────

export function translateApiLabel(label: string | undefined): string | null {
  if (!label) return null;
  // "Jupiter conjunction natal Mars" → "Jupiter conjonction Mars natal"
  // "ZR Fortune+Spirit L3 Cancer" → keep as-is (already readable)
  // "Solar Eclipse conjunct natal Sun" → "Éclipse solaire conjonction Soleil natal"
  let result = label;
  for (const [en, frLabel] of Object.entries(PLANET_FR)) {
    result = result.replace(new RegExp(`\\b${en}\\b`, "g"), frLabel);
  }
  result = result
    .replace(/\bconjunction\b/gi, "conjonction")
    .replace(/\bconjunct\b/gi, "conjonction")
    .replace(/\bsquare\b/gi, "carré")
    .replace(/\bopposition\b/gi, "opposition")
    .replace(/\btrine\b/gi, "trigone")
    .replace(/\bsextile\b/gi, "sextile")
    .replace(/\bnatal\b/gi, "natal")
    .replace(/\bReturn\b/gi, "Retour")
    .replace(/\bSolar Eclipse\b/gi, "Éclipse solaire")
    .replace(/\bLunar Eclipse\b/gi, "Éclipse lunaire")
    .replace(/\bSR\b/, "station directe")
    .replace(/\bSD\b/, "station rétrograde")
    .replace(/\bPeak\b/gi, "Pic")
    .replace(/\bZR\b/, "ZR");
  return result;
}

// ─── Cycle Narrative ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCycleNarrative(phase: any): string | null {
  const cycle = phase?.cycle;
  if (!cycle || !cycle.totalHits || cycle.totalHits <= 1) return null;

  const hitDescriptions: Record<number, string> = {
    1: "Premier contact — la situation émerge.",
    2: "Phase de révision — retour en arrière pour approfondir.",
    3: "Résolution finale — intégration et avancée.",
  };

  const hitText = cycle.totalHits <= 3
    ? hitDescriptions[cycle.hitNumber] || `Passage ${cycle.hitNumber}.`
    : `Passage ${cycle.hitNumber} sur ${cycle.totalHits}.`;

  return `${hitText}${cycle.pattern ? ` (${cycle.pattern})` : ""}`;
}

// ─── Lifetime Narrative ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLifetimeNarrative(phase: any): string | null {
  const n = phase?.lifetimeNumber;
  const total = phase?.lifetimeTotal;
  if (!n || !total || total <= 1) return null;

  if (n === 1 && total > 1) return "Première fois dans votre vie. Territoire entièrement nouveau.";
  if (n === total) return "Dernière occurrence dans votre vie. Résolution et achèvement.";
  if (n === 2) return "Deuxième rencontre avec cette énergie. Approfondissement.";
  return `${n}e occurrence sur ${total} dans votre vie.`;
}

// ─── Topics Narrative (from real API topics) ────────────

export function getTopicsNarrative(
  topics: { house: number; topic: string; source: string }[] | undefined,
  context: TimeContext
): string {
  if (!topics || topics.length === 0) return "";

  const houseLabels: Record<number, string> = {
    1: "l'identité", 2: "les finances", 3: "la communication",
    4: "le foyer", 5: "la créativité", 6: "le quotidien",
    7: "le couple", 8: "les transformations", 9: "l'horizon",
    10: "la carrière", 11: "le réseau", 12: "l'intériorité",
  };

  const parts = topics.map(t => houseLabels[t.house] || `la maison ${t.house}`);
  const unique = [...new Set(parts)];

  if (context === "current") {
    return `Les domaines activés en ce moment : ${unique.join(", ")}.`;
  }
  if (context === "future") {
    return `Les domaines qui seront touchés : ${unique.join(", ")}.`;
  }
  return `Les domaines qui ont été touchés : ${unique.join(", ")}.`;
}
