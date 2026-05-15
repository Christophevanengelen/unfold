import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const CALCULATOR_DIR = "D:\\51.full-suite-api";

async function callCalculator(endpoint: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const id = `lr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const tmpDir = os.tmpdir();
  const inputFile  = path.join(tmpDir, `${id}_input.json`);
  const outputFile = path.join(tmpDir, `${id}_output.json`);

  await fs.writeFile(inputFile, JSON.stringify(input), "utf8");

  await new Promise<void>((resolve, reject) => {
    const cmd = `cd /d "${CALCULATOR_DIR}" && node calculator_wrapper.js "${endpoint}" "${inputFile}" "${outputFile}"`;
    exec(cmd, { timeout: 120_000 }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  await fs.unlink(inputFile).catch(() => {});
  const raw = await fs.readFile(outputFile, "utf8");
  await fs.unlink(outputFile).catch(() => {});

  const result = JSON.parse(raw);
  // Unwrap {success, data} wrapper if present
  if (result?.success && result?.data !== undefined) return result.data as Record<string, unknown>;
  return result as Record<string, unknown>;
}

/**
 * POST /api/lifetime-report
 *
 * Runs the real toctoc-sausage-html calculator directly via calculator_wrapper.js
 * to generate a fully personalised 100-year sausage timeline.
 *
 * Body: { name, birthDate, birthTime, timezone, lat, lng }
 * Returns: text/html — the complete standalone chart page.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, birthDate, birthTime, timezone, lat, lng } = body;

    if (!birthDate || !birthTime) {
      return NextResponse.json({ error: "Missing birth data" }, { status: 400 });
    }

    const payload: Record<string, unknown> = {
      name: (name || "You").trim(),
      birthDate,
      birthTime,
      timezone: timezone || "UTC",
    };
    if (lat != null) payload.latitude  = parseFloat(String(lat));
    if (lng != null) payload.longitude = parseFloat(String(lng));

    const data = await callCalculator("/api/toctoc-sausage-html", payload);

    const html = data?.html as string | undefined;
    if (!html) {
      throw new Error("Calculator returned no HTML");
    }

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to generate report", details: msg },
      { status: 500 },
    );
  }
}
