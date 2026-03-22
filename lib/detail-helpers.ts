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
  const weeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
  if (weeks <= 1) return "~1 semaine";
  if (weeks < 8) return `${weeks} semaines`;
  const months = Math.round(weeks / 4.33);
  if (months <= 1) return "~1 mois";
  if (months < 24) return `${months} mois`;
  const years = Math.round(months / 12);
  return `${years} ans`;
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
