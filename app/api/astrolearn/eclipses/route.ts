import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const CALCULATOR_DIR = "D:\\51.full-suite-api";

async function callCalculator(endpoint: string, input: Record<string, unknown>): Promise<unknown> {
  const id = `eclipse_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const tmpDir = os.tmpdir();
  const inputFile = path.join(tmpDir, `${id}_input.json`);
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

  return JSON.parse(raw);
}

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const username = cookieStore.get("astrolearn_session")?.value;

  if (!username) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const endDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  })();

  try {
    const raw = await callCalculator(`/api/transits-exact/${username}`, {
      startDate: today,
      endDate,
    }) as { data?: unknown[]; success?: boolean } | unknown[];

    // Filter to eclipse-related events: Sun/Moon aspects to nodes
    const eclipseKeywords = ["eclipse", "node", "nnode", "snode", "north node", "south node"];
    const allEvents: unknown[] = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as { data?: unknown[] }).data)
      ? (raw as { data: unknown[] }).data
      : [];

    const eclipses = allEvents.filter((e: unknown) => {
      if (typeof e !== "object" || e === null) return false;
      const ev = e as Record<string, unknown>;
      const planet = String(ev.transitPlanet || ev.planet || "").toLowerCase();
      const natal = String(ev.natalPlanet || ev.natal || "").toLowerCase();
      const type = String(ev.type || ev.aspect || "").toLowerCase();
      return eclipseKeywords.some((k) => planet.includes(k) || natal.includes(k) || type.includes(k));
    });

    return NextResponse.json({ success: true, data: eclipses, total: eclipses.length });
  } catch (err) {
    console.error("[/api/astrolearn/eclipses]", err);
    return NextResponse.json({ error: "Failed to calculate eclipses" }, { status: 500 });
  }
}
