/**
 * Redirection de QR code, avec comptage.
 *
 * Un code par EMPLACEMENT (couverture de l'agenda, mois de mars, encart du
 * colis), jamais par exemplaire : un code par exemplaire serait un identifiant
 * individuel. Le scan est compte ICI, cote serveur : pas de cookie, pas de
 * pixel, pas d'IP conservee, pas de SDK. L'identifiant de la ligne est un
 * UUID aleatoire a chaque scan, qui ne suit personne.
 *
 * Les UTM ne survivent pas a la redirection vers un store : on compare donc les
 * scans comptes ici aux installations vues dans la console du store.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORMAT_CODE = /^[a-z0-9][a-z0-9_-]{1,47}$/;
const ROBOTS = /bot|crawl|spider|headless|preview|lighthouse|curl|wget|python-requests/i;

export async function GET(req: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  if (!FORMAT_CODE.test(code)) return new NextResponse("Not found", { status: 404 });

  const supabase = getAdminClient();
  const { data: qr } = await supabase
    .from("mesure_qr")
    .select("app_id, emplacement, campagne, cible, actif")
    .eq("code", code)
    .maybeSingle();

  if (!qr || !qr.actif) return new NextResponse("Not found", { status: 404 });

  let destination: URL;
  try {
    destination = new URL(qr.cible);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  if (destination.protocol !== "https:") return new NextResponse("Not found", { status: 404 });

  destination.searchParams.set("utm_source", "qr");
  destination.searchParams.set("utm_medium", "offline");
  destination.searchParams.set("utm_campaign", qr.campagne);
  destination.searchParams.set("utm_content", qr.emplacement);

  if (!ROBOTS.test(req.headers.get("user-agent") ?? "")) {
    try {
      await supabase.from("app_events").insert({
        app_id: qr.app_id,
        event: "qr_scanne",
        install_id: crypto.randomUUID(),
        surface: "web",
        props: { code, emplacement: qr.emplacement, campagne: qr.campagne },
      });
    } catch {
      // Perdre un scan est sans consequence ; bloquer la redirection ne l'est pas.
    }
  }

  return NextResponse.redirect(destination, {
    status: 302,
    headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}
