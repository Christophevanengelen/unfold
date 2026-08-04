import { NextRequest, NextResponse } from "next/server";
import { callCalculatorData } from "@/lib/astrolearn-calculator";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SRRow {
  year: number;
  age: number;
  birthdayStartDate?: string;
  birthdayEndDate?: string;
  sr?: {
    ascendant?: { sign: string; degree: number };
    srAscNatalHouse?: number;
    srAscIsNatalHouse1Or10?: boolean;
    moon?: { sign: string; element: string; house: number };
    busiestHouse?: { house: number; planetCount: number };
    houseEmphasis?: {
      emphasized: number[];
      scores: { house: number; score: number; reasons: string[]; planets: string[] }[];
    };
  };
  profection?: {
    annual?: { house: number; sign: string; ruler: string };
  };
  pivotal?: {
    score: number;
    isPivotal: boolean;
    isTop10: boolean;
    reasons?: { label: string; orb?: number }[];
  };
}

interface SRData {
  rows: SRRow[];
  pivotalTop10Years?: number[];
}

interface AngularPeakRow {
  year: number;
  age: number;
  angularHouseScore?: number;
  error?: string;
}

interface AngularPeakData {
  bestScore: number;
  peakYears: number[];
  top: { year: number; age: number; angularHouseScore: number; sr?: { moon?: { sign: string; element: string } } }[];
  rows: AngularPeakRow[];
}

// ─── Color helpers ────────────────────────────────────────────────────────────

// Muted, app-tinted element colors — matches MomentumTimelineV2 HOUSE_PALETTE tone
function moonDotColor(el: string): string {
  switch (el) {
    case "fire":  return "#C48A6A"; // warm mauve-orange
    case "earth": return "#7BA88A"; // sage green
    case "air":   return "#B8A472"; // muted gold
    case "water": return "#7A9EBB"; // dusty blue
    default:      return "#A8A1C4"; // brand-9 subtle
  }
}

function moonLabel(el: string): string {
  switch (el) {
    case "fire":  return "Fire Moon";
    case "earth": return "Earth Moon";
    case "air":   return "Air Moon";
    case "water": return "Water Moon";
    default:      return el ?? "—";
  }
}

// ─── HTML generator ───────────────────────────────────────────────────────────

function generateHtml(
  name: string,
  city: string,
  birthDate: string,
  birthTime: string,
  srData: SRData,
  peakData: AngularPeakData | null,
): string {
  const chronological = [...srData.rows].sort((a, b) => a.year - b.year);
  const descending    = [...srData.rows].sort((a, b) => b.year - a.year);

  // Build per-year angular score map
  const angularByYear = new Map<number, number>();
  const peakYearSet   = new Set<number>(peakData?.peakYears ?? []);
  const top10Angular  = new Set((peakData?.top ?? []).slice(0, 10).map((r) => r.year));
  (peakData?.rows ?? []).forEach((r) => {
    if (typeof r.angularHouseScore === "number") angularByYear.set(r.year, r.angularHouseScore);
  });

  // Chart data arrays
  const labels        = chronological.map((r) => String(r.year));
  const pivotalScores = chronological.map((r) => r.pivotal?.score ?? 0);
  const ascHouseData  = chronological.map((r) => r.sr?.srAscNatalHouse ?? null);
  const angularScores = chronological.map((r) => angularByYear.get(r.year) ?? 0);

  const elementColors = chronological.map((r) => moonDotColor(r.sr?.moon?.element ?? ""));
  const pointSizes    = chronological.map((r) => r.pivotal?.isTop10 ? 8 : 4);
  const angularSizes  = chronological.map((r) => top10Angular.has(r.year) ? 8 : 4);
  const angularDotColors = chronological.map((r) =>
    peakYearSet.has(r.year) ? "#7C6BBF" : top10Angular.has(r.year) ? "#9585CC" : "#C8BFDC"
  );

  const maxPivotal = Math.max(...pivotalScores, 1);
  const maxAngular = Math.max(...angularScores, 1);

  // Angular peak summary chips
  const peakTop3 = (peakData?.top ?? []).slice(0, 3).map((r) => `${r.year}`).join(" · ") || "—";
  const bestAngularYear = peakData?.peakYears?.[0] ?? "—";
  const bestAngularScore = peakData?.bestScore ?? 0;

  // Year cards HTML
  const cardsHtml = descending.map((r) => {
    const moonEl      = r.sr?.moon?.element ?? "";
    const dotColor    = moonDotColor(moonEl);
    const pivScore    = r.pivotal?.score ?? 0;
    const isTop10     = r.pivotal?.isTop10;
    const isPivotal   = r.pivotal?.isPivotal;
    const angScore    = angularByYear.get(r.year);
    const isAngPeak   = peakYearSet.has(r.year);
    const ascSign     = r.sr?.ascendant ? `${r.sr.ascendant.sign} ${r.sr.ascendant.degree.toFixed(1)}°` : "—";

    const reasons = (r.pivotal?.reasons ?? [])
      .map((rr) => `<li>${rr.label}${rr.orb != null ? ` (${rr.orb}°)` : ""}</li>`)
      .join("");

    const pivBadge = isTop10
      ? `<span class="badge badge-top">★ Top 10 · ${pivScore}</span>`
      : isPivotal
      ? `<span class="badge badge-pivotal">Pivotal · ${pivScore}</span>`
      : `<span class="badge badge-score">Score · ${pivScore}</span>`;

    const angBadge = isAngPeak
      ? `<span class="badge badge-angular">${angScore} angular</span>`
      : angScore && angScore >= 4
      ? `<span class="badge badge-angular">${angScore} angular</span>`
      : "";

    const ascFlagBadge = r.sr?.srAscIsNatalHouse1Or10
      ? `<span class="badge badge-asc">ASC SR → H${r.sr.srAscNatalHouse}</span>`
      : "";

    return `
      <div class="card" style="border-left:3px solid ${dotColor};">
        <div class="card-header">
          <div class="year-label">
            <span class="dot" style="background:${dotColor};box-shadow:0 0 7px ${dotColor}99;"></span>
            <strong>${r.year}</strong>
            <span class="age">age ${r.age}</span>
          </div>
          <div class="badges">
            ${pivBadge}${angBadge}${ascFlagBadge}
            ${r.sr?.moon ? `<span class="badge badge-element" style="border-color:${dotColor}55;color:${dotColor};opacity:.9;">${moonLabel(moonEl)}</span>` : ""}
          </div>
        </div>
        <div class="card-meta">
          <div><b>SR ASC:</b> ${ascSign} → <b>natal H${r.sr?.srAscNatalHouse ?? "—"}</b></div>
          <div><b>SR Moon:</b> ${r.sr?.moon ? `${r.sr.moon.sign} (H${r.sr.moon.house})` : "—"}</div>
          ${(() => {
            const he = r.sr?.houseEmphasis;
            if (he?.emphasized?.length) {
              const top = he.scores.slice(0, 3).map(s => {
                const tag = s.reasons.some(x => x.includes('conjunct'))
                  ? '⟐'
                  : s.reasons.some(x => x.includes('SR Sun') || x.includes('SR Moon'))
                  ? '☽'
                  : s.planets.length >= 3
                  ? '●●'
                  : '';
                return `<span class="he-chip">H${s.house}<span class="he-score">${s.score}</span>${tag ? `<span class="he-tag">${tag}</span>` : ''}</span>`;
              }).join('');
              const topReasons = he.scores.slice(0, 2)
                .flatMap(s => s.reasons.slice(0, 2).map(r2 => `<li>${r2} (H${s.house})</li>`))
                .join('');
              return `<div class="he-row"><b>Emphasized:</b> ${top}</div>${topReasons ? `<ul class="he-reasons">${topReasons}</ul>` : ''}`;
            }
            return angScore != null ? `<div><b>Angular:</b> ${angScore} planets in H1/4/7/10</div>` : '';
          })()}
          ${r.profection?.annual ? `<div><b>Profection H${r.profection.annual.house}:</b> ${r.profection.annual.sign} · lord: ${r.profection.annual.ruler}</div>` : ""}
          ${r.birthdayStartDate ? `<div class="period">${r.birthdayStartDate} → ${r.birthdayEndDate}</div>` : ""}
        </div>
        ${reasons ? `<div class="reasons-title">Why pivotal</div><ul class="reasons">${reasons}</ul>` : ""}
      </div>`;
  }).join("\n");

  // Serialized data for client JS
  const jsLabels        = JSON.stringify(labels);
  const jsPivotal       = JSON.stringify(pivotalScores);
  const jsAscHouse      = JSON.stringify(ascHouseData);
  const jsAngular       = JSON.stringify(angularScores);
  const jsElementColors = JSON.stringify(elementColors);
  const jsPointSizes    = JSON.stringify(pointSizes);
  const jsAngularSizes  = JSON.stringify(angularSizes);
  const jsAngularColors = JSON.stringify(angularDotColors);
  const jsRows          = JSON.stringify(chronological);

  // App design system — light mode tokens (matches globals.css :root)
  // bg-primary:#F5F1FA  bg-secondary:#ECE7F5  bg-tertiary:#E2DCEE
  // text-heading:#150F2A  text-body:#5C5083  text-body-subtle:#8C7FAE
  // accent-purple:#7C6BBF  border-muted:#E2DCEE  border-light:#D6CEE6
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Birthday Graph — ${name}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:#F5F1FA;color:#150F2A;font-family:'Inter',system-ui,sans-serif;
     -webkit-font-smoothing:antialiased;min-height:100vh;overflow-x:hidden}

/* ── HEADER — glass sticky ── */
#hdr{position:sticky;top:0;z-index:50;
     background:rgba(245,241,250,0.92);backdrop-filter:blur(16px);
     border-bottom:1px solid #E2DCEE;
     padding:12px 28px 10px;
     display:flex;justify-content:space-between;align-items:center}
.h-eyebrow{font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;
           color:#8C7FAE;margin-bottom:3px}
.h-name{font-size:17px;font-weight:700;color:#150F2A;letter-spacing:-.4px}
.h-sub{font-size:10px;color:#8C7FAE;margin-top:1px}
.h-peak{text-align:right}
.h-peak-val{font-size:22px;font-weight:800;color:#7C6BBF;letter-spacing:-.5px}
.h-peak-lbl{font-size:9px;color:#A397C0;margin-top:1px}

/* ── BODY WRAPPER ── */
.wrap{max-width:1120px;margin:0 auto;padding:24px 24px 80px}

/* ── STAT CHIPS ── */
.stat-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px}
.stat-chip{background:#ECE7F5;border:1px solid #D6CEE6;border-radius:14px;
           padding:12px 16px;flex:1;min-width:110px}
.stat-chip .lbl{font-size:8px;font-weight:700;color:#A397C0;
                text-transform:uppercase;letter-spacing:.10em}
.stat-chip .val{font-size:20px;font-weight:800;color:#150F2A;margin-top:3px}
.stat-chip .val.accent{color:#7C6BBF}
.stat-chip .note{font-size:9px;color:#A397C0;margin-top:2px}

/* ── TABS + CHART ── */
.tab-bar{display:flex;border-bottom:1px solid #D6CEE6}
.tab-btn{background:none;border:none;border-bottom:2px solid transparent;
         padding:8px 16px 10px;font-size:11px;font-weight:600;color:#A397C0;
         cursor:pointer;font-family:inherit;transition:all .15s;margin-bottom:-1px}
.tab-btn:hover{color:#7C6BBF}
.tab-btn.active{color:#7C6BBF;border-bottom-color:#7C6BBF}
.chart-wrap{background:#ECE7F5;border:1px solid #D6CEE6;
            border-radius:0 14px 14px 14px;padding:14px 18px 12px;
            margin-bottom:26px;height:278px}
.chart-header{display:flex;justify-content:space-between;align-items:center;
              margin-bottom:8px;flex-wrap:wrap;gap:6px}
.chart-title{font-size:10px;font-weight:600;color:#A397C0;letter-spacing:.02em}
.legend{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.leg{display:flex;align-items:center;gap:4px;font-size:9px;color:#A397C0}
.leg-sw{width:7px;height:7px;border-radius:50%}
#srChart{display:block;width:100%;height:220px}

/* ── CARDS ── */
.section-title{font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
               color:#B7ACD0;margin:0 0 12px}
.grid{display:grid;grid-template-columns:1fr;gap:8px}
@media(min-width:760px){.grid{grid-template-columns:1fr 1fr}}
@media(min-width:1100px){.grid{grid-template-columns:1fr 1fr 1fr}}
.card{background:#FDFCFE;border:1px solid #E2DCEE;border-radius:16px;
      padding:14px 16px;transition:border-color .15s,box-shadow .15s}
.card:hover{border-color:#C8BFDC;box-shadow:0 4px 20px rgba(124,107,191,0.08)}
.card-header{display:flex;justify-content:space-between;align-items:flex-start;
             flex-wrap:wrap;gap:6px;margin-bottom:9px}
.year-label{display:flex;align-items:center;gap:7px}
.dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.year-label strong{font-size:15px;font-weight:700;color:#150F2A}
.age{font-size:10px;color:#B7ACD0;margin-left:1px}
.badges{display:flex;gap:4px;flex-wrap:wrap}
.badge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap}
.badge-top{background:rgba(124,107,191,.14);border:1px solid rgba(124,107,191,.32);color:#5C4B9B}
.badge-pivotal{background:rgba(124,107,191,.08);border:1px solid rgba(124,107,191,.20);color:#7C6BBF}
.badge-score{background:#ECE7F5;border:1px solid #D6CEE6;color:#A397C0}
.badge-angular{background:rgba(184,164,114,.14);border:1px solid rgba(184,164,114,.30);color:#756899}
.badge-asc{background:rgba(124,107,191,.10);border:1px solid rgba(124,107,191,.22);color:#6D5CB0}
.badge-element{background:transparent;border:1px solid;font-weight:600}
.card-meta{font-size:11px;color:#756899;line-height:1.9}
.card-meta b{color:#5C4B9B;font-weight:600}
.period{font-size:9px;color:#C8BFDC;font-family:ui-monospace,monospace;margin-top:2px}
.reasons-title{font-size:8px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;
               color:#C8BFDC;margin-top:10px;margin-bottom:4px}
.reasons{padding-left:13px;font-size:10px;color:#A397C0;line-height:1.8}
.footer{font-size:9px;color:#C8BFDC;text-align:center;
        padding-top:16px;margin-top:24px;border-top:1px solid #E2DCEE;line-height:1.7}
/* House emphasis chips */
.he-row{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:1px}
.he-row b{color:#5C4B9B;font-weight:600;margin-right:2px}
.he-chip{display:inline-flex;align-items:center;gap:2px;
         background:#ECE7F5;border:1px solid #D6CEE6;border-radius:8px;
         padding:1px 6px;font-size:10px;font-weight:600;color:#5C4B9B}
.he-score{font-size:8px;font-weight:700;color:#9585CC;margin-left:2px}
.he-tag{font-size:9px;color:#B8A472;margin-left:1px}
.he-reasons{padding-left:13px;font-size:9px;color:#B7ACD0;line-height:1.7;margin-top:1px}
</style>
</head>
<body>

<div id="hdr">
  <div>
    <div class="h-eyebrow">Birthday Graph</div>
    <div class="h-name">${name}</div>
    <div class="h-sub">${birthDate} ${birthTime} · ${city}</div>
  </div>
  <div class="h-peak">
    <div class="h-peak-val">${bestAngularYear}</div>
    <div class="h-peak-lbl">Best angular SR year</div>
  </div>
</div>

<div class="wrap">
  <div class="stat-row">
    <div class="stat-chip">
      <div class="lbl">Angular score</div>
      <div class="val accent">${bestAngularScore}</div>
      <div class="note">planets in H1/4/7/10</div>
    </div>
    <div class="stat-chip">
      <div class="lbl">Top 3 peaks</div>
      <div class="val" style="font-size:13px;margin-top:5px;letter-spacing:-.3px">${peakTop3}</div>
    </div>
    <div class="stat-chip">
      <div class="lbl">Years analysed</div>
      <div class="val">${chronological.length}</div>
    </div>
    <div class="stat-chip">
      <div class="lbl">Top 10 pivotal</div>
      <div class="val">${srData.pivotalTop10Years?.length ?? 10}</div>
      <div class="note">highlighted on chart</div>
    </div>
  </div>

  <div class="tab-bar">
    <button class="tab-btn active" onclick="switchView('score',this)">Pivotal Score</button>
    <button class="tab-btn" onclick="switchView('angular',this)">Angular Peaks</button>
    <button class="tab-btn" onclick="switchView('house',this)">SR ASC House</button>
    <button class="tab-btn" onclick="switchView('moon',this)">Moon Element</button>
  </div>

  <div class="chart-wrap">
    <div class="chart-header">
      <span class="chart-title" id="chartSubtitle">Pivotal score by year · dots = Moon element · large = Top 10</span>
      <div class="legend">
        <span class="leg"><span class="leg-sw" style="background:#C48A6A"></span>Fire</span>
        <span class="leg"><span class="leg-sw" style="background:#7BA88A"></span>Earth</span>
        <span class="leg"><span class="leg-sw" style="background:#B8A472"></span>Air</span>
        <span class="leg"><span class="leg-sw" style="background:#7A9EBB"></span>Water</span>
        <span class="leg"><span class="leg-sw" style="background:#7C6BBF"></span>Angular peak</span>
      </div>
    </div>
    <canvas id="srChart"></canvas>
  </div>

  <div class="section-title">Year-by-year breakdown — newest first</div>
  <div class="grid">${cardsHtml}</div>

  <div class="footer">Birthday Graph · Unfold · Solar Return data</div>
</div>

<script>
const labels        = ${jsLabels};
const pivotalScores = ${jsPivotal};
const ascHouseData  = ${jsAscHouse};
const angularScores = ${jsAngular};
const elementColors = ${jsElementColors};
const pointSizes    = ${jsPointSizes};
const angularSizes  = ${jsAngularSizes};
const angularColors = ${jsAngularColors};
const allRows       = ${jsRows};

const maxPivotal = Math.max(...pivotalScores, 1);
const maxAngular = Math.max(...angularScores, 1);

const ctx = document.getElementById('srChart').getContext('2d');

const grad = ctx.createLinearGradient(0, 0, 0, 220);
grad.addColorStop(0, 'rgba(124,107,191,0.18)');
grad.addColorStop(1, 'rgba(124,107,191,0.00)');

const angularPeakColor = '#7C6BBF';

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels,
    datasets: [
      {
        label: 'Pivotal score',
        data: pivotalScores,
        borderColor: 'rgba(124,107,191,0.65)',
        borderWidth: 1.5,
        tension: 0.4,
        fill: true,
        backgroundColor: grad,
        pointBackgroundColor: elementColors,
        pointBorderColor: elementColors,
        pointRadius: pointSizes,
        pointHoverRadius: 9,
        hidden: false
      },
      {
        label: 'Angular emphasis',
        data: angularScores,
        borderColor: 'rgba(124,107,191,0.50)',
        borderWidth: 1.5,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: angularColors,
        pointBorderColor: angularColors,
        pointRadius: angularSizes,
        pointHoverRadius: 9,
        hidden: true
      },
      {
        label: 'SR ASC house',
        data: ascHouseData,
        borderColor: 'rgba(163,151,192,0.60)',
        borderWidth: 1.5,
        tension: 0.4,
        fill: false,
        pointBackgroundColor: 'rgba(163,151,192,0.80)',
        pointBorderColor: 'rgba(163,151,192,0.80)',
        pointRadius: 3,
        pointHoverRadius: 7,
        hidden: true
      },
      {
        label: 'Moon element',
        data: pivotalScores,
        borderColor: 'transparent',
        borderWidth: 0,
        fill: false,
        pointBackgroundColor: elementColors,
        pointBorderColor: elementColors,
        pointRadius: pointSizes.map(s => s + 2),
        pointHoverRadius: 10,
        hidden: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300, easing: 'easeInOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(245,241,250,0.97)',
        borderColor: '#D6CEE6',
        borderWidth: 1,
        titleColor: '#150F2A',
        bodyColor: '#8C7FAE',
        padding: 12,
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex ?? 0;
            const r = allRows[idx];
            return r ? String(r.year) + '  (age ' + r.age + ')' : '';
          },
          label: () => '',
          afterLabel: (item) => {
            const idx = item.dataIndex;
            const r = allRows[idx];
            if (!r) return [];
            const lines = [];
            if (r.sr?.ascendant) lines.push('SR ASC: ' + r.sr.ascendant.sign + ' ' + r.sr.ascendant.degree.toFixed(1) + '° → H' + (r.sr.srAscNatalHouse || '?'));
            if (r.sr?.moon) lines.push('Moon: ' + r.sr.moon.sign + ' ' + (r.sr.moon.element || '') + ' (H' + r.sr.moon.house + ')');
            lines.push('Pivotal score: ' + (r.pivotal?.score ?? 0) + (r.pivotal?.isTop10 ? ' ★ Top 10' : r.pivotal?.isPivotal ? ' ◆ Pivotal' : ''));
            const ang = angularScores[idx];
            if (ang) lines.push('Angular: ' + ang + ' planets H1/4/7/10');
            if (r.profection?.annual) lines.push('Profection: H' + r.profection.annual.house + ' · ' + r.profection.annual.ruler);
            return lines;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(182,172,208,0.18)' },
        ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 20,
                 color: '#B7ACD0', font: { size: 10, family: 'Inter,system-ui,sans-serif' } }
      },
      y: {
        min: 0,
        suggestedMax: maxPivotal * 1.18,
        grid: { color: 'rgba(182,172,208,0.18)' },
        ticks: { precision: 0, color: '#B7ACD0', font: { size: 10, family: 'Inter,system-ui,sans-serif' } }
      }
    }
  }
});

const VIEWS = {
  score:   { subtitle: 'Pivotal score by year · dots = Moon element · large = Top 10',
             yMin:0, yMax:maxPivotal*1.18, datasets:[true,false,false,false] },
  angular: { subtitle: 'Angular emphasis (planets in SR houses 1/4/7/10) · purple = peak years',
             yMin:0, yMax:maxAngular+1.5, datasets:[false,true,false,false] },
  house:   { subtitle: 'SR Ascendant natal house (1–12) · where does your SR ASC land each year?',
             yMin:0.5, yMax:12.5, datasets:[false,false,true,false] },
  moon:    { subtitle: 'Moon element by year · muted tones match the app design',
             yMin:0, yMax:maxPivotal*1.18, datasets:[false,false,false,true] }
};

function switchView(key, btn) {
  const v = VIEWS[key];
  if (!v) return;
  chart.data.datasets.forEach((ds, i) => { ds.hidden = !v.datasets[i]; });
  chart.options.scales.y.min = v.yMin;
  if (key === 'house') { chart.options.scales.y.max = v.yMax; delete chart.options.scales.y.suggestedMax; }
  else { delete chart.options.scales.y.max; chart.options.scales.y.suggestedMax = v.yMax; }
  chart.update();
  document.getElementById('chartSubtitle').textContent = v.subtitle;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
</script>
</body>
</html>`;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const p    = request.nextUrl.searchParams;
  const name = p.get("name") ?? "You";
  const date = p.get("date") ?? "";
  const time = p.get("time") ?? "12:00";
  const city = p.get("city") ?? "";
  const tz   = p.get("tz")   ?? "UTC";
  const lat  = parseFloat(p.get("lat") ?? "48.8566");
  const lng  = parseFloat(p.get("lng") ?? "2.3522");

  if (!date) {
    return new NextResponse("Missing birth date", { status: 400 });
  }

  const birthYear = parseInt(date.split("-")[0], 10);
  const endYear   = new Date().getFullYear();

  const input = {
    birthDate: date,
    birthTime: time,
    latitude:  lat,
    longitude: lng,
    timezone:  tz,
    startYear: birthYear + 1,   // First solar return is 1 year after birth
    endYear,
  };

  try {
    // Call both calculators in parallel
    const [srRaw, peakRaw] = await Promise.all([
      callCalculatorData("/api/solar-return-timeline", input),
      callCalculatorData("/api/rs-angular-peak-year", { ...input, topN: 10 }),
    ]);

    // Normalise SR data shape
    const srData = srRaw as SRData & { rows?: SRRow[] };
    const normSr: SRData = srData?.rows ? srData : { rows: [], pivotalTop10Years: [] };

    const peakData = peakRaw as AngularPeakData | null;

    const html = generateHtml(name, city, date, time, normSr, peakData);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    // Technical detail stays server-side — the user gets a readable message.
    console.error("[/api/birthday-report] Birthday Graph generation failed", err);
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
      <body style="background:#080c18;color:#e8ecf4;font-family:Inter,system-ui,sans-serif;padding:48px;line-height:1.6">
        <h2 style="color:#E6E2F2;font-size:20px;margin:0 0 12px">Your Birthday Graph isn't ready yet</h2>
        <p style="color:#A8A1C4;font-size:14px;max-width:460px;margin:0">We couldn't reach the chart service just now. Nothing is wrong with your birth details — please try again in a few minutes.</p>
      </body></html>`,
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}
