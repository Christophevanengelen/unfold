"use client";

import { isNative } from "@/lib/platform";

/**
 * Adresse de la fiche d une connexion.
 *
 * Sur le web : /app/compatibility/<id>, une vraie adresse partageable.
 * Dans l app : /app/compatibility/view/?c=<id>. L export statique de Next ne
 * sait pas produire un fichier pour chaque identifiant possible, donc on passe
 * l identifiant en parametre. **L ecran affiche est exactement le meme.**
 */
export function connectionHref(id: string): string {
  return isNative()
    ? `/app/compatibility/view/?c=${encodeURIComponent(id)}`
    : `/app/compatibility/${id}`;
}
