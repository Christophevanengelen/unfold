import { exec } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

/**
 * Optional local escape hatch.
 *
 * The historical implementation shelled out to a `calculator_wrapper.js` living on a
 * specific Windows machine (`D:\51.full-suite-api`). That path does not exist on macOS
 * nor on Vercel, so the fallback is now opt-in: it only runs when `CALCULATOR_DIR` is
 * explicitly set, and the command it builds is POSIX-shell compatible.
 */
const CALCULATOR_DIR = process.env.CALCULATOR_DIR?.trim() || null;
const SPIRITUAL_API_TIMEOUT_MS = 120_000;

function isLocalWrapperEnabled(): boolean {
  return CALCULATOR_DIR !== null;
}

type CalculatorPayload = Record<string, unknown>;

export const FULL_SUITE_SPIRITUAL_API_BASE = (
  process.env.SPIRITUAL_API_URL ??
  process.env.FULL_SUITE_SPIRITUAL_API_URL ??
  "https://ai.zebrapad.io/full-suite-spiritual-api"
).replace(/\/$/, "");

function getSpiritualApiBase(): string {
  return FULL_SUITE_SPIRITUAL_API_BASE;
}

async function callCalculatorWrapper(
  endpoint: string,
  input: Record<string, unknown>
): Promise<CalculatorPayload> {
  if (!CALCULATOR_DIR) {
    throw new Error("Local calculator wrapper is disabled (CALCULATOR_DIR is not set)");
  }

  const id = `astrolearn_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const inputFile = path.join(os.tmpdir(), `${id}_input.json`);
  const outputFile = path.join(os.tmpdir(), `${id}_output.json`);

  await fs.writeFile(inputFile, JSON.stringify(input), "utf8");

  await new Promise<void>((resolve, reject) => {
    const cmd = `cd "${CALCULATOR_DIR}" && node calculator_wrapper.js "${endpoint}" "${inputFile}" "${outputFile}"`;
    exec(cmd, { timeout: 120_000 }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  await fs.unlink(inputFile).catch(() => {});
  const raw = await fs.readFile(outputFile, "utf8");
  await fs.unlink(outputFile).catch(() => {});

  return JSON.parse(raw) as CalculatorPayload;
}

async function callSpiritualApi(
  apiPath: string,
  input: Record<string, unknown> = {}
): Promise<CalculatorPayload> {
  const url = `${getSpiritualApiBase()}${apiPath}`;
  const startedAt = Date.now();
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(SPIRITUAL_API_TIMEOUT_MS),
  });

  const raw = await response.text();
  let payload: CalculatorPayload;
  try {
    payload = JSON.parse(raw) as CalculatorPayload;
  } catch {
    throw new Error(`Spiritual API returned non-JSON from ${url}`);
  }
  if (!response.ok || payload.success === false) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : `Spiritual API request failed with status ${response.status}`;
    throw new Error(message);
  }

  console.log("[astrolearn-calculator] spiritual API ok", {
    apiPath,
    base: getSpiritualApiBase(),
    ms: Date.now() - startedAt,
    status: response.status,
  });

  return payload;
}

export async function callEphemerisExpert(
  input: Record<string, unknown>
): Promise<CalculatorPayload> {
  try {
    return await callSpiritualApi("/ephemeris-expert.php", input);
  } catch (phpError) {
    if (!isLocalWrapperEnabled()) throw phpError;
    console.warn("[astrolearn-calculator] ephemeris PHP failed, using wrapper", phpError);
    return callCalculatorWrapper("/api/ephemeris-expert", input);
  }
}

export async function callSpiritualChartData(
  endpoint: string,
  input: Record<string, unknown>
): Promise<CalculatorPayload> {
  return callSpiritualApi(endpoint, input);
}

export async function callCalculatorEndpoint(
  endpoint: string,
  input: Record<string, unknown> = {}
): Promise<CalculatorPayload> {
  try {
    return await callSpiritualApi(endpoint, input);
  } catch (phpError) {
    if (!isLocalWrapperEnabled()) throw phpError;
    const startedAt = Date.now();
    console.warn(`[astrolearn-calculator] PHP API failed for ${endpoint}, using wrapper`, phpError);
    const payload = await callCalculatorWrapper(endpoint, input);
    console.log("[astrolearn-calculator] wrapper ok", {
      endpoint,
      ms: Date.now() - startedAt,
    });
    return payload;
  }
}

/**
 * Calls a calculator endpoint on the remote PHP API and returns the *unwrapped*
 * payload — i.e. `data` when the API answers with the `{ success, data }` envelope,
 * or the raw payload otherwise.
 *
 * This is the shared replacement for the per-route `callCalculator()` helpers that used
 * to spawn `calculator_wrapper.js` through a Windows-only shell command. Transport,
 * timeout, defensive JSON parsing and error messages all come from `callSpiritualApi`
 * via `callCalculatorEndpoint`, so the local wrapper fallback (when `CALCULATOR_DIR` is
 * set) keeps working transparently.
 *
 * @param endpoint calculator path, e.g. `/api/zodiacal-releasing`
 * @param input    JSON body sent to the endpoint
 */
export async function callCalculatorData<T = unknown>(
  endpoint: string,
  input: Record<string, unknown> = {}
): Promise<T> {
  const payload = await callCalculatorEndpoint(endpoint, input);

  if (payload && payload.success !== false && payload.data !== undefined) {
    return payload.data as T;
  }

  return payload as T;
}

export function normalizeChartDataPayload(payload: CalculatorPayload): CalculatorPayload {
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const person = data.person ?? payload.person;

  return {
    success: payload.success ?? true,
    data: {
      planets: data.planets ?? {},
      cusps: data.cusps ?? [],
      ...(person ? { person } : {}),
    },
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };
}
