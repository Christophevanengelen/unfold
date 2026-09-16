"use client";

/**
 * L alphabet graphique du rapport de compatibilite.
 *
 * QUATRE FORMES, PAS UNE BIBLIOTHEQUE
 *
 * Le studio Manual a dessine le Year in Sport de Strava avec un vocabulaire
 * reduit — des panneaux, des lignes, des points, des cercles — decline partout.
 * C est le parti pris ici : un arc, une piste, une paire, un anneau. Rien
 * d autre n entre dans le rapport.
 *
 * On n installe aucune bibliotheque de graphiques pour cela. `recharts` pese
 * 148 ko compresses, `@observablehq/plot` 125 ko, pour des axes, des legendes
 * et des infobulles dont un rapport editorial n a pas l usage — et une
 * esthetique par defaut qu il faudrait combattre. React est deja le moteur de
 * rendu ; ces formes sont du SVG ecrit a la main, et elles ne pesent rien.
 *
 * DEUX REGLES DE COULEUR
 *
 *  - **Aucune couleur de jugement.** Pas de vert « compatible », pas de rouge
 *    « incompatible » : ce verdict n existe pas dans ce produit. L accent porte
 *    toutes les valeurs, et c est la longueur qui dit l intensite.
 *  - **L or est reserve a une seule chose** : ce que les deux ont en commun,
 *    sur la carte a garder. Une couleur qui sert partout ne signale plus rien.
 *
 * TROIS REGLES DE MOUVEMENT
 *
 *  - Le mouvement se declenche a l entree dans l ecran (`whileInView`), une
 *    seule fois. Un lecteur qui defile vite doit voir l animation commencee,
 *    pas rater le debut.
 *  - `prefers-reduced-motion` rend l etat final tout de suite. Le rapport reste
 *    entierement lisible immobile.
 *  - Aucun `backdrop-filter: blur` : c est le premier suspect quand une
 *    animation saccade dans la WebView de l app native.
 */

import { motion, useReducedMotion } from "motion/react";

/** Le mouvement de l app : un demarrage franc, une fin qui se pose. */
const COURBE = [0.16, 1, 0.3, 1] as const;

/* ─── L ARC ────────────────────────────────────────────────────────────────
 * Le chiffre de tete. Un arc ouvert plutot qu un anneau ferme : un anneau
 * complet se lit comme une part de camembert — « il manque 27 % » — alors
 * qu une jauge ouverte se lit comme un niveau.
 */
export function Arc({
  valeur,
  taille = 208,
  enfant,
  delai = 0,
}: {
  /** 0 a 100. */
  valeur: number;
  taille?: number;
  /** Ce qui vit au centre : le chiffre, un mot. */
  enfant?: React.ReactNode;
  delai?: number;
}) {
  const fige = useReducedMotion();
  const r = 84;
  const c = 110;
  // Un arc de 270°, ouvert en bas : de -225° a +45°.
  const debut = polaire(c, c, r, 135);
  const fin = polaire(c, c, r, 45);
  const piste = `M ${debut.x} ${debut.y} A ${r} ${r} 0 1 1 ${fin.x} ${fin.y}`;
  const part = Math.max(0, Math.min(100, valeur)) / 100;

  return (
    <div className="relative" style={{ width: taille, height: taille }}>
      <svg viewBox="0 0 220 220" width={taille} height={taille} aria-hidden="true">
        <path
          d={piste}
          fill="none"
          stroke="var(--surface-medium)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <motion.path
          d={piste}
          fill="none"
          stroke="var(--accent-purple)"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: fige ? part : 0 }}
          whileInView={{ pathLength: part }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: fige ? 0 : 1.5, delay: fige ? 0 : delai, ease: COURBE }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{enfant}</div>
    </div>
  );
}

function polaire(cx: number, cy: number, r: number, degres: number) {
  const a = ((degres - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/* ─── LA PISTE ─────────────────────────────────────────────────────────────
 * Une mesure posee sur une ligne de 0 a 100. Repetee a l identique, elle
 * forme la grille de petites vignettes : 96 participants sur telephone ont
 * compare des tendances plus vite en petites vignettes figees qu en animation
 * (Brehmer et al.). On anime pour l emotion, on fige pour la comparaison —
 * donc l animation reste courte et l etat final est stable.
 */
export function Piste({
  titre,
  aide,
  valeur,
  niveau,
  delai = 0,
}: {
  titre: string;
  aide?: string;
  valeur: number;
  /** Le mot qui qualifie, deja traduit. */
  niveau: string;
  delai?: number;
}) {
  const fige = useReducedMotion();
  const v = Math.max(0, Math.min(100, valeur));
  return (
    <div className="min-w-0">
      {/* Le titre passe a la ligne plutot que de se tronquer. Mesure du 16/09
          sur iPhone 13, deux colonnes : « Ce qui se ressemble » devenait « Ce
          qui se resse… ». Un libelle coupe n est pas un libelle — et il le
          restera dans les dix langues, dont trois sont plus longues que le
          francais. */}
      <div className="flex items-start justify-between gap-1.5">
        <span className="text-[13px] font-semibold leading-tight text-text-heading">{titre}</span>
        <span
          className="shrink-0 text-[11px] font-semibold leading-tight tabular-nums text-text-body-subtle"
          aria-hidden="true"
        >
          {v}
        </span>
      </div>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`${titre} : ${niveau}`}
        style={{ background: "var(--surface-medium)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--accent-purple)" }}
          initial={{ width: fige ? `${v}%` : 0 }}
          whileInView={{ width: `${v}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: fige ? 0 : 0.8, delay: fige ? 0 : delai, ease: COURBE }}
        />
      </div>
      {aide ? <p className="mt-1 text-[11px] leading-snug text-text-body-subtle">{aide}</p> : null}
    </div>
  );
}

/* ─── LA PAIRE ─────────────────────────────────────────────────────────────
 * Deux barres qui partent d un axe central, en sens opposes. C est ce qui
 * remplace le radar a dix branches : l ordre des axes autour d un cercle
 * change radicalement la silhouette a donnees identiques, et les lignes qui
 * relient des categories non ordonnees ne veulent rien dire (Observable,
 * Scott Logic). Une paire de barres se lit sans ambiguite : qui pese le plus,
 * de combien.
 */
export function Paire({
  titre,
  aide,
  gauche,
  droite,
  delai = 0,
  etiquetteGauche,
  etiquetteDroite,
}: {
  titre: string;
  aide?: string;
  gauche: number;
  droite: number;
  delai?: number;
  etiquetteGauche: string;
  etiquetteDroite: string;
}) {
  const fige = useReducedMotion();
  const g = Math.max(0, Math.min(100, gauche));
  const d = Math.max(0, Math.min(100, droite));
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[13px] font-semibold text-text-heading">{titre}</span>
      </div>
      <div
        className="mt-1.5 flex items-center gap-1"
        role="img"
        aria-label={`${titre} — ${etiquetteGauche} ${g}, ${etiquetteDroite} ${d}`}
      >
        <div
          className="flex h-2 flex-1 justify-end overflow-hidden rounded-l-full"
          style={{ background: "var(--surface-medium)" }}
        >
          <motion.div
            className="h-full rounded-l-full"
            style={{ background: "var(--accent-purple)" }}
            initial={{ width: fige ? `${g}%` : 0 }}
            whileInView={{ width: `${g}%` }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: fige ? 0 : 0.7, delay: fige ? 0 : delai, ease: COURBE }}
          />
        </div>
        <span className="h-3 w-px shrink-0" style={{ background: "var(--border-base)" }} />
        <div
          className="flex h-2 flex-1 overflow-hidden rounded-r-full"
          style={{ background: "var(--surface-medium)" }}
        >
          <motion.div
            className="h-full rounded-r-full"
            style={{ background: "var(--accent-purple)", opacity: 0.55 }}
            initial={{ width: fige ? `${d}%` : 0 }}
            whileInView={{ width: `${d}%` }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: fige ? 0 : 0.7, delay: fige ? 0 : delai, ease: COURBE }}
          />
        </div>
      </div>
      {aide ? <p className="mt-1 text-[11px] leading-snug text-text-body-subtle">{aide}</p> : null}
    </div>
  );
}

/* ─── L ANNEAU ─────────────────────────────────────────────────────────────
 * La petite pastille d une personne. Une lettre, un anneau, rien de plus :
 * deux avatars cote a cote doivent se distinguer d un coup d oeil sans
 * ressembler a des visages qu on n a pas.
 */
export function Anneau({
  lettre,
  taille = 40,
  doux = false,
}: {
  lettre: string;
  taille?: number;
  /** La seconde personne : meme forme, moins d encre. */
  doux?: boolean;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: taille,
        height: taille,
        fontSize: taille * 0.4,
        background: doux ? "var(--surface-medium)" : "var(--bg-brand)",
        color: doux ? "var(--text-heading)" : "var(--text-on-brand)",
      }}
      aria-hidden="true"
    >
      {lettre.slice(0, 1).toUpperCase()}
    </span>
  );
}

/* ─── LA SECTION ───────────────────────────────────────────────────────────
 * Le rythme du rapport : chaque partie entre par le bas, une fois. C est ce
 * qui donne l elan narratif d une revelation carte par carte sans imposer un
 * carrousel — le defilement reste natif, et personne n a a apprendre un geste.
 */
export function Section({
  children,
  delai = 0,
  className = "",
}: {
  children: React.ReactNode;
  delai?: number;
  className?: string;
}) {
  const fige = useReducedMotion();
  return (
    <motion.section
      className={className}
      initial={fige ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: fige ? 0 : 0.55, delay: fige ? 0 : delai, ease: COURBE }}
    >
      {children}
    </motion.section>
  );
}
