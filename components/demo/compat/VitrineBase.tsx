"use client";

/**
 * Ce qu on montre avant la premiere connexion.
 *
 * Premiere version (11/09, matin) : ce que contient la base de personnalites.
 * Christophe l a corrigee le jour meme, et il a raison — cet ecran doit vendre
 * le match ENTRE DEUX PERSONNES, pas l encyclopedie qui sert a comparer. La
 * base a sa place dans Comparer, pas ici.
 *
 * Il montre donc la fiche elle-meme, sur un exemple clairement etiquete comme
 * tel : le chiffre du mois, les deux axes separes, les deux lectures. On vend
 * en montrant, pas en decrivant.
 */

import { motion } from "motion/react";
import { t, type Locale } from "@/lib/i18n-demo";
import { FICHE_EXEMPLE } from "@/lib/score-match";
import { FicheMatch } from "./FicheMatch";

export function VitrineBase({ locale }: { locale: Locale }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-5"
    >
      <FicheMatch fiche={FICHE_EXEMPLE} locale={locale} exemple />
      <p className="mt-3 text-[13px] font-medium leading-relaxed text-text-heading">
        {t("vitrine.puis", locale)}
      </p>
    </motion.section>
  );
}
