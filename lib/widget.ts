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
import { getApiBase } from "@/lib/api-client";
import { getDeviceId } from "@/lib/device-id";
import { bascules } from "@/lib/periode-courante";
import type { MomentumPhase } from "@/types/momentum";
import { periodeCourante, periodeSuivante } from "@/lib/periode-courante";

const CLEF = "favorable_widget";

/**
 * Depose au serveur les dates d entree et de sortie a venir.
 *
 * Appelee au meme moment que le resume du widget, parce que les deux decoulent
 * des memes phases — chargees une seule fois et gardees trente jours.
 *
 * C est ce qui permet au cron de cesser d appeler le moteur d ephemerides une
 * fois par personne et par jour. Les dates ne changent pas ; les recalculer
 * chaque matin etait une depense pure, et une occasion de panne.
 *
 * Aucune donnee de naissance ne part : une date, un sens, une duree, un
 * domaine, une intensite.
 */
export async function deposerBascules(phases: MomentumPhase[]): Promise<void> {
  if (typeof window === "undefined" || phases.length === 0) return;
  try {
    const aujourdHui = new Date().toISOString().slice(0, 10);
    const liste = bascules(phases, aujourdHui).map((b) => {
      const phase = phases.find((p) => b.cle.endsWith(p.id));
      return {
        cle: b.cle,
        jour: b.jour,
        sens: b.sens,
        duree: phase?.durationWeeks ? Math.round(phase.durationWeeks * 7) : undefined,
        maison: phase?.apiTopics?.[0]?.house,
        score: b.score,
      };
    });
    if (liste.length === 0) return;

    await fetch(`${getApiBase()}/api/push/bascules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ deviceId: getDeviceId(), bascules: liste }),
    });
  } catch {
    // silence volontaire : l app rappellera au prochain chargement
  }
}

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

    // Le choix de la periode est fait par lib/periode-courante.ts, et il n est
    // pas anodin : plusieurs periodes se chevauchent en permanence — une de
    // vingt ans, une de deux ans, un transit de six mois, une eclipse de trois
    // jours. Ce code prenait la premiere du tableau, c est-a-dire une au
    // hasard. Sur la timeline complete ça ne se voyait pas, tout etant
    // affiche ; sur un widget de cinquante points, le choix EST le produit.
    const actuelle = periodeCourante(phases, aujourdHui);
    const suivante = periodeSuivante(phases, aujourdHui);

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
