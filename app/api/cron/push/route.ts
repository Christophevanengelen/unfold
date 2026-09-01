/**
 * L envoi des notifications. Tourne toutes les heures.
 *
 * Pourquoi toutes les heures et non une fois par jour : on previent chacun a
 * 9 h CHEZ LUI. Le cron se reveille a chaque heure ronde et ne sert que les
 * appareils pour lesquels il est 9 h dans leur fuseau. Quelqu un a Tokyo et
 * quelqu un a Bruxelles sont donc servis a huit heures d intervalle, tous les
 * deux au reveil.
 *
 * Trois protections, dans cet ordre, parce que chacune rattrape l echec de la
 * precedente :
 *
 *   1. On RESERVE avant d envoyer. La reservation porte une contrainte
 *      d unicite en base : deux executions simultanees ne peuvent pas reserver
 *      la meme chose. Si l envoi echoue ensuite, la personne rate cette
 *      notification — c est le bon sens du compromis : mieux vaut une
 *      notification manquee qu une notification en double.
 *   2. Le plancher d espacement, selon la cadence choisie.
 *   3. Un plafond d appareils par execution, pour qu une base qui grossit ne
 *      fasse pas depasser le temps d execution de Vercel — et pour que le
 *      moteur externe ne prenne pas une rafale.
 *
 * Le moteur de calcul est un service tiers, appele une fois par personne. S il
 * tombe, la personne n est pas prevenue ce jour-la et on passe a la suivante :
 * une notification ratee ne justifie pas de faire echouer les autres.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";
import { envoyerLot, type EnvoiAPNs } from "@/lib/apns";
import { ESPACEMENT_MINIMUM, type Cadence } from "@/lib/push-planification";
import { ecrireBascule } from "@/lib/push-textes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** L heure locale a laquelle on previent. Jamais avant, jamais apres. */
const HEURE = 9;

/** Au-dela, on s arrete et on reprendra a la prochaine heure ronde. */
const PLAFOND = 200;

/** On previent la veille : une bascule connue le matin meme se subit. */
const PREAVIS = 1;

const JOUR = 86_400_000;

export async function GET(req: NextRequest) {
  // Vercel signe ses appels de cron. Sans ce controle, n importe qui pourrait
  // declencher une campagne en visitant une adresse.
  const attendu = process.env.CRON_SECRET;
  if (!attendu || req.headers.get("authorization") !== `Bearer ${attendu}`) {
    return NextResponse.json({ error: "refuse" }, { status: 401 });
  }

  const supabase = getAdminClient();
  const maintenant = new Date();

  // On lit les bascules deposees par l app, plus le moteur.
  //
  // Ce cron rappelait le moteur d ephemerides une fois par personne et par
  // jour, pour recalculer des dates qui ne changent jamais. Avec mille
  // utilisateurs, mille appels quotidiens sur un serveur tiers — et mille
  // occasions de tomber sur une panne un matin.
  //
  // L app charge desormais ses periodes une fois et depose ses dates d entree
  // et de sortie (voir lib/widget.ts et /api/push/bascules). Le cron ne lit
  // plus que sa propre base.
  const { data: candidats, error } = await supabase.rpc("bascules_a_annoncer", {
    p_heure_locale: HEURE,
    p_preavis: PREAVIS,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const lignes = (candidats ?? []).slice(0, PLAFOND) as {
    device_id: string;
    jeton: string;
    locale: string | null;
    cadence: Cadence;
    dernier_envoi: string | null;
    cle: string;
    jour: string;
    sens: "entree" | "sortie";
    duree_jours: number | null;
    maison: number | null;
    score: number;
  }[];

  const envois: EnvoiAPNs[] = [];
  let ignores = 0;
  // Une seule notification par personne, meme si plusieurs periodes basculent
  // le meme jour : la requete les rend triees par intensite, on garde la
  // premiere. Deux notifications le meme matin, c est une de trop.
  const dejaVus = new Set<string>();

  for (const ligne of lignes) {
    if (dejaVus.has(ligne.device_id)) continue;

    // La cadence choisie filtre ce qui merite d etre annonce.
    const minimum = ligne.cadence === "essentiel" ? 3 : ligne.cadence === "normal" ? 2 : 1;
    if (ligne.score < minimum) continue;

    // Le plancher d espacement.
    if (ligne.dernier_envoi) {
      const jours = (maintenant.getTime() - new Date(ligne.dernier_envoi).getTime()) / JOUR;
      if (jours < ESPACEMENT_MINIMUM[ligne.cadence ?? "normal"]) {
        ignores++;
        continue;
      }
    }

    // Reserver avant d envoyer : l unicite en base arbitre, meme entre deux
    // executions simultanees.
    const { data: reserve } = await supabase.rpc("reserver_envoi_push", {
      p_device_id: ligne.device_id,
      p_cle: ligne.cle,
      p_nature: ligne.sens,
    });
    if (reserve !== true) {
      ignores++;
      continue;
    }

    const { titre, corps } = ecrireBascule(ligne, ligne.locale);
    envois.push({
      jeton: ligne.jeton,
      titre,
      corps,
      donnees: { ecran: "timeline" },
      regroupement: "periode",
    });
    dejaVus.add(ligne.device_id);
  }

  const resultats = envois.length > 0 ? await envoyerLot(envois) : [];

  // Apple fait autorite pour dire qu un jeton est mort. C est le seul signal
  // fiable : personne ne nous previent quand quelqu un desinstalle l app.
  const morts = resultats.filter((r) => r.jetonMort);
  for (const m of morts) {
    await supabase.rpc("invalider_push_jeton", { p_jeton: m.jeton, p_motif: m.raison ?? "mort" });
  }

  return NextResponse.json({
    examines: lignes.length,
    ignores,
    envoyes: resultats.filter((r) => r.ok).length,
    echecs: resultats.filter((r) => !r.ok).length,
    jetons_enterres: morts.length,
  });
}
