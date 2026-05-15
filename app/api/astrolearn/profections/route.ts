import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const username = cookieStore.get("astrolearn_session")?.value;

  if (!username) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const resp = await fetch(`http://localhost:3001/api/profection/${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (!resp.ok) {
      return NextResponse.json({ error: "Failed to calculate profections" }, { status: 500 });
    }
    return NextResponse.json(await resp.json());
  } catch (err) {
    console.error("[/api/astrolearn/profections]", err);
    return NextResponse.json({ error: "Failed to calculate profections" }, { status: 500 });
  }
}
