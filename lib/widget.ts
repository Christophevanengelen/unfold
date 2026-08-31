/**
 * Ce que l app depose pour le widget iOS.
 *
 * Le widget ne calcule rien et n a pas de reseau garanti : il lit ce petit
 * resume et l affiche. Tout ce qui demande un calcul se fait donc ici, dans
 * l app, pendant qu elle est ouverte.
 *
 * Deux pieges, invisibles tous les deux :
 *
 *   1. Le greffon Preferences prefixe ses clefs par « CapacitorStorage. »
 *      avant d ecrire dans UserDefaults. Le code Swift lit donc
 *      « CapacitorStorage.favorable_widget », pas « favorable_widget ».
 *      Voir ios/App/FavorableWidget/Instantane.swift.
 *   2. Le magasin doit etre le groupe partage, declare dans capacitor.config.ts
 *      ET dans les droits des deux cibles. S il manque quelque part, l ecriture
 *      reussit et la lecture rend nil — sans erreur nulle part.
 */

import { isNative } from "@/lib/platform";
import type { MomentumPhase } from "@/types/momentum";

const CLEF = "favorable_widget";

type PeriodeWidget = {
  titre: string;
  sousTitre?: string;
  couleur?: string;
  debut?: string;
  fin?: string;
};

function versWidget(p: MomentumPhase): PeriodeWidget {
  return {
    titre: p.title,
    sousTitre: p.subtitle || undefined,
    couleur: p.color || undefined,
    debut: p.startDate?.slice(0, 10),
    fin: p.endDate?.slice(0, 10),
  };
}

/**
 * Depose le resume. A appeler quand la timeline est chargee.
 *
 * N echoue jamais : un widget qui ne se met pas a jour est un desagrement, un
 * ecran qui plante est un bug. La prochaine ouverture de l app reparera.
 */
export async function deposerPourWidget(phases: MomentumPhase[]): Promise<void> {
  if (typeof window === "undefined" || !isNative() || phases.length === 0) return;

  try {
    const aujourdHui = new Date().toISOString().slice(0, 10);

    // « En cours » se decide sur les dates et non sur le champ status : celui-ci
    // est calcule au chargement et peut avoir vieilli si l app est restee
    // ouverte plusieurs jours.
    const actuelle =
      phases.find(
        (p) =>
          p.startDate?.slice(0, 10) <= aujourdHui &&
          (!p.endDate || p.endDate.slice(0, 10) >= aujourdHui),
      ) ?? null;

    const suivante =
      phases
        .filter((p) => p.startDate?.slice(0, 10) > aujourdHui)
        .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null;

    if (!actuelle && !suivante) return;

    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({
      key: CLEF,
      value: JSON.stringify({
        actuelle: actuelle ? versWidget(actuelle) : null,
        suivante: suivante ? versWidget(suivante) : null,
        maj: new Date().toISOString(),
      }),
    });
  } catch {
    // silence volontaire : voir l en-tete
  }
}
