"use client";

/**
 * La regle d une duree — « long » par rapport a QUOI.
 *
 * ─── POURQUOI CETTE FORME ───────────────────────────────────────────────────
 *
 * Une fiche disait « 1 mois 15 jours » et s arretait la. Le lecteur n a aucun
 * moyen de savoir si c est beaucoup. Un chiffre seul n informe pas d une
 * duree : il faut une echelle.
 *
 * C est une sparkline au sens strict de Tufte : un graphique de la taille d un
 * paragraphe, sans cadre, sans graduation, sans decor — tout le trait porte de
 * l information. Elle DENSIFIE la fiche au lieu de l allonger, ce qui est
 * exactement ce qu il fallait ici : « il y a trop de texte et pas assez
 * d illustrations ».
 *
 * ─── CE QU ELLE MONTRE, ET POURQUOI C EST HONNETE ───────────────────────────
 *
 * Le segment plein, c est cette periode. Les deux reperes en filet, c est la
 * duree MEDIANE des autres periodes de la timeline, et la plus longue connue.
 *
 * On ne dit donc jamais « long » : on montre par rapport a quoi, et le lecteur
 * peut contredire le dessin. C est la definition d une illustration honnete —
 * l inverse d une jauge, qui dit « remplissage », donc performance, donc
 * promesse.
 *
 * ─── CE QU ELLE NE FAIT PAS ─────────────────────────────────────────────────
 *
 * Elle ne s affiche pas s il n y a pas de quoi comparer. Moins de quatre
 * periodes voisines, et la mediane ne veut rien dire : mieux vaut le chiffre
 * seul qu une echelle inventee.
 *
 * Aucun aleatoire, aucun degrade, aucune lueur. Un aplat, deux filets.
 */

import { motion, useReducedMotion } from "motion/react";

/** En dessous, une mediane ne veut rien dire. */
const VOISINES_MINIMUM = 4;

function mediane(valeurs: number[]): number {
  const t = [...valeurs].sort((a, b) => a - b);
  const m = Math.floor(t.length / 2);
  return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2;
}

export function RegleDeDuree({
  jours,
  voisines,
  accent,
  libelleMediane,
}: {
  /** La duree de cette periode, en jours. */
  jours: number;
  /** Les durees des autres periodes, en jours. */
  voisines: number[];
  accent: string;
  /** « mediane », dans la langue du lecteur. */
  libelleMediane: string;
}) {
  const fige = useReducedMotion();

  const dureeValide = Number.isFinite(jours) && jours > 0;
  const assezDeVoisines = voisines.length >= VOISINES_MINIMUM;
  if (!dureeValide) return null;
  if (!assezDeVoisines) return null;

  const med = mediane(voisines);
  const plusLongue = Math.max(...voisines, jours);
  if (!(plusLongue > 0)) return null;

  const pct = (v: number) => Math.max(0, Math.min(100, (v / plusLongue) * 100));
  const partCelleCi = pct(jours);
  const partMediane = pct(med);

  return (
    <div
      className="w-full"
      role="img"
      aria-label={`${Math.round(jours)} / ${Math.round(med)}`}
      data-regle-jours={Math.round(jours)}
      data-regle-mediane={Math.round(med)}
    >
      <div className="relative h-[10px] w-full">
        {/* L axe. Un filet, pas une gouttiere : une gouttiere se lit comme un
            reservoir a remplir, donc comme une performance. */}
        <div
          className="absolute left-0 top-1/2 h-px w-full"
          style={{ background: "var(--border-base)" }}
        />

        {/* Cette periode. */}
        <motion.div
          className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
          style={{ background: accent }}
          initial={fige ? { width: `${partCelleCi}%` } : { width: 0 }}
          animate={{ width: `${partCelleCi}%` }}
          transition={fige ? { duration: 0 } : { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Le repere de la mediane. C est lui qui donne l echelle. */}
        <div
          className="absolute top-0 h-full w-px"
          style={{ left: `${partMediane}%`, background: "var(--text-body)" }}
          data-regle-repere="mediane"
        />
      </div>

      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="text-[11px]" style={{ color: "var(--text-body)" }}>
          {libelleMediane}
        </span>
      </div>
    </div>
  );
}
