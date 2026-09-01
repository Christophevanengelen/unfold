/**
 * La semaine qui vient, calculee depuis les VRAIES phases.
 *
 * Remplace `mockForecast` de lib/mock-data.ts — sept jours inventes, les memes
 * pour tout le monde : lundi 78, mardi 82, mercredi 91 avec un pic. Le
 * commentaire de l ecran qui l affichait disait « uses real mockForecast data
 * for credibility ».
 *
 * C est l ecran de VENTE de l onboarding. Montrer de faux pics pour convaincre
 * quelqu un de payer n est pas une approximation d interface : c est une preuve
 * fabriquee. Et elle etait fabriquee au moment precis ou la personne decide de
 * faire confiance au produit.
 *
 * La fonction est pure — aucun acces reseau, aucune horloge implicite — donc
 * elle se verifie sur des annees de donnees en une seconde. C est ce qui permet
 * a scripts/verifier-prevision.mjs de la tenir.
 */

import type { MomentumPhase } from "@/types/momentum";

export interface JourPrevu {
  /** Cle du jour de la semaine, a traduire par l appelant. */
  jour: number; // 0 = dimanche, comme Date.getDay()
  /** 0-100. Ce que la personne verra comme hauteur de barre. */
  momentum: number;
  /** Un sommet local : plus haut que la veille ET que le lendemain. */
  estPic: boolean;
}

/** Sans phase active, la journee n est pas plate : elle est simplement ordinaire. */
const BASE = 62;

function jourISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Les phases actives ce jour-la. Une phase sans fin est consideree en cours. */
function actives(phases: MomentumPhase[], jour: string): MomentumPhase[] {
  return phases.filter((p) => {
    if (p.startDate > jour) return false;
    if (p.endDate && p.endDate < jour) return false;
    return true;
  });
}

/**
 * Sept jours a partir de `depuis`.
 *
 * Le score d une journee combine les intensites actives sans les additionner
 * betement : deux phases moyennes ne font pas une journee exceptionnelle. On
 * prend la plus forte, puis on ajoute une fraction decroissante des suivantes.
 */
export function previsionSemaine(
  phases: MomentumPhase[],
  depuis: Date,
  jours = 7,
): JourPrevu[] {
  const bruts: { jour: number; momentum: number }[] = [];

  for (let i = 0; i < jours; i++) {
    const d = new Date(depuis);
    d.setDate(d.getDate() + i);
    const actifs = actives(phases, jourISO(d))
      .map((p) => p.intensity)
      .sort((a, b) => b - a);

    let score = BASE;
    actifs.forEach((intensite, rang) => {
      // 1, 1/2, 1/4… : la deuxieme phase compte moitie moins que la premiere.
      score += (intensite - BASE) / Math.pow(2, rang);
    });

    bruts.push({
      jour: d.getDay(),
      momentum: Math.max(0, Math.min(100, Math.round(score))),
    });
  }

  // Un pic est un sommet LOCAL. Les extremites ne peuvent pas en etre : on ne
  // sait pas ce qu il y a juste avant ni juste apres la fenetre.
  return bruts.map((b, i) => ({
    ...b,
    estPic:
      i > 0 &&
      i < bruts.length - 1 &&
      b.momentum > bruts[i - 1].momentum &&
      b.momentum > bruts[i + 1].momentum,
  }));
}

/** Les trois domaines du produit, plus la synthese. */
export interface ScoresJour {
  overall: number;
  love: number;
  health: number;
  work: number;
}

/** Le meme calcul, restreint aux phases d un domaine. */
function scoreDomaine(phases: MomentumPhase[], jour: string, domaine?: string): number {
  const actifs = actives(phases, jour)
    .filter((p) => (domaine ? p.domain === domaine : true))
    .map((p) => p.intensity)
    .sort((a, b) => b - a);
  let score = BASE;
  actifs.forEach((intensite, rang) => {
    score += (intensite - BASE) / Math.pow(2, rang);
  });
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Les scores d une journee, par domaine.
 *
 * Remplace mockToday, qui portait un score global et trois scores par domaine
 * entierement inventes — les memes pour chaque personne. Ils etaient montres
 * pendant l onboarding, c est-a-dire au moment ou le produit promet justement
 * de lire le rythme PROPRE a quelqu un.
 */
export function scoresDuJour(phases: MomentumPhase[], jour: Date): ScoresJour {
  const iso = jour.toISOString().slice(0, 10);
  return {
    overall: scoreDomaine(phases, iso),
    love: scoreDomaine(phases, iso, "love"),
    health: scoreDomaine(phases, iso, "health"),
    work: scoreDomaine(phases, iso, "work"),
  };
}

/**
 * La phase la plus intense active ce jour-la, ou null.
 *
 * Sert a remplacer `mockToday.insight` — une phrase d analyse ecrite en dur,
 * identique pour tout le monde, affichee pendant l onboarding. Aucune formule
 * ne peut fabriquer une analyse honnete a sa place ; en revanche on peut dire
 * ce qui est VRAI : quelle periode est ouverte aujourd hui. Et quand il n y en
 * a aucune, on ne dit rien plutot que d inventer.
 */
export function phaseDominante(phases: MomentumPhase[], jour: Date): MomentumPhase | null {
  const iso = jour.toISOString().slice(0, 10);
  const actifs = actives(phases, iso).sort((a, b) => b.intensity - a.intensity);
  return actifs[0] ?? null;
}
