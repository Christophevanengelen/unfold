import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/billing/auth-helper";
import { getEntitlement } from "@/lib/billing/entitlement";
import { corsPreflightResponse } from "@/lib/cors";

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
export async function GET(req: NextRequest) {
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
