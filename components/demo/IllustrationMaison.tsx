"use client";

/**
 * L illustration d un domaine de vie — meme langage que CielDuSignal, sans
 * planete a montrer.
 *
 * ─── POURQUOI CE FICHIER EXISTE ─────────────────────────────────────────────
 *
 * Christophe, le 18/09 : la « bande du jour » (heures de lever/coucher du
 * soleil) etait retiree — « du bruit, on est dans une app astrologique, pas
 * une app meteo ». Mais elle servait aussi d illustration de tete pour les
 * periodes sans planete en transit (les periodes « cycle de vie », ZR) — sans
 * elle, ces fiches repartaient directement sur du texte, le probleme que
 * Christophe avait lui-meme corrige le 17/09 (« toute periode a son
 * illustration, et elle vient avant le texte »).
 *
 * Sa demande : une proposition « jolie mais utile », qui aide a comprendre de
 * quoi la periode parle. `houseConfig` porte deja une icone et une couleur
 * par domaine (`iconName`, jamais utilise nulle part) — ce fichier les met
 * enfin au travail, dans le meme cadre que CielDuSignal : l avatar au centre,
 * un anneau, et cette fois l icone du domaine a la place d une planete.
 *
 * Ce n est PAS une position reelle : une seule icone, posee en haut de son
 * anneau, jamais presentee comme une mesure.
 */

import { motion, useReducedMotion } from "motion/react";
import {
  User,
  Cash,
  MessageDots,
  Home,
  WandMagicSparkles,
  ClipboardCheck,
  Heart,
  Fire,
  Globe,
  Briefcase,
  UsersGroup,
  EyeSlash,
} from "flowbite-react-icons/outline";

const ICONE_PAR_NOM: Record<string, typeof User> = {
  user: User,
  cash: Cash,
  "chat-bubble": MessageDots,
  home: Home,
  sparkles: WandMagicSparkles,
  "clipboard-check": ClipboardCheck,
  heart: Heart,
  fire: Fire,
  "globe-alt": Globe,
  briefcase: Briefcase,
  "user-group": UsersGroup,
  "eye-slash": EyeSlash,
};

/** Le cadre : les memes proportions que CielDuSignal, un seul anneau. */
const CENTRE = 118;
const RAYON = 78;
const TAILLE_ICONE = 34;

export function IllustrationMaison({
  iconName,
  label,
  color,
  initiale,
}: {
  /** `houseConfig[n].iconName` — voir lib/domain-config.tsx. */
  iconName: string;
  /** Le nom du domaine, deja dans la langue du lecteur. */
  label: string;
  color: string;
  initiale?: string | null;
}) {
  const fige = useReducedMotion();
  const Icone = ICONE_PAR_NOM[iconName] ?? User;

  return (
    <figure className="m-0 flex flex-col items-center" data-illustration-maison={iconName}>
      <div className="relative" style={{ width: CENTRE * 2, height: CENTRE * 2 }}>
        {/* L anneau — le meme trait que CielDuSignal, une seule fois. */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: RAYON * 2,
            height: RAYON * 2,
            left: CENTRE - RAYON,
            top: CENTRE - RAYON,
            border: "1px solid color-mix(in srgb, var(--accent-purple) 16%, transparent)",
          }}
          initial={fige ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={fige ? { duration: 0 } : { delay: 0.15, duration: 0.5 }}
        />

        {/* Au centre, la personne — identique a CielDuSignal. */}
        <motion.div
          className="absolute flex items-center justify-center rounded-full font-semibold"
          style={{
            width: 30,
            height: 30,
            left: CENTRE - 15,
            top: CENTRE - 15,
            zIndex: 20,
            fontSize: 13,
            background: "var(--bg-brand)",
            color: "var(--text-on-brand)",
            boxShadow: "0 0 0 4px var(--bg-secondary), 0 0 26px color-mix(in srgb, var(--bg-brand) 45%, transparent)",
          }}
          initial={fige ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={fige ? { duration: 0 } : { delay: 0.2, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          aria-hidden="true"
        >
          {(initiale ?? "").slice(0, 1).toUpperCase()}
        </motion.div>

        {/* L icone du domaine — posee en tete d anneau, jamais presentee
            comme une position mesuree. Un demi-tour d arrivee, comme les
            planetes de CielDuSignal, pour rester dans le meme geste. */}
        <motion.div
          className="absolute"
          style={{ width: RAYON * 2, height: RAYON * 2, left: CENTRE - RAYON, top: CENTRE - RAYON, zIndex: 10 }}
          initial={{ rotate: fige ? 0 : -180 }}
          animate={{ rotate: 0 }}
          transition={fige ? { duration: 0 } : { delay: 0.5, duration: 2.1, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="absolute" style={{ left: "50%", top: 0, transform: "translate(-50%, -50%)" }}>
            <motion.div
              className="relative flex items-center justify-center rounded-full"
              style={{ width: TAILLE_ICONE, height: TAILLE_ICONE, background: `color-mix(in srgb, ${color} 20%, var(--bg-secondary))` }}
              initial={fige ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1, boxShadow: `0 0 16px ${color}55` }}
              transition={fige ? { duration: 0 } : { delay: 0.5, duration: 0.6 }}
            >
              <Icone style={{ width: 18, height: 18, color }} />
            </motion.div>
            <motion.span
              className="absolute left-1/2 whitespace-nowrap text-[11px] font-semibold"
              style={{ top: TAILLE_ICONE / 2 + 8, transform: "translateX(-50%)", color: "var(--text-heading)" }}
              initial={fige ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={fige ? { duration: 0 } : { delay: 2.4, duration: 0.5 }}
            >
              {label}
            </motion.span>
          </div>
        </motion.div>
      </div>

      {/* Meme figcaption que CielDuSignal, retire le meme jour et pour la
          meme raison : la date s affichait deja, correctement localisee,
          juste en dessous dans CapsuleDetailSheet.tsx. Voir le commentaire
          equivalent dans CielDuSignal.tsx. */}
    </figure>
  );
}
