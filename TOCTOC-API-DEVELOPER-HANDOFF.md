# TocToc API — Complete Developer Handoff

**Everything your app needs. No other file required.**

---

## Quick start

```bash
# Base URL (always HTTPS from the app)
https://ai.zebrapad.io/full-suite-spiritual-api

# Two endpoints:
POST /toctoc.php          → lifetime "ping" events feed
POST /toctoc-timeline.php → monthly intensity scores for charting
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

**Scan range:** birth → min(today + 5 years, age 80)

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
| `markers` | array | `["LB"]` | Special markers: `LB` (loosening of bond) · `Cu` (culmination) · `pre-LB` |
| `isCulmination` | boolean | `false` | Culmination flag |

ZR events have `date` / `endDate` spanning the full peak period. No `parileDate`.

### Example ZR event

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
  "isCulmination": false,
  "isPast": false,
  "age": 45.2,
  "intensityScore": 60
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

## 23. Endpoint summary

| Endpoint | Speed | Returns | Use for |
|----------|-------|---------|---------|
| `POST /toctoc.php` | 30–120s | Full lifetime event list | Detailed event drilldown, notification engine |
| `POST /toctoc-timeline.php` | 30–120s | Lifetime monthly chart data + events | Lifetime chart, full event timeline |
| `POST /toctoc-year.php` | 2–10s | 3-year window months + year summaries | Dashboard, current year focus, quick load |
