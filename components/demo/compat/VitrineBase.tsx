"use client";

/**
 * Ce qu on montre avant la premiere connexion.
 *
 * ─── L HISTORIQUE, PARCE QU IL EXPLIQUE LA FORME ────────────────────────────
 *
 * Premiere version (11/09, matin) : ce que contient la base de personnalites.
 * Christophe l a corrigee le jour meme, et il avait raison — cet ecran doit
 * vendre le match ENTRE DEUX PERSONNES, pas l encyclopedie qui sert a comparer.
 *
 * Deuxieme correction, le 17/09, et celle-ci vient d une phrase de Christophe
 * apres une livraison : « je vois rien qui bouge ». Il avait raison aussi. Le
 * rapport avait ete entierement refait la veille, mais cette vitrine — la
 * PREMIERE chose qu on voit en ouvrant l onglet Match sans connexion —
 * montrait encore l ancienne fiche. Quelqu un qui n a pas encore invite
 * personne n avait aucun moyen de voir le nouveau produit.
 *
 * La lecon depasse l ecran : quand on refait un ecran, il faut chercher TOUS
 * les endroits qui le representent. Une vitrine qui ment sur le produit est
 * pire qu une vitrine absente.
 *
 * ─── CE QU ELLE MONTRE ──────────────────────────────────────────────────────
 *
 * Le meme langage que le vrai rapport, en plus petit : l empreinte du couple,
 * le chiffre, la phrase qui le qualifie, et deux mesures. Clairement etiquete
 * comme un exemple. On vend en montrant, pas en decrivant.
 *
 * Les chiffres sont ceux d un couple reel mesure le 16/09 — pas des valeurs
 * flatteuses choisies pour la vitrine. Un exemple qui ment sur ce que le
 * produit rend d habitude prepare une deception a la premiere vraie fiche.
 */

import { motion } from "motion/react";
import { EyebrowLabel } from "@/components/demo/primitives";
import { t, type Locale } from "@/lib/i18n-demo";
import type { ParametresEmpreinte } from "@/lib/empreinte";
import { Empreinte } from "./rapport/Empreinte";
import { Piste } from "./rapport/visuels";

/** Le couple mesure le 16/09 sur le moteur de Marie-Ange. */
const EXEMPLE: ParametresEmpreinte = {
  score: 73,
  ressemblance: 82,
  equilibre: 82,
  attractionVersLui: 53,
  attractionVersElle: 56,
  porteurs: 3,
  graine: "sig-v1|1977-09-27T00:00|1982-09-02T02:15",
};

export function VitrineBase({ locale }: { locale: Locale }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-5"
    >
      <div
        className="grain lisere relative overflow-hidden rounded-3xl px-5 pb-6 pt-7 text-center"
        style={{ background: "var(--bg-secondary)" }}
      >
        <Empreinte
          parametres={EXEMPLE}
          taille={268}
          opacite={0.26}
          aura
          className="pointer-events-none absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2"
        />

        <div className="relative">
          <EyebrowLabel color="var(--text-body-subtle)">{t("match.exemple", locale)}</EyebrowLabel>

          <div className="mt-3 flex items-start justify-center">
            <span
              style={{
                fontFamily: "var(--font-titre)",
                fontWeight: 300,
                fontSize: 76,
                lineHeight: 0.86,
                letterSpacing: "-0.04em",
                color: "var(--text-heading)",
              }}
            >
              {EXEMPLE.score}
            </span>
            <span className="mt-1.5 ml-1 text-[11px] font-semibold text-text-body-subtle">/100</span>
          </div>

          <p
            className="mx-auto mt-3.5 max-w-[22ch] text-[19px] leading-tight"
            style={{
              fontFamily: "var(--font-titre)",
              fontWeight: 300,
              letterSpacing: "-0.015em",
              color: "var(--text-heading)",
              textWrap: "balance",
            }}
          >
            {t("rapport.palier_fort", locale)}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-left">
            <Piste
              titre={t("rapport.d_ressemblance", locale)}
              valeur={EXEMPLE.ressemblance}
              niveau={t("match.fort", locale)}
            />
            <Piste
              titre={t("rapport.d_equilibre", locale)}
              valeur={EXEMPLE.equilibre}
              niveau={t("match.fort", locale)}
              delai={0.06}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-[13px] font-medium leading-relaxed text-text-heading">
        {t("vitrine.puis", locale)}
      </p>
    </motion.section>
  );
}
