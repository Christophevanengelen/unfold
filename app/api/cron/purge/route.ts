/**
 * Purge des evenements de mesure de plus de 12 mois. Tourne une fois par semaine.
 *
 * La fonction SQL purge_app_events (migration 009) existe depuis le debut, mais
 * personne ne l appelait : rien n etait jamais efface, alors que la politique de
 * confidentialite annonce « 12 mois au plus » (lib/legal-content.ts). Constate
 * le 07/10/2026 : pg_cron n est pas installe dans la base, et le seul cron
 * Vercel etait celui des notifications.
 *
 * Meme garde que le cron des notifications : Vercel signe ses appels, sans ce
 * controle n importe qui pourrait declencher la purge en visitant l adresse.
 * Elle ne touche que app_events, jamais une table de compte.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const attendu = process.env.CRON_SECRET;
  if (!attendu || req.headers.get("authorization") !== `Bearer ${attendu}`) {
    return NextResponse.json({ error: "refuse" }, { status: 401 });
  }

  const { data, error } = await getAdminClient().rpc("purge_app_events", { p_older_than: "365 days" });
  if (error) return NextResponse.json({ error: "purge_echouee" }, { status: 500 });
  return NextResponse.json({ supprimes: data ?? 0 });
}
