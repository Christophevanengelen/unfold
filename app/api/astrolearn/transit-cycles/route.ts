import { NextRequest, NextResponse } from "next/server";
import {
  AstrologySubjectError,
  getCalculatorRequest,
  resolveAstrologySubject,
} from "@/lib/astrology-subject";
import { callCalculatorEndpoint } from "@/lib/astrolearn-calculator";
import { normalizeTransitCyclesPayload } from "@/lib/transit-cycle-passes";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function resolveTargetDate(request: NextRequest): string {
  const requested = request.nextUrl.searchParams.get("date");
  if (requested && DATE_RE.test(requested)) {
    return requested;
  }
  return new Date().toISOString().split("T")[0];
}

export async function GET(request: NextRequest) {
  try {
    const subject = await resolveAstrologySubject();
    const targetDate = resolveTargetDate(request);
    const { endpoint, input } = getCalculatorRequest(subject, "transit-cycles");
    const result = await callCalculatorEndpoint(endpoint, { ...input, targetDate });
    return NextResponse.json(normalizeTransitCyclesPayload(result));
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/transit-cycles]", err);
    return NextResponse.json({ error: "Failed to calculate transit cycles" }, { status: 500 });
  }
}
