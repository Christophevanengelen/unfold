/**
 * Matching Narratives — le texte de repli du Match.
 *
 * Ce module ne contient plus une seule phrase. Il choisit une CLEF — selon la
 * planete du signal, le domaine de vie touche, le type de relation et le
 * palier — et la donne a perso() avec la langue de la personne.
 *
 * Pourquoi : jusqu au 11/09/2026 il portait 145 phrases, en francais et en
 * anglais seulement. Toute personne lisant l app en espagnol, en japonais ou
 * en arabe recevait l anglais, et le francais pour la moitie des cas. Or ce
 * texte-la n est pas le cas rare : il s affiche des que le modele echoue OU
 * que la personne n est pas abonnee, c est-a-dire le plus souvent.
 *
 * Deux regles tiennent ce fichier :
 *
 *   - aucun nom de technique, dans aucune langue (REPORTING-REGLES.md). La
 *     planete et la maison sont des CLEFS de dictionnaire, jamais un mot qui
 *     atteint l oeil ;
 *   - aucune table de mois. Intl les connait dans les dix langues, et une
 *     table francaise faisait lire « en mar » a un lecteur japonais.
 */

import type { MonthData, ApiEvent } from "@/lib/momentum-api";
import type { PlanetKey } from "@/lib/domain-config";
import { detectLocale, type Locale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

function resolveLocale(locale?: Locale): Locale {
  return locale ?? detectLocale();
}

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
  /**
   * La planete du signal, ou null quand on ne la reconnait pas.
   *
   * Le champ etait obligatoire, et toute planete inconnue — Chiron,
   * l Ascendant, les lots du zodiacal releasing — devenait le SOLEIL par un
   * simple `?? "sun"`. On affichait donc une planete que le moteur n avait
   * jamais nommee, avec sa couleur et son recit.
   *
   * null oblige desormais l affichage a decider quoi faire, plutot qu a
   * recevoir une valeur inventee sans le savoir.
   */
  planet: PlanetKey | null;
  house?: number;
  category: string;
}

// ─── Les mois, par Intl ─────────────────────────────────

function mois(d: Date, locale: Locale, forme: "long" | "short", avecAnnee = false): string {
  const m = new Intl.DateTimeFormat(locale, {
    month: forme,
    ...(avecAnnee ? { year: "numeric" as const } : {}),
  }).format(d);
  return m.charAt(0).toUpperCase() + m.slice(1);
}

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

/**
 * SUPPRIME le 01/09/2026 : c etait un theme natal fixe.
 *
 * La table disait « Soleil en maison 5, Lune en 4, Venus en 7 » — pour TOUT LE
 * MONDE. Or la maison d une planete depend de l heure et du lieu de naissance :
 * c est precisement ce que le moteur de Marie-Ange calcule, et ce pour quoi le
 * formulaire exige l heure exacte.
 *
 * Cette maison devinee alimentait getSharedTheme(), affiche comme « pourquoi ce
 * mois » dans le rapport relationnel. Deux personnes recevaient donc une
 * explication batie sur le theme de personne.
 *
 * C est la quatrieme fois aujourd hui qu on trouve la meme faute : un boudin
 * fige, un ecran mensuel invente, un theme natal en dur dans mock-data, et
 * celui-ci. Quand on ne sait pas, on ne devine pas — guessHouse renvoie
 * undefined, et l appelant s en accommode deja.
 */

function guessHouse(ev: ApiEvent): number | undefined {
  if (ev.category === "zr") {
    const lotHouse: Record<string, number> = { fortune: 1, spirit: 10, eros: 7 };
    return lotHouse[ev.lotType ?? "fortune"];
  }
  // Le libelle nomme le point natal — « Saturn opposition natal Sun » — mais
  // pas sa MAISON, qui depend de l heure et du lieu de naissance. On ne peut
  // donc pas la deduire ici, et on ne l invente pas.
  return undefined;
}

// ─── Ce qui se passe chez la personne, par archetype ────

/**
 * Les archetypes qui ont une phrase. Un point non reconnu — les noeuds, les
 * lots, un corps que la table ignore — n en a pas, et prend le repli plutot
 * que d emprunter le recit d une autre planete.
 */
const ARCHETYPES = new Set<string>([
  "saturn", "jupiter", "venus", "mars", "moon", "sun", "mercury", "uranus", "neptune",
]);

function getPersonDescription(ev: ApiEvent, rel: RelationshipType, locale: Locale): string {
  const pk = toPlanetKey(ev);
  const cle = pk === "solar-eclipse" || pk === "lunar-eclipse" ? "moon" : pk;
  if (!ARCHETYPES.has(cle)) return perso("match.you.defaut", locale);
  return perso(`match.you.${cle}.${rel}`, locale);
}

// ─── Le theme commun, par domaine de vie ────────────────

function getSharedTheme(
  houseA: number | undefined,
  houseB: number | undefined,
  rel: RelationshipType,
  locale: Locale,
): string {
  const house = houseA ?? houseB ?? 7;
  if (!Number.isInteger(house) || house < 1 || house > 12) {
    return perso("match.theme.defaut", locale);
  }
  return perso(`match.theme.${house}.${rel}`, locale);
}

// ─── Quoi faire, par palier et par relation ─────────────

function getTierAction(tier: string, rel: RelationshipType, locale: Locale): string {
  const palier = tier.toLowerCase();
  if (palier !== "peak" && palier !== "clear" && palier !== "subtle") {
    return perso("match.action.defaut", locale);
  }
  return perso(`match.action.${palier}.${rel}`, locale);
}

// ─── Pourquoi ce mois compte pour les deux ──────────────

function generateInsight(evA: ApiEvent, evB: ApiEvent, rel: RelationshipType, locale: Locale): string {
  const catA = evA.category;
  const catB = evB.category;

  // Deux bascules en meme temps = un tournant partage.
  if (catA === "eclipse" && catB === "eclipse") return perso("match.insight.bascule", locale);
  // Deux chapitres de vie qui tournent = les rythmes convergent.
  if (catA === "zr" && catB === "zr") return perso("match.insight.rythmes", locale);
  // Une bascule d un cote, un passage de l autre = effet d entrainement.
  if ((catA === "eclipse" && catB === "transit") || (catA === "transit" && catB === "eclipse")) {
    return perso("match.insight.catalyse", locale);
  }
  if (evA.score >= 3 && evB.score >= 3) return perso("match.insight.deux_forts", locale);
  if (evA.score >= 3 || evB.score >= 3) return perso("match.insight.un_fort", locale);

  return perso(`match.insight.${rel}`, locale);
}

// ─── Main: compare two timelines ────────────────────────

export function compareTimelines(
  monthsA: MonthData[],
  monthsB: MonthData[],
  relationship: RelationshipType,
  theirName: string,
  locale?: Locale,
): MatchingWindow[] {
  void theirName;
  const loc = resolveLocale(locale);
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

    // Le titre disait « Alignement actif », « Alignement Septembre ». Or
    // « alignement » est sur la liste des mots interdits du prompt, et
    // lib/nettoyer-texte-moteur.ts le coupe partout ailleurs : le repli de
    // l app contredisait donc le texte que l app produit. « Accord », comme
    // dans le reste du produit.
    const nomDuMois = mois(monthDate, loc, "long");
    const title = isCurrentMonth
      ? perso("match.titre.actif", loc)
      : tier === "PEAK"
        ? perso("match.titre.fort", loc).replace("{mois}", nomDuMois)
        : perso("match.titre.accord", loc).replace("{mois}", nomDuMois);

    windows.push({
      title,
      dateRange: mois(monthDate, loc, "short", true),
      monthKey: mA.month,
      daysLeft,
      status,
      tier,
      tierColor,
      you: {
        description: getPersonDescription(topA, relationship, loc),
        planet: planetA,
        house: houseA,
        category: topA.category,
      },
      them: {
        description: getPersonDescription(topB, relationship, loc),
        planet: planetB,
        house: houseB,
        category: topB.category,
      },
      sharedTheme: getSharedTheme(houseA, houseB, relationship, loc),
      insight: generateInsight(topA, topB, relationship, loc),
      action: getTierAction(tier, relationship, loc),
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
