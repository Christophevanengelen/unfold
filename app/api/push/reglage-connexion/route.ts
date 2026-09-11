/**
 * Le reglage des notifications d une connexion, choisi dans l app.
 *
 * Meme forme que /api/push/cadence : listes fermees, echec silencieux, 204.
 *
 * Meme raisonnement sur l authentification, aussi. Cette route ne peut que
 * RALENTIR ou accelerer des notifications qui existent deja ; elle n en
 * declenche aucune et ne rend rien. Un tiers qui devinerait un identifiant
 * d appareil pourrait importuner quelqu un, jamais apprendre quelque chose sur
 * lui : ni nom, ni date de naissance, ni contenu ne transitent — un
 * identifiant d appareil, un identifiant de connexion, un cran.
 *
 * La table arrive avec supabase/015_reglage_connexion.sql. Tant qu elle n est
 * pas passee, l ecriture echoue, la ligne est journalisee, et l app garde son
 * choix en local : le reglage s applique, il ne survit simplement pas encore a
 * une reinstallation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";
import { withCors, corsPreflightResponse } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REGLAGES = new Set(["aucune", "communs", "avec_autre", "tout"]);

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

  const { deviceId, connexion, reglage } = (corps ?? {}) as Record<string, unknown>;

  if (typeof deviceId !== "string" || deviceId.length < 8 || deviceId.length > 64) {
    return refus(req, "appareil_invalide");
  }
  // Meme plafond que la reference d une notification dans lib/push-routes.ts :
  // ce qui ne peut pas ouvrir un ecran n a pas a etre enregistre.
  if (typeof connexion !== "string" || connexion.length === 0 || connexion.length > 128) {
    return refus(req, "connexion_invalide");
  }
  if (typeof reglage !== "string" || !REGLAGES.has(reglage)) {
    return refus(req, "reglage_inconnu");
  }

  // supabase-js ne rejette pas sur erreur Postgres : il resout avec { error }.
  try {
    const { error } = await getAdminClient().rpc("regler_connexion_push", {
      p_device_id: deviceId,
      p_connexion: connexion,
      p_reglage: reglage,
    });
    if (error) throw new Error(error.message);
  } catch (e) {
    // L app renverra le reglage au prochain changement, donc on ne bloque pas.
    console.error(
      "reglage de connexion refuse :",
      e instanceof Error ? e.message : String(e),
    );
  }

  return withCors(
    req,
    new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }),
  );
}
