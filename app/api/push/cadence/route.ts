/**
 * Le reglage de frequence, choisi dans l app.
 *
 * Meme forme que /api/push/register : listes fermees, echec silencieux, 204.
 *
 * Ce reglage-ci ne peut que RALENTIR ou accelerer des notifications, jamais en
 * declencher ni en lire. Un tiers qui devinerait un identifiant d appareil ne
 * pourrait donc qu importuner quelqu un, pas apprendre quoi que ce soit sur
 * lui. C est ce qui rend acceptable de ne pas exiger d authentification ici,
 * alors qu une route de desenregistrement, elle, n existe volontairement pas.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";
import { withCors, corsPreflightResponse } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CADENCES = new Set(["aucune", "essentiel", "normal", "tout"]);

export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export async function POST(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return withCors(req, NextResponse.json({ error: "corps_illisible" }, { status: 400 }));
  }

  const { deviceId, cadence } = (corps ?? {}) as Record<string, unknown>;

  if (typeof deviceId !== "string" || deviceId.length < 8 || deviceId.length > 64) {
    return withCors(req, NextResponse.json({ error: "appareil_invalide" }, { status: 400 }));
  }
  if (typeof cadence !== "string" || !CADENCES.has(cadence)) {
    return withCors(req, NextResponse.json({ error: "cadence_inconnue" }, { status: 400 }));
  }

  // supabase-js ne rejette pas sur erreur Postgres : il resout avec { error }.
  // Le try/catch ci-dessous n attrapait donc rien, et la route repondait 204
  // meme quand l ecriture avait echoue. Le silence etait volontaire ; l aveu-
  // glement, non.
  try {
    const { error } = await getAdminClient().rpc("regler_cadence_push", {
      p_device_id: deviceId,
      p_cadence: cadence,
    });
    if (error) throw new Error(error.message);
  } catch (e) {
    // L app renverra le reglage au prochain demarrage, donc on ne bloque pas.
    console.error("reglage de cadence refuse :", e instanceof Error ? e.message : String(e));
  }

  return withCors(
    req,
    new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }),
  );
}
