/**
 * Ce que le rapport de compatibilité montre, et d'où vient chaque chiffre.
 *
 * ─── LA SOURCE ──────────────────────────────────────────────────────────────
 *
 * `POST /api/match` chez Marie-Ange, relayé par `app/api/match/route.ts`.
 * Mesuré le 16/09/2026 sur deux naissances libres : réponse en 0,8 s, neuf
 * dimensions chiffrées et deux séries de dix axes. Le calcul de compatibilité
 * est porté de son application historique — ce n'est pas une heuristique
 * reconstruite pour l'occasion, elle l'écrit dans `match.md`.
 *
 * Ce module ne calcule rien. Il range, traduit et décide de ce qui mérite
 * d'être montré.
 *
 * ─── TROIS DÉCISIONS DE FOND ────────────────────────────────────────────────
 *
 * 1. **Les noms de planètes ne sortent pas d'ici.** Le moteur nomme ses dix
 *    axes `sun`, `moon`, `mercury`… Les règles du produit interdisent tout nom
 *    de technique à l'écran (`REPORTING-REGLES.md`), et pour une bonne raison :
 *    « Vénus 82 % » ne dit rien à personne. On rend donc une clef de
 *    traduction par axe — ce dont il s'agit, en langage courant.
 *
 * 2. **On ne dessine pas un radar à dix branches.** Mesure sur le couple de
 *    test : sept des dix axes valent zéro des deux côtés. Un radar serait une
 *    étoile à trois pointes dans un cadre à dix, c'est-à-dire un graphique
 *    décoratif qui ment sur sa densité. On garde les axes qui portent quelque
 *    chose, classés, et on dit combien sont restés muets.
 *
 * 3. **L'asymétrie est une donnée, pas un détail.** `attraction` rend `aToB` et
 *    `bToA` séparément (53 et 56 sur le couple de test), `gift` aussi. Aucun
 *    produit du marché n'écrit deux lectures pour un même lien — c'est la
 *    conclusion de la veille du 11/09, et la matière existe.
 */

/** Les dix axes du moteur, dans l'ordre où il les rend. */
export const AXES = [
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;

export type Axe = (typeof AXES)[number];

/**
 * Ce dont chaque axe parle, en clef de traduction.
 *
 * Ce ne sont pas des équivalences inventées : ce sont les domaines que ces
 * marqueurs portent depuis toujours, dits dans les mots de quelqu'un qui n'a
 * jamais ouvert un livre d'astrologie. Les libellés vivent dans le
 * dictionnaire, jamais ici.
 */
export const AXE_CLEF: Record<Axe, string> = {
  sun: "rapport.axe_affirmer",
  moon: "rapport.axe_rassurer",
  mercury: "rapport.axe_parler",
  venus: "rapport.axe_plaire",
  mars: "rapport.axe_agir",
  jupiter: "rapport.axe_ouvrir",
  saturn: "rapport.axe_tenir",
  uranus: "rapport.axe_bousculer",
  neptune: "rapport.axe_rever",
  pluto: "rapport.axe_transformer",
};

export type Palier = "fort" | "moyen" | "faible";

export interface Dimension {
  /** Clef de libellé, jamais un texte. */
  clef: string;
  valeur: number;
  palier: Palier;
  /** Vrai quand la dimension se lit dans les deux sens. */
  asymetrique?: boolean;
  versLui?: number;
  versElle?: number;
}

export interface AxePorteur {
  axe: Axe;
  clef: string;
  /** 0 à 100, ce que chacun apporte sur cet axe. */
  lui: number;
  elle: number;
}

export interface LectureMatch {
  /** Le chiffre de tête. */
  score: number;
  palier: Palier;
  /** Les trois dimensions que le moteur porte 1:1 depuis l'app historique. */
  socle: Dimension[];
  /** Les six autres, construites pour cette app. */
  nuances: Dimension[];
  /** Les axes qui portent réellement quelque chose, du plus fort au plus faible. */
  porteurs: AxePorteur[];
  /** Combien d'axes sont restés muets des deux côtés — on le dit, on ne le cache pas. */
  axesMuets: number;
  /** Ce que chacun apporte le plus : la clef de son axe dominant. */
  dominantLui: string | null;
  dominantElle: string | null;
  /** Qui prend l'ascendant, si le moteur se prononce nettement. */
  ascendant: { qui: "lui" | "elle"; confiance: number } | null;
}

interface BrutScore { score?: number; label?: string }
interface BrutMatch {
  compatibility?: BrutScore;
  resemblance?: BrutScore;
  balance?: BrutScore;
  attraction?: { aToB?: number; bToA?: number };
  boss?: { who?: string; confidence?: number };
  exclusive?: BrutScore;
  generalUnderstanding?: BrutScore;
  gift?: { score?: number };
  hugs?: { score?: number };
  compatibilityRadar?: { planet?: string; pointsperc?: number; pointsperc2?: number }[];
  person1?: { dominantPlanet?: { planet?: string } };
  person2?: { dominantPlanet?: { planet?: string } };
}

function palierDe(v: number): Palier {
  if (v >= 67) return "fort";
  if (v >= 34) return "moyen";
  return "faible";
}

function borne(v: unknown): number {
  const n = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function dimension(clef: string, v: unknown): Dimension {
  const valeur = borne(v);
  return { clef, valeur, palier: palierDe(valeur) };
}

/** « Venus » → `venus`, et rien si le moteur nomme un axe qu'on ne connaît pas. */
function axeDe(nom: unknown): Axe | null {
  const n = typeof nom === "string" ? nom.toLowerCase() : "";
  return (AXES as readonly string[]).includes(n) ? (n as Axe) : null;
}

/**
 * Range la réponse du moteur. Rend `null` si la compatibilité manque : sans
 * elle il n'y a pas de rapport, et un rapport sans son chiffre de tête serait
 * un rapport sur rien.
 */
export function lireMatch(brut: unknown): LectureMatch | null {
  if (!brut || typeof brut !== "object") return null;
  // Le moteur emballe sa charge dans `data`. Le relais la deballe deja, mais
  // une reponse gardee en cache avant cette correction porte encore
  // l enveloppe : on l accepte ici plutot que de vider le cache de tout le
  // monde pour un changement de forme.
  const enveloppe = brut as { data?: unknown };
  const noyau =
    enveloppe.data && typeof enveloppe.data === "object" && "compatibility" in enveloppe.data
      ? enveloppe.data
      : brut;
  const m = noyau as BrutMatch;
  if (typeof m.compatibility?.score !== "number") return null;

  const score = borne(m.compatibility.score);

  const socle: Dimension[] = [
    dimension("rapport.d_compatibilite", m.compatibility?.score),
    dimension("rapport.d_ressemblance", m.resemblance?.score),
    dimension("rapport.d_equilibre", m.balance?.score),
  ];

  // L'attraction se lit dans les deux sens : c'est la seule dimension dont
  // l'écart entre les deux vaut plus que la moyenne.
  const versElle = borne(m.attraction?.aToB);
  const versLui = borne(m.attraction?.bToA);
  const attraction: Dimension = {
    clef: "rapport.d_attraction",
    valeur: Math.round((versElle + versLui) / 2),
    palier: palierDe((versElle + versLui) / 2),
    asymetrique: Math.abs(versElle - versLui) >= 8,
    versLui,
    versElle,
  };

  const nuances: Dimension[] = [
    attraction,
    dimension("rapport.d_comprehension", m.generalUnderstanding?.score),
    dimension("rapport.d_engagement", m.exclusive?.score),
    dimension("rapport.d_generosite", m.gift?.score),
    dimension("rapport.d_chaleur", m.hugs?.score),
  ];

  const radar = Array.isArray(m.compatibilityRadar) ? m.compatibilityRadar : [];
  const tous: AxePorteur[] = [];
  let axesMuets = 0;
  for (const e of radar) {
    const axe = axeDe(e?.planet);
    if (!axe) continue;
    const lui = borne(e?.pointsperc);
    const elle = borne(e?.pointsperc2);
    if (lui === 0 && elle === 0) {
      axesMuets += 1;
      continue;
    }
    tous.push({ axe, clef: AXE_CLEF[axe], lui, elle });
  }
  tous.sort((a, b) => Math.max(b.lui, b.elle) - Math.max(a.lui, a.elle));

  const dominant = (p?: { dominantPlanet?: { planet?: string } }) => {
    const a = axeDe(p?.dominantPlanet?.planet);
    return a ? AXE_CLEF[a] : null;
  };

  // Le moteur se prononce toujours sur « qui mène ». En dessous de 60 % de
  // confiance, l'écart ne vaut pas qu'on le dise à deux personnes.
  const confiance = borne(m.boss?.confidence);
  const ascendant =
    m.boss?.who === "person1" || m.boss?.who === "person2"
      ? confiance >= 60
        ? { qui: (m.boss.who === "person1" ? "lui" : "elle") as "lui" | "elle", confiance }
        : null
      : null;

  return {
    score,
    palier: palierDe(score),
    socle,
    nuances,
    porteurs: tous,
    axesMuets,
    dominantLui: dominant(m.person1),
    dominantElle: dominant(m.person2),
    ascendant,
  };
}
