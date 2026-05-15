import { NextRequest, NextResponse } from "next/server";
import { callEphemerisExpert } from "@/lib/astrolearn-calculator";
import { normalizeEphemerisPlanet } from "@/lib/astrolearn-natal-planets";
import { formatJumpEventDescription } from "@/lib/astrolearn-transit-jump";

const SIGN_RE = /^[A-Za-z]+$/;

type JumpDirection = "next" | "previous";

function normalizePlanet(planet: string): string {
  return normalizeEphemerisPlanet(planet);
}

function formatDegreeMinuteLabel(degree: number, minute: number): string {
  return `${degree}° ${String(minute).padStart(2, "0")}'`;
}

function normalizeJumpDirection(value: unknown): JumpDirection {
  return String(value ?? "next").toLowerCase() === "previous" ? "previous" : "next";
}

function extractCrossingEvent(
  payload: Record<string, unknown>,
  direction: JumpDirection,
  fromInstantMs: number
) {
  const data = (payload.data ?? payload) as Record<string, unknown>;
  const result = (data.result ?? data) as Record<string, unknown>;
  const events = result.events as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(events) || events.length === 0) {
    return null;
  }

  const sorted = [...events].sort(
    (left, right) =>
      Date.parse(String(left.datetime)) - Date.parse(String(right.datetime))
  );

  const event =
    direction === "previous"
      ? [...sorted]
          .filter((entry) => Date.parse(String(entry.datetime)) < fromInstantMs)
          .at(-1)
      : sorted.find((entry) => Date.parse(String(entry.datetime)) > fromInstantMs) ?? sorted[0];

  if (!event) {
    return null;
  }

  const datetime = typeof event.datetime === "string" ? event.datetime : null;
  if (!datetime) {
    return null;
  }

  return {
    datetime,
    description:
      typeof event.description === "string"
        ? formatJumpEventDescription(event.description)
        : undefined,
    motion: typeof event.motion === "string" ? event.motion : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const planet = normalizePlanet(String(body.planet ?? ""));
    const sign = String(body.sign ?? "").trim();
    const degree = Number(body.degree);
    const minute = Number(body.minute ?? 0);
    const direction = normalizeJumpDirection(body.direction);
    const fromDate =
      typeof body.from_date === "string" && body.from_date
        ? body.from_date
        : new Date().toISOString().slice(0, 10);
    const fromInstantMs =
      typeof body.from_datetime === "string" && body.from_datetime
        ? Date.parse(body.from_datetime)
        : Date.parse(`${fromDate}T12:00:00.000Z`);

    if (!planet) {
      return NextResponse.json({ error: "Planet is required." }, { status: 400 });
    }
    if (!SIGN_RE.test(sign)) {
      return NextResponse.json({ error: "Sign is required." }, { status: 400 });
    }
    if (!Number.isFinite(degree) || degree < 0 || degree > 29) {
      return NextResponse.json({ error: "Degree must be between 0 and 29." }, { status: 400 });
    }
    if (!Number.isFinite(minute) || minute < 0 || minute > 59) {
      return NextResponse.json({ error: "Minute must be between 0 and 59." }, { status: 400 });
    }
    if (!Number.isFinite(fromInstantMs)) {
      return NextResponse.json({ error: "Invalid from date." }, { status: 400 });
    }

    const degreeInSign = degree + minute / 60;
    if (degreeInSign >= 30) {
      return NextResponse.json(
        { error: "Degree and minute must stay within the same sign." },
        { status: 400 }
      );
    }

    const payload = await callEphemerisExpert({
      query_type: "planet_at_degree",
      planet,
      degree: degreeInSign,
      sign,
      direction,
      from_date: fromDate,
    });

    if (payload.success === false) {
      return NextResponse.json(
        { error: typeof payload.error === "string" ? payload.error : "Position search failed." },
        { status: 500 }
      );
    }

    const event = extractCrossingEvent(payload, direction, fromInstantMs);
    const positionLabel = `${formatDegreeMinuteLabel(Math.floor(degree), Math.floor(minute))} ${sign}`;
    const directionLabel = direction === "previous" ? "previous" : "next";
    if (!event) {
      return NextResponse.json(
        { error: `No ${directionLabel} crossing found for ${planet} at ${positionLabel}.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        planet,
        degree: Math.floor(degree),
        minute: Math.floor(minute),
        sign,
        direction,
        from_date: fromDate,
        ...event,
      },
    });
  } catch (err) {
    console.error("[/api/astrolearn/position-jump]", err);
    return NextResponse.json({ error: "Failed to find the requested position." }, { status: 500 });
  }
}
