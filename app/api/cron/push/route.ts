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
import { planifier, ESPACEMENT_MINIMUM, type Cadence } from "@/lib/push-planification";
import { ecrire } from "@/lib/push-textes";
import { getCalculatorRequest, chargerSujetParAppareil } from "@/lib/astrology-subject";
import { callCalculatorEndpoint } from "@/lib/astrolearn-calculator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** L heure locale a laquelle on previent. Jamais avant, jamais apres. */
const HEURE = 9;

/** Au-dela, on s arrete et on reprendra a la prochaine heure ronde. */
const PLAFOND = 200;

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

  const { data: candidats, error } = await supabase.rpc("push_a_prevenir", {
    p_heure_locale: HEURE,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const lignes = (candidats ?? []).slice(0, PLAFOND) as {
    device_id: string;
    jeton: string;
    fournisseur: string;
    plateforme: string;
    locale: string | null;
    cadence: Cadence;
    dernier_envoi: string | null;
  }[];

  const envois: EnvoiAPNs[] = [];
  const reserves: { device_id: string; cle: string }[] = [];
  let ignores = 0;
  let sansCalcul = 0;

  for (const ligne of lignes) {
    // 2. Le plancher d espacement.
    if (ligne.dernier_envoi) {
      const jours = (maintenant.getTime() - new Date(ligne.dernier_envoi).getTime()) / JOUR;
      if (jours < ESPACEMENT_MINIMUM[ligne.cadence ?? "normal"]) {
        ignores++;
        continue;
      }
    }

    // Le calcul, personne par personne. Une panne du moteur ne doit pas
    // emporter les autres.
    let releasing: unknown = null;
    try {
      const sujet = await chargerSujetParAppareil(ligne.device_id);
      const { endpoint, input } = getCalculatorRequest(sujet, "zodiacal-releasing");
      const resultat = await callCalculatorEndpoint(endpoint, {
        ...input,
        lotType: "spirit",
        maxLevels: 4,
        targetDate: maintenant.toISOString().slice(0, 10),
        l4Year: maintenant.getUTCFullYear(),
      });
      releasing = (resultat as { data?: { releasing?: unknown } })?.data?.releasing ?? null;
    } catch {
      // Profil incomplet, moteur indisponible : on passe.
      sansCalcul++;
      continue;
    }

    const choix = planifier(
      releasing as Parameters<typeof planifier>[0],
      maintenant,
      { cadence: ligne.cadence ?? "normal" },
    )[0];
    if (!choix) continue;

    // 1. Reserver AVANT d envoyer. L unicite en base fait l arbitrage, meme
    // entre deux executions simultanees.
    const { data: reserve } = await supabase.rpc("reserver_envoi_push", {
      p_device_id: ligne.device_id,
      p_cle: choix.cle,
      p_nature: choix.nature,
    });
    if (reserve !== true) {
      ignores++;
      continue;
    }

    const { titre, corps } = ecrire(choix, ligne.locale);
    envois.push({
      jeton: ligne.jeton,
      titre,
      corps,
      // Une clef, jamais un chemin : voir lib/push-routes.ts.
      donnees: { ecran: choix.ecran },
      regroupement: choix.regroupement,
    });
    reserves.push({ device_id: ligne.device_id, cle: choix.cle });
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
    sans_calcul: sansCalcul,
    envoyes: resultats.filter((r) => r.ok).length,
    echecs: resultats.filter((r) => !r.ok).length,
    jetons_enterres: morts.length,
  });
}
