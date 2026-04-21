import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy for Open-Meteo geocoding API.
 * Free, no API key, returns lat/lng + timezone in one call.
 * https://open-meteo.com/en/docs/geocoding-api
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", q.trim());
    url.searchParams.set("count", "6");
    url.searchParams.set("language", "fr");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Unfold-App/1.0" },
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
