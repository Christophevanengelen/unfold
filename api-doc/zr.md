# Zodiacal Releasing (ZR) — how the web app consumes the AI endpoint

This documents how [ZRWaveChart.tsx](../../../63.astrolearn-revamp-website-webapp/app-astrolearn-newwebsite/components/ui/ZRWaveChart.tsx) and [zr/page.tsx](<../../../63.astrolearn-revamp-website-webapp/app-astrolearn-newwebsite/app/app/astro/(protected)/zr/page.tsx>) (in the `63.astrolearn-revamp-website-webapp` repo) get their data and turn it into the wave chart, and what — if anything — the AI backend controls about dot size.

## 1. The chain: browser → Next.js proxy → AI backend

```
zr/page.tsx
  → fetch(`/api/astrolearn/zr?date=...&lot=...`)        (Next.js route, same repo)
      → app/api/astrolearn/zr/route.ts
          → callCalculatorEndpoint("/api/zodiacal-releasing", { ...birthPayload, lotType, maxLevels: 4, targetDate })
              → POST https://ai.zebrapad.io/full-suite-spiritual-api/api/zodiacal-releasing
                  (PHP file: zodiacal-releasing.php · calculator: calculators/zodiacal_releasing_calculator.js)
```

`ZRWaveChart.tsx` doesn't fetch on its own — it's a presentational component. It's fed `l1Periods` as a prop by whichever page renders it (`zr/page.tsx` for the app view, `explore/[personId]/page.tsx` for the public explore view). `zr/page.tsx` fetches `/api/astrolearn/zr` directly and passes the result down.

Full request/response contract for the AI endpoint: `API-COMPLETE-DOCUMENTATION.md`, section **`POST /api/zodiacal-releasing`** (search for it — it's the canonical doc, see [[astro_api_doc_locations]] memory for canonical vs. draft copies).

### Request (sent by `app/api/astrolearn/zr/route.ts`)

| Field | Source |
|---|---|
| `birthDate`, `birthTime`, `latitude`, `longitude`, `city`, `country` or `username` | resolved from the current subject via `resolveAstrologySubject()` |
| `lotType` | `?lot=` query param — `"fortune"` \| `"spirit"` \| `"eros"` (page defaults to `"spirit"`) |
| `targetDate` | `?date=` query param — which date "current period" is computed against |
| `maxLevels` | hardcoded `4` (L1 → L4) |

### Response — the part that matters for the chart

```json
{
  "releasing": {
    "fromLot": "Lot of Spirit",
    "startingSign": "Gemini",
    "currentPeriods": { "L1": {...}, "L2": {...}, "L3": {...}, "L4": {...} },
    "periods": [ /* L1 array, each with nested subPeriods → L2 → L3 → L4 */ ]
  }
}
```

`zr/page.tsx` reads `zrRaw.releasing.periods` into `rawPeriods` (state) — this is the `l1Periods` tree both files build the chart from.

## 2. The period object — what the API actually sends per period

Every period (L1/L2/L3/L4, nested via `subPeriods`) has this shape (see `API-COMPLETE-DOCUMENTATION.md` → "Period Object"):

| Field | Type | Meaning |
|---|---|---|
| `sign`, `ruler`, `startDate`, `endDate` | — | the releasing chapter |
| `isPeakPeriod` | boolean | angular from the Lot of Fortune (1st/4th/7th/10th) |
| `isCulmination` | boolean | this L2 is the 10th sign from its parent L1 sign |
| `isLoosingOfBond` | boolean | this period is a **Loosing of the Bond (LB)** — a forced jump to the opposite sign, a major reversal |
| `markers` | `string[]` | `[]`, `["LB"]`, `["pre-LB"]`, `["Cu"]`, or combinations |
| `subPeriods` | array | nested periods (L1 → L2 → L3 → L4) |

**There is no numeric field controlling dot size.** The API never returns anything like `"lb": 0.5` or `"lb": 2`. It only gives booleans (`isLoosingOfBond`, `isPeakPeriod`, `isCulmination`) and the `markers` string array (`"LB"`, `"pre-LB"`, `"Cu"`). Every visual weight — score, dot radius, flower size — is computed **client-side**, independently, by each renderer (this web app, and separately the Flutter mobile app) from those flags.

"Pre-LB" (`markers: ["pre-LB"]` / `isForeshadowing`) is the period ~8 years before an LB, in the sign the LB will jump to — the API's own foreshadowing/"seed" concept. This is what the web app treats as `isPreLB`.

## 3. Client-side: from API flags to chart score

Both `ZRWaveChart.tsx` and `zr/page.tsx` (page.tsx has its own copy, `ZRPeriod`/`ZRData`, plus a shared type in the component file — the two are not currently unified) independently:

1. Flatten `subPeriods` into an L2 list, computing a `periodScore()` per L2 from the sign's base score × a multiplier:

   ```ts
   function periodScore(p): number {
     const base = SIGN_SCORE[p.sign] ?? 100;
     if (p.isLoosingOfBond) return Math.round(base * 5.0);   // LB — strongest
     if (p.isPeakPeriod)    return Math.round(base * 4.0);
     if (p.isCulmination)   return Math.round(base * 2.5);
     if (isPreLbPeriod(p))  return Math.round(base * 2.5);   // pre-LB / foreshadowing
     return base;
   }
   ```

2. Roll L2 scores up into one Y value per calendar year (`buildChartL2Data` / `buildChartData`), weighted by how many months of that year the L2 period covers, and roll up `isLB` / `isPreLB` / `isBusy` (peak) / `isCulmination` flags for whichever L2 is dominant that year.

3. For L3/L4 drill-down (`buildChartL3Data`, `buildChartL4Data`), each sub-period becomes one point directly (`toPeriodPoint`), still carrying the same `isLB`/`isPreLB`/`isBusy`/`isCulmination` booleans straight from the API flags.

## 4. Client-side: from flags to dot rendering (small dot vs. LB/pre-LB)

This is the part the mobile Flutter app and this web app must visually agree on. Current code (both `ZRWaveChart.tsx` and `zr/page.tsx`, identical logic):

```ts
const DOT_R  = isMobile ? 4 : 5;    // plain year — small solid dot
const GLOW_R = isMobile ? 9 : 11;   // LB or pre-LB — larger blurred circle

pointG.filter((d) => d.isLB)
  .append("circle").attr("r", GLOW_R).attr("filter", "blur")          // LB: full opacity
pointG.filter((d) => d.isPreLB && !d.isLB)
  .append("circle").attr("r", GLOW_R).attr("filter", "blur").attr("opacity", 0.5)  // pre-LB: 50% opacity
pointG.filter((d) => !d.isLB && !d.isPreLB)
  .append("circle").attr("r", DOT_R)                                   // plain: small solid dot
```

So today: **LB and pre-LB render at the same radius** (`GLOW_R`), distinguished only by opacity (1.0 vs 0.5) and by a Gaussian-blur filter — matching the mobile `fl_chart` painters `FlDotBlurCirclePainter` (LB) / `FlDotLightBlurCirclePainter` (pre-LB). This replaced an earlier version (still in `main`, not yet committed here) that drew two actual flower SVGs (`/images/flower-cycle-plain-white.svg`) at different sizes — **100×108px for LB, 80×86px for pre-LB** — i.e. a real "petite fleur / grande fleur" distinction. That size difference is currently removed in the uncommitted local diff (flagged separately — see chat history for the pending decision on whether to restore it).

`app/api/zr-spirit-report/route.ts` (a separate, PNG-export "Spirit Wave gift" endpoint, not the interactive chart) keeps a third convention: a numeric `flags` array per year (`0=normal 1=pre-LB glossy 2=LB flower 3=Cu blue`) driving a Chart.js plugin that draws an actual ✿ flower glyph only for LB, and a plain glossy halo (no flower) for pre-LB.

## 5. Summary — where "small dot / big dot (floraison)" lives

| Layer | Owns |
|---|---|
| AI endpoint (`POST /api/zodiacal-releasing`) | `isLoosingOfBond`, `isPeakPeriod`, `isCulmination`, `markers: ["LB"\|"pre-LB"\|"Cu"]` — booleans/strings only, **no size/weight field** |
| `ZRWaveChart.tsx` / `zr/page.tsx` | derive `isLB` / `isPreLB` from those flags, compute `periodScore()`, and choose `DOT_R` vs `GLOW_R` + opacity for rendering |
| `zr-spirit-report/route.ts` | separate PNG export, its own `flags` 0–3 convention, draws an actual flower glyph for LB only |
| Mobile (Flutter, separate repo) | not inspected here — reproduce its `FlDotBlurCirclePainter` / `FlDotLightBlurCirclePainter` sizing if pixel parity is the goal |

## References

- `API-COMPLETE-DOCUMENTATION.md` → `POST /api/zodiacal-releasing` (request/response contract, Period Object fields, LB/Cu rules)
- `lib/astrology-subject.ts:426-427` — resolves the endpoint path per subject type
- `lib/astrolearn-calculator.ts:14` — `https://ai.zebrapad.io/full-suite-spiritual-api` base URL
- `app/api/astrolearn/zr/route.ts` — the Next.js proxy route actually called by the pages
- `lib/zr-chart-dates.ts` — axis label formatting, kept in parity with the mobile `chart.dart` `getTitles`
