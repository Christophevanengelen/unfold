/**
 * Detail Sheet Helpers — narrative generation for capsule detail panels
 * Personalizes content based on time context (past/current/future)
 * and life domain (12 houses).
 *
 * i18n: fr + en. Every public helper takes an optional ContentLocale;
 * when omitted it resolves from the detected UI locale (fr stays fr,
 * every other locale gets en) — so call sites need no changes.
 */

import { houseConfig, planetConfig, type HouseNumber, type PlanetKey } from "@/lib/domain-config";
import { toContentLocale, type ContentLocale } from "@/lib/event-labels";
import { detectLocale } from "@/lib/i18n-demo";

function resolveLocale(locale?: ContentLocale): ContentLocale {
  return locale ?? toContentLocale(detectLocale());
}

// ─── Time Context ────────────────────────────────────────

export type TimeContext = "past" | "current" | "future";

export interface TimeContextMeta {
  context: TimeContext;
  bannerLabel: string;
  bannerIcon: "clock" | "bolt" | "calendar";
  storyLabel: string;
  insightLabel: string;
}

export function getTimeContext(isCurrent: boolean, isFuture: boolean, locale?: ContentLocale): TimeContextMeta {
  const fr = resolveLocale(locale) === "fr";
  if (isCurrent) return {
    context: "current",
    bannerLabel: fr ? "En cours" : "Happening now",
    bannerIcon: "bolt",
    storyLabel: fr ? "Ce qui se déroule" : "What's unfolding",
    insightLabel: fr ? "Insight pour maintenant" : "Insight for now",
  };
  if (isFuture) return {
    context: "future",
    bannerLabel: fr ? "À venir" : "Coming up",
    bannerIcon: "calendar",
    storyLabel: fr ? "Ce qui t'attend" : "What's ahead",
    insightLabel: fr ? "À anticiper" : "To anticipate",
  };
  return {
    context: "past",
    bannerLabel: fr ? "Tu y étais" : "You were there",
    bannerIcon: "clock",
    storyLabel: fr ? "Ce qui s'est passé" : "What happened",
    insightLabel: fr ? "Insight clé" : "Key insight",
  };
}

// ─── Tier Labels ─────────────────────────────────────────

export function getTierLabel(tier: "toc" | "toctoc" | "toctoctoc", locale?: ContentLocale): string {
  const fr = resolveLocale(locale) === "fr";
  if (tier === "toctoctoc") return fr ? "Moment fort" : "Peak moment";
  if (tier === "toctoc") return fr ? "Signal clair" : "Clear signal";
  return fr ? "Signal subtil" : "Subtle signal";
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

const DOMAIN_NARRATIVES_FR: Record<TimeContext, Record<HouseNumber, string>> = {
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

const DOMAIN_NARRATIVES_EN: Record<TimeContext, Record<HouseNumber, string>> = {
  past: {
    1: "This period stirred your identity. That's when you changed how you show up in the world.",
    2: "Your relationship with money and resources was activated. The financial decisions of that time left their mark.",
    3: "Your exchanges and way of communicating took center stage. Important messages, travel, learning.",
    4: "Your home and roots were shaken. A move, family, a need for grounding — something shifted deep down.",
    5: "Your creativity and appetite for pleasure were at their peak. Romance, fun projects, self-expression.",
    6: "Your daily life got reorganized. Health, routines, workload — your habits transformed.",
    7: "Your close relationships were front and center. Partnership, commitments — an important counterpart.",
    8: "You went through a zone of transformation. Crises, inheritances, taboos — what was hidden came up.",
    9: "Your horizon widened. Travel, studies, a search for meaning — a call toward something bigger.",
    10: "Your career and reputation were activated. Promotion, visibility, responsibilities — your place in the world.",
    11: "Your network and collective projects were in motion. New alliances, communities, shared hopes.",
    12: "A period of inwardness. Retreat, letting go, invisible work — foundations were being laid in silence.",
  },
  current: {
    1: "Your identity is in motion. How you present yourself to the world is changing — let it surprise you.",
    2: "Your financial life is active. Pay attention to your income, your spending, and what you truly value.",
    3: "Your exchanges are amplified. A message, a conversation or a trip can change everything right now.",
    4: "Your home is asking for attention. Housing, family, roots — something is moving at home, literally or figuratively.",
    5: "Your creativity is in full swing. This is the moment to dare, to play, to create. Romance and pleasure are favored.",
    6: "Your daily life is reorganizing. Health, routines, workload — adjust what no longer works.",
    7: "Your relationships are at the center. The dialogue with the other — partner, associate, opponent — is essential now.",
    8: "You're in a zone of transformation. Accept what emerges — crises, depth, hidden truths.",
    9: "Your horizon is widening. Travel, studies, new perspectives — follow the call of what's far away.",
    10: "Your career is in the spotlight. Reputation, status, visible decisions — this is the moment to act.",
    11: "Your network is buzzing. Friends, projects, communities — the right connections are being made now.",
    12: "A period of inwardness is settling in. Step back, listen to what's happening backstage. Silence carries.",
  },
  future: {
    1: "A signal is coming for your identity. Get ready to rethink how you show yourself to the world.",
    2: "A financial window opens soon. Income, investments, your relationship with value — stay alert.",
    3: "Your exchanges will intensify. Communication, travel, learning — key messages are approaching.",
    4: "Your home will be activated. Housing, family, roots — expect movement in your private life.",
    5: "Creativity and pleasure are on their way. A window for romance, expression, projects that light you up.",
    6: "Your daily life is about to be shaken up. Health, routines, organization — anticipate the needed adjustments.",
    7: "Your relationships will be front and center. Partnership, commitments — a relational chapter is opening.",
    8: "A zone of transformation is approaching. What's buried will surface — welcome deep change.",
    9: "Your horizon is about to widen. Travel, studies, a search for meaning — an expansion is coming.",
    10: "Your career is about to be activated. Visibility, responsibilities, recognition — position yourself now.",
    11: "Your network is about to move. New alliances, collective projects — the right encounters are ahead of you.",
    12: "A period of inwardness is approaching. Plan time to step back, reflect, and let go.",
  },
};

export function getDomainNarrative(domain: string, context: TimeContext, locale?: ContentLocale): string {
  const house = domainKeyToHouse(domain);
  const dict = resolveLocale(locale) === "fr" ? DOMAIN_NARRATIVES_FR : DOMAIN_NARRATIVES_EN;
  return dict[context][house] ?? "";
}

// ─── Planet Narrative ────────────────────────────────────

const PLANET_MEANINGS_FR: Record<PlanetKey, string> = {
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

const PLANET_MEANINGS_EN: Record<PlanetKey, string> = {
  sun: "shines a light on what truly matters",
  moon: "stirs emotions and deep needs",
  mercury: "speeds up exchanges and decisions",
  venus: "activates attraction, values and softness",
  mars: "pushes toward action, sometimes conflict",
  jupiter: "opens doors and widens what's possible",
  saturn: "tests what's solid and demands rigor",
  uranus: "brings surprises and liberating breaks",
  neptune: "dissolves certainties and invites intuition",
  pluto: "deeply transforms what no longer works",
  "north-node": "points toward your direction of growth",
  "south-node": "invites you to release outdated patterns",
  "solar-eclipse": "marks a powerful fresh start",
  "lunar-eclipse": "closes a chapter and frees up space",
};

export function getPlanetNarrative(planets: PlanetKey[], locale?: ContentLocale): string {
  const fr = resolveLocale(locale) === "fr";
  const meanings = fr ? PLANET_MEANINGS_FR : PLANET_MEANINGS_EN;
  if (planets.length === 0) return "";
  if (planets.length === 1) {
    const p = planetConfig[planets[0]];
    return `${p.label} ${meanings[planets[0]]}.`;
  }
  // Multi-planet: compose
  const parts = planets.slice(0, 3).map(pk => {
    const p = planetConfig[pk];
    return `${p.label} ${meanings[pk]}`;
  });
  if (parts.length === 2) return fr ? `${parts[0]}, tandis que ${parts[1]}.` : `${parts[0]}, while ${parts[1]}.`;
  return `${parts[0]}. ${parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(". ")}.`;
}

// ─── Duration Formatting ─────────────────────────────────

export function formatDuration(startDate: Date, endDate: Date, locale?: ContentLocale): string {
  const fr = resolveLocale(locale) === "fr";
  const diffMs = endDate.getTime() - startDate.getTime();
  const totalDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  const months = Math.floor(totalDays / 30);
  const days = totalDays - months * 30;
  const dayWord = fr ? "jours" : "days";
  const monthWord = fr ? "mois" : (months === 1 ? "month" : "months");
  if (months === 0) return `${totalDays} ${dayWord}`;
  if (days === 0) return months === 1 ? `1 ${monthWord}` : `${months} ${monthWord}`;
  return months === 1
    ? `1 ${monthWord} ${days} ${dayWord}`
    : `${months} ${monthWord} ${days} ${dayWord}`;
}

// ─── Progress ────────────────────────────────────────────

export function getProgressPercent(startDate: Date, endDate: Date): number {
  const now = Date.now();
  if (now >= endDate.getTime()) return 100;
  if (now <= startDate.getTime()) return 0;
  return Math.round(((now - startDate.getTime()) / (endDate.getTime() - startDate.getTime())) * 100);
}

// ─── Rarity Text (client-computed planet signature count) ─

export function getRarityText(tierOccurrence: number, tierTotal: number, tier: string, locale?: ContentLocale): string | null {
  // NOTE: despite the historical name, this is used to display lifetime occurrence counts.
  // It must NOT be fed tierOccurrence/tierTotal (planet-signature rarity counters).
  if (!tierOccurrence || !tierTotal || tierOccurrence <= 0 || tierTotal <= 1) return null;
  return resolveLocale(locale) === "fr" ? `sur ${tierTotal} dans ta vie` : `of ${tierTotal} in your lifetime`;
}

// ─── Cycle Text (D-R-D pass count from API) ──────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCyclePassText(phase: any, locale?: ContentLocale): string | null {
  const cycle = phase?.cycle;
  if (!cycle || !cycle.totalHits || cycle.totalHits <= 1) return null;
  return resolveLocale(locale) === "fr"
    ? `Passage ${cycle.hitNumber} sur ${cycle.totalHits}`
    : `Pass ${cycle.hitNumber} of ${cycle.totalHits}`;
}

// ─── Guidance by context ─────────────────────────────────

const HOUSE_ACTIONS_FR: Record<number, { current: string; future: string; past: string }> = {
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

const HOUSE_ACTIONS_EN: Record<number, { current: string; future: string; past: string }> = {
  1:  { current: "Take an initiative that feels like you.", future: "Prepare a change of image or posture.", past: "What changed in you back then is still active." },
  2:  { current: "Review your finances — an adjustment is due.", future: "Anticipate a financial move.", past: "The financial decisions of that period left an imprint." },
  3:  { current: "A message or a conversation can change everything.", future: "Stay alert to the exchanges coming your way.", past: "A piece of information received here shaped what followed." },
  4:  { current: "Your home needs attention. Act where you live.", future: "A change tied to housing or family is approaching.", past: "What moved at home laid new foundations." },
  5:  { current: "Say yes to pleasure and creativity.", future: "A creative or romantic window opens soon.", past: "The joy of that period is a resource that remains." },
  6:  { current: "Adjust a routine that no longer works.", future: "Anticipate a change in your daily life.", past: "The habits you built here still carry you." },
  7:  { current: "Invest in your key relationships.", future: "An important relationship is about to be activated.", past: "What played out in your relationships changed everything." },
  8:  { current: "Accept what emerges, even if it's uncomfortable.", future: "Get ready to let something go.", past: "The transformation of that period made you stronger." },
  9:  { current: "Widen your horizon — travel, learning, reflection.", future: "An expansion is coming — stay open.", past: "What you learned here still guides your choices." },
  10: { current: "This is the moment to take a professional stand.", future: "Your career is about to be in the spotlight.", past: "The visibility gained here keeps paying off." },
  11: { current: "Connect with the right people.", future: "New alliances are about to form.", past: "The connections from that period became pillars." },
  12: { current: "Step back. Silence carries.", future: "A time of retreat will do you good.", past: "The inner work of that period laid invisible foundations." },
};

export function getContextualGuidance(
  domain: string,
  context: TimeContext,
  existingGuidance?: string,
  peakMoment?: string,
  apiTopics?: { house: number }[],
  locale?: ContentLocale,
): string {
  const fr = resolveLocale(locale) === "fr";
  // Use the primary topic's house for specific guidance
  const topicHouse = apiTopics?.[0]?.house;
  const dict = fr ? HOUSE_ACTIONS_FR : HOUSE_ACTIONS_EN;
  const actions = topicHouse ? dict[topicHouse] : null;

  if (context === "current") {
    return actions?.current ?? existingGuidance ?? (fr ? "Ce signal est actif. Observe ce qui bouge dans ta vie." : "This signal is active. Watch what's moving in your life.");
  }
  if (context === "future") {
    return actions?.future ?? (fr ? "Cette fenêtre approche. Reste attentif aux signes." : "This window is approaching. Stay alert to the signs.");
  }
  // Past
  return actions?.past ?? peakMoment ?? (fr ? "Cette période a laissé une empreinte durable." : "This period left a lasting imprint.");
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
const TRANSIT_IMPACT_FR: Record<string, Record<string, string>> = {
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

const TRANSIT_IMPACT_EN: Record<string, Record<string, string>> = {
  Pluto: {
    conjunction: "Something deep is transforming in you. What no longer works fades away to make room for the new.",
    opposition: "Outside pressure is pushing you to change. It's not comfortable, but it's necessary.",
    square: "A blockage is asking for your attention. The tension you feel points exactly where growth is possible.",
    trine: "A deep change is happening naturally, without forcing. Follow the movement.",
  },
  Neptune: {
    conjunction: "Your certainties are blurring — that's normal. Intuition takes over. Trust what you feel.",
    opposition: "What you took for granted deserves questioning. Clarity will return.",
    square: "Everything feels fuzzy right now. Don't force any decision. Patience is your best tool.",
    trine: "Inspiration is flowing. Creativity, intuition, daydreaming — let it carry you without trying to control.",
  },
  Uranus: {
    conjunction: "The unexpected is arriving. What seemed stable is moving — it's liberating, even if it shakes things.",
    opposition: "Something is pushing you out of your comfort zone. Authenticity is the way.",
    square: "An inner restlessness is rising. This urge for change is a signal — channel it.",
    trine: "New ideas come easily. This is the moment to experiment and innovate.",
  },
  Saturn: {
    conjunction: "This is the moment to build something solid. The discipline you invest now will carry you for a long time.",
    opposition: "Reality is testing what you've built. What's solid holds. The rest must evolve.",
    square: "It takes effort, but every obstacle overcome makes you stronger. Keep going.",
    trine: "The groundwork pays off. Your efforts are quietly building toward something lasting.",
  },
  Jupiter: {
    conjunction: "Doors are opening. It's a window of opportunities — be ready to seize what shows up.",
    opposition: "The urge to do too much is there. Aim for what matters — growth comes through balance.",
    square: "Ambition pushes, but reality slows. Adjust the course without losing momentum.",
    trine: "Things are falling into place. Luck favors those who act — this is the moment.",
  },
  "North Node": {
    conjunction: "A call toward something new. What attracts you — even if it's uncomfortable — is the right path.",
  },
  "South Node": {
    conjunction: "It's time to release what no longer serves you. The old patterns are ready to go.",
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTransitNarrative(phase: any, locale?: ContentLocale): string {
  if (!phase) return "";
  const isFr = resolveLocale(locale) === "fr";
  const cat = phase.apiCategory;
  const planet = phase.transitPlanet;
  const aspect = phase.aspect;

  if (cat === "transit" && planet) {
    // Try specific impact phrase first
    const dict = isFr ? TRANSIT_IMPACT_FR : TRANSIT_IMPACT_EN;
    const planetImpact = dict[planet];
    if (planetImpact) {
      const text = planetImpact[aspect] || planetImpact.conjunction;
      if (text) return text;
    }
    // Fallback for unknown planets
    return isFr
      ? `Une énergie nouvelle influence ton quotidien dans les domaines activés.`
      : `A new energy is influencing your daily life in the activated areas.`;
  }

  if (cat === "eclipse") {
    if (phase.eclipseType === "solar") {
      return isFr
        ? "Un tournant s'amorce. Ce qui est semé pendant cette période grandira pendant les 6 prochains mois."
        : "A turning point is beginning. What you plant during this period will grow over the next 6 months.";
    }
    return isFr
      ? "Ce qui couvait arrive à maturité. C'est le moment de lâcher ce qui ne fonctionne plus."
      : "What was brewing is reaching maturity. This is the moment to release what no longer works.";
  }

  if (cat === "zr") {
    const isPeak = phase.isPeakPeriod || (phase.markers as string[] | undefined)?.includes("Peak");
    const lotImpact: Record<string, string> = isFr ? {
      fortune: isPeak
        ? "Ce chapitre compte davantage — les circonstances extérieures s'amplifient. Importance et activité accrues, pas nécessairement facile."
        : "Tes circonstances matérielles et ton quotidien sont actifs. Ce qui se passe ici a du poids.",
      spirit: isPeak
        ? "Ce chapitre compte davantage — ta direction de vie s'intensifie. Période d'importance et d'activité accrues : ce que tu choisis ici laisse une trace."
        : "Ta direction de vie est active. Les choix que tu poses dans cette fenêtre orientent la suite.",
      eros: isPeak
        ? "Ce chapitre compte davantage — l'attachement et le désir s'intensifient. Ce qui se joue dans tes liens proches a plus de poids qu'il n'y paraît."
        : "L'attachement et le désir sont au premier plan. Tes relations profondes sont en mouvement.",
    } : {
      fortune: isPeak
        ? "This chapter counts for more — outside circumstances are amplified. Heightened importance and activity, not necessarily easy."
        : "Your material circumstances and daily life are active. What happens here carries weight.",
      spirit: isPeak
        ? "This chapter counts for more — your life direction is intensifying. A period of heightened importance: what you choose here leaves a mark."
        : "Your life direction is active. The choices you make in this window shape what comes next.",
      eros: isPeak
        ? "This chapter counts for more — attachment and desire are intensifying. What plays out in your close bonds carries more weight than it seems."
        : "Attachment and desire are front and center. Your deep relationships are in motion.",
    };
    return lotImpact[phase.lotType] || (isFr ? "Une fenêtre de timing significative est ouverte pour toi." : "A significant timing window is open for you.");
  }

  if (cat === "station") {
    return isFr
      ? "Une pause dans le rythme. Les thèmes de cette période s'intensifient — prenez le temps de les observer."
      : "A pause in the rhythm. The themes of this period are intensifying — take the time to observe them.";
  }

  return "";
}

// ─── Translate API label to reader-friendly words ───────

export function translateApiLabel(label: string | undefined, locale?: ContentLocale): string | null {
  if (!label) return null;
  const isFr = resolveLocale(locale) === "fr";
  let result = label;
  if (isFr) {
    // "Jupiter conjunction natal Mars" → "Jupiter activation Mars personnel"
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
  // English: de-jargon the raw label without translating planet names
  result = result
    .replace(/\bconjunction\b/gi, "activation")
    .replace(/\bconjunct\b/gi, "activation")
    .replace(/\bsquare\b/gi, "tension")
    .replace(/\bopposition\b/gi, "confrontation")
    .replace(/\btrine\b/gi, "flow")
    .replace(/\bsextile\b/gi, "opening")
    .replace(/\bnatal\b/gi, "personal")
    .replace(/\bSolar Eclipse\b/gi, "Fresh start")
    .replace(/\bLunar Eclipse\b/gi, "Culmination")
    .replace(/\bSR\b/, "restart")
    .replace(/\bSD\b/, "pause")
    .replace(/\bZR\b/, "Life cycle");
  return result;
}

// ─── Cycle Narrative ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCycleNarrative(phase: any, locale?: ContentLocale): string | null {
  const cycle = phase?.cycle;
  if (!cycle || !cycle.totalHits || cycle.totalHits <= 1) return null;
  const isFr = resolveLocale(locale) === "fr";

  const hitDescriptions: Record<number, string> = isFr ? {
    1: "Phase d'ouverture — le sujet apparaît dans ta vie.",
    2: "Phase de maturation — tu y reviens avec plus de recul.",
    3: "Phase de résolution — le sujet se clarifie et avance.",
  } : {
    1: "Opening phase — the theme appears in your life.",
    2: "Maturing phase — you return to it with more perspective.",
    3: "Resolution phase — the theme clarifies and moves forward.",
  };

  const hitText = cycle.totalHits <= 3
    ? hitDescriptions[cycle.hitNumber] || (isFr ? `Passage ${cycle.hitNumber}.` : `Pass ${cycle.hitNumber}.`)
    : (isFr
        ? `Passage ${cycle.hitNumber} sur ${cycle.totalHits} — le sujet se précise à chaque étape.`
        : `Pass ${cycle.hitNumber} of ${cycle.totalHits} — the theme sharpens at every step.`);

  return hitText;
}

// ─── Lifetime Narrative ─────────────────────────────────
// NOTE: The API does NOT provide lifetime occurrence counts.
// This function is kept for backward compat but currently unused
// since lifetimeNumber/lifetimeTotal are always undefined from API.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getLifetimeNarrative(phase: any, locale?: ContentLocale): string | null {
  const n = phase?.lifetimeNumber;
  const total = phase?.lifetimeTotal;
  if (!n || !total || total <= 1) return null;
  const isFr = resolveLocale(locale) === "fr";

  if (n === 1 && total > 1) return isFr
    ? "Première fois dans ta vie. Tu découvres un territoire entièrement nouveau."
    : "First time in your life. You're discovering entirely new territory.";
  if (n === total) return isFr
    ? "Dernière fois dans ta vie. C'est le moment d'aller au bout de ce que cette période t'apporte."
    : "Last time in your life. This is the moment to take everything this period brings you.";
  if (n === 2) return isFr
    ? "Deuxième fois que tu vis ça. Tu as déjà des repères — utilise-les."
    : "Second time you're living this. You already have reference points — use them.";
  return isFr
    ? `${n}e occurrence sur ${total} dans ta vie. Chaque passage approfondit ta compréhension.`
    : `Occurrence ${n} of ${total} in your lifetime. Each pass deepens your understanding.`;
}

// ─── Topics Narrative (from real API topics) ────────────

const HOUSE_HUMAN_FR: Record<number, string> = {
  1: "ta manière d'être", 2: "tes finances", 3: "tes échanges",
  4: "ton foyer", 5: "ta créativité", 6: "ton quotidien",
  7: "tes relations", 8: "tes transformations profondes", 9: "ton horizon",
  10: "ta carrière", 11: "ton réseau", 12: "ta vie intérieure",
};

const HOUSE_HUMAN_EN: Record<number, string> = {
  1: "your way of being", 2: "your finances", 3: "your exchanges",
  4: "your home", 5: "your creativity", 6: "your daily life",
  7: "your relationships", 8: "your deep transformations", 9: "your horizon",
  10: "your career", 11: "your network", 12: "your inner life",
};

export function getTopicsNarrative(
  topics: { house: number; topic: string; source: string }[] | undefined,
  context: TimeContext,
  locale?: ContentLocale
): string {
  if (!topics || topics.length === 0) return "";
  const isFr = resolveLocale(locale) === "fr";
  const dict = isFr ? HOUSE_HUMAN_FR : HOUSE_HUMAN_EN;

  const parts = topics.map(t => dict[t.house] || (isFr ? `ta vie` : `your life`));
  const unique = [...new Set(parts)];

  const joined = unique.length === 1
    ? unique[0]
    : unique.slice(0, -1).join(", ") + (isFr ? " et " : " and ") + unique[unique.length - 1];

  if (context === "current") {
    return isFr ? `Ce signal touche ${joined}.` : `This signal touches ${joined}.`;
  }
  if (context === "future") {
    return isFr ? `Ce signal va toucher ${joined}.` : `This signal will touch ${joined}.`;
  }
  return isFr ? `Ce signal a touché ${joined}.` : `This signal touched ${joined}.`;
}
