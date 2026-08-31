import { NextRequest, NextResponse } from "next/server";
import { callCalculatorData } from "@/lib/astrolearn-calculator";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";

/**
 * POST /api/lifetime-report
 *
 * Calls the remote spiritual API (toctoc-sausage-html endpoint) to generate a fully
 * personalised 100-year sausage timeline.
 *
 * Body: { name, birthDate, birthTime, timezone, lat, lng }
 * Returns: text/html — the complete standalone chart page.
 */
async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, birthDate, birthTime, timezone, lat, lng } = body;

    if (!birthDate || !birthTime) {
      return NextResponse.json({ error: "Missing birth data" }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      name: (name || "You").trim(),
      birthDate,
      birthTime,
      timezone: timezone || "UTC",
    };
    if (lat != null) payload.latitude  = parseFloat(String(lat));
    if (lng != null) payload.longitude = parseFloat(String(lng));

    const data = await callCalculatorData<Record<string, unknown>>(
      "/api/toctoc-sausage-html",
      payload,
    );

    const html = data?.html as string | undefined;
    if (!html) {
      throw new Error("Calculator returned no HTML");
    }

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[/api/lifetime-report] report generation failed", error);
    return NextResponse.json(
      {
        error:
          "We couldn't generate your lifetime report right now. The chart service is temporarily unavailable — please try again in a few minutes.",
      },
      { status: 500 },
    );
  }
}


export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// Les en-tetes CORS doivent etre sur la reponse REELLE, pas seulement sur le
// preflight : sans eux le navigateur jette le resultat malgre un preflight
// accepte. C est ce qui empechait l app d enregistrer les profils.
export const POST = corsHandler(handlePost);
