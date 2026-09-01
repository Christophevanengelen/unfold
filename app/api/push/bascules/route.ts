/**
 * L app depose ses dates de bascule.
 *
 * Appelee une fois par chargement de timeline — soit environ une fois par mois
 * par personne, puisque les periodes sont mises en cache trente jours.
 *
 * CE QUE CETTE ROUTE REMPLACE. Le cron rappelait le moteur d ephemerides une
 * fois par personne et par jour pour recalculer des dates qui ne changent
 * jamais. Avec mille utilisateurs, mille appels quotidiens sur un serveur
 * tiers, et mille occasions de tomber sur une panne. Desormais le cron ne lit
 * que sa propre base.
 *
 * Aucune donnee de naissance ne transite ici : une date, un sens, une duree,
 * un numero de maison, une intensite. La table dit QUAND, jamais pourquoi.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";
import { withCors, corsPreflightResponse } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Au-dela, quelqu un s amuse. Une annee de bascules en fait quelques dizaines. */
const MAXIMUM = 400;

const JOUR = /^\d{4}-\d{2}-\d{2}$/;

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

function refus(req: NextRequest, raison: string) {
  return withCors(req, NextResponse.json({ error: raison }, { status: 400 }));
}

export async function POST(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return refus(req, "corps_illisible");
  }

  const { deviceId, bascules } = (corps ?? {}) as Record<string, unknown>;

  if (typeof deviceId !== "string" || deviceId.length < 8 || deviceId.length > 64) {
    return refus(req, "appareil_invalide");
  }
  if (!Array.isArray(bascules) || bascules.length > MAXIMUM) {
    return refus(req, "liste_invalide");
  }

  // On filtre plutot que de refuser en bloc : une seule ligne abimee ne doit
  // pas faire perdre toutes les autres. Ce qui ne passe pas est simplement
  // ignore.
  const propres = bascules.filter((b) => {
    if (typeof b !== "object" || b === null) return false;
    const x = b as Record<string, unknown>;
    return (
      typeof x.cle === "string" && x.cle.length > 0 && x.cle.length <= 128 &&
      typeof x.jour === "string" && JOUR.test(x.jour) &&
      (x.sens === "entree" || x.sens === "sortie") &&
      (x.maison === undefined || (typeof x.maison === "number" && x.maison >= 1 && x.maison <= 12)) &&
      (x.score === undefined || (typeof x.score === "number" && x.score >= 1 && x.score <= 4))
    );
  });

  // supabase-js ne rejette pas sur erreur Postgres : il resout avec { error }.
  // Le try/catch ci-dessous n attrapait donc rien, et la route repondait 204
  // meme quand l ecriture avait echoue. Le silence etait volontaire ; l aveu-
  // glement, non.
  try {
    const { error } = await getAdminClient().rpc("deposer_bascules", {
      p_device_id: deviceId,
      p_bascules: propres,
    });
    if (error) throw new Error(error.message);
  } catch (e) {
    // On ne casse pas l app : elle rappelle cette route au prochain chargement
    // de timeline, donc une ecriture ratee se repare toute seule. Mais on la
    // journalise, sinon on ne saura jamais qu elle a rate.
    console.error("depot des bascules refuse :", e instanceof Error ? e.message : String(e));
  }

  return withCors(
    req,
    new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }),
  );
}
