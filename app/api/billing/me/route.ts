import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";
import { getEntitlement } from "@/lib/billing/entitlement";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export function OPTIONS(req: NextRequest) { return corsPreflightResponse(req); }

/**
 * GET /api/billing/me
 *
 * Returns the current user's entitlement state.
 * Used by client-side premium gate to avoid localStorage spoofing.
 *
 * Response: { plan, status, current_period_end, trial_end, features }
 */
async function handleGet(req: NextRequest) {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json(
      { plan: "free", status: "unauthenticated", features: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const entitlement = await getEntitlement(userId);

  return NextResponse.json(entitlement, {
    headers: { "Cache-Control": "no-store" },
  });
}

// Les en-tetes CORS doivent etre sur la reponse reelle, pas seulement sur le preflight.
export const GET = corsHandler(handleGet);
