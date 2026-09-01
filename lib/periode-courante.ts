/**
 * Quelle periode compte, a un instant donne.
 *
 * La question parait triviale et ne l est pas. Plusieurs periodes se
 * chevauchent EN PERMANENCE : une periode de vingt ans, une de deux ans, un
 * transit de six mois, une eclipse de trois jours peuvent toutes contenir
 * aujourd hui. Il y a environ deux mille periodes sur une vie.
 *
 * Le code choisissait jusqu ici la premiere du tableau qui contenait la date —
 * c est-a-dire, en pratique, une au hasard. Sur la timeline complete ça ne se
 * voyait pas, puisque tout est affiche. Sur un widget de cinquante points, ou
 * dans une notification, LE CHOIX EST LE PRODUIT.
 *
 * La regle, dans cet ordre :
 *
 *   1. On ecarte ce qui dure plus de trois ans. Une periode de vingt ans est
 *      un decor, pas une nouvelle : elle ne dira jamais rien de nouveau un
 *      matin donne.
 *   2. On garde la plus intense (`score`, de 1 a 4, donne par le moteur).
 *   3. A intensite egale, celle qui se termine le plus tot — parce que ce qui
 *      se termine bientot est ce sur quoi on peut encore agir.
 */

import type { MomentumPhase } from "@/types/momentum";

/** Au-dela, une periode est un decor et non un evenement. */
const DUREE_MAXIMALE_JOURS = 3 * 365;

const JOUR = 86_400_000;

function dureeEnJours(p: MomentumPhase): number {
  if (!p.endDate) return Number.POSITIVE_INFINITY;
  const d = new Date(p.startDate).getTime();
  const f = new Date(p.endDate).getTime();
  if (!Number.isFinite(d) || !Number.isFinite(f)) return Number.POSITIVE_INFINITY;
  return Math.max(0, (f - d) / JOUR);
}

/** Les periodes qui meritent d etre annoncees ou affichees. */
export function digneDAffichage(p: MomentumPhase): boolean {
  return dureeEnJours(p) <= DUREE_MAXIMALE_JOURS;
}

/**
 * La periode en cours a la date donnee, ou null.
 * `jour` au format AAAA-MM-JJ.
 */
export function periodeCourante(
  phases: MomentumPhase[],
  jour: string,
): MomentumPhase | null {
  const candidates = phases.filter(
    (p) =>
      digneDAffichage(p) &&
      p.startDate?.slice(0, 10) <= jour &&
      (!p.endDate || p.endDate.slice(0, 10) >= jour),
  );
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    // La plus intense d abord.
    const sa = a.score ?? 0;
    const sb = b.score ?? 0;
    if (sa !== sb) return sb - sa;
    // Puis celle qui se termine le plus tot : c est celle sur laquelle il
    // reste quelque chose a faire.
    return (a.endDate ?? "9999").localeCompare(b.endDate ?? "9999");
  });
  return candidates[0];
}

/** La prochaine periode a s ouvrir apres la date donnee, ou null. */
export function periodeSuivante(
  phases: MomentumPhase[],
  jour: string,
): MomentumPhase | null {
  const a_venir = phases
    .filter((p) => digneDAffichage(p) && p.startDate?.slice(0, 10) > jour)
    .sort((a, b) => {
      // La plus proche d abord ; a date egale, la plus intense.
      const c = a.startDate.localeCompare(b.startDate);
      if (c !== 0) return c;
      return (b.score ?? 0) - (a.score ?? 0);
    });
  return a_venir[0] ?? null;
}

/**
 * Les bascules a venir : chaque debut et chaque fin de periode digne
 * d interet, dans les `jours` prochains jours.
 *
 * C est ce que l app envoie au serveur une seule fois, pour que le cron n ait
 * plus jamais a rappeler le moteur. Les dates ne changent pas ; les
 * recalculer chaque jour pour chaque personne etait une depense pure.
 */
export function bascules(
  phases: MomentumPhase[],
  depuis: string,
  jours = 400,
): { jour: string; sens: "entree" | "sortie"; score: number; cle: string }[] {
  const limite = new Date(new Date(depuis).getTime() + jours * JOUR)
    .toISOString()
    .slice(0, 10);
  const sortie: { jour: string; sens: "entree" | "sortie"; score: number; cle: string }[] = [];

  for (const p of phases) {
    if (!digneDAffichage(p)) continue;
    const score = p.score ?? 1;

    const debut = p.startDate?.slice(0, 10);
    if (debut && debut > depuis && debut <= limite) {
      sortie.push({ jour: debut, sens: "entree", score, cle: `e:${debut}:${p.id}` });
    }
    const fin = p.endDate?.slice(0, 10);
    if (fin && fin > depuis && fin <= limite) {
      sortie.push({ jour: fin, sens: "sortie", score, cle: `s:${fin}:${p.id}` });
    }
  }

  sortie.sort((a, b) => a.jour.localeCompare(b.jour) || b.score - a.score);
  return sortie;
}
