import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

const FILTER_CSS = `
#filter-bar{position:sticky;top:60px;z-index:40;display:flex;gap:6px;
  padding:6px 12px;background:rgba(15,10,40,0.92);
  backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,0.07);
  overflow-x:auto;-webkit-overflow-scrolling:touch}
#filter-bar::-webkit-scrollbar{display:none}
.f-btn{flex-shrink:0;padding:4px 12px;border-radius:999px;
  border:1px solid rgba(255,255,255,0.25);background:rgba(255,255,255,0.10);
  color:rgba(255,255,255,0.85);font-size:11px;font-weight:600;cursor:pointer;
  letter-spacing:0.02em;transition:background 0.15s,border-color 0.15s,color 0.15s;
  font-family:inherit}
.f-btn.off{background:transparent;border-color:rgba(255,255,255,0.12);
  color:rgba(255,255,255,0.28)}
`;

const FILTER_HTML = `
<div id="filter-bar">
  <button class="f-btn" data-cat="transit">Transit</button>
  <button class="f-btn" data-cat="station">Retrograde</button>
  <button class="f-btn" data-cat="eclipse">Eclipse</button>
  <button class="f-btn" data-cat="zr">ZR</button>
  <button class="f-btn" data-cat="anniversary">Birthday</button>
</div>
`;

const FILTER_JS = `
(function(){
  const catMap = {};
  sausages.forEach(s => { catMap[s.id] = s.category; });
  const activeFilters = new Set(['transit','station','eclipse','zr','anniversary']);
  function applyFilter() {
    document.querySelectorAll('.sausage').forEach(el => {
      const cat = catMap[el.dataset.id] || '';
      el.style.display = activeFilters.has(cat) ? '' : 'none';
    });
  }
  document.querySelectorAll('.f-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;
      if (activeFilters.has(cat)) { activeFilters.delete(cat); btn.classList.add('off'); }
      else { activeFilters.add(cat); btn.classList.remove('off'); }
      applyFilter();
      if (typeof clearConnections === 'function') clearConnections();
      if (typeof close === 'function') close();
    });
  });
})();
`;

function injectFilterBar(html: string): string {
  return html
    // 1. Inject CSS into <head>
    .replace("</head>", `<style>${FILTER_CSS}</style></head>`)
    // 2. Inject filter bar HTML before the fixed ruler (fallback: before #tl-wrap)
    .replace("<!-- FIXED LEFT RULER -->", `${FILTER_HTML}<!-- FIXED LEFT RULER -->`)
    // 3. Add top padding to timeline wrapper so content isn't hidden under filter bar
    .replace("#tl-wrap{padding:0 24px 160px 120px", "#tl-wrap{padding:36px 24px 160px 120px")
    // 4. Inject filter JS as a separate script before </body>
    .replace("</body>", `<script>${FILTER_JS}</script></body>`);
}

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

    return new Response(injectFilterBar(html), {
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
