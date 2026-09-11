/**
 * Qui prevenir, de quoi, et quand.
 *
 * Fonction pure : elle ne lit pas la base, n appelle rien, ne connait pas
 * l heure. On lui donne la reponse du moteur et une date, elle rend une liste.
 * C est ce qui permet de la mettre a l epreuve sur des annees entieres en une
 * seconde, plutot que d attendre qu une vraie periode s ouvre pour savoir si le
 * choix est bon.
 *
 * Ce que la mesure a montre, et qui a decide du reglage : en ne retenant que
 * les periodes de niveau 3 remarquables, l app se tairait pendant trois mois
 * d affilee. La regle ecrite au depart — une par semaine au maximum — protege
 * donc contre un probleme qui n existe pas. Le risque reel est le silence, pas
 * le harcelement. On descend au niveau 4 pour tenir un rythme d environ une
 * notification tous les dix jours par defaut. Mais le bon rythme n est pas le
 * meme pour tout le monde, et ce n est pas a nous d en decider : la cadence est
 * un reglage. Trois crans, du plus rare au plus dense, et le choix survit a une
 * reinstallation puisqu il vit a cote du jeton, pas dans le telephone.
 *
 * Rien ici n est collectif. L avis de debut de mois lui-meme ne part que si le
 * mois de la personne contient quelque chose, et dit combien : deux personnes
 * ouvrant l app le meme matin ne recoivent pas le meme message, et beaucoup
 * n en recoivent aucun. Une notification identique pour tout le monde serait un
 * envoi groupe deguise en attention.
 */

/** Une periode telle que le moteur la rend. */
/**
 * A quelle frequence cette personne veut etre prevenue.
 *
 *   essentiel — seulement les grands basculements. Environ 4 par an.
 *   normal    — plus les moments remarquables. Environ 25 par an. Defaut.
 *   tout      — toutes les periodes courtes. Environ 50 par an.
 */
/**
 * « aucune » coupe l envoi.
 *
 * L app permettait d ACTIVER les notifications et jamais de les arreter : une
 * fois la permission accordee, la ligne du reglage devenait inerte. iOS ne
 * permet pas de revoquer une permission depuis l app, mais rien n oblige a
 * ENVOYER. C est ce que « desactiver » veut dire pour la personne, et il fallait
 * le lui donner.
 */
export type Cadence = "aucune" | "essentiel" | "normal" | "tout";

export type PeriodeMoteur = {
  level: number;
  sign: string;
  ruler?: string;
  duration?: number;
  durationUnit?: string;
  startDate: string;
  endDate: string;
  subPeriods?: PeriodeMoteur[];
  isPeakPeriod?: boolean;
  isLoosingOfBond?: boolean;
  isCulmination?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Ce qui se passe ENTRE deux personnes
// ─────────────────────────────────────────────────────────────────────────────
//
// Jusqu ici l app ne parlait que de la vie de la personne seule. Or ce qui fait
// qu une connexion se garde, c est d etre accompagne dans le temps : voici ce
// qui se termine maintenant entre vous, voici le domaine que ca touche, et le
// conseil vous attend derriere le doigt.
//
// TOUT vient du moteur, rien n est recalcule ici :
//
//   - `comparaison.memesDomaines` dit QUELS domaines les deux travaillent.
//     C est la couche 3 du moteur, posee le 02/09/2026. On ne compare pas.
//   - `comparaison.silence` est le verdict du moteur sur la regle de silence de
//     REPORTING-REGLES : quand il vaut vrai, la carte se tait plutot que de
//     fabriquer une lecture. La notification se tait avec elle.
//   - les evenements de `rawData.events` portent QUAND, au jour pres.
//
// Mesure du 11/09/2026 sur un vrai appel a `connection-brief` (deux themes
// fixes, trois mois) : 3 periodes, 22 evenements, 22/22 avec `startDate` ET
// `endDate` au jour, 22/22 avec `houses`. En revanche `ActivePeriod.startDate`
// et `ActivePeriod.endDate` valent le PREMIER et le DERNIER jour du mois —
// 2026-09-01 et 2026-09-30 — donc ils ne datent rien ; ils bornent un mois.
// C est pour ca qu on date un moment commun par l evenement et non par la
// periode : croiser « quel domaine » (le moteur) et « quel jour » (le moteur)
// ne fabrique aucune donnee, alors qu annoncer un moment commun « le 1er du
// mois » en aurait fabrique une.

/**
 * Un evenement tel que le moteur le rend. Sous-ensemble de `RawEvent` de
 * lib/connection-brief-api.ts, reduit a ce dont la planification a besoin.
 */
export type EvenementMoteur = {
  score: number;
  category: string;
  startDate?: string | null;
  endDate?: string | null;
  /** Les domaines de vie touches. */
  houses?: number[];
  markers?: string[];
};

/** Le bloc d une des deux personnes, dans une periode commune. */
export type VuePersonne = {
  rawData?: { events?: EvenementMoteur[] };
};

/**
 * Un mois commun tel que `connection-brief` le rend. Sous-ensemble de
 * `ActivePeriod`. La compatibilite des deux formes est verifiee plus bas, a la
 * compilation : si le moteur change, ca casse ici et pas en production.
 */
export type PeriodeCommune = {
  monthKey: string;
  tier: "PEAK" | "CLEAR" | "SUBTLE";
  personAFocus: VuePersonne;
  personBFocus: VuePersonne;
  /** Absent = ancien cache, anterieur au 02/09/2026. On se tait. */
  comparaison?: { memesDomaines: number[]; silence: boolean };
};

/**
 * Ce que cette connexion-la a le droit d envoyer. Le reglage est par
 * connexion, pas global : on ne veut pas la meme chose de sa compagne et d un
 * collegue.
 *
 *   aucune     — cette connexion ne previent de rien.
 *   communs    — seulement les moments forts communs. Defaut.
 *   avec_autre — plus les bascules de leur cote.
 *   tout       — plus les mois simplement nets, et non seulement les pics.
 */
export type ReglageConnexion = "aucune" | "communs" | "avec_autre" | "tout";

export const REGLAGE_CONNEXION_DEFAUT: ReglageConnexion = "communs";

/** Une connexion gardee, avec ce que le moteur a rendu pour elle. */
export type ConnexionPlanifiable = {
  /** L identifiant qui ouvre SA fiche. Sans lui, on n envoie rien. */
  ref: string;
  periodes: PeriodeCommune[];
  reglage?: ReglageConnexion;
};

export type Notification = {
  /**
   * Identite stable de cette notification. C est elle qui rend l envoi
   * idempotent : le cron peut tourner cent fois, la personne ne recoit rien
   * deux fois. Elle ne doit donc dependre que du contenu, jamais de l heure a
   * laquelle on l a calculee.
   */
  cle: string;
  nature: "periode" | "mois" | "connexion";
  ecran: "timeline" | "monthly" | "compatibility";
  /**
   * La connexion visee. Obligatoire des que `ecran` vaut `compatibility` :
   * sans elle, lib/push-routes.ts ouvre la LISTE des connexions et la personne
   * doit chercher ce qu on vient de lui annoncer. Une notification qui ouvre
   * l accueil est une notification ratee.
   */
  ref?: string;
  /** Sujet de regroupement, pour ne pas empiler deux avis du meme genre. */
  regroupement: string;
  /** Ce qui sert a ecrire le texte, pas le texte lui-meme. */
  signe?: string;
  duree?: number;
  uniteDuree?: string;
  /** Pour l avis de debut de mois : combien de moments dans CE mois-la. */
  compte?: number;
  /**
   * Le domaine de vie concerne, numero de maison. Il vient du moteur, jamais
   * d un calcul a nous. C est lui qui transforme « il se passe quelque chose »
   * en une information dont on peut faire quelque chose.
   */
  domaine?: number;
  importance:
    | "bascule"
    | "sommet"
    | "mois"
    /** Un moment commun s ouvre. */
    | "commun"
    /** Un moment commun se termine : la transition a preparer a deux. */
    | "commun_fin"
    /** Une bascule chez l autre, hors domaine commun. */
    | "bascule_autre";
  /** Le jour ou la periode commence, en AAAA-MM-JJ. */
  jour: string;
};

const JOUR = 86_400_000;

/** Aplatit l arbre des periodes. */
function aplatir(periodes: PeriodeMoteur[], sortie: PeriodeMoteur[] = []): PeriodeMoteur[] {
  for (const p of periodes) {
    sortie.push(p);
    if (p.subPeriods?.length) aplatir(p.subPeriods, sortie);
  }
  return sortie;
}

/**
 * Choisit ce qu on annoncerait a cette personne le jour dit.
 *
 * `preavis` : on previent la veille du debut, pas le jour meme. Une periode
 * qu on apprend le matin ou elle commence, c est une information qu on subit ;
 * la veille, c est une information dont on peut faire quelque chose.
 */
export function planifier(
  releasing: { periods?: PeriodeMoteur[] } | null | undefined,
  aujourdHui: Date,
  options: {
    preavis?: number;
    cadence?: Cadence;
    /** Les connexions gardees. Voir planifierConnexions(). */
    connexions?: ConnexionPlanifiable[] | null;
  } = {},
): Notification[] {
  const preavis = options.preavis ?? 1;
  const cadence = options.cadence ?? "normal";
  const sorties: Notification[] = [];

  // Rien a envoyer : la personne a coupe.
  if (cadence === "aucune") return sorties;

  const toutes = releasing?.periods?.length ? aplatir(releasing.periods) : [];

  /** Ce qui merite d etre annonce, selon la cadence choisie. */
  const digneDInteret = (p: PeriodeMoteur) => {
    if (p.level !== 3 && p.level !== 4) return false;
    const remarquable = Boolean(p.isLoosingOfBond || p.isPeakPeriod || p.isCulmination);
    if (cadence === "tout") return true;
    if (cadence === "essentiel") return p.level === 3 && remarquable;
    return p.level === 3 || remarquable;
  };

  // ── Le debut du mois ───────────────────────────────────────────────────────
  // Personnel, pas collectif : on ne previent que si le mois de CETTE personne
  // contient reellement quelque chose, et on dit combien. Un mois vide ne
  // produit aucune notification — mieux vaut le silence qu un envoi groupe
  // deguise en attention.
  if (aujourdHui.getUTCDate() === 1) {
    const mois = aujourdHui.toISOString().slice(0, 7);
    const dansLeMois = toutes.filter(
      (p) => digneDInteret(p) && p.startDate.slice(0, 7) === mois,
    );
    if (dansLeMois.length > 0) {
      dansLeMois.sort((x, y) => x.startDate.localeCompare(y.startDate));
      sorties.push({
        cle: `mois:${mois}`,
        nature: "mois",
        ecran: "monthly",
        regroupement: "mois",
        signe: dansLeMois[0].sign,
        compte: dansLeMois.length,
        importance: "mois",
        jour: `${mois}-01`,
      });
    }
  }

  // ── Les periodes qui s ouvrent ─────────────────────────────────────────────
  {
    const cible = new Date(aujourdHui.getTime() + preavis * JOUR).toISOString().slice(0, 10);

    for (const p of toutes) {
      // Les niveaux 1 et 2 durent des annees : leur debut est rare et leur
      // annonce n aiderait personne a organiser sa semaine. Les niveaux 3 et 4
      // durent des jours ou des semaines, c est l echelle utile.
      if (!digneDInteret(p)) continue;
      if (p.startDate.slice(0, 10) !== cible) continue;

      sorties.push({
        cle: `zr${p.level}:${p.startDate.slice(0, 10)}:${p.sign}`,
        nature: "periode",
        ecran: "timeline",
        regroupement: "periode",
        signe: p.sign,
        duree: p.duration,
        uniteDuree: p.durationUnit,
        importance: p.isLoosingOfBond ? "bascule" : "sommet",
        jour: p.startDate.slice(0, 10),
      });
    }
  }

  // ── Ce qui se passe entre elle et les gens qu elle a gardes ────────────────
  // Meme journee, meme preavis, meme plafond d une notification : les
  // connexions entrent dans la MEME liste, elles ne s ajoutent pas a cote.
  // Deux notifications le meme matin, c est une de trop, qu elles parlent
  // d une vie ou de deux.
  sorties.push(...planifierConnexions(options.connexions, aujourdHui, { preavis }));

  // Si plusieurs choses tombent le meme jour, on n en envoie qu une : celle qui
  // compte le plus. A rang egal, la clef tranche — pour que la fonction rende
  // exactement la meme chose a chaque appel, quel que soit l ordre d arrivee.
  sorties.sort((a, b) => rang(b) - rang(a) || a.cle.localeCompare(b.cle));
  return sorties.slice(0, 1);
}

/**
 * Ce qu on annoncerait a cette personne, le jour dit, sur les gens qu elle a
 * gardes. Meme contrat que planifier() : aucune lecture de base, aucun appel,
 * aucune horloge. On lui donne ce que le moteur a rendu et une date.
 *
 * Elle ne retourne PAS une notification par connexion : elle retourne tous les
 * candidats, et c est planifier() qui n en garde qu un. Appelee seule, elle
 * sert au controle.
 */
export function planifierConnexions(
  connexions: ConnexionPlanifiable[] | null | undefined,
  aujourdHui: Date,
  options: { preavis?: number } = {},
): Notification[] {
  const preavis = options.preavis ?? 1;
  const cible = new Date(aujourdHui.getTime() + preavis * JOUR).toISOString().slice(0, 10);

  // Par clef : deux evenements du moteur peuvent ouvrir le meme domaine
  // commun le meme jour. C est un seul fait, donc une seule notification.
  const parClef = new Map<string, Notification>();

  for (const connexion of connexions ?? []) {
    // Pas d identifiant, pas de destination, donc pas de notification. Mieux
    // vaut se taire que deposer quelqu un sur la liste des connexions en lui
    // demandant de retrouver de quoi on parlait.
    if (typeof connexion?.ref !== "string" || connexion.ref.length === 0) continue;

    const reglage = connexion.reglage ?? REGLAGE_CONNEXION_DEFAUT;
    if (reglage === "aucune") continue;

    for (const periode of connexion.periodes ?? []) {
      const comparaison = periode?.comparaison;
      // Ancien cache : le moteur n a pas dit ce que les deux ont en commun.
      // On ne le devine pas.
      if (!comparaison) continue;
      // Le moteur a applique la regle de silence. On la respecte.
      if (comparaison.silence) continue;
      // Un mois « subtil » ne porte pas assez d accord pour qu on interrompe
      // qui que ce soit. Un mois « net » ne sort qu au cran le plus dense.
      if (periode.tier === "SUBTLE") continue;
      if (periode.tier === "CLEAR" && reglage !== "tout") continue;

      const communs = new Set(comparaison.memesDomaines ?? []);

      for (const cote of ["vous", "eux"] as const) {
        const vue = cote === "vous" ? periode.personAFocus : periode.personBFocus;
        for (const ev of vue?.rawData?.events ?? []) {
          const partage = (ev.houses ?? []).find((h) => communs.has(h));

          if (partage !== undefined) {
            // Un domaine que les deux travaillent : c est un moment COMMUN,
            // que le signal soit du cote de l une ou de l autre.
            if (ev.startDate?.slice(0, 10) === cible) {
              poser(parClef, connexion.ref, "commun", cible, partage);
            }
            if (ev.endDate?.slice(0, 10) === cible) {
              poser(parClef, connexion.ref, "commun_fin", cible, partage);
            }
            continue;
          }

          // Hors domaine commun, seule la vie de L AUTRE nous interesse ici :
          // la sienne lui est deja annoncee par planifier(), et l annoncer une
          // seconde fois sous l etiquette d une connexion serait un doublon.
          if (cote !== "eux" || reglage === "communs") continue;
          const domaine = ev.houses?.[0];
          if (ev.startDate?.slice(0, 10) === cible || ev.endDate?.slice(0, 10) === cible) {
            poser(parClef, connexion.ref, "bascule_autre", cible, domaine);
          }
        }
      }
    }
  }

  return [...parClef.values()];
}

function poser(
  parClef: Map<string, Notification>,
  ref: string,
  importance: "commun" | "commun_fin" | "bascule_autre",
  jour: string,
  domaine: number | undefined,
): void {
  // La clef ne depend que du contenu : c est ce qui rend l envoi idempotent.
  // Elle tient sous les 128 caracteres qu accepte /api/push/bascules.
  const cle = `cx:${ref.slice(0, 64)}:${importance}:${jour}:${domaine ?? "-"}`;
  if (parClef.has(cle)) return;
  parClef.set(cle, {
    cle,
    nature: "connexion",
    ecran: "compatibility",
    ref,
    // Un fil par connexion : deux connexions ne se recouvrent pas sur l ecran
    // verrouille, et une meme connexion n empile pas ses avis.
    regroupement: `connexion:${ref}`,
    domaine,
    importance,
    jour,
  });
}

/**
 * Ce qui passe devant quoi, quand plusieurs choses tombent le meme matin.
 *
 * La bascule personnelle reste en tete : c est le signal le plus rare du
 * produit, et c est la vie de la personne qui recoit. Vient ensuite ce qui se
 * TERMINE entre deux personnes — une fin se prepare, une ouverture attend. Une
 * bascule chez l autre ferme la marche : c est la vie de quelqu un d autre.
 */
const RANGS: Record<Notification["importance"], number> = {
  bascule: 6,
  commun_fin: 5,
  commun: 4,
  sommet: 3,
  bascule_autre: 2,
  mois: 1,
};

function rang(n: Notification): number {
  return RANGS[n.importance] ?? 0;
}

/**
 * Le plancher d espacement, en jours, selon la cadence. Meme en mode « tout »,
 * on n envoie pas deux matins de suite : deux notifications rapprochees se
 * devaluent l une l autre.
 */
export const ESPACEMENT_MINIMUM: Record<Cadence, number> = {
  aucune: Number.POSITIVE_INFINITY,
  essentiel: 20,
  normal: 6,
  tout: 2,
};

/**
 * Le meme plancher, par connexion. Il est plus large que celui d une vie
 * seule : quelqu un qui garde cinq connexions recevrait sinon cinq fois plus
 * de notifications qu avant, sans avoir rien change a son reglage. Le plancher
 * se compte par connexion, donc cinq connexions au cran par defaut tiennent
 * ensemble le rythme d une seule vie.
 */
export const ESPACEMENT_CONNEXION: Record<ReglageConnexion, number> = {
  aucune: Number.POSITIVE_INFINITY,
  communs: 21,
  avec_autre: 10,
  tout: 4,
};

// ─────────────────────────────────────────────────────────────────────────────
// Le garde-fou de compilation
// ─────────────────────────────────────────────────────────────────────────────
//
// `PeriodeCommune` est une COPIE reduite de `ActivePeriod`. Une copie derive :
// le jour ou le moteur renomme un champ, ce fichier continuerait de compiler
// et ne trouverait simplement plus rien a annoncer — une panne muette, notre
// premiere classe de bug.
//
// Cette ligne est erasee a l execution (import de TYPE, aucune dependance
// ajoutee : la fonction reste pure et le controle continue de la compiler
// seule). Elle ne sert qu a faire echouer `tsc` si les deux formes divergent.
import type { ActivePeriod } from "@/lib/connection-brief-api";
type MemeForme<T extends PeriodeCommune> = T;
export type _PeriodeCommuneSuitLeMoteur = MemeForme<ActivePeriod>;
