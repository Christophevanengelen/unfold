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
import { withCors, corsPreflightResponse } from "@/lib/cors";

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
  "notif_demandee",
  "notif_accordee",
  "notif_refusee",
  "notif_echec",
  // Vitrine : d'ou viennent les visiteurs, et ce qu'ils cliquent.
  "page_vue",
  "cta_clic",
  "qr_scanne",
  // Vocabulaire commun aux autres produits : memes noms partout, pour comparer.
  "app_installee",
  "valeur_recue",
  "notif_ouverte",
  "paywall_vu",
  "achat_demarre",
  "achat_reussi",
  "partage_declenche",
]);

const SURFACES = new Set(["app", "web"]);

/** Une poignee de proprietes courtes, jamais de texte libre volumineux. */
const PROPS_MAX = 512;

/** Produit historique : accepte sans cle, comme avant la migration 017. */
const PRODUIT_HISTORIQUE = "unfold";
const FORMAT_APP_ID = /^[a-z0-9][a-z0-9_-]{1,31}$/;
const FORMAT_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROBOTS = /bot|crawl|spider|headless|preview|lighthouse|curl|wget|python-requests/i;

/**
 * Garde-fou donnees de naissance (CONFORMITE.md, art. 9 RGPD) : une propriete
 * dont le NOM ressemble a une donnee de naissance, ou dont la VALEUR ressemble a
 * une date, un e-mail ou des coordonnees, est refusee. La liste d evenements est
 * fermee ; les proprietes, elles, sont libres : c est ici qu on les borne.
 */
const CLES_INTERDITES = /naiss|birth|born|lat(itude)?$|^lon|lng|email|mail|nom$|name|signe|sign$|zodiac|theme|chart|heure|time$|^date|city|ville|lieu|adresse|address/i;
const VALEURS_INTERDITES = /^\d{4}-\d{2}-\d{2}|\d{1,2}[/.]\d{1,2}[/.]\d{2,4}|[^\s@]+@[^\s@]+\.[^\s@]+|^-?\d{1,3}\.\d{3,},\s*-?\d{1,3}\.\d{3,}/;

function proprietesInterdites(props: Record<string, unknown>): string | null {
  for (const [cle, valeur] of Object.entries(props)) {
    if (CLES_INTERDITES.test(cle)) return cle;
    if (typeof valeur === "string" && VALEURS_INTERDITES.test(valeur)) return cle;
    if (typeof valeur === "object" && valeur !== null) return cle;
  }
  return null;
}

type Produit = { origines: string[]; cle_hash: string | null };
const cacheProduits = new Map<string, { produit: Produit | null; expire: number }>();

async function lireProduit(appId: string): Promise<Produit | null> {
  const memo = cacheProduits.get(appId);
  if (memo && memo.expire > Date.now()) return memo.produit;
  let produit: Produit | null = null;
  try {
    const { data } = await getAdminClient()
      .from("mesure_produits")
      .select("origines, cle_hash")
      .eq("app_id", appId)
      .eq("actif", true)
      .maybeSingle();
    produit = (data as Produit | null) ?? null;
  } catch {
    produit = null;
  }
  cacheProduits.set(appId, { produit, expire: Date.now() + 60_000 });
  return produit;
}

async function sha256(texte: string): Promise<string> {
  const octets = new TextEncoder().encode(texte);
  const condense = await crypto.subtle.digest("SHA-256", octets);
  return Array.from(new Uint8Array(condense)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * L app tourne dans une vue web dont l origine est capacitor://localhost et
 * appelle https://favorable.day : c est un appel d origine croisee. Avec un
 * Content-Type application/json, le navigateur envoie d abord un preflight
 * OPTIONS. Sans reponse portant les en-tetes CORS, il bloque le POST qui suit.
 * Constate le 31/08/2026 : le preflight repondait 204 mais sans
 * Access-Control-Allow-Origin, donc AUCUN evenement ne remontait de l app.
 * La vitrine web, elle, appelle en meme origine et n etait pas concernee.
 */
export async function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

function refus(req: NextRequest, raison: string, status = 400) {
  return withCors(
    req,
    NextResponse.json({ error: raison }, { status, headers: { "Cache-Control": "no-store" } }),
  );
}

export async function POST(req: NextRequest) {
  let corps: unknown;
  try {
    corps = await req.json();
  } catch {
    return refus(req, "corps_illisible");
  }

  const { event, installId, surface, locale, props, appId, cle, eventId } = (corps ?? {}) as {
    event?: unknown;
    installId?: unknown;
    surface?: unknown;
    locale?: unknown;
    props?: unknown;
    appId?: unknown;
    cle?: unknown;
    eventId?: unknown;
  };

  // Robots et apercus de liens : ils ne sont pas des visiteurs. Reponse neutre.
  if (ROBOTS.test(req.headers.get("user-agent") ?? "")) {
    return withCors(req, new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }));
  }

  const produitId = appId === undefined ? PRODUIT_HISTORIQUE : appId;
  if (typeof produitId !== "string" || !FORMAT_APP_ID.test(produitId)) return refus(req, "produit_invalide");
  if (eventId !== undefined && (typeof eventId !== "string" || !FORMAT_UUID.test(eventId))) {
    return refus(req, "evenement_id_invalide");
  }

  // Autre produit que Favorable : il faut une cle, et si l appel vient d un
  // navigateur, une origine autorisee. La cle est publique par nature (elle
  // est dans le code d une landing ou d une app) : elle ne protege pas, elle
  // identifie. La protection, c est l origine, le schema et la liste fermee.
  let origineAutorisee: string | null = null;
  if (produitId !== PRODUIT_HISTORIQUE) {
    const produit = await lireProduit(produitId);
    if (!produit) return refus(req, "produit_inconnu", 401);
    if (produit.cle_hash) {
      if (typeof cle !== "string" || (await sha256(cle)) !== produit.cle_hash) return refus(req, "cle_invalide", 401);
    }
    const origine = req.headers.get("origin");
    if (origine) {
      if (!produit.origines.includes(origine)) return refus(req, "origine_refusee", 403);
      origineAutorisee = origine;
    }
  }

  if (typeof event !== "string" || !EVENEMENTS.has(event)) return refus(req, "evenement_inconnu");
  if (typeof installId !== "string" || installId.length < 8 || installId.length > 64) {
    return refus(req, "installation_invalide");
  }
  if (typeof surface !== "string" || !SURFACES.has(surface)) return refus(req, "surface_inconnue");
  if (locale !== undefined && (typeof locale !== "string" || locale.length > 8)) {
    return refus(req, "langue_invalide");
  }

  let proprietes: Record<string, unknown> = {};
  if (props !== undefined) {
    if (typeof props !== "object" || props === null || Array.isArray(props)) return refus(req, "props_invalides");
    const serialise = JSON.stringify(props);
    if (serialise.length > PROPS_MAX) return refus(req, "props_trop_longues");
    proprietes = props as Record<string, unknown>;
    const interdite = proprietesInterdites(proprietes);
    if (interdite) return refus(req, "propriete_interdite");
  }

  // La mesure ne doit jamais casser le produit ni le ralentir. Si la base ne
  // repond pas, on l accepte en silence : perdre un evenement est sans
  // consequence, faire echouer un ecran ne l est pas.
  //
  // Les colonnes app_id et event_id (migration 017) ne sont ecrites que
  // lorsqu elles servent. Pour Favorable sans event_id, la ligne est identique a
  // celle d avant : si ce code part avant la migration, rien ne se perd.
  try {
    const ligne: Record<string, unknown> = {
      event,
      install_id: installId,
      surface,
      locale: typeof locale === "string" ? locale : null,
      props: proprietes,
    };
    if (produitId !== PRODUIT_HISTORIQUE) ligne.app_id = produitId;
    if (typeof eventId === "string") ligne.event_id = eventId;
    await getAdminClient().from("app_events").insert(ligne);
  } catch {
    // silence volontaire
  }

  const reponse = withCors(req, new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } }));
  if (origineAutorisee) reponse.headers.set("Access-Control-Allow-Origin", origineAutorisee);
  return reponse;
}
