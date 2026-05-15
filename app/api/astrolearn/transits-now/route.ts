import { NextRequest, NextResponse } from "next/server";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (date !== null && !DATE_RE.test(date)) {
    return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
  }

  try {
    const url = `http://localhost:3001/api/transits-now${date ? `?date=${date}` : ""}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      return NextResponse.json({ error: "Failed to calculate current transits" }, { status: 500 });
    }
    return NextResponse.json(await resp.json());
  } catch (err) {
    console.error("[/api/astrolearn/transits-now]", err);
    return NextResponse.json({ error: "Failed to calculate current transits" }, { status: 500 });
  }
}
