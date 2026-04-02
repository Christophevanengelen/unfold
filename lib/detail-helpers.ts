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
    storyLabel: "Ce qui t'attend",
    insightLabel: "À anticiper",
  };
  return {
    context: "past",
    bannerLabel: "Tu y étais",
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
    1: "Cette période a remué ton identité. C'est là que tu as changé ta manière de te présenter au monde.",
    2: "Ton rapport à l'argent et aux ressources a été activé. Les décisions financières de cette époque ont laissé des traces.",
    3: "Tes échanges et ta façon de communiquer ont été au centre. Messages importants, déplacements, apprentissages.",
    4: "Ton foyer et tes racines ont été secoués. Déménagement, famille, besoin d'ancrage — quelque chose a bougé en profondeur.",
    5: "Ta créativité et ton désir de plaisir étaient à leur pic. Romance, projets fun, expression personnelle.",
    6: "Ton quotidien a été réorganisé. Santé, routines, charge de travail — les habitudes se sont transformées.",
    7: "Tes relations proches ont été au premier plan. Couple, partenariats, engagements — un vis-à-vis important.",
    8: "Tu as traversé une zone de transformation. Crises, héritages, tabous — ce qui était caché est remonté.",
    9: "Ton horizon s'est élargi. Voyages, études, quête de sens — un appel vers quelque chose de plus grand.",
    10: "Ta carrière et ta réputation ont été activées. Promotion, visibilité, responsabilités — ta place dans le monde.",
    11: "Ton réseau et tes projets collectifs ont été en mouvement. Nouvelles alliances, communautés, espoirs partagés.",
    12: "Une période d'intériorité. Retrait, lâcher-prise, travail invisible — les fondations se posaient en silence.",
  },
  current: {
    1: "Ton identité est en mouvement. Comment tu te présentes au monde est en train de changer — laisse-toi surprendre.",
    2: "Ton domaine financier est actif. Porte attention à tes revenus, tes dépenses, et ce à quoi tu accordes de la valeur.",
    3: "Tes échanges sont amplifiés. Un message, une conversation ou un déplacement peut tout changer en ce moment.",
    4: "Ton foyer demande ton attention. Logement, famille, racines — quelque chose bouge chez toi, au sens propre ou figuré.",
    5: "Ta créativité est en plein élan. C'est le moment d'oser, de jouer, de créer. Romance et plaisir sont favorisés.",
    6: "Ton quotidien se réorganise. Santé, routines, charge de travail — ajuste ce qui ne fonctionne plus.",
    7: "Tes relations sont au centre. Le dialogue avec l'autre — partenaire, associé, adversaire — est essentiel maintenant.",
    8: "Tu es dans une zone de transformation. Accepte ce qui émerge — crises, profondeur, vérités cachées.",
    9: "Ton horizon s'élargit. Voyages, études, nouvelles perspectives — suis l'appel de ce qui est lointain.",
    10: "Ta carrière est sous les projecteurs. Réputation, statut, décisions visibles — c'est le moment d'agir.",
    11: "Ton réseau est en effervescence. Amis, projets, communautés — les bonnes connexions se font maintenant.",
    12: "Une période d'intériorité s'installe. Prends du recul, écoute ce qui se passe en coulisses. Le silence porte.",
  },
  future: {
    1: "Un signal arrive sur ton identité. Prépare-toi à revoir comment tu te montres au monde.",
    2: "Une fenêtre financière s'ouvre bientôt. Revenus, investissements, rapport à la valeur — reste attentif.",
    3: "Tes échanges vont s'intensifier. Communication, déplacements, apprentissages — des messages clés approchent.",
    4: "Ton foyer sera activé. Logement, famille, racines — prépare-toi à des mouvements dans ta vie privée.",
    5: "La créativité et le plaisir arrivent. Une fenêtre pour la romance, l'expression, les projets qui font vibrer.",
    6: "Ton quotidien va être bousculé. Santé, routines, organisation — anticipe les ajustements nécessaires.",
    7: "Tes relations seront au premier plan. Couple, partenariats, engagements — un chapitre relationnel s'ouvre.",
    8: "Une zone de transformation approche. Ce qui est enfoui remontera — accueille le changement en profondeur.",
    9: "Ton horizon va s'élargir. Voyages, études, quête de sens — une expansion se prépare.",
    10: "Ta carrière va être activée. Visibilité, responsabilités, reconnaissance — positionne-toi maintenant.",
    11: "Ton réseau va bouger. Nouvelles alliances, projets collectifs — les bonnes rencontres sont devant toi.",
    12: "Une période d'intériorité approche. Prévois du temps pour le recul, la réflexion, le lâcher-prise.",
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
  "north-node": "pointe vers ta direction de croissance",
  "south-node": "invite à libérer les schémas devenus obsolètes",
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

// ─── Rarity Text (client-computed planet signature count) ─

export function getRarityText(tierOccurrence: number, tierTotal: number, tier: string): string | null {
  // NOTE: despite the historical name, this is used to display lifetime occurrence counts.
  // It must NOT be fed tierOccurrence/tierTotal (planet-signature rarity counters).
  if (!tierOccurrence || !tierTotal || tierOccurrence <= 0 || tierTotal <= 1) return null;
  return `sur ${tierTotal} dans ta vie`;
}

// ─── Cycle Text (D-R-D pass count from API) ──────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCyclePassText(phase: any): string | null {
  const cycle = phase?.cycle;
  if (!cycle || !cycle.totalHits || cycle.totalHits <= 1) return null;
  return `Passage ${cycle.hitNumber} sur ${cycle.totalHits}`;
}

// ─── Guidance by context ─────────────────────────────────

const HOUSE_ACTIONS: Record<number, { current: string; future: string; past: string }> = {
  1:  { current: "Prends une initiative qui te ressemble.", future: "Prépare un changement d'image ou de posture.", past: "Ce qui a changé en toi à cette époque est toujours actif." },
  2:  { current: "Revois tes finances — un ajustement s'impose.", future: "Anticipe un mouvement financier.", past: "Les décisions financières de cette période ont laissé une empreinte." },
  3:  { current: "Un message ou une conversation peut tout changer.", future: "Sois attentif aux échanges qui arrivent.", past: "Une information reçue ici a orienté la suite." },
  4:  { current: "Ton foyer demande de l'attention. Agis chez toi.", future: "Un changement lié au logement ou à la famille approche.", past: "Ce qui a bougé chez toi a posé de nouvelles fondations." },
  5:  { current: "Dis oui au plaisir et à la créativité.", future: "Une fenêtre créative ou romantique s'ouvre bientôt.", past: "La joie de cette période est une ressource qui reste." },
  6:  { current: "Ajuste une routine qui ne fonctionne plus.", future: "Anticipe un changement dans ton quotidien.", past: "Les habitudes posées ici te portent encore." },
  7:  { current: "Investis dans tes relations clés.", future: "Une relation importante va être activée.", past: "Ce qui s'est joué dans tes relations a tout changé." },
  8:  { current: "Accepte ce qui émerge, même si c'est inconfortable.", future: "Prépare-toi à lâcher quelque chose.", past: "La transformation de cette période t'a rendu plus fort." },
  9:  { current: "Élargis ton horizon — voyage, formation, réflexion.", future: "Une expansion se prépare — reste ouvert.", past: "Ce que tu as appris ici guide encore tes choix." },
  10: { current: "C'est le moment de prendre position professionnellement.", future: "Ta carrière va être sous les projecteurs.", past: "La visibilité gagnée ici continue de porter ses fruits." },
  11: { current: "Connecte-toi aux bonnes personnes.", future: "De nouvelles alliances vont se former.", past: "Les connexions de cette période sont devenues des piliers." },
  12: { current: "Prends du recul. Le silence porte.", future: "Un temps de retrait sera bénéfique.", past: "Le travail intérieur de cette période a posé des bases invisibles." },
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
    return actions?.current ?? existingGuidance ?? "Ce signal est actif. Observe ce qui bouge dans ta vie.";
  }
  if (context === "future") {
    return actions?.future ?? "Cette fenêtre approche. Reste attentif aux signes.";
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
    conjunction: "Quelque chose de profond se transforme en toi. Ce qui ne fonctionne plus s'efface pour laisser place au neuf.",
    opposition: "Une pression extérieure te pousse à changer. Ce n'est pas confortable, mais c'est nécessaire.",
    square: "Un blocage demande ton attention. La tension que tu ressens pointe exactement là où la croissance est possible.",
    trine: "Un changement profond se fait naturellement, sans forcer. Suis le mouvement.",
  },
  Neptune: {
    conjunction: "Tes certitudes se brouillent — c'est normal. L'intuition prend le relais. Fais confiance à ce que tu ressens.",
    opposition: "Ce que tu tenais pour acquis mérite d'être questionné. La clarté reviendra.",
    square: "Tout semble flou en ce moment. Ne force aucune décision. La patience est ton meilleur outil.",
    trine: "L'inspiration coule. Créativité, intuition, rêverie — laisse-toi porter sans chercher à contrôler.",
  },
  Uranus: {
    conjunction: "L'inattendu arrive. Ce qui semblait stable bouge — c'est libérateur, même si ça secoue.",
    opposition: "Quelque chose te pousse à sortir de ta zone de confort. L'authenticité est le chemin.",
    square: "Une agitation intérieure monte. Cette envie de changement est un signal — canalise-la.",
    trine: "Les nouvelles idées arrivent facilement. C'est le moment d'expérimenter et d'innover.",
  },
  Saturn: {
    conjunction: "C'est le moment de construire du solide. La discipline que tu investis maintenant portera longtemps.",
    opposition: "La réalité teste ce que tu as construit. Ce qui est solide tient. Le reste doit évoluer.",
    square: "Ça demande de l'effort, mais chaque obstacle surmonté te rend plus fort. Persévère.",
    trine: "Le travail de fond paie. Tes efforts s'accumulent tranquillement vers quelque chose de durable.",
  },
  Jupiter: {
    conjunction: "Les portes s'ouvrent. C'est une fenêtre d'opportunités — sois prêt à saisir ce qui se présente.",
    opposition: "L'envie d'en faire trop est là. Vise l'essentiel — la croissance passe par l'équilibre.",
    square: "L'ambition pousse, mais la réalité freine. Ajuste le cap sans perdre l'élan.",
    trine: "Les choses se mettent en place. La chance favorise ceux qui agissent — c'est le moment.",
  },
  "North Node": {
    conjunction: "Un appel vers quelque chose de nouveau. Ce qui t'attire — même si c'est inconfortable — est le bon chemin.",
  },
  "South Node": {
    conjunction: "Il est temps de lâcher ce qui ne te sert plus. Les vieux schémas sont prêts à partir.",
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
    return `Une énergie nouvelle influence ton quotidien dans les domaines activés.`;
  }

  if (cat === "eclipse") {
    if (phase.eclipseType === "solar") {
      return "Un tournant s'amorce. Ce qui est semé pendant cette période grandira pendant les 6 prochains mois.";
    }
    return "Ce qui couvait arrive à maturité. C'est le moment de lâcher ce qui ne fonctionne plus.";
  }

  if (cat === "zr") {
    const lotImpact: Record<string, string> = {
      fortune: "Tes circonstances matérielles et ton quotidien sont amplifiés. Le timing favorise l'action concrète.",
      spirit: "Ton sens du but se clarifie. Ce qui résonne avec ta mission mérite toute ton attention.",
      eros: "L'attraction et le désir sont au premier plan. Tes relations gagnent en intensité et en profondeur.",
    };
    return lotImpact[phase.lotType] || "Une fenêtre de timing significative est ouverte pour toi.";
  }

  if (cat === "station") {
    return "Une pause dans le rythme. Les thèmes de cette période s'intensifient — prenez le temps de les observer.";
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
    .replace(/\bconjunction\b/gi, "activation")
    .replace(/\bconjunct\b/gi, "activation")
    .replace(/\bsquare\b/gi, "tension")
    .replace(/\bopposition\b/gi, "confrontation")
    .replace(/\btrine\b/gi, "flux")
    .replace(/\bsextile\b/gi, "ouverture")
    .replace(/\bnatal\b/gi, "personnel")
    .replace(/\bReturn\b/gi, "Retour")
    .replace(/\bSolar Eclipse\b/gi, "Nouveau départ")
    .replace(/\bLunar Eclipse\b/gi, "Point culminant")
    .replace(/\bSR\b/, "reprise")
    .replace(/\bSD\b/, "pause")
    .replace(/\bPeak\b/gi, "Pic")
    .replace(/\bZR\b/, "Cycle de vie");
  return result;
}

// ─── Cycle Narrative ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCycleNarrative(phase: any): string | null {
  const cycle = phase?.cycle;
  if (!cycle || !cycle.totalHits || cycle.totalHits <= 1) return null;

  const hitDescriptions: Record<number, string> = {
    1: "Phase d'ouverture — le sujet apparaît dans ta vie.",
    2: "Phase de maturation — tu y reviens avec plus de recul.",
    3: "Phase de résolution — le sujet se clarifie et avance.",
  };

  const hitText = cycle.totalHits <= 3
    ? hitDescriptions[cycle.hitNumber] || `Passage ${cycle.hitNumber}.`
    : `Passage ${cycle.hitNumber} sur ${cycle.totalHits} — le sujet se précise à chaque étape.`;

  return hitText;
}

// ─── Lifetime Narrative ─────────────────────────────────
// NOTE: The API does NOT provide lifetime occurrence counts.
// This function is kept for backward compat but currently unused
// since lifetimeNumber/lifetimeTotal are always undefined from API.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLifetimeNarrative(phase: any): string | null {
  const n = phase?.lifetimeNumber;
  const total = phase?.lifetimeTotal;
  if (!n || !total || total <= 1) return null;

  if (n === 1 && total > 1) return "Première fois dans ta vie. Tu découvres un territoire entièrement nouveau.";
  if (n === total) return "Dernière fois dans ta vie. C'est le moment d'aller au bout de ce que cette période t'apporte.";
  if (n === 2) return "Deuxième fois que tu vis ça. Tu as déjà des repères — utilise-les.";
  return `${n}e occurrence sur ${total} dans ta vie. Chaque passage approfondit ta compréhension.`;
}

// ─── Topics Narrative (from real API topics) ────────────

const HOUSE_HUMAN: Record<number, string> = {
  1: "ta manière d'être", 2: "tes finances", 3: "tes échanges",
  4: "ton foyer", 5: "ta créativité", 6: "ton quotidien",
  7: "tes relations", 8: "tes transformations profondes", 9: "ton horizon",
  10: "ta carrière", 11: "ton réseau", 12: "ta vie intérieure",
};

export function getTopicsNarrative(
  topics: { house: number; topic: string; source: string }[] | undefined,
  context: TimeContext
): string {
  if (!topics || topics.length === 0) return "";

  const parts = topics.map(t => HOUSE_HUMAN[t.house] || `ta vie`);
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
