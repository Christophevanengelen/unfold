/**
 * Mesure d usage — point d entree unique, pour le site et pour l app.
 *
 * Pourquoi maison. Le produit vit dans deux corps : un site web et une app
 * Capacitor. L app est un binaire statique, elle n a pas de page vue au sens ou
 * l entend un outil web, et c est justement elle qu on veut mesurer. Cette
 * route repond aux deux, garde les donnees chez nous, et n ajoute aucun
 * prestataire.
 *
 * Ce qui n entre jamais ici : aucune donnee de naissance, aucun nom, aucune
 * adresse, aucune adresse IP. Les noms d evenements sont une liste fermee, pas
 * un champ libre : personne ne peut faire ecrire n importe quoi dans la table,
 * et un evenement mal ecrit se voit tout de suite au lieu de creer une ligne
 * fantome qu on decouvre trois mois plus tard.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Liste fermee. Ajouter un evenement, c est l ajouter ici d abord. */
const EVENEMENTS = new Set([
  // Ouverture de l app ou du site. C est de lui que se deduit la retention :
  // on ne l emet pas, on la calcule (voir retention_app dans 009).
  "app_ouverte",
  "onboarding_demarre",
  "onboarding_termine",
  "premier_signal_vu",
  "signal_ouvert",
]);

const SURFACES = new Set(["app", "web"]);

/** Une poignee de proprietes courtes, jamais de texte libre volumineux. */
const PROPS_MAX = 512;

function refus(raison: string, status = 400) {
  return NextResponse.json({ error: raison }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return refus("corps_illisible");
  }

  const { event, installId, surface, locale, props } = (corps ?? {}) as {
    event?: unknown;
    installId?: unknown;
    surface?: unknown;
    locale?: unknown;
    props?: unknown;
  };

  if (typeof event !== "string" || !EVENEMENTS.has(event)) return refus("evenement_inconnu");
  if (typeof installId !== "string" || installId.length < 8 || installId.length > 64) {
    return refus("installation_invalide");
  }
  if (typeof surface !== "string" || !SURFACES.has(surface)) return refus("surface_inconnue");
  if (locale !== undefined && (typeof locale !== "string" || locale.length > 8)) {
    return refus("langue_invalide");
  }

  let proprietes: Record<string, unknown> = {};
  if (props !== undefined) {
    if (typeof props !== "object" || props === null || Array.isArray(props)) return refus("props_invalides");
    const serialise = JSON.stringify(props);
    if (serialise.length > PROPS_MAX) return refus("props_trop_longues");
    proprietes = props as Record<string, unknown>;
  }

  // La mesure ne doit jamais casser le produit ni le ralentir. Si la base ne
  // repond pas, on l accepte en silence : perdre un evenement est sans
  // consequence, faire echouer un ecran ne l est pas.
  try {
    const supabase = getAdminClient();
    await supabase.from("app_events").insert({
      event,
      install_id: installId,
      surface,
      locale: typeof locale === "string" ? locale : null,
      props: proprietes,
    });
  } catch {
    // silence volontaire
  }

  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
