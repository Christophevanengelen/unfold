import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Temporary admin endpoint — grant lifetime premium to a user by email.
 * Protected by ADMIN_PASSWORD env var.
 * DELETE this file after use.
 *
 * POST /api/admin/grant-premium
 * Body: { email: string, password: string }
 */
export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const { email, password } = body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const db = getAdminClient();

  // Find user by email
  const { data: { users }, error: listErr } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

  const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return NextResponse.json({ error: `User not found: ${email}`, users: users.map(u => u.email) }, { status: 404 });

  const now = new Date().toISOString();
  const { error: upsertErr } = await db.from("subscriptions").upsert(
    {
      user_id: user.id,
      source: "stripe",
      status: "lifetime",
      product_id: "lifetime",
      external_subscription_id: `manual_lifetime_${user.id}`,
      current_period_end: "2099-12-31T23:59:59.000Z",
      created_at: now,
      updated_at: now,
    },
    { onConflict: "source,external_subscription_id" }
  );
  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, message: `${email} is now lifetime premium.`, userId: user.id });
}
