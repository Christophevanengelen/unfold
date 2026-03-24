/**
 * POST /api/openai/personalize
 *
 * Two-step pipeline:
 * 1. Call Marie Ange's toctoc-boudin-detail.php → get systemPrompt + llmPayload
 * 2. Send to OpenAI with user profile context → get personalized delineation
 *
 * Marie Ange's API provides category-specific prompts (transit/eclipse/station/zr)
 * with all archetypes and keywords inline. We add the user profile layer on top.
 *
 * Rate-limited to 30 calls/minute per session.
 */

import { NextRequest, NextResponse } from "next/server";

// ─── Config ──────────────────────────────────────────────

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const OPENAI_MODEL = "gpt-4o-mini";

// ─── Rate limiting ───────────────────────────────────────

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Clean stale entries every 5 minutes
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
  }, 5 * 60 * 1000);
}

// ─── User profile injection (GPT-validated rules) ───────

function buildUserProfileContext(
  userProfile: Record<string, unknown> | null
): string {
  if (!userProfile) return "";

  const lines: string[] = [
    "\n\n--- RÈGLES DE VOIX UNFOLD ---",
    "Vocabulaire autorisé : signal, momentum, fenêtre, période, timing, rythme, terrain, domaine, intensité.",
    "Vocabulaire interdit : énergie, chance, destin, univers, vibration, cosmique, astral, nourrir ton esprit, attirer, aligner, harmoniser.",
    "Nomme toujours la planète et le domaine de vie concret. Mentionne la période/durée. Calibre selon l'intensité.",
    "Chaque phrase doit être spécifique à CE signal. Rien de générique.",
    "",
    "--- CONTEXTE UTILISATEUR ---",
  ];

  if (userProfile.lifePhase) {
    const phases: Record<string, string> = {
      stable: "Phase de consolidation — angle : ajustement, continuité",
      transition: "Phase de transition — angle : pivot, réorientation, clarification",
      crisis: "Phase de crise — angle : protection, recentrage, simplification. Ton contenant, pas alarmiste.",
      reconstruction: "Phase de reconstruction — angle : reprise, redéfinition",
      expansion: "Phase d'expansion — angle : croissance, opportunité, déploiement",
    };
    lines.push(`Phase de vie : ${phases[userProfile.lifePhase as string] ?? userProfile.lifePhase}`);
  }

  if (userProfile.effectivePriorities) {
    const source = userProfile.prioritySource ?? "declared";
    lines.push(`Priorités (${source}) : ${(userProfile.effectivePriorities as string[]).join(", ")}`);
    if (source === "observed") {
      lines.push("⚠ Priorités observées (pas déclarées) — personnaliser avec prudence, ne pas sur-affirmer.");
    }
  }

  if (userProfile.effectiveStyle) {
    const styles: Record<string, string> = {
      direct: "Style direct — net, court, sans détour",
      reassuring: "Style rassurant — doux, contenant, pas alarmiste",
      inspiring: "Style inspirant — mobilisateur, visionnaire",
      pragmatic: "Style pragmatique — concret, actionnable, utilitaire",
    };
    lines.push(`Ton : ${styles[userProfile.effectiveStyle as string] ?? userProfile.effectiveStyle}`);
  }

  if (userProfile.effectiveStress === "high") {
    lines.push("⚠ Stress élevé — éviter formulations alarmistes, rester concret et contenant.");
  }

  if (userProfile.currentGoal) {
    lines.push(`Objectif actuel : ${userProfile.currentGoal}`);
  }

  if (userProfile.workStatus) {
    lines.push(`Situation pro : ${userProfile.workStatus}`);
  }

  if (userProfile.relationshipStatus) {
    lines.push(`Situation relationnelle : ${userProfile.relationshipStatus}`);
  }

  lines.push("--- FIN CONTEXTE UTILISATEUR ---");
  return lines.join("\n");
}

// ─── Route handler ───────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const sessionKey =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anonymous";

  if (isRateLimited(sessionKey)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { birthData, boudinId, boudinIndex, userProfile } = body;

    if (!birthData || (boudinId === undefined && boudinIndex === undefined)) {
      return NextResponse.json({ error: "Missing birthData or boudinId/boudinIndex" }, { status: 400 });
    }

    // ── Step 1: Get category-specific prompt + payload from Marie Ange's API ──
    // Prefer boudinId (stable across calls) over boudinIndex (position-dependent)
    const detailBody: Record<string, unknown> = {
      birthDate: birthData.birthDate,
      birthTime: birthData.birthTime,
      latitude: birthData.latitude,
      longitude: birthData.longitude,
      timezone: birthData.timezone ?? "Europe/Brussels",
    };
    if (boudinId !== undefined) {
      detailBody.boudinId = boudinId;
    } else {
      detailBody.boudinIndex = boudinIndex;
    }

    const detailRes = await fetch(`${TOCTOC_BASE}/toctoc-boudin-detail.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(detailBody),
    });

    if (!detailRes.ok) {
      return NextResponse.json(
        { error: "TocToc detail API error", status: detailRes.status },
        { status: 502 }
      );
    }

    const detail = await detailRes.json();
    const systemPrompt = detail.systemPrompt ?? detail.data?.systemPrompt;
    const llmPayload = detail.llmPayload ?? detail.data?.llmPayload;

    // ── DEBUG: trace pipeline for Marie Ange audit ──
    console.log("[AUDIT] === PIPELINE TRACE ===");
    console.log("[AUDIT] Input:", JSON.stringify({ boudinId, boudinIndex, birthDate: birthData.birthDate }));
    console.log("[AUDIT] TocToc request body:", JSON.stringify(detailBody));
    console.log("[AUDIT] TocToc response keys:", Object.keys(detail));
    console.log("[AUDIT] systemPrompt length:", systemPrompt?.length ?? "MISSING");
    console.log("[AUDIT] systemPrompt first 200 chars:", systemPrompt?.substring(0, 200));
    console.log("[AUDIT] llmPayload keys:", llmPayload ? Object.keys(llmPayload) : "MISSING");
    console.log("[AUDIT] llmPayload critical fields:", JSON.stringify({
      category: llmPayload?.category,
      transitPlanet: llmPayload?.transitPlanet,
      natalPoint: llmPayload?.natalPoint,
      aspect: llmPayload?.aspect,
      score: llmPayload?.score,
      startDate: llmPayload?.startDate,
      endDate: llmPayload?.endDate,
      topics: llmPayload?.topics?.map((t: { house?: number; topic?: string }) => ({ house: t.house, topic: t.topic })),
    }));
    // ── Log cycle + lifetime data from Marie Ange's detail endpoint ──
    console.log("[AUDIT] llmPayload cycle/lifetime:", JSON.stringify({
      cycle: llmPayload?.cycle,
      hitNumber: llmPayload?.hitNumber,
      totalHits: llmPayload?.totalHits,
      lifetimeNumber: llmPayload?.lifetimeNumber,
      lifetimeTotal: llmPayload?.lifetimeTotal,
      lifetimeCount: llmPayload?.lifetimeCount,
      occurrenceCount: llmPayload?.occurrenceCount,
      sameTransitCount: llmPayload?.sameTransitCount,
      pattern: llmPayload?.pattern,
    }));
    console.log("[AUDIT] llmPayload ALL keys:", Object.keys(llmPayload || {}));
    console.log("[AUDIT] === END TRACE ===");

    if (!systemPrompt || !llmPayload) {
      return NextResponse.json(
        { error: "Missing systemPrompt or llmPayload from TocToc API" },
        { status: 502 }
      );
    }

    // ── Step 2: Add user profile context to the system prompt ──
    const userContext = buildUserProfileContext(userProfile);
    const fullSystemPrompt = systemPrompt + userContext;

    // ── Step 3: Call OpenAI ──
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: JSON.stringify(llmPayload) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      console.error("[OpenAI] API error:", openaiRes.status, err);
      return NextResponse.json(
        { error: "OpenAI API error", status: openaiRes.status },
        { status: 502 }
      );
    }

    const data = await openaiRes.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "Empty response from OpenAI" }, { status: 502 });
    }

    // ── Step 4: Parse and return Marie Ange's format ──
    console.log("[AUDIT] OpenAI raw response:", content.substring(0, 500));
    const parsed = JSON.parse(content);
    console.log("[AUDIT] Parsed output planets mentioned:", JSON.stringify({
      titre: parsed.titre,
      domainesActives: parsed.domainesActives,
    }));

    return NextResponse.json({
      // Marie Ange's format (from OpenAI)
      titre: parsed.titre ?? "",
      sousTitre: parsed.sousTitre ?? "",
      corps: parsed.corps ?? "",
      avecLeRecul: parsed.avecLeRecul ?? "",
      domainesActives: parsed.domainesActives ?? [],
      intensite: parsed.intensite ?? 0,
      hitInfo: parsed.hitInfo ?? null,
      lifetimeInfo: parsed.lifetimeInfo ?? null,
      convergenceNote: parsed.convergenceNote ?? null,
      // Raw cycle/lifetime data from boudin-detail endpoint (for direct display)
      rawCycle: llmPayload?.cycle ?? null,
      rawLifetime: {
        number: llmPayload?.lifetimeNumber ?? llmPayload?.lifetimeCount ?? llmPayload?.occurrenceNumber ?? null,
        total: llmPayload?.lifetimeTotal ?? llmPayload?.totalLifetime ?? llmPayload?.occurrenceCount ?? llmPayload?.sameTransitCount ?? null,
      },
      // Backward compat (our original format)
      story: parsed.corps ?? "",
      insight: parsed.sousTitre ?? "",
      guidance: parsed.avecLeRecul ?? "",
    });
  } catch (error) {
    console.error("[OpenAI] Personalize error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
