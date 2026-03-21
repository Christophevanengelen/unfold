import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://ai.zebrapad.io/full-suite-spiritual-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint = "toctoc-year", ...birthData } = body;

    const allowedEndpoints = [
      "toctoc",
      "toctoc-app",
      "toctoc-year",
      "toctoc-timeline",
    ];
    if (!allowedEndpoints.includes(endpoint)) {
      return NextResponse.json(
        { error: "Invalid endpoint" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE_URL}/${endpoint}.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(birthData),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "API request failed", details: String(error) },
      { status: 500 }
    );
  }
}
