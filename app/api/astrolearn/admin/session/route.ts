import { NextRequest, NextResponse } from "next/server";
import { getAstrolearnAuthState } from "@/lib/astrolearn-auth";

export async function GET() {
  const { sessionUser, isAdmin, viewSubject } = await getAstrolearnAuthState();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    username: sessionUser,
    isAdmin,
    viewSubject,
  });
}
