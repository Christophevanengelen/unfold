"use client";

/**
 * La signature d une personne : son empreinte, tiree de sa seule naissance.
 *
 * Le calcul vit dans `lib/empreinte.ts` (`empreinteDeNaissance`). Ce composant
 * ne fait que la poser, en fond, tres discrete.
 *
 * ELLE NE SE LIT PAS. C est un monogramme, pas une mesure : aucune valeur ne
 * s y trouve, et rien a l ecran ne suggere le contraire. Sa raison d etre est
 * qu une personne ait la meme forme partout et pour toujours — son profil, ses
 * resumes, la carte qu elle partage.
 */

import { useMemo } from "react";
import { empreinteDeNaissance } from "@/lib/empreinte";
import { Empreinte } from "@/components/demo/compat/rapport/Empreinte";

export function Signature({
  naissance,
  taille = 320,
  opacite = 0.22,
  className,
}: {
  /** La naissance, sous une forme stable : « 1977-09-27T00:00 ». */
  naissance: string;
  taille?: number;
  opacite?: number;
  className?: string;
}) {
  const parametres = useMemo(() => empreinteDeNaissance(naissance), [naissance]);
  return (
    <Empreinte
      parametres={parametres}
      taille={taille}
      opacite={opacite}
      aura
      className={className}
    />
  );
}
