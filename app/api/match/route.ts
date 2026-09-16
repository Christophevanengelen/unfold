import { NextRequest, NextResponse } from "next/server";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";

/**
 * POST /api/match — le relais vers la compatibilité de Marie-Ange.
 *
 * Son point d'entrée : `POST /api/match` sur `ai.zebrapad.io`, documenté dans
 * `match.md` et `API-COMPLETE-DOCUMENTATION.md`. Il prend deux naissances
 * libres, répond en moins d'une seconde, et rend le calcul porté de son app
 * historique — pas une heuristique reconstruite.
 *
 * POURQUOI UN RELAIS PLUTÔT QU'UN APPEL DIRECT
 *
 *  - **Le http en clair.** Son adresse documentée est `http://`, et un appel
 *    direct depuis l'app native serait bloqué (ATS sur iOS) ou en clair sur le
 *    réseau. Le relais parle en `https` et sort côté serveur.
 *  - **L'origine.** `lib/api-client.ts` envoie tout vers notre domaine ; le
 *    navigateur n'a donc aucune requête inter-origine à autoriser.
 *  - **Une seule porte à surveiller.** Les journaux, le cache et les limites
 *    vivent ici, comme pour `/api/toctoc`.
 *
 * Aucune transformation : on relaie la réponse telle quelle. Le sens des
 * chiffres appartient au moteur ; leur mise en mots appartient à l'écran.
 */

const MATCH_URL = "https://ai.zebrapad.io/full-suite-spiritual-api/api/match";
/** Mesuré le 16/09/2026 : 0,8 s. La marge couvre une pointe, pas une panne. */
const DELAI_MS = 20000;

interface Personne {
  firstName?: string;
  birthDate?: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

async function handlePost(request: NextRequest) {
  try {
    const body = (await request.json()) as { person1?: Personne; person2?: Personne };
    const { person1, person2 } = body;

    // Deux naissances, sinon le calcul n'a pas de sens. On refuse ici plutôt
    // que de laisser le moteur répondre un score sur des données absentes.
    for (const [nom, p] of [["person1", person1], ["person2", person2]] as const) {
      if (!p?.birthDate || !p?.birthTime || !p?.timezone) {
        return NextResponse.json(
          { ok: false, raison: "naissance_incomplete", champ: nom },
          { status: 400 },
        );
      }
    }

    const res = await fetch(MATCH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person1, person2 }),
      signal: AbortSignal.timeout(DELAI_MS),
    });

    if (!res.ok) {
      console.error("[match] moteur HTTP", res.status);
      return NextResponse.json({ ok: false, raison: "moteur_indisponible" }, { status: 502 });
    }

    const brut = await res.json();

    // Le moteur emballe : il rend `{ success, data: { compatibility, … } }`,
    // et le contenu utile est au second niveau. On deballe ici plutot que dans
    // l ecran — la forme du transport appartient au relais, le sens des
    // chiffres appartient au moteur, et l ecran ne doit connaitre ni l un ni
    // l autre. Un moteur qui rendrait un jour la charge a plat continue de
    // passer : on ne deballe que si l enveloppe est la.
    const data =
      brut?.data && typeof brut.data === "object" && brut.data.compatibility ? brut.data : brut;

    if (!data?.compatibility) {
      return NextResponse.json({ ok: false, raison: "reponse_illisible" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, match: data });
  } catch (error) {
    const expire = error instanceof Error && error.name === "TimeoutError";
    console.error("[match]", error);
    return NextResponse.json(
      { ok: false, raison: expire ? "moteur_lent" : "erreur_interne" },
      { status: expire ? 504 : 500 },
    );
  }
}

export const POST = corsHandler(handlePost);

export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}
