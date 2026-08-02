import { NextRequest, NextResponse } from "next/server";
import { callEphemerisExpert } from "@/lib/astrolearn-calculator";
import {
  enrichNatalPlanetsForJump,
  getNatalLongitude,
  normalizeEphemerisPlanet,
  type NatalLots,
  type NatalPlanets,
} from "@/lib/astrolearn-natal-planets";
import {
  AstrologySubjectError,
  resolveAstrologySubject,
} from "@/lib/astrology-subject";
import {
  ASPECT_ANGLES,
  angularDistanceDeg,
  formatJumpEventDescription,
  longitudeToSignAndDegreeInSign,
  normalizeJumpDirection,
  normalizeJumpMatchMode,
  signDegreeToLongitude,
  type JumpDirection,
  type JumpMatchMode,
} from "@/lib/astrolearn-transit-jump";
import {
  dateKeyFromInstant,
  noonOnDateMs,
  todayTransitDate,
} from "@/lib/astrolearn-transit-time";

interface DegreeCriterionInput {
  planet: string;
  degree: number;
  minute: number;
  sign: string;
}

interface AspectCriterionInput {
  planet: string;
  aspect: string;
  target: "transit" | "natal";
  target_planet: string;
}

interface JumpEvent {
  datetime: string;
  description?: string;
}

function normalizePlanet(planet: string): string {
  return normalizeEphemerisPlanet(planet);
}

function getPayloadResult(payload: Record<string, unknown>): Record<string, unknown> {
  const data = (payload.data ?? payload) as Record<string, unknown>;
  return (data.result ?? data) as Record<string, unknown>;
}

function extractDegreeEvent(
  payload: Record<string, unknown>,
  direction: JumpDirection,
  fromInstantMs: number
): JumpEvent | null {
  const result = getPayloadResult(payload);
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
      : sorted.find((entry) => Date.parse(String(entry.datetime)) > fromInstantMs);

  if (!event || typeof event.datetime !== "string") {
    return null;
  }

  return {
    datetime: event.datetime,
    description:
      typeof event.description === "string"
        ? formatJumpEventDescription(event.description)
        : undefined,
  };
}

function extractAspectEvent(
  payload: Record<string, unknown>,
  direction: JumpDirection,
  fromInstantMs: number
): JumpEvent | null {
  const result = getPayloadResult(payload);
  const direct =
    direction === "previous"
      ? (result.previous as Record<string, unknown> | null | undefined)
      : (result.next as Record<string, unknown> | null | undefined);

  if (direct && typeof direct.datetime === "string") {
    return {
      datetime: direct.datetime,
      description:
        typeof direct.description === "string"
          ? formatJumpEventDescription(direct.description)
          : undefined,
    };
  }

  const nearby = result.all_nearby as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(nearby) || nearby.length === 0) {
    return null;
  }

  const sorted = [...nearby].sort(
    (left, right) =>
      Date.parse(String(left.datetime)) - Date.parse(String(right.datetime))
  );

  const event =
    direction === "previous"
      ? [...sorted]
          .filter((entry) => Date.parse(String(entry.datetime)) < fromInstantMs)
          .at(-1)
      : sorted.find((entry) => Date.parse(String(entry.datetime)) > fromInstantMs);

  if (!event || typeof event.datetime !== "string") {
    return null;
  }

  return {
    datetime: event.datetime,
    description:
      typeof event.description === "string"
        ? formatJumpEventDescription(event.description)
        : undefined,
  };
}

async function fetchPlanetLongitude(
  planet: string,
  date: string
): Promise<number | null> {
  const payload = await callEphemerisExpert({
    query_type: "planet_position",
    planet: normalizePlanet(planet),
    date,
  });

  if (payload.success === false) {
    return null;
  }

  const result = getPayloadResult(payload);
  const longitude = Number(result.longitude);
  return Number.isFinite(longitude) ? longitude : null;
}

async function findDegreeEvent(
  criterion: DegreeCriterionInput,
  direction: JumpDirection,
  fromDate: string,
  fromInstantMs: number,
  degreeInSignOverride?: number
): Promise<JumpEvent | null> {
  const degreeInSign =
    degreeInSignOverride ?? criterion.degree + criterion.minute / 60;
  const payload = await callEphemerisExpert({
    query_type: "planet_at_degree",
    planet: normalizePlanet(criterion.planet),
    degree: degreeInSign,
    sign: criterion.sign,
    direction,
    from_date: fromDate,
  });

  if (payload.success === false) {
    return null;
  }

  return extractDegreeEvent(payload, direction, fromInstantMs);
}

async function findAspectEvent(
  criterion: AspectCriterionInput,
  direction: JumpDirection,
  fromDate: string,
  fromInstantMs: number,
  natalPlanets: NatalPlanets
): Promise<JumpEvent | null> {
  const aspect = criterion.aspect.trim().toLowerCase();
  const aspectAngle = ASPECT_ANGLES[aspect];
  if (aspectAngle === undefined) {
    return null;
  }

  if (criterion.target === "natal") {
    const natalLongitude = getNatalLongitude(natalPlanets, criterion.target_planet);
    if (natalLongitude === null) {
      return null;
    }

    const targetLongitude = ((natalLongitude + aspectAngle) % 360 + 360) % 360;
    const { sign, degreeInSign } = longitudeToSignAndDegreeInSign(targetLongitude);
    return findDegreeEvent(
      {
        planet: criterion.planet,
        degree: Math.floor(degreeInSign),
        minute: Math.floor((degreeInSign - Math.floor(degreeInSign)) * 60),
        sign,
      },
      direction,
      fromDate,
      fromInstantMs,
      degreeInSign
    );
  }

  const payload = await callEphemerisExpert({
    query_type: "next_aspect",
    planet1: normalizePlanet(criterion.planet),
    planet2: normalizePlanet(criterion.target_planet),
    aspect,
    from_date: fromDate,
  });

  if (payload.success === false) {
    return null;
  }

  return extractAspectEvent(payload, direction, fromInstantMs);
}

async function isCriterionSatisfiedAt(
  criterion: DegreeCriterionInput | AspectCriterionInput,
  instantMs: number,
  natalPlanets: NatalPlanets,
  timeZone: string
): Promise<boolean> {
  const date = dateKeyFromInstant(instantMs, timeZone);
  const orb = 0.25;

  if ("sign" in criterion) {
    const targetLongitude = signDegreeToLongitude(
      criterion.sign,
      criterion.degree,
      criterion.minute
    );
    if (targetLongitude === null) {
      return false;
    }

    const longitude = await fetchPlanetLongitude(criterion.planet, date);
    if (longitude === null) {
      return false;
    }

    return angularDistanceDeg(longitude, targetLongitude) <= orb;
  }

  const aspectAngle = ASPECT_ANGLES[criterion.aspect.trim().toLowerCase()];
  if (aspectAngle === undefined) {
    return false;
  }

  const movingLongitude = await fetchPlanetLongitude(criterion.planet, date);
  if (movingLongitude === null) {
    return false;
  }

  let targetLongitude: number | null = null;
  if (criterion.target === "natal") {
    targetLongitude = getNatalLongitude(natalPlanets, criterion.target_planet);
  } else {
    targetLongitude = await fetchPlanetLongitude(criterion.target_planet, date);
  }

  if (targetLongitude === null) {
    return false;
  }

  const separation = angularDistanceDeg(movingLongitude, targetLongitude);
  return angularDistanceDeg(separation, aspectAngle) <= orb;
}

function pickCombinedInstant(
  events: JumpEvent[],
  direction: JumpDirection,
  match: JumpMatchMode,
  fromInstantMs: number
): number | null {
  const instants = events
    .map((event) => Date.parse(event.datetime))
    .filter((value) => Number.isFinite(value));

  if (instants.length === 0) {
    return null;
  }

  if (match === "any") {
    const filtered =
      direction === "previous"
        ? instants.filter((value) => value < fromInstantMs)
        : instants.filter((value) => value > fromInstantMs);
    const pool = filtered.length > 0 ? filtered : instants;
    return direction === "previous" ? Math.max(...pool) : Math.min(...pool);
  }

  return direction === "previous" ? Math.min(...instants) : Math.max(...instants);
}

function buildDescription(events: JumpEvent[]): string | undefined {
  const descriptions = events
    .map((event) => event.description)
    .filter((value): value is string => Boolean(value));
  if (descriptions.length === 0) {
    return undefined;
  }
  return descriptions.join(" · ");
}

async function resolveTransitTimeZone(body: Record<string, unknown>): Promise<string> {
  if (typeof body.timezone === "string" && body.timezone.trim()) {
    return body.timezone.trim();
  }

  try {
    const subject = await resolveAstrologySubject();
    return subject.birth.timezone;
  } catch (err) {
    if (err instanceof AstrologySubjectError) {
      return "UTC";
    }
    throw err;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transitTimeZone = await resolveTransitTimeZone(body);
    const direction = normalizeJumpDirection(body.direction);
    const match = normalizeJumpMatchMode(body.match);
    const fromDate =
      typeof body.from_date === "string" && body.from_date
        ? body.from_date
        : todayTransitDate(transitTimeZone);
    const fromInstantMs =
      typeof body.from_datetime === "string" && body.from_datetime
        ? Date.parse(body.from_datetime)
        : noonOnDateMs(fromDate, transitTimeZone);
    const natalPlanets = enrichNatalPlanetsForJump(
      (body.natal_planets ?? {}) as NatalPlanets,
      (body.natal_lots ?? undefined) as NatalLots | undefined
    );
    const degreeCriteria = Array.isArray(body.degrees)
      ? (body.degrees as DegreeCriterionInput[])
      : [];
    const aspectCriteria = Array.isArray(body.aspects)
      ? (body.aspects as AspectCriterionInput[])
      : [];

    if (!Number.isFinite(fromInstantMs)) {
      return NextResponse.json({ error: "Invalid from date." }, { status: 400 });
    }

    if (degreeCriteria.length === 0 && aspectCriteria.length === 0) {
      return NextResponse.json(
        { error: "Add at least one degree or aspect criterion." },
        { status: 400 }
      );
    }

    for (const criterion of degreeCriteria) {
      const degreeInSign = criterion.degree + criterion.minute / 60;
      if (
        !criterion.planet ||
        !criterion.sign ||
        !Number.isFinite(criterion.degree) ||
        !Number.isFinite(criterion.minute) ||
        criterion.degree < 0 ||
        criterion.degree > 29 ||
        criterion.minute < 0 ||
        criterion.minute > 59 ||
        degreeInSign >= 30
      ) {
        return NextResponse.json({ error: "Invalid degree criterion." }, { status: 400 });
      }
    }

    for (const criterion of aspectCriteria) {
      if (
        !criterion.planet ||
        !criterion.target_planet ||
        !criterion.aspect ||
        ASPECT_ANGLES[criterion.aspect.trim().toLowerCase()] === undefined ||
        (criterion.target !== "transit" && criterion.target !== "natal")
      ) {
        return NextResponse.json({ error: "Invalid aspect criterion." }, { status: 400 });
      }

      if (
        criterion.target === "natal" &&
        getNatalLongitude(natalPlanets, criterion.target_planet) === null
      ) {
        return NextResponse.json(
          { error: `Natal position missing for ${criterion.target_planet}.` },
          { status: 400 }
        );
      }
    }

    const criteria: Array<DegreeCriterionInput | AspectCriterionInput> = [
      ...degreeCriteria,
      ...aspectCriteria,
    ];

    let anchorInstant = fromInstantMs;
    let anchorDate = fromDate;

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const events = (
        await Promise.all(
          criteria.map((criterion) =>
            "sign" in criterion
              ? findDegreeEvent(criterion, direction, anchorDate, anchorInstant)
              : findAspectEvent(criterion, direction, anchorDate, anchorInstant, natalPlanets)
          )
        )
      ).filter((event): event is JumpEvent => Boolean(event));

      if (events.length === 0) {
        break;
      }

      if (match === "any") {
        const targetInstant = pickCombinedInstant(events, direction, match, anchorInstant);
        if (targetInstant === null) {
          break;
        }

        const event =
          events.find((entry) => Date.parse(entry.datetime) === targetInstant) ?? events[0];
        return NextResponse.json({
          success: true,
          data: {
            direction,
            match,
            datetime: event.datetime,
            description: event.description ?? buildDescription(events),
          },
        });
      }

      const targetInstant = pickCombinedInstant(events, direction, match, anchorInstant);
      if (targetInstant === null) {
        break;
      }

      const event =
        events.find((entry) => Date.parse(entry.datetime) === targetInstant) ?? events[0];

      if (criteria.length === 1) {
        return NextResponse.json({
          success: true,
          data: {
            direction,
            match,
            datetime: event.datetime,
            description: event.description ?? buildDescription(events),
          },
        });
      }

      const satisfied = await Promise.all(
        criteria.map((criterion) =>
          isCriterionSatisfiedAt(criterion, targetInstant, natalPlanets, transitTimeZone)
        )
      );

      if (satisfied.every(Boolean)) {
        return NextResponse.json({
          success: true,
          data: {
            direction,
            match,
            datetime: new Date(targetInstant).toISOString(),
            description: buildDescription(events),
          },
        });
      }

      const nextAnchorInstant = Date.parse(event.datetime);
      if (!Number.isFinite(nextAnchorInstant) || nextAnchorInstant === anchorInstant) {
        break;
      }

      anchorInstant = nextAnchorInstant;
      anchorDate = dateKeyFromInstant(anchorInstant, transitTimeZone);
    }

    const directionLabel = direction === "previous" ? "previous" : "next";
    return NextResponse.json(
      { error: `No ${directionLabel} match found for the selected criteria.` },
      { status: 404 }
    );
  } catch (err) {
    console.error("[/api/astrolearn/transit-jump]", err);
    return NextResponse.json({ error: "Failed to find the requested transit jump." }, { status: 500 });
  }
}
