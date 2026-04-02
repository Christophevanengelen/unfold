/**
 * Matching Narratives — delineation-aware compatibility content.
 * Uses real API data (toctoc-year cross-referenced between 2 people)
 * to generate rich, actionable insights about shared timing windows.
 *
 * Based on the TocToc Delineation Guide:
 * - House topics map life areas
 * - Planet archetypes describe energy quality
 * - Relationship type shapes the tone and guidance
 */

import type { MonthData, ApiEvent } from "@/lib/momentum-api";
import { houseConfig, planetConfig, type HouseNumber, type PlanetKey } from "@/lib/domain-config";

// ─── Types ──────────────────────────────────────────────

export type RelationshipType = "partner" | "friend" | "family" | "colleague";

export interface MatchingWindow {
  title: string;
  dateRange: string;
  monthKey: string; // "YYYY-MM"
  daysLeft: number;
  status: "active" | "upcoming" | "past";
  tier: "SUBTLE" | "CLEAR" | "PEAK";
  tierColor: string;
  you: WindowPerson;
  them: WindowPerson;
  sharedTheme: string;
  insight: string;
  action: string;
  relationship: RelationshipType;
}

export interface WindowPerson {
  description: string;
  planet: PlanetKey;
  house?: number;
  category: string;
}

// ─── Constants ──────────────────────────────────────────

const MONTH_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const MONTH_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

// ─── Planet → PlanetKey mapping ─────────────────────────

function toPlanetKey(ev: ApiEvent): PlanetKey {
  const map: Record<string, PlanetKey> = {
    Pluto: "neptune", Neptune: "neptune", Uranus: "uranus",
    Saturn: "saturn", Jupiter: "jupiter", Mars: "mars",
    Venus: "venus", Mercury: "mercury", Sun: "sun", Moon: "moon",
    "North Node": "north-node", "South Node": "south-node",
  };
  if (ev.category === "eclipse") return ev.label?.includes("Solar") ? "solar-eclipse" : "lunar-eclipse";
  if (ev.category === "zr") return "jupiter";
  for (const [name, key] of Object.entries(map)) {
    if (ev.label?.includes(name)) return key;
  }
  return "sun";
}

// ─── House extraction from event label ──────────────────

const NATAL_HOUSE_HINTS: Record<string, number> = {
  Sun: 5, Moon: 4, Mercury: 3, Venus: 7, Mars: 1,
  Jupiter: 9, Saturn: 10, Uranus: 11, Neptune: 12,
  Ascendant: 1, MC: 10,
};

function guessHouse(ev: ApiEvent): number | undefined {
  if (ev.category === "zr") {
    const lotHouse: Record<string, number> = { fortune: 1, spirit: 10, eros: 7 };
    return lotHouse[ev.lotType ?? "fortune"];
  }
  // Try natal point from label: "Saturn opposition natal Sun" → Sun → H5
  const match = ev.label?.match(/natal\s+(\w+)/);
  if (match) return NATAL_HOUSE_HINTS[match[1]];
  return undefined;
}

// ─── Human descriptions per planet archetype ────────────

const PLANET_YOU: Record<string, Record<RelationshipType, string>> = {
  saturn: {
    partner: "Un besoin de solidifier ce qui compte entre vous",
    friend: "Une envie de structurer vos projets communs",
    family: "Les responsabilités familiales demandent votre attention",
    colleague: "Le moment de poser des bases solides au travail",
  },
  jupiter: {
    partner: "L'envie d'avancer ensemble, de voir grand",
    friend: "Les opportunités se multiplient dans votre cercle",
    family: "Un élan de générosité et d'expansion familiale",
    colleague: "Les portes s'ouvrent pour vos projets communs",
  },
  venus: {
    partner: "L'attraction et la douceur reviennent entre vous",
    friend: "L'harmonie dans vos échanges est naturelle",
    family: "Les liens affectifs se renforcent",
    colleague: "Les relations professionnelles s'adoucissent",
  },
  mars: {
    partner: "Une énergie forte — passion ou friction, selon comment vous la canalisez",
    friend: "L'élan d'agir ensemble est puissant",
    family: "Les tensions peuvent émerger — canalisez l'énergie",
    colleague: "L'impulsion de faire avancer les choses",
  },
  moon: {
    partner: "Les émotions sont à fleur de peau entre vous",
    friend: "Un besoin de connexion émotionnelle authentique",
    family: "Les dynamiques familiales profondes remontent",
    colleague: "L'intuition guide vos décisions communes",
  },
  sun: {
    partner: "Votre identité dans la relation est activée",
    friend: "Votre rôle dans l'amitié se clarifie",
    family: "Votre place dans la famille est en mouvement",
    colleague: "Votre visibilité professionnelle s'amplifie",
  },
  mercury: {
    partner: "Les conversations importantes sont favorisées",
    friend: "Les échanges d'idées sont amplifiés",
    family: "La communication familiale est au centre",
    colleague: "Les négociations et les projets avancent",
  },
  uranus: {
    partner: "L'inattendu entre dans votre relation — accueillez la surprise",
    friend: "Vos liens se réinventent",
    family: "Les schémas familiaux se brisent — libération en vue",
    colleague: "L'innovation et le changement sont au rendez-vous",
  },
  neptune: {
    partner: "Les frontières se dissolvent — intimité ou confusion",
    friend: "L'inspiration créative coule entre vous",
    family: "Les liens invisibles se manifestent",
    colleague: "La vision partagée se clarifie — ou se brouille",
  },
};

function getPersonDescription(ev: ApiEvent, rel: RelationshipType): string {
  const pk = toPlanetKey(ev);
  const key = pk === "solar-eclipse" || pk === "lunar-eclipse" ? "moon" : pk;
  return PLANET_YOU[key]?.[rel] ?? `Un signal actif touche votre vie`;
}

// ─── Shared theme based on overlapping houses ───────────

const HOUSE_SHARED_THEMES: Record<number, Record<RelationshipType, string>> = {
  1:  { partner: "Vos identités évoluent ensemble", friend: "Vous changez tous les deux", family: "Chacun redéfinit sa place", colleague: "Vos postures professionnelles bougent" },
  2:  { partner: "L'argent et les valeurs sont au centre", friend: "Vos ressources s'alignent", family: "Les finances familiales sont activées", colleague: "Les enjeux financiers convergent" },
  3:  { partner: "La communication est la clé ce mois-ci", friend: "Vos échanges s'intensifient", family: "Les conversations importantes arrivent", colleague: "Les projets de communication s'alignent" },
  4:  { partner: "Votre foyer partagé est en mouvement", friend: "Vos racines résonnent", family: "La maison familiale est au centre", colleague: "Les fondations de vos projets bougent" },
  5:  { partner: "Romance et créativité sont amplifiées", friend: "Le plaisir et la légèreté dominent", family: "Les enfants et la joie sont au premier plan", colleague: "La créativité professionnelle explose" },
  6:  { partner: "Vos routines quotidiennes se réorganisent ensemble", friend: "Le quotidien demande des ajustements", family: "Les habitudes familiales changent", colleague: "L'organisation du travail évolue" },
  7:  { partner: "Votre relation elle-même est activée — période charnière", friend: "L'équilibre de votre amitié est testé", family: "Les engagements familiaux sont en jeu", colleague: "Les partenariats professionnels sont au premier plan" },
  8:  { partner: "Une transformation profonde touche votre lien", friend: "Ce qui est caché entre vous remonte", family: "Les héritages et les non-dits émergent", colleague: "Les enjeux de pouvoir se clarifient" },
  9:  { partner: "Vos horizons s'élargissent ensemble", friend: "L'aventure et l'apprentissage vous rapprochent", family: "Les croyances familiales sont questionnées", colleague: "La vision stratégique s'aligne" },
  10: { partner: "Vos ambitions se croisent", friend: "Vos réputations s'influencent mutuellement", family: "Le statut familial est en mouvement", colleague: "Vos carrières s'alignent" },
  11: { partner: "Vos réseaux et projets communs sont activés", friend: "Votre cercle social est en effervescence", family: "Les alliances familiales se renforcent", colleague: "Les projets d'équipe prennent forme" },
  12: { partner: "Un temps de recul partagé — écoutez le silence ensemble", friend: "L'introspection vous rapproche", family: "Les dynamiques invisibles se révèlent", colleague: "Le travail en coulisses porte ses fruits" },
};

function getSharedTheme(houseA: number | undefined, houseB: number | undefined, rel: RelationshipType): string {
  const house = houseA ?? houseB ?? 7;
  return HOUSE_SHARED_THEMES[house]?.[rel] ?? "Vos rythmes s'alignent ce mois-ci";
}

// ─── Actionable guidance per relationship + tier ────────

const TIER_ACTIONS: Record<string, Record<RelationshipType, string>> = {
  PEAK: {
    partner: "Planifiez un moment fort ensemble. Cette fenêtre est rare — ne la laissez pas passer.",
    friend: "C'est le moment de faire quelque chose de mémorable ensemble.",
    family: "Réunissez-vous. Cette période peut transformer vos liens.",
    colleague: "Lancez le projet que vous repoussez. Le timing est optimal.",
  },
  CLEAR: {
    partner: "Ouvrez la conversation que vous repoussez. Le terrain est favorable.",
    friend: "Proposez une activité ensemble — l'énergie est là.",
    family: "Prenez le temps de vous appeler ou de vous voir.",
    colleague: "Alignez-vous sur les priorités — c'est le bon moment.",
  },
  SUBTLE: {
    partner: "Restez attentifs aux signaux subtils entre vous.",
    friend: "Un petit geste peut faire une grande différence.",
    family: "Les petites attentions comptent plus que d'habitude.",
    colleague: "Observez les dynamiques — un ajustement discret peut tout changer.",
  },
};

// ─── Insight generation (why this month matters for both) ─

function generateInsight(evA: ApiEvent, evB: ApiEvent, rel: RelationshipType): string {
  const catA = evA.category;
  const catB = evB.category;

  // Both have eclipses = major shared turning point
  if (catA === "eclipse" && catB === "eclipse") {
    return "Vous traversez un tournant en même temps. Ce qui change pour l'un résonne chez l'autre.";
  }
  // Both have ZR peaks = life rhythms converge
  if (catA === "zr" && catB === "zr") {
    return "Vos rythmes de vie convergent. Les grandes lignes de vos trajectoires s'alignent.";
  }
  // One has eclipse, other has transit = catalytic moment
  if ((catA === "eclipse" && catB === "transit") || (catA === "transit" && catB === "eclipse")) {
    return "Un tournant chez l'un accélère la transformation chez l'autre.";
  }
  // High scores = amplified window
  if (evA.score >= 3 && evB.score >= 3) {
    return "Deux signaux forts en même temps — cette fenêtre est exceptionnelle pour agir ensemble.";
  }
  if (evA.score >= 3 || evB.score >= 3) {
    return "Un moment important pour l'un crée une ouverture pour les deux.";
  }

  // Relationship-specific fallback
  const fallbacks: Record<RelationshipType, string> = {
    partner: "Vos rythmes individuels créent une fenêtre commune. Profitez-en.",
    friend: "L'énergie est là pour renforcer ce qui vous lie.",
    family: "Les circonstances vous rapprochent — même sans le chercher.",
    colleague: "Le timing professionnel est aligné entre vous.",
  };
  return fallbacks[rel];
}

// ─── Main: compare two timelines ────────────────────────

export function compareTimelines(
  monthsA: MonthData[],
  monthsB: MonthData[],
  relationship: RelationshipType,
  theirName: string,
): MatchingWindow[] {
  const windows: MatchingWindow[] = [];
  const today = new Date();

  for (const mA of monthsA) {
    if (!mA.topEvents?.length) continue;
    const mB = monthsB.find(m => m.month === mA.month);
    if (!mB?.topEvents?.length) continue;

    const topA = [...mA.topEvents].sort((a, b) => b.score - a.score)[0];
    const topB = [...mB.topEvents].sort((a, b) => b.score - a.score)[0];
    const maxScore = Math.max(topA.score, topB.score);

    const tier = maxScore >= 3 ? "PEAK" : maxScore >= 2 ? "CLEAR" : "SUBTLE";
    const tierColor = tier === "PEAK" ? "#D89EA0" : tier === "CLEAR" ? "#6BA89A" : "#8B7FC2";

    const [year, month] = mA.month.split("-").map(Number);
    const monthDate = new Date(year, month - 1, 15);
    const daysLeft = Math.max(0, Math.round((monthDate.getTime() - today.getTime()) / 86400000));

    const isCurrentMonth = monthDate.getMonth() === today.getMonth() && monthDate.getFullYear() === today.getFullYear();
    const isPast = monthDate < new Date(today.getFullYear(), today.getMonth(), 1);
    const status = isCurrentMonth ? "active" : isPast ? "past" : "upcoming";

    const houseA = guessHouse(topA);
    const houseB = guessHouse(topB);
    const planetA = toPlanetKey(topA);
    const planetB = toPlanetKey(topB);

    // Generate title based on shared energy
    const title = isCurrentMonth
      ? "Alignement actif"
      : tier === "PEAK"
        ? `Fenêtre forte — ${MONTH_FR[month - 1]}`
        : `Alignement ${MONTH_FR[month - 1]}`;

    windows.push({
      title,
      dateRange: `${MONTH_SHORT[month - 1]} ${year}`,
      monthKey: mA.month,
      daysLeft,
      status,
      tier,
      tierColor,
      you: {
        description: getPersonDescription(topA, relationship),
        planet: planetA,
        house: houseA,
        category: topA.category,
      },
      them: {
        description: getPersonDescription(topB, relationship),
        planet: planetB,
        house: houseB,
        category: topB.category,
      },
      sharedTheme: getSharedTheme(houseA, houseB, relationship),
      insight: generateInsight(topA, topB, relationship),
      action: TIER_ACTIONS[tier]?.[relationship] ?? "Restez attentifs aux signaux.",
      relationship,
    });
  }

  // Sort: active first, then upcoming by daysLeft, skip past unless few results
  const active = windows.filter(w => w.status === "active");
  const upcoming = windows.filter(w => w.status === "upcoming").sort((a, b) => a.daysLeft - b.daysLeft);
  const past = windows.filter(w => w.status === "past").sort((a, b) => b.daysLeft - a.daysLeft);

  const result = [...active, ...upcoming];
  // Add past only if we have fewer than 3 future windows
  if (result.length < 3) result.push(...past.slice(0, 3 - result.length));

  return result.slice(0, 6);
}
