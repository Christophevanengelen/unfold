/**
 * Les chapitres d une vie.
 *
 * Le moteur decoupe une vie entiere en quelques tres longues periodes — quatre
 * pour une vie de soixante-dix ans. Chacune porte un domaine : le couple, la
 * carriere, le foyer. C est la lecture la plus large qu on puisse faire d une
 * vie, et jusqu au 17/09/2026 l app ne s en servait pas du tout.
 *
 * ── POURQUOI CA N ETAIT PAS BRANCHE ────────────────────────────────────────
 *
 * Le point d entree qui les calcule renvoie 4,12 Mo. Pas une faute de frappe :
 * quatre megaoctets, parce qu il descend l arbre complet jusqu au troisieme
 * niveau, soit des milliers de sous-periodes, pour une question qui n en
 * demande que quatre.
 *
 * Ce poids n est un probleme que sur le DERNIER lien, celui qui va jusqu au
 * telephone. Notre serveur, lui, l absorbe sans y penser. `app/api/chapitres`
 * appelle le moteur, jette `subPeriods`, et rend 6,5 Ko — six cent trente fois
 * moins. Le blocage n etait pas chez le moteur, il etait dans le fait de
 * vouloir tout faire passer par le telephone.
 *
 * ── CE QUI ARRIVE VRAIMENT (mesure du 17/09/2026) ──────────────────────────
 *
 * Quatre periodes de niveau 1, chacune avec `startDate`, `endDate`,
 * `duration` + `durationUnit`, et `housePlacement.house`. Le `signification`
 * qui accompagne la maison est en ANGLAIS (« Partnerships, relationships,
 * others ») : on ne l affiche jamais, on passe par `nomMaison()` qui parle les
 * dix langues du produit.
 *
 * ── LE PIEGE MESURE, ET IL EST GROS ────────────────────────────────────────
 *
 * Le dernier chapitre annonce `duration: 15 years` et des dates qui couvrent
 * QUINZE MOIS : 2045-09-29 → 2046-12-31T22:59:59. La seconde valeur n est pas
 * la fin du chapitre, c est l horizon de calcul du moteur. Afficher la
 * difference entre les deux dates aurait ecrit « 2045–2046, un an » sur un
 * chapitre qui en dure quinze.
 *
 * C est la cinquieme classe de bugs du depot sous un nouveau jour : le champ
 * est present, il n est pas nul, et il est faux. `duration` fait foi ; les
 * dates ne servent qu a placer le debut et a savoir ou on en est.
 */

import { nomMaison } from "@/lib/maisons-i18n";

/** Une periode de niveau 1, telle qu elle arrive une fois allegee. */
export interface PeriodeBrute {
  level?: number;
  startDate?: string;
  endDate?: string;
  duration?: number;
  durationUnit?: string;
  housePlacement?: { house?: number; signification?: string };
}

export interface ChapitreDeVie {
  /** Le domaine, deja dans la langue du lecteur. Jamais un nom de technique. */
  domaine: string;
  /** Le numero de maison, pour les jetons de couleur de l app. */
  maison: number;
  /** Debut, en millisecondes. */
  debut: number;
  /** Age atteint au debut du chapitre, en annees pleines. */
  ageDebut: number;
  /** Duree en annees, telle que le moteur la donne. */
  annees: number;
  /** Age a la fin. `ageDebut + annees`, pas une soustraction de dates. */
  ageFin: number;
  /** Vrai si aujourd hui tombe dedans. */
  encours: boolean;
  /**
   * Vrai quand la date de fin du moteur est son horizon de calcul et non la
   * vraie fin du chapitre. L ecran doit alors dire « a partir de », pas « a ».
   */
  finALHorizon: boolean;
}

const AN = 365.2425 * 86400000;

function ms(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

/**
 * L ecart au-dela duquel la date de fin ne raconte plus la meme histoire que
 * `duration`. Un an : les deux valeurs sont des annees entieres arrondies, et
 * un decalage d une annee pleine se rattrape, pas plus.
 */
const ECART_TOLERE_ANNEES = 1;

/**
 * Transforme les periodes brutes en chapitres lisibles.
 *
 * Renvoie un tableau vide plutot que de deviner : sans date de naissance, sans
 * maison ou sans duree, un chapitre n a rien a dire et il vaut mieux ne rien
 * afficher qu afficher « ? ».
 */
export function lireLesChapitres(
  periodes: PeriodeBrute[] | null | undefined,
  naissanceIso: string,
  maintenant: number,
  locale: string | null | undefined,
): ChapitreDeVie[] {
  const naissance = ms(naissanceIso);
  if (!naissance || !Array.isArray(periodes)) return [];

  const chapitres: ChapitreDeVie[] = [];

  for (const p of periodes) {
    if (p.level !== undefined && p.level !== 1) continue;

    const debut = ms(p.startDate);
    const maison = p.housePlacement?.house;
    if (debut === null || typeof maison !== "number") continue;

    // Le moteur compte en annees. S il comptait autrement, on ne saurait pas
    // convertir sans inventer — on passe la periode plutot que de supposer.
    if (typeof p.duration !== "number" || p.durationUnit !== "years") continue;
    const annees = p.duration;

    const domaine = nomMaison(maison, locale);
    if (!domaine) continue;

    const fin = ms(p.endDate);
    const anneesSelonDates = fin === null ? null : (fin - debut) / AN;
    const finALHorizon =
      anneesSelonDates !== null && Math.abs(anneesSelonDates - annees) > ECART_TOLERE_ANNEES;

    /**
     * L age au debut, jamais negatif.
     *
     * Le premier chapitre commence a la naissance, mais pas a la meme SECONDE
     * que celle qu on a en magasin. Le moteur rend `1977-09-26T23:00:00.000Z`
     * pour une naissance le 27/09 a minuit a Bruxelles : c est le meme instant,
     * ecrit en UTC. Notre date de naissance, elle, est lue en heure locale de
     * l appareil.
     *
     * Sur un telephone regle sur un autre fuseau, la soustraction passe de
     * quelques heures sous zero et `Math.floor` rend -1. L ecran affichait
     * alors « -1 a 26 ans ». Un age negatif est une absurdite, et il apparait
     * pour une raison qu aucune donnee ne trahit : le calcul est juste, c est
     * l arrondi qui bascule.
     *
     * On borne a zero plutot que d aligner les deux fuseaux : la duree fait
     * foi, et une vie commence a zero.
     */
    const ageDebut = Math.max(0, Math.floor((debut - naissance) / AN));

    // « En cours » se lit sur la duree annoncee, pas sur la date de fin : le
    // dernier chapitre est justement celui dont la date de fin ment.
    const finReelle = debut + annees * AN;
    const encours = maintenant >= debut && maintenant < finReelle;

    chapitres.push({
      domaine,
      maison,
      debut,
      ageDebut,
      annees,
      ageFin: ageDebut + annees,
      encours,
      finALHorizon,
    });
  }

  return chapitres.sort((a, b) => a.debut - b.debut);
}

/** Celui dans lequel on se trouve, s il existe. */
export function chapitreCourant(chapitres: ChapitreDeVie[]): ChapitreDeVie | null {
  return chapitres.find((c) => c.encours) ?? null;
}

/**
 * La part du chapitre en cours deja parcourue, de 0 a 1.
 *
 * Sert a placer un reperage sur la barre du chapitre. `null` quand aucun
 * chapitre n est ouvert — l ecran ne dessine alors pas de repere plutot que
 * d en poser un a zero, qui se lirait comme « ca commence aujourd hui ».
 */
export function avanceeDuChapitre(
  chapitre: ChapitreDeVie | null,
  maintenant: number,
): number | null {
  if (!chapitre || chapitre.annees <= 0) return null;
  const part = (maintenant - chapitre.debut) / (chapitre.annees * AN);
  if (part < 0 || part > 1) return null;
  return part;
}
