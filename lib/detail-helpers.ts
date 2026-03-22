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
  pluto: "transforme en profondeur ce qui ne fonctionne plus",
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

const HOUSE_ACTIONS: Record<number, { current: string; future: string; past: string }> = {
  1:  { current: "Prenez une initiative qui vous ressemble.", future: "Préparez un changement d'image ou de posture.", past: "Ce qui a changé en vous à cette époque est toujours actif." },
  2:  { current: "Revoyez vos finances — un ajustement s'impose.", future: "Anticipez un mouvement financier.", past: "Les décisions financières de cette période ont laissé une empreinte." },
  3:  { current: "Un message ou une conversation peut tout changer.", future: "Soyez attentif aux échanges qui arrivent.", past: "Une information reçue ici a orienté la suite." },
  4:  { current: "Votre foyer demande de l'attention. Agissez chez vous.", future: "Un changement lié au logement ou à la famille approche.", past: "Ce qui a bougé chez vous a posé de nouvelles fondations." },
  5:  { current: "Dites oui au plaisir et à la créativité.", future: "Une fenêtre créative ou romantique s'ouvre bientôt.", past: "La joie de cette période est une ressource qui reste." },
  6:  { current: "Ajustez une routine qui ne fonctionne plus.", future: "Anticipez un changement dans votre quotidien.", past: "Les habitudes posées ici vous portent encore." },
  7:  { current: "Investissez dans vos relations clés.", future: "Une relation importante va être activée.", past: "Ce qui s'est joué dans vos relations a tout changé." },
  8:  { current: "Acceptez ce qui émerge, même si c'est inconfortable.", future: "Préparez-vous à lâcher quelque chose.", past: "La transformation de cette période vous a rendu plus fort." },
  9:  { current: "Élargissez votre horizon — voyage, formation, réflexion.", future: "Une expansion se prépare — restez ouvert.", past: "Ce que vous avez appris ici guide encore vos choix." },
  10: { current: "C'est le moment de prendre position professionnellement.", future: "Votre carrière va être sous les projecteurs.", past: "La visibilité gagnée ici continue de porter ses fruits." },
  11: { current: "Connectez-vous aux bonnes personnes.", future: "De nouvelles alliances vont se former.", past: "Les connexions de cette période sont devenues des piliers." },
  12: { current: "Prenez du recul. Le silence porte.", future: "Un temps de retrait sera bénéfique.", past: "Le travail intérieur de cette période a posé des bases invisibles." },
};

export function getContextualGuidance(
  domain: string,
  context: TimeContext,
  existingGuidance?: string,
  peakMoment?: string,
  apiTopics?: { house: number }[],
): string {
  // Use the primary topic's house for specific guidance
  const topicHouse = apiTopics?.[0]?.house;
  const actions = topicHouse ? HOUSE_ACTIONS[topicHouse] : null;

  if (context === "current") {
    return actions?.current ?? existingGuidance ?? "Ce signal est actif. Observez ce qui bouge dans votre vie.";
  }
  if (context === "future") {
    return actions?.future ?? "Cette fenêtre approche. Restez attentif aux signes.";
  }
  // Past
  return actions?.past ?? peakMoment ?? "Cette période a laissé une empreinte durable.";
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

// ─── Impact phrases by planet × aspect ──────────────────
// No astrology jargon — describes what the person FEELS and should DO.
const TRANSIT_IMPACT: Record<string, Record<string, string>> = {
  Pluto: {
    conjunction: "Quelque chose de profond se transforme en vous. Ce qui ne fonctionne plus s'efface pour laisser place au neuf.",
    opposition: "Une pression extérieure vous pousse à changer. Ce n'est pas confortable, mais c'est nécessaire.",
    square: "Un blocage demande votre attention. La tension que vous ressentez pointe exactement là où la croissance est possible.",
    trine: "Un changement profond se fait naturellement, sans forcer. Suivez le mouvement.",
  },
  Neptune: {
    conjunction: "Vos certitudes se brouillent — c'est normal. L'intuition prend le relais. Faites confiance à ce que vous ressentez.",
    opposition: "Ce que vous teniez pour acquis mérite d'être questionné. La clarté reviendra.",
    square: "Tout semble flou en ce moment. Ne forcez aucune décision. La patience est votre meilleur outil.",
    trine: "L'inspiration coule. Créativité, intuition, rêverie — laissez-vous porter sans chercher à contrôler.",
  },
  Uranus: {
    conjunction: "L'inattendu arrive. Ce qui semblait stable bouge — c'est libérateur, même si ça secoue.",
    opposition: "Quelque chose vous pousse à sortir de votre zone de confort. L'authenticité est le chemin.",
    square: "Une agitation intérieure monte. Cette envie de changement est un signal — canalisez-la.",
    trine: "Les nouvelles idées arrivent facilement. C'est le moment d'expérimenter et d'innover.",
  },
  Saturn: {
    conjunction: "C'est le moment de construire du solide. La discipline que vous investissez maintenant portera longtemps.",
    opposition: "La réalité teste ce que vous avez construit. Ce qui est solide tient. Le reste doit évoluer.",
    square: "Ça demande de l'effort, mais chaque obstacle surmonté vous rend plus fort. Persévérez.",
    trine: "Le travail de fond paie. Vos efforts s'accumulent tranquillement vers quelque chose de durable.",
  },
  Jupiter: {
    conjunction: "Les portes s'ouvrent. C'est une fenêtre d'opportunités — soyez prêt à saisir ce qui se présente.",
    opposition: "L'envie d'en faire trop est là. Visez l'essentiel — la croissance passe par l'équilibre.",
    square: "L'ambition pousse, mais la réalité freine. Ajustez le cap sans perdre l'élan.",
    trine: "Les choses se mettent en place. La chance favorise ceux qui agissent — c'est le moment.",
  },
  "North Node": {
    conjunction: "Un appel vers quelque chose de nouveau. Ce qui vous attire — même si c'est inconfortable — est le bon chemin.",
  },
  "South Node": {
    conjunction: "Il est temps de lâcher ce qui ne vous sert plus. Les vieux schémas sont prêts à partir.",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTransitNarrative(phase: any): string {
  if (!phase) return "";
  const cat = phase.apiCategory;
  const planet = phase.transitPlanet;
  const natal = phase.natalPoint;
  const aspect = phase.aspect;

  if (cat === "transit" && planet) {
    // Try specific impact phrase first
    const planetImpact = TRANSIT_IMPACT[planet];
    if (planetImpact) {
      const text = planetImpact[aspect] || planetImpact.conjunction;
      if (text) return text;
    }
    // Fallback for unknown planets
    return `Une énergie nouvelle influence votre quotidien dans les domaines activés.`;
  }

  if (cat === "eclipse") {
    if (phase.eclipseType === "solar") {
      return "Un tournant s'amorce. Ce qui est semé pendant cette période grandira pendant les 6 prochains mois.";
    }
    return "Ce qui couvait arrive à maturité. C'est le moment de lâcher ce qui ne fonctionne plus.";
  }

  if (cat === "zr") {
    const lotImpact: Record<string, string> = {
      fortune: "Vos circonstances matérielles et votre quotidien sont amplifiés. Le timing favorise l'action concrète.",
      spirit: "Votre sens du but se clarifie. Ce qui résonne avec votre mission mérite toute votre attention.",
      eros: "L'attraction et le désir sont au premier plan. Vos relations gagnent en intensité et en profondeur.",
    };
    return lotImpact[phase.lotType] || "Une fenêtre de timing significative est ouverte pour vous.";
  }

  if (cat === "station") {
    return "Une pause dans le flux. Les thèmes liés à cette période s'intensifient — prenez le temps de les observer.";
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

const HOUSE_HUMAN: Record<number, string> = {
  1: "votre manière d'être", 2: "vos finances", 3: "vos échanges",
  4: "votre foyer", 5: "votre créativité", 6: "votre quotidien",
  7: "vos relations", 8: "vos transformations profondes", 9: "votre horizon",
  10: "votre carrière", 11: "votre réseau", 12: "votre vie intérieure",
};

export function getTopicsNarrative(
  topics: { house: number; topic: string; source: string }[] | undefined,
  context: TimeContext
): string {
  if (!topics || topics.length === 0) return "";

  const parts = topics.map(t => HOUSE_HUMAN[t.house] || `votre vie`);
  const unique = [...new Set(parts)];

  const joined = unique.length === 1
    ? unique[0]
    : unique.slice(0, -1).join(", ") + " et " + unique[unique.length - 1];

  if (context === "current") {
    return `Ce signal touche ${joined}.`;
  }
  if (context === "future") {
    return `Ce signal va toucher ${joined}.`;
  }
  return `Ce signal a touché ${joined}.`;
}
