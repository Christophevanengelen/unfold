import { NextRequest, NextResponse } from "next/server";
import { callCalculatorEndpoint } from "@/lib/astrolearn-calculator";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (date !== null && !DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }

  try {
    const endpoint = date ? `/api/transits-now?date=${date}` : "/api/transits-now";
    const payload = await callCalculatorEndpoint(endpoint, date ? { date } : {});
    if (payload.success === false) {
      return NextResponse.json(
        { error: typeof payload.error === "string" ? payload.error : "Failed to calculate current transits" },
        { status: 500 }
      );
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[/api/astrolearn/transits-now]", err);
    return NextResponse.json({ error: "Failed to calculate current transits" }, { status: 500 });
  }
}
