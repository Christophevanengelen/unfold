"use client";

import { motion, AnimatePresence } from "motion/react";
import type { CSSProperties } from "react";
import { perso } from "@/lib/perso-i18n";
import { useLocale } from "@/lib/use-locale";
import { VERRE_PILULE } from "./verre";

/**
 * Le bouton « Maintenant » — un seul composant, deux montages.
 *
 * Il existait deux fois : un pilule flottante de 44px sur Timeline
 * (n'apparait qu'en s'eloignant d'aujourd'hui), une pilule inline de 28px
 * dans la rangee de commandes de Ma vie (toujours visible). Christophe,
 * le 18/09 : « le bouton Now doivent etre repliques dans la meme taille,
 * reutiliser les memes composants dans ma vie et partout dans
 * l'application. » Le corps du bouton — hauteur, padding, verre, libelle —
 * est maintenant unique ; seul le montage (flottant et conditionnel, ou
 * pose dans une rangee) reste au choix de l'appelant, parce que c'est un
 * fait de mise en page, pas un choix de style.
 */
export function BoutonMaintenant({
  onClick,
  flottant = false,
  visible = true,
  style,
  className,
}: {
  onClick: () => void;
  /** Timeline : pose en position absolue et anime son entree/sortie. */
  flottant?: boolean;
  /** Ma vie : toujours vrai, le bouton reste dans la rangee. */
  visible?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const locale = useLocale();

  const corps = (
    <motion.button
      type="button"
      onClick={onClick}
      className={`flex h-[var(--taille-tactile-min)] items-center justify-center rounded-full px-4 ${className ?? ""}`}
      style={{ ...VERRE_PILULE, ...style }}
      whileTap={{ scale: 0.95 }}
      {...(flottant
        ? {
            initial: { opacity: 0, scale: 0.6 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.6 },
            transition: { duration: 0.2, ease: "easeOut" as const },
          }
        : {})}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider">
        {perso("timeline.maintenant", locale)}
      </span>
    </motion.button>
  );

  if (!flottant) return visible ? corps : null;

  return <AnimatePresence>{visible && corps}</AnimatePresence>;
}
