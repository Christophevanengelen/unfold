"use client";

/**
 * Les cinq icones de la barre d onglets — dessinees sur mesure, dans le meme
 * alphabet que CielDuSignal.tsx et IllustrationMaison.tsx : un anneau (le
 * temps, l orbite, le lien) et un point (la presence, la personne, le
 * signal). Aucune ne vient d une librairie : cinq SVG, une seule grille
 * (viewBox 24x24), une seule epaisseur de trait, une seule regle de couleur
 * (currentColor herite du `style.color` du parent — jamais de hex en dur).
 *
 * Chaque composant accepte les memes props qu une icone
 * `flowbite-react-icons` : `size` (px) et `style` (avec `color` dedans).
 */

import type { CSSProperties } from "react";

interface IconeNavProps {
  size?: number;
  style?: CSSProperties;
  className?: string;
}

/** La seule epaisseur de trait de la famille. */
const TRAIT = 1.7;

/**
 * Timeline — une orbite ouverte, un point qui arrive au bout de son trajet.
 * Pas une horloge : pas d aiguilles, pas de chiffres, juste le trajet et
 * l instant ou il se pose — la meme idee que les planetes de CielDuSignal,
 * qui tournent puis atterrissent.
 */
export function IconeTimeline({ size = 24, style, className }: IconeNavProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 4 A8 8 0 1 1 4.48 9.26"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinecap="round"
      />
      <circle cx="4.48" cy="9.26" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Ma vie — la branche de BrancheDeVie.tsx (resume/BrancheDeVie.tsx), reduite
 * a l essentiel : une tige qui monte, des bourgeons qui grossissent vers le
 * present. Le tronc dessine EST le tronc du fleuve, pas un graphique en
 * barres.
 */
export function IconeMaVie({ size = 24, style, className }: IconeNavProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7.5 20C7.5 16 10 14 9 10C8.3 7 11.5 5 13 3.5"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinecap="round"
      />
      <circle cx="8.6" cy="15" r="1" fill="currentColor" />
      <circle cx="10.2" cy="6.2" r="1.3" fill="currentColor" />
      <circle cx="13" cy="3.5" r="1.8" fill="currentColor" />
    </svg>
  );
}

/**
 * Match — deux orbites qui se recouvrent, un point la ou elles s alignent.
 * Pas un coeur : le meme vocabulaire que le ciel (anneau + point), applique
 * a deux personnes plutot qu a une seule.
 */
export function IconeMatch({ size = 24, style, className }: IconeNavProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <circle cx="9" cy="12" r="6.3" stroke="currentColor" strokeWidth={TRAIT} />
      <circle cx="15" cy="12" r="6.3" stroke="currentColor" strokeWidth={TRAIT} />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

/**
 * Vela — un point qui rayonne dans son anneau. Une voix, pas une bulle de
 * discussion : le signal qui parle, jamais ses trois petits points
 * d attente.
 */
export function IconeVela({ size = 24, style, className }: IconeNavProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth={TRAIT} />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <path d="M12 5.8V3.4" stroke="currentColor" strokeWidth={TRAIT} strokeLinecap="round" />
      <path d="M17.37 15.1L19.45 16.3" stroke="currentColor" strokeWidth={TRAIT} strokeLinecap="round" />
      <path d="M6.63 15.1L4.55 16.3" stroke="currentColor" strokeWidth={TRAIT} strokeLinecap="round" />
    </svg>
  );
}

/**
 * Profil — la personne au centre de son ciel. Le meme disque plein qui
 * porte l initiale au centre de CielDuSignal et IllustrationMaison, pose
 * ici sur une epaule dessinee au meme trait.
 */
export function IconeProfil({ size = 24, style, className }: IconeNavProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="7.6" r="3.1" fill="currentColor" />
      <path
        d="M5.7 20.3C5.7 15.6 8.4 13 12 13C15.6 13 18.3 15.6 18.3 20.3"
        stroke="currentColor"
        strokeWidth={TRAIT}
        strokeLinecap="round"
      />
    </svg>
  );
}
