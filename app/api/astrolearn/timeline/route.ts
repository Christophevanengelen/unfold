import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exec } from "child_process";
import { promises as fs } from "fs";
import { Pool } from "pg";
import path from "path";
import os from "os";

const CALCULATOR_DIR = "D:\\51.full-suite-api";

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "astrolearn",
  user: "postgres",
  password: "L{3Agn/Ycr%[<~?XJ5zU",
});

async function getPersonData(username: string) {
  const { rows } = await pool.query(
    `SELECT first_name, last_name, birthdate, birthtime, latitude, longitude, city, country, timezone
     FROM person WHERE (username = $1 OR login = $1) LIMIT 1`,
    [username]
  );
  if (rows.length === 0) throw new Error(`User '${username}' not found`);
  const p = rows[0];
  return {
    firstName:  p.first_name ?? "",
    lastName:   p.last_name ?? "",
    birthDate:  p.birthdate ? new Date(p.birthdate).toISOString().slice(0, 10) : "",
    birthTime:  p.birthtime ? String(p.birthtime).slice(0, 5) : "00:00",
    latitude:   p.latitude,
    longitude:  p.longitude,
    city:       p.city ?? "",
    country:    p.country ?? "",
    timezone:   p.timezone ?? "UTC",
  };
}

async function callCalculator(endpoint: string, input: Record<string, unknown>): Promise<unknown> {
  const id = `timeline_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const tmpDir = os.tmpdir();
  const inputFile = path.join(tmpDir, `${id}_input.json`);
  const outputFile = path.join(tmpDir, `${id}_output.json`);

  await fs.writeFile(inputFile, JSON.stringify(input), "utf8");

  await new Promise<void>((resolve, reject) => {
    const cmd = `cd /d "${CALCULATOR_DIR}" && node calculator_wrapper.js "${endpoint}" "${inputFile}" "${outputFile}"`;
    exec(cmd, { timeout: 180_000 }, (err) => {
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
  if (!username) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    // Fetch person data from astrolearn DB to pass directly to calculator
    const personData = await getPersonData(username);

    const wrapper = await callCalculator(`/api/toctoc-timeline/${username}`, personData) as Record<string, unknown>;

    // Wrapper returns { success, data: {...}, timestamp }
    const result = (wrapper?.data ?? wrapper) as Record<string, unknown>;

    if (!result || result.success === false) {
      return NextResponse.json({ error: (result as { error?: string }).error ?? "Calculation failed" }, { status: 500 });
    }

    // Aggregate zrScore per year from monthlyTimeline
    type MonthEntry = { year: number; month: string; zrScore: number; transitScore: number; totalScore: number };
    const monthly: MonthEntry[] = Array.isArray(result.monthlyTimeline) ? result.monthlyTimeline as MonthEntry[] : [];

    const yearZR: Record<number, number> = {};
    for (const m of monthly) {
      yearZR[m.year] = (yearZR[m.year] ?? 0) + (m.zrScore ?? 0);
    }

    // Enrich from yearlyTimeline
    type YearEntry = { year: number; isBusy: boolean; sumScore: number; avgMonthScore: number; peakMonthScore: number; age: number };
    const yearly: YearEntry[] = Array.isArray(result.yearlyTimeline) ? result.yearlyTimeline as YearEntry[] : [];
    const yearlyMap: Record<number, YearEntry> = {};
    for (const y of yearly) yearlyMap[y.year] = y;

    const chartYears = yearly.map((ye) => ({
      year:           ye.year,
      age:            ye.age,
      zrScore:        yearZR[ye.year] ?? 0,
      isBusy:         ye.isBusy,
      sumScore:       ye.sumScore,
      avgMonthScore:  ye.avgMonthScore,
      peakMonthScore: ye.peakMonthScore,
    }));

    return NextResponse.json({ chartYears, person: result.person });
  } catch (err) {
    console.error("[/api/astrolearn/timeline]", err);
    return NextResponse.json({ error: "Failed to calculate timeline" }, { status: 500 });
  }
}
