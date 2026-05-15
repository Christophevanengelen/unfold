import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const CALCULATOR_DIR = "D:\\51.full-suite-api";

async function callCalculator(endpoint: string, input: Record<string, unknown>): Promise<unknown> {
  const id = `transits_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const tmpDir = os.tmpdir();
  const inputFile = path.join(tmpDir, `${id}_input.json`);
  const outputFile = path.join(tmpDir, `${id}_output.json`);

  await fs.writeFile(inputFile, JSON.stringify(input), "utf8");

  await new Promise<void>((resolve, reject) => {
    const cmd = `cd /d "${CALCULATOR_DIR}" && node calculator_wrapper.js "${endpoint}" "${inputFile}" "${outputFile}"`;
    exec(cmd, { timeout: 90_000 }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  await fs.unlink(inputFile).catch(() => {});
  const raw = await fs.readFile(outputFile, "utf8");
  await fs.unlink(outputFile).catch(() => {});

  return JSON.parse(raw);
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const username = cookieStore.get("astrolearn_session")?.value;

  if (!username) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const today = new Date().toISOString().split("T")[0];
  const startDate = searchParams.get("start") || today;
  const endDate = searchParams.get("end") || (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  })();

  try {
    const result = await callCalculator(`/api/transits-exact-short/${username}`, { startDate, endDate });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/astrolearn/transits]", err);
    return NextResponse.json({ error: "Failed to calculate transits" }, { status: 500 });
  }
}
