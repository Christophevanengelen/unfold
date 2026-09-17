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
}

export interface ResumeDuJour {
  /** Rien n est ouvert : c est une reponse, pas une panne. */
  aucune: boolean;
  /** Les periodes ouvertes, de la plus avancee a la plus recente. */
  ouvertes: PeriodeOuverte[];
  /**
   * Celle qui porte la journee. Choisie sur un critere unique et defendable :
   * l intensite que le moteur lui donne. A intensite egale, la plus courte —
   * une periode courte qui se superpose a une longue est ce qui distingue
   * aujourd hui d hier.
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
export function lireLeJour(phases: MomentumPhase[], maintenant: number): ResumeDuJour {
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
      const parIntensite = (b.phase.intensity ?? 0) - (a.phase.intensity ?? 0);
      if (parIntensite !== 0) return parIntensite;
      // A intensite egale, la plus courte : c est elle qui fait la difference
      // entre aujourd hui et le mois dernier.
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
