import { NextRequest, NextResponse } from "next/server";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";

/**
 * Proxy for Open-Meteo geocoding API.
 * Free, no API key, returns lat/lng + timezone in one call.
 * https://open-meteo.com/en/docs/geocoding-api
 */
async function handleGet(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", q.trim());
    url.searchParams.set("count", "6");
    // La langue de la personne, pas « fr » en dur : l app est traduite en dix
    // langues, et quelqu un qui lit en japonais recevait des noms de villes en
    // francais. Liste fermee — la valeur part vers un service tiers.
    const LANGUES = new Set(["fr", "en", "es", "de", "it", "pt", "nl", "ja", "zh", "ar"]);
    const demandee = request.nextUrl.searchParams.get("lang") ?? "";
    url.searchParams.set("language", LANGUES.has(demandee) ? demandee : "en");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Unfold-App/1.0" },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}


export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// Les en-tetes CORS doivent etre sur la reponse REELLE, pas seulement sur le
// preflight : sans eux le navigateur jette le resultat malgre un preflight
// accepte. C est ce qui empechait l app d enregistrer les profils.
export const GET = corsHandler(handleGet);
