import { NextRequest, NextResponse } from "next/server";
import {
  AstrologySubjectError,
  getCalculatorRequest,
  resolveAstrologySubject,
} from "@/lib/astrology-subject";
import { callCalculatorEndpoint } from "@/lib/astrolearn-calculator";

export async function GET(request: NextRequest) {
  try {
    const subject = await resolveAstrologySubject();
    const yearParam = request.nextUrl.searchParams.get("year");
    const returnYear = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    const { input } = getCalculatorRequest(subject, "chart-data");
    const payload = await callCalculatorEndpoint("/api/solar-return", {
      ...input,
      returnYear,
    });

    if (payload.success === false) {
      return NextResponse.json(
        { error: "Failed to calculate solar return" },
        { status: 500 }
      );
    }

    return NextResponse.json(payload);
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/solar-return]", err);
    return NextResponse.json({ error: "Failed to calculate solar return" }, { status: 500 });
  }
}
