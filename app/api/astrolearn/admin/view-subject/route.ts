import { NextRequest, NextResponse } from "next/server";
import {
  applyViewSubjectCookie,
  ASTROLEARN_VIEW_SUBJECT_COOKIE,
  requireAdminSession,
  type ViewSubject,
} from "@/lib/astrolearn-auth";

function parseBodySubject(body: unknown): ViewSubject | null {
  if (!body || typeof body !== "object") return null;
  const candidate = body as Record<string, unknown>;
  const source = candidate.source;
  const label = typeof candidate.label === "string" ? candidate.label.trim() : "";

  if (source === "astrolearn") {
    const personId =
      typeof candidate.personId === "string"
        ? candidate.personId.trim()
        : typeof candidate.username === "string"
          ? candidate.username.trim()
          : "";
    const username =
      typeof candidate.username === "string" ? candidate.username.trim() : "";
    if (!personId || !label) return null;
    return {
      source: "astrolearn",
      personId,
      label,
      ...(username ? { username } : {}),
    };
  }

  if (source === "unfold") {
    const deviceId = typeof candidate.deviceId === "string" ? candidate.deviceId.trim() : "";
    if (!deviceId || !label) return null;
    return { source: "unfold", deviceId, label };
  }

  return null;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await request.json();
  const subject = parseBodySubject(body);
  if (!subject) {
    return NextResponse.json({ error: "Invalid view subject" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, viewSubject: subject });
  applyViewSubjectCookie(response, subject);
  return response;
}

export async function DELETE() {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ASTROLEARN_VIEW_SUBJECT_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
