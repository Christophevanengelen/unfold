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

function getSRYear(birthDateStr: string, targetDateStr: string): number {
  const bd = new Date(birthDateStr + "T12:00:00Z");
  const td = new Date(targetDateStr + "T12:00:00Z");
  const year = td.getUTCFullYear();
  const birthdayThisYear = new Date(Date.UTC(year, bd.getUTCMonth(), bd.getUTCDate()));
  return birthdayThisYear <= td ? year : year - 1;
}

export async function GET(request: NextRequest) {
  try {
    const subject = await resolveAstrologySubject();
    const targetDate = resolveTargetDate(request);
    const { endpoint, input } = getCalculatorRequest(subject, "profection");

    const srYear = getSRYear(input.birthDate as string, targetDate);

    const [payload, srPayload] = await Promise.all([
      callCalculatorEndpoint(endpoint, { ...input, targetDate }),
      callCalculatorEndpoint("/api/solar-return", { ...input, returnYear: srYear }).catch(() => null),
    ]);

    if (payload.success === false) {
      return NextResponse.json(
        { error: typeof payload.error === "string" ? payload.error : "Failed to calculate profections" },
        { status: 500 }
      );
    }

    // Normalize: handle both { annualProfection, ... } and { profection: { annualProfection, ... } }
    const rawData = (payload.data ?? payload) as Record<string, unknown>;
    const data = ((rawData.profection as Record<string, unknown> | undefined) ?? rawData);
    const annualProfection = data.annualProfection as Record<string, unknown> | undefined;
    const annualLord = annualProfection?.ruler as string | undefined;
    const srData = srPayload ? ((srPayload.data ?? srPayload) as Record<string, unknown>) : null;
    const srPlanets = srData?.planets as Record<string, { house?: number }> | undefined;
    const srRulerHouse = annualLord && srPlanets?.[annualLord]?.house;
    if (annualProfection && srRulerHouse) {
      annualProfection.srRulerHouse = srRulerHouse;
    }

    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/profections]", err);
    return NextResponse.json({ error: "Failed to calculate profections" }, { status: 500 });
  }
}
