/**
 * POST /api/openai/connection-delineation
 *
 * Sends one ActivePeriod's raw astrological data to OpenAI using
 * connection-prompt.md as the system prompt.
 * Returns structured ConnectionDelineation JSON.
 *
 * Cache: client-side (IndexedDB, 7 days) — see lib/connection-delineation.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// ─── Load system prompt ────────────────────────────────────
// Extract just the "SYSTEM PROMPT" code block from the markdown file.

function loadSystemPrompt(): string {
  const raw = readFileSync(
    join(process.cwd(), "connection-prompt.md"),
    "utf-8",
  );
  // Extract the content of the ```...``` block that follows "## SYSTEM PROMPT"
  const match = raw.match(/## SYSTEM PROMPT\s*\n```[^\n]*\n([\s\S]*?)\n```/);
  if (match?.[1]) return match[1].trim();
  // Fallback: strip markdown headings and code fences
  return raw
    .replace(/^#+\s.*$/gm, "")
    .replace(/```[\s\S]*?```/gm, "")
    .trim();
}

// NOTE: prompt is loaded on every request so that changes to
// connection-prompt.md take effect without a server restart.

// ─── OpenAI config ─────────────────────────────────────────

const OPENAI_MODEL = "gpt-4o";

// ─── Route handler ─────────────────────────────────────────

export async function POST(req: NextRequest) {
  const SYSTEM_PROMPT = loadSystemPrompt();
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: "json_object" },
      max_tokens: 1200,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(body) },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const err = await openaiRes.json().catch(() => ({}));
    console.error("[connection-delineation] OpenAI error:", openaiRes.status, err);
    return NextResponse.json(
      { error: "OpenAI API error", status: openaiRes.status },
      { status: 502 },
    );
  }

  const result = await openaiRes.json();
  const text = result.choices?.[0]?.message?.content ?? "{}";

  try {
    return NextResponse.json(JSON.parse(text));
  } catch {
    console.error("[connection-delineation] Failed to parse OpenAI response:", text.slice(0, 200));
    return NextResponse.json(
      { error: "Invalid LLM response" },
      { status: 500 },
    );
  }
}
