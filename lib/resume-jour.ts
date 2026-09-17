/**
 * Le resume du jour, tire des periodes actives.
 *
 * ─── D OU IL VIENT ──────────────────────────────────────────────────────────
 *
 * Christophe, le 17/09 : « pour le daily briefing, sers-toi des boudins actifs
 * pour en faire un resume important en une seule communication ».
 *
 * Jusqu ici la boite recevait DEUX messages par jour, tous deux ecrits par un
 * modele a partir des trois signaux les plus forts du moment. Deux defauts :
 *
 *  — deux messages pour une seule journee, c est deja une corvee ;
 *  — le modele ecrivait a partir de signaux BRUTS, alors que l appareil tient
 *    deja la lecture complete : toutes les periodes, leurs dates, leur domaine,
 *    leur qualite. On payait un appel pour redire moins bien ce qu on savait.
 *
 * Ce module ne fait AUCUN appel. Il lit ce qui est deja la et le range.
 *
 * ─── CE QU IL NE FAIT PAS ───────────────────────────────────────────────────
 *
 * Il n invente rien et ne predit rien. Chaque chiffre qu il rend se deduit des
 * dates du moteur : combien de periodes sont ouvertes, depuis quand, pour
 * combien de temps encore. Aucune valeur n est estimee, aucune moyenne n est
 * presentee comme une mesure.
 *
 * Quand il n y a rien, il le dit — `aucune: true`. Le silence est une reponse
 * du produit, pas une panne.
 */

import type { MomentumPhase } from "@/types/momentum";

const AN = 365.2425 * 86400000;

/**
 * Lit la rarete d une periode, et l age qu on avait la fois d avant.
 *
 * `allPeriods` porte toutes les occurrences d une vie avec leur rang : la
 * precedente donne une date, et la naissance donne un age. « La derniere fois,
 * tu avais 27 ans » est un fait, pas une interpretation.
 */
function lireRarete(phase: MomentumPhase, naissance: number | null): Rarete | null {
  const numero = phase.lifetimeNumber;
  const total = phase.lifetimeTotal;
  if (typeof numero !== "number" || typeof total !== "number" || total < 1) return null;

  let ageDerniereFois: number | null = null;
  if (naissance !== null && numero > 1 && Array.isArray(phase.allPeriods)) {
    const avant = phase.allPeriods.find((p) => p.lifetimeNumber === numero - 1);
    const quand = avant ? new Date(avant.date).getTime() : NaN;
    if (!Number.isNaN(quand) && quand > naissance) {
      ageDerniereFois = Math.floor((quand - naissance) / AN);
    }
  }

  return { numero, total, unique: total === 1, ageDerniereFois };
}

/**
 * La raretE d une periode dans une vie entiere.
 *
 * ─── POURQUOI C EST LE FAIT LE PLUS IMPORTANT DE CET ECRAN ──────────────────
 *
 * Christophe, le 17/09, devant la premiere version : « je me mets a la place du
 * user, je trouve pas ca super ». Il avait raison, et la cause etait nette :
 * la carte affichait « 1 periode ouverte, 1 domaine touche ». C est de la
 * METADONNEE. Personne ne veut lire le compte de ses propres periodes.
 *
 * Or le moteur envoie, sur 70 boudins sur 77, de quoi dire tout autre chose :
 * `lifetimeNumber` et `lifetimeTotal` — la N-ieme fois sur M dans TOUTE une
 * vie. Quand M vaut 1, la chose n arrive qu une fois et ne reviendra pas.
 *
 * « Ca n arrivera qu une fois dans ta vie » n est ni une prediction ni une
 * flatterie : c est un fait de calendrier, verifiable, et c est exactement ce
 * qu une personne a envie de lire. On avait la donnee depuis le debut, on la
 * transportait jusqu a l ecran, et on affichait un compte a la place.
 */
export interface Rarete {
  /** La N-ieme fois. */
  numero: number;
  /** Sur combien de fois dans une vie entiere. */
  total: number;
  /** Vrai quand ca n arrive qu une fois. Le fait le plus fort de l ecran. */
  unique: boolean;
  /** L age qu on avait la fois precedente, quand le moteur le permet. */
  ageDerniereFois: number | null;
}

/** Une periode ouverte aujourd hui, avec ou en est. */
export interface PeriodeOuverte {
  phase: MomentumPhase;
  /** 0 a 100 : la part deja parcourue. `null` si la fin n est pas connue. */
  avancement: number | null;
  /** Jours ecoules depuis le debut. */
  depuis: number;
  /** Jours restants, ou `null` si la fin n est pas connue. */
  restants: number | null;
  /** Le moteur n a pas donne de bornes nettes : on affichera le mois. */
  approximee: boolean;
  /** Sa rarete dans une vie, quand le moteur la donne. */
  rarete: Rarete | null;
}

export interface ResumeDuJour {
  /** Rien n est ouvert : c est une reponse, pas une panne. */
  aucune: boolean;
  /** Les periodes ouvertes, de la plus avancee a la plus recente. */
  ouvertes: PeriodeOuverte[];
  /**
   * Celle qui porte la journee.
   *
   * LE CRITERE A CHANGE le 17/09. C etait l intensite ; c est maintenant la
   * RARETE d abord, l intensite ensuite. Une periode intense qui revient cinq
   * fois dans une vie est moins digne d etre racontee qu une periode moyenne
   * qui n arrive qu une fois — parce que la seconde, on ne la reverra pas.
   */
  principale: PeriodeOuverte | null;
  /** Ce qui s ouvre dans les trente jours. */
  bientot: { phase: MomentumPhase; dans: number }[];
  /** Ce qui se ferme dans les trente jours. */
  seTermine: PeriodeOuverte[];
  /** Le nombre de domaines distincts touches aujourd hui. */
  domaines: number;
}

const JOUR = 86400000;
/** L horizon de ce qui « arrive » ou « se termine ». Un mois se pressent. */
const HORIZON_JOURS = 30;

function enJours(a: number, b: number): number {
  return Math.round((a - b) / JOUR);
}

function date(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * Range les periodes autour d un jour donne.
 *
 * `maintenant` est un parametre et non `Date.now()` : une fonction pure se
 * teste, et un resume qui change d une milliseconde a l autre ne se teste pas.
 */
export function lireLeJour(
  phases: MomentumPhase[],
  maintenant: number,
  /** La naissance, pour dire l age qu on avait la fois precedente. */
  naissanceIso?: string | null,
): ResumeDuJour {
  const naissance = naissanceIso ? new Date(naissanceIso).getTime() : NaN;
  const ne = Number.isNaN(naissance) ? null : naissance;
  const ouvertes: PeriodeOuverte[] = [];
  const bientot: { phase: MomentumPhase; dans: number }[] = [];

  for (const phase of phases) {
    const debut = date(phase.startDate);
    if (debut === null) continue;
    const fin = date(phase.endDate);

    if (debut <= maintenant && (fin === null || fin >= maintenant)) {
      const depuis = enJours(maintenant, debut);
      const restants = fin === null ? null : enJours(fin, maintenant);
      const total = fin === null ? null : enJours(fin, debut);
      ouvertes.push({
        phase,
        depuis,
        restants,
        // Une periode d un seul jour n a pas d avancement : elle EST.
        avancement: total && total > 0 ? Math.max(0, Math.min(100, (depuis / total) * 100)) : null,
        approximee: phase.datesApproximees === true,
        rarete: lireRarete(phase, ne),
      });
      continue;
    }

    if (debut > maintenant) {
      const dans = enJours(debut, maintenant);
      if (dans <= HORIZON_JOURS) bientot.push({ phase, dans });
    }
  }

  // Le tri de lecture : la plus avancee d abord. On lit ce qui dure depuis
  // longtemps comme un fond, et ce qui vient de s ouvrir comme une nouvelle.
  ouvertes.sort((a, b) => b.depuis - a.depuis);
  bientot.sort((a, b) => a.dans - b.dans);

  const principale =
    [...ouvertes].sort((a, b) => {
      // 1. La rarete d abord. Un total de 1 passe devant tout le reste.
      const rareteA = a.rarete?.total ?? 99;
      const rareteB = b.rarete?.total ?? 99;
      if (rareteA !== rareteB) return rareteA - rareteB;
      // 2. Puis l intensite que le moteur donne.
      const parIntensite = (b.phase.intensity ?? 0) - (a.phase.intensity ?? 0);
      if (parIntensite !== 0) return parIntensite;
      // 3. Enfin la plus courte : c est elle qui distingue aujourd hui d hier.
      return (a.restants ?? Infinity) - (b.restants ?? Infinity);
    })[0] ?? null;

  return {
    aucune: ouvertes.length === 0,
    ouvertes,
    principale,
    bientot,
    seTermine: ouvertes.filter((o) => o.restants !== null && o.restants <= HORIZON_JOURS),
    domaines: new Set(ouvertes.map((o) => o.phase.domain)).size,
  };
}
