/**
 * POST   /api/astrologue/session   { deviceId, birthData, locale?, subject? } → { sessionId }
 * GET    /api/astrologue/session?sessionId=  → { session, messages }
 * DELETE /api/astrologue/session?sessionId=  → archive (jamais de suppression dure)
 *
 * Pas de depense OpenAI ici, donc pas de lib/ai-guard.ts — seulement le CORS
 * partage par toutes les routes appelees par l app (lib/cors.ts).
 */

import { NextRequest, NextResponse } from "next/server";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";
import {
  creerSession,
  chargerSession,
  chargerMessages,
  archiverSession,
} from "@/lib/astrologue-session";
import type { BirthDataPayload } from "@/lib/astrologue-routeur";

async function handlePost(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, birthData, locale, subject } = body as {
      deviceId?: string;
      birthData?: BirthDataPayload;
      locale?: string;
      subject?: { kind: "other"; connectionId: string };
    };

    if (!deviceId) {
      return NextResponse.json({ ok: false, raison: "device_manquant" }, { status: 400 });
    }
    if (!birthData?.birthDate || !birthData?.birthTime || !birthData?.timezone) {
      return NextResponse.json({ ok: false, raison: "birthdata_manquant" }, { status: 400 });
    }

    const session = await creerSession({
      deviceId,
      birthData,
      locale,
      subjectKind: subject?.kind === "other" ? "other" : "self",
      subjectConnectionId: subject?.kind === "other" ? subject.connectionId : null,
    });

    return NextResponse.json({ ok: true, sessionId: session.id });
  } catch (error) {
    console.error("[astrologue/session] POST error:", error);
    return NextResponse.json({ ok: false, raison: "erreur_interne" }, { status: 500 });
  }
}

async function handleGet(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ ok: false, raison: "session_manquante" }, { status: 400 });
    }
    const session = await chargerSession(sessionId);
    if (!session) {
      return NextResponse.json({ ok: false, raison: "session_introuvable" }, { status: 404 });
    }
    const messages = await chargerMessages(sessionId, 100);
    return NextResponse.json({
      ok: true,
      session: { id: session.id, status: session.status, turnCount: session.turn_count, locale: session.locale },
      messages: messages.map((m) => ({ role: m.role, content: m.content, turn: m.turn, createdAt: m.created_at })),
    });
  } catch (error) {
    console.error("[astrologue/session] GET error:", error);
    return NextResponse.json({ ok: false, raison: "erreur_interne" }, { status: 500 });
  }
}

async function handleDelete(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ ok: false, raison: "session_manquante" }, { status: 400 });
    }
    await archiverSession(sessionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[astrologue/session] DELETE error:", error);
    return NextResponse.json({ ok: false, raison: "erreur_interne" }, { status: 500 });
  }
}

export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export const POST = corsHandler(handlePost);
export const GET = corsHandler(handleGet);
export const DELETE = corsHandler(handleDelete);
