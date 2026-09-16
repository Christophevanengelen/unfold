"use client";

/**
 * L ouverture du rapport : une image, un chiffre, une phrase.
 *
 * ─── POURQUOI UNE OUVERTURE PLEIN CADRE ─────────────────────────────────────
 *
 * Christophe, le 16/09 : « je veux vraiment du wow effect ». La version
 * precedente ouvrait sur un arc de cercle correct et sage, pose dans le flux
 * comme n importe quelle carte. Un rapport qu on veut memorable commence par un
 * plan large : rien d autre a l ecran que ce dont il parle.
 *
 * ─── LES QUATRE COUCHES ─────────────────────────────────────────────────────
 *
 * 1. Un fond en degrade radial, dont la TEINTE vient du score (voir
 *    `lib/empreinte.ts`). Deux couples differents n ouvrent pas sur la meme
 *    couleur, et personne n a besoin qu on le lui explique.
 * 2. L empreinte du couple, grande, qui se dessine en deux temps.
 * 3. Le chiffre, qui monte pendant que la figure se trace.
 * 4. La phrase qui le qualifie — car un chiffre seul ne veut rien dire, et
 *    c est precisement le reproche fait a tous les scores de compatibilite du
 *    marche.
 *
 * ─── LA HAUTEUR, EN PIXELS ──────────────────────────────────────────────────
 *
 * Jamais d unite `vh` : sur mobile la barre du navigateur s escamote, le
 * viewport change en cours de defilement, et une section en `vh` saute. On
 * mesure `window.innerHeight` au montage et au redimensionnement. C est la
 * regle que The Pudding a tiree de ses propres recits defilants.
 *
 * ─── CE QU ON NE FAIT PAS ───────────────────────────────────────────────────
 *
 * Aucun `backdrop-filter: blur` : lags documentes dans la WebView de l app
 * native. La profondeur vient des degrades et de l opacite, pas d un flou.
 */

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { franchir } from "@/lib/haptique";
import type { ParametresEmpreinte } from "@/lib/empreinte";
import { construireEmpreinte } from "@/lib/empreinte";
import { Empreinte } from "./Empreinte";
import { ENTREE, FONDU } from "@/lib/ressorts";

export function Heros({
  parametres,
  palier,
  aide,
  eyebrow,
  nomMoi,
  nomAutre,
  enfantBas,
}: {
  parametres: ParametresEmpreinte;
  /** Deja traduit : la phrase qui qualifie le chiffre. */
  palier: string;
  aide: string;
  eyebrow: string;
  nomMoi: string;
  nomAutre: string;
  /** Le retour sur l estimation, quand il y en a un. */
  enfantBas?: React.ReactNode;
}) {
  const fige = useReducedMotion();
  const teinte = construireEmpreinte(parametres).teinte;

  /**
   * L haptique au moment ou le chiffre se pose.
   *
   * Elle ne decore pas : l animation MONTRE, la vibration CONFIRME, et les deux
   * doivent tomber sur la meme image. Le chiffre se pose a 0,42 s avec un
   * ressort de 0,55 s : l impulsion arrive donc a 0,72 s, quand il est en place.
   * Une vibration desynchronisee de l image se ressent comme un defaut, jamais
   * comme une intention.
   */
  useEffect(() => {
    if (fige) return;
    const t = window.setTimeout(() => franchir(), 720);
    return () => window.clearTimeout(t);
  }, [fige]);

  // Mesure du viewport, en pixels, au montage et au redimensionnement.
  // `null` tant qu on ne sait pas : on rend alors une hauteur minimale plutot
  // qu une hauteur fausse qui sauterait ensuite.
  const [hauteur, setHauteur] = useState<number | null>(null);
  useEffect(() => {
    const mesurer = () => setHauteur(Math.max(520, Math.round(window.innerHeight * 0.86)));
    mesurer();
    window.addEventListener("resize", mesurer);
    return () => window.removeEventListener("resize", mesurer);
  }, []);

  return (
    <section
      className="grain relative flex w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{
        minHeight: hauteur ?? 560,
        /**
         * Un degrade a maillage. Il n en existe pas en CSS natif : on
         * l approche avec quatre foyers radiaux superposes sur un aplat.
         *
         * Trois reglages ne sont pas negociables, et chacun se voit :
         *
         *  - `in oklch` dans CHAQUE degrade. Sans lui l interpolation passe par
         *    du gris au milieu du fondu : c est le detail qui separe un
         *    maillage cher d un maillage sale.
         *  - Un fondu a 55-60 %. En dessous de 45 % on voit les cercles ;
         *    au-dessus de 75 % tout s aplatit.
         *  - Quatre foyers, pas huit. Au-dela de cinq ca devient boueux sans
         *    rien gagner en richesse.
         *
         * Les teintes tournent autour de celle du couple, par petits ecarts :
         * un systeme generatif se tient par ses contraintes. Et le fond est
         * PEINT UNE FOIS — jamais anime, parce que le navigateur repeindrait
         * toute la surface a chaque image.
         */
        background: `
          radial-gradient(58% 42% at 24% 18% in oklch, oklch(46% 0.13 ${teinte - 16} / 0.55) 0%, transparent 58%),
          radial-gradient(64% 46% at 78% 26% in oklch, oklch(42% 0.11 ${teinte + 22} / 0.48) 0%, transparent 58%),
          radial-gradient(70% 52% at 50% 6% in oklch, oklch(52% 0.14 ${teinte} / 0.40) 0%, transparent 60%),
          radial-gradient(90% 60% at 50% 96% in oklch, oklch(30% 0.06 ${teinte + 8} / 0.34) 0%, transparent 62%),
          var(--bg-primary)
        `,
      }}
    >
      <Empreinte
        parametres={parametres}
        // Mesure du 16/09 sur iPhone 13 : a 520 px sur un ecran de 390, on ne
        // voyait que la bande centrale de la figure — elle se lisait comme du
        // grillage horizontal, pas comme une signature. A 400 px elle tient
        // entiere dans la largeur, et le fondu radial fait le reste.
        taille={400}
        opacite={0.38}
        aura
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      <div className="relative flex flex-col items-center">
        <motion.p
          className="text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: "var(--text-body-subtle)" }}
          initial={fige ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTREE, delay: 0.1 }}
        >
          {eyebrow}
        </motion.p>

        <motion.p
          className="mt-2 text-[15px]"
          style={{ fontFamily: "var(--font-titre)", color: "var(--text-heading)" }}
          initial={fige ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTREE, delay: 0.18 }}
        >
          {nomMoi} <span style={{ opacity: 0.45 }}>&</span> {nomAutre}
        </motion.p>

        {/* LE SCORE NE COMPTE PAS DE 0 A SA VALEUR. Trois raisons, dans cet
            ordre d importance :

            1. Un score de compatibilite n est pas un cumul. Compter depuis zero
               raconte une accumulation qui n existe pas — et pendant une
               seconde et demie, l ecran affiche des chiffres FAUX sur le lien
               entre deux personnes.
            2. Ni Goodly ni Uniform Rounded n ont de chiffres tabulaires : chez
               Goodly Light le « 1 » fait 727 unites contre 1335 pour le « 0 ».
               Un compteur y sauterait lateralement a chaque chiffre, et
               `font-variant-numeric: tabular-nums` n y peut rien puisque la
               fonctionnalite n existe pas dans la police.
            3. Le compteur qui monte est devenu le motif le plus repandu des
               pages generees, et il fait l objet d une plainte publique au W3C
               parce qu il reste hors de portee du reglage « reduire les
               animations » chez plusieurs grands sites.

            Le mouvement va donc a la FIGURE, qui se dessine derriere ; le
            chiffre, lui, se pose. Le mouvement pour la proportion, la
            typographie pour la precision.

            `text-box-trim` supprime la demi-interligne fantome au-dessus et
            sous le glyphe : le chiffre se cale enfin sur sa hauteur de
            capitale. Les navigateurs qui l ignorent perdent un ou deux pixels,
            rien de plus. */}
        <motion.div
          className="mt-7 flex items-start"
          initial={fige ? false : { opacity: 0, scale: 0.94, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ ...ENTREE, delay: 0.42 }}
        >
          <span
            style={{
              fontFamily: "var(--font-titre)",
              fontWeight: 300,
              fontSize: 132,
              lineHeight: 0.84,
              letterSpacing: "-0.045em",
              color: "var(--text-heading)",
              textBoxTrim: "trim-both",
              textBoxEdge: "cap alphabetic",
            } as React.CSSProperties}
          >
            {parametres.score}
          </span>
          <span
            className="mt-2 ml-1.5 text-[13px] font-semibold"
            style={{ color: "var(--text-body-subtle)" }}
          >
            /100
          </span>
        </motion.div>

        <motion.h2
          className="mt-6 max-w-[20ch] text-[25px] leading-[1.18]"
          style={{
            fontFamily: "var(--font-titre)",
            fontWeight: 300,
            letterSpacing: "-0.015em",
            color: "var(--text-heading)",
            textWrap: "balance",
          }}
          initial={fige ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ENTREE, delay: 0.62 }}
        >
          {palier}
        </motion.h2>

        <motion.p
          className="mt-3 max-w-[30ch] text-[12px] leading-snug"
          style={{ color: "var(--text-body-subtle)" }}
          initial={fige ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...FONDU, delay: 0.82 }}
        >
          {aide}
        </motion.p>

        {enfantBas ? (
          <motion.div
            initial={fige ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ENTREE, delay: 0.95 }}
          >
            {enfantBas}
          </motion.div>
        ) : null}
      </div>

      {/* L invite a defiler. Elle ne dit pas « defilez » : un trait qui descend
          suffit, et il disparait des qu on a commence. */}
      <motion.span
        className="absolute bottom-6 h-7 w-px"
        style={{ background: "linear-gradient(to bottom, transparent, var(--text-body-subtle))" }}
        aria-hidden="true"
        initial={fige ? false : { opacity: 0 }}
        animate={fige ? { opacity: 0.5 } : { opacity: [0, 0.6, 0] }}
        transition={fige ? undefined : { duration: 2.6, repeat: Infinity, delay: 1.6, ease: "easeInOut" }}
      />
    </section>
  );
}
