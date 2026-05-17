import { NextRequest, NextResponse } from "next/server";
import {
  AstrologySubjectError,
  getCalculatorRequest,
  resolveAstrologySubject,
} from "@/lib/astrology-subject";
import { callCalculatorEndpoint } from "@/lib/astrolearn-calculator";

export async function GET(_request: NextRequest) {
  try {
    const subject = await resolveAstrologySubject();
    const { endpoint, input } = getCalculatorRequest(subject, "toctoc-timeline");
    const wrapper = (await callCalculatorEndpoint(endpoint, input)) as Record<string, unknown>;
    const result = (wrapper?.data ?? wrapper) as Record<string, unknown>;

    if (!result || result.success === false) {
      return NextResponse.json(
        { error: (result as { error?: string }).error ?? "Calculation failed" },
        { status: 500 }
      );
    }

    type MonthEntry = {
      year: number;
      month: string;
      zrScore: number;
      transitScore: number;
      totalScore: number;
    };
    const monthly: MonthEntry[] = Array.isArray(result.monthlyTimeline)
      ? (result.monthlyTimeline as MonthEntry[])
      : [];

    const yearZR: Record<number, number> = {};
    for (const m of monthly) {
      yearZR[m.year] = (yearZR[m.year] ?? 0) + (m.zrScore ?? 0);
    }

    type YearEntry = {
      year: number;
      isBusy: boolean;
      sumScore: number;
      avgMonthScore: number;
      peakMonthScore: number;
      age: number;
    };
    const yearly: YearEntry[] = Array.isArray(result.yearlyTimeline)
      ? (result.yearlyTimeline as YearEntry[])
      : [];

    const chartYears = yearly.map((ye) => ({
      year: ye.year,
      age: ye.age,
      zrScore: yearZR[ye.year] ?? 0,
      isBusy: ye.isBusy,
      sumScore: ye.sumScore,
      avgMonthScore: ye.avgMonthScore,
      peakMonthScore: ye.peakMonthScore,
    }));

    return NextResponse.json({ chartYears, person: result.person });
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[/api/astrolearn/timeline]", err);
    return NextResponse.json({ error: "Failed to calculate timeline" }, { status: 500 });
  }
}
