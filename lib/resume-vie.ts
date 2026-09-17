/**
 * Le resume d une vie entiere, tire des memes periodes.
 *
 * ─── D OU IL VIENT ──────────────────────────────────────────────────────────
 *
 * Christophe, le 17/09, juste apres avoir demande le resume du jour : « pareil
 * pour le resume important de toute une vie ».
 *
 * Meme principe, autre echelle. L appareil tient deja toutes les periodes d une
 * vie — mille huit cents environ sur le cas de test. Ce module les range en une
 * lecture d ensemble, sans aucun appel et sans rien inventer.
 *
 * ─── LA SEULE DIFFICULTE : NE PAS FABRIQUER DE SENS ─────────────────────────
 *
 * Une vie resumee en chiffres invite a la prophetie. On s y refuse :
 *
 *  — on compte, on ne juge pas. « Vingt-trois periodes ouvertes sur tes
 *    trente-quatre ans » est un fait ; « ta meilleure decennie » n en est pas
 *    un, et aucune donnee du moteur ne permet de l ecrire ;
 *  — on ne regarde JAMAIS vers l avant autrement qu en disant ce qui est deja
 *    date. Le produit est descriptif ;
 *  — les densites sont des comptes par annee, pas des notes.
 *
 * ─── LES CHAPITRES ──────────────────────────────────────────────────────────
 *
 * Le moteur marque certaines periodes d un niveau (`zrLevel`). Le niveau 1
 * porte les tres longues, celles qui font des chapitres de vie ; les autres se
 * posent dedans. Quand le niveau manque, on retombe sur la duree : au-dela de
 * deux ans, une periode se lit comme un chapitre.
 */

import type { MomentumPhase } from "@/types/momentum";

export interface Chapitre {
  phase: MomentumPhase;
  /** Age au debut, en annees pleines. */
  ageDebut: number;
  /** Age a la fin, ou `null` si elle n est pas encore fermee. */
  ageFin: number | null;
  /** Duree en annees, a une decimale. */
  annees: number;
  /** Vrai si le jour d aujourd hui tombe dedans. */
  encours: boolean;
}

export interface AnneeDeVie {
  /** L age, pas le millesime : une vie se lit en ages. */
  age: number;
  /** Combien de periodes etaient ouvertes cette annee-la. */
  periodes: number;
}

export interface ResumeDeVie {
  /** Rien a lire : moins de deux periodes datees. */
  vide: boolean;
  /** L age atteint aujourd hui. */
  age: number;
  /** Le nombre total de periodes datees dans la vie. */
  total: number;
  /** Les chapitres, du plus ancien au plus recent. */
  chapitres: Chapitre[];
  /** Celui dans lequel on se trouve, s il existe. */
  chapitreCourant: Chapitre | null;
  /**
   * Une case par annee vecue : de quoi dessiner la vie d un trait.
   *
   * ATTENTION : elle part de zero, et le moteur ne couvre pas toujours toute
   * une vie. `premiereDocumentee` dit ou commencent les donnees ; l ecran doit
   * s y caler, sinon il dessine quarante colonnes vides pour une seule barre et
   * laisse croire a quarante annees ou il ne s est rien passe.
   */
  annees: AnneeDeVie[];
  /** Le premier age ou le moteur a quelque chose a dire. `null` si aucun. */
  premiereDocumentee: number | null;
  /** L age le plus charge, et son compte. */
  pointHaut: AnneeDeVie | null;
  /** L age le plus calme parmi les annees vecues. */
  pointBas: AnneeDeVie | null;
  /** Les moments que le moteur marque lui-meme comme des bascules. */
  bascules: { phase: MomentumPhase; age: number }[];
}

const AN = 365.2425 * 86400000;

function date(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

/** Un chapitre : le moteur le dit, ou la duree le dit. */
function estChapitre(phase: MomentumPhase, annees: number): boolean {
  if (typeof phase.zrLevel === "number") return phase.zrLevel === 1;
  return annees >= 2;
}

export function lireLaVie(
  phases: MomentumPhase[],
  naissanceIso: string,
  maintenant: number,
): ResumeDeVie {
  const naissance = date(naissanceIso);
  const vide: ResumeDeVie = {
    vide: true, age: 0, total: 0, chapitres: [], chapitreCourant: null,
    annees: [], premiereDocumentee: null, pointHaut: null, pointBas: null, bascules: [],
  };
  if (naissance === null) return vide;

  const age = Math.floor((maintenant - naissance) / AN);
  if (age < 0 || age > 130) return vide;

  const chapitres: Chapitre[] = [];
  const bascules: { phase: MomentumPhase; age: number }[] = [];
  // Une case par annee vecue, aujourd hui compris.
  const compte = new Array(age + 1).fill(0) as number[];
  let total = 0;

  for (const phase of phases) {
    const debut = date(phase.startDate);
    if (debut === null || debut < naissance) continue;
    total += 1;

    const fin = date(phase.endDate);
    const ageDebut = Math.floor((debut - naissance) / AN);
    const ageFin = fin === null ? null : Math.floor((fin - naissance) / AN);

    // On compte la periode sur chaque annee qu elle traverse, bornee a la vie
    // deja vecue : une periode qui court jusqu en 2030 ne doit pas gonfler des
    // annees que personne n a encore vues.
    const dernier = Math.min(ageFin ?? age, age);
    for (let a = Math.max(0, ageDebut); a <= dernier; a += 1) compte[a] += 1;

    const annees = fin === null ? 0 : Math.round(((fin - debut) / AN) * 10) / 10;
    if (fin !== null && estChapitre(phase, annees)) {
      chapitres.push({
        phase, ageDebut, ageFin, annees,
        encours: debut <= maintenant && fin >= maintenant,
      });
    }

    // Les bascules que le moteur nomme lui-meme. On ne les deduit pas.
    if (phase.isLB === true || phase.isCulmination === true) {
      if (debut <= maintenant) bascules.push({ phase, age: ageDebut });
    }
  }

  if (total < 2) return vide;

  chapitres.sort((a, b) => a.ageDebut - b.ageDebut);
  bascules.sort((a, b) => a.age - b.age);

  const annees: AnneeDeVie[] = compte.map((periodes, a) => ({ age: a, periodes }));
  // On cherche les extremes sur les annees REELLEMENT vecues et documentees :
  // les premieres annees d une vie sont vides parce que le moteur ne les couvre
  // pas, pas parce qu il ne s y est rien passe.
  const vecues = annees.filter((x) => x.periodes > 0);

  return {
    vide: false,
    age,
    total,
    chapitres,
    chapitreCourant: chapitres.find((c) => c.encours) ?? null,
    annees,
    premiereDocumentee: vecues.length > 0 ? vecues[0].age : null,
    pointHaut: vecues.reduce<AnneeDeVie | null>((h, x) => (!h || x.periodes > h.periodes ? x : h), null),
    pointBas: vecues.reduce<AnneeDeVie | null>((b, x) => (!b || x.periodes < b.periodes ? x : b), null),
    bascules,
  };
}
