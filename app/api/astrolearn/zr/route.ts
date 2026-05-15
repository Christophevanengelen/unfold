import { NextRequest, NextResponse } from "next/server";
import {
  AstrologySubjectError,
  getCalculatorRequest,
  resolveAstrologySubject,
} from "@/lib/astrology-subject";
import { callCalculatorEndpoint } from "@/lib/astrolearn-calculator";

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
    const { endpoint, input } = getCalculatorRequest(subject, "zodiacal-releasing");
    const result = await callCalculatorEndpoint(endpoint, {
      ...input,
      lotType: "spirit",
      maxLevels: 4,
      targetDate,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/zr]", err);
    return NextResponse.json({ error: "Failed to calculate ZR" }, { status: 500 });
  }
}
