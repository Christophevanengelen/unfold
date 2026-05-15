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
    const { searchParams } = request.nextUrl;
    const today = new Date().toISOString().split("T")[0];
    const startDate = searchParams.get("start") || today;
    const endDate =
      searchParams.get("end") ||
      (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        return d.toISOString().split("T")[0];
      })();

    const { endpoint, input } = getCalculatorRequest(subject, "transits-exact-short");
    const result = await callCalculatorEndpoint(endpoint, { ...input, startDate, endDate });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/transits]", err);
    return NextResponse.json({ error: "Failed to calculate transits" }, { status: 500 });
  }
}
