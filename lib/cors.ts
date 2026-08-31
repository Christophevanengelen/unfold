/**
 * CORS helper for API routes that Capacitor calls cross-origin.
 *
 * D ou viennent ces origines — a garder en phase avec capacitor.config.ts :
 *
 *   iOS     : le serveur d actifs interne de la WKWebView sert depuis
 *             `<server.iosScheme>://<server.hostname>`. Les deux clefs sont
 *             absentes de capacitor.config.ts, donc les valeurs par defaut de
 *             Capacitor s appliquent : scheme `capacitor`, hote `localhost`,
 *             soit l origine `capacitor://localhost`.
 *             ATTENTION : la clef `ios.scheme` (= "unfold") n a RIEN a voir.
 *             C est le nom du schema de compilation Xcode utilise par
 *             `npx cap run ios` ; le moteur natif ne la lit jamais. Le
 *             « unfold » de Info.plist (CFBundleURLSchemes) est encore autre
 *             chose : le lien profond des mails de connexion. Ni l un ni
 *             l autre ne produit une origine `unfold://localhost`.
 *
 *   Android : `<server.androidScheme>://<server.hostname>`. Les deux clefs sont
 *             absentes elles aussi, donc scheme `https` par defaut, soit
 *             `https://localhost`.
 *
 * Si un jour `server.iosScheme` ou `server.androidScheme` apparait dans
 * capacitor.config.ts, il faut ajouter l origine correspondante ici, sinon
 * l app native se fait refuser ses appels.
 *
 * Origines admises (on renvoie l origine exacte — jamais de joker) :
 *   - capacitor://localhost           (WebView Capacitor iOS)
 *   - https://localhost               (WebView Capacitor Android)
 *   - http://localhost:3333           (dev local)
 *   - https://favorable.day           (production — cible par defaut de
 *                                      NEXT_PUBLIC_API_BASE, voir lib/api-client.ts)
 *   - https://unfold-nine.vercel.app  (domaine Vercel d origine)
 *
 * Usage — les DEUX sont necessaires. Le preflight seul ne suffit pas :
 * sans en-tete sur la reponse reelle, le navigateur jette quand meme le
 * resultat.
 *   export function OPTIONS(req) { return corsPreflightResponse(req); }
 *   // et dans GET/POST/DELETE : return withCors(req, NextResponse.json(...));
 */

import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set([
  "capacitor://localhost",
  "https://localhost",
  "http://localhost:3333",
  "https://favorable.day",
  "https://unfold-nine.vercel.app",
]);

function getAllowedOrigin(req: NextRequest): string {
  const origin = req.headers.get("origin") ?? "";
  return ALLOWED.has(origin) ? origin : "https://favorable.day";
}

// Generique sur Response, pas seulement NextResponse : /api/openai/personalize
// renvoie un flux SSE construit avec `new Response(stream, ...)`.
export function withCors<T extends Response>(req: NextRequest, res: T): T {
  res.headers.set("Access-Control-Allow-Origin", getAllowedOrigin(req));
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.append("Vary", "Origin");
  return res;
}

/**
 * Enrobe un gestionnaire de route pour que TOUTES ses reponses portent les
 * en-tetes CORS, sans avoir a toucher chaque `return` du fichier.
 */
export function corsHandler<Req extends NextRequest, Res extends Response>(
  handler: (req: Req) => Promise<Res> | Res,
): (req: Req) => Promise<Res> {
  return async (req: Req) => withCors(req, await handler(req));
}

export function corsPreflightResponse(req: NextRequest): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": getAllowedOrigin(req),
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type, x-unfold-internal",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
      Vary: "Origin",
    },
  });
}
