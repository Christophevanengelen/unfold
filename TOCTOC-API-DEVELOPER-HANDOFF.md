# TocToc API — Complete Developer Handoff

**Everything your app needs. No other file required.**

---

## Quick start

```bash
# Base URL (always HTTPS from the app)
https://ai.zebrapad.io/full-suite-spiritual-api

# Core endpoints:
POST /toctoc.php                    → lifetime "ping" events feed (raw events)
POST /toctoc-app.php                → same scan + sausages for mobile (houses, colors, per-hit cycles)
POST /toctoc-boudin-detail.php      → single boudin detail + LLM-ready delineation payload
POST /toctoc-timeline.php           → monthly intensity scores for charting
POST /toctoc-sausage-html.php       → full sausage data + pre-rendered HTML timeline
POST /daily-briefing-context.php    → priority-ranked personalized signal payload for Unfold AI daily briefing
```

---

## 1. Request (both endpoints, same body)

```json
{
  "birthDate": "1980-10-24",
  "birthTime": "01:41",
  "latitude":  50.8503,
  "longitude":  4.3517,
  "timezone":  "Europe/Brussels"
}
```

Or use `"username": "ma1"` instead of coordinates to load from the database.

| Field | Type | Required |
|-------|------|----------|
| `birthDate` | `YYYY-MM-DD` | ✅ |
| `birthTime` | `HH:MM` | ✅ |
| `timezone` | IANA tz string | ✅ |
| `latitude` | number | ✅ (or username) |
| `longitude` | number | ✅ (or username) |
| `username` | string | alternative to coords |

---

## 2. Response wrapper

```json
{
  "success": true,
  "data": { ...payload... },
  "timestamp": "2026-03-15T10:00:00Z"
}
```

Your app reads `response.data`.

---

## 3a. `toctoc-app.php` — mobile sausage feed

**Same request body** as `toctoc.php` (birth data or `username`). Optionally add `_scanStartDate` / `_scanEndDate` (`YYYY-MM-DD`) to limit the scan.

**What it adds:** `POST /api/toctoc-app` runs `calculateTocToc` then enriches each event into a **sausage** with:

- **`width`:** `thin` \| `medium` \| `large` from score (1–4).
- **House colors:** fixed 12-house palette (Roman I–XII) on `natalContext` and sausage `topics`.
- **Whole sign houses (WSH):** house placement and rulership for `natalContext` use **whole signs from the Ascendant**, not Placidus — consistent with ZR `periodSign` and eclipse axis coloring.
- **Transits:** multi-pass cycles (e.g. Pluto D/R/D) are **exploded** into one sausage per hit, each with `cycle.hitNumber` / `cycle.allHits`.
- **ZR:** Fortune / Spirit / Eros lots that share the same `periodSign`, `level`, `startDate`, and `endDate` are **merged** into one sausage; `lotType` becomes an array (e.g. `["fortune","eros"]`) and `topics` lists all lot base houses + period-sign house.
- **Eclipses:** `topics` combine axis houses (WSH) + houses ruled by the aspected natal planet (traditional rulers on WSH cusps).

**Response highlights (`data`):**

| Field | Use |
|-------|-----|
| `natalContext` | Per-planet/angle: `houseLocated`, `housesRuled`, `topics[]` (WSH) |
| `houseColors` | `1`…`12` → hex |
| `allSausages` | All events as sausages, sorted by `startDate` |
| `months` | `YYYY-MM` → `{ sausages, monthScore, transitScore, zrScore }` |
| `cycles` | By `groupId` — full hit list for transit detail screens |

Use **`toctoc.php`** for a simple chronological event list; use **`toctoc-app.php`** when you need month-bucketed UI, house-colored bubbles, and per-hit transit rows.

---

## 3. `toctoc.php` — payload fields

| Field | Type | Meaning |
|-------|------|---------|
| `person` | object | `{ name, birthDate, birthTime, city, timezone }` |
| `natalPoints` | object | Each natal planet/angle → `{ longitude, sign, degree }` |
| `summary` | object | Event counts by score level (see § 11) |
| `timeline.decades` | object | Decade buckets 0-10…70-80 (see § 12) |
| `events` | array | Chronological list of ping events (see § 4–9) |
| `totalEvents` | number | Count of events |
| `computeTimeSeconds` | number | Server compute time |

**Scan range:** birth → birth + 100 years

---

## 4. Event object — fields present on EVERY event

| Field | Type | Example | Meaning |
|-------|------|---------|---------|
| `id` | string | `"tt_42"` | Unique ID for this run (resets per request) |
| `color` | string | `"#9B1C1C"` | Hex color — use directly for rendering (see § 13) |
| `groupId` | string | `"Pluto_conjunction_Sun"` | Links related events together (see § 14) |
| `date` | string | `"2026-04-01"` | Start date of event window |
| `endDate` | string | `"2026-09-15"` | End date (= `date` for one-day events) |
| `score` | number | `3` | Intensity level: 1 / 2 / 3 / 4 (see § 10) |
| `label` | string | `"toc toc toc"` | Human label for the score |
| `category` | string | `"transit"` | Type bucket (see § 5–9) |
| `type` | string | `"Pluto conjunction natal Sun"` | Display description |
| `isPast` | boolean | `false` | Whether event date is before today |
| `age` | number | `45.3` | Person's age at `date` |
| `intensityScore` | number | `63000` | Numeric weight for boudin/chart sizing (see § 15) |

---

## 5. Transit events (`category: "transit"`)

Planets: Pluto, Neptune, Uranus, Saturn, Jupiter, North Node, South Node

| Field | Type | Example | Meaning |
|-------|------|---------|---------|
| `transitPlanet` | string | `"Pluto"` | Which planet is transiting |
| `natalPoint` | string | `"Sun"` | Which natal point is being aspected |
| `aspect` | string | `"conjunction"` | `conjunction` / `square` / `opposition` / `trine` |
| `parileDate` | string | `"2026-06-12"` | **KEY DATE** — exact date of tightest orb |
| `windowStart` | string | `"2026-05-13"` | Influence begins (parile − window) |
| `windowEnd` | string | `"2026-07-12"` | Influence ends (parile + window) |
| `exactDates` | string[] | `["2026-06-12","2026-09-03"]` | All exact passes (multiple for D/R/D) |
| `pattern` | string | `"Direct-Retrograde-Direct"` | Motion pattern through the transit |
| `bestOrb` | number | `0.12` | Tightest orb in degrees |
| `isReturn` | boolean | `false` | Planet conjuncts its own natal position |
| `isHalfReturn` | boolean | `false` | Planet opposes its own natal position |
| `isVipTransit` | boolean | `true` | Outer planet → personal planet (most significant) |
| `isAList` | boolean | `false` | Transit hits ASC or MC |
| `lifetimeNumber` | number | `1` | Nth occurrence of this exact transit (e.g., 1st Pluto square Moon) |
| `lifetimeTotal` | number | `2` | Total occurrences of this exact transit in person's 100-year scan |
| `planetNatalHistory` | array | `[{aspect:"square",cycleCount:2}]` | All aspect types this planet makes to this natal point (lifetime) |
| `planetNatalTotalCycles` | number | `3` | Total distinct cycles from this planet to this natal point (all aspects) |
| `planetVipContactCount` | number | `28` | Total distinct cycles from this planet to ANY VIP natal point |
| `isMultiHitCycle` | boolean | `true` | True if retrograde multi-pass (2+ exact dates) |

> **Always show `parileDate` as the main date** — `date` is just the cluster start (can be weeks earlier).

### Planet influence windows

| Planet | Window around parile | Meaning |
|--------|----------------------|---------|
| Pluto | ±30 days | 1 month before/after exact |
| Neptune | ±21 days | 3 weeks before/after |
| Uranus | ±14 days | 2 weeks before/after |
| Saturn | ±7 days | 1 week before/after |
| Jupiter | ±7 days | 1 week before/after |
| North/South Node | ±14 days | 2 weeks before/after |

### Example transit event

```json
{
  "id": "tt_7",
  "color": "#9B1C1C",
  "groupId": "Pluto_conjunction_Sun",
  "date": "2026-04-01",
  "endDate": "2026-11-20",
  "parileDate": "2026-06-12",
  "windowStart": "2026-05-13",
  "windowEnd": "2026-07-12",
  "score": 4,
  "label": "toc toc toc toc",
  "category": "transit",
  "type": "Pluto conjunction natal Sun",
  "transitPlanet": "Pluto",
  "natalPoint": "Sun",
  "aspect": "conjunction",
  "exactDates": ["2026-06-12", "2026-09-03", "2026-11-18"],
  "pattern": "Direct-Retrograde-Direct",
  "bestOrb": 0.04,
  "isReturn": false,
  "isHalfReturn": false,
  "isVipTransit": true,
  "isAList": false,
  "lifetimeNumber": 1,
  "lifetimeTotal": 1,
  "planetNatalHistory": [
    {"aspect": "conjunction", "cycleCount": 1},
    {"aspect": "square", "cycleCount": 1},
    {"aspect": "trine", "cycleCount": 1}
  ],
  "planetNatalTotalCycles": 3,
  "planetVipContactCount": 28,
  "isMultiHitCycle": true,
  "isPast": false,
  "age": 45.6,
  "intensityScore": 63000
}
```

---

## 6. Station events (`category: "station"`)

Planets: Mercury, Venus, Mars — when they station retrograde or direct near a natal point.

| Field | Type | Example | Meaning |
|-------|------|---------|---------|
| `transitPlanet` | string | `"Venus"` | Which planet is stationing |
| `natalPoint` | string | `"Moon"` | Natal point within 2° of station |
| `stationType` | string | `"SD"` | `SR` = stations direct · `SD` = stations retrograde |
| `orb` | number | `1.4` | Degrees from natal point |
| `transitLongitude` | number | `22.5` | Ecliptic longitude at station |
| `groupId` | string | `"station_Mercury_SR_Moon"` | Links all occurrences of this planet+type+natal point |
| `lifetimeNumber` | number | `2` | Which occurrence (e.g. 2nd time Mercury stations retrograde near Moon) |
| `lifetimeTotal` | number | `5` | Total occurrences in 100-year scan |
| `allPeriods` | array | `[{date, lifetimeNumber}]` | All occurrence dates, sorted chronologically |

Station events have no `parileDate` / `windowStart` / `windowEnd` — the date IS the station date.

### Example station event

```json
{
  "id": "tt_23",
  "color": "#DB2777",
  "date": "2026-03-01",
  "score": 2,
  "label": "toc toc",
  "category": "station",
  "type": "Venus SD conjunct natal Moon",
  "transitPlanet": "Venus",
  "natalPoint": "Moon",
  "stationType": "SD",
  "orb": 0.9,
  "transitLongitude": 15.7,
  "isPast": false,
  "age": 45.4,
  "intensityScore": 20
}
```

---

## 7. Eclipse events (`category: "eclipse"`)

All eclipses include full **series context** — the app can show the complete axis story.

| Field | Type | Example | Meaning |
|-------|------|---------|---------|
| `transitPlanet` | string | `"eclipse"` | Always `"eclipse"` — use for color lookup |
| `eclipseType` | string | `"solar"` | `solar` or `lunar` |
| `eclipseLongitude` | number | `22.7` | Ecliptic longitude of eclipse |
| `eclipseSign` | string | `"Aries"` | Zodiac sign |
| `eclipseAxis` | string | `"1-7"` | House axis activated (see axis colors below) |
| `axisColor` | string | `"#EAB308"` | Color for this axis — use directly |
| `eclipseSeriesId` | string | `"eclipse_1-7_2024"` | ID for the full eclipse series on this axis |
| `eclipseSeriesStart` | string | `"2024-04-08"` | First eclipse in this series |
| `eclipseSeriesEnd` | string | `"2025-09-21"` | Last eclipse in this series |
| `lastAxisTouch` | string | `"2025-09-21"` | Last date this axis is activated |
| `natalPoint` | string | `"Sun"` | Natal point being aspected |
| `isVipNatal` | boolean | `true` | Hits VIP natal planet |
| `isAngle` | boolean | `false` | Hits ASC or MC |
| `isVipAspect` | boolean | `true` | **★ Star marker** — orb ≤ 5° to VIP natal planet |
| `orb` | number | `2.1` | Orb to natal point |
| `isExactAspect` | boolean | `false` | Orb ≤ 1° — direct hit on natal point |
| `eclipseSeriesAllAxisDates` | array | `[{date,type}]` | All eclipses on this axis in the series (including non-natal) |
| `lifetimeNumber` | number | `1` | Nth eclipse series touching this axis in person's life |
| `lifetimeTotal` | number | `3` | Total eclipse series on this axis in 100-year scan |
| `groupId` | string | `"eclipse_1-7_2024"` | = `eclipseSeriesId` (links all eclipses in series) |

### Eclipse axis colors

| `eclipseAxis` | Signs | Color name | `axisColor` hex |
|---------------|-------|------------|-----------------|
| `"1-7"` | Aries / Libra | Yellow | `#EAB308` |
| `"2-8"` | Taurus / Scorpio | Blue-grey | `#94A3B8` |
| `"3-9"` | Gemini / Sagittarius | Orange | `#EA580C` |
| `"4-10"` | Cancer / Capricorn | Red | `#DC2626` |
| `"5-11"` | Leo / Aquarius | Turquoise | `#0891B2` |
| `"6-12"` | Virgo / Pisces | Purple | `#9333EA` |

> `axisColor` is already set on the event — no need to compute it client-side.

### When to show a star (★)
Show a star badge when `isVipAspect === true` — this eclipse lands within 5° of a personally significant planet. These are the most impactful eclipses.

### Example eclipse event

```json
{
  "id": "tt_31",
  "color": "#D97706",
  "groupId": "eclipse_1-7_2024",
  "date": "2025-03-29",
  "endDate": "2025-03-29",
  "score": 1,
  "label": "toc",
  "category": "eclipse",
  "type": "Solar Eclipse conjunct natal Sun",
  "transitPlanet": "eclipse",
  "eclipseType": "solar",
  "eclipseLongitude": 8.9,
  "eclipseSign": "Aries",
  "eclipseAxis": "1-7",
  "axisColor": "#EAB308",
  "eclipseSeriesId": "eclipse_1-7_2024",
  "eclipseSeriesStart": "2024-04-08",
  "eclipseSeriesEnd": "2025-09-21",
  "lastAxisTouch": "2025-09-21",
  "natalPoint": "Sun",
  "isVipNatal": true,
  "isAngle": false,
  "isVipAspect": true,
  "orb": 3.2,
  "isPast": false,
  "age": 44.4,
  "intensityScore": 156
}
```

---

## 8. ZR events (`category: "zr"`)

Zodiacal Releasing peak periods for three life areas.

| Field | Type | Example | Meaning |
|-------|------|---------|---------|
| `lotType` | string | `"fortune"` | `fortune` (circumstances/career) · `spirit` (mind/vocation) · `eros` (love/desire) |
| `level` | number | `2` | `2` = strongest peak (score 3) · `3` = secondary peak (score 2) |
| `periodSign` | string | `"Leo"` | Sign of the ZR releasing period |
| `markers` | array | `["LB"]` | Special markers: `LB` (loosening of bond) · `Cu` (culmination) · `pre-LB` (foreshadowing) |
| `isPeakPeriod` | boolean | `true` | Angular sign from Fortune (peak activity) |
| `isCulmination` | boolean | `false` | Culmination: 10th sign from the lot (apogée du cycle) |
| `isLB` | boolean | `false` | Loosening of the Bond: major pivot, sequence "jumps" to a new sign |
| `isPreLB` | boolean | `false` | Foreshadowing period: seed of a future LB (~8 years before) |
| `linkedLB` | object\|null | `{lbSign, lbStart, lbEnd}` | Present on pre-LB sausages → points to the future LB |
| `linkedForeshadow` | object\|null | `{foreshadowSign, ...Start, ...End}` | Present on LB sausages → points back to the foreshadowing period |
| `groupId` | string | `"zr_spirit_L2_Leo"` | Links all occurrences of this lot+level+sign across the lifetime |
| `lifetimeNumber` | number | `4` | Which occurrence this is (e.g. 4th time Spirit L2 releases into Leo) |
| `lifetimeTotal` | number | `5` | Total occurrences of this lot+level+sign in the 100-year scan |
| `allPeriods` | array | `[{date, endDate, lifetimeNumber}]` | All occurrences with their start/end dates, sorted chronologically |

### Which ZR events are included

| Type | Level | Score | Condition |
|------|-------|-------|-----------|
| Peak | L2 | 3 (toc toc toc) | Angular sign from Fortune (1st/4th/7th/10th) |
| Peak | L3 | 2 (toc toc) | Angular sign from Fortune |
| **LB** | **L2** | **3 (toc toc toc)** | `markers` includes `"LB"` — major life pivot |
| **Cu** | **L2** | **3 (toc toc toc)** | `markers` includes `"Cu"` — cycle culmination |
| pre-LB | L2 | 3 (toc toc toc) | `markers` includes `"pre-LB"` — foreshadowing (always a peak too) |

> **Note:** L3-level LB/Cu are NOT included as separate events (too frequent, minor impact). Only L2 LB/Cu are elevated to score 3.

### Foreshadowing ↔ LB link (CB discovery)

~8 years before a Loosening of the Bond, the sub-periods pass through the sign the LB will jump to. This is the **foreshadowing** (seed) period. The API links them bidirectionally:

- **pre-LB sausage** → `linkedLB: { lbSign, lbStart, lbEnd }` — what's coming
- **LB sausage** → `linkedForeshadow: { foreshadowSign, foreshadowStart, foreshadowEnd }` — what happened before

Three scenarios (from CB):
1. You almost did something at the foreshadowing → at the LB you finally do it (most common)
2. You started something → at the LB you level up
3. You did something → at the LB you reverse course (least common)

### Example ZR events

**Peak:**
```json
{
  "id": "tt_5",
  "color": "#059669",
  "date": "2026-01-14",
  "endDate": "2027-08-22",
  "score": 3,
  "label": "toc toc toc",
  "category": "zr",
  "type": "ZR L2 Peak — Leo (Fortune)",
  "lotType": "fortune",
  "periodSign": "Leo",
  "level": 2,
  "markers": [],
  "isPeakPeriod": true,
  "isCulmination": false,
  "isLB": false,
  "isPreLB": false,
  "linkedLB": null,
  "linkedForeshadow": null,
  "groupId": "zr_fortune_L2_Leo",
  "lifetimeNumber": 4,
  "lifetimeTotal": 5
}
```

**LB (Loosening of the Bond):**
```json
{
  "id": "tt_120",
  "score": 3,
  "label": "toc toc toc",
  "category": "zr",
  "type": "ZR L2 LB — Sagittarius (Spirit)",
  "lotType": "spirit",
  "periodSign": "Sagittarius",
  "level": 2,
  "markers": ["LB"],
  "isPeakPeriod": false,
  "isCulmination": false,
  "isLB": true,
  "isPreLB": false,
  "linkedLB": null,
  "linkedForeshadow": {
    "foreshadowSign": "Taurus",
    "foreshadowStart": "2031-12-26T00:41:00.000Z",
    "foreshadowEnd": "2032-08-21T23:41:00.000Z"
  },
  "date": "2032-08-22",
  "endDate": "2033-08-17"
}
```

**Pre-LB (Foreshadowing):**
```json
{
  "id": "tt_119",
  "score": 3,
  "label": "toc toc toc",
  "category": "zr",
  "type": "ZR L2 Peak — Taurus (Spirit)",
  "lotType": "spirit",
  "periodSign": "Taurus",
  "level": 2,
  "markers": ["pre-LB"],
  "isPeakPeriod": true,
  "isPreLB": true,
  "isLB": false,
  "linkedLB": {
    "lbSign": "Sagittarius",
    "lbStart": "2032-08-21T23:41:00.000Z",
    "lbEnd": "2033-08-16T23:41:00.000Z"
  },
  "linkedForeshadow": null,
  "date": "2031-12-26",
  "endDate": "2032-08-22"
}
```

---

## 9. Node transit events

North Node and South Node are `category: "transit"` with `transitPlanet: "North Node"` or `"South Node"`. They share the **amber/sun color** (`#D97706`) — same as eclipses.

```json
{
  "transitPlanet": "North Node",
  "color": "#D97706",
  "aspect": "conjunction",
  "score": 4,
  "label": "toc toc toc toc"
}
```

Score 4 when Node conjuncts natal **Sun or Moon** (most personal karmic trigger).
Score 3 for all other natal points.

---

## 10. Score levels — what each means

| Score | Label | What triggers it | UX suggestion |
|-------|-------|-----------------|---------------|
| **4** | `toc toc toc toc` | Pluto/Neptune conjunction VIP natal · Node conjunction Sun/Moon | Exceptional — largest boudin, push notification, highlight |
| **3** | `toc toc toc` | All outer planet transits · ZR L2 peaks · Saturn Returns · All other Node conjunctions | Major — prominent display |
| **2** | `toc toc` | Saturn/Jupiter transits · ZR L3 peaks · VIP station (Mars/Venus near Sun/Moon) · Eclipse + transit + ZR cluster | Significant — standard display |
| **1** | `toc` | Fast-planet stations · Basic eclipses | Notable — smaller display |

### What is "VIP natal"?

A transit is flagged `isVipTransit: true` when an outer planet hits one of these natal targets:
**Sun, Moon, Mercury, Venus, Mars, Jupiter**

**Special rule:** if the person's ASC is in Capricorn or Aquarius → **Saturn** also becomes VIP. If ASC is in Sagittarius or Pisces → **Jupiter** also becomes VIP. (They are the traditional ASC ruler for that chart.)

---

## 11. Summary structure

```json
"summary": {
  "past":   { "toc": 14, "tocToc": 9, "tocTocToc": 6, "tocTocTocToc": 1 },
  "future": { "toc": 5,  "tocToc": 4, "tocTocToc": 3, "tocTocTocToc": 1 },
  "total":  { "toc": 19, "tocToc": 13, "tocTocToc": 9, "tocTocTocToc": 2 }
}
```

Use for: "how many major pings remain?" or lifetime overview badges.

---

## 12. Timeline decades

```json
"timeline": {
  "decades": {
    "0-10":  { "toc": 1, "tocToc": 0, "tocTocToc": 1, "tocTocTocToc": 0 },
    "10-20": { "toc": 3, "tocToc": 2, "tocTocToc": 1, "tocTocTocToc": 0 },
    "20-30": { "toc": 4, "tocToc": 4, "tocTocToc": 3, "tocTocTocToc": 1 },
    "30-40": { "toc": 5, "tocToc": 3, "tocTocToc": 2, "tocTocTocToc": 1 },
    "40-50": { "toc": 3, "tocToc": 3, "tocTocToc": 2, "tocTocTocToc": 0 },
    "50-60": { "toc": 2, "tocToc": 1, "tocTocToc": 0, "tocTocTocToc": 0 },
    "60-70": { "toc": 1, "tocToc": 0, "tocTocToc": 0, "tocTocTocToc": 0 },
    "70-80": { "toc": 0, "tocToc": 0, "tocTocToc": 0, "tocTocTocToc": 0 }
  }
}
```

Use for the lifetime intensity bar chart.

---

## 13. Colors — complete reference

Use `event.color` directly. No mapping needed client-side.

| `transitPlanet` / category | Color name | Hex | Used for |
|---------------------------|------------|-----|----------|
| `"Pluto"` | Deep red | `#9B1C1C` | Pluto transits |
| `"Neptune"` | Royal blue | `#1D4ED8` | Neptune transits |
| `"Uranus"` | Teal | `#0E7490` | Uranus transits |
| `"Saturn"` | Slate grey | `#6B7280` | Saturn transits |
| `"Jupiter"` | Purple | `#7E22CE` | Jupiter transits |
| `"North Node"` | Amber | `#D97706` | North Node transits |
| `"South Node"` | Amber | `#D97706` | South Node transits |
| `"eclipse"` | Amber | `#D97706` | All eclipses (same sun color as nodes) |
| `"Mercury"` | Cool grey | `#9CA3AF` | Mercury stations |
| `"Venus"` | Pink | `#DB2777` | Venus stations |
| `"Mars"` | Red | `#DC2626` | Mars stations |
| `zr` | Emerald | `#059669` | ZR peak periods |

**Note:** Nodes and eclipses intentionally share the amber/sun color — they are karmic/solar triggers.

---

## 14. IDs and groupIds — linking related events

### `id`
Unique within one API call (`"tt_1"` … `"tt_N"`). Use to uniquely identify an event in your UI. Resets on each request.

### `groupId`
Links events that belong together:

| Event type | groupId pattern | What it links |
|------------|-----------------|---------------|
| Transit (all passes) | `"Pluto_conjunction_Sun"` | All retrograde/direct passes of the same transit |
| Node transit | `"NorthNode_conjunction_Mars"` | Both direct passes if retrograde crosses back |
| Eclipse series | `"eclipse_1-7_2024"` | All eclipses on the same house axis in one series |
| Station / ZR | none | Each event is independent |

**Usage:** show "3 passes" indicator, group them visually, or navigate between related events.

```js
// All events in the same Pluto-Sun transit cycle
const thisTransitCycle = events.filter(e => e.groupId === event.groupId);
```

---

## 15. `intensityScore` — how it's computed

This number drives boudin size, chart height, and relative importance. **Larger absolute value = more important.**

### Transit formula
```
intensityScore = planetWeight × windowDays × natalWeight × aspectMult
```

Positive for flowing aspects (conjunction, trine) · Negative for challenging (square, opposition)

| Factor | Values |
|--------|--------|
| `planetWeight` | Pluto / Neptune / Uranus / Nodes = **30** · Saturn = **20** · Jupiter = **15** |
| `windowDays` | Pluto = **30** · Neptune = **21** · Uranus = **14** · Saturn/Jupiter = **7** · Nodes = **14** |
| `natalWeight` | VIP natal target = **50** · Angle (ASC/MC) = **40** · Other = **30** |
| `aspectMult` | Conjunction **1.4** · Square **1.3** · Opposition **1.2** · Trine **1.1** |

### Examples

| Transit | Calculation | `intensityScore` |
|---------|-------------|-----------------|
| Pluto conj natal Sun ★ | 30 × 30 × 50 × 1.4 | **+63,000** |
| Node conj natal Sun ★ | 30 × 14 × 50 × 1.4 | **+29,400** |
| Neptune sq natal Moon ★ | 30 × 21 × 50 × 1.3 | **−40,950** |
| Uranus opp natal Venus ★ | 30 × 14 × 50 × 1.2 | **−25,200** |
| Saturn conj natal ASC | 20 × 7 × 40 × 1.4 | **+7,840** |
| Saturn sq natal Sun ★ | 20 × 7 × 50 × 1.3 | **−9,100** |
| Jupiter opp natal Jupiter | 15 × 7 × 30 × 1.2 | **−3,780** |

★ = VIP natal target (outer planet → personal planet)

### Other categories
- ZR L2 peak: `+60`
- ZR L3 peak: `+20`
- Eclipse (basic): `+60` · VIP natal: `+120` · VIP cluster: `+144` · Star (≤5° VIP): further ×1.3
- Station (basic): `+10` · VIP station: `+20`

---

## 16. `toctoc-timeline.php` — monthly chart data

Same request body as `toctoc.php`. Returns monthly aggregated scores for the lifetime chart.

```json
{
  "yearlyTimeline": [
    {
      "year": 2026,
      "months": [
        {
          "month": "2026-01",
          "zrScore": 60,
          "transitScore": 12500,
          "totalScore": 12560,
          "topEvents": [
            { "type": "ZR L2 Peak — Leo (Fortune)", "score": 3, "category": "zr" },
            { "type": "Saturn square natal Sun", "score": 2, "category": "transit" }
          ]
        }
      ]
    }
  ]
}
```

Use `totalScore` for the mountain-range chart height. Use `topEvents` for tooltip/drilldown.

---

## 16b. `toctoc-sausage-html.php` — pre-rendered HTML timeline

Returns the full TocToc App sausage data **plus** a pre-rendered interactive HTML timeline. Two modes:

| Mode | URL |
|------|-----|
| JSON | `POST https://ai.zebrapad.io/full-suite-spiritual-api/toctoc-sausage-html.php` |
| HTML (browser) | `POST https://ai.zebrapad.io/full-suite-spiritual-api/toctoc-sausage-html.php?format=html` |

**Request body:** same as `toctoc-app.php` (birth data or `username`). Additional optional fields:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `date` | `YYYY-MM-DD` | today | Position of the NOW line on the timeline |
| `startYear` | number | birth year | First year shown in the timeline |
| `endYear` | number | birth+100 | Last year shown in the timeline |
| `title` | string | auto | Custom title for the HTML page |
| `scrollToNow` | boolean | `true` | Auto-scroll to the NOW line on load |
| `_scanStartDate` | `YYYY-MM-DD` | — | Narrow scan window (faster) |
| `_scanEndDate` | `YYYY-MM-DD` | — | Narrow scan window (faster) |

**JSON response** (`?format` omitted or `=json`):
```json
{
  "success": true,
  "html": "<html>...full interactive timeline...</html>",
  "totalSausages": 2396,
  "computeTimeSeconds": 74.7
}
```

**HTML response** (`?format=html`): returns the raw HTML directly with `Content-Type: text/html`.

### Examples

```bash
# JSON mode (default) — get HTML string in response.html
curl -s -X POST "https://ai.zebrapad.io/full-suite-spiritual-api/toctoc-sausage-html.php" \
  -H "Content-Type: application/json" \
  -d '{"username":"ma1","date":"2026-03-21"}'

# HTML mode — save directly to file for browser viewing
curl -s -X POST "https://ai.zebrapad.io/full-suite-spiritual-api/toctoc-sausage-html.php?format=html" \
  -H "Content-Type: application/json" \
  -d '{"username":"ma1","_scanStartDate":"2026-01-01","_scanEndDate":"2026-12-31","date":"2026-06-15"}' \
  -o timeline.html
```

> **Note:** A full birth→100y run can take ~1–2 minutes and return a multi-MB JSON payload; use `_scanStartDate` / `_scanEndDate` for faster tests or smaller HTML.

---

## 17. Recommended usage patterns

### Next upcoming ping
```js
const nextPing = events
  .filter(e => !e.isPast)
  .sort((a, b) => new Date(a.parileDate || a.date) - new Date(b.parileDate || b.date))[0];
```

### Color badge
```js
// Color is already set — use directly
badge.style.backgroundColor = event.color;
```

### Transit display (show parile, not cluster start)
```js
if (event.category === 'transit') {
  mainDate.textContent = event.parileDate;             // "June 12, 2026"
  subtext.textContent  = `${event.windowStart} → ${event.windowEnd}`;
  if (event.exactDates.length > 1) {
    passes.textContent = `${event.exactDates.length} passes: ${event.exactDates.join(', ')}`;
  }
}
```

### Eclipse axis label
```js
if (event.category === 'eclipse' && event.eclipseAxis) {
  axisBadge.textContent          = `Axis ${event.eclipseAxis}`;
  axisBadge.style.backgroundColor = event.axisColor;
  seriesRange.textContent         = `${event.eclipseSeriesStart} → ${event.lastAxisTouch}`;
  if (event.isVipAspect) starIcon.style.display = 'block'; // show ★
}
```

### Group related transit passes
```js
// Show "3 passes" badge and let user navigate between them
const allPasses = events.filter(e => e.groupId === event.groupId);
passesBadge.textContent = `${allPasses.length} passes`;
```

### Score 4 — exceptional treatment
```js
if (event.score === 4) {
  card.classList.add('exceptional');   // larger card / animation
  sendPushNotification(event.type, event.parileDate);
}
```

### Filter by life area (ZR lot)
```js
const loveEvents  = events.filter(e => e.category === 'zr' && e.lotType === 'eros');
const careerPeaks = events.filter(e => e.category === 'zr' && e.lotType === 'spirit');
```

### Relative intensity for boudin sizing
```js
const maxAbs = Math.max(...events.map(e => Math.abs(e.intensityScore)));
const size   = (Math.abs(event.intensityScore) / maxAbs) * MAX_SIZE_PX;
const isFlow = event.intensityScore > 0;  // conjunction/trine = positive = flowing
```

---

## 18. Performance & caching

- **Compute time:** 30–120 seconds cold (full lifetime scan). Always show a loading state.
- **Cache:** results are deterministic per birth data — safe to cache indefinitely per person.
- **Partial loading:** you can show ZR events first (fast) while outer planet transits load.
- **Scan window override:** pass `_scanStartDate` / `_scanEndDate` to limit the range for faster year-specific scans.

---

## 19. Error response

```json
{ "success": false, "error": "birthDate and birthTime are required" }
```

Always check `response.data.success` before reading `events`.

---

## 20. `toctoc-timeline.php` — full response structure

Same request body. Returns the **complete lifetime month-by-month detail** used for the HTML timeline chart.

```json
{
  "success": true,
  "data": {
    "person":      { "name": "ma1", "birthDate": "1980-10-24", "birthTime": "01:41", "city": "Brussels", "timezone": "Europe/Brussels" },
    "natalPoints": { "Sun": { "longitude": 210.5, "sign": "Scorpio", "degree": 0.5 }, "Moon": { ... }, ... },
    "fortuneInfo": { "sign": "Aquarius", "signIndex": 10, "isDayChart": false, "angularSigns": [...], "natalSigns": {...} },
    "summary":     { "past": {...}, "future": {...}, "total": {...} },
    "monthlyTimeline": [...],
    "yearlyTimeline":  [...]
  }
}
```

### `monthlyTimeline` — one entry per calendar month from birth to end of scan

| Field | Type | Meaning |
|-------|------|---------|
| `month` | `"YYYY-MM"` | Calendar month key |
| `zrScore` | number | Sum of ZR event scores active this month |
| `transitScore` | number | Sum of transit/eclipse/station scores |
| `totalScore` | number | `zrScore + transitScore` |
| `age` | number | Person's age at start of month |
| `isPast` | boolean | Whether month is before today |
| `topEvents` | array | Events active or peaking this month (see below) |

### `topEvents` per month — event object fields

| Field | Type | Notes |
|-------|------|-------|
| `type` | string | `"Pluto conjunction natal Sun"` |
| `label` | string | `"toc toc toc"` |
| `score` | number | Score value for this month |
| `category` | string | `"transit"` / `"zr"` / `"eclipse"` / `"station"` |
| `color` | string | Hex color (same as § 13) |
| `exactDate` | string \| null | `"YYYY-MM-DD"` — exact pass date (transit/station/eclipse) |
| `periodStart` | string \| null | `"YYYY-MM-DD"` — ZR period start date |
| `periodEnd` | string \| null | `"YYYY-MM-DD"` — ZR period end date |
| `cyclePassNumber` | number \| null | Which pass in a multi-pass cycle (1, 2, 3, 4…) |
| `cyclePasses` | number \| null | Total passes in the cycle (e.g. 3 for D-R-D) |
| `pattern` | string \| null | `"Direct-Retrograde-Direct"` / `"Single"` / `"Retrograde-Direct"` / etc. |
| `eclipseAxis` | string \| null | `"1-7"` etc. |
| `axisColor` | string \| null | Axis hex color |
| `lotType` | string \| null | ZR: `"fortune"` / `"spirit"` / `"eros"` |
| `level` | number \| null | ZR level (2 or 3) |
| `periodSign` | string \| null | ZR sign name |
| `markers` | array \| null | ZR markers: `["LB"]`, `["Cu"]`, etc. |
| `isCulmination` | boolean | ZR culmination flag |

#### Displaying transit cycle hit numbers

```js
if (ev.cyclePasses > 1) {
  // e.g. "2nd pass of 3" or show badge ②
  badge.textContent = `${ev.cyclePassNumber}/${ev.cyclePasses}`;
  // Pattern explains WHY there are multiple passes
  // "Direct-Retrograde-Direct" = planet went Rx and back
  // "Direct-Direct-Retrograde-Direct" = sign-change crossing (e.g. Uranus Taurus 2018-2020)
  tooltip.textContent = ev.pattern;
}
```

#### Displaying ZR period dates

```js
if (ev.category === 'zr' && ev.periodStart) {
  dateRange.textContent = `${formatMo(ev.periodStart)} → ${formatMo(ev.periodEnd)}`;
  // e.g. "Jan 19 → Jul 20"
}
```

### `yearlyTimeline` — one entry per year

| Field | Type | Meaning |
|-------|------|---------|
| `year` | number | Calendar year |
| `sumScore` | number | Total score across all months |
| `isBusy` | boolean | `true` if sum > threshold (mark as ⚡ busy year) |
| `peakMonthScore` | number | Highest single-month score |
| `peakMonth` | `"YYYY-MM"` | Month with highest score |
| `avgMonthScore` | number | Average monthly score |
| `positiveMonths` | number | Count of months with score > 0 |
| `negativeMonths` | number | Count of months with score < 0 |
| `age` | number | Person's age at start of year |

---

## 21. `toctoc-year.php` — 3-year rolling window

Returns focused data for a **3-year window** (default: current year ± 1). Faster than the full lifetime scan — use this for the main app dashboard.

Same request body as other endpoints. Optionally add `"year": 2027` to shift the window center.

```json
{
  "success": true,
  "data": {
    "person":      { ... },
    "window":      { "startDate": "2025-01-01", "endDate": "2027-12-31", "years": [2025, 2026, 2027], "monthCount": 36 },
    "fortuneInfo": { ... },
    "currentMonth": {
      "month": "2026-03",
      "totalScore": 6,
      "zrScore": 26,
      "transitScore": -20,
      "topEvents": [...]
    },
    "peakUpcomingMonths": [
      {
        "month": "2027-10",
        "totalScore": 334,
        "zrScore": 284,
        "transitScore": 50,
        "topEvents": [...]
      }
    ],
    "years":  [ { "year": 2025, "peakMonthScore": 130, "peakMonth": "2025-08", "sumScore": 358, "monthCount": 12, "positiveMonths": 8, "negativeMonths": 4, "neutralMonths": 0, "sumPositive": 511, "sumNegative": -153, "avgMonthScore": 29.8 } ],
    "months": [ { "month": "2025-01", "year": 2025, "monthNum": 1, "age": 44.19, "isPast": true, "isCurrentMonth": false, "zrScore": 0, "transitScore": 45, "totalScore": 45, "topEvents": [...] } ],
    "computeTimeSeconds": 2.1
  }
}
```

### Key fields

| Field | Meaning | Usage |
|-------|---------|-------|
| `window` | Date range covered | Show "Showing 2025–2027" |
| `currentMonth` | This month's data | Dashboard "right now" block |
| `peakUpcomingMonths` | Top 3 highest-scoring future months | "Your best upcoming months" |
| `years[]` | Year summaries with `isBusy` flag | Year-level bar chart |
| `months[]` | Month detail (same schema as timeline) | Month-by-month grid |

`months[].topEvents` uses the same event schema as § 20 — same `cyclePassNumber`, `cyclePasses`, `exactDate`, `periodStart/End`, etc.

---

## 22. HTML timeline visualization

The full HTML chart (`toctoc_ma1.html`, ~1.2 MB) is generated server-side from `toctoc-timeline.php` data. Your app can:

### Option A: Serve the pre-generated HTML in a WebView / iframe

```
GET /toctoc-html.php?username=ma1
```

The HTML is self-contained — no external dependencies beyond Google Fonts. Embed directly in a WebView.

### Option B: Reproduce the chart yourself using the API data

The HTML chart has two tabs:

#### Tab 1 — Lifetime chart (canvas)
Uses `yearlyTimeline` + `monthlyTimeline` to draw a mountain-range score chart from birth to age 80. X-axis = time, Y-axis = total monthly score.

#### Tab 2 — Year/month grid
Uses `monthlyTimeline` grouped by year. Each month card shows:
- Month name + total score
- ZR score / Transit score split
- List of events (category card per event) with:
  - Planet symbols (☉☽☿♀♂♃♄♅♆♇ + aspects □△☌☍⚹ + zodiac ♈–♓)
  - Score badge
  - **Line 2:** date info:
    - Transit: `"Jun 12"` + cycle hit badge `②` if `cyclePasses > 1`
    - ZR: `"Jan 19→Jul 20"` (period start → end)
  - Color-coded: green = ZR, teal/red = transit pos/neg, purple = eclipse, blue = station

### Planet symbols reference (for rendering in your own UI)

| Planet | Symbol | Aspects | Symbol |
|--------|--------|---------|--------|
| Sun | ☉ | Conjunction | ☌ |
| Moon | ☽ | Opposition | ☍ |
| Mercury | ☿ | Square | □ |
| Venus | ♀ | Trine | △ |
| Mars | ♂ | Sextile | ⚹ |
| Jupiter | ♃ | Semisquare | ∠ |
| Saturn | ♄ | Sesquiquadrate | ⊾ |
| Uranus | ♅ | Quincunx | ⊼ |
| Neptune | ♆ | | |
| Pluto | ♇ | | |
| N.Node | ☊ | Zodiac | ♈♉♊♋♌♍♎♏♐♑♒♓ |
| S.Node | ☋ | | |

---

## 23. `toctoc-boudin-detail.php` — single boudin detail + LLM delineation

**When:** User taps/clicks a specific boudin in the timeline.

### Request

Same body as `toctoc-app.php`, plus a boudin identifier:

```json
{
  "username": "ma1",
  "boudinIndex": 5
}
```

| Field | Type | Required |
|-------|------|----------|
| `boudinIndex` | number | ✅ (0-based position in `allSausages[]`) |
| `boudinId` | string | alt (sausage `id` field, e.g. `"tt_42_h1"`) |

Each sausage from `toctoc-app` has a `boudinIndex` field — pass it back here.

### Response

```json
{
  "success": true,
  "person": { "birthDate": "...", "..." },
  "boudin": { /* full sausage object */ },
  "llmPayload": { /* category-specific, LLM-ready — see below */ },
  "systemPrompt": "Tu es un astrologue expert...",
  "natalContext": { "houseLocated": 3, "housesRuled": [6,7], "topics": [...] },
  "convergence": {
    "level": "double",
    "overlappingEvents": 4,
    "sameHouseEvents": 1,
    "events": [{ "id": "tt_80", "summary": "Uranus trine Sun", "score": 2, "..." }]
  },
  "totalSausages": 127
}
```

### Key fields

| Field | What it is |
|-------|------------|
| `boudin` | The raw sausage, same format as in `allSausages[]` |
| `llmPayload` | Structured for LLM: archetypes, keywords, aspect meanings, house labels, cycle/lifetime context — all inline |
| `systemPrompt` | **Per-category** system prompt (~400 tokens). Only the rules relevant to this boudin type (transit/eclipse/station/zr) |
| `natalContext` | House context for the natal point involved |
| `convergence` | Other events active in the same time window. `level`: `none` / `double` / `triple` |

### `llmPayload.type` determines the content

| `type` | Key fields |
|--------|------------|
| `transit` | `transitPlanet`, `transitPlanetArchetype`, `transitPlanetRarity`, `aspect`, `aspectDetail`, `natalPoint`, `natalHouse`, `natalHouseKeywords`, `ruledHouses[]`, `topics[]`, `cycle { hitNumber, totalHits, hitMeaning, allHits[] }`, `lifetime { number, total, meaning }`, `planetNatalHistory { narrative }`, `isReturn`, `isHalfReturn` |
| `eclipse` | `eclipseType`, `eclipseTypeMeaning`, `eclipseSign`, `axis`, `axisHouses[]`, `natalPoint`, `orb`, `orbInterpretation`, `isExactAspect`, `series { hitNumber, totalHits }`, `lifetime` |
| `station` | `transitPlanet`, `stationType`, `stationMeaning`, `natalPoint`, `orb`, `natalHouse`, `ruledHouses[]`, `topics[]`, `stationRarityNote` |
| `zr` | `lots[]`, `level`, `levelMeaning`, `periodSign`, `periodHouse`, `periodHouseKeywords`, `markers[]`, `hasLooseningOfBond`, `hasCulmination`, `isPeakPeriod`, `isLB`, `isPreLB`, `foreshadowing { role, description, scenarios[], linkedLB, linkedForeshadow, instruction }`, `lifetime` |

### Calling the LLM

```javascript
// The response includes everything — just forward to LLM:
const llm = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    temperature: 0.7,
    system: detail.systemPrompt,           // ~400 tokens, category-specific
    messages: [{ role: 'user', content: JSON.stringify(detail.llmPayload) }]
});
const delineation = JSON.parse(llm.content[0].text);
// → { titre, sousTitre, corps, avecLeRecul, domainesActives, intensite, hitInfo, lifetimeInfo, convergenceNote }
```

### ZR `llmPayload.foreshadowing` object

Present when the ZR boudin is a pre-LB (seed) or LB (pivot). `null` otherwise.

```json
// On a pre-LB (foreshadowing/seed) boudin:
{
  "hasForeshadowing": true,
  "role": "seed",
  "description": "Cette période est le foreshadowing (graine) d'un futur Loosening of the Bond...",
  "scenarios": [
    "Tu commences presque quelque chose sans le concrétiser → au LB tu le réalises enfin (le plus fréquent)",
    "Tu inities quelque chose → au LB tu montes au niveau supérieur",
    "Tu fais quelque chose → au LB tu inverses cette décision (plus rare)"
  ],
  "linkedLB": {
    "sign": "Sagittarius",
    "startDate": "2032-08-21T23:41:00.000Z",
    "endDate": "2033-08-16T23:41:00.000Z"
  }
}

// On an LB (pivot) boudin:
{
  "hasForeshadowing": true,
  "role": "lb",
  "description": "Loosening of the Bond — pivot majeur...",
  "linkedForeshadow": {
    "sign": "Taurus",
    "startDate": "2031-12-26T00:41:00.000Z",
    "endDate": "2032-08-21T23:41:00.000Z"
  },
  "instruction": "La clé pour comprendre ce LB est de regarder ce qui s'est passé pendant le foreshadowing en Taurus (2031-12-26 — 2032-08-21)."
}
```

### App display logic for ZR boudins

| Condition | UI hint |
|-----------|---------|
| `isLB && linkedForeshadow` | Show "Pivot majeur" badge + link to foreshadowing dates |
| `isPreLB && linkedLB` | Show "Graine" badge + "LB prévu en {linkedLB.sign} ({date})" |
| `isCulmination` | Show "Apogée" badge |
| `isPeakPeriod` only | Standard peak display |

### Token budget

| | System | Payload | Total in | Out |
|--|--------|---------|----------|-----|
| Transit | ~400 | ~400 | ~800 | ~200 |
| Eclipse | ~350 | ~350 | ~700 | ~200 |
| Station | ~300 | ~250 | ~550 | ~200 |
| ZR | ~500 | ~350 | ~850 | ~200 |

---

## 24. Endpoint summary

| Endpoint | Speed | Returns | Use for |
|----------|-------|---------|---------|
| `POST /toctoc.php` | 30–120s | Full lifetime event list | Detailed event drilldown, notification engine |
| `POST /toctoc-app.php` | 30–120s | Same events + `natalContext` (WSH), sausages, `months`, `cycles` | Native mobile timeline, colored house bubbles, per-hit transits |
| `POST /toctoc-boudin-detail.php` | 30–120s | Single boudin + `llmPayload` + `systemPrompt` + convergence | User taps a boudin → send to LLM for delineation |
| `POST /toctoc-timeline.php` | 30–120s | Lifetime monthly chart data + events | Lifetime chart, full event timeline |
| `POST /daily-briefing-context.php` | <1s | Priority-ranked signal payload (eclipses, outer transits, Moon filter) | Daily AI briefing — feeds Unfold with personalized, hierarchized context |

---

## 25. Daily Briefing Context — Unfold AI feed

`POST /daily-briefing-context.php`

**Purpose:** Produces a lightweight, personalized payload for the Unfold AI daily briefing. Distinguishes rare personal events (eclipse on natal axis, months-long impact) from universal signals (Moon transit, 2.5-day cycle) using a 4-level priority hierarchy.

**Why this matters:** Without this endpoint, the AI treats *Moon in Leo* the same as *eclipse conjunct natal Venus in house 2* — both appear as generic horoscope text. With it, the AI receives pre-computed `llmPayload` strings with orb, house meaning, and axis context ready to use.

### Request

```json
{
  "birthDate": "1982-09-02",
  "birthTime": "02:15",
  "latitude": 51.2194,
  "longitude": 4.4025,
  "timezone": "Europe/Brussels",
  "targetDate": "2026-08-15"
}
```

`targetDate` is optional — defaults to today. Also supports `"username"` for DB lookup.

### Signal Priority

| Priority | Signal | Typical Duration |
|----------|--------|-----------------|
| **4** | Eclipse ≤ 3° from natal planet (≤ 1° for angles) | 3–6 months |
| **3** | Pluto / Uranus / Neptune / Saturn / Node transit | Weeks–months |
| **2** | Jupiter / Mars transit | 5–21 days |
| **1** | Moon — omit unless within 2° of natal point | 2.5 days |

### Response structure

```json
{
  "success": true,
  "targetDate": "2026-08-15",
  "natalContext": {
    "ascendantSign": "Cancer",
    "ascendantDegree": 14.2,
    "houseSignMap": { "Cancer": 1, "Leo": 2, "..." : "..." },
    "natalPlanetPositions": {
      "Sun":   { "sign": "Virgo",  "degree": 9.8,  "house": 3 },
      "Venus": { "sign": "Leo",    "degree": 18.7, "house": 2 },
      "ASC":   { "sign": "Cancer", "degree": 14.2, "house": 1 },
      "MC":    { "sign": "Aries",  "degree": 5.0,  "house": 10 }
    }
  },
  "activeEclipses": [
    {
      "priority": 4,
      "eclipseType": "solar_total",
      "eclipseDate": "2026-08-12",
      "eclipseSign": "Leo",
      "aspect": "conjunction",
      "natalPointHit": "Venus",
      "orb": 1.27,
      "natalHouse": 2,
      "axisActivated": "2e–8e (Lion–Verseau)",
      "windowStart": "2026-06-13",
      "windowEnd": "2026-11-10",
      "llmPayload": "Éclipse solaire totale à 19.97° Lion... Score priorité : 4/4."
    }
  ],
  "activeTransits": [
    {
      "priority": 3,
      "transitPlanet": "Saturn",
      "aspect": "opposition",
      "natalPoint": "Saturn",
      "natalHouse": 4,
      "houseMeaning": "Foyer, famille, racines",
      "periodStart": "2026-07-01",
      "periodEnd": "2026-09-29",
      "llmPayload": "Saturne transit en opposition avec Saturne natal..."
    }
  ],
  "moonContext": {
    "currentSign": "Pisces",
    "currentDegree": 7.4,
    "natalPointsHit": [],
    "isEclipse": false
  },
  "signalSummary": {
    "highestPriority": 4,
    "activeSignalCount": 3,
    "dominantHouses": [2, 4, 8],
    "dominantDomains": ["Argent, ressources, valeurs", "Foyer, famille, racines"],
    "topSignal": "Éclipse solaire totale à 19.97° Lion..."
  }
}
```

### How to use in the daily briefing flow

1. Call `POST /daily-briefing-context.php` with birth data + `targetDate = today`
2. Feed `signalSummary.topSignal` + `activeEclipses[].llmPayload` + `activeTransits[].llmPayload` directly into the AI system prompt
3. Optionally call `toctoc-boudin-detail.php` for the top-priority event ID for richer narrative
4. The AI no longer needs to infer signal importance — the payload is pre-hierarchized

### Eclipse catalog coverage

The calculator uses a hardcoded 2025–2027 eclipse catalog (NASA data). Key eclipses:

| Date | Type | Degree |
|------|------|--------|
| 2025-03-29 | Solar annular | 9°00' Aries |
| 2025-09-07 | Lunar total | 15°23' Pisces |
| 2025-09-21 | Solar annular | 29°05' Virgo |
| 2026-02-17 | Solar annular | 28°50' Aquarius |
| 2026-03-03 | Lunar total | 12°53' Virgo |
| 2026-08-12 | Solar total | 19°58' Leo |
| 2026-08-28 | Lunar partial | 4°22' Pisces |
| `POST /toctoc-year.php` | 2–10s | 3-year window months + year summaries | Dashboard, current year focus, quick load |

---

## 26. Anniversary / Birthday-Year Prediction (KS + CB workflow)

This section describes the **multi-layer prediction workflow** for the year starting at a person's birthday, combining Kelly Surtees (KS) + Chris Brennan (CB) techniques with the API endpoints.

### Inputs required

| Field | Notes |
|-------|-------|
| `birthDate`, `birthTime`, `timezone` | Standard birth data |
| `latitude`, `longitude` | Birth location (or `username`) |
| `birthdayLocation` | Where the person will be on their birthday — used for the Solar Return chart |
| `targetYear` | The year of the next birthday (or specific age-year to examine) |

---

### Step 1 — Annual profection theme (KS + CB anchor)

**Endpoint:** `POST /profection-calculator.php`

Computes the `profectedHouse`, `profectedSign`, `profectionRuler`, and `planetsInProfectedHouse` for the target birthday age.

- Age formula: `r = age_next_birthday mod 12` → maps to House 1–12 (r=0 → House 12)
- The profection ruler defines **what the year is "about"** — everything else cross-references it
- Check natal condition of the profection ruler: essential dignity (domicile / exaltation / detriment / fall / peregrine), house placement (angular / succedent / cadent), major natal aspects

---

### Step 2 — VIP / A-list prioritization (KS ranking)

Use the `natalContext` field from `toctoc-app.php` to identify VIP planets:

- Planets on angles (ASC/MC/DSC/IC within ~3°)
- Ruler of ASC and MC
- Planets conjunct ASC/MC
- Stellium members
- Most elevated planet

If `profectionRuler` is also a VIP target → **double activation** — treat all transits to/from it as highest priority.

---

### Step 3 — Solar Return at the birthday moment (KS method)

**Endpoint:** `POST /solar-return.php` (pass `birthdayLocation` as the SR location)

Key extractions:
- `SR Ascendant` sign + natal-house placement
- `SR Ruler` (planet ruling SR Ascendant)
- Where `profectionRuler` lands in the SR chart: SR house + SR sign + SR essential dignity + SR angularity
- SR aspects the profection ruler makes within the SR chart

The SR house placement of the profection ruler is the **most important bridge** between profections and how the year's theme manifests concretely.

---

### Step 4 — Secondary Progressions for the profection year (CB + KS)

**Endpoint:** `POST /secondary-progressions.php`

Focus on:
- **Progressed Moon**: sign + natal house + progressed phase
  - Does it aspect `profectionRuler`? → peak timing window
  - Does it aspect `planetsInProfectedHouse`? → supporting activation
- **Progressed Sun** (optional): sign change timing + aspects to `profectionRuler`

---

### Step 5 — Transits for the birthday-year window (three layers)

**Endpoint:** `POST /toctoc-app.php` with `_scanStartDate` = Solar Return date, `_scanEndDate` = next Solar Return

Filter the sausages into three categories:

#### 5.1 Transits TO natal profection ruler (`natalPoint = profectionRuler`)
Peak timing windows — highest-priority signals.
- Prioritize Jupiter/Saturn/outer-planet hits first
- If the transiting planet is also a VIP → extra weight
- In the sausage: `category = "transit"`, `natalPoint = "<profectionRuler>"`

#### 5.2 Transits BY the profection ruler (itself transiting)
- Filter: `transitPlanet = profectionRuler`
- Include ruler return (`isReturn = true`) and retrograde periods (`stationType`)

#### 5.3 Transits THROUGH the profected sign
- Filter: sausages where `natalPoint` is a planet in `planetsInProfectedHouse`, or where the transit overlaps the profected sign's date window

---

### Step 6 — Eclipses hitting key points

From `toctoc-app.php` sausages where `category = "eclipse"`:

Priority contacts:
- Eclipse hitting ASC / MC / DSC / IC (`eclipseHouses` contains 1, 4, 7, or 10)
- Eclipse conjunct/opposing `profectionRuler` (`natalPoint = profectionRuler`)
- Eclipse in the profected house (`eclipseHouses` contains profected house number)
- Eclipse conjunct/opposing `planetsInProfectedHouse`

---

### Step 7 — Confluence scoring rubric

Use this local rubric to assess how internally consistent the birthday-year prediction is:

| Component | Max | Criteria |
|-----------|-----|----------|
| `SRThemeScore` | 5 | +2 if profectionRuler is angular in SR; +1 if in domicile/exaltation in SR; +2 if SR aspects connect strongly to profected house themes |
| `PeakTransitScore` | 10 | +3 per conjunction TO natal profectionRuler; +2 per opposition/square; +1 per trine/sextile; +1 bonus if transiter is Jupiter/Saturn or VIP |
| `ProgressionSupportScore` | 5 | +2 if progressed Moon in profected house; +2 if progressed Moon aspects profectionRuler; +1 if progressed Moon aspects planetsInProfectedHouse |
| `EclipseAmplifier` | ×1.5 | Multiplier starting at 1.0; +0.25 if eclipse hits profectionRuler or an angle; +0.25 if eclipse in profected house |

```
ConfluenceScore = EclipseAmplifier × (SRThemeScore + PeakTransitScore + ProgressionSupportScore)
```

Higher score = stronger internal consistency across KS+CB layers = more meaningful birthday-year prediction.

---

### Step 8 — LLM narrative (RAG-grounded)

Call `POST /toctoc-boudin-detail.php` for the top-priority sausages to get `systemPrompt` + `llmPayload`. Feed those into your AI with RAG queries focused on:

- `profection ruler interpretation [profectedHouse] house`
- `profection ruler solar return interpretation`
- `transits to profection ruler timing`
- `eclipse interpretation [natalHouse] house [solar|lunar]`
- `progressed moon in [natalHouse] profection year interpretation`

---

### Output structure for the anniversary report

```json
{
  "profectionYear": {
    "house": 11,
    "sign": "Gemini",
    "ruler": "Mercury",
    "planetsInHouse": ["Sun"],
    "rulerNatalCondition": "peregrine, cadent"
  },
  "solarReturn": {
    "datetime": "2026-10-24T03:12:00Z",
    "srAscendant": "Leo",
    "profectionRulerInSR": { "house": 3, "sign": "Virgo", "dignity": "domicile", "angularity": "cadent" }
  },
  "progressedMoon": {
    "sign": "Aries", "natalHouse": 9, "aspectsToProfectionRuler": ["trine"]
  },
  "peakTimingWindows": ["2026-11 (Saturn conj Mercury)", "2027-03 (Jupiter trine Mercury)"],
  "eclipseContacts": [{ "date": "2026-08-12", "type": "solar", "natalHouse": 1, "contact": "ASC" }],
  "confluenceScore": 14.5
}
```
