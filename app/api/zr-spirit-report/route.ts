import { NextRequest, NextResponse } from "next/server";
import { callCalculatorData } from "@/lib/astrolearn-calculator";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ZRL2Period {
  sign: string;
  startDate: string;
  endDate: string;
  duration: number;
  markers: string[];
  isPeakPeriod?: boolean;
  isCulmination?: boolean;
  isLoosingOfBond?: boolean;
  housePlacement?: number;
}

interface ZRL1Period {
  sign: string;
  startDate: string;
  endDate: string;
  duration: number;
  markers: string[];
  isPeakPeriod?: boolean;
  isCulmination?: boolean;
  isLoosingOfBond?: boolean;
  housePlacement?: number;
  subPeriods?: ZRL2Period[];
}

interface ZRData {
  releasing: {
    fromLot: string;
    startingSign: string;
    periods: ZRL1Period[];
    currentPeriods: Record<string, { sign: string; startDate: string; endDate: string; markers: string[] }>;
  };
  peakPeriodSigns: {
    first: string;
    fourth: string;
    seventh: string;
    tenth: string;
  };
  lots: Record<string, { sign: string; degree: number }>;
  natalChart?: {
    ascendant: number;
    houseCusps?: number[];
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FIRE_SIGNS  = new Set(["Aries", "Leo", "Sagittarius"]);
const EARTH_SIGNS = new Set(["Taurus", "Virgo", "Capricorn"]);
const AIR_SIGNS   = new Set(["Gemini", "Libra", "Aquarius"]);
const WATER_SIGNS = new Set(["Cancer", "Scorpio", "Pisces"]);

function signElement(sign: string): string {
  if (FIRE_SIGNS.has(sign))  return "fire";
  if (EARTH_SIGNS.has(sign)) return "earth";
  if (AIR_SIGNS.has(sign))   return "air";
  if (WATER_SIGNS.has(sign)) return "water";
  return "other";
}

function elementColor(el: string): string {
  switch (el) {
    case "fire":  return "#F97316";
    case "earth": return "#22C55E";
    case "air":   return "#EAB308";
    case "water": return "#60A5FA";
    default:      return "#6b7280";
  }
}
function signColor(sign: string): string { return elementColor(signElement(sign)); }

/**
 * Compute year score from the L2 period active at July 1 of that year.
 * Scoring:
 *   base 2
 *   Peak bonus by angular house FROM Lot of Fortune:
 *     10th +6 (major) · 1st +5 · 7th +3 · 4th +1 (minor)
 *   Cu +5 · LB +6 · pre-LB +2
 *   Natal house bonus: H1 +10 · H10 +8 · H7 +6 · H4 +4 · H11/H5 +2
 */
// The calculator sometimes returns housePlacement as {house:N} instead of N
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toHouseNum(hp: any): number {
  if (typeof hp === "number") return hp;
  if (typeof hp === "object" && hp !== null) {
    return Number(hp.house ?? hp.value ?? hp.housePlacement ?? 0) || 0;
  }
  return Number(hp) || 0;
}

interface PeakSigns { first: string; fourth: string; seventh: string; tenth: string }

/** Score bonus for being an angular sign FROM the Lot of Fortune */
function peakBonusFromFortune(sign: string, ps: PeakSigns | undefined): number {
  if (!ps) return 0;
  if (sign === ps.tenth)   return 6;  // 10th from Fortune — major peak
  if (sign === ps.first)   return 5;  // 1st from Fortune
  if (sign === ps.seventh) return 3;  // 7th from Fortune — moderate
  if (sign === ps.fourth)  return 1;  // 4th from Fortune — minor peak
  return 0;
}

function computeYearScore(
  year: number,
  allL2: ZRL2Period[],
  isPreLb: (p: ZRL2Period) => boolean,
  peakSigns: PeakSigns | undefined,
): number {
  const midDate = `${year}-07-01T12:00:00.000Z`;
  const p = allL2.find(l2 => l2.startDate <= midDate && l2.endDate >= midDate);
  if (!p) return 0;

  let score = 2;

  // Peak bonus scaled by which angular house from Fortune (not flat for all peaks)
  score += peakBonusFromFortune(p.sign, peakSigns);

  if (p.isCulmination || p.markers.includes("Cu"))     score += 5;   // culmination
  if (p.isLoosingOfBond || p.markers.includes("LB"))   score += 14;  // LB — life-changing, always dominates
  if (isPreLb(p))                                      score += 2;  // foreshadowing

  // Natal house bonus (independent from Fortune angular bonus)
  const h = toHouseNum(p.housePlacement);
  if (h === 1)       score += 10;
  else if (h === 10) score += 8;
  else if (h === 7)  score += 6;
  else if (h === 4)  score += 4;
  else if (h === 11 || h === 5) score += 2;

  // Envelope: shapes the curve within each L2 period.
  // - LB → flat 1.0: the entire loosing-of-bond period is equally life-changing.
  //        Flowers appear at full height for every year of the period.
  // - CU → sine bell: culmination builds and resolves around its midpoint.
  // - All others → sine bell: peaks at midpoint, 0 at both edges.
  const pStart = new Date(p.startDate).getTime();
  const pEnd   = new Date(p.endDate).getTime();
  const t = Math.max(0, Math.min(1, (new Date(midDate).getTime() - pStart) / (pEnd - pStart)));
  const isLB = p.isLoosingOfBond || p.markers.includes("LB");
  const envelope = isLB
    ? 1.0                    // LB: flat — all years at full score
    : Math.sin(Math.PI * t); // CU + others: sine bell peaking at midpoint

  return Math.round(score * envelope * 10) / 10;
}

const QUOTES: Record<string, { text: string; author: string }> = {
  fire:  { text: "doing the right thing at the wrong time is the wrong thing.", author: "joshua harris" },
  earth: { text: "the secret of getting ahead is getting started.", author: "mark twain" },
  air:   { text: "you can't connect the dots looking forward; you can only connect them looking backward.", author: "steve jobs" },
  water: { text: "the soul always knows what to do to heal itself. the challenge is to silence the mind.", author: "caroline myss" },
  other: { text: "timing is everything. know your season.", author: "unfold" },
};

// ─── HTML generator ───────────────────────────────────────────────────────────

function generateHtml(
  name: string,
  city: string,
  country: string,
  birthDate: string,
  birthTime: string,
  data: ZRData,
): string {
  const { releasing, lots, peakPeriodSigns } = data;
  const { periods: l1Periods, fromLot, startingSign, currentPeriods } = releasing;

  // Flatten L2 periods across all L1 periods in chronological order
  const allL2: (ZRL2Period & { l1Sign: string })[] = [];
  for (const l1 of l1Periods) {
    for (const l2 of (l1.subPeriods ?? [])) {
      allL2.push({ ...l2, l1Sign: l1.sign });
    }
  }
  allL2.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // ── Pre-LB detection — trust API markers only ───────────────────────────────
  // The API is authoritative. Local sign-matching was producing false positives
  // (e.g. flagging Cu periods that share a sign with LB as pre-LB).
  const isPreLbPeriod = (p: ZRL2Period) =>
    (p.markers ?? []).includes("pre-LB") ||
    (p.markers ?? []).includes("foreshadowing");

  const birthYear = parseInt(birthDate.split("-")[0], 10);
  const nowYear   = new Date().getFullYear();
  const NOW       = new Date().toISOString().slice(0, 10);
  // Extend chart to fully show the next LB period (start + all years of the period)
  const nextLbPeriod = allL2
    .filter(l2 => l2.isLoosingOfBond || l2.markers.includes("LB"))
    .find(l2 => parseInt(l2.startDate.slice(0, 4), 10) > nowYear);
  const nextLbEndYear = nextLbPeriod
    ? parseInt(nextLbPeriod.endDate.slice(0, 4), 10)
    : nowYear + 3;
  const endYear = Math.max(nowYear + 3, nextLbEndYear + 1);

  // Build year-by-year chart data
  const years: number[] = [];
  const scores: number[] = [];
  for (let y = birthYear; y <= endYear; y++) {
    years.push(y);
    scores.push(computeYearScore(y, allL2, isPreLbPeriod, peakPeriodSigns));
  }

  // Point colors and sizes (per year) — keyed to the L2 active at July 1
  const pointColors = years.map(y => {
    const mid = `${y}-07-01T12:00:00.000Z`;
    const p = allL2.find(l2 => l2.startDate <= mid && l2.endDate >= mid);
    if (!p) return "#6b7280";
    if (p.isLoosingOfBond || p.markers.includes("LB")) return "#ffffff";
    if (p.isCulmination || p.markers.includes("Cu"))   return "#ffffff";
    if (isPreLbPeriod(p))                               return "#fbbf24"; // pre-seed
    return signColor(p.sign);
  });
  const pointSizes = years.map(y => {
    const mid = `${y}-07-01T12:00:00.000Z`;
    const p = allL2.find(l2 => l2.startDate <= mid && l2.endDate >= mid);
    if (!p) return 3;
    if (p.isLoosingOfBond || p.markers.includes("LB")) return 0; // hidden — flower drawn by plugin
    if (p.isCulmination || p.markers.includes("Cu"))    return 0; // hidden — blue glossy drawn by plugin
    if (isPreLbPeriod(p))                               return 0; // hidden — glossy drawn by plugin
    return 3;
  });

  // Per-year flags for the flower/glossy plugin.
  // Every year within a special period gets its marker.
  // The cosine envelope (LB/CU) ensures the curve peaks at the period start, so the
  // first flower/glossy naturally sits at the highest point.
  const yearFlags = years.map(y => {
    const mid = `${y}-07-01T12:00:00.000Z`;
    const p = allL2.find(l2 => l2.startDate <= mid && l2.endDate >= mid);
    if (!p) return 0;
    if (p.isLoosingOfBond || p.markers.includes("LB")) return 2; // flower
    if (p.isCulmination   || p.markers.includes("Cu")) return 3; // blue glossy
    if (isPreLbPeriod(p))                              return 1; // purple glossy
    return 0;
  });

  // L1 period bands for chart background
  const l1Bands = l1Periods.map(p => ({
    start: parseInt(p.startDate.slice(0, 4), 10),
    end:   parseInt(p.endDate.slice(0, 4), 10),
    color: signColor(p.sign),
    sign:  p.sign,
  }));

  // Current periods from API
  const curL1 = currentPeriods?.L1;
  const curL2 = currentPeriods?.L2;

  // Stats
  const cuL2 = allL2.filter(p => p.isCulmination || p.markers.includes("Cu"));
  const nextCu = cuL2.find(p => p.startDate > NOW);
  const spiritLot = lots?.spirit;
  const quote = QUOTES[signElement(startingSign)] ?? QUOTES.other;
  const lotNameFr: Record<string, string> = {
    spirit: "Part d'Esprit", fortune: "Part de Fortune", eros: "Part d'Éros"
  };
  const fromLotFr = lotNameFr[fromLot?.toLowerCase?.()] ?? fromLot;


  // Peak signs summary
  const peakSummary = peakPeriodSigns
    ? `Peak signs — 1st: ${peakPeriodSigns.first} · 4th: ${peakPeriodSigns.fourth} · 7th: ${peakPeriodSigns.seventh} · 10th: ${peakPeriodSigns.tenth}`
    : "";

  // Period cards
  const cardsHtml = l1Periods.map(l1 => {
    const isActive = !!(curL1 && curL1.sign === l1.sign && curL1.startDate === l1.startDate);
    const col = signColor(l1.sign);
    const cuIn = (l1.subPeriods ?? []).filter(p => p.isCulmination || p.markers.includes("Cu")).length;
    const startY = l1.startDate.slice(0, 4);
    const endY   = l1.endDate.slice(0, 4);

    const subRows = (l1.subPeriods ?? []).map(l2 => {
      const isNow    = !!(curL2 && curL2.sign === l2.sign && curL2.startDate === l2.startDate);
      const l2col    = signColor(l2.sign);
      const hasCu    = l2.isCulmination || l2.markers.includes("Cu");
      const hasLB    = l2.isLoosingOfBond || l2.markers.includes("LB");
      const hasPreLB = isPreLbPeriod(l2);
      const dotCol   = hasCu ? "#fff" : hasLB ? "#fff" : l2col;
      // Label the peak by its angular house from Fortune
      const peakLabel = l2.isPeakPeriod
        ? (l2.sign === peakPeriodSigns?.tenth   ? "Peak ★ 10th"
        :  l2.sign === peakPeriodSigns?.first   ? "Peak 1st"
        :  l2.sign === peakPeriodSigns?.seventh ? "Peak 7th"
        :  l2.sign === peakPeriodSigns?.fourth  ? "Peak (minor) 4th"
        :  "Peak")
        : "";
      const markerStr = [...new Set([
        ...(l2.markers ?? []).filter(m => m !== "foreshadowing"),
        peakLabel,
        l2.isCulmination ? "Cu" : "",
        l2.isLoosingOfBond ? "LB" : "",
      ])].filter(Boolean).join(", ");

      const hNum   = toHouseNum(l2.housePlacement);
      const hBonus = hNum === 1 ? "+10" : hNum === 10 ? "+8" : hNum === 7 ? "+6" : hNum === 4 ? "+4" : "";

      // Dot / icon — LB = flower ✿, pre-LB = glossy sphere, Cu = bright + glow, normal = plain
      const dotHtml = hasLB
        ? `<span class="l2-flower">✿</span>`
        : hasPreLB
        ? `<span class="l2-dot l2-dot-prelb" style="background:radial-gradient(circle at 35% 35%, rgba(255,255,255,0.75) 0%, ${l2col} 55%, rgba(0,0,0,0.18) 100%);box-shadow:0 0 6px ${l2col}99,inset 0 1px 2px rgba(255,255,255,0.4);"></span>`
        : hasCu
        ? `<span class="l2-dot" style="background:#fff;box-shadow:0 0 7px #fff8;"></span>`
        : `<span class="l2-dot" style="background:${dotCol};"></span>`;

      return `
        <div class="l2-row${isNow ? " active-l2" : ""}${hasPreLB ? " prelb-row" : ""}" style="border-left-color:${l2col};">
          ${dotHtml}
          <span class="l2-sign">${l2.sign}</span>
          <span class="l2-dates">${l2.startDate.slice(0, 10)} → ${l2.endDate.slice(0, 10)}</span>
          ${markerStr ? `<span class="marker-badge" style="color:${hasCu ? "#fff" : hasLB ? "#fff" : hasPreLB ? "#fbbf24" : "#fbbf24"};border-color:${hasCu ? "rgba(255,255,255,.25)" : hasLB ? "rgba(255,255,255,.3)" : "rgba(251,191,36,.25)"};">${markerStr}</span>` : ""}
          ${hNum ? `<span class="house-badge">H${hNum}${hBonus ? " " + hBonus : ""}</span>` : ""}
          ${isNow ? '<span class="now-badge">NOW</span>' : ""}
        </div>`;
    }).join("");

    return `
      <div class="card${isActive ? " card-active" : ""}" style="border-left:3px solid ${col};">
        <div class="card-header">
          <div class="year-label">
            <span class="dot" style="background:${col};box-shadow:0 0 7px ${col}99;"></span>
            <strong>${l1.sign}</strong>
            <span class="age">${startY} – ${endY}</span>
            ${l1.isPeakPeriod
              ? (l1.sign === peakPeriodSigns?.tenth   ? `<span class="peak-badge">Peak ★ 10th</span>`
              :  l1.sign === peakPeriodSigns?.first   ? `<span class="peak-badge">Peak 1st</span>`
              :  l1.sign === peakPeriodSigns?.seventh ? `<span class="peak-badge">Peak 7th</span>`
              :  l1.sign === peakPeriodSigns?.fourth  ? `<span class="peak-badge" style="opacity:.65">Peak (minor)</span>`
              :  `<span class="peak-badge">Peak</span>`)
              : ""}
            ${isActive ? '<span class="now-badge">NOW</span>' : ""}
          </div>
          <div class="badges">
            <span class="badge badge-element" style="color:${col};border-color:${col}44;">${signElement(l1.sign)}</span>
            ${toHouseNum(l1.housePlacement) ? `<span class="badge badge-house">H${toHouseNum(l1.housePlacement)}</span>` : ""}
            ${cuIn > 0 ? `<span class="badge badge-white">Cu ×${cuIn}</span>` : ""}
          </div>
        </div>
        <div class="card-meta"><b>${(l1.subPeriods ?? []).length} L2 periods</b></div>
        <div class="l2-list">${subRows}</div>
      </div>`;
  }).join("\n");

  // Period strip (L2 pills)
  const stripHtml = allL2.map(p => {
    const isNow = !!(curL2 && curL2.startDate === p.startDate && curL2.sign === p.sign);
    const col   = signColor(p.sign);
    const hasCu = p.isCulmination || p.markers.includes("Cu");
    const hasLB = p.isLoosingOfBond || p.markers.includes("LB");
    const dotCol = hasCu ? "#fff" : hasLB ? "#fff" : col;
    const title  = `${p.sign} ${p.startDate.slice(0, 10)}–${p.endDate.slice(0, 10)}${p.markers.length ? " · " + p.markers.join(", ") : ""}`;
    return `<div class="strip-pill${isNow ? " strip-active" : ""}" style="background:${col}22;border-color:${col}44;${isNow ? `box-shadow:0 0 8px ${col}88;` : ""}" title="${title}"><span style="background:${dotCol};"></span></div>`;
  }).join("");

  // Per-year tooltip data: sign, L2 start, L2 end, markers
  const yearMeta = years.map(y => {
    const mid = `${y}-07-01T12:00:00.000Z`;
    const p = allL2.find(l2 => l2.startDate <= mid && l2.endDate >= mid);
    if (!p) return null;
    return {
      sign: p.sign,
      start: p.startDate.slice(0, 10),
      end:   p.endDate.slice(0, 10),
      markers: [
        p.isCulmination || p.markers.includes("Cu") ? "Cu" : "",
        p.isLoosingOfBond || p.markers.includes("LB") ? "LB" : "",
        isPreLbPeriod(p) ? "pre-LB" : "",
        p.isPeakPeriod ? "Peak" : "",
      ].filter(Boolean),
    };
  });

  // Serialise for client JS
  const jsYears  = JSON.stringify(years);
  const jsScores = JSON.stringify(scores);
  const jsColors = JSON.stringify(pointColors);
  const jsSizes  = JSON.stringify(pointSizes);
  const jsFlags  = JSON.stringify(yearFlags);
  const jsBands  = JSON.stringify(l1Bands);
  const jsNow    = JSON.stringify(nowYear);
  const jsName   = JSON.stringify(name.replace(/[^a-z0-9]/gi, "-").toLowerCase());
  const jsMeta   = JSON.stringify(yearMeta);

  // Strip canvas data — one entry per L2 period: [color, isNow, isCu, isLB, isPreLB]
  const jsStrip  = JSON.stringify(allL2.map(p => {
    const isNow    = !!(curL2 && curL2.startDate === p.startDate && curL2.sign === p.sign);
    const hasCu    = p.isCulmination || p.markers.includes("Cu");
    const hasLB    = p.isLoosingOfBond || p.markers.includes("LB");
    const hasPreLB = isPreLbPeriod(p);
    const col      = signColor(p.sign);
    const dotCol   = hasCu ? "#ffffff" : hasLB ? "#ffffff" : col;
    return [dotCol, isNow ? 1 : 0, hasCu ? 1 : 0, hasLB ? 1 : 0, hasPreLB ? 1 : 0];
  }));

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Part d'Esprit — ${name}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Satisfy&family=Caveat:wght@400;600&display=swap" rel="stylesheet"/>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#1B1535;color:#E6E2F2;font-family:'Inter',system-ui,sans-serif;min-height:100vh}
.container{max-width:1440px;margin:0 auto;padding:0 0 48px}
#printable{background:#1B1535;width:100%;overflow:hidden}
.quote-bar{display:flex;justify-content:space-between;align-items:flex-start;padding:26px 36px 14px;gap:24px}
.quote-left .q-text{font-family:'Satisfy',cursive;font-size:26px;color:rgba(255,255,255,.85);line-height:1.3;max-width:840px;display:block}
.quote-left .q-text::before{content:'\u201C';font-size:34px;color:rgba(255,255,255,.4);margin-right:4px;vertical-align:-6px;font-family:'Satisfy',cursive}
.quote-left .q-author{font-size:11px;color:rgba(255,255,255,.32);margin-top:5px;font-family:'Satisfy',cursive;font-style:normal}
.logo-mark{display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0}
.logo-mark svg{width:34px;height:34px;opacity:.80}
.logo-mark span{font-size:10px;color:#A397C0;letter-spacing:.18em;text-transform:uppercase;font-weight:600}
.chart-wrap{padding:2px 0 0;position:relative}
.chart-scroll{overflow-x:auto;overflow-y:hidden;cursor:grab;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.chart-scroll::-webkit-scrollbar{display:none}
.chart-scroll:active{cursor:grabbing}
#chartSizer{height:420px;padding:0 36px}
#spiritChart{display:block;width:100%;height:100%}
.strip-wrap{padding:6px 36px 10px;display:flex;gap:2px;overflow:hidden}
.strip-pill{height:14px;flex:1;min-width:4px;border-radius:3px;border:1px solid;display:flex;align-items:center;justify-content:center;cursor:default;transition:filter .15s}
.strip-pill span{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.strip-pill:hover{filter:brightness(1.5)}
.strip-active{outline:2px solid rgba(149,133,204,.55);outline-offset:1px}
.stat-row{display:flex;gap:10px;flex-wrap:wrap;padding:12px 36px;border-top:1px solid rgba(255,255,255,.04)}
.stat-chip{background:rgba(149,133,204,.06);border:1px solid rgba(149,133,204,.14);border-radius:10px;padding:10px 16px;min-width:130px}
.stat-chip .lbl{font-size:8px;font-weight:700;color:#8C7FAE;text-transform:uppercase;letter-spacing:.08em}
.stat-chip .val{font-size:15px;font-weight:800;margin-top:3px;color:#9585CC}
.stat-chip .note{font-size:9px;color:#8C7FAE;margin-top:1px}
.save-btn-wrap{padding:12px 36px;display:flex;gap:12px;align-items:center;border-top:1px solid rgba(149,133,204,.08)}
.save-btn{background:rgba(149,133,204,.12);border:1px solid rgba(149,133,204,.28);color:#9585CC;padding:8px 20px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
.save-btn:hover{background:rgba(149,133,204,.22)}
.save-btn:disabled{opacity:.5;cursor:not-allowed}
.save-hint{font-size:10px;color:#8C7FAE}
.peak-legend{font-size:9px;color:#8C7FAE;font-family:ui-monospace,monospace;padding:2px 0 0 1px}
.section-title{font-size:10px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#374151;margin:24px 36px 12px}
.grid{display:grid;grid-template-columns:1fr;gap:10px;padding:0 36px}
@media(min-width:860px){.grid{grid-template-columns:1fr 1fr}}
@media(min-width:1200px){.grid{grid-template-columns:1fr 1fr 1fr}}
.card{background:#130F27;border:1px solid rgba(149,133,204,.10);border-radius:12px;padding:14px}
.card-active{background:#1E1840;border-color:rgba(149,133,204,.22)}
.card-header{display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.year-label{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.year-label strong{font-size:15px;color:#f1f5f9}
.age{font-size:10px;color:#374151}
.badges{display:flex;gap:5px;flex-wrap:wrap}
.badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap}
.badge-white{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);color:#e2e8f0}
.badge-element{background:transparent;border:1px solid;font-weight:600}
.badge-house{background:rgba(149,133,204,.10);border:1px solid rgba(149,133,204,.25);color:#9585CC}
.now-badge{font-size:8px;font-weight:800;padding:2px 8px;border-radius:20px;background:rgba(149,133,204,.13);border:1px solid rgba(149,133,204,.35);color:#9585CC;white-space:nowrap}
.peak-badge{font-size:8px;font-weight:800;padding:2px 8px;border-radius:20px;background:rgba(245,158,11,.13);border:1px solid rgba(245,158,11,.35);color:#fbbf24;white-space:nowrap}
.card-meta{font-size:11px;color:#8C7FAE;margin-bottom:8px}
.card-meta b{color:#9585CC;font-weight:600}
.l2-list{display:flex;flex-direction:column;gap:2px}
.l2-row{display:flex;align-items:center;gap:5px;padding:4px 8px;border-left:2px solid;border-radius:0 6px 6px 0;background:rgba(255,255,255,.02);font-size:10px;flex-wrap:nowrap}
.active-l2{background:rgba(149,133,204,.06)!important}
.l2-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.l2-flower{font-size:11px;line-height:1;flex-shrink:0;filter:drop-shadow(0 0 4px rgba(255,255,255,0.8));animation:lb-pulse 2s ease-in-out infinite;color:#fff!important}
.l2-dot-prelb{animation:prelb-shimmer 2.4s ease-in-out infinite}
.prelb-row{background:rgba(251,191,36,0.04)!important}
@keyframes lb-pulse{0%,100%{filter:drop-shadow(0 0 2px rgba(255,255,255,0.5))}50%{filter:drop-shadow(0 0 8px rgba(255,255,255,0.95))}}
@keyframes prelb-shimmer{0%,100%{opacity:0.85;transform:scale(1)}50%{opacity:1;transform:scale(1.35)}}
.l2-sign{font-weight:600;color:#9ca3af;width:80px;flex-shrink:0}
.l2-dates{color:#374151;font-family:ui-monospace,monospace;font-size:9px;flex:1;white-space:nowrap}
.marker-badge{font-size:8px;font-weight:800;padding:1px 5px;border-radius:3px;border:1px solid;white-space:nowrap;flex-shrink:0}
.house-badge{font-size:8px;color:#9585CC;background:rgba(149,133,204,.10);border:1px solid rgba(149,133,204,.20);padding:1px 5px;border-radius:3px;white-space:nowrap;flex-shrink:0}
.footer{font-size:9px;color:#5C4B9B;text-align:center;padding:14px 36px 0;margin-top:20px;border-top:1px solid rgba(149,133,204,.08);line-height:1.7}
@media print{
  @page{size:A4 landscape;margin:0}
  *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;color-adjust:exact!important}
  body{padding:0;background:#1B1535!important;color:#E6E2F2!important}
  #printable{background:#1B1535!important;width:100%!important}
  .save-btn-wrap,.section-title,.grid,.footer,.stat-row{display:none!important}
  .chart-wrap{padding:2px 36px 20px}
  #spiritChart{height:480px!important}
}
</style>
</head>
<body>
<div class="container">
<div id="printable">
  <div class="quote-bar">
    <div class="quote-left">
      <span class="q-text">${quote.text}</span>
      <div class="q-author">— ${quote.author}</div>
    </div>
    <div class="logo-mark">
      <svg width="34" height="34" viewBox="0 0 173 173" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M166.563 129.678C166.563 129.678 166.542 129.664 166.532 129.657L135.172 107.217L91.0805 151.894L91.0385 151.936C91.0385 151.936 91.0209 151.954 91.0104 151.964L90.9929 151.982C90.9929 151.982 90.9824 151.989 90.9789 151.996C88.4508 154.45 84.4081 154.419 81.9187 151.898L80.9124 150.877L37.8274 107.221L6.46734 129.657C6.46734 129.657 6.4463 129.675 6.43578 129.678C3.3713 131.831 -0.59779 128.57 0.937954 125.138L35.5308 47.8316C36.0216 46.7377 36.8456 45.9102 37.8274 45.4088C39.2965 44.6515 41.1127 44.6269 42.666 45.528C42.673 45.5315 42.6765 45.535 42.6836 45.5385L52.4801 51.2713L82.7216 17.1168C84.7272 14.8517 88.265 14.8517 90.2741 17.1168L120.516 51.2643L130.312 45.535L130.323 45.528C131.876 44.6234 133.696 44.6479 135.165 45.4018C136.133 45.8997 136.95 46.7096 137.44 47.7861C137.44 47.7861 137.444 47.7896 137.444 47.7931C137.447 47.8036 137.454 47.8141 137.458 47.8246C137.458 47.8246 137.458 47.8281 137.458 47.8316L172.051 125.138C173.586 128.57 169.617 131.835 166.553 129.678H166.563Z" fill="#8676BE"/>
        <path d="M37.8274 45.4031V107.212L6.46734 129.655C6.46734 129.655 6.4463 129.673 6.43578 129.676C3.3713 131.829 -0.59779 128.568 0.937954 125.136L35.5308 47.8294C36.0217 46.7355 36.8456 45.908 37.8274 45.4066V45.4031Z" fill="#A094CE"/>
        <path d="M166.567 129.676C166.567 129.676 166.546 129.662 166.536 129.655L135.176 107.215V45.4031C136.144 45.901 136.96 46.7109 137.451 47.7873C137.451 47.7873 137.455 47.7908 137.455 47.7943C137.458 47.8049 137.465 47.8154 137.469 47.8259C137.469 47.8259 137.469 47.8294 137.469 47.8329L172.062 125.139C173.597 128.572 169.628 131.836 166.564 129.68L166.567 129.676Z" fill="#A094CE"/>
        <path d="M68.0795 60.3969L37.8169 107.209V45.4041C39.286 44.6468 41.1023 44.6222 42.6555 45.5233C42.6626 45.5269 42.6661 45.5304 42.6731 45.5339L52.4696 51.2631L68.0795 60.3969Z" fill="#BEB7DD"/>
        <path d="M135.166 45.4042V107.213L104.9 60.397L120.513 51.2632L130.31 45.5339L130.32 45.5269C131.874 44.6223 133.693 44.6469 135.162 45.4007L135.166 45.4042Z" fill="#BEB7DD"/>
        <path d="M135.154 107.212L91.0666 151.889L91.0245 151.931C91.0245 151.931 91.0069 151.948 90.9964 151.959L90.9789 151.976C90.9789 151.976 90.9684 151.983 90.9649 151.99C88.4369 154.445 84.3941 154.413 81.9047 151.892L80.8984 150.872L37.8169 107.215L68.0795 60.3996L82.1536 38.6292C84.1838 35.4875 88.7805 35.4875 90.8141 38.6292L135.154 107.215V107.212Z" fill="#A094CE"/>
      </svg>
      <span>unfold</span>
    </div>
  </div>
  <div class="chart-wrap">
    <div class="chart-scroll" id="chartScroll">
      <div id="chartSizer"><canvas id="spiritChart"></canvas></div>
    </div>
  </div>
</div><!-- /#printable ends here — PNG export captures only quote + wave above -->

<canvas id="stripCanvas" style="display:none;"></canvas>
<div class="stat-row">
    <div class="stat-chip">
      <div class="lbl">Part d'Esprit</div>
      <div class="val">${spiritLot ? `${spiritLot.sign} ${spiritLot.degree.toFixed(1)}&deg;` : startingSign}</div>
    </div>
    <div class="stat-chip">
      <div class="lbl">Phase L1 actuelle</div>
      <div class="val" style="font-size:13px;margin-top:4px;">${curL1?.sign ?? "—"}</div>
      <div class="note">${curL1 ? curL1.startDate.slice(0, 10) + " → " + curL1.endDate.slice(0, 10) : ""}</div>
    </div>
    <div class="stat-chip">
      <div class="lbl">Période L2 actuelle</div>
      <div class="val" style="font-size:13px;margin-top:4px;">${curL2?.sign ?? "—"}</div>
      <div class="note">${curL2?.markers?.join(" · ") || (curL2 ? "active" : "")}</div>
    </div>
    <div class="stat-chip">
      <div class="lbl">Culminations (Cu)</div>
      <div class="val">${cuL2.length}</div>
      <div class="note">sous-périodes L2 de pointe</div>
    </div>
    ${nextCu ? `<div class="stat-chip">
      <div class="lbl">Prochaine Cu</div>
      <div class="val" style="font-size:12px;margin-top:4px;">${nextCu.startDate.slice(0, 10)}</div>
      <div class="note">${nextCu.sign}</div>
    </div>` : ""}
    <div class="stat-chip">
      <div class="lbl">Scoring</div>
      <div class="val" style="font-size:10px;margin-top:4px;line-height:1.5;color:#6b7280;">LB +14 · Cu +5 · pre-LB +2<br>Peak 10th +6 · 1st +5 · 7th +3 · 4th +1<br>H1 +10 · H10 +8 · H7 +6 · H4 +4</div>
    </div>
  </div>
  ${peakSummary ? `<div class="peak-legend" style="padding:0 36px 10px;">${peakSummary}</div>` : ""}

<div class="save-btn-wrap">
  <button class="save-btn" id="saveBtn" onclick="savePng()">Save as PNG</button>
  <span class="save-hint">Exports quote + wave as a high-resolution PNG</span>
</div>

<div class="section-title">ZR Part d'Esprit · L1 &rarr; L2 détail</div>
<div class="grid">${cardsHtml}</div>
<div class="footer">Favorable &middot; ${name} &middot; ${birthDate} ${birthTime} &middot; ${city}${country ? ", " + country : ""} &middot; ${fromLotFr}</div>
</div>

<script>
const years   = ${jsYears};
const scores  = ${jsScores};
const colors  = ${jsColors};
const sizes   = ${jsSizes};
const flags   = ${jsFlags};   // 0=normal 1=pre-LB glossy 2=LB flower 3=Cu blue
const bands   = ${jsBands};
const nowYear = ${jsNow};
const meta    = ${jsMeta};    // per-year tooltip data: {sign, start, end, markers}
const stripData = ${jsStrip};

// ── Draw strip on canvas (works in both browser and PNG export) ──────────────
(function drawStrip() {
  const canvas = document.getElementById('stripCanvas');
  if (!canvas) return;
  const PAD = 36;  // matches padding:0 36px
  const W = canvas.offsetWidth || 1440;
  const H = 20;
  canvas.width  = W * 2;   // retina
  canvas.height = H * 2;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(2, 2);

  const n    = stripData.length;
  const avail = W - PAD * 2;
  const gap  = 2;
  const pillW = Math.max(4, (avail - gap * (n - 1)) / n);
  const pillH = 14;
  const dotR  = 2.5;
  const yTop  = (H - pillH) / 2;

  stripData.forEach(([col, isNow, isCu, isLB, isPreLB], i) => {
    const x = PAD + i * (pillW + gap);

    // Pill background (element color at low opacity)
    ctx.fillStyle = col + '22';
    ctx.beginPath();
    ctx.roundRect(x, yTop, pillW, pillH, 3);
    ctx.fill();

    // Pill border
    ctx.strokeStyle = col + '55';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.roundRect(x, yTop, pillW, pillH, 3);
    ctx.stroke();

    // Dot in center
    const cx = x + pillW / 2;
    const cy = H / 2;

    if (isLB) {
      // LB = flower ✿ text (white)
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px Inter,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✿', cx, cy);
    } else if (isPreLB) {
      // pre-LB = glossy dot
      const grad = ctx.createRadialGradient(cx - dotR*0.35, cy - dotR*0.35, dotR*0.1, cx, cy, dotR*1.2);
      grad.addColorStop(0, 'rgba(255,255,255,0.85)');
      grad.addColorStop(0.5, col);
      grad.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = isCu ? '#ffffff' : col;
      if (isCu) {
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur  = 4;
      }
      ctx.beginPath();
      ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // NOW outline
    if (isNow) {
      ctx.strokeStyle = 'rgba(149,133,204,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x - 1, yTop - 1, pillW + 2, pillH + 2, 4);
      ctx.stroke();
    }
  });
})();

// L1 background bands
const bandPlugin = {
  id: 'l1bands',
  beforeDatasetsDraw(chart) {
    const {ctx, scales} = chart;
    const xs = scales.x, ys = scales.y;
    ctx.save();
    ctx.globalAlpha = 0;
    bands.forEach(b => {
      const x1 = Math.max(xs.getPixelForValue(b.start), xs.left);
      const x2 = Math.min(xs.getPixelForValue(b.end), xs.right);
      if (x2 <= x1) return;
      ctx.fillStyle = b.color;
      ctx.fillRect(x1, ys.top, x2 - x1, ys.bottom - ys.top);
    });
    ctx.restore();
  }
};

// "Now" vertical line
const nowPlugin = {
  id: 'nowline',
  afterDatasetsDraw(chart) {
    const {ctx, scales} = chart;
    const x = scales.x.getPixelForValue(nowYear);
    if (x < scales.x.left || x > scales.x.right) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(149,133,204,0.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, scales.y.top);
    ctx.lineTo(x, scales.y.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#9585CC';
    ctx.font = '9px Inter,sans-serif';
    ctx.globalAlpha = 0.7;
    ctx.fillText('now', x + 4, scales.y.top + 13);
    ctx.restore();
  }
};

// Flower (LB) and glossy halo (pre-LB) drawn after full chart render.
// Uses getDatasetMeta pixel positions — guaranteed correct regardless of scale type.
// Halo = 7 stacked concentric circles (Plotly notebook technique, string concat).
const flowerPlugin = {
  id: 'flowers',
  afterDraw(chart) {
    var c    = chart.ctx;
    var meta = chart.getDatasetMeta(0);
    c.save();
    // Lift any clip region so orbs/flowers can bleed slightly outside chart area
    c.restore();
    c.save();
    for (var i = 0; i < flags.length; i++) {
      var flag = flags[i];
      if (flag === 0) continue;
      var el = meta.data[i];
      if (!el) continue;
      var px = el.x;
      var py = el.y;
      if (flag === 2) {
        // LB → white flower drawn as petals around a center
        var numP = 6;
        var pR   = 5;
        var cR   = 3.5;
        for (var p = 0; p < numP; p++) {
          var ang = (p / numP) * Math.PI * 2 - Math.PI / 2;
          var ex  = px + Math.cos(ang) * (pR + cR);
          var ey  = py + Math.sin(ang) * (pR + cR);
          c.fillStyle = 'rgba(255,255,255,0.85)';
          c.beginPath();
          c.arc(ex, ey, pR, 0, Math.PI * 2);
          c.fill();
        }
        c.fillStyle = 'rgba(255,255,255,0.98)';
        c.beginPath();
        c.arc(px, py, cR, 0, Math.PI * 2);
        c.fill();
      } else if (flag === 1) {
        // pre-LB → 7-layer glow orb, bright lavender/purple
        var layers = [
          [32, 0.03],
          [25, 0.06],
          [19, 0.10],
          [14, 0.16],
          [10, 0.26],
          [ 6, 0.45],
          [ 3, 0.85]
        ];
        for (var j = 0; j < layers.length; j++) {
          var r = layers[j][0];
          var a = layers[j][1];
          c.fillStyle = 'rgba(200,190,245,' + a + ')';
          c.beginPath();
          c.arc(px, py, r, 0, Math.PI * 2);
          c.fill();
        }
        // Bright white center dot
        c.fillStyle = 'rgba(255,255,255,0.95)';
        c.beginPath();
        c.arc(px, py, 2.5, 0, Math.PI * 2);
        c.fill();
      } else if (flag === 3) {
        // Cu (Culmination) → darker glossy orb, deep indigo — distinct from pre-LB purple
        var cuLayers = [
          [22, 0.04],
          [17, 0.08],
          [13, 0.14],
          [10, 0.22],
          [ 7, 0.38],
          [ 4, 0.65],
          [ 2.5, 0.90]
        ];
        for (var k = 0; k < cuLayers.length; k++) {
          var cr = cuLayers[k][0];
          var ca = cuLayers[k][1];
          c.fillStyle = 'rgba(100,120,255,' + ca + ')';
          c.beginPath();
          c.arc(px, py, cr, 0, Math.PI * 2);
          c.fill();
        }
        // Glossy highlight (top-left specular)
        var cuGrad = c.createRadialGradient(px - 2, py - 2, 0.5, px, py, 6);
        cuGrad.addColorStop(0, 'rgba(255,255,255,0.75)');
        cuGrad.addColorStop(0.5, 'rgba(180,190,255,0.25)');
        cuGrad.addColorStop(1, 'rgba(60,80,200,0)');
        c.fillStyle = cuGrad;
        c.beginPath();
        c.arc(px, py, 6, 0, Math.PI * 2);
        c.fill();
      }
    }
    c.restore();
  }
};

// Small white dots below every year label (matches the Canva reference design)
const axisDotsPlugin = {
  id: 'axisdots',
  afterDraw(chart) {
    var c = chart.ctx;
    var xs = chart.scales.x;
    var dotY = xs.bottom + 6;
    c.save();
    for (var i = 0; i < years.length; i++) {
      var px = xs.getPixelForValue(years[i]);
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.beginPath();
      c.arc(px, dotY, 2, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
};

// ── Size chart so 20 years are visible; full width available for PNG export ──
(function() {
  var YEARS_VISIBLE = 20;
  var avail = (window.innerWidth || 1440) - 72; // 36px padding each side
  var pxPerYear = Math.round(avail / YEARS_VISIBLE);
  var fullW = Math.max(avail, years.length * pxPerYear);
  document.getElementById('chartSizer').style.width = fullW + 'px';
})();

const ctx = document.getElementById('spiritChart').getContext('2d');
const grad = ctx.createLinearGradient(0, 0, 0, 300);
grad.addColorStop(0, 'rgba(124,107,191,0.22)');
grad.addColorStop(1, 'rgba(124,107,191,0.00)');

new Chart(ctx, {
  type: 'line',
  plugins: [bandPlugin, nowPlugin, flowerPlugin, axisDotsPlugin],
  data: {
    labels: years,
    datasets: [{
      data: scores,
      borderColor: 'rgba(255,255,255,0.82)',
      borderWidth: 1.5,
      tension: 0.5,
      fill: true,
      backgroundColor: grad,
      pointBackgroundColor: 'transparent',
      pointBorderColor: 'rgba(255,255,255,0.70)',
      pointBorderWidth: 1.5,
      pointRadius: sizes,
      pointHoverRadius: 10,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: 3,
    animation: {duration: 600, easing: 'easeInOutQuart'},
    plugins: {
      legend: {display: false},
      tooltip: {
        backgroundColor: '#130F27',
        borderColor: 'rgba(149,133,204,0.22)',
        borderWidth: 1,
        titleColor: '#E6E2F2',
        bodyColor: '#8C7FAE',
        padding: 12,
        callbacks: {
          title(items) { return String(items[0]?.label ?? ''); },
          label(item) {
            const i = item.dataIndex;
            const m = meta[i];
            if (!m) return 'Score: ' + item.raw;
            const mk = m.markers.length ? '  · ' + m.markers.join(' · ') : '';
            return [
              m.sign + mk,
              m.start + ' → ' + m.end,
              'Score: ' + item.raw,
            ];
          },
        }
      }
    },
    scales: {
      x: {
        grid: {color: 'rgba(255,255,255,0.03)'},
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 50,
          color: 'rgba(255,255,255,0.45)',
          font: {size: 9},
        }
      },
      y: {min: 0, display: false}
    }
  }
});

// ── Scroll to now−10yr so current data is centred on load ───────────────────
(function() {
  var scroller = document.getElementById('chartScroll');
  if (!scroller) return;
  var sizer = document.getElementById('chartSizer');
  var pxPerYear = sizer.offsetWidth / years.length;
  var nowIdx = years.indexOf(nowYear);
  if (nowIdx < 0) nowIdx = years.length - 1;
  scroller.scrollLeft = Math.max(0, (nowIdx - 10) * pxPerYear);

  // Drag-to-scroll on desktop
  var drag = false, startX = 0, scrollX = 0;
  scroller.addEventListener('mousedown', function(e) {
    drag = true; startX = e.pageX; scrollX = scroller.scrollLeft;
    scroller.style.cursor = 'grabbing';
  });
  window.addEventListener('mouseup',   function() { drag = false; scroller.style.cursor = 'grab'; });
  window.addEventListener('mousemove', function(e) {
    if (!drag) return;
    e.preventDefault();
    scroller.scrollLeft = scrollX - (e.pageX - startX);
  });
})();

async function savePng() {
  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.textContent = 'Saving\u2026';
  try {
    const chartCanvas = document.getElementById('spiritChart');
    const quoteBar    = document.getElementById('printable').querySelector('.quote-bar');
    const DPR = 3;

    // Measure quote bar height
    const qh = quoteBar ? quoteBar.getBoundingClientRect().height : 80;

    // Use full sizer width (not scroll-clipped offsetWidth) for the full timeline PNG
    const sizer = document.getElementById('chartSizer');
    const cw = sizer ? sizer.offsetWidth : chartCanvas.offsetWidth;
    const ch = chartCanvas.offsetHeight;
    const totalH = Math.round((qh + ch) * DPR);
    const totalW = Math.round(cw * DPR);

    const out = document.createElement('canvas');
    out.width  = totalW;
    out.height = totalH;
    const c = out.getContext('2d');

    // Background
    c.fillStyle = '#1B1535';
    c.fillRect(0, 0, totalW, totalH);

    // Quote text (drawn with canvas 2D — no html2canvas dependency)
    const quoteEl = quoteBar ? quoteBar.querySelector('.q-text') : null;
    const authorEl = quoteBar ? quoteBar.querySelector('.q-author') : null;
    const qText   = quoteEl  ? quoteEl.textContent  : '';
    const qAuthor = authorEl ? authorEl.textContent : '';
    const PAD = 36 * DPR;
    const maxW = totalW - PAD * 2;

    c.save();
    c.fillStyle = 'rgba(255,255,255,0.82)';
    c.font = (22 * DPR) + 'px Georgia,serif';
    c.textBaseline = 'top';
    // Word-wrap the quote
    const words = qText.split(' ');
    let line = '';
    let lineY = 24 * DPR;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (c.measureText(test).width > maxW && line) {
        c.fillText(line, PAD, lineY);
        line = word;
        lineY += 28 * DPR;
      } else {
        line = test;
      }
    }
    if (line) c.fillText(line, PAD, lineY);
    // Author
    c.fillStyle = 'rgba(255,255,255,0.32)';
    c.font = (11 * DPR) + 'px Inter,sans-serif';
    c.fillText(qAuthor, PAD, lineY + 30 * DPR);
    c.restore();

    // Chart — copy the already-drawn Chart.js canvas
    c.drawImage(chartCanvas, 0, Math.round(qh * DPR), totalW, Math.round(ch * DPR));

    // Download
    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = 'spirit-wave-' + ${jsName} + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch(e) {
    alert('PNG export failed: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save as PNG';
  }
}
</script>
</body>
</html>`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

async function handleGet(request: NextRequest) {
  const p         = request.nextUrl.searchParams;
  const name      = p.get("name")      ?? "You";
  const birthDate = p.get("birthDate") ?? "";
  const birthTime = p.get("birthTime") ?? "12:00";
  const city      = p.get("city")      ?? "";
  const timezone  = p.get("timezone")  ?? "UTC";
  const lat       = parseFloat(p.get("lat") ?? "NaN");
  const lng       = parseFloat(p.get("lng") ?? "NaN");

  if (!birthDate) {
    return new NextResponse("Missing birth date", { status: 400 });
  }

  // Build location payload — calculator accepts lat/lng OR city/country
  const locationPayload = !isNaN(lat) && !isNaN(lng)
    ? { latitude: lat, longitude: lng }
    : { city, country: p.get("country") ?? "" };

  try {
    const raw = await callCalculatorData("/api/zodiacal-releasing", {
      birthDate,
      birthTime,
      ...locationPayload,
      timezone,
      lotType:   "spirit",
      maxLevels: 2,
    });

    const data = raw as ZRData;

    // Response is data.releasing.periods (NOT data.l1Periods)
    if (!data?.releasing?.periods?.length) {
      // Surface raw data for debugging
      const preview = JSON.stringify(data, null, 2).slice(0, 800);
      throw new Error(`No releasing periods found.\n\nRaw response keys: ${Object.keys(data ?? {}).join(", ")}\n\n${preview}`);
    }

    const html = generateHtml(name, city, "", birthDate, birthTime, data);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    // Technical detail stays server-side — the user gets a readable message.
    console.error("[/api/zr-spirit-report] Spirit Wave generation failed", err);
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0A0D1F;color:#e8ecf4;font-family:Inter,system-ui,sans-serif;padding:48px;line-height:1.6">
<h2 style="color:#E6E2F2;font-size:20px;margin:0 0 12px">Your Spirit Wave isn't ready yet</h2>
<p style="color:#A8A1C4;font-size:14px;max-width:460px;margin:0">We couldn't reach the chart service just now. Nothing is wrong with your birth details — please try again in a few minutes.</p>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}


export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

// Les en-tetes CORS doivent etre sur la reponse REELLE, pas seulement sur le
// preflight : sans eux le navigateur jette le resultat malgre un preflight
// accepte. C est ce qui empechait l app d enregistrer les profils.
export const GET = corsHandler(handleGet);
