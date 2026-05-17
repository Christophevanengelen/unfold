import { NextRequest, NextResponse } from "next/server";
import {
  AstrologySubjectError,
  getCalculatorRequest,
  resolveAstrologySubject,
  type AstrologySubject,
} from "@/lib/astrology-subject";
import {
  callCalculatorEndpoint,
  callSpiritualChartData,
  normalizeChartDataPayload,
} from "@/lib/astrolearn-calculator";
import {
  type NatalLots,
} from "@/lib/astrolearn-natal-planets";

function extractNatalLots(payload: Record<string, unknown> | null): NatalLots | undefined {
  if (!payload) {
    return undefined;
  }

  const data = (payload.data ?? payload) as Record<string, unknown>;
  const parts = (data.parts ?? payload.parts) as Record<string, { longitude?: number }> | undefined;
  if (!parts || typeof parts !== "object") {
    return undefined;
  }

  return {
    fortune: parts.fortune,
    spirit: parts.spirit,
    eros: parts.eros,
  };
}

function enrichChartDataPayload(
  payload: ReturnType<typeof normalizeChartDataPayload>,
  subject: AstrologySubject,
  lots?: NatalLots
) {
  const data = payload.data as Record<string, unknown>;
  const existingPerson =
    typeof data.person === "object" && data.person !== null
      ? (data.person as Record<string, unknown>)
      : {};

  data.person = {
    ...existingPerson,
    name: subject.birth.label,
    birthDate: subject.birth.birthDate,
    birthTime: subject.birth.birthTime,
    city: subject.birth.city,
    timezone: subject.birth.timezone,
  };
  if (lots) {
    data.lots = lots;
  }
  return payload;
}

export async function GET(_request: NextRequest) {
  const startedAt = Date.now();
  try {
    const subjectStartedAt = Date.now();
    const subject = await resolveAstrologySubject();
    const subjectMs = Date.now() - subjectStartedAt;
    const { endpoint, input } = getCalculatorRequest(subject, "chart-data");
    const calculatorStartedAt = Date.now();
    const [payload, lotsPayload] = await Promise.all([
      callSpiritualChartData(endpoint, input),
      callCalculatorEndpoint("/api/arabic-parts", input).catch(() => null),
    ]);
    const calculatorMs = Date.now() - calculatorStartedAt;
    if (payload.success === false) {
      return NextResponse.json(
        { error: typeof payload.error === "string" ? payload.error : "Failed to calculate chart data" },
        { status: 500 }
      );
    }

    console.log("[/api/astrolearn/chart-data]", {
      subjectMs,
      calculatorMs,
      totalMs: Date.now() - startedAt,
      endpoint,
      source: subject.source,
      username: subject.username,
    });

    return NextResponse.json(
      enrichChartDataPayload(
        normalizeChartDataPayload(payload),
        subject,
        extractNatalLots(lotsPayload as Record<string, unknown> | null)
      )
    );
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/chart-data]", err);
    return NextResponse.json({ error: "Failed to calculate chart data" }, { status: 500 });
  }
}
