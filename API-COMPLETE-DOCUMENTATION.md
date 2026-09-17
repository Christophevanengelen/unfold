# Complete API Documentation - Full Suite Spiritual API

This document contains the complete reference for all API endpoints with their **exact required and optional parameters**.

---

## Production Server

**Base URL:** `http://ai.zebrapad.io/full-suite-spiritual-api`

**Example:** `POST http://ai.zebrapad.io/full-suite-spiritual-api/api/profection`

All paths are relative to the base URL (e.g. `/api/profection`, `/api/blueprint`). This matches `test_all_endpoints_comprehensive.js` which uses `BASE_URL + path`.

---

## Endpoints in test_all_endpoints_comprehensive.js

The following table lists every endpoint exercised by the test file, with HTTP method. Use it to keep docs and tests in sync.

| Method | Path |
|--------|------|
| POST | `/api/blueprint` |
| POST | `/api/blueprint-alix` |
| POST | `/api/blueprintcomplete` |
| POST | `/api/aspects` |
| POST | `/api/birth-chart-interactive` |
| POST | `/api/birth-chart-honey` |
| POST | `/api/birth-chart-transits` |
| POST | `/api/synastry-chart` |
| POST | `/api/match` |
| POST | `/api/human-design-chart-interactive` |
| POST | `/api/timing` |
| POST | `/api/timingcomplete` |
| POST | `/api/numerology-timing` |
| POST | `/api/profection` |
| POST | `/api/solar-return` |
| POST | `/api/zodiacal-releasing` |
| POST | `/api/triplicity` |
| POST | `/api/ascensional-times` |
| POST | `/api/secondary-progressions` |
| POST | `/api/solar-arcs` |
| POST | `/api/transits-exact` |
| POST | `/api/transits-exact-short` |
| POST | `/api/transits-date` |
| POST | `/api/transit-cycles` |
| POST | `/api/transit-sign-houses` |
| GET | `/api/current-transits` |
| GET | `/api/daily-transits` |
| POST | `/api/slow-planet-transits` |
| POST | `/api/hard-aspect-finder` |
| POST | `/api/recurrence-transits/next` |
| POST | `/api/recurrence-transits/all` |
| POST | `/api/recurrence-transits/calendar` |
| POST | `/api/recurrence-transits/aspect-patterns` |
| POST | `/api/agenda/transits` |
| POST | `/api/moon-bad-days` |
| POST | `/api/career-days` |
| POST | `/api/love-days` |
| POST | `/api/lucky-days` |
| POST | `/api/electional-dates` |
| POST | `/api/personalized-electional-dates` |
| POST | `/api/yearly-forecast` |
| POST | `/api/yearly-timing` |
| POST | `/api/comprehensive-yearly-timing` |
| POST | `/api/mundane-timing` |
| GET | `/api/mundane-daily` |
| POST | `/api/monthly-timing` |
| POST | `/api/yearly-ingresses` |
| POST | `/api/arabic-parts` |
| POST | `/api/arabic-parts/transits` |
| POST | `/api/horary` |
| POST | `/api/query/chart-analysis` |
| POST | `/api/query/timing` |
| POST | `/api/query/transits` |
| POST | `/api/query/relationships` |
| POST | `/api/query/eclipses` |
| POST | `/api/query/electional` |
| POST | `/api/query/health` |
| POST | `/api/query/yearly-forecast` |
| POST | `/api/query/solar-return` |
| POST | `/api/bazi/calculate` |
| GET | `/api/bazi/annual-pillars` |
| POST | `/api/bazi/profile` |
| POST | `/api/bazi/excess-elements` |
| GET | `/api/fengshui/flying-stars/annual` |
| GET | `/api/fengshui/flying-stars/monthly` |
| GET | `/api/fengshui/afflictions` |
| POST | `/api/fengshui/personal-directions` |
| POST | `/api/fengshui/analyze` |
| POST | `/api/qimendunjia/calculate` |
| POST | `/api/qimendunjia/action` |
| POST | `/api/predictions/2026` |
| POST | `/api/predictions/monthly` |
| POST | `/api/predictions/activity` |
| POST | `/api/draw-your-chart` |
| POST | `/api/jyotish/chart` |
| POST | `/api/jyotish/dasha` |
| POST | `/api/jyotish/reference` |
| POST | `/api/jyotish/varga` |
| POST | `/api/jyotish/ashtakavarga` |
| POST | `/api/jyotish/panchanga` |
| POST | `/api/hd/chart` |
| POST | `/api/hd/type` |
| POST | `/api/hd/authority` |
| POST | `/api/hd/centers` |
| POST | `/api/hd/profile` |
| POST | `/api/toctoc` |
| POST | `/api/toctoc-app` |
| POST | `/api/toctoc-app-short` |
| POST | `/api/toctoc-timeline` |
| POST | `/api/toctoc-year` |
| POST | `/api/toctoc-sausage-html` |
| POST | `/api/toctoc-boudin-detail` |
| POST | `/api/event-timing-analysis` |
| POST | `/api/eclipse-life-pattern` |
| POST | `/api/timelines` |
| POST | `/api/daily-briefing-context` |
| POST | `/api/connection-brief` |
| POST | `/api/profile-insights` |
| POST | `/api/ephemeris-expert` |
| POST | `/api/solar-return-timeline` |
| POST | `/api/rs-angular-peak-year` |
| POST | `/api/planetary-periods` |
| POST | `/api/planetary-activation` |
| POST | `/api/person-search` |
| POST | `/api/generate-report` |
| POST | `/api/person-search-bulk` |
| GET  | `/person-search-template.php` |
| POST | `/api/person-categories` |
| POST | `/api/person-event-enrich` |
| POST | `/api/circumambulations` |
| POST | `/api/planetary-condition` |
| POST | `/api/timelord-synthesis` |
| POST | `/api/person-search-export` |
| POST | `/api/toctoc-highlights` |
| POST | `/api/ask` |
| POST | `/api/bodygraph-interactive` |
| POST | `/api/gene-keys` |
| POST | `/api/gene-keys-interactive` |
| POST | `/api/yearly-prediction` |
| POST | `/api/birth-chart-transits` |
| POST | `/api/chart-data` |
| POST | `/api/mundane-monthly-agenda` |
| POST | `/api/monthly-horoscope` |
| POST | `/api/daily-brief` |
| POST | `/api/public-persons` |
| POST | `/api/planetary-aspect-archetypes` |
| POST | `/api/planetary-alignment-finder` |
| POST | `/api/bazi/animal-rankings` |
| POST | `/api/bazi/animal-analysis` |
| POST | `/api/bazi/element-keywords` |
| POST | `/api/bazi/keywords/adapted` |
| POST | `/api/bazi/keywords` |
| POST | `/api/fengshui/24-mountains` |
| POST | `/api/fengshui/24-mountains/activation-dates` |
| POST | `/api/fengshui/almanach/search` |
| POST | `/api/fengshui/activation-dates/nobles` |
| POST | `/api/fengshui/activation-dates/prosperity` |
| POST | `/api/fengshui/activation-dates/health` |
| POST | `/api/fengshui/activation-dates/studies` |
| POST | `/api/fengshui/activation-dates/problem-solving` |
| POST | `/api/fengshui/eclipses` |
| POST | `/api/fengshui/period-9` |
| POST | `/api/fengshui/period-9/activation-dates` |
| POST | `/api/qimendunjia/destiny-palace` |
| POST | `/api/qimendunjia/palace-hexagrams` |
| POST | `/api/yijing/year-hexagram` |
| POST | `/api/yijing/personal-hexagram` |
| POST | `/api/tibetan-astrology/calculate` |
| POST | `/api/celestial-movements` |
| POST | `/api/mantra/unlimited-opportunities` |
| POST | `/api/manifestation/dates` |
| POST | `/api/wealth-lottery` |
| POST | `/api/wealth-lottery-rank` |
| POST | `/api/entrepreneur` |
| POST | `/api/entrepreneur-rank` |
| POST | `/api/happy-marriage` |
| POST | `/api/happy-marriage-rank` |
| POST | `/api/happy-marriage-synastry` |
| POST | `/api/firdaria` |
| POST | `/api/lunar-return` |
| POST | `/api/primary-directions` |
| POST | `/api/master-of-nativity` |
| POST | `/api/sports-professional` |
| POST | `/api/scholar` |
| POST | `/api/traveller` |
| POST | `/api/visual-artist` |

---

## Quick Test — New Endpoints (2026-08-08)

Copy-paste ready curl commands for the most recently added endpoints.

### Lottery Winner Profile

```bash
# Single person — by name
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/wealth-lottery.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Werner Bruni"}'

# Single person — by birth data
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/wealth-lottery.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-08-17","birthTime":"06:00","latitude":49.6096,"longitude":6.12966,"timezone":"Europe/Luxembourg","personName":"Test Person"}'

# Rank several people
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/wealth-lottery-rank.php" \
  -H "Content-Type: application/json" \
  -d '{"names":["Werner Bruni","Marie Curie","Albert Einstein"]}'
```

### Entrepreneur Profile

```bash
# Single person — by name
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/entrepreneur.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Elon Musk"}'

# Single person — by birth data (Steve Jobs)
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/entrepreneur.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1955-02-23","birthTime":"19:15","latitude":37.3382,"longitude":-121.8863,"timezone":"America/Los_Angeles","personName":"Steve Jobs"}'

# Rank several people
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/entrepreneur-rank.php" \
  -H "Content-Type: application/json" \
  -d '{"names":["Warren Buffett","Jeff Bezos","Bill Gates","Steve Jobs","Elon Musk"]}'
```

**Reference scores (V3 entrepreneur rubric):**
- Warren Buffett: 9/10 · Jeff Bezos: 9/10 · Bill Gates: 8/10 · Steve Jobs: 6/10 · Elon Musk: 5/10

### Happy Marriage Profile

```bash
# Single person — natal score
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/happy-marriage.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Gloria Estefan"}'

# Synastry — two people (includes cross-chart Jung signals)
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/happy-marriage.php" \
  -H "Content-Type: application/json" \
  -d '{"person1":{"name":"Jimmy Carter"},"person2":{"name":"Rosalynn Carter"}}'

# Rank several people
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/happy-marriage-rank.php" \
  -H "Content-Type: application/json" \
  -d '{"names":["Gloria Estefan","T.S. Eliot","Fred Rogers","Jimmy Carter"]}'
```

**Reference scores (V1 happy-marriage rubric):**
- Gloria Estefan: 7/10 (Moon–Venus sextile, Venus domicile, Jupiter–Venus conj, H7 lord Mercury domicile)
- T.S. Eliot: 6/10 · Fred Rogers: 4/10 · Jimmy Carter: 4/10 · Queen Victoria: 2/10

---

## Endpoint Status (Tested 2026-02-09)

**Latest run (`test_results_2026-02-09.json`):** All tested endpoints passed — **0 failures**. The list below and the "Previously reported issues" table are kept for reference.

### ✅ Working Endpoints

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/sports-professional` | ✅ Working (2026-08-09) | Scores natal chart vs sports-professional rubric (n=232 vs n=486 control). #1 signal: Venus–Moon major aspect +9.4%. Accepts name/personId/birth data. Returns 1–10 rating + breakdown. |
| `/api/scholar` | ✅ Working (2026-08-09) | Scores natal chart vs academic-scholar rubric (n=229 vs n=486 control). Top signals: night chart +7.1%, H3 planets +7.1%. Accepts name/personId/birth data. |
| `/api/traveller` | ✅ Working (2026-08-09) | Scores natal chart vs traveller/expatriate rubric (n=340 vs n=486 control). #1 signal: Moon in mutable +8.6%. Accepts name/personId/birth data. |
| `/api/visual-artist` | ✅ Working (2026-08-09) | Scores natal chart vs fine-art-painter rubric (n=381 vs n=486 control). #1 signal: Moon–Mercury major aspect +7.8%. Accepts name/personId/birth data. |
| `/api/happy-marriage` | ✅ Working (2026-08-09) | Natal score vs happy-marriage rubric (n=172 DB study). #1 signal: Moon–Venus c/s/t (45% happy vs 30% divorced). Synastry mode via person1+person2. Gloria Estefan 7/10, T.S. Eliot 6/10. |
| `/api/happy-marriage-rank` | ✅ Working (2026-08-09) | Ranks multiple persons by happy-marriage natal score. Input: { names: [] } or { persons: [] }. |
| `/api/happy-marriage-synastry` | ✅ Working (2026-08-09) | Alias for happy-marriage with person1+person2 input; emphasises synastry output. |
| `/api/firdaria` | ✅ Working (2026-08-09) | Hellenistic/Medieval major & sub-period time lords. Day/night sequences (Abu Ma'shar / KS). Accepts birth data or username. Returns sect, current period, full majors + subs arrays. |
| `/api/lunar-return` | ✅ Working (2026-08-09) | Finds Moon return moment (next/prev/around); casts chart at return location; biwheel summary: LR ASC sign, natal house of LR ASC, angular planets, Moon aspects. |
| `/api/primary-directions` | ✅ Working (2026-08-09) | Directs ASC/MC/planets to natal points via Naibod (~0.9856°/yr) or Ptolemaic (1°/yr) key. Scan by year range. No longevity fields. |
| `/api/master-of-nativity` | ✅ Working (2026-08-09) | Predominator + Egyptian bound lord candidate (CB TAP 205). Returns sect, predominator, masterCandidate, rationale[], links to /api/planetary-condition. No death-age fields. |
| `/api/happy-marriage` | ✅ Working (2026-08-08) | Scores natal chart vs happy-marriage rubric (n=172 happy vs n=80 divorced, astrolearn DB). #1 signal: Moon–Venus c/s/t (+15%). Accepts name/personId/birth data. Returns 1–10 rating + breakdown. |
| `/api/happy-marriage-rank` | ✅ Working (2026-08-08) | Ranks multiple persons by happy-marriage score. Input: `{ names: [] }` or `{ persons: [] }`. Returns sorted array with rank, rating, keySignals. |
| `/api/happy-marriage-synastry` | ✅ Working (2026-08-08) | Synastry overlay (Jung-style cross-chart). Input: `{ person1: {…}, person2: {…} }`. Returns cross-aspect analysis for Sun/Moon/Venus/Mars/ASC. |
| `/api/entrepreneur` | ✅ Working (2026-08-08) | Scores natal chart vs V3 entrepreneur rubric (n=88 DB study). #1 signal: H10 lord c/s/t from Jup/Ven (80% vs base 66%). Jupiter dignity +3 (+11% above base). Buffett 9, Bezos 9, Gates 8, Jobs 6, Musk 5. |
| `/api/entrepreneur-rank` | ✅ Working (2026-07-31) | Ranks multiple persons by entrepreneur profile score. Input: { names: [] } or { persons: [] }. Returns sorted array with rank, rating, keySignals. |
| `/api/wealth-lottery` | ✅ Working (2026-07-31) | Scores natal chart vs Demetra George lottery-winner pattern (n=20). Accepts name/personId/birth data. Returns 1–10 rating + breakdown. Searches astrolearn + bubble DB. |
| `/api/wealth-lottery-rank` | ✅ Working (2026-07-31) | Ranks multiple persons by lottery-winner profile score. Input: { names: [] } or { persons: [] }. Returns sorted array with rank, rating, keySignals. |
| `/api/generate-report` | ✅ Working (2026-07-27) | Collects all astrological datasets + calls Claude to generate a self-contained HTML report. reportIndex 1–8. ~2–4 min per call. Returns { html, filename } |
| `/api/circumambulations` | ✅ Working (2026-09-11) | Hellenistic time lord: two-clock model (primary bound lord + participating ray contacts). Oblique ascension per degree (Ptolemy key). Validated vs Astro-Seek. releaser: ascendant\|sun\|moon\|fortune. Now also returns `periodQuality` (Abu Ma'shar benefic/malefic matrix + crisis flag) and per-participant `activatesNatalAspect` |
| `/api/planetary-condition` | ✅ Working (2026-07-23, updated 2026-09-09) | Full DG T9–T15 ordered assessment per planet. sect, triplicity, bounds, solar phase+phasis, lunar phenomena, maltreatment/bonification, grade A+→F, plus planet.md category/verdict/dorotheusTicks/canItSee/guestHost layer |
| `/api/ephemeris-expert` | ✅ Working (2026-05-04) | LLM tool: query_type required. 7 query types. No natal data needed. |
| `/api/blueprint` | ✅ Working | firstName, lastName required |
| `/api/blueprint-alix` | ✅ Working | firstName, lastName required |
| `/api/blueprintcomplete` | ✅ Working | firstName, lastName required |
| `/api/aspects` | ✅ Working | |
| `/api/profection` | ✅ Working | |
| `/api/solar-return` | ✅ Working (2026-09-04) | `loyQualification` + Surtees checklist / Valens verdict / `loyAspectsToNatal` |
| `/api/solar-return-timeline` | ✅ Working (2026-09-04) | Yearly SR + profection + pivotal + embeds `loyQualification` |
| `/api/rs-angular-peak-year` | ✅ Working (2026-05-07) | Finds SR year(s) with most planets in angular houses (1/4/7/10) + returns SR Moon element |
| `/api/zodiacal-releasing` | ✅ Working | |
| `/api/transits-exact` | ✅ Working | |
| `/api/transits-exact-short` | ✅ Working | |
| `/api/transits-date` | ✅ Working | |
| `/api/transit-cycles` | ✅ Working | **targetDate required** |
| `/api/secondary-progressions` | ✅ Working (2026-08-08) | KS priority tiers; response has `ks_priority` object |
| `/api/solar-arcs` | ✅ Working | Solar arc directions; passed 2026-02-09 comprehensive test |
| `/api/triplicity` | ✅ Working (2026-09-07) | Fixed: ascensional time now computed exactly (oblique ascension), replacing a mismapped static table |
| `/api/ascensional-times` | ✅ Working (2026-09-07) | Same fix as `/api/triplicity`; adds 3rd part + prosperity analysis |
| `/api/moon-bad-days` | ✅ Working | |
| `/api/career-days` | ✅ Working | |
| `/api/love-days` | ✅ Working | |
| `/api/lucky-days` | ✅ Working | |
| `/api/slow-planet-transits` | ✅ Working | |
| `/api/hard-aspect-finder` | ✅ Working | **planetName required** |
| `/api/arabic-parts` | ✅ Working | |
| `/api/arabic-parts/transits` | ✅ Working | |
| `/api/agenda/transits` | ✅ Working | |
| `/api/transit-sign-houses` | ✅ Working | POST with birth data (or :username variant) |
| `/api/yearly-forecast` | ✅ Working | |
| `/api/yearly-ingresses` | ✅ Working | POST with year in body |
| `/api/comprehensive-yearly-timing` | ✅ Working | |
| `/api/human-design-chart-interactive` | ✅ Working | Returns HTML |
| `/api/predictions/2026` | ✅ Working | |
| `/api/predictions/monthly` | ✅ Working | |
| `/api/predictions/activity` | ✅ Working | |
| `GET /api/current-transits` | ✅ Working | Query: date (optional) |
| `GET /api/daily-transits` | ✅ Working | Query: date (optional) |
| `GET /api/mundane-daily` | ✅ Working | Query: daily, date, timezone |
| `/api/synastry-chart` | ✅ Working | Returns HTML |
| `/api/match` | ✅ Working (2026-09-17) | `compatibility`/`balance` = exact idx 9018 formula; `attraction` = full KS/CB sparkHits engine (natal profiles + flags); `bond`/`generalUnderstanding`/`mutualUnderstanding` = temperament compare + Mercury hits; `boss`/`exclusive`/`gift` = legacy ports; `hugs` = heuristic |
| `/api/birth-chart-interactive` | ✅ Working | Returns JSON with chart data |
| `/api/birth-chart-honey` | ✅ Working | Returns HTML |
| `/api/horary` | ✅ Working | |
| `/api/electional-dates` | ✅ Working | |
| `/api/personalized-electional-dates` | ✅ Working | Personalized electional dates filtered by natal ruler and house conditions |
| `/api/yearly-timing` | ✅ Working | Annual timing report combining profection + SR + transits |
| `/api/monthly-timing` | ✅ Working | Monthly timing breakdown (same calculator as yearly-ingresses) |
| `/api/mundane-timing` | ✅ Working | Mundane astrology timing: eclipses, ingresses, outer-planet events. Location required for PHP wrapper |
| `/api/numerology-timing` | ✅ Updated (2026-09-07) | objectif, racines, trimestres, clés, périodes 0-81, plan de vie, advice matrix; `influence` + `dateDebut`/`dateFin` (anniversary-to-anniversary), `anneePersonnelleNext`; fixed `racines` to be birth month/day/year roots (was wrongly aliased to Castells chemin de vie/expression/tronc) |
| `/api/timing` | ✅ Working | |
| `/api/timingcomplete` | ✅ Working | |
| `/api/bazi/calculate` | ✅ Working | Four Pillars |
| `/api/bazi/annual-pillars` | ✅ Working | |
| `/api/fengshui/flying-stars/annual` | ✅ Working | |
| `/api/fengshui/flying-stars/monthly` | ✅ Working | |
| `/api/fengshui/afflictions` | ✅ Working | |
| `/api/fengshui/personal-directions` | ✅ Working | |
| `/api/qimendunjia/calculate` | ✅ Working | QMDJ chart |
| `/api/qimendunjia/action` | ✅ Working | Action timing |
| `/api/draw-your-chart` | ✅ Working | Western natal chart worksheet data — LST, MC/IC/ASC/DSC, 12 Placidus houses, 10 planets + wshHouse field, WSH house lords (maître de), aspects (Demetra George orbs) |
| `/api/jyotish/chart` | ✅ Working (updated 2026-09-07) | Vedic sidereal (Lahiri True Chitrapaksha) chart — 9 grahas, lagna, chandra lagna, whole-sign houses, panchanga (incl. tithi lord/devata + nakshatra deity), paksha bala, housesFromChandra + special lagnas, arudha padas, char karakas, combustion, speed % + **reading primitives** (dignity, houseLords, grahaDrishti, mangalDosha+cancellations, purusharthas, planetaryYogas, functionalNature, naisargikaKarakas, digbala, strengthHints, topicPacks, remedyHooks — calculation only, no delineation). Accepts optional `gender` for spouse-karaka selection. Still missing: full Shadbala, Pranapada Lagna |
| `/api/jyotish/dasha` | ✅ Working (2026-09-06) | Vimshottari Mahadasha/Antardasha/Pratyantardasha, full 120-year cycle. Phase 2 of knowledge/jotish.md — advanced feature, no interpretation layer yet (see `advisory` field). Mahadasha boundaries match a deva.guru reference chart within ±1 day |
| `/api/jyotish/reference` | ✅ Working (2026-09-07) | Static (not chart-specific): 27-nakshatra table (lord, degree span, deity, symbol) + 7-graha natural friend/enemy table (Naisargika Maitri). Completes the "Reference data" sub-deliverable of Phase 1 (knowledge/jotish.md §3) |
| `/api/jyotish/varga` | ✅ Working (2026-09-07) | Generic divisional-chart endpoint — `division` param, supports 2 (Hora)/3 (Drekkana)/7 (Saptamsa)/9 (Navamsa)/10 (Dasamsa)/60 (Shashtiamsha). Every division carries houseLords+dignity; D9/D7/D10 return marriagePack/childrenPack/careerPack. Phase 2 of knowledge/jotish.md §4 |
| `/api/jyotish/ashtakavarga` | ✅ Working (2026-09-07) | Sarva (337-bindu total, checksum-verified) + Sapta (7 per-graha 8×12 tables). Classical BPHS Bhinnashtakavarga. Phase 2 of knowledge/jotish.md §4 |
| `/api/jyotish/panchanga` | ✅ Working (2026-09-07) | Date+location panchanga, no birth chart — defaults to that date's sunrise, or pass an explicit `time`. Completes Phase 2 of knowledge/jotish.md §4 |
| `/api/hd/chart` | ✅ Working | Full Human Design bodygraph — type, authority, profile, definition, centers, channels, gates, activations (2026-03-08) |
| `/api/hd/type` | ✅ Working | HD type + strategy only |
| `/api/hd/authority` | ✅ Working | HD inner authority + description |
| `/api/hd/centers` | ✅ Working | HD defined/undefined centers list |
| `/api/hd/profile` | ✅ Working | HD incarnation profile + cross |
| `/api/toctoc` | ✅ Working | Life events scanner — toc/toc toc/toc toc toc scoring (2026-03-11) |
| `/api/toctoc-app` | ✅ Working | Same scan as `/api/toctoc`, plus enriched “sausage” objects for mobile UI: WSH houses, Roman house colors, per-hit transit cycles, merged ZR, eclipse axis + ruler houses (2026-03-21) |
| `/api/toctoc-app-short` | ✅ Working | Lightweight boudin-only version of toctoc-app (~475 KB vs ~11 MB). Returns minimal fields for timeline rendering; detail via `/api/toctoc-boudin-detail` (2026-03-25) |
| `/api/toctoc-timeline` | ✅ Working | Lifetime intensity timeline — year/month cumulative score from toctoc events (2026-03-11) |
| `/api/toctoc-year` | ✅ Working | Compact 3-year window timeline (~3 s, currentYear±1) — dashboard/push-notification version (2026-03-12) |
| `/api/toctoc-sausage-html` | ✅ Working | Full sausage data + pre-rendered interactive HTML timeline; `?format=html` returns raw HTML (2026-03-22) |
| `/api/toctoc-boudin-detail` | ✅ Working | Single boudin detail + LLM-ready delineation payload with convergence detection (2026-03-22) |
| `/api/event-timing-analysis` | ✅ Working | Multi-layer report per life event: profection, SR, transit cycles, ZR ×3 lots, eclipses (2026-03-12) |
| `/api/eclipse-life-pattern` | ✅ Working (2026-07-20) | Birth near eclipse (±7d) + per-event eclipse day-diff + KS Sun/Moon profection filter (Brennan/NDB + Surtees) |
| `/api/timelines` | ✅ Working | Unified timelines API: ZR / profection / SR / transit / combined strips by timelineIds or objectives (2026-03-12) |
| `/api/daily-briefing-context` | ✅ Working | Priority-ranked personalized signal payload for Unfold AI daily briefing: eclipse axis hits, outer planet transits, Moon filter (2026-03-25) |
| `/api/connection-brief` | ✅ Working | Two-person compatibility brief for TocToc connection flow: per-person focus/challenges + shared theme + relationship-aware action, month-bucketed (2026-04-20). Events now carry houses/dates/ZR fields/eclipse axis + cycle count, plus a computed `comparaison` object (2026-09-02) |
| `/api/profile-insights` | ✅ Working | Compare 2+ profiles (natal/aspects/house rulers) or match `person_event` transits across added profiles (2026-06-03) |
| `/api/planetary-periods` | ✅ Working (2026-06-29) | Hellenistic/Medieval Minor, Mean & Greater planetary years. Returns `currentlyActive`, `nextMilestone`, `recentCluster`, `allMilestones`. When `birthTime`+`latitude`+`longitude`+`timezone` are provided, also returns `domicileLordActivations` with 8 Demetra George activation methods per natal planet. |
| `/api/planetary-activation` | ✅ Working (2026-06-29) | Full Demetra George "Timing by Planetary Periods and Ascensional Times" workbook. Returns Part One (sign table with asc. times and A+B sums) and Part Two (all 10 A/B/C/D activation points per planet with 1/3, 1/2, 2/3 fractions) plus a chronological timeline of all activations. |
| `/api/person-search` | ✅ Working (2026-07-16) | Public person fuzzy-name search. Bearer token required. Only queries persons WHERE id_source IS NOT NULL. Returns confident match or up to 5 suggestions + events. |
| `/api/person-search-bulk` | ✅ Working (2026-07-16) | Bulk version: accepts JSON names array or CSV upload (max 100 rows). Bearer token required. |
| `/person-search-template.php` | ✅ Working (2026-07-16) | GET: downloads CSV template. No auth required. |
| `/api/person-categories` | ✅ Working (2026-07-27) | Browse public-person life events by curated category taxonomy. Event-type tags return person+date; trait-type tags return person+description only. 21 curated tags across Health/WORK/RELATIONSHIP. |
| `/api/person-event-enrich` | ✅ Working (2026-07-18) | Fetch Wikipedia + Claude AI to insert dated life events into person_event. Requires ANTHROPIC_API_KEY. |
| `/api/timelord-synthesis` | ✅ Working (2026-07-24) | DG T8 cross-system convergence: runs all 6 timing systems in parallel, counts planet appearances, returns ranked planets + signifying planet. valensPeak flag when Spirit ZR enters eminence window. |
| `/api/person-search-export` | ✅ Working (2026-07-26) | Same as person-search-bulk but returns CSV file download. Bearer token required. |
| `/api/toctoc-highlights` | ✅ Working (2026-07-26) | Lightweight ~50 KB yearly-only version of toctoc-timeline. Adds `biggestYear` field. Use for onboarding/home card. |
| `/api/ask` | ✅ Working (2026-07-26) | Natural-language question → calculator routing. Maps question intent to the appropriate endpoint. |
| `/api/bodygraph-interactive` | ✅ Working (2026-07-26) | Returns HTML + humanDesign JSON for HD bodygraph (legacy generator, pre-hd_calculator.js). |
| `/api/gene-keys` | ✅ Working (2026-07-26) | Gene Keys Hologenetic Profile (Sun, Earth, Moon, Venus, Mars gates). Birth data or username. |
| `/api/gene-keys-interactive` | ✅ Working (2026-07-26) | Gene Keys with full hologram visualization data. |
| `/api/yearly-prediction` | ✅ Working | Complete yearly prediction (SR + profection + transits). |
| `/api/birth-chart-transits` | ✅ Working | Natal chart with transit overlay (HTML). |
| `/api/chart-data` | ✅ Working | Raw natal chart data (planets, houses, aspects) as JSON without HTML. |
| `/api/mundane-monthly-agenda` | ✅ Working | Monthly mundane event agenda (same calc as mundane-timing). |
| `/api/monthly-horoscope` | ✅ Working | Monthly horoscope narrative for a sign or natal chart. |
| `/api/daily-brief` | ✅ Working | Daily briefing (shorter version of daily-briefing-context). |
| `/api/public-persons` | ✅ Working | Public person lookup (alternative to person-search). |
| `/api/planetary-aspect-archetypes` | ✅ Working | Archetypal themes for planetary aspects in the natal chart. |
| `/api/planetary-alignment-finder` | ✅ Working | Find dates when multiple planets align in a configuration. |
| `/api/bazi/animal-rankings` | ✅ Working | Chinese zodiac animal luck rankings for a given year. |
| `/api/bazi/animal-analysis` | ✅ Working | Detailed compatibility analysis for two BaZi animal signs. |
| `/api/bazi/element-keywords` | ✅ Working | Keywords/themes for the 5 elements and 10 heavenly stems in BaZi. |
| `/api/bazi/keywords/adapted` | ✅ Working | Adapted element keywords tuned to a specific Day Master. |
| `/api/bazi/keywords` | ✅ Working | Full keyword library for BaZi stems and branches. |
| `/api/fengshui/24-mountains` | ✅ Working | 24 Mountains (Shan) compass chart for a given year. |
| `/api/fengshui/24-mountains/activation-dates` | ✅ Working | Best activation dates for each of the 24 Mountains sectors. |
| `/api/fengshui/almanach/search` | ✅ Working | Chinese almanac (Tong Shu) search for auspicious/inauspicious activities. |
| `/api/fengshui/activation-dates/nobles` | ✅ Working | Noble (Tian Yi) star activation dates. |
| `/api/fengshui/activation-dates/prosperity` | ✅ Working | Wealth star activation dates. |
| `/api/fengshui/activation-dates/health` | ✅ Working | Health star activation dates. |
| `/api/fengshui/activation-dates/studies` | ✅ Working | Studies/academic star activation dates. |
| `/api/fengshui/activation-dates/problem-solving` | ✅ Working | Problem-solving star activation dates. |
| `/api/fengshui/eclipses` | ✅ Working | Eclipse impact on feng shui sectors. |
| `/api/fengshui/period-9` | ✅ Working | Period 9 (2024–2043) sector analysis and flying star chart. |
| `/api/fengshui/period-9/activation-dates` | ✅ Working | Best activation dates for Period 9 auspicious sectors. |
| `/api/qimendunjia/destiny-palace` | ✅ Working | QMDJ Destiny Palace for a person's birth data. |
| `/api/qimendunjia/palace-hexagrams` | ✅ Working | I Ching hexagrams mapped to QMDJ palaces. |
| `/api/yijing/year-hexagram` | ✅ Working | Yi Jing (I Ching) hexagram for annual energy guidance. `year` parameter. |
| `/api/yijing/personal-hexagram` | ✅ Working | Personal Yi Jing hexagram derived from birth data. |
| `/api/tibetan-astrology/calculate` | ✅ Working | Tibetan astrology chart (parkha, mewa, lotsawa calculations). Birth data or username. |
| `/api/celestial-movements` | ✅ Working | Eclipses, retrogrades, ingresses for a date range. `startDate`, `endDate`, or `year`. |
| `/api/mantra/unlimited-opportunities` | ✅ Working | Personalized mantra recommendations from birth data or username. |
| `/api/manifestation/dates` | ✅ Working | Optimal manifestation dates. `username` or birth data + `startDate`/`endDate`. |

### Previously reported issues (may be resolved)

These were noted in earlier runs (pre-2026-02-09). The **2026-02-09 comprehensive test had 0 failures**; endpoints below that are in `test_all_endpoints_comprehensive.js` (e.g. recurrence-transits, solar-arcs, birth-chart-transits) passed in that run.

| Endpoint | Earlier issue | In comprehensive test? |
|----------|---------------|-------------------------|
| `/api/yearly-prediction` | Calculator failed | No (test has `yearly-forecast` instead) |
| `/api/recurrence-transits/*` | Calculator failed | Yes — **passed** 2026-02-09 |
| `/api/solar-arcs` | Returns null values | Yes — **passed** 2026-02-09 |
| `/api/birth-chart-transits` | Bug with ascendant | Yes — **passed** 2026-02-09 |
| `GET /api/mundane-timing/:monthName` | Bug with null | No (test uses POST `/api/mundane-timing`) |
| `/:username` variants | Database lookup issues | Partially (some endpoints have :username variants) |

### ✅ Chinese Astrology (Now Available!)

| Endpoint | Status | Notes |
|----------|--------|-------|
| `/api/bazi/calculate` | ✅ Working | Four Pillars chart |
| `/api/bazi/annual-pillars` | ✅ Working | Annual pillars for year range |
| `/api/bazi/profile` | ✅ Working | Stored BaZi profile |
| `/api/fengshui/flying-stars/annual` | ✅ Working | Annual flying stars |
| `/api/fengshui/flying-stars/monthly` | ✅ Working | Monthly flying stars |
| `/api/fengshui/afflictions` | ✅ Working | Annual afflictions |
| `/api/fengshui/personal-directions` | ✅ Working | Personal Gua directions |
| `/api/fengshui/analyze` | ✅ Working | Location analysis |
| `/api/qimendunjia/calculate` | ✅ Working | QMDJ chart |
| `/api/qimendunjia/action` | ✅ Working | Best action timing |

**Note:** Both slash and dash formats work (e.g., `/api/bazi/calculate` and `/api/bazi-calculate`)

### 🚫 Not Available on Production

| Endpoint | Reason |
|----------|--------|
| `/api/query/*` | Not routed in PHP |

### ⚠️ Common 404 Errors

| Requested Endpoint | Correct Endpoint | Notes |
|-------------------|------------------|-------|
| `/api/chart ruler` | `/api/blueprintcomplete` | Chart ruler is included in blueprint data, not a separate endpoint |
| `/api/chart-ruler` | `/api/blueprintcomplete` | Chart ruler is included in blueprint data, not a separate endpoint |
| `/api/transits` | `/api/query/transits` or `/api/transits-exact` | Use specific transit endpoint or query endpoint |

---

## Table of Contents

1. [Blueprint Endpoints](#blueprint-endpoints)
2. [Natal Chart & Aspects](#natal-chart--aspects)
3. [Profections](#profections)
4. [Solar Return](#solar-return)
5. [Zodiacal Releasing](#zodiacal-releasing)
6. [Transits](#transits)
7. [Recurrence Transits](#recurrence-transits)
8. [Progressions & Solar Arcs](#progressions--solar-arcs)
9. [Arabic Parts](#arabic-parts)
10. [Special Days](#special-days)
11. [Electional Astrology](#electional-astrology)
12. [Timing](#timing)
13. [Life Periods](#life-periods)
14. [Yearly Forecasts](#yearly-forecasts)
15. [Predictions](#predictions)
16. [Mundane Astrology](#mundane-astrology)
17. [Numerology](#numerology)
18. [Human Design](#human-design)
19. [BaZi (Four Pillars)](#bazi-four-pillars)
20. [Feng Shui](#feng-shui)
21. [Qi Men Dun Jia](#qi-men-dun-jia)
22. [Synastry & Relationships](#synastry--relationships)
23. [Chart Visualization](#chart-visualization)
24. [Horary](#horary)
25. [Query Endpoints](#query-endpoints)

---

## Common Parameter Types

### Birth Data Object (Standard)
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "birthDate": "YYYY-MM-DD (required)",
  "birthTime": "HH:MM (required)",
  "latitude": "number (required if no city)",
  "longitude": "number (required if no city)",
  "city": "string (required if no lat/lon)",
  "country": "string (required if no lat/lon)",
  "timezone": "string IANA format (required)"
}
```

### Location Object
```json
{
  "latitude": "number",
  "longitude": "number",
  "name": "string (optional)",
  "timezone": "string IANA format"
}
```

---

## Blueprint Endpoints

### POST /api/blueprint

**Description:** Basic astrological blueprint

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firstName` | string | Yes | First name |
| `lastName` | string | Yes | Last name |
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM (24h) |
| `city` | string | Yes* | Birth city (*or lat/lon) |
| `country` | string | Yes* | Birth country (*or lat/lon) |
| `latitude` | number | Yes* | Latitude (*or city/country) |
| `longitude` | number | Yes* | Longitude (*or city/country) |
| `timezone` | string | No | IANA timezone (auto-detected) |

**Example Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "birthDate": "1985-03-15",
  "birthTime": "14:30",
  "city": "New York",
  "country": "USA"
}
```

---

### POST /api/blueprint-alix

**Description:** Extended blueprint with Day/Night, Part of Fortune, Gene Keys

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firstName` | string | Yes | First name |
| `lastName` | string | Yes | Last name |
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM (24h) |
| `city` | string | Yes* | Birth city |
| `country` | string | Yes* | Birth country |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `timezone` | string | No | IANA timezone |

---

### POST /api/blueprintcomplete

**Description:** Most comprehensive blueprint with ALL data (astrology, HD, numerology)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firstName` | string | Yes | First name (required for numerology calculations) |
| `lastName` | string | Yes | Last name (required for numerology calculations) |
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM (24h) |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `city` | string | Yes* | Birth city |
| `country` | string | Yes* | Birth country |
| `timezone` | string | Yes | IANA timezone |

**Note:** `firstName` and `lastName` are required because numerology calculations (Expression, Soul Urge, Personality, Hidden Passion, Karmic Lessons) depend on the full name.

**Response includes:**
- `astrology`: Sun, Moon, planets, houses, aspects
- `humanDesign`: Type, profile, strategy, authority, centers, gates, channels
- `numerology`: Life path, expression, personal year/month/day, 100-year cycles
- `geneKeys`: Gene keys for Sun, Earth, Moon

---

### POST /api/blueprint/:username
### POST /api/blueprint-alix/:username
### POST /api/blueprintcomplete/:username

**Description:** Calculate blueprint using database username

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:username` | URL param | Yes | Username in database |
| Any body param | - | No | Override database values |

---

## Natal Chart & Aspects

### POST /api/aspects

**Description:** Calculate all natal aspects and planetary conditions

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `city` | string | Yes* | Birth city |
| `country` | string | Yes* | Birth country |
| `timezone` | string | No | IANA timezone |
| `aspectMode` | string | No | `'degree'`, `'sign'`, or `'both'` (default: `'both'`) |

**Example:**
```json
{
  "birthDate": "1980-05-12",
  "birthTime": "10:30",
  "latitude": 51.5074,
  "longitude": -0.1278,
  "aspectMode": "both"
}
```

---

## Profections

### POST /api/profection

**Description:** Annual / monthly / daily profections with multi-point Valens method and handing-over analysis (Demetra George Techniques 5 & 6)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |
| `targetDate` | string | No | Target date (default: today) |

**Example:**
```json
{
  "birthDate": "1985-06-20",
  "birthTime": "12:15",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "timezone": "Europe/Paris",
  "targetDate": "2026-06-20"
}
```

**Response fields:**

| Field | Description |
|-------|-------------|
| `annualProfection` | House, sign, LOY (Lord of the Year), ruler location, planets in house |
| `monthlyProfection` | House, sign, ruler — one sign per month advancing from annual |
| `dailyProfection` | House, sign, ruler — 2.5 days per sign advancing from monthly (T6) |
| `profectionFromSun` | House + sign reached when profecting from the natal Sun position (T5) |
| `profectionFromMoon` | House + sign reached when profecting from the natal Moon position (T5) |
| `handingOverAnalysis` | Every planet's profected-to sign and the handing-over verdict (e.g. Sun→Saturn = "grievous") |
| `profectionYearBoundaries` | Start/end dates of current profection year |
| `natalChartComplete` | Full planet positions for condition assessment |

**`dailyProfection` sub-fields:**
```json
"dailyProfection": {
  "house": 7,
  "houseName": "7th House (Partnerships, Relationships)",
  "sign": "Libra",
  "ruler": "Venus",
  "daysPerSign": 2.5,
  "daysSinceMonthlyStart": 12.0,
  "description": "Daily focus: Focus on partnerships, relationships, collaboration"
}
```

**`handingOverAnalysis` sub-fields:**
```json
"handingOverAnalysis": [
  {
    "planet": "Sun",
    "profectedSign": "Capricorn",
    "handingTo": "Saturn",
    "verdict": "grievous — possible difficulties with father/authority; traditional: danger of death",
    "priority": "primary"
  },
  {
    "planet": "Mars",
    "profectedSign": "Libra",
    "handingTo": "Venus",
    "verdict": "Mars hands over to Venus",
    "priority": "secondary"
  }
]
```
`priority: "primary"` = Sun, Moon (highest weight per Valens); `"secondary"` = all other planets.

### How to interpret profections (Demetra George T5 & T6)

#### Annual profection — the year's theme

The annual profection identifies **which natal house topic** is the focus of the year, and which planet is **Lord of the Year (LOY)**.

**Step 1 — Annual profected house** = `annualProfection.house`
Age 0 = H1, age 1 = H2, … age 11 = H12, age 12 = H1 again. The house topic = the year's dominant theme.

**Step 2 — Lord of the Year (LOY)** = `annualProfection.ruler`
The domicile lord of the profected sign. The LOY:
- Activates its natal significations throughout the year
- Its natal house = additional topics drawn into focus
- Its natal houses ruled (domicile) = also activated

**Step 3 — Can the LOY see the profected house?** (whole-sign aspect from LOY's natal sign to the profected sign)
- If yes → LOY can attend to the year's theme
- If no (in aversion) → LOY is like a manager on sabbatical — disconnected from the very house it's supposed to govern; themes of that house may be felt but not consciously navigated

**Step 4 — Is any planet present in the profected sign?**
`annualProfection.planetsInHouse` — any planet there is co-activated and especially important that year.

**Step 5 — Check the LOY in the solar return** (cross-reference `/api/solar-return`)
Is the LOY in better or worse condition in the SR than natally? → Can it deliver its natal promise this year?

#### Monthly profection — narrowing the focus

`monthlyProfection` advances one sign per month from the annual profected sign. **Key trigger**: when the monthly profection reaches the sign where the LOY is located natally, that year's main theme tends to crystallize into a concrete event.

#### Daily profection — precise event timing (T6)

`dailyProfection` advances one sign per 2.5 days from the monthly sign. When the daily profection reaches the LOY's natal sign → very precise timing of an event is possible. Use alongside fast-moving transits (Mercury, Venus, Mars) for day-level precision.

#### Multi-point profections (Valens method)

Valens recommends profecting from **three points simultaneously** — all moving the same number of signs forward as the Ascendant profection:

| Field | Starting point | Signification |
|-------|---------------|---------------|
| `annualProfection` | Natal Ascendant | Life in general, overall experience |
| `profectionFromSun` | Natal Sun | Reputation, privilege, relationship with father |
| `profectionFromMoon` | Natal Moon | Body, health, conception/motherhood, emotional life |

When all three arrive at the same sign as the LOY's natal position → maximum convergence for that year's theme.

#### Handing-over analysis

`handingOverAnalysis` shows every planet's "handing over" to its new domicile lord. Read the `priority: "primary"` entries first (Sun, Moon, Ascendant handing overs rank highest). Key combinations per Valens:

| Handing over | Meaning |
|-------------|---------|
| Sun → Saturn | Grievous year; possible death of father or authority figure |
| Mars → Saturn | Among the worst combinations — danger, loss, violence |
| Jupiter → Mars | Troubles, enemies, betrayals despite good intentions |
| Venus → Mars | Conflicts with women, separations, betrayals in love |
| Moon → Saturn | Grief, illness, cold; difficult for the body |
| Jupiter → Venus / Venus → Jupiter | Fortunate, pleasurable, relational success |

Every 12 years the same house is profected again — same underlying theme but different quality (determined by SR and transits at that time).

---

## Solar Return

### POST /api/solar-return

**Description:** Calculate Solar Return chart for specific year

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Birth latitude |
| `longitude` | number | Yes | Birth longitude |
| `timezone` | string | No | IANA timezone (default: UTC) |
| `returnYear` | number | No | Year for SR (default: current year) |
| `location` | object | No | Relocation for SR |

**Relocation Object:**
```json
{
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "name": "New York",
    "timezone": "America/New_York"
  }
}
```

**Example:**
```json
{
  "birthDate": "1992-01-25",
  "birthTime": "11:00",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "timezone": "Europe/Paris",
  "returnYear": 2026
}
```

**`loyQualification` (Lord of the Year / Demetra + Kelly Surtees diagnostic):**

Returned on every successful response. Profection age = `returnYear − birthYear`. LOY = domicile lord of the profected sign. LOY house/sign in the SR chart: use `planets[loy].house` / `planets[loy].sign`.

| Field | Type | Notes |
|-------|------|--------|
| `loy` | string | Time lord planet name |
| `profectionHouse` / `profectionSign` | number / string | Annual profection |
| `timeLordConditionNatal` | `strong` \| `moderate` \| `weak` | Natal dignity + angularity |
| `timeLordInSR` | `better` \| `same` \| `worse` | vs natal dignity rank |
| `abuMasharCase` | string | e.g. `good_natal_good_sr` |
| `timeLordSeesNatalTimeLord` / `ksBlindSpot` | boolean | Whole-sign see / don’t-see |
| `dgVisibility` + `dgVisibilityScore` | object / 0–3 | Demetra 3-question witnessing |
| `loyRetrogradeInSR` | boolean | |
| `timeLordTransitOnBirthday` | `{ sign, dignity }` | dignity: `high` \| `neutral` \| `low` |
| `timeLordChecklist` | object | Surtees checklist twice: `natal` + `solarReturn` |
| `valensAspectReplication` | object | LOY vs Jupiter/Venus/Mars/Saturn natal↔SR |
| `loyAspectsToNatal` | array | SR LOY → each natal classical planet (WS) |
| `srAscConjunctions` | array | SR Asc ≤8° natal planets |

**`timeLordChecklist.natal` / `.solarReturn` keys:**
- `combust` (boolean) — within 8° of Sun (false for Sun)
- `underTheBeams` (boolean) — within 15° of Sun
- `retrograde` (boolean)
- `signDignity` — `domicile` \| `exaltation` \| `triplicity` \| `bound` \| `face` \| `peregrine` \| `detriment` \| `fall`
- `beneficWitnesses` / `maleficWitnesses` — planet name lists (whole-sign aspect to LOY)
- `oriental` / `occidental` — optional phase flags

**`valensAspectReplication`:** per planet `{ natalAspect, srAspect, natalQuality, srQuality, replicated }` plus `anyBeneficReplicated`, `anyMaleficReplicated`, and top-level `verdict`: `certain` (same quality repeats) \| `middling` (natal usable but SR disagrees/absent) \| `none` (no natal aspect). Qualities: `harmonious` (conj/sextile/trine) \| `inharmonious` (square/opposition) \| `null`.

**`loyAspectsToNatal[]`:** `{ natalPlanet, aspect, orb, quality }` — whole-sign Ptolemaic aspects only; `orb` is degrees from exact aspect angle.

### POST /api/solar-return/id/:id_person

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:id_person` | URL param | Yes | Database person ID |
| `returnYear` | number | No | Year for SR |
| `location` | object | No | Relocation |

---

## Solar Return Timeline

### POST /api/solar-return-timeline

**Description:** Returns a **year-by-year** solar return timeline, including:\n- SR Ascendant + the **natal house** where it falls (whole sign)\n- Annual profection (house/sign/time lord)\n- SR “busiest house” (house with the most SR planets)\n- “Pivotal year” scoring (angular SR planets, SR angles on natal points, SR↔natal conjunctions)\n- SR Moon element (`fire|earth|air|water`) for color-coding\n+
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:mm |
| `latitude` | number | Yes | Birth latitude |
| `longitude` | number | Yes | Birth longitude |
| `timezone` | string | No | IANA timezone (default: UTC / fallback) |
| `startYear` | number | No | First year in timeline (default: birth year) |
| `endYear` | number | No | Last year in timeline (default: current year) |

**Example:**
```json
{
  "birthDate": "1980-10-24",
  "birthTime": "01:41",
  "latitude": 50.8503,
  "longitude": 4.3517,
  "timezone": "Europe/Brussels",
  "startYear": 1980,
  "endYear": 2026
}
```

**Notes:**
- This endpoint returns JSON only. A matching HTML page can be rendered via the Anatella PHP layer (see `php/solar-return-timeline.php` in this repo).
- Each row includes `loyQualification` (same shape as `/api/solar-return`) so the year browser does not need a second fetch for Demetra/Surtees LOY diagnostics.

---

## Zodiacal Releasing

### POST /api/zodiacal-releasing

**Description:** Zodiacal Releasing periods (L1–L4) from various lots — implements Demetra George Technique 4 (Vettius Valens method) with peak period detection, activity levels, Loosing of the Bond, and handing-over analysis.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `city` | string | Yes* | Birth city (alternative to lat/lon) |
| `country` | string | Yes* | Birth country |
| `timezone` | string | Yes | IANA timezone |
| `lotType` | string | No | Lot type (default: `'fortune'`) |
| `maxLevels` | number | No | 1–4 (default: 3) |
| `targetDate` | string | No | Target date for analysis |

**Lot Types:**
- `fortune` — Body, material circumstances, external events, career as it unfolds
- `spirit` — Mind, intentions, actions taken by the native, career as self-directed
- `eros` — Desire, love, relationships
- `father` / `mother` / `children` — Respective family significations
- `death` / `victory` / `courage` / `necessity` — Additional lots

**Example:**
```json
{
  "birthDate": "1975-03-10",
  "birthTime": "08:45",
  "city": "Brussels",
  "country": "Belgium",
  "timezone": "Europe/Brussels",
  "lotType": "fortune",
  "maxLevels": 4
}
```

**Key response fields per period:**

| Field | Description |
|-------|-------------|
| `sign` | The releasing sign for this period |
| `startDate` / `endDate` | Calendar span of the period |
| `duration` | Duration in years (float) |
| `isPeakPeriod` | `true` when sign is angular from the **Lot** (1st/4th/7th/10th from Fortune or Spirit) |
| `angularTriad` | Which angular sign (1st/4th/7th/10th from Lot) this is, if applicable |
| `activityLevel` | `angular` / `succedent` / `cadent` — intensity of the period based on sign's position from the **Lot** |
| `housePlacement` | Whole-sign house from the **Ascendant** — gives the **topic** of the period |
| `houseFromLot` | Position from the Lot — gives the **activity intensity** |
| `loosingOfTheBond` | `true` when the period is releasing through its own sign from the Lot |
| `signsFromLot` | Integer (1–12) — this sign's position counted from the Lot |

**Note on the two-coordinate system:**
ZR operates on two axes simultaneously:
1. **Activity axis** — `houseFromLot` / `activityLevel` (angular/succedent/cadent counted from the Lot) → how energetic and eventful the period is
2. **Topic axis** — `housePlacement` (house from ASC) → what area of life the period concerns

These are independent. A period can be **angular from Lot** (highly eventful) while being in **H12 from ASC** (relating to isolation, hidden matters, foreign places).

**`loosingOfTheBond` explained:**
When a sub-period (L2/L3/L4) is releasing from the *same sign* as the L1 lot's natal position, this is "Loosing of the Bond" — the sub-level briefly recovers the same energy as the main L1 period. These are often the most pivotal moments within a larger releasing period. Capricorn exception: Capricorn L1 uses 27-year period (not 30) per Valens.

**`isPeakPeriod` — critical reading rule:**
`isPeakPeriod: true` means the releasing sign is **angular from the Lot** (1st, 4th, 7th, or 10th sign counted from Fortune or Spirit). Per Demetra George, these are the "turning point" periods where major developments tend to crystallize. **This is NOT based on the Ascendant** — it is always computed from the Lot. The 4 angular positions from Fortune (for body/career) and Spirit (for intentions/mind) are different, which is why releasing from both lots simultaneously allows triangulation.

### How to interpret Zodiacal Releasing (Demetra George T4)

#### Step 1 — Choose your lot

- **Fortune**: for events that *happen to* the native — health, career developments, relationship events, external circumstances
- **Spirit**: for events the native *initiates* — decisions made, intentions pursued, mental focus, purposeful action

Most practitioners read both simultaneously and look for convergence.

#### Step 2 — Identify the current L1 period

The L1 (Level 1) period sets the decade-scale **background theme**:
- Which sign is releasing? → What are that sign's natal significations? (Any planets there natally become activated)
- What house from ASC? (`housePlacement`) → The primary life topic for this entire L1 period
- Is it a peak period? (`isPeakPeriod`) → If angular from Lot, this is a high-activation decade
- Loosing of the Bond sub-periods within this L1 → The highest-intensity moments

#### Step 3 — Locate the current L2 period within it

L2 narrows to a month/year scale:
- `isPeakPeriod` at L2 = actively unfolding event, not just background theme
- `activityLevel: 'angular'` at L2 within an already peak L1 = **double activation** — this is typically when major events actually happen
- `activityLevel: 'cadent'` = quieter sub-period even during an active L1

#### Step 4 — L3/L4 for precise timing

L3 (days to weeks) and L4 (days) allow pin-point timing of an event. A peak period at L3 within a peak L2 within a peak L1 is the maximum convergence point.

#### Step 5 — Cross-check the handing-over (L1 → next L1)

At an L1 transition, identify whether the new sign is:
- **More or less active** than the previous L1 (angular vs cadent from Lot)
- **In a different topic house** from ASC
- **What planets rule** the new sign — are they well-placed natally?

The quality of the handing-over planet's natal condition (see `/api/planetary-condition`) predicts how smoothly the transition delivers results.

#### Step 6 — Fortune vs. Spirit divergence

When Fortune and Spirit are releasing through **signs in aversion** (not in a whole-sign aspect to each other), there is a structural tension between what the native *experiences* and what they *intend* — classic for periods of working hard without the results materializing, or events happening that weren't sought.

When Fortune and Spirit are **in the same sign** or in **trine/sextile** — the two axes align and outcomes tend to match intentions.

#### Period quality reference

| Combination | Interpretation |
|------------|----------------|
| L1 peak + L2 peak + Loosing of Bond | Maximum activation — major life event likely |
| L1 peak + L2 cadent | Background energy present but nothing crystallizing yet |
| L1 cadent + L2 angular | Brief activation within a quieter decade — fleeting opportunities |
| L1 cadent + L2 cadent | Low-activation period, internal processing, preparation |
| Fortune/Spirit aversion | Effort and results out of sync |
| Fortune/Spirit trine | Flow between intention and event |
| Both lots at Loosing of Bond | Extremely rare — high-variance pivotal moment |

### POST /api/zodiacal-releasing-interpretation

**Description:** AI interpretation of ZR periods for specific life events

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `firstName` | string | Yes | First name |
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `eventDate` | string | Yes | Event date YYYY-MM-DD |
| `eventDescription` | string | Yes | What happened |
| `lastName` | string | No | Last name |
| `city` | string | Yes* | Birth city |
| `country` | string | Yes* | Birth country |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `timezone` | string | No | IANA timezone |

---

## Transits

### POST /api/transits-exact

**Description:** Find exact dates of partile aspects (long-term, ~1 year)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |

### POST /api/transits-exact-short

**Description:** Exact aspect dates for short period (~30 days)

Same parameters as `/api/transits-exact`

### POST /api/transits-date

**Description:** All transits on a specific date

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |
| `targetDate` | string | No | Date to analyze (default: today) |

### POST /api/transit-cycles

**Description:** Complete transit cycle analysis (D-R-D patterns)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |

### POST /api/slow-planet-transits

**Description:** Transits from Jupiter, Saturn, Uranus, Neptune, Pluto

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |

### POST /api/transit-sign-houses/:username

**Description:** Which house each transiting planet is in

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:username` | URL param | Yes | Username |

### POST /api/agenda/transits

**Description:** Agenda feed of transits

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |
| `startDate` | string | No | Start date for agenda |
| `endDate` | string | No | End date for agenda |

### GET /api/current-transits

**Description:** Current planetary positions (no birth data needed). Parameters are passed as **query string**.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date (default: now) |

### GET /api/daily-transits

**Description:** Daily transit positions and aspects. Parameters are passed as **query string**.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date (default: today) |

### POST /api/hard-aspect-finder

**Description:** Find next/previous hard aspects

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |
| `planetName` | string | No | Specific planet to track |
| `direction` | string | No | `'next'` or `'previous'` |

---

## Recurrence Transits

### POST /api/recurrence-transits/next

**Description:** CB/Nick recurrence transits — natal planet pairs whose aspect repeats in the sky (e.g. natal Venus–Jupiter conjunction → sky Venus–Jupiter conjunction). No VIP filtering. Conjunctions returned first. Includes sign copresence pairs. Loudness modifiers: `same-sign`, `station`, `profection-year`.

#### Required Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Birth latitude |
| `longitude` | number | Yes | Birth longitude |
| `timezone` | string | Yes | IANA timezone |

#### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.startDate` | string | today | Start of scan window (YYYY-MM-DD) |
| `options.endDate` | string | +2 years | End of scan window |
| `options.aspectPatternOrb` | number | `5.0` | Sky orb tolerance in degrees |
| `options.includeCopresence` | boolean | `true` | Include same-sign copresence pairs |

#### Response

```json
{
  "birthChart": { "birthDate": "...", "location": { ... } },
  "profectedSign": "Virgo",
  "natalAspects": [
    { "planet1": "Venus", "planet2": "Jupiter", "aspect": "conjunction", "priority": 1,
      "orb": 2.4, "isNatalCopresence": true, "planet1Position": { ... }, "planet2Position": { ... } }
  ],
  "recurrences": [
    {
      "date": "2026-09-14T12:00:00.000Z",
      "planet1": "Venus", "planet2": "Jupiter", "aspect": "conjunction",
      "priority": 1, "skyOrb": 0.812, "natalOrb": 2.4,
      "planet1Position": { "sign": "Virgo", "degree": 4, "minute": 12, "second": 0, "longitude": 154.2 },
      "planet2Position": { ... },
      "isSameSign": true, "stationBoost": false, "stationPlanet": null, "profectionBoost": true,
      "loudness": ["same-sign", "profection-year"],
      "natalAspect": { "planet1": "Venus", "planet2": "Jupiter", "aspect": "conjunction", "orb": 2.4, "isNatalCopresence": true },
      "description": "Natal Venus–Jupiter conjunction recurs in sky (same sign) [profection year]"
    }
  ],
  "summary": {
    "totalNatalAspects": 18, "totalRecurrences": 42,
    "conjunctionRecurrences": 11,
    "dateRange": { "start": "2026-08-09", "end": "2028-08-09" }
  }
}
```

**Aspect priorities:** conjunction = 1, opposition/square = 2, trine/sextile = 3, copresence = 4.

**Loudness modifiers per event:**
- `same-sign` — both sky planets in same sign at peak
- `station` — one planet has |speed| < 0.12°/day at peak; `stationPlanet` names which
- `profection-year` — one of the two natal planets is in the current profection year's activated sign

### POST /api/recurrence-transits/planet/:planetName

**Description:** Filters `/next` recurrences to only those involving the named planet (as planet1 or planet2). Same request/response shape as `/next`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:planetName` | URL param | Yes | Planet name (e.g., `Venus`, `Saturn`) |
| Birth data + options | — | Yes | Same as `/next` |

### POST /api/recurrence-transits/all

**Description:** CB/Nick pair recurrences for the full lifespan — historical (birth → now) and future (now → +5 years). Both ranges run in parallel.

Same birth data + options as `/next`.

```json
{
  "birthChart": { ... }, "profectedSign": "Virgo",
  "historical": [ /* recurrence events */ ],
  "future":     [ /* recurrence events */ ],
  "summary": { "historicalTotal": 88, "futureTotal": 34, "totalRecurrences": 122 }
}
```

### POST /api/recurrence-transits/calendar

**Description:** Same pair recurrences as `/next`, grouped by time period.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.groupBy` | string | `'month'` | `'month'`, `'week'`, or `'day'` |

Returns `{ birthChart, profectedSign, calendar: { "2026-09": [...events] }, summary }`.

### POST /api/recurrence-transits/aspect-patterns

**Description:** Groups all lifetime pair recurrences (historical + future) by aspect type. Returns `patterns: { conjunction: [...], ... }` and `mostCommonAspect`.

---

## Progressions & Solar Arcs

### POST /api/secondary-progressions

Calculate secondary progressions using the Kelly Surtees (KS) priority framework. The top-level `ks_priority` object is the main interpretation surface; raw planet positions are in `progressedPositions`.

#### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `birthDate` | string | Format: YYYY-MM-DD |
| `birthTime` | string | Format: HH:MM |
| `latitude` | number | Birth latitude |
| `longitude` | number | Birth longitude |
| `timezone` | string | IANA timezone (e.g. `Europe/Paris`) |

#### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targetDate` | string | today | Date to progress to (YYYY-MM-DD) |

#### Response

```json
{
  "birthData": { "birthDate": "1985-03-15", "birthTime": "14:30", "latitude": 48.8566, "longitude": 2.3522 },
  "targetDate": "2026-08-08",
  "age": 41.40,

  "ks_priority": {
    "tier1_progressed_moon": {
      "phase": {
        "ks_phase": "New Moon",
        "ks_meaning": "New 30-year cycle begins — seed time, emergence",
        "detail_phase": "Crescent",
        "angle": 64.75,
        "isNewMoon": false,
        "isFullMoon": false
      },
      "sign": "Cancer",
      "degree": 9.66,
      "house": 12,
      "upcoming_sign_changes": [
        { "type": "next", "fromSign": "Cancer", "toSign": "Leo", "approximateAge": 42.5, "approximateDate": "2027-02" }
      ],
      "aspects_to_natal": []
    },
    "tier2_progressed_sun": {
      "sign": "Taurus",
      "degree": 5.71,
      "sign_change": { "from": "Pisces", "to": "Taurus", "age": 15.1, "meaning": "Identity evolution from Pisces to Taurus" },
      "aspects_to_natal": []
    },
    "tier3_angles": {
      "ASC": { "longitude": 277.01, "sign": "Capricorn", "degree": 7.01, "aspects_to_natal": [] },
      "MC":  { "longitude": 219.50, "sign": "Scorpio",   "degree": 9.50, "aspects_to_natal": [] }
    },
    "tier4_inner_planets": {
      "Mercury": { "sign": "Aries", "degree": 9.79, "retrograde": false, "stations": [], "aspects_to_natal": [] },
      "Venus":   { "sign": "Aries", "degree": 6.02, "retrograde": false, "stations": [], "aspects_to_natal": [] },
      "Mars":    { "sign": "Taurus","degree": 29.73,"retrograde": false, "stations": [], "aspects_to_natal": [] }
    },
    "tier5_conditional_outer": {},
    "angle_rulers": {
      "ascRuler": "Sun", "mcRuler": "Mars",
      "asc_sign": "Leo", "mc_sign": "Aries"
    }
  },

  "progressedAngles": {
    "ASC": { "longitude": 277.01, "sign": "Capricorn", "degree": 7.01 },
    "MC":  { "longitude": 219.50, "sign": "Scorpio",   "degree": 9.50 }
  },

  "progressedToNatalAspects": [
    {
      "progressed": "Moon", "aspect": "square", "symbol": "□",
      "natal": "Sun", "orb": 0.82, "applying": true,
      "ks_tier": 1, "interpretation": "P.Moon □ N.Sun: emotions challenge core self"
    }
  ],

  "stations": [
    {
      "planet": "Mercury", "type": "Rx", "offset_years": -0.35, "at_age": 41.05,
      "direction": "stationed retrograde",
      "meaning": "P.Mercury stations Rx — internalization of Mercury themes"
    }
  ],

  "progressedMoonPhase": {
    "name": "Crescent", "ks_phase": "New Moon",
    "ks_meaning": "New 30-year cycle begins — seed time, emergence",
    "angle": 64.75, "isProgressedNewMoon": false, "isProgressedFullMoon": false,
    "interpretation": "New 30-year cycle begins — seed time, emergence"
  },

  "progressedPositions": {
    "Sun":  { "longitude": 35.71, "sign": "Taurus",  "degree": 5.71, "retrograde": false },
    "Moon": { "longitude": 99.66, "sign": "Cancer",  "degree": 9.66, "retrograde": false }
  },

  "planetsInOwnBounds": [],

  "interpretation": {
    "summary": "Progressed Moon in Cancer (House 12)...\nKS Moon Phase: New Moon (Crescent) — ...",
    "keyThemes": ["New Moon phase: New 30-year cycle begins"]
  }
}
```

#### Notes

- **KS tier hierarchy:** Moon (1) → Sun (2) → Angles ASC/MC (3) → Mercury/Venus/Mars (4) → Jupiter/Saturn if angle rulers (5). P.Uranus/Neptune/Pluto aspects are entirely excluded.
- **`tier5_conditional_outer`** is empty `{}` when neither Jupiter nor Saturn rules the natal ASC or MC. When one does, its key appears with a `reason` field (e.g. `"rules ASC (Capricorn)"`).
- **Moon phase** uses the KS 4-season system (`ks_phase`). The 8-phase detail label is in `name` for finer granularity. Progressed New Moon / Full Moon within 5° is flagged via `isProgressedNewMoon` / `isProgressedFullMoon`.
- **`stations`** are found by scanning ±2 progressed years (= ±2 ephemeris days) around the target date. Only planets eligible under the KS tier system are scanned.
- **`progressedAngles`** are calculated by casting a Placidus chart at the progressed Julian Day with the natal birthplace coordinates (standard secondary progression method).
- **Aspect orb:** 1° for all aspect types.
- **`ks_tier`** on each aspect entry: use to filter — tier 1–2 are the headline aspects, tier 3 secondary, tier 4–5 supporting.

### POST /api/solar-arcs

**Description:** Calculate solar arc directions

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |
| `targetDate` | string | No | Target date (default: today) |

---

## Arabic Parts

### POST /api/arabic-parts

**Description:** Calculate Arabic Parts (Lots) for a natal chart.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |

### POST /api/arabic-parts/transits

**Description:** Arabic parts with transit positions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |
| `targetDate` | string | No | Date for transits (default: today) |

---

## Special Days

### POST /api/moon-bad-days

**Description:** Days when Moon conjuncts natal Mars, Saturn, Pluto

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |
| `year` | number | No | Year to calculate (default: current) |
| `startDate` | string | No | Start date (alternative to year) |
| `endDate` | string | No | End date (alternative to year) |
| `currentLocation` | string | No | Current city for timing |
| `currentTimezone` | string | No | Current timezone |

**Example:**
```json
{
  "birthDate": "1980-05-10",
  "birthTime": "12:30",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "timezone": "Europe/Paris",
  "year": 2026
}
```

### POST /api/moon-bad-days/:username/and-co

**Description:** Bad days for user and all related profiles

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:username` | URL param | Yes | Username |
| `year` | number | No | Year |

### POST /api/career-days

**Description:** Favorable days for career (ZR L4 Spirit + Moon conjunct MC)

Same parameters as moon-bad-days.

### POST /api/love-days

**Description:** Favorable days for love (ZR L4 Eros + Moon DSC transit)

Same parameters as moon-bad-days.

### POST /api/lucky-days

**Description:** Lucky days (Moon conjunct Venus/Jupiter + ZR Fortune)

Same parameters as moon-bad-days.

---

## Electional Astrology

### POST /api/electional-dates

**Description:** Find best dates for events

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventType` | string | Yes | Type of event |
| `startDate` | string | Yes | Search start YYYY-MM-DD |
| `endDate` | string | Yes | Search end YYYY-MM-DD |
| `latitude` | number | Yes | Location latitude |
| `longitude` | number | Yes | Location longitude |
| `timezone` | string | Yes | IANA timezone |

**Event Types:**
- `business` - Business launch
- `wedding` - Marriage
- `travel` - Travel start
- `medical` - Medical procedures
- `contract` - Contract signing
- `move` - Moving/relocation
- `general` - General activities

### POST /api/personalized-electional-dates

**Description:** Elections based on natal chart

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |
| `eventType` | string | Yes | Type of event |
| `startDate` | string | Yes | Search start |
| `endDate` | string | Yes | Search end |
| `objective` | string | No | Specific objective |

---

## Timing

### POST /api/timing

**Description:** General timing analysis.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |

### POST /api/timingcomplete

**Description:** Complete timing analysis (comprehensive).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |

---

## Life Periods

**Source:** Benjamin Dykes, *Ascensions and Ascensional Times* (UAC Chicago 2018 handout) — "maturation of ascensional times" technique (Application #7): the sect light's triplicity rulers each unlock a life period whose length is that ruler's minor years + the ascensional time (AT) of the sign it occupies, divided into 1/3, 1/2, 2/3 milestones.

**Calculator:** `calculators/triplicity_calculator.js`

**Methodology:**
1. Determine sect (day/night chart) and the sect light (Sun by day, Moon by night).
2. Get the sect light's sign and its 3 triplicity rulers in order (1st/2nd/3rd, day- or night-ordered per the classical Fire/Earth/Air/Water triplicity scheme — e.g. Fire by day = Sun, Jupiter, Saturn).
3. For each ruler: `total = minorYears(ruler) + ascensionalTime(ruler's own sign, birth latitude)`, then split into 1/3, 1/2, 2/3 fractions.
4. Ascensional time is computed directly from oblique ascension (`OA(λ,φ) = RA(λ) − arcsin(tan φ · tan δ(λ))`, obliquity 23.4393°) — not a latitude-banded lookup table, so it's exact at any latitude. This was fixed 2026-09-07: an earlier hand-copied static table (only 6 latitudes, linear interpolation) had misread the source PDF's column layout (its 6 columns are mirrored sign-**pairs** in non-zodiacal order: Aries–Pisces, Taurus–Aquarius, Gemini–Capricorn, Cancer–Sagittarius, Leo–Scorpio, Virgo–Libra) and had assigned some values to the wrong signs entirely (Capricorn and Virgo were worst affected).
5. Minor (lesser) years: Sun 19, Moon 25, Mercury 20, Venus 8, Mars 15, Jupiter 12, Saturn 30.
6. Each ruler also gets a simple quality rating (`+++` to `---`) from domicile/exaltation/detriment/fall + house placement + retrograde.

### POST /api/triplicity

**Description:** First and second part of life only (2 triplicity rulers), plus each ruler's quality rating. Calls `calculateTriplicity(inputData)`.

**PHP file:** `triplicity.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | No | IANA timezone (default UTC) |

**Response:**
```json
{
  "success": true,
  "data": {
    "chart": { "isDayChart": false, "sectLight": "Moon", "sectLightSign": "Taurus", "ascendant": { "sign": "Leo", "degree": 29.66 } },
    "triplicity": { "element": "Earth", "rulers": { "first": "Moon", "second": "Venus", "third": "Mars" } },
    "firstPartOfLife": {
      "ruler": "Moon", "rulerSign": "Taurus",
      "rulerPosition": { "sign": "Taurus", "degree": 3.05, "house": 9, "retrograde": false },
      "planetYears": 25, "ascensionalTime": 17.55,
      "periods": { "total": 42.55, "oneThird": 14.18, "oneHalf": 21.28, "twoThirds": 28.37, "full": 42.55 },
      "quality": "++", "qualityScore": 2,
      "description": "The first part of life is ruled by Moon in Taurus..."
    },
    "secondPartOfLife": { "...": "same shape as firstPartOfLife" },
    "transitionAge": 42.55,
    "interpretation": { "summary": "...", "firstPartKeyPoints": ["..."], "secondPartKeyPoints": ["..."] }
  }
}
```

**Notes:**
- `transitionAge` = the 1st ruler's `periods.total` — the age the 2nd part of life begins.
- Verified against Dykes' handout example values (Hitler: Moon 25y in Capricorn AT 27.39 → 52.39; Venus 8y in Taurus AT 18.77 → 26.77) to within rounding.

### POST /api/ascensional-times

**Description:** Full three-part life periods (adds the 3rd triplicity ruler), each with **absolute ages** on the life timeline, plus a Dorotheus/Valens prosperity analysis comparing the 1st and 2nd rulers. Calls `calculateAllLifePeriods(inputData)`.

**PHP file:** `ascensional-times.php`

Same required parameters as `/api/triplicity`, plus optional `city`/`country` (passed through to the natal chart calculation for timezone handling) and `firstName`/`lastName`.

**Response** (in addition to the fields above):
```json
{
  "firstPartOfLife": {
    "...": "as above, plus:",
    "absoluteAges": { "start": 0, "end": 42.55, "oneThird": 14.18, "oneHalf": 21.28, "twoThirds": 28.37 }
  },
  "secondPartOfLife": { "absoluteAges": { "start": 42.55, "end": 92.9, "...": "..." } },
  "thirdPartOfLife": { "ruler": "Mars", "...": "same shape, absoluteAges continue from secondPartOfLife.end" },
  "transitionAges": { "firstToSecond": 42.55, "secondToThird": 92.9 },
  "prosperity": {
    "primaryLord": { "ruler": "Moon", "angularity": {...}, "rulership": {...}, "witnessing": {...}, "solarBeams": {...}, "prosperityIndex": 0, "explanations": {...} },
    "secondaryLord": { "...": "same shape as primaryLord" },
    "comparison": { "pattern": "both_weak", "overallProsperityIndex": 0, "interpretation": "...", "lifeCurve": "struggling", "patternExplanation": "..." },
    "timing": { "transitionAge": 42.55, "earlyLife": 0, "laterLife": 0 }
  }
}
```

**Notes:**
- `prosperity.primaryLord`/`secondaryLord.prosperityIndex` (0-100, from `prosperity_analysis.js`) is a *different, more granular* measure than the simple `quality` (+++/---) rating — it weighs house angularity (most heavily), rulership, aspects from benefics/malefics, and solar beams. The two can disagree (e.g. a planet can be `++` in quality but have a moderate prosperity index if cadent and unsupported).
- If `prosperity_analysis.js` throws, `prosperity` is returned as `null` rather than failing the whole request.
- `absoluteAges` chain: 2nd part starts where the 1st part's `total` ends; 3rd part starts where the 2nd part's absolute end is — they are NOT three independent maturation windows from birth.

---

## Yearly Forecasts

### POST /api/yearly-forecast

**Description:** Yearly forecast for a given year (tested in comprehensive test).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |
| `year` | number | No | Year (default: current) |

### POST /api/yearly-prediction

**Description:** Complete yearly prediction

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |
| `year` | number | No | Year (default: current) |

### POST /api/yearly-timing

**Description:** Yearly timing events

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |
| `year` | number | No | Year (default: current) |

### POST /api/comprehensive-yearly-timing

**Description:** Most complete yearly analysis (all techniques)

Same parameters as yearly-prediction.

### POST /api/yearly-almanac/:username

**Description:** Generate yearly almanac PDF/JSON

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:username` | URL param | Yes | Username |
| `year` | number | No | Year |
| `format` | string | No | `'json'` or `'pdf'` |

---

## Predictions

Endpoints for year- and activity-based predictions (tested in comprehensive test).

### POST /api/predictions/2026

**Description:** Predictions for year 2026.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |

### POST /api/predictions/monthly

**Description:** Monthly predictions for a given year and month.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |
| `year` | number | Yes | Year (e.g. 2026) |
| `month` | number | Yes | Month 1-12 (e.g. 2) |

### POST /api/predictions/activity

**Description:** Favorable timing for an activity type within a date range.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |
| `activity` | string | Yes | e.g. `'business'` |
| `dateRange` | object | Yes | `{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }` |

---

## Mundane Astrology

### POST /api/mundane-timing

**Description:** Monthly mundane events (no birth data needed)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | No | Year (e.g. 2026) |
| `month` | number | No | Month 1-12 (e.g. 2) |
| `includeAI` | boolean | No | Include AI analysis (default: false) |
| `timezone` | string | No | IANA timezone for labeling events (e.g. `"Europe/Brussels"`). Defaults to server configuration. |
| `city` | string | Alt* | City name (alternative to lat/lon) |
| `country` | string | Alt* | Country name (alternative to lat/lon) |
| `latitude` | number | Alt* | Latitude if using coordinates |
| `longitude` | number | Alt* | Longitude if using coordinates |

*Either `latitude`/`longitude` **or** `city`/`country` is required for **production calls via the PHP wrapper** (`mundane-timing.php`). The wrapper will return `400` with  
`"Valid coordinates (latitude/longitude) or city/country are required for accurate calculations"` if no location is provided. When calling the Node API directly (`POST /api/mundane-timing`), location remains technically optional but is **strongly recommended** for correct local-time labeling.

### GET /api/mundane-timing/:monthName

**Description:** Mundane events by month name

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:monthName` | URL param | Yes | e.g., `january`, `february` |

### POST /api/monthly-timing

**Description:** Monthly timing events

Same parameters as mundane-timing.

### POST /api/yearly-ingresses

**Description:** All planetary sign changes for a year (tested in comprehensive test). Send year in request body.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | Yes | Year (e.g. 2026) |

### GET /api/yearly-ingresses/:year

**Description:** All planetary sign changes for year (URL param variant).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:year` | URL param | Yes | Year number |

### GET /api/mundane-daily

**Description:** Daily mundane events. Parameters are passed as **query string**.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `daily` | boolean | No | e.g. true |
| `date` | string | No | Date (e.g. YYYY-MM-DD) |
| `timezone` | string | No | IANA timezone |

### GET /api/mundane-yearly/:year

**Description:** Yearly mundane events

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:year` | URL param | Yes | Year number |

---

## Numerology

### POST /api/numerology-timing

**Description:** Numérologie Stratégique® (Lydie Castells) — arbre personnel (7 clés), dynamique de vie, défis, boîte à outils (table d'inclusion), plan de vie, 9 life periods (0–81), and per-year temporalité (année personnelle / universelle / objectif de l'année, trimestres, mois, jours, clés saisonnières, advice matrix).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD or DD/MM/YYYY |
| `firstName` / `prenom` | string | Yes | All given names (compound OK with space or hyphen; no accents needed) |
| `lastName` / `nom` | string | Yes | Birth last name (nom de naissance) |
| `years` | number | No | Number of years to compute (default: 100) |
| `username` | string | No | Load birth data + name from DB |

**Top-level Response:**

| Field | Description |
|-------|-------------|
| `method` | `"Numérologie Stratégique — Lydie Castells"` |
| `objectifNumber` | Chemin de vie = 1ère racine (may be 11/22/33) |
| `objectifNumberAffichage` | Display form e.g. `"7"` or `"11/2"` |
| `objectif.label` | Archetypal name (e.g. "Le Sage") |
| `cles.premiereRacine` | 1ère racine · 1er don / chemin de vie (full birth date) |
| `cles.secondeRacine` | 2nde racine · 2nd don (all letters of first + last name) |
| `cles.tronc` | Tronc · objectif de vie (day + month) |
| `cles.ecorce` | Écorce · l'image (birth day) |
| `cles.branches` | Branches · l'action (count of letters valued 1: A/J/S) |
| `cles.feuilles` | Feuilles · besoins affectifs (vowels incl. Y) |
| `cles.fruits` | Fruits · réalisation (consonants) |
| `dynamiqueDeVie` | Sève = 1ère + 2nde + tronc |
| `triangleFondamental` | { premiereRacine, secondeRacine, tronc } |
| `racines` | Birth-date roots (**not** the Castells racines above): `{ premiere: mois, deuxieme: jour, troisieme: année }`, each reduced separately (e.g. 16/04/1986 → 4, 7, 6). Consumed by frontends showing "Birth Month / Birth Day / Birth Year" |
| `defis` | Défis 1–4 (Pythagorean; gap 0 → 9) |
| `boiteAOutils` | Inclusion counts 1–9 (action, regard, communication, …) |
| `planVie` | Life-arc guidance based on 1ère racine |
| `periodesVie` | Array of 9 life periods (0–81) |
| `annees` | Array of yearly data (see below) |

Each nombre object uses `{ valeur, reduit, affichage, label }` — masters display as `"11/2"`, `"22/4"`, `"33/6"`.

**Per-Year Object (`annees[i]`):**

| Field | Description |
|-------|-------------|
| `annee` | Calendar year (year of this birthday) |
| `age` | Age at this birthday |
| `influence12` | `true` when this anniversary year is an **Influence 12** year (occurs every 12 years: ages 11, 23, 35, 47, 59, 71…). Formula: `(age + 1) % 12 === 0`. Runs **birthday-to-birthday**. Marks major life milestones; always associated with a different `anneePersonnelle` each cycle. |
| `dateDebut` | Birthday this year (start of influence period), YYYY-MM-DD |
| `dateFin` | Day before next birthday (end of influence period), YYYY-MM-DD |
| `periodeVie` | Which 9-year life period this year belongs to |
| `anneePersonnelle` / `anneePersonnelleNombre` | Personal year for **Jan–Dec** of `annee` (AP goes Jan to Jan) |
| `anneePersonnelleNext` | Personal year for Jan–Dec of `annee+1` — applies from Jan 1 to the day before the next birthday (second half of the influence period) |
| `anneeUniverselle` / `anneeUniverselleNombre` | Universal year |
| `objectifAnnee` / `objectifAnneeNombre` | Castells objectif de l'année = AP + AU |
| `anneePersonnelleTheme` / `anneeUniverselleTheme` | Theme titles |
| `conseil.texte` | Personalized advice (annee perso × chemin de vie) |
| `trimestres` | Array of 4 calendar quarters (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec) with clés saisonnières |
| `mois` | Array of 12 months (Jan–Dec of `annee`) with `moisPersonnel` and `jours` |

**Influence 12 vs Année Personnelle — key rules:**
- **Année personnelle** changes on **January 1** (Jan 1 → Dec 31 of the same calendar year)
- **Influence 12** changes on the **birthday** (anniversary → anniversary), every 12 years
- During an influence 12 period, the AP changes mid-way on Jan 1 — hence `anneePersonnelle` (birthday → Dec 31) and `anneePersonnelleNext` (Jan 1 → day before next birthday)
- Example — James born 20/08/1972, age 47: `influence12:true`, 2019-08-20→2020-08-19; AP=4 (Aug–Dec 2019), AP=5 (Jan–Aug 2020)
- Example — Marie Ange (24/10/1980) influence 12 years: age 11/1991 (AP9), age 23/2003 (AP3), age 35/2015 (AP6), age 47/2027 (AP9), age 59/2039 (AP3), age 71/2051 (AP6)

**Response example (Marie Ange Le, 24/10/1980, age 47 = influence 12 year):**
```json
{
  "method": "Numérologie Stratégique — Lydie Castells",
  "objectifNumber": 7,
  "objectif": { "label": "Le Sage", "essence": "Introspection, sagesse, spiritualité", "mission": "..." },
  "cles": {
    "premiereRacine": { "valeur": 7, "affichage": "7", "label": "1ère racine · 1er don / chemin de vie" },
    "secondeRacine":  { "valeur": 9, "affichage": "9", "label": "2nde racine · 2nd don" },
    "tronc":          { "valeur": 7, "affichage": "7", "label": "Tronc · objectif de vie" },
    "ecorce":         { "valeur": 6, "affichage": "6", "label": "Écorce · l'image" },
    "branches":       { "valeur": 2, "affichage": "2", "label": "Branches · l'action" },
    "feuilles":       { "valeur": 8, "affichage": "8", "label": "Feuilles · besoins affectifs" },
    "fruits":         { "valeur": 1, "affichage": "1", "label": "Fruits · réalisation" }
  },
  "dynamiqueDeVie": { "valeur": 5, "affichage": "5" },
  "racines": {
    "premiere":  { "valeur": 1, "affichage": "1", "label": "Mois de naissance" },
    "deuxieme":  { "valeur": 6, "affichage": "6", "label": "Jour de naissance" },
    "troisieme": { "valeur": 9, "affichage": "9", "label": "Année de naissance" }
  },
  "defis": { "1": { "valeur": 5 }, "2": { "valeur": 3 }, "3": { "valeur": 2 }, "4": { "valeur": 8 } },
  "boiteAOutils": {
    "action": { "valeur": 2 }, "regard": { "valeur": 0 }, "communication": { "valeur": 1 },
    "travail": { "valeur": 1 }, "homme": { "valeur": 4 }, "femme": { "valeur": 0 },
    "spirit": { "valeur": 1 }, "realisation": { "valeur": 0 }, "groupe": { "valeur": 2 }
  },
  "annees": [
    {
      "annee": 2027, "age": 47,
      "influence12": true,
      "dateDebut": "2027-10-24", "dateFin": "2028-10-23",
      "anneePersonnelle": 9, "anneePersonnelleNext": 1,
      "anneeUniverselle": 2, "objectifAnnee": 2,
      "periodeVie": "Cycle de la transformation",
      "trimestres": [{ "trimestre": 1, "label": "T1 – Hiver / Printemps", "mois": [1,2,3], "nombrePersonnel": 1, "cle": "Initiative" }],
      "mois": [{ "mois": 1, "moisPersonnel": 1, "jours": [{ "jour": 1, "jourPersonnel": 2 }] }]
    },
    {
      "annee": 2026, "age": 46,
      "influence12": false,
      "dateDebut": "2026-10-24", "dateFin": "2027-10-23",
      "anneePersonnelle": 8, "anneePersonnelleNext": 9,
      "anneeUniverselle": 1, "objectifAnnee": 9,
      "trimestres": [{ "trimestre": 1, "label": "T1 – Hiver / Printemps", "mois": [1,2,3], "nombrePersonnel": 9, "cle": "Accomplissement" }],
      "mois": [{ "mois": 1, "moisPersonnel": 9, "jours": [{ "jour": 1, "jourPersonnel": 1 }] }]
    }
  ]
}
```

| `/api/numerology-timing` | ✅ Updated (2026-07-29) | `influence12` (boolean, true every 12 years at birthday), `dateDebut`/`dateFin` (influence period bounds), `anneePersonnelleNext` (AP for Jan 1→birthday in year+1) |
| `/api/numerology-timing` | ✅ Fixed (2026-09-07) | `racines` was silently returning Castells chemin de vie/expression/tronc (e.g. 8, 5, 11) instead of birth month/day/year roots (e.g. 4, 7, 6 for 16/04/1986). Now computed independently via `calculateRacinesNaissance()` — see `cles.premiereRacine`/`cles.secondeRacine`/`cles.tronc` for the Castells values. |

---

## Human Design

Human Design data via two approaches:

1. **Embedded in blueprint** — `humanDesign.*` fields inside `/api/blueprintcomplete` and `/api/blueprint-alix`
2. **Dedicated HD endpoints** — standalone `/api/hd/*` endpoints (see section below)

Legacy embedded fields (still in blueprintcomplete):
- `humanDesign.type`, `humanDesign.profile`, `humanDesign.strategy`, `humanDesign.authority`
- `humanDesign.definedCenters`, `humanDesign.undefinedCenters`, `humanDesign.gates`, `humanDesign.channels`, `humanDesign.incarnationCross`

For dedicated HD calculation see: [POST /api/hd/chart](#post-apihd-chart) and related endpoints.

---

## BaZi (Four Pillars)

### POST /api/bazi/calculate

**Description:** Calculate Four Pillars chart

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `timezone` | string | Yes | IANA timezone |

**Alternative Object Format:**
```json
{
  "birthDate": "1985-03-15",
  "birthTime": "14:30",
  "timezone": "Asia/Shanghai"
}
```

**Response:**
- Year Pillar (stem, branch, hidden stems)
- Month Pillar
- Day Pillar (Day Master)
- Hour Pillar
- Five Elements balance
- Favorable/unfavorable elements

### GET /api/bazi/annual-pillars

**Description:** Annual pillars for year range

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startYear` | number | No | Start year (default: 1910) |
| `endYear` | number | No | End year (default: 2050) |

### POST /api/bazi/profile

**Description:** Get stored BaZi profile

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `profileId` | string | Yes | Profile ID |

### POST /api/bazi/excess-elements

**Description:** Calculate excess elements in BaZi chart

### BaZi report for any username

To generate a **Markdown BaZi report** (Troncs Célestes, Troncs Terrestres, Day Master, Hidden Stems) for any username, use either:

- **Node (no API required, uses DB or fallback birth data):**
  ```bash
  node scripts/bazi_report.js <username>
  node scripts/bazi_report.js <username> --birth-date 1980-10-24 --birth-time 01:41 --timezone Europe/Brussels
  node scripts/bazi_report.js <username> -o output/bazi_report_ma1.md
  ```
- **Python (calls API: blueprint + bazi/calculate):**
  ```bash
  python scripts/bazi_report.py <username>
  python scripts/bazi_report.py <username> -o output/bazi_report_ma1.md
  ```

Output is written to `output/bazi_report_<username>.md` by default (Node) or as specified (Python `-o`).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `timezone` | string | Yes | IANA timezone |

---

## Feng Shui

### GET /api/fengshui/flying-stars/annual/:year

**Description:** Annual flying stars

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:year` | URL param | Yes | Year number |

### GET /api/fengshui/flying-stars/monthly/:year/:month

**Description:** Monthly flying stars

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:year` | URL param | Yes | Year number |
| `:month` | URL param | Yes | Month 1-12 |

### GET /api/fengshui/afflictions/:year

**Description:** Annual afflictions (Tai Sui, Wu Wang, etc.)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:year` | URL param | Yes | Year number |

### POST /api/fengshui/personal-directions

**Description:** Personal favorable/unfavorable directions

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `guaNumber` | number | Yes | Personal Gua (1-9) |
| `gender` | string | Yes | `'male'` or `'female'` |

### POST /api/fengshui/analyze

**Description:** Location-based Feng Shui analysis

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `profileId` | string | Yes | Profile ID |
| `location` | object | Yes | Location with sectors |
| `year` | number | Yes | Year |
| `month` | number | No | Month |

### GET /api/fengshui/flying-stars/annual/:year

**Description:** Annual flying stars

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:year` | URL param | Yes | Year number |

### GET /api/fengshui/flying-stars/monthly/:year/:month

**Description:** Monthly flying stars

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:year` | URL param | Yes | Year number |
| `:month` | URL param | Yes | Month 1-12 |

### GET /api/fengshui/afflictions/:year

**Description:** Annual afflictions (Tai Sui, Wu Wang, etc.)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:year` | URL param | Yes | Year number |

---

## Qi Men Dun Jia

### POST /api/qimendunjia/calculate

**Description:** Calculate QMDJ chart

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date YYYY-MM-DD |
| `time` | string | Yes | Time HH:MM |
| `timezone` | string | Yes | IANA timezone |

### POST /api/qimendunjia/action

**Description:** Best timing for action

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `actionType` | string | Yes | Type of action |
| `startDate` | string | Yes | Search start |
| `endDate` | string | Yes | Search end |
| `timezone` | string | Yes | IANA timezone |

---

## Synastry & Relationships

### POST /api/synastry-chart

**Description:** Generate synastry chart (HTML)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `person1` | object | Yes | First person data |
| `person2` | object | Yes | Second person data |
| `options` | object | No | Chart options |

**Person Object:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "birthDate": "YYYY-MM-DD",
  "birthTime": "HH:MM",
  "city": "string",
  "country": "string"
}
```

**Options Object:**
```json
{
  "chartType": "tropical",
  "theme": "light",
  "width": 900,
  "height": 900,
  "swap": false,
  "person1Name": "Person 1",
  "person2Name": "Person 2"
}
```

**Full Example:**
```json
{
  "person1": {
    "firstName": "John",
    "lastName": "Doe",
    "birthDate": "1985-03-15",
    "birthTime": "14:30",
    "city": "New York",
    "country": "USA"
  },
  "person2": {
    "firstName": "Jane",
    "lastName": "Smith",
    "birthDate": "1988-07-20",
    "birthTime": "10:45",
    "city": "Boston",
    "country": "USA"
  },
  "options": {
    "chartType": "tropical",
    "theme": "light"
  }
}
```

### POST /api/synastry-chart/:username1/:username2

**Description:** Synastry for two database users

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:username1` | URL param | Yes | First person username |
| `:username2` | URL param | Yes | Second person username |
| `options` | object | No | Chart options |

### POST /api/match

**Description:** Percentage-based matching/compatibility scores between two people — the equivalent of the legacy app's `match` endpoint (see `knowledge/match.md`). Returns compatibility, resemblance, attraction (both directions), dominant-planet balance, boss/leadership, exclusivity, general understanding, mutual understanding, gift, and hugs scores, plus two 10-planet radar arrays.

**Provenance:** `compatibility`, `resemblance`, `compatibilityRadar`, `similarityRadar` and `balance` are a **faithful-core port of the actual legacy algorithm**, reverse-engineered from the real source files:
- `E:\soft\BUBBLE1.4\scripts\1.1.Natal_Dominantes_DB3.anatella` — the "points de dominance" method (classical French astrology): each of the 10 planets accumulates weighted points from ~20 criteria (conjunct an angle, aspecting the chart ruler or a luminary, angular house placement, dignity, mutual reception, stelliums, partile aspects); a planet's dominant % = its points ÷ sum of all 10 planets' points × 100.
- Weights come from the workbook that job loads at runtime: `MyEvents (version 1).xlsb.xlsx`, sheet `points_perso`.
- Every person gets **two** profiles, exactly as the legacy job computes them: `perso` (who they are — angles = Ascendant/MC/Descendant/IC) and `recherchees` ("searched-for" — built off the **Descendant** axis, using **gender-based significator planets**: `contains(GENDER,"F") ? Sun+Mars : Moon+Venus`, found verbatim in the source job).
- `E:\soft\BUBBLE1.4\match_1_to_1.anatella` — the actual matching mechanic: person A's `recherchees` profile is compared per-planet against person B's `perso` profile (and vice versa), gap-scored and averaged both directions. That's `compatibility.aToB`/`bToA`. `resemblance` compares both people's `perso` profiles directly.
- **`compatibility` and `balance` now use the exact idx 9018 formula** verified against `match_M.anatella`: `compatibility.score = (aToB + bToA) / 2` (order=2), `balance.asymmetry = |aToB - bToA|` (order=1), `subtitleKey` from the idx 9022 buckets. The legacy versions feed a population-relative KNN distance into this same formula (see Q1 below); we feed the portable `aToB`/`bToA` gap scores instead — same structure, different (pairwise) input. `balance`'s label still uses the legacy `equil` lookup table (5 bands) bucketed on `asymmetry`.
- This is a **core** port, not byte-exact: it implements the ~15 (perso) / ~8 (recherchees) highest-weighted criteria with fixed orbs, skipping the legacy graph's per-orb multiplier curves and dead/zero-weight criteria. See `calculators/dominants_calculator.js` for the full criteria list and exact weights.

**`boss`, `exclusive`, `gift`, and `generalUnderstanding` are REAL legacy ports** (traced from `match_M.anatella` and `03.API_id_json_Insight_2.anatella` — see `knowledge/API-MATCHING.md` for citations), not heuristics. **`attraction`** was rebuilt this session into a full KS (Kelly Surtees) / CB (Chris Brennan) relationship-astrology engine per `knowledge/attraction.md` — natal 7th-house profiles, ranked `sparkHits[]`, and idealization/obsession/electric/longevity flags — since the real legacy attraction score is the same non-portable population KNN as compatibility. **`hugs`** and **`mutualUnderstanding`** remain approximations: `mutualUnderstanding` approximates the legacy `1to1_ententeIntel` report (mutual-understanding bullets), whose real logic lives in a `combi` lookup table baked into `match_M.anatella` and isn't reachable outside Anatella; `hugs`'s real source filters by water/air-sign placements then ranks by an unresolved `combi` key.

`person1` / `person2` each accept **one of three** input modes, and the two people can mix modes independently:

| Mode | Fields |
|------|--------|
| Raw birth data | `firstName`, `lastName`, `birthDate` (YYYY-MM-DD), `birthTime` (HH:MM), `latitude`, `longitude`, `timezone`, `city`, `country`, `gender` (optional — `"F"` selects Sun+Mars significators for the `recherchees` profile, anything else defaults to Moon+Venus, matching the legacy fallback) |
| DB lookup by name | `{ "name": "First Last" }` — fuzzy-searches the `astrolearn` and `bubble` `person` tables (both have a `gender` column, used automatically) |
| DB lookup by id | `{ "personId": 12345 }` |

**Full Example (raw birth data):**
```json
{
  "person1": {
    "firstName": "Alice",
    "birthDate": "1990-04-12",
    "birthTime": "08:30",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "timezone": "Europe/Brussels"
  },
  "person2": {
    "firstName": "Bob",
    "birthDate": "1988-11-02",
    "birthTime": "21:15",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "timezone": "Europe/Paris"
  }
}
```

**Example (DB lookup by name):**
```json
{
  "person1": { "name": "Marco Avellaneda" },
  "person2": { "name": "Mario Bunge" }
}
```

**Response shape:**
```json
{
  "success": true,
  "person1": {
    "name": "Alice", "birthDate": "1990-04-12", "birthTime": "08:30", "city": "", "country": "",
    "dominantPlanet": { "planet": "Pluto", "pct": 35.9 },
    "searchedForPlanet": { "planet": "Uranus", "pct": 28.2 }
  },
  "person2": { "name": "Bob", "...": "same shape as person1" },
  "compatibility": { "score": 84, "label": "Excellent", "desc": "..." },
  "compatibilityRadar": [
    { "planet": "sun", "pointsperc": 0, "pointsperc2": 1.7 },
    "... one row per planet: sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto. pointsperc = person1's Recherchées % for that planet, pointsperc2 = person2's Perso % for that planet (asymmetric — these are two different profiles, not a symmetric comparison)"
  ],
  "resemblance": { "score": 88, "label": "Excellent", "desc": "..." },
  "similarityRadar": [
    { "planet": "sun", "pointsperc": 1.7, "pointsperc2": 1.7 },
    "... one row per planet. pointsperc = person1's Perso %, pointsperc2 = person2's Perso % (both direct dominant-profile values, not a derived score)"
  ],
  "balance": { "score": 81, "asymmetry": 18.3, "label": "Acceptable imbalance", "label_fr": "déséquilibre acceptable", "desc": "..." },
  "attraction": {
    "hits": [{ "person1Planet": "Mars", "person2Planet": "Venus", "aspect": "Trine", "orb": 5.05 }], "count": 1, "desc": "...",
    "natalProfileA": { "sect": "night", "seventhSign": "Aquarius", "seventhRuler": { "planet": "Saturn", "sign": "Libra", "house": 3, "dignity": "exaltation", "combust": false, "averseToSeventh": false }, "planetsInSeventh": [], "venus": { "sign": "Virgo", "house": 2, "dignity": "fall" }, "mars": { "sign": "Sagittarius", "house": 5 }, "moon": { "sign": "Aries", "house": 9 }, "angles": { "asc": 148.97, "dsc": 328.97, "mc": 48.65, "ic": 228.65 }, "sectBeneficInOrRulingSeventh": false },
    "natalProfileB": { "...": "same shape as natalProfileA" },
    "sparkHits": [{ "type": "venus_mars", "priority": 2, "direction": "b_to_a", "planetA": "Venus", "planetB": "Mars", "aspect": "Trine", "orb": 5.05, "house": null, "gloss": "Easier sexual/romantic chemistry." }],
    "idealizationFlags": [], "obsessionFlags": [], "electricUnstableFlags": [], "longevityHits": [],
    "qualityNotes": ["Marie ange LE's 7th ruler (Saturn in Libra) is exaltation — higher caliber or a smoother path to partners."]
  },
  "bond": {
    "score": 75, "label": "Good", "headline": "attraction by a deep difference",
    "element1": "Water", "element2": "Fire", "element1Pct": 62.4, "element2Pct": 37,
    "sharedQualities": ["cold", "dry"], "wetBinding": "both_dry", "hasMinimumOverlap": true,
    "temperamentCompare": { "person1": { "dominants": ["melancholic"], "qualities": { "cold": true, "dry": true } }, "person2": "...", "sharedQualities": ["cold", "dry"], "note": "..." },
    "bulletPoints": ["...", "Comfort links: Moon sextile Sun (orb 3.3°)"], "desc": "..."
  },
  "boss": { "who": "person1", "confidence": 63, "person1Score": 25.6, "person2Score": 18.8, "desc": "..." },
  "exclusive": { "who": "person2", "confidence": 58, "person1Score": 4.3, "person2Score": 12.1, "desc": "..." },
  "generalUnderstanding": {
    "score": 50, "label": "Moderate", "headline": "attraction by a deep difference",
    "element1": "Water", "element2": "Fire", "element1Pct": 62.4, "element2Pct": 37,
    "bulletPoints": ["..."], "temperamentCompare": { "...": "same object as bond.temperamentCompare" }
  },
  "mutualUnderstanding": {
    "score": 59, "label": "Moderate", "headline": "similar attitudes, strong chances of getting along",
    "hits": [{ "from": "Alice", "planetFrom": "Mercury", "planetTo": "Jupiter", "aspect": "Trine", "orb": 2.1, "harmony": 0.7, "gloss": "agreement and understanding; expansive conversation" }],
    "bulletPoints": ["exchange of ideas, stimulation", "..."], "desc": "..."
  },
  "gift": { "person1GivesPerson2": { "house": 4, "domain": "family", "desc": "..." }, "person2GivesPerson1": { "house": 11, "domain": "friendship", "desc": "..." }, "desc": "..." },
  "hugs": { "score": 50, "label": "Moderate", "desc": "..." }
}
```

**Field notes:**
- `person1.dominantPlanet` / `searchedForPlanet` — the single highest-scoring planet in that person's `perso` / `recherchees` profile.
- `compatibility` — `aToB`/`bToA`: weighted average, both directions, of how closely person A's `recherchees` % profile matches person B's `perso` % profile (per-planet gap score = `100 - |a-b|`, weighted by A's `recherchees` % so planets A cares about most matter most). `score = round((aToB+bToA)/2)` — the exact idx 9018 order=2 formula. `subtitleKey` is the idx 9022 bucket computed on `score` (buckets calibrated for the legacy's KNN-distance scale, so real pairs skew toward `high`/`very_high_compatibility` more than production likely does — documented limitation, not a bug). All percentage scores in this endpoint are clamped to **[30, 99]** — matching the legacy job's own philosophy of never showing a hopeless single-digit match or a suspicious 100% (see `knowledge/API-MATCHING.md`).
- `compatibilityRadar` — raw profile values per planet, NOT a derived score: `pointsperc` = person1's `recherchees` %, `pointsperc2` = person2's `perso` %. Intentionally asymmetric (shows "what A looks for" vs "what B actually has").
- `resemblance` — unweighted average gap score between both people's `perso` profiles directly (how similar their actual dominant-planet makeups are — same `1.1.Natal_Dominantes_DB3.anatella` personality-dominants basis as `compatibility`/`boss`/`exclusive`). The raw gap score is mathematically floored well above zero for realistic (sparse, 2-4-dominant-planet) profiles — even maximally-opposite profiles land around 80, confirmed empirically on 10 random unrelated pairs (see `knowledge/matching-review.pdf`) — so it's rescaled from its practical [75,100] range onto the full [30,99] display range to keep real differences visible.
- `similarityRadar` — raw values: `pointsperc` = person1's `perso` %, `pointsperc2` = person2's `perso` % for that planet.
- **`balance` — exact idx 9018 order=1 formula:** `asymmetry = |aToB - bToA|` (same `aToB`/`bToA` as `compatibility`, lower = more balanced in the legacy sense). `score = 99 - asymmetry`, clamped [30,99] and **inverted for the UI gauge** (higher = more balanced). `label`/`label_fr` bucket on `asymmetry` via the legacy `equil` table (5 bands: incredible/acceptable balance, acceptable/large/incredible imbalance).
- **`attraction` — NOT a percentage.** A full KS/CB relationship-astrology engine (`knowledge/attraction.md`): `natalProfileA`/`natalProfileB` (7th-house sign/ruler with traditional dignity, combustion, aversion; Venus/Mars/Moon condition; sect; whole-sign angles), a ranked `sparkHits[]` (priority 1-8: planet-to-angle, Venus-Mars, Pluto/Neptune/Uranus-to-personal, node contacts, 5th/7th overlays, ASC/DSC reversal — both directions always checked), `idealizationFlags`/`obsessionFlags`/`electricUnstableFlags` (direct filters of `sparkHits` by type), `longevityHits[]` (Saturn-to-personal and Sun-Moon links, deliberately excluded from spark), and `qualityNotes[]` (7th-ruler dignity/sect-benefic text). `hits`/`count`/`desc` remain as a flat Sun/Moon/Venus/Mars-only projection of `sparkHits` for legacy-shaped consumers, now widened to 6° and including squares/oppositions (KS: hard aspects between Venus/Mars are "still chemistry," not excluded). The real legacy score runs a k=400 nearest-neighbors model across the entire person population, which isn't reproducible pairwise — this engine is the practical substitute. Full field-by-field detail: `knowledge/API-MATCHING.md` §5.
- **`boss` — REAL legacy port** (`match_M.anatella`, the "Who Leads Flag" screen): for each person, average their `perso` `pointsPerc` across only the planets placed in an angular house (1/4/7/10), a fire sign, or a cardinal sign (initiative/"strong Mars" energy) — `person1Score`/`person2Score` are those averages. This is a **comparison mechanism, not a standalone score**: `who` names whichever person scored higher (`"balanced"` if within 0.5 of each other), `confidence` reflects how decisive the gap is.
- **`exclusive` — REAL legacy port** ("Loyalty / Exclusivity Flag" screen): same mechanism and same comparison-not-score shape as `boss`, but averaged over air-sign, cadent-house (3/6/9/12), or mutable-sign placements — `who` names the more loyal person.
- **`bond` — NEW** ("Do you have a bond?"): KS/Greenbaum temperament comparison (hot/cold/wet/dry from ASC, ASC ruler, Moon, Moon phase, Sun season) + element-pair headline + Moon/Venus comfort links. `score` is an overlap UI gauge only — not a soulmate %. Same `temperamentCompare` as `generalUnderstanding`. Spec: `knowledge/match-attraction-spec.md` §3 / `knowledge/attraction.md` §2.5.
- **`generalUnderstanding` — REAL legacy port + temperament** (→ `entente_generale`, Temperament card): dominant elements (`element1`/`element2` + pcts), `headline`, richer `bulletPoints`, plus full `temperamentCompare`.
- **`mutualUnderstanding` — augmented** (→ `1to1_ententeIntel`, "How do you get along?"): each Mercury to the other's Mercury/Sun/Moon/Mars/Jupiter/Saturn/Uranus/Neptune/Pluto; structured `hits[]` with glosses, `headline`, `bulletPoints`. Basis of `synastrieAspectMercury`; wording is ours.
- **`gift` — REAL legacy port** (built in `03.API_id_json_Insight_2.anatella`, not `match_M.anatella`): whichever house one person's Sun falls into on the other's chart, both directions — `person1GivesPerson2`/`person2GivesPerson1` each give the house number, a domain tag (career/love/family/etc.), and a short description. No numeric score, matching the legacy behavior. English text is our own translation of the source's French, not the app's actual localized strings.
- `hugs` — Moon↔Moon and Moon↔Venus cross-aspects (emotional/physical warmth). **Original heuristic** — the real legacy source filters by water/air-sign placements then ranks by an unresolved `combi` key.
- `person1.temperament` / `person2.temperament` — per-person hot/cold/wet/dry tallies + dominants (same objects as inside `bond.temperamentCompare`).

---

## Chart Visualization

### POST /api/birth-chart-interactive

**Description:** Interactive D3.js natal chart (HTML)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `city` | string | Yes* | Birth city |
| `country` | string | Yes* | Birth country |
| `options.chartType` | string | No | `'tropical'` or `'sidereal'` |
| `options.theme` | string | No | `'light'` or `'dark'` |
| `options.width` | number | No | Width (default: 900) |
| `options.height` | number | No | Height (default: 900) |

### POST /api/birth-chart-honey

**Description:** Honeycomb-style birth chart (HTML)

Same parameters as birth-chart-interactive.

### POST /api/birth-chart-transits

**Description:** Natal chart with transit overlay (HTML)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |
| `options.transitDate` | string | No | Transit date (default: today) |
| `options.timezone` | string | No | Transit timezone |

### POST /api/human-design-chart-interactive

**Description:** Human Design body graph (HTML)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Birth data | - | Yes | Standard birth data |
| `options.theme` | string | No | `'light'` or `'dark'` |
| `options.width` | number | No | Width (default: 1000) |
| `options.height` | number | No | Height (default: 1200) |

---

## Horary

### POST /api/horary

**Description:** Horary chart for specific question

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `questionDate` | string | Yes | When question asked YYYY-MM-DD |
| `questionTime` | string | Yes | Time HH:MM |
| `latitude` | number | Yes | Location latitude |
| `longitude` | number | Yes | Location longitude |
| `timezone` | string | Yes | IANA timezone |
| `question` | string | No | The question being asked |
| `questionType` | string | No | Category of question |

### GET /api/horary/houses

**Description:** Horary house significations reference

No parameters required.

---

## Query Endpoints

Strategic query endpoints for chatbot use:

### POST /api/query/birth-chart/:username

Personal traits and characteristics

### POST /api/query/profection/:username

Profection analysis with all enhancements

### POST /api/query/solar-return/:username

Solar return analysis

### POST /api/query/zodiacal-releasing/:username

ZR periods analysis

### POST /api/query/transits

**Description:** Strategic query endpoint for transits (consolidates multiple transit endpoints)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | No | `'exact'`, `'date'`, `'cycles'`, `'agenda'`, `'recurrence'`, `'hard-aspect'` (default: `'exact'`) |
| `targetDate` | string | No | Target date (required for `date` and `cycles` modes) |
| `planets` | array | No | Array of planet names (required for `hard-aspect` mode) |
| `birthData` | object | Yes | Standard birth data |

**Modes:**
- `exact` → Calls `/api/transits-exact`
- `date` → Calls `/api/transits-date`
- `cycles` → Calls `/api/transit-cycles`
- `agenda` → Calls `/api/agenda/transits`
- `recurrence` → Calls `/api/recurrence-transits/next` or `/api/recurrence-transits/planet/:planetName`
- `hard-aspect` → Calls `/api/hard-aspect-finder`

### POST /api/query/chart-analysis

**Description:** Strategic query endpoint for chart analysis

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `analysis` | array | No | Array of analysis types: `['traits', 'dignities', 'aspects', 'houses', 'human-design']` |
| `birthData` | object | Yes | Standard birth data |

### POST /api/query/timing

**Description:** Strategic query endpoint for timing techniques

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `techniques` | array | No | Array of techniques: `['profections', 'zodiacal-releasing', 'transits', 'life-periods']` |
| `birthData` | object | Yes | Standard birth data |

### POST /api/query/relationships

**Description:** Strategic query endpoint for relationship compatibility

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `analysis` | array | No | Array: `['synastry', 'composite']` |
| `person1` | object | Yes | First person birth data |
| `person2` | object | Yes | Second person birth data |

### POST /api/query/eclipses

**Description:** Strategic query endpoint for eclipse analysis

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `mode` | string | No | `'natal-impact'`, `'upcoming'`, `'historical'` |
| `birthData` | object | Yes | Standard birth data (for `natal-impact` mode) |

### POST /api/query/electional

**Description:** Strategic query endpoint for electional astrology

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventType` | string | Yes | Type of event |
| `startDate` | string | Yes | Start date |
| `endDate` | string | Yes | End date |
| `location` | object | Yes | Location data |

### POST /api/query/health

**Description:** Strategic query endpoint for health analysis

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthData` | object | Yes | Standard birth data |

### POST /api/query/yearly-forecast

**Description:** Strategic query endpoint for yearly forecast

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthData` | object | Yes | Standard birth data |
| `year` | number | No | Year (default: current) |

### POST /api/query/solar-return

**Description:** Strategic query endpoint for solar return

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthData` | object | Yes | Standard birth data |
| `returnYear` | number | No | Year for SR |
| `location` | object | No | Relocation for SR |

### POST /api/query/birth-chart/:username

**Description:** Personal traits and characteristics

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:username` | URL param | Yes | Username |

### POST /api/query/profection/:username

**Description:** Profection analysis with all enhancements

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:username` | URL param | Yes | Username |
| `targetDate` | string | No | Target date |

### POST /api/query/zodiacal-releasing/:username

**Description:** ZR periods analysis

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `:username` | URL param | Yes | Username |
| `lotType` | string | No | Lot type (default: `'fortune'`) |

### POST /api/query/transits-slow/:username

Slow planet transits

### POST /api/query/mundane/:username

Mundane timing for user

### POST /api/query/lunations/:username

Moon phases impact

### POST /api/query/recurrence/:username

Recurrence transits

### POST /api/query/eclipses/:username

Eclipse impacts

---

## Response Format

All endpoints return:

**Success:**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "timestamp": "2026-02-04T12:00:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-02-04T12:00:00.000Z"
}
```

---

## Date & Time Formats

| Format | Example | Usage |
|--------|---------|-------|
| Date | `2026-02-04` | YYYY-MM-DD |
| Time | `14:30` | HH:MM (24-hour) |
| Timezone | `Europe/Paris` | IANA format |
| DateTime | `2026-02-04T14:30:00Z` | ISO 8601 |

---

## Location Options

**Option 1: City + Country (auto-geocoded)**
```json
{
  "city": "Paris",
  "country": "France"
}
```

**Option 2: Coordinates (precise)**
```json
{
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

Both options are valid. City/country is geocoded via Nominatim.

---

## POST `/api/draw-your-chart`

**Added:** 2026-03-04
**Calculator:** `calculators/draw_your_chart_calculator.js`
**Purpose:** Returns all data needed to fill a Western astrology natal chart worksheet (Demetra George method) — LST, house cusps, planetary positions, aspects.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅ | `"YYYY-MM-DD"` |
| `birthTime` | string | ✅ | `"HH:MM"` or `"HH:MM:SS"` |
| `timezone` | string | ✅ | IANA tz (e.g. `"Europe/Lisbon"`) |
| `latitude` | number | ✅ | Decimal degrees (negative = South) |
| `longitude` | number | ✅ | Decimal degrees (negative = West) |
| `name` | string | ➖ | For display in `birthInfo.name` |
| `city` | string | ➖ | For display only |
| `country` | string | ➖ | For display only |

### Response Fields

| Field | Worksheet Part | Content |
|-------|---------------|---------|
| `birthInfo` | Part 2 | name, dateISO, localTime, location, latitude, longitude, timezone, isDST, localDateTime, utcDateTime |
| `utConversion` | Part 3 | utTime, utDecimal, siderealAdvanceSeconds, longitudeCorrectionMinutes, longitudeCorrectionNote |
| `lst` | Part 4 | hours, minutes, seconds, formatted, decimal, gmst, gmstFormatted |
| `angles` | Parts 5–6 | mc, ic, ascendant, descendant — each with longitude, sign, signFr, degrees, minutes, formatted, formattedFr |
| `houses` | Part 6 | Array of 12 objects (house 1–12, Placidus), each with same position fields |
| `planets` | Part 8 | Array of 13 bodies: Sun→Pluto + North Node + South Node + Chiron — name, nameFr, symbol, longitude, sign, signFr, degrees, minutes, retrograde (bool), retrogradeSymbol, house (Placidus), **`wshHouse`** (WSH 1–12), declination |
| `wshHouseLords` | — | Array of 12 objects — one per WSH house. Traditional (classical 7-planet) rulers. Fields: `house`, `sign`, `signFr`, `ruler`, `rulerFr`, `rulerSymbol`, `rulerSign`, `rulerSignFr`, `rulerWSHHouse`, `label` (French string: *"Maître de la maison X (SignFr) : PlanetFr en SignFr (maison Y WSH)"*) |
| `declinations` | Part 9 | Per-planet declinations, parallels, counter-parallels, out-of-bounds list |
| `aspects` | Part 11 | Sorted by orb — planet1/2, aspect name & symbol, angle, orb, maxOrb, label |

**Aspect orbs (Demetra George):** Sun/Moon 8°, Mercury/Venus 6°, all others 4°. Pair orb = max of both planets.

**WSH house lords:** Use traditional 7-planet rulerships (Mars/Aries & Scorpio, Venus/Taurus & Libra, Mercury/Gemini & Virgo, Moon/Cancer, Sun/Leo, Jupiter/Sagittarius & Pisces, Saturn/Capricorn & Aquarius). House 1 = sign containing the ASC; each subsequent house = next sign in zodiacal order.

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/draw-your-chart.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1986-04-16",
    "birthTime": "03:20",
    "timezone": "Europe/Lisbon",
    "latitude": 40.6566,
    "longitude": -7.9147,
    "name": "Liliana",
    "city": "Viseu",
    "country": "Portugal"
  }'
```

---

## POST `/api/jyotish/chart`

**PHP:** `jyotish-chart.php` ← **call this URL directly; `/api/jyotish/chart` is the internal wrapper route, not a server-routed path**
**Added:** 2026-09-04
**Calculator:** `calculators/jyotish_chart_calculator.js`
**Purpose:** Vedic (Jyotish) sidereal natal chart — Phase 1 of `knowledge/jotish.md` (matches our published Jyotish Level 1 course). Reuses the same JD/timezone engine as `/api/draw-your-chart` (`lib/natal_positions_calculator.js`) and layers Lahiri ayanamsha + Vedic derivations on top. See `/api/jyotish/dasha` below for Phase 2's Vimshottari dasha (varga charts, ashtakavarga, special lagnas, arudha padas, char karakas are still not built).

### Request Body

Same contract as `/api/draw-your-chart` — no new inputs.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅ | `"YYYY-MM-DD"` |
| `birthTime` | string | ✅ | `"HH:MM"` or `"HH:MM:SS"` |
| `timezone` | string | ✅ | IANA tz (e.g. `"Europe/Brussels"`) |
| `latitude` | number | ✅ | Decimal degrees (negative = South) |
| `longitude` | number | ✅ | Decimal degrees (negative = West) |
| `name` | string | ➖ | For display in `birthInfo.name` |
| `city` | string | ➖ | For display only |
| `country` | string | ➖ | For display only |
| `gender` | string | ➖ | `"male"` \| `"female"` — selects the spouse karaka (Guru for female, Shukra for male) used by `naisargikaKarakas` and `topicPacks.marriage`. Also accepted as `sex`. Omit to get both Shukra/Guru without a selected spouse karaka. |

### Response Fields

| Field | Content |
|-------|---------|
| `birthInfo` | name, dateISO, localTime, location, latitude, longitude, timezone, localDateTime, utcDateTime, **`gender`** (echoes input, normalized) |
| `ayanamsha` | `school` ("Lahiri (Chitrapaksha)"), `value` (decimal degrees), `formatted` (D°M'S") |
| `chartStyle` | `"North Indian"` (fixed default for Phase 1) |
| `lagna` | Sidereal ascendant — rashi (Sanskrit), rashiEn, rashiIndex, rashiLord, degrees/minutes/seconds, formatted |
| `chandraLagna` | Moon's rashi treated as a second ascendant — same position-object shape as `lagna` |
| `houses` | Array of 12 whole-sign houses: `house` (1–12), `rashi`, `rashiEn`, `rashiLord`, `grahas` (array of graha keys occupying that house), `houseNature` (`kendra` / `trikona` / `dusthana` / `upachaya` / `maraka` / `trishadaya`) |
| `housesFromChandra` | **Added 2026-09-07.** Same 12-house shape as `houses`, but counted from Chandra Lagna (Moon as ascendant) instead of the birth Lagna — the classical "Moon chart" view. Each graha in `grahas` also carries a `houseFromChandra` (1–12). |
| `grahas` | Object keyed by `surya, chandra, mangal, budha, guru, shukra, shani, rahu, ketu`. Each: position fields as before, plus **`dignity`** (same shape as top-level `dignity[key]`) and **`houseFromChandra`** |
| `panchanga` | Computed for the birth moment: `tithi` (number 1–30, paksha, name, label, percentRemaining, **`lord`/`lordKey`/`devata`/`tithiInPaksha`/`isRikta`/`isAmavasya`/`isPurnima`/`isInauspicious`/`inauspiciousFlags`** — added 2026-09-07), `vara` (weekday, lord), `nakshatra` (Moon's — name, pada, lord, percentRemaining, **`deity`/`symbol`/`index`** — added 2026-09-07), `yoga` (name, percentRemaining), `karana` (name, percentRemaining), `elongation` (Moon−Sun, degrees) |
| `pakshaBala` | Moon's strength from full moon — `tithiNumber`, `distanceFromFullMoonTithis`, `approxDaysFromFullMoon`, `strongWindow`, `isStrong` (tithi 10–20, i.e. Shukla Dashami through Krishna Panchami) |
| `specialLagnas` | **Phase 2, added 2026-09-07.** `sriLagna`, `horaLagna`, `ghatikaLagna`, `bhavaLagna`, `vighatikaLagna` — each a position object shaped like `lagna`. **Not included:** Pranapada Lagna — sources disagreed on the exact unit conversion and no reference value was available to validate a candidate formula, so it was left out rather than shipped unverified. |
| `arudhaPadas` | **Phase 2.** Array of 12: `house` (1–12), `padaLabel` (`"A1"`–`"A12"`), `rashi`/`rashiEn`/`rashiIndex`, `lord` (that house's rashi lord), `lordRashi`. Jaimini's "perceived" houses — see formula note below. |
| `charKarakas` | **Phase 2.** Object keyed by `surya, chandra, mangal, budha, guru, shukra, shani` (7 classical grahas only — no Rahu/Ketu). Each: `role` (`AK/AmK/BK/MK/PK/GK/DK`), `roleName`, `degreeInSign`. |
| `combustion` | **Phase 2.** Object keyed by `chandra, mangal, budha, guru, shukra, shani` (Sun/Rahu/Ketu excluded — not applicable). Each: `separationFromSun` (degrees), `orb` (Surya Siddhanta ch. 9, retrograde-adjusted for Budha/Shukra), `combust` (bool). |
| `speedPercent` | **Phase 2.** Object keyed by the 7 classical grahas. Each: `currentDailyMotion` (°/day, signed — negative = retrograde), `meanDailyMotion` (published reference), `percentOfMean`. |
| `dignity` | **Reading primitive (2026-09-07).** Per-graha rashi dignity: `status` (`exalted`/`moolatrikona`/`own`/`friend`/`neutral`/`enemy`/`debilitated`), flags, `degreeInSign`, exalt/debil rashis, `deepExaltationDegree`, `signLordKey`, `signLordRelation`. Budha-in-Kanya uses BPHS degree bands. Rahu/Ketu exaltation = common North-Indian convention (`nodeExaltationNote`). |
| `houseLords` | **Reading primitive.** Array of 12: `lordKey`/`lordName`, `lordHouse`, `lordRashi`, `lordDignityStatus`, `coOccupants`, `houseNature`. |
| `grahaDrishti` | **Reading primitive.** Whole-sign Parashara aspects — `byGraha` + `byHouse`. All aspect 7th; Mangal +4/8; Guru +5/9; Shani +3/10; Rahu/Ketu +5/9. |
| `mangalDosha` | **Reading primitive**, extended 2026-09-07. Kuja pattern from Lagna/Chandra/Śukra in houses `[1,2,4,7,8,12]`, plus **`cancellations[]`** (rules checked: `mars_own_sign`, `mars_exalted`, `mars_yogakaraka`, `jupiter_aspect_or_conjunct_mars`, `mars_movable_sign_soft`), **`presentCount`** (0–3, how many of Lagna/Chandra/Śukra show the pattern), **`severity`** (`none`/`mild`/`moderate`/`strong`/`cancelled`), **`cancelled`** (bool), **`effectivePresent`** (present AND not cancelled). `advisory`: pattern only, not a marriage verdict — always read with D9, 7th lord, and full chart. |
| `purusharthas` | **Reading primitive.** Four aims: `dharma` 1–5–9, `artha` 2–6–10, `kama` 3–7–11, `moksha` 4–8–12 — each with `occupants` + `lords`. |
| `planetaryYogas` | **Reading primitive.** Boolean patterns: `gajakesari`, `budhaAditya`, `chandraMangala`, `kemadruma`, `amala`, `viparitaRaja`, `neechaBhanga[]`, `kartari`, `lagnaLord`. Unrelated to `panchanga.yoga`. |
| `functionalNature` | **Added 2026-09-07.** Parashara functional benefic/malefic *for this specific lagna* (as opposed to natural benefic/malefic, which never changes). Object keyed by all 9 grahas. Each: `ruledHouses`, `functional` (`yogakaraka`/`benefic`/`mixed`/`malefic`/`kendradhipati`/`neutral`), `natural` (`benefic`/`malefic`/`neutral`, the fixed Parashara classification), `yogakaraka` (bool — owns both a kendra 1/4/7/10 and a trikona 5/9 for this lagna), `notes`. Rahu/Ketu are always `functional:'malefic'` (no classical rashi lordship). |
| `naisargikaKarakas` | **Added 2026-09-07.** Fixed *natural* significators (karaka = "what this graha represents"), **distinct from `charKarakas`** (which ranks grahas by degree for a chart-specific Jaimini role). Object keyed by all 9 grahas — each: `roles[]` (e.g. Surya→father/authority/ego, Chandra→mother/mind, Guru→wisdom/children, plus `spouseHusband`/`spouseWife` added conditionally), `spouseKaraka` (bool), `house`, `rashi`, `dignityStatus`, `aspects`, `aspectedBy`. Plus `genderUsed` and `spouseKarakaKey` (`"guru"` if female, `"shukra"` if male, `null` if no gender given). |
| `digbala` | **Added 2026-09-07.** Directional strength — Surya/Mangal peak in the 10th house, Guru/Budha in the 1st, Chandra/Shukra in the 4th, Shani in the 7th (whole-sign, Rahu/Ketu omitted). Object keyed by those 7 grahas: `digbalaHouse`, `currentHouse`, `inDigbalaHouse`, `strengthPercent` (0–100, linear falloff by house-distance), `label` (`strong`/`moderate`/`weak`). |
| `strengthHints` | **Added 2026-09-07.** Coarse per-graha strength score — **not** Shadbala, a lightweight composite: dignity (±1/±2) + combustion (−2) + digbala (±1) + Moon's own pakshaBala (±1, Chandra only). Object keyed by all 9 grahas: `score`, `label` (`strong`/`moderate`/`weak`). Does not include Ashtakavarga — merge `/api/jyotish/ashtakavarga`'s SAV client-side for a fuller picture. |
| `topicPacks` | **Added 2026-09-07.** Pre-assembled life-area packs — raw facts only, no delineation — so the app doesn't need to re-derive house/karaka/yoga lookups per topic. Keys: `self` (1st), `career` (10th + Surya karaka + amala/budhaAditya), `wealth` (2nd+11th + Budha karaka), `marriage` (7th + spouse karaka + both Shukra/Guru + `mangalDosha` summary), `mind` (Chandra karaka + pakshaBala + tithi + nakshatra + gajakesari/kemadruma/chandraMangala), `health` (6th + related 8th/12th), `father` (9th + Surya), `mother` (4th + Chandra), `siblings` (3rd + Mangal + chandraMangala), `children` (5th + Guru, with a `vargaHint` pointing at D7), `mokshaAxis` (4th/8th/12th + Ketu). Each house slice: `house`, `rashi`, `occupants`, `houseNature`, `lord` (with dignity), `aspectedBy`. |
| `remedyHooks` | **Added 2026-09-07.** Classical association tags (weekday/direction/metal/gem) for grahas flagged weak/combust/debilitated/functionally-malefic — **tags only, not auto-prescribed remedies**; the app or a jyotishi chooses conduct fit. Includes `birthVara` for context. |

**Special lagnas — formula & confidence (2026-09-07):** all five are BPHS points anchored to the Sun's sidereal longitude at the most recent sunrise (via the same `sweph.rise_trans` used for Vara), advancing at a fixed rate per elapsed hour: Hora Lagna 30°/h, Ghatika Lagna 75°/h, Bhava Lagna 15°/h, Vighatika Lagna 900°/h (15°/elapsed minute) — each cross-checked against two independent BPHS-sourced citations. Sri Lagna instead adds the Moon's precise traversed-nakshatra fraction × 360° to the birth Lagna. **Hora Lagna, Bhava Lagna and Sri Lagna were validated against a remembered deva.guru screenshot value and matched within 1–2 arcminutes** (consistent with imprecise recall of a screenshot read many turns earlier, not a formula error). **Ghatika Lagna and Vighatika Lagna's sourced formulas did NOT match that same recollection** (different rashi entirely) — since the recollection itself couldn't be re-verified, the sourced BPHS formula was kept rather than the uncertain memory, but these two are lower-confidence than the rest of this endpoint until validated against a fresh reference value.
**Arudha Padas formula:** for house H, `arudhaSign = 2×lordSign − houseSign` (mod 12) — i.e. count the sign-distance from house to its lord, then count that same distance again forward from the lord. Exception (BPHS): if the naive result lands on the source's own house (1st) or its 7th, shift forward 9 more signs from that naive (invalid) result — this correctly resolves to the source's 10th or 4th house respectively. Verified by hand-recomputation across all 12 houses of the reference chart, including 5 exception cases.
**Char Karakas:** classical 7-graha (Sapta Karaka) Parashari scheme only, ranked by raw degree-within-sign (no retrograde adjustment). `jotish.md` flags that deva.guru's own table appears to use an 8-karaka variant including Rahu with non-obvious role-label abbreviations (`PiK` vs `PK`) — that variant was not reproduced since it couldn't be confirmed from the screenshot alone; confirm the intended scheme with the interpretation-layer owner before this feeds any user-facing reading.
**Combustion orbs (direct/retrograde):** Moon 12°, Mars 17°, Mercury 14°/12°, Jupiter 11°, Venus 10°/8°, Saturn 15° — Surya Siddhanta ch. 9.
**Mean daily motions (°/day):** Surya 0.9856, Chandra 13.176, Mangal 0.524, Budha 1.383, Guru 0.0831, Shukra 1.602, Shani 0.0334 — standard published Vedic ephemeris reference values; `percentOfMean` swinging well above/below 100% (e.g. 240%+ for Jupiter) is expected/correct behavior for outer grahas, not a bug — their true geocentric speed varies far more than their mean around retrograde loops.

**Ayanamsha:** Lahiri-Chitrapaksha **TRUE** (Swiss Ephemeris `SE_SIDM_TRUE_CITRA` = 27, not the mean/fixed-precession `SE_SIDM_LAHIRI` = 1) — validated 2026-09-04 against a deva.guru reference chart (marie ange, 1980-10-24 01:41 Brussels): all 9 graha longitudes + ayanamsha matched to the arcsecond once switched from mean to true Chitrapaksha; mean Lahiri was off by a constant ~76″ on every graha.
**Vara (weekday):** Sunrise-anchored, not civil midnight — the Hindu day starts at sunrise, so a birth before that day's sunrise uses the *previous* day's weekday. Computed via `sweph.rise_trans` for the most recent sunrise at/before the birth moment. Confirmed against the same reference chart (birth 01:41, sunrise 07:19 → correct Vara is the previous day).
**Rahu/Ketu:** Mean node (not true node) — course default; Ketu is always exactly 180° from Rahu.
**Positions:** Apparent geocentric, light-time corrected (Swiss Ephemeris default) — not geometric.
**Houses:** Whole-sign only (house N = sign N signs after the lagna's sign) — never Placidus/Western cusps.

**Phase 2 status (see `knowledge/jotish.md` §4):** all pieces are now built — `/api/jyotish/dasha` (Vimshottari), `/api/jyotish/varga` (D2/D3/D7/D9/D10/D60), `/api/jyotish/ashtakavarga` (Sarva+Sapta), `/api/jyotish/panchanga` (standalone), plus special lagnas/Arudha Padas/Char Karakas/combustion/speed % on this endpoint (added 2026-09-07, see the fields above). **Reading primitives** (dignity, houseLords, grahaDrishti, mangalDosha, purusharthas, planetaryYogas) added 2026-09-07 so the app can run a Bani-style first chart reading without inventing house-lord / aspect / dignity math client-side. **Bani question-bank primitives** (`housesFromChandra`, `functionalNature`, `naisargikaKarakas`, `digbala`, `strengthHints`, `topicPacks`, `remedyHooks`, tithi lord/devata + nakshatra deity on the birth panchanga, Mangal doṣa cancellations, the `gender` input param) added 2026-09-07 — see the fields above. Only deliberate gaps: **Pranapada Lagna** (unverified formula) and **full Shadbala** (large separate strength model — `strengthHints` is a coarse composite, not Shadbala; use it + `/api/jyotish/ashtakavarga`'s SAV for now).

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/jyotish-chart.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "city": "Brussels",
    "country": "Belgium"
  }'
```

---

## POST `/api/jyotish/dasha`

**PHP:** `jyotish-dasha.php` ← **call this URL directly; `/api/jyotish/dasha` is the internal wrapper route, not a server-routed path**
**Added:** 2026-09-06
**Calculator:** `calculators/jyotish_dasha_calculator.js`
**Purpose:** Vimshottari Mahadasha/Antardasha/Pratyantardasha — Phase 2 of `knowledge/jotish.md`. Full 120-year, nine-graha time-lord cycle seeded from the Moon's nakshatra lord and exact nakshatra-elapsed fraction at birth (via `getMoonNakshatraAtBirth`, exported from `jyotish_chart_calculator.js` so both endpoints share one ayanamsha/JD engine — see `feedback_jyotish_ayanamsha_vara` memory).

**⚠️ Advanced feature, shipped ahead of the curriculum:** the Jyotish Level 1 course this API is built from does not cover dasha reading. Per the spec's own recommendation, the response carries an `advisory` field flagging this — raw periods only, no interpretation layer.

### Request Body

Same contract as `/api/jyotish/chart`, plus one optional field.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅ | `"YYYY-MM-DD"` |
| `birthTime` | string | ✅ | `"HH:MM"` or `"HH:MM:SS"` |
| `timezone` | string | ✅ | IANA tz (e.g. `"Europe/Brussels"`) |
| `latitude` | number | ✅ | Decimal degrees (negative = South) |
| `longitude` | number | ✅ | Decimal degrees (negative = West) |
| `name` | string | ➖ | For display only |
| `city` | string | ➖ | For display only |
| `country` | string | ➖ | For display only |
| `asOfDate` | string | ➖ | `"YYYY-MM-DD"` — which date's period to flag `isCurrent`/`current` (default: today) |

### Response Fields

| Field | Content |
|-------|---------|
| `advisory` | Fixed string flagging this as an advanced/uninterpreted feature (see above) |
| `seed` | `moonNakshatra`, `moonLongitude` (sidereal), `nakshatraLord` (the graha that seeds the first Mahadasha), `elapsedFraction` (0–1, precise fraction of that nakshatra already traversed at birth) |
| `asOfDate` | The date used to resolve `isCurrent`/`current` (echoes input or defaults to today) |
| `current` | `{ mahadasha, antardasha, pratyantardasha }` — the exact triple running on `asOfDate`, each with `graha`/`startDate`/`endDate` (pratyantardasha also carries `percentElapsed`) |
| `mahadashas` | Array of 9 objects spanning the full 120-year cycle from a "virtual start" (birth minus the elapsed portion of the first period). Each: `graha`, `grahaKey`, `startDate`, `endDate`, `years` (whole number, 6–20), `ageAtStartYears` (can be negative — years before birth), `isCurrent`, `percentElapsed`, `antardashas` (9 nested objects, same shape, each additionally carrying `pratyantardashas`: 9 more nested objects) |

**Sequence order:** Fixed regardless of starting graha — Ketu → Shukra → Surya → Chandra → Mangal → Rahu → Guru → Shani → Budha (7/20/6/10/7/18/16/19/17 years, sum 120). Antardashas within a Mahadasha (and Pratyantardashas within an Antardasha) always start with that period's own graha, then continue in this same fixed cyclic order; sub-period duration = parent years × (sub-graha years ÷ 120).
**Year length:** 365.25 days (Julian year) — a `/api/jyotish/dasha` boundary can land ±1 calendar day off a reference tool's boundary on multi-decade spans; this is an expected rounding artifact of the date-conversion convention, not a calculation error (confirmed: even the deva.guru reference table has the same day-level wobble within its own rows).
**Validated:** 2026-09-06 against the same deva.guru reference chart used for `/api/jyotish/chart` (marie ange, 1980-10-24 01:41 Brussels) — all 9 Mahadasha boundaries matched within ±1 day; the nested Antardasha/Pratyantardasha "current period" resolution was independently hand-verified against the day-count formula.

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/jyotish-dasha.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "city": "Brussels",
    "country": "Belgium",
    "asOfDate": "2026-09-06"
  }'
```

---

## POST `/api/jyotish/reference`

**PHP:** `jyotish-reference.php` ← **call this URL directly; `/api/jyotish/reference` is the internal wrapper route, not a server-routed path**
**Added:** 2026-09-07
**Calculator:** `calculators/jyotish_reference_calculator.js`
**Purpose:** Static Jyotish lookup data — completes the "Reference data (static JSON, not per-chart)" sub-deliverable of Phase 1 (`knowledge/jotish.md` §3) that was initially skipped when `/api/jyotish/chart` shipped. Not chart-specific; same response for every request.

### Request Body

None required — send `{}`.

### Response Fields

| Field | Content |
|-------|---------|
| `nakshatras` | Array of 27 objects: `number` (1–27), `name`, `lord`, `deity`, `symbol`, `degreeSpan` (always `13°20'00"`), `siderealStart`/`siderealEnd` (absolute sidereal degree range, D°M'S") |
| `grahaRelationships` | Object keyed by `surya, chandra, mangal, budha, guru, shukra, shani` (7 classical grahas only — see below). Each: `friends`, `neutral`, `enemies` arrays of graha names |

**Source:** classical Parashari Jyotish (Brihat Parashara Hora Shastra) — nakshatra deities/symbols and the 7-graha Naisargika Maitri (natural relationship) table are standard across traditional sources.
**Rahu/Ketu deliberately excluded from `grahaRelationships`:** BPHS's naisargika maitri table covers only the 7 classical grahas; Rahu/Ketu friend-enemy assignments vary by later/modern text and aren't fixed classical data — asserting one would risk presenting a school-specific opinion as fact.
**Asymmetry is intentional, not a bug:** e.g. Saturn lists Moon as an enemy, but Moon has no enemies at all (`chandra.enemies` is `[]`) — this is the correct classical result, not a data error.

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/jyotish-reference.php" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## POST `/api/jyotish/varga`

**PHP:** `jyotish-varga.php` ← **call this URL directly; `/api/jyotish/varga` is the internal wrapper route, not a server-routed path**
**Added:** 2026-09-07
**Calculator:** `calculators/jyotish_varga_calculator.js`
**Purpose:** Generic divisional-chart (varga) endpoint — `knowledge/jotish.md` §4. Reuses `/api/jyotish/chart`'s sidereal D1 positions internally (via `calculateJyotishChart`) rather than recomputing them, so it inherits the same ayanamsha/JD engine automatically. Each graha/lagna carries `houseLords` + `dignity` computed *within the varga chart itself*, and D9/D7/D10 each return a pre-assembled topic pack (`marriagePack`/`childrenPack`/`careerPack`).

### Request Body

Same contract as `/api/jyotish/chart`, plus one required field.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅ | `"YYYY-MM-DD"` |
| `birthTime` | string | ✅ | `"HH:MM"` or `"HH:MM:SS"` |
| `timezone` | string | ✅ | IANA tz |
| `latitude` | number | ✅ | Decimal degrees (negative = South) |
| `longitude` | number | ✅ | Decimal degrees (negative = West) |
| `division` | number | ✅ | One of `2` (Hora), `3` (Drekkana), `7` (Saptamsa), `9` (Navamsa), `10` (Dasamsa), `60` (Shashtiamsha) |
| `name`/`city`/`country` | string | ➖ | For display only |
| `gender` | string | ➖ | `"male"` \| `"female"` — selects the spouse karaka inside `marriagePack` (D9 only). Also accepted as `sex`. |

**Unsupported division** (anything other than the 6 above — D4, D12, D16 etc.) returns `{success:false, error:"Unsupported division ..."}` rather than a guessed result — deliberate, see below.

### Response Fields

| Field | Content |
|-------|---------|
| `division`, `divisionName` | Echoes the input, e.g. `9`, `"Navamsa (D9)"` |
| `vargaLagna` | `rashi`/`rashiEn`/`rashiIndex`/`rashiLord`, `d1Rashi`, `vargottama` (bool — D9 sign equals D1 sign; computed for every division, most meaningful for D9) |
| `houses` | Array of 12 whole-sign houses from `vargaLagna`, same shape as `/api/jyotish/chart`'s `houses` |
| `grahas` | Object keyed by the 9 grahas. Each: `rashi`/`rashiEn`/`rashiIndex`/`rashiLord`, `d1Rashi`/`d1RashiIndex`/`d1Degree`/`d1House` (the source D1 position, for reference), `house` (whole-sign house *within this varga*), `dignity` (same shape as `/api/jyotish/chart`'s `dignity[key]`, evaluated using the D1 degree-within-sign carried into the varga sign), `vargottama` |
| `dignity` | **Added 2026-09-07.** Same data as `grahas.*.dignity`, flattened to an object keyed by graha for convenience |
| `houseLords` | **Added 2026-09-07.** Array of 12, same shape as `/api/jyotish/chart`'s `houseLords` — but computed for *this varga's* houses/lord-placements, not D1's |
| `vargottamaSummary` | **Added 2026-09-07.** `lagna` (bool), `grahas` (array of graha keys that are Vargottama), `count` |
| `marriagePack` | **D9 only.** `house7` (with lord), `shukra`/`guru` (rashi, house, dignity, vargottama), `spouseKaraka` (whichever of the two `gender` selects — or a note + both if `gender` omitted), `seventhLord` |
| `childrenPack` | **D7 only.** `house5`/`house7` (with lords), `guru` (rashi, house, dignity, vargottama), `fifthLord` |
| `careerPack` | **D10 only.** `house10`/`house1` (with lords), `surya` (rashi, house, dignity, vargottama), `tenthLord` |

**Formulas (all sourced and cross-checked 2026-09-07 — see feedback memory):**
- **D2 Hora:** sign→2×15°. Odd sign: 1st half=Leo (Sun's hora), 2nd=Cancer (Moon's). Even sign: reversed.
- **D3 Drekkana:** sign→3×10°, same rule every sign (no odd/even split) — 1st part=own sign, 2nd=5th from it, 3rd=9th from it.
- **D7 Saptamsa:** sign→7×~4°17′ (30/7°). Odd sign: count starts from itself. Even sign: starts from the 7th sign from it (+6). Confirmed against an independent source.
- **D9 Navamsa:** sign→9×3°20′. Movable sign: count starts from itself. Fixed: starts 9th from it. Dual: starts 5th from it. (Cross-verified: Vargottama — D9 sign equals D1 sign — falls out of the general formula at exactly the classically-expected pada per modality: 1st pada for movable, 5th for fixed, 9th for dual, without being hardcoded.)
- **D10 Dasamsa:** sign→10×3°. Odd sign: starts from itself. Even sign: starts 9th from it. Confirmed against two independent worked examples (Moon 5°10′ Aries→Taurus; Sun 17°30′ Taurus→Gemini) — both matched exactly.
- **D60 Shashtiamsha:** sign→60×0°30′. Odd sign: starts from itself. Even sign: starts 7th from it. **Deity names deliberately omitted** — BPHS, Jataka Tattva and Sarvartha Chintamani disagree on several of the 60 traditional names; only the sign-mapping (which all sources agreed on) is returned.
- **Not supported:** D4, D12, D16, D20, D24, D27, D30, D40, D45, D81 etc. — omitted rather than guessed at; several have genuine classical-text disagreement on the exact formula (D60's own forum history shows this even for one of the vargas `jotish.md` explicitly names). Add on request once a specific formula is sourced and cross-checked the same way.

**Dignity note:** varga dignity is evaluated using the graha's D1 degree-within-sign carried into the varga sign (a synthetic position, since a varga chart has no independent sub-degree of its own) — this places the graha correctly for sign-level dignity (own/exalt/moolatrikona/debilitated bands that depend on degree), which is standard practice, but treat degree-sensitive readings inside a varga with appropriate caution.

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/jyotish-varga.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "division": 9,
    "city": "Brussels",
    "country": "Belgium",
    "gender": "female"
  }'
```

---

## POST `/api/jyotish/ashtakavarga`

**PHP:** `jyotish-ashtakavarga.php` ← **call this URL directly; `/api/jyotish/ashtakavarga` is the internal wrapper route, not a server-routed path**
**Added:** 2026-09-07
**Calculator:** `calculators/jyotish_ashtakavarga_calculator.js`
**Purpose:** Classical BPHS Ashtakavarga — Sarva (combined) and Sapta (per-graha) bindu point tables. `knowledge/jotish.md` §4. Reuses `/api/jyotish/chart` for sidereal positions.

### Request Body

Same contract as `/api/jyotish/chart` — no new inputs.

| Field | Type | Required |
|-------|------|----------|
| `birthDate`, `birthTime`, `timezone`, `latitude`, `longitude` | — | ✅ |
| `name`, `city`, `country` | — | ➖ |

### Response Fields

| Field | Content |
|-------|---------|
| `sarvaAshtakavarga` | `total` (classically always **337** across any chart), `signs` — array of 12: `rashi`/`rashiEn`/`bindus` (sum of all 7 grahas' Bhinnashtakavarga per sign) |
| `bhinnashtakavarga` | Object keyed by `surya, chandra, mangal, budha, guru, shukra, shani` (the 7 classical grahas — **Rahu/Ketu are not part of classical Ashtakavarga**). Each: `name`, `total` (published constant: 48/49/39/54/56/52/39 respectively), `expectedTotal` (same value, included as a self-check — should always equal `total`), `signs` (array of 12: `rashi`/`rashiEn`/`bindus`, 0–8 range) |

**How it works:** for each graha's own Bhinnashtakavarga, each of the 8 contributors (7 grahas + Lagna) "votes" a bindu into specific houses counted from wherever that contributor sits in the natal chart (a fixed classical table per contributor, not chart-dependent). Sarva = sum of all 7 Bhinnashtakavarga tables per sign.
**Data provenance:** the 7 contributor-house tables (56 contributor/owner combinations) were sourced 2026-09-07 and checksum-verified before use — every graha's 8 contributor-rows summed to exactly its published total bindu count (48/49/39/54/56/52/39, totaling 337), which is very unlikely for a table with a transcription error. Verified live: `sarvaAshtakavarga.total` and every `bhinnashtakavarga.*.total` matched their expected constants exactly.

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/jyotish-ashtakavarga.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517
  }'
```

---

## POST `/api/jyotish/panchanga`

**PHP:** `jyotish-panchanga.php` ← **call this URL directly; `/api/jyotish/panchanga` is the internal wrapper route, not a server-routed path**
**Added:** 2026-09-07
**Calculator:** `calculators/jyotish_panchanga_calculator.js`
**Purpose:** Date + location panchanga — no birth chart. `knowledge/jotish.md` §4: "this is what powers deva.guru's top-nav 'Panchang' tool." Reuses the exact same `computePanchanga`/`computeVaraWeekday` logic as `/api/jyotish/chart`'s panchanga block, exported for this purpose — same tithi/vara/nakshatra/yoga/karana math (including the 2026-09-07 tithi lord/devata and nakshatra deity/symbol enrichment, via the shared `jyotish_bani_primitives.js` module), just anchored to an arbitrary instant instead of a birth moment.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | string | ✅ | `"YYYY-MM-DD"` |
| `time` | string | ➖ | `"HH:MM"` — if omitted, defaults to **that date's sunrise** at the given location (the traditional Panchang anchor) |
| `timezone` | string | ✅ | IANA tz |
| `latitude` | number | ✅ | Decimal degrees (negative = South) |
| `longitude` | number | ✅ | Decimal degrees (negative = West) |

### Response Fields

| Field | Content |
|-------|---------|
| `date`, `location` | Echoes input |
| `anchor` | `"sunrise"` (default) or `"time"` (explicit instant requested) |
| `instantLocalTime` | The exact local instant the panchanga was computed for |
| `panchanga` | Same shape as `/api/jyotish/chart`'s `panchanga` field: `tithi` (incl. `lord`/`lordKey`/`devata`/`tithiInPaksha`/`isRikta`/`isAmavasya`/`isPurnima`/`isInauspicious`), `vara`, `nakshatra` (incl. `deity`/`symbol`), `yoga`, `karana` |

**Note:** uses a simpler timezone conversion (`moment-timezone` directly) than the birth-chart endpoints' `HistoricalTimezoneHandler` — appropriate for a lightweight "any date/place" lookup, but expect nakshatra `percentRemaining` to differ by a fraction of a percent from `/api/jyotish/chart`'s value for the exact same date/time/location (confirmed ~0.16% difference in testing — a few minutes of JD precision, not a formula error).

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/jyotish-panchanga.php" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-09-07",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517
  }'
```

---

## POST `/api/hd/chart`

**PHP:** `hd-chart.php` ← **call this URL directly; `/api/hd/chart` is the internal wrapper route, not a server-routed path**
**Added:** 2026-03-08
**Calculator:** `calculators/hd_calculator.js`
**Purpose:** Full Human Design bodygraph — type, authority, profile, definition, centers, channels, gates, and all 26 activations (13 personality + 13 design). Based on 13-planet system with exact design JD (Newton-iterated 88° Sun arc).

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅ | `"YYYY-MM-DD"` |
| `birthTime` | string | ✅ | `"HH:MM"` or `"HH:MM:SS"` |
| `timezone` | string | ✅ | IANA tz (e.g. `"Europe/Brussels"`) |
| `latitude` | number | ✅ | Decimal degrees (negative = South) |
| `longitude` | number | ✅ | Decimal degrees (negative = West) |
| `name` | string | ➖ | Display name |
| `username` | string | ➖ | Load birth data from DB instead of providing coords |

### Response Fields

| Field | Content |
|-------|---------|
| `type` | `"Generator"`, `"Manifesting Generator"`, `"Projector"`, `"Manifestor"`, `"Reflector"` |
| `typeFr` | French type name |
| `strategy` | e.g. `"To Respond"` |
| `notSelfTheme` | e.g. `"Frustration"` |
| `signature` | e.g. `"Satisfaction"` |
| `authority` | e.g. `"Sacral"` |
| `authorityDescription` | EN description |
| `authorityDescriptionFr` | FR description |
| `profile` | e.g. `"5/1"` |
| `profileLine1` | Conscious line (1–6) |
| `profileLine2` | Unconscious line (1–6) |
| `profileMeaning` | e.g. `"Heretic/Investigator"` |
| `definition` | `"Single"`, `"Split"`, `"Triple Split"`, `"Quadruple Split"` |
| `incarnationCross.name` | e.g. `"Left Angle Cross of Wishes 2"` |
| `incarnationCross.type` | `"Right Angle"`, `"Left Angle"`, `"Juxtaposition"` |
| `incarnationCross.gates` | `{personalitySun, personalityEarth, designSun, designEarth}` |
| `centers.defined` | Array of defined center names |
| `centers.undefined` | Array of undefined center names |
| `channels.defined` | Array of `{channel, name, nameFr, centers, kind}` |
| `gates.personality` | Array of gate numbers (conscious) |
| `gates.design` | Array of gate numbers (unconscious) |
| `gates.mixed` | Gates active in both |
| `gates.all` | All unique gate numbers |
| `activations` | 26 objects: `{planet, kind, gate, line, center, label}` |
| `designJD` | Julian day of design moment |
| `personalitySun` | Natal Sun longitude |
| `designSun` | Design Sun longitude (88° before natal) |
| `birthInfo` | `{dateISO, localTime, timezone, isDST, utcDateTime, latitude, longitude}` |

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/hd-chart.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41:00",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517
  }'
```

### Example Response (ma1)

```json
{
  "success": true,
  "type": "Generator",
  "typeFr": "Générateur",
  "strategy": "To Respond",
  "notSelfTheme": "Frustration",
  "signature": "Satisfaction",
  "authority": "Sacral",
  "profile": "5/1",
  "profileMeaning": "Heretic/Investigator",
  "definition": "Split Definition",
  "incarnationCross": {
    "name": "Left Angle Cross of Wishes 2",
    "type": "Left Angle",
    "gates": { "personalitySun": 50, "personalityEarth": 3, "designSun": 31, "designEarth": 41 }
  },
  "centers": {
    "defined": ["Throat", "G", "Sacral", "Spleen", "Root"],
    "undefined": ["Head", "Ajna", "Heart", "Solar Plexus"]
  },
  "channels": {
    "defined": [
      { "channel": "7-31", "name": "The Alpha", "nameFr": "L'Alpha", "kind": "Mixed" },
      { "channel": "18-58", "name": "Judgment", "nameFr": "Jugement", "kind": "Design" },
      { "channel": "27-50", "name": "Preservation", "nameFr": "Préservation", "kind": "Personality" }
    ]
  }
}
```

---

## POST `/api/hd/type`

**Purpose:** Returns HD type + strategy only (lightweight sub-endpoint).

Same request body as `/api/hd/chart`.

**Response:**
```json
{ "success": true, "type": "Generator", "typeFr": "Générateur", "strategy": "To Respond", "notSelfTheme": "Frustration", "signature": "Satisfaction" }
```

---

## POST `/api/hd/authority`

**Purpose:** Returns HD inner authority + bilingual description.

Same request body as `/api/hd/chart`.

**Response:**
```json
{ "success": true, "authority": "Sacral", "authorityDescription": "Respond with gut sounds...", "authorityDescriptionFr": "Répondre depuis le ventre sacral..." }
```

---

## POST `/api/hd/centers`

**Purpose:** Returns defined and undefined centers + defined channels list.

Same request body as `/api/hd/chart`.

**Response:**
```json
{ "success": true, "defined": ["Throat","G","Sacral","Spleen","Root"], "undefined": ["Head","Ajna","Heart","Solar Plexus"], "channels": ["7-31 The Alpha","18-58 Judgment","27-50 Preservation"] }
```

---

## POST `/api/hd/profile`

**Purpose:** Returns incarnation profile + cross.

Same request body as `/api/hd/chart`.

**Response:**
```json
{ "success": true, "profile": "5/1", "conscious": 5, "unconscious": 1, "meaning": "Heretic/Investigator", "incarnationCross": { "name": "Left Angle Cross of Wishes 2", "type": "Left Angle", "gates": { "personalitySun": 50, "personalityEarth": 3, "designSun": 31, "designEarth": 41 } } }
```

---

## POST `/api/toctoc`

**Added:** 2026-03-11  
**Calculator:** `calculators/toctoc_calculator.js`  
**Purpose:** Life events scanner — scans birth to age 80 and detects ALL significant astrological events, scored by intensity. Designed for push-notification app concept.

**Related:** For the same scan with **whole-sign house** enrichment, Roman house colors, exploded multi-hit transits, merged ZR, and month grouping, use **`POST /api/toctoc-app`** ([§ toctoc-app](#post-apitoctoc-app)).

### Scoring System

| Score | Label | Triggers |
|-------|-------|----------|
| 3 | toc toc toc | ZR L2 peak, Pluto/Uranus/Neptune hard aspect to natal, North/South Node conjunct natal planet |
| 2 | toc toc | ZR L3 peak, Saturn/Jupiter hard aspect to natal planet |
| 1 | toc | Mercury/Venus/Mars station conjunct natal point (≤2°), Eclipse conjunct natal point (≤10°) |

**Intensity scoring (boudin size / display):** Each event has `intensityScore` — a numeric value so conjunction &gt; opposition &gt; square &gt; trine, and VIP (outer→personal planet) or A-List (→ASC/MC) boosts it.

| Aspect | Strength | Sign |
|--------|----------|------|
| Conjunction | 1.0 (strongest) | + (flow) |
| Opposition | 0.9 | − (challenging) |
| Square | 0.75 | − (challenging) |
| Trine | 0.5 | + (flow) |

Planet base weights: Pluto/Uranus/Neptune/Nodes = 30, Saturn = 20, Jupiter = 15. VIP transit ×1.5, A-List ×1.3. Use `event.intensityScore` (absolute value) for boudin size; show score + label on click.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅ | `"YYYY-MM-DD"` |
| `birthTime` | string | ✅ | `"HH:MM"` |
| `timezone` | string | ✅ | IANA tz (e.g. `"Europe/Brussels"`) |
| `latitude` | number | ✅ | Decimal degrees |
| `longitude` | number | ✅ | Decimal degrees |
| `username` | string | ➖ | Load birth data from DB instead |

### Response Fields

| Field | Content |
|-------|---------|
| `person` | `{name, birthDate, birthTime, city, timezone}` |
| `natalPoints` | Map of natal planet/angle → `{longitude, sign, degree}` |
| `summary.past` | `{toc, tocToc, tocTocToc}` counts from birth to today |
| `summary.future` | `{toc, tocToc, tocTocToc}` counts from today to age 80 |
| `summary.total` | Combined counts |
| `timeline.decades` | `{"0-10": {toc, tocToc, tocTocToc}, "10-20": {...}, ...}` |
| `totalEvents` | Total number of events |
| `events[]` | Array of all events, sorted chronologically |
| `computeTimeSeconds` | Calculation time |

### Event Object

```json
{
  "date": "2024-02-14",
  "endDate": "2024-12-21",
  "score": 3,
  "label": "toc toc toc",
  "category": "transit",
  "type": "Pluto square natal Sun",
  "transitPlanet": "Pluto",
  "natalPoint": "Sun",
  "aspect": "square",
  "exactDates": ["2024-02-14", "2024-07-27", "2024-12-21"],
  "pattern": "Direct-Retrograde-Direct",
  "bestOrb": 0.001,
  "intensityScore": 45,
  "isPast": true,
  "age": 43.3
}
```

**Event categories:** `transit`, `zr`, `station`, `eclipse`
**Patterns:** `Single`, `Direct-Retrograde`, `Retrograde-Direct`, `Direct-Retrograde-Direct`, `Nodal`

### Display: three sizes (boudins) + score on click

You can represent intensity with **three sizes** and show the scoring on click:

| Source | Use for |
|--------|--------|
| `events[].score` | **Size:** `1` → small, `2` → medium, `3` → large (e.g. boudins/pills/bubbles) |
| `events[].label` | **Label:** `"toc"`, `"toc toc"`, `"toc toc toc"` |
| `summary.past` / `summary.future` | `{ toc, tocToc, tocTocToc }` — counts per level (e.g. legend or totals) |
| `timeline.decades` | Per-decade counts `{ toc, tocToc, tocTocToc }` for decade strips |

**On click** (per event), show at least:
- **Score:** `event.score` (1, 2, or 3)
- **Label:** `event.label` (toc / toc toc / toc toc toc)
- **Description:** `event.type` (e.g. "Uranus square natal Venus")
- **Dates:** `event.date`, `event.endDate`, and if present `event.exactDates[]`
- **Category:** `event.category` (`transit`, `zr`, `station`, `eclipse`)

Optional: show `event.forecastingPeriod` for ZR events, `event.pattern` for transits.

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/toctoc.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517
  }'
```

---

## POST `/api/toctoc-app`

**Added:** 2026-03-21  
**PHP:** `toctoc-app.php`  
**Calculator:** `calculators/toctoc_app_calculator.js`  
**Purpose:** Runs the same TocToc lifetime scan as `/api/toctoc`, then reshapes events into **sausage** objects for a mobile timeline: length = date range, width = score band (`thin` / `medium` / `large`), colors from a fixed **12-house palette** (Roman I–XII), plus structured detail for taps.

### House system (this endpoint only)

**Whole sign houses (WSH)** are used for all enrichment: house 1 = the entire zodiac sign of the Ascendant, house 2 = the next sign, and so on. Traditional rulership uses those WSH cusp signs. This is **not** Placidus — it matches ZR period-sign and eclipse whole-sign logic.

Core `/api/toctoc` event geometry is unchanged; only this endpoint’s `natalContext` and sausage `topics` use WSH.

### Request body

Same as `/api/toctoc`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate`, `birthTime`, `timezone`, `latitude`, `longitude` | | ✅ | Birth data |
| `username` | string | optional | DB lookup (alternative to coordinates) |
| `_scanStartDate`, `_scanEndDate` | `YYYY-MM-DD` | optional | Narrow scan window (faster tests / year focus) |

Supports **`POST /api/toctoc-app/:username`** (username in path) like other username routes.

### Response (`data` payload)

Top-level fields:

| Field | Description |
|-------|-------------|
| `success` | `true` |
| `person` | Same as `/api/toctoc` |
| `natalContext` | Map per planet/angle: `houseLocated`, `housesRuled`, `topics[]` (each topic: `house`, `topic`, `color`, `source`) — **WSH** |
| `houseColors` | `1`…`12` → hex (Roman I–XII palette) |
| `houseTopics` | `1`…`12` → short English labels (identity, money, …) |
| `allSausages` | Flat list, sorted by `startDate` |
| `months` | Key `YYYY-MM` → `{ sausages[], monthScore, transitScore, zrScore }` — sausages whose **start** falls in that month |
| `cycles` | Map keyed by `groupId` (e.g. `Pluto_square_Moon`): `transitPlanet`, `natalPoint`, `aspect`, `totalHits`, `hits[]` |
| `totalSausages`, `computeTimeSeconds` | Count and timing |

### Sausage object (each item in `allSausages` / `months[*].sausages`)

| Field | Notes |
|-------|--------|
| `id`, `groupId`, `category` | `transit` \| `eclipse` \| `zr` \| `station` |
| `startDate`, `endDate` | Transit: per-hit window around parile when exploded; ZR: peak period; eclipse/station: event date (stations may use extended window in app) |
| `width` | `thin` (score 1), `medium` (2), `large` (3–4) |
| `label`, `color`, `score`, `intensityScore`, `aspect` | Display + weight |
| `transitPlanet`, `natalPoint` | When applicable |
| `natalHouse`, `natalHouseColor`, `ruledHouses`, `topics` | From `natalContext` (WSH + traditional rulers) |
| `cycle` | Transits only: `hitNumber`, `totalHits`, `pattern`, `allHits[]` — multi-pass transits are **split into one sausage per hit** |
| `eclipseAxis`, `eclipseSign`, `eclipseHouses`, `eclipseHouseColors` | Eclipses: WSH axis houses + natal point ruler houses in `topics` |
| `lotType` | ZR: string or **array** when Fortune+Eros+… merged for same period |
| `level`, `periodSign`, `periodHouse` | ZR peaks |
| `stationType` | `SR` / `SD` for stations |
| `lifetimeNumber`, `lifetimeTotal` | Nth occurrence / total for this exact transit or eclipse series in 100-year scan |
| `planetNatalHistory` | Transit: array of `{aspect, cycleCount}` — all aspect types this planet makes to this natal point |
| `planetNatalTotalCycles` | Transit: total distinct cycles from this planet to this natal point (all aspects combined) |
| `planetVipContactCount` | Transit: total distinct cycles from this planet to ANY VIP natal point |
| `isMultiHitCycle` | Transit: `true` if retrograde multi-pass cycle (2+ exact dates) |
| `allPeriods` | ZR/Station: array of `{date, endDate, lifetimeNumber}` — all occurrences of this lot+level+sign (or planet+type+natal) in the 100-year scan, sorted chronologically. Use to show "Jan 2019, Mar 1998, Nov 1987…" in the detail panel. |
| `isExactAspect`, `orb` | Eclipse: exact (orb ≤ 1°) flag + orb degrees |
| `eclipseSeriesAllAxisDates` | Eclipse: all eclipses on this axis in the series (natal + non-natal) |
| `seriesHitNumber`, `seriesTotalHits` | Eclipse: position within the natal-touching eclipses of this series |

### Example

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/toctoc-app.php" \
  -H "Content-Type: application/json" \
  -d '{"username":"ma1"}'
```

---

## POST `/api/toctoc-app-short`

**Added:** 2026-03-25
**PHP:** `toctoc-app-short.php`
**Calculator:** `calculators/toctoc_app_short_calculator.js`
**Purpose:** Lightweight version of `/api/toctoc-app` optimized for timeline rendering. Returns **only the fields needed to draw boudins** (sausages) — detail data is fetched on-demand via `/api/toctoc-boudin-detail`. Response is ~475 KB vs ~11 MB for the full version (**24x smaller**).

### Request body

Same as `/api/toctoc-app`.

### Response (`data` payload)

| Field | Description |
|-------|-------------|
| `success` | `true` |
| `person` | Same as `/api/toctoc` |
| `houseColors` | `1`…`12` → hex (static palette) |
| `boudins` | Flat list of short boudin objects, sorted by start date |
| `total` | Count of boudins |
| `computeTimeSeconds` | Timing |

### Short boudin object (each item in `boudins[]`)

| Field | Full name | Description |
|-------|-----------|-------------|
| `id` | id | Unique boudin ID (use for boudin-detail lookup) |
| `cat` | category | `transit` \| `zr` \| `eclipse` \| `station` |
| `s` | startDate | `YYYY-MM-DD` |
| `e` | endDate | `YYYY-MM-DD` |
| `sc` | score | 1–4 (toc intensity) |
| `w` | width | `thin` (1), `medium` (2), `large` (3–4) |
| `col` | color | Hex color for the boudin |
| `lbl` | label | Display text |
| `gid` | groupId | Links transit cycle hits (same planet+aspect+natal) |
| `asp` | aspect | `conjunction` / `square` / `opposition` / `trine` / `sextile` |
| `tp` | transitPlanet | Planet name (transit/station) |
| `np` | natalPoint | Natal point name |
| `tc` | topicColors | Array of hex colors for house dots on the boudin |
| `nh` | natalHouse | House number (transit/station) |
| `nhc` | natalHouseColor | Hex color of natal house |
| `cyc` | cycle | Transit only: `{ h: hitNumber, t: totalHits }` |
| `lotType` | lotType | ZR: array of unique lot names |
| `lvl` | level | ZR: 2 or 3 |
| `pSign` | periodSign | ZR: zodiac sign |
| `pH` | periodHouse | ZR: house number |
| `markers` | markers | ZR: `["LB"]`, `["Cu"]`, `["pre-LB"]` |
| `eType` | eclipseType | Eclipse: `solar` / `lunar` |
| `eSign` | eclipseSign | Eclipse: zodiac sign |
| `eHouses` | eclipseHouses | Eclipse: axis house numbers |
| `stType` | stationType | Station: `SR` / `SD` |
| `past` | isPast | `true` if before today |

Fields are **omitted when null/false/empty** to minimize payload.

### Example

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/toctoc-app-short.php" \
  -H "Content-Type: application/json" \
  -d '{"username":"ma1"}'
```

---

## POST `/api/toctoc-sausage-html`

**Added:** 2026-03-22
**PHP:** `toctoc-sausage-html.php`
**Calculator:** `calculators/toctoc_sausage_html_calculator.js`
**Purpose:** Returns the full TocToc App sausage data plus a pre-rendered interactive HTML timeline with fixed left ruler, clickable detail panels, and NOW line.

### Two modes

| Mode | URL |
|------|-----|
| JSON (default) | `POST https://ai.zebrapad.io/full-suite-spiritual-api/toctoc-sausage-html.php` |
| Raw HTML | `POST https://ai.zebrapad.io/full-suite-spiritual-api/toctoc-sausage-html.php?format=html` |

### Request body

Same as `/api/toctoc-app`, plus optional fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate`, `birthTime`, `timezone`, `latitude`, `longitude` | | ✅ | Birth data |
| `username` | string | optional | DB lookup |
| `date` | `YYYY-MM-DD` | optional | NOW line position (default: today) |
| `startYear` | number | optional | First year in timeline (default: birth year) |
| `endYear` | number | optional | Last year in timeline (default: birth+100) |
| `title` | string | optional | Custom page title |
| `scrollToNow` | boolean | optional | Auto-scroll to NOW (default: true) |
| `_scanStartDate`, `_scanEndDate` | `YYYY-MM-DD` | optional | Narrow scan window |

### Response (JSON mode)

```json
{
  "success": true,
  "html": "<html>...</html>",
  "totalSausages": 2396,
  "computeTimeSeconds": 74.7
}
```

### Response (HTML mode, `?format=html`)

Returns the raw HTML with `Content-Type: text/html` — open directly in a browser.

### Examples

```bash
# JSON mode
curl -s -X POST "https://ai.zebrapad.io/full-suite-spiritual-api/toctoc-sausage-html.php" \
  -H "Content-Type: application/json" \
  -d '{"username":"ma1","date":"2026-03-21"}'

# HTML mode — save to file
curl -s -X POST "https://ai.zebrapad.io/full-suite-spiritual-api/toctoc-sausage-html.php?format=html" \
  -H "Content-Type: application/json" \
  -d '{"username":"ma1","_scanStartDate":"2026-01-01","_scanEndDate":"2026-12-31","date":"2026-06-15"}' \
  -o timeline.html
```

> **Note:** A full birth→100y run takes ~1–2 minutes and returns a multi-MB payload. Use `_scanStartDate`/`_scanEndDate` for faster tests.

---

## POST `/api/toctoc-timeline`

**PHP:** `toctoc-timeline.php`
**Calculator:** `calculators/toctoc_timeline_calculator.js`

Converts the full TocToc lifetime event scan into a **year-by-year, month-by-month cumulative intensity score** timeline. Designed for push-notification apps and lifetime "mountain range" visualizations.

**Timeline range:** birthdate → today + 5 years (transit scan limit).

Internally calls `/api/toctoc` and distributes each event's score across the months it covers.

---

### When to call this endpoint

Call `/api/toctoc-timeline` when you need:
- A **lifetime overview chart** (mountain range / bar chart) of astrological intensity
- To know **which years and months are most activated** in someone's life
- **Average positive / negative months per year** statistics
- To populate a mobile app timeline or push notification system

Do NOT call this for real-time transits — use `/api/transits-exact` or `/api/transit-cycles` for that. This endpoint is slow (~30 s compute) and should be cached per person.

---

### Scoring Rules

#### ZR Scores (Zodiacal Releasing — all 3 lots: Fortune, Spirit, Eros)

Each ZR period sign receives a base score modified by two factors:

| ZR Level | Base score |
|----------|-----------|
| L2 peak  | 60        |
| L3 peak  | 20        |

**Factor 1 — Angularity from Lot of Fortune** (Whole Sign houses):

| Position from Fortune | Coefficient |
|-----------------------|-------------|
| 1st sign (Fortune itself) | ×1.5 |
| 4th, 7th, 10th (angular) | ×1.3 |
| 2nd, 5th, 8th, 11th (succedent) | ×1.0 |
| 3rd, 6th, 9th, 12th (cadent) | ×0.7 |

**Factor 2 — Natal planet in period sign or at hard angle:**

| Condition | Modifier |
|-----------|---------|
| Natal Jupiter in period sign | ×1.4 |
| Natal Venus in period sign | ×1.3 |
| Natal Saturn in period sign | ×0.65 |
| Natal Mars in period sign | ×0.75 |
| Natal Jupiter square/opp period sign | ×1.10 |
| Natal Venus square/opp period sign | ×1.05 |
| Natal Saturn square/opp period sign | ×0.85 |
| Natal Mars square/opp period sign | ×0.90 |

Factors are **multiplicative**. Example: period sign containing natal Jupiter AND square to natal Saturn → `60 × 1.4 × 0.85 = 71` (positive but reduced). Both the benefic boost and the malefic drag are applied — the net sign tells you the quality.

Multiple ZR lots active simultaneously **stack additively**.

#### Transit Scores

| Aspect | Score |
|--------|-------|
| Conjunction | +planet weight |
| Trine (120°) | +planet weight |
| Square / Opposition | −planet weight |

**Planet weights:** Pluto=15, Neptune=12, Uranus=12, Saturn=8, Jupiter=6, Node=4

#### Eclipse & Station Scores

| Event | Score |
|-------|-------|
| Eclipse conjunct natal planet | +60 (same as ZR L2 — major activation) |
| Slow-planet station conjunct natal | +2 |

---

### Parameters

Same as `/api/toctoc`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅ | `YYYY-MM-DD` |
| `birthTime` | string | ✅ | `HH:MM` (local time) |
| `latitude` | number | ✅ | Birth latitude |
| `longitude` | number | ✅ | Birth longitude |
| `timezone` | string | ✅ | IANA timezone |
| `username` | string | — | DB lookup alternative to birth fields |

---

### Response Structure

```json
{
  "success": true,
  "person": {
    "birthDate": "1980-10-24",
    "birthTime": "01:41"
  },

  "fortuneInfo": {
    "sign": "Aquarius",
    "signIndex": 10,
    "isDayChart": false,
    "angularSigns": ["Aquarius", "Taurus", "Leo", "Scorpio"],
    "natalSigns": {
      "jupiter": "Virgo",
      "venus": "Virgo",
      "mars": "Sagittarius",
      "saturn": "Libra"
    }
  },

  "scoreConfig": {
    "zrL2PeakScore": 60,
    "zrL3PeakScore": 20,
    "eclipseWeight": 60,
    "planetWeights": { "Pluto": 15, "Neptune": 12, "Uranus": 12, "Saturn": 8, "Jupiter": 6, "Node": 4 }
  },

  "summary": {
    "peakYears": [
      { "year": 2007, "age": 27, "peakMonthScore": 590, "peakMonth": "2007-07" }
    ],
    "bestAverageYears": [
      { "year": 2007, "age": 27, "avgMonthScore": 291.2 }
    ],
    "challengingYears": [
      { "year": 2025, "age": 45, "avgMonthScore": 18.3 }
    ],
    "overallAverage": 151.2,
    "statistics": {
      "scannedYears": 52,
      "scannedMonths": 606,
      "avgPositiveMonthsPerYear": 10.9,
      "avgNegativeMonthsPerYear": 0.5,
      "avgNeutralMonthsPerYear": 0.3,
      "avgPositiveScorePerYear": 1801,
      "avgNegativeScorePerYear": -7,
      "pctPositiveMonths": 93.2,
      "pctNegativeMonths": 4.5
    }
  },

  "yearlyTimeline": [
    {
      "year": 1980,
      "age": 0,
      "peakMonthScore": 80,
      "peakMonth": "1980-11",
      "avgMonthScore": 24.2,
      "sumScore": 291,
      "positiveMonths": 2,
      "negativeMonths": 0,
      "neutralMonths": 1,
      "sumPositive": 291,
      "sumNegative": 0,
      "months": [
        {
          "month": "1980-10",
          "age": 0.0,
          "isPast": true,
          "zrScore": 60,
          "transitScore": 15,
          "totalScore": 75,
          "topEvents": [
            { "label": "ZR L2 Peak — Aquarius (Fortune)", "score": 90, "category": "zr" },
            { "label": "Pluto conjunction natal Sun", "score": 15, "category": "transit" }
          ]
        }
      ]
    }
  ],

  "toctocSummary": {
    "past": { "toc": 106, "tocToc": 428, "tocTocToc": 173 },
    "future": { "toc": 12, "tocToc": 48, "tocTocToc": 19 }
  },

  "computeTimeSeconds": 28.5
}
```

---

### Key Response Fields Explained

| Field | What it tells you |
|-------|------------------|
| `fortuneInfo.sign` | Lot of Fortune sign — determines "angular" ZR power positions |
| `fortuneInfo.angularSigns` | The 4 signs that get ×1.3–1.5 ZR bonus (1st, 4th, 7th, 10th from Fortune) |
| `fortuneInfo.natalSigns` | Which sign each key planet occupies (used for ZR modifiers) |
| `fortuneInfo.isDayChart` | Whether Sun is above horizon at birth |
| `summary.statistics` | Average +/− months per year, % positive — use to characterize the person's overall "fortune level" |
| `summary.peakYears` | Top 3 years by single-month peak score |
| `summary.bestAverageYears` | Top 3 years by average monthly score (sustained intensity) |
| `summary.challengingYears` | Bottom 3 years by average monthly score (among years with real data) |
| `yearlyTimeline[].positiveMonths` | Count of months where totalScore > 0 in that year |
| `yearlyTimeline[].negativeMonths` | Count of months where totalScore < 0 in that year |
| `yearlyTimeline[].sumPositive` | Sum of all positive scores in that year |
| `yearlyTimeline[].sumNegative` | Sum of all negative scores in that year (negative number) |
| `yearlyTimeline[].months[].isPast` | `true` if month is before today |
| `yearlyTimeline[].months[].topEvents` | Up to 3 highest-scoring events in that month with label + score |
| `toctocSummary` | Count of toc / toc-toc / toc-toc-toc events past and future |

---

### Notes

- Timeline covers **birthdate → today + 5 years** (~52 years / 606 months for a 1980 birth)
- `yearlyTimeline` contains one entry per year; each year embeds its `months[]` array
- `challengingYears` only includes years that have actual event data (excludes zero-score future years)
- Compute time is ~25–35 s (Swiss Ephemeris scan). Cache the result per person.
- ZR periods from all 3 lots (Fortune, Spirit, Eros) stack additively — a month with 3 simultaneous L2 peaks can reach score 500+

---

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/toctoc-timeline.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517
  }'
```

---

## POST `/api/toctoc-year`

**Added:** 2026-03-12
**PHP:** `toctoc-year.php`
**Calculator:** `calculators/toctoc_year_calculator.js`

**Compact 3-year intensity timeline** — the fast version of `/api/toctoc-timeline`.

Covers exactly **Jan 1 of (currentYear−1) → Dec 31 of (currentYear+1)** (36 months, rolling window).  
Compute time: ~2–4 s (vs ~30 s for the full lifetime timeline).

### When to call this endpoint vs toctoc-timeline

| Use case | Endpoint |
|----------|---------|
| Dashboard "current period" widget | `/api/toctoc-year` ✅ |
| Push notification "next ping" | `/api/toctoc-year` ✅ |
| Lifetime mountain-range chart | `/api/toctoc-timeline` |
| Peak year identification (full life) | `/api/toctoc-timeline` |

### Parameters

Same as `/api/toctoc` and `/api/toctoc-timeline`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅ | `YYYY-MM-DD` |
| `birthTime` | string | ✅ | `HH:MM` |
| `latitude` | number | ✅ | Birth latitude |
| `longitude` | number | ✅ | Birth longitude |
| `timezone` | string | ✅ | IANA timezone |
| `username` | string | — | DB lookup alternative |

### Response Structure

```json
{
  "success": true,
  "person": { "birthDate": "1980-10-24", "birthTime": "01:41" },

  "window": {
    "startDate": "2025-01-01",
    "endDate": "2027-12-31",
    "years": [2025, 2026, 2027],
    "monthCount": 36
  },

  "fortuneInfo": {
    "sign": "Aquarius",
    "signIndex": 10,
    "isDayChart": false,
    "angularSigns": ["Aquarius", "Taurus", "Leo", "Scorpio"],
    "natalSigns": { "jupiter": "Virgo", "venus": "Virgo", "mars": "Sagittarius", "saturn": "Libra" }
  },

  "currentMonth": {
    "month": "2026-03",
    "totalScore": 18,
    "zrScore": 26,
    "transitScore": -8,
    "topEvents": [
      { "label": "ZR L3 — Scorpio (fortune)", "score": 26, "category": "zr" },
      { "label": "Saturn opposition natal Saturn", "score": -8, "category": "transit", "aspect": "opposition", "exactDate": "2026-03-19" }
    ]
  },

  "peakUpcomingMonths": [
    {
      "month": "2027-10",
      "totalScore": 305,
      "zrScore": 284,
      "transitScore": 21,
      "topEvents": [
        { "label": "ZR L2 — Aquarius (spirit)", "score": 90, "category": "zr" },
        { "label": "Pluto trine natal Saturn", "score": 15, "category": "transit", "aspect": "trine", "exactDate": "2027-10-18" }
      ]
    }
  ],

  "years": [
    {
      "year": 2025, "peakMonthScore": 120, "peakMonth": "2025-06",
      "sumScore": 450, "monthCount": 12, "avgMonthScore": 37.5,
      "positiveMonths": 9, "negativeMonths": 2, "neutralMonths": 1,
      "sumPositive": 510, "sumNegative": -60
    }
  ],

  "months": [
    {
      "month": "2025-01", "year": 2025, "monthNum": 1, "age": 44.19,
      "isPast": true, "isCurrentMonth": false,
      "zrScore": 26, "transitScore": 8, "totalScore": 34,
      "topEvents": [
        { "label": "ZR L3 — Scorpio (fortune)", "score": 26, "category": "zr" },
        { "label": "Jupiter trine natal Moon", "score": 6, "category": "transit", "aspect": "trine", "exactDate": "2025-01-14" }
      ]
    }
  ],

  "computeTimeSeconds": 3.3
}
```

### Key Fields

| Field | What it tells you |
|-------|------------------|
| `currentMonth` | Current month score + top events — ready for dashboard display |
| `peakUpcomingMonths` | Top 3 future months by score — "next peaks" for push notifications |
| `months[].isCurrentMonth` | `true` for the current month only |
| `months[].topEvents` | Up to 5 events sorted by absolute score — use for tooltips |
| `years[].positiveMonths` / `negativeMonths` | Count of months above/below zero per year |

### Example Request

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/toctoc-year.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517
  }'
```

---

## POST `/api/toctoc-boudin-detail`

**Added:** 2026-03-22
**PHP:** `toctoc-boudin-detail.php`
**Calculator:** `calculators/toctoc_boudin_detail_calculator.js`
**Purpose:** Returns a single boudin (sausage) with full detail and an **LLM-ready delineation payload**. Designed for the "click on a boudin" flow in the TocToc app — the response is structured so an LLM can generate a personalized interpretation paragraph.

### When to use

Call this endpoint when a user taps/clicks a specific boudin in the timeline. The response includes:
- The raw sausage object (same as in `toctoc-app`)
- An `llmPayload` structured for direct LLM consumption (planet archetypes, aspect meanings, house keywords, cycle/lifetime context)
- `convergence` data showing other events active in the same time window and same houses
- `natalContext` for the natal point involved

### Request body

Same birth data as `/api/toctoc-app`, plus a boudin identifier:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | `YYYY-MM-DD` | yes* | Birth date |
| `birthTime` | `HH:MM` | yes* | Birth time |
| `latitude` | number | yes* | Birth latitude |
| `longitude` | number | yes* | Birth longitude |
| `timezone` | string | optional | Timezone (default: `Europe/Brussels`) |
| `username` | string | alt* | Username (replaces birthDate/birthTime/lat/lon) |
| `boudinIndex` | number | yes** | 0-based index in `allSausages[]` from toctoc-app |
| `boudinId` | string | yes** | Sausage `id` field (e.g., `tt_42_h1`) |

\* Either `username` OR `birthDate`+`birthTime`+`latitude`+`longitude`.
\*\* Either `boudinIndex` OR `boudinId` — at least one required.

Supports **`POST /api/toctoc-boudin-detail/:username`** (username in path).

### Response

| Field | Description |
|-------|-------------|
| `success` | `true` |
| `person` | Birth data |
| `natalPoints` | All natal positions |
| `boudin` | The full sausage object |
| `llmPayload` | Category-specific LLM-ready object (see below) |
| `natalContext` | House context for the natal point involved |
| `convergence` | `{ level, overlappingEvents, sameHouseEvents, events[] }` |
| `houseTopics` | House keyword reference |
| `totalSausages` | Total sausages in the full scan |

### `llmPayload` structure by category

**Transit:** `type, signal, summary, transitPlanet, transitPlanetArchetype, transitPlanetRarity, natalPoint, natalPointArchetype, aspect, aspectDetail, natalHouse, natalHouseKeywords, ruledHouses[], topics[], dateRange, partileDate, score, isVipAspect, cycle { hitNumber, totalHits, pattern, hitMeaning, allHits[] }, isMultiHitCycle, lifetime { number, total, meaning }, planetNatalHistory { allAspects[], totalCycles, vipContactCount, narrative }, isReturn, isHalfReturn`

**Eclipse:** `type, signal, summary, eclipseType, eclipseTypeMeaning, eclipseSign, axis, axisHouses[], natalPoint, orb, isExactAspect, isVipAspect, orbInterpretation, topics[], series { id, hitNumber, totalHits, allDates[], allAxisDates[] }, lifetime, isEclipseVipCluster`

**Station:** `type, signal, summary, transitPlanet, transitPlanetArchetype, stationType, stationMeaning, natalPoint, orb, natalHouse, natalHouseKeywords, ruledHouses[], topics[], stationRarityNote`

**ZR:** `type, signal, summary, lots[], isMultipleLots, level, levelMeaning, periodSign, periodHouse, periodHouseKeywords, topics[], markers[], hasLooseningOfBond, hasCulmination, isPeakPeriod, lifetime, allPeriods`

### LLM delineation prompt

See `knowledge/mini-guide/toctoc-delineation-prompt.md` for the complete system prompt to send to an LLM along with the `llmPayload`.

### Example

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/toctoc-boudin-detail.php" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ma1",
    "boudinIndex": 5
  }'
```

---

## POST `/api/event-timing-analysis`

**PHP:** `event-timing-analysis.php`
**Calculator:** `calculators/event_timing_analysis_calculator.js`

For a list of life events (date + category + detail), computes every astrological timing layer active at each event date and returns a report-ready JSON.

### Request body

```json
{
  "birth": {
    "date":      "YYYY-MM-DD",
    "time":      "HH:MM",
    "timezone":  "Europe/Paris",
    "latitude":  48.8566,
    "longitude": 2.3522,
    "city":      "Paris",
    "country":   "France"
  },
  "events": [
    { "date": "2023-07-15", "category": "Career",       "detail": "Job loss",  "zrLot": "spirit" },
    { "date": "2024-02-10", "category": "Relationship", "detail": "Divorce",   "zrLot": "eros"   }
  ]
}
```

`username` can be added to load birth data from the DB (body fields can override).

### Layers returned per event

| Layer | Key | Contents |
|-------|-----|----------|
| Annual profection | `layers.profection.annualProfection` | house, sign, ruler, planetsInHouse |
| Monthly profection | `layers.profection.monthlyProfection` | house, sign, ruler, window dates |
| Solar Return | `layers.profection.solarReturn` | ruler placement in SR, dignity, comparison |
| Transit cycles | `layers.transitCycles` | active / recent / upcoming cycles; lordOfYearHits flagged |
| ZR Fortune | `layers.zodiacalReleasing.fortune.currentPeriods` | L1/L2/L3 active at event date |
| ZR Spirit | `layers.zodiacalReleasing.spirit.currentPeriods` | L1/L2/L3 active at event date |
| ZR Eros | `layers.zodiacalReleasing.eros.currentPeriods` | L1/L2/L3 active at event date |
| Eclipse proximity | `layers.eclipseProximity.nearestEclipses` | eclipses ±6 months, orb to natal points |

### Report summary (use for narrative / “What was at stake”)

Each event includes **`reportSummary`** so UIs or LLMs can build accurate text:

- **`reportSummary.zr`** — ZR for the event’s chosen lot: **L1, L2, L3** (sign + ruler) and **`narrative`** (e.g. “Zodiacal Releasing from Lot of Eros at the event: Level 1 in …; Level 2 in …; Level 3 in …”).
- **`reportSummary.solarReturn`** — **Highlighted house** = house where the **profection ruler** sits in the Solar Return (not “work” by default). Includes **`houseAxis`** (e.g. “4th-10th (IC-MC)”), **`profectionRuler`**, **`rulerInSRHouse`**, **`eclipseOnAxis`** / **`eclipseNote`**, and **`narrative`**.
- **`reportSummary.profection`** — Annual house, sign, ruler; **`narrative`** states e.g. “Profection house 1, so Sun is the ruler of the year; in the solar return Sun is in house 4 (4th-10th axis).”
- **`reportSummary.whatWasAtStake`** — Combined narrative string (profection + ruler emphasis + ruler house transit + solar return + ZR). Also use **profectionRulerEmphasis**, **profectionRulerTransit**, and **lordOfYearTransitSummary** (e.g. Saturn transiting 10th house) when building "What was at stake". Prefer this or the sub-narratives so the report correctly mentions **ZR level 2 and level 3**, **SR highlighted house** (profection ruler’s SR house), and **house axis**; and does not say “SR highlighted work” unless the profection ruler is actually in SR 6th house.

### Top-level response fields

| Field | Type | Meaning |
|-------|------|---------|
| `success` | boolean | |
| `birth` | object | Birth data echoed back |
| `computedAt` | string | ISO timestamp |
| `totalEvents` | number | Count of analyzed events |
| `events` | array | One record per event (see above) |
| `crossEventSummary.eventsTable` | array | Compact comparison row per event |
| `crossEventSummary.commonRulers` | array | Rulers appearing in >1 event |
| `crossEventSummary.commonAnnualSigns` | array | Annual signs appearing in >1 event |
| `crossEventSummary.commonZRFortuneL1` | array | ZR Fortune L1 signs recurring across events |

### Example curl

```bash
curl -X POST "https://ai.zebrapad.io/full-suite-spiritual-api/event-timing-analysis.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birth": { "date":"1980-10-24","time":"01:41","timezone":"Europe/Brussels","latitude":50.8503,"longitude":4.3517 },
    "events": [
      { "date":"2023-07-15", "category":"Career", "detail":"Job loss", "zrLot":"spirit" }
    ]
  }'
```

> ⚠️ **Performance note:** each event triggers transit-cycle scanning (±3 years) + ZR for 3 lots. Expect 20–60 s per event depending on server load. Cache results client-side.

---

## POST `/api/timelines`

**Calculator:** `calculators/timelines_calculator.js`

Unified Timelines API: returns drawable timeline segments (ZR, profection, solar return, transits, combined) keyed by timeline ID. Use **timelineIds** and/or **objectives** (e.g. career, love) so apps can show timing strips based on the user’s question. See [timelines-project.md](timelines-project.md) for the full taxonomy.

### Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅* | `YYYY-MM-DD` |
| `birthTime` | string | ✅* | `HH:MM` |
| `timezone` | string | ✅* | IANA (e.g. `Europe/Brussels`) |
| `latitude` | number | ✅* | Required if no `username` |
| `longitude` | number | ✅* | Required if no `username` |
| `username` | string | ➖ | If set, birth data loaded from DB (body can override) |
| `timelineIds` | string[] | ➖ | Explicit IDs, e.g. `["L1","P11","SR14","T19","C2"]` |
| `objectives` | string[] | ➖ | Life-question shortcuts: `["career","love","health","easy","hard"]` → mapped to IDs |
| `category` | string | ➖ | Restrict family: `zr` \| `profection` \| `solar-return` \| `transit` \| `combined` |
| `scanRange` | object | ➖ | `{ fromYear?, toYear? }` (default: birth → min(today+5y, birth+80y)) |
| `scoreAndRank` | boolean | ➖ | If `true`, segments get `metadata.score` (0–10) and `metadata.rank` (per-objective) |

*Required unless `username` supplies birth data.

### Supported timeline IDs (MVP + extended)

| Family | IDs | Description |
|--------|-----|-------------|
| ZR | L1, L2, L3, L4, L5, L7, L8, L9, L10, L13, L19, L20, L21, L22, L23, L24 | Fortune/Spirit/Eros L2; L9 sect-adjusted; L10 ZR–profection convergence |
| Profection | P1, P3, P4, P5, P7, P8, P9, P10, P11, P12, P13 | P5 = time lord angular in SR; P7 = profection sign = ZR L2 |
| Solar return | SR1, SR3–SR5, SR9–SR15, SR17, SR18 | Angular benefics/malefics; house emphasis |
| Transit | T19, T20, T24, T27, T28 | T24 = transits to MC ruler; T27 = benefic to time lord; T28 = malefic to time lord |
| Combined | C2, C3, C5, C6, C7, C8, C9, C11, C13, C14, C18, C20, C21, C22 | Career/love/money/opportunity peaks; C18 = two methods agree |
| PM | PM1, PM2, PM9, PM15 | Progressed Moon phase/sign; Progressed Sun sign |

### Response

| Field | Type | Meaning |
|-------|------|---------|
| `success` | boolean | |
| `person` | object | `{ name, birthDate, birthTime, timezone, sect? }` — `sect`: `"day"` \| `"night"` |
| `chart` | object | Optional `{ sect }` when sect is computed |
| `timelines` | object | Keyed by timeline ID (e.g. `L1`, `P11`) |
| `timelines[id].id` | string | Timeline ID |
| `timelines[id].family` | string | `L` \| `P` \| `SR` \| `T` \| `C` |
| `timelines[id].objective` | string | Human description (from timelines-project.md) |
| `timelines[id].segments` | array | Drawable strips (see below) |
| `computeTimeSeconds` | number | Server compute time |

### Segment shape (for drawing)

Each element of `timelines[id].segments`:

| Field | Type | Description |
|-------|------|-------------|
| `startDate` | string | `YYYY-MM-DD` |
| `endDate` | string | `YYYY-MM-DD` |
| `label` | string | Short label for the strip |
| `color` | string | Optional: e.g. `career`, `supportive`, `maturity` |
| `intensity` | number | Optional strength/score |
| `metadata` | object | Technique-specific (year, age, house, exactDates). Enriched: ZR `periodRuler`, `isBeneficRuled`, `triadPhase`; profection `timeLord`, `timeLordConditionNatal`, `timeLordInSR`, `profectionZRAlign`; combined `tags`; PM1 `progressedMoonPhase`, `downweightForNewStart`. With `scoreAndRank: true`: `score`, `rank`. |

### Example: by objectives (career)

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/calculator_wrapper.js" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/timelines",
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "timezone": "Europe/Brussels",
    "objectives": ["career"]
  }'
```

(When using PHP, call the wrapper with endpoint `/api/timelines` and the same body minus `endpoint`; see Anatella pattern in CLAUDE.md.)

### Example: explicit timeline IDs

```json
{
  "birthDate": "1980-10-24",
  "birthTime": "01:41",
  "latitude": 50.8503,
  "longitude": 4.3517,
  "timezone": "Europe/Brussels",
  "timelineIds": ["L1", "L2", "P1", "C2", "C3"]
}
```

### Find by objective (quick lookup)

| I want to know… | Use `objectives` or `timelineIds` |
|-----------------|-----------------------------------|
| When could I get a promotion / career peak? | `["career"]` or `["P11","SR14","C9","T24","PM13"]` (MVP: P11, SR14, C9, T19, T20) |
| When is the year more supportive (green)? | `["easy"]` or `["C3"]` |
| When might the year be harder (red)? | `["hard"]` or `["C2"]` |
| When are my biggest ZR peaks (body, career, love)? | `["L1","L2","L3"]` |

---

## POST /api/daily-briefing-context

**Purpose:** Produces a priority-ranked, personalized astrological signal payload for the Unfold AI daily briefing. Solves the problem of the AI treating a 2.5-day Moon transit (universal) the same as a rare eclipse activating a natal house axis (personal, 3–6 months).

**PHP file:** `daily-briefing-context.php`
**Calculator:** `calculators/daily_briefing_context_calculator.js`

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | string | ✅ | `"YYYY-MM-DD"` |
| `birthTime` | string | ✅ | `"HH:MM"` |
| `latitude` | float | ✅ | Birth latitude |
| `longitude` | float | ✅ | Birth longitude |
| `timezone` | string | ✅ | e.g. `"Europe/Brussels"` |
| `targetDate` | string | ❌ | `"YYYY-MM-DD"` — defaults to today |
| `username` | string | ❌ | DB username for profile lookup |

### Signal Priority Hierarchy

| Priority | Type | Orb | Duration |
|----------|------|-----|----------|
| **4** | Eclipse ≤ 3° from natal planet, ≤ 1° from Asc/MC | ≤ 3° | 3–6 months |
| **3** | Pluto/Uranus/Neptune/Saturn/Node transit | ≤ 3° | Weeks–months |
| **2** | Jupiter/Mars transit | ≤ 2° | Days–weeks |
| **1** | Moon (universal) — omit unless ≤ 2° from natal point | — | 2.5 days |

### Response

```json
{
  "success": true,
  "targetDate": "2026-08-15",
  "natalContext": {
    "ascendantSign": "Cancer",
    "ascendantDegree": 14.2,
    "houseSignMap": { "Cancer": 1, "Leo": 2, "Virgo": 3, "..." : "..." },
    "natalPlanetPositions": {
      "Sun":  { "sign": "Virgo",  "degree": 9.8,  "house": 3 },
      "Venus":{ "sign": "Leo",    "degree": 18.7, "house": 2 },
      "ASC":  { "sign": "Cancer", "degree": 14.2, "house": 1 },
      "MC":   { "sign": "Aries",  "degree": 5.0,  "house": 10 }
    }
  },
  "activeEclipses": [
    {
      "priority": 4,
      "type": "ECLIPSE",
      "eclipseType": "solar_total",
      "eclipseDate": "2026-08-12",
      "eclipseDegree": 19.97,
      "eclipseSign": "Leo",
      "aspect": "conjunction",
      "natalPointHit": "Venus",
      "natalPointDegree": 18.7,
      "natalPointSign": "Leo",
      "orb": 1.27,
      "natalHouse": 2,
      "houseMeaning": "Argent, ressources, valeurs",
      "axisActivated": "2e–8e (Lion–Verseau)",
      "windowStart": "2026-06-13",
      "windowEnd": "2026-11-10",
      "llmPayload": "Éclipse solaire totale à 19.97° Lion le 12 août 2026, en conjonction avec Vénus natal à 18.7° Lion en maison 2 (Argent, ressources, valeurs). Axe 2e–8e (Lion–Verseau) activé. Fenêtre rare de 4–5 mois. Score priorité : 4/4."
    }
  ],
  "activeTransits": [
    {
      "priority": 3,
      "type": "OUTER_PLANET_TRANSIT",
      "transitPlanet": "Saturn",
      "transitSign": "Aries",
      "transitDegree": 28.3,
      "aspect": "opposition",
      "natalPoint": "Saturn",
      "natalPointSign": "Libra",
      "natalPointDegree": 15.9,
      "orb": 2.4,
      "natalHouse": 4,
      "houseMeaning": "Foyer, famille, racines",
      "periodStart": "2026-07-01",
      "periodEnd": "2026-09-29",
      "llmPayload": "Saturne transit en opposition avec Saturne natal en maison 4 (...). ..."
    }
  ],
  "moonContext": {
    "note": "La Lune transite en 2,5 jours — signal universel...",
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
  },
  "computeTimeSeconds": 0.08
}
```

### Test command

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/daily-briefing-context.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1982-09-02",
    "birthTime": "02:15",
    "latitude": 51.2194,
    "longitude": 4.4025,
    "timezone": "Europe/Brussels",
    "targetDate": "2026-08-15"
  }'
```

**Expected:** `activeEclipses` contains solar total Aug 12 2026 hitting Venus at 18.7° Leo, `signalSummary.highestPriority = 4`.

Full mapping: [timelines-project.md §3b](timelines-project.md) (Find by Objective).

---

## POST /api/connection-brief

**Purpose:** Two-person compatibility brief for the TocToc/Unfold connection flow. Given two people's birth data and a connection date, returns month-bucketed astrological focus and challenges for each person, plus shared theme, insight, and relationship-aware action. Drives the "timing windows" UI cards.

**PHP file:** `connection-brief.php`
**Calculator:** `calculators/connection_brief_calculator.js`

### Request

```json
{
  "relationship": "partner|friend|family|colleague",
  "targetDate": "2026-04-03",
  "personA": {
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "timezone": "Europe/Brussels"
  },
  "personB": {
    "birthDate": "1990-02-12",
    "birthTime": "16:05",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "timezone": "Europe/Paris"
  },
  "responseWindow": { "mode": "connection_month_plus_next", "months": 3 }
}
```

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| `personA` / `personB` | ✅ | — | Birth data or `username` |
| `targetDate` | No | today | Connection anchor date |
| `relationship` | No | `friend` | `partner|friend|family|colleague` |
| `responseWindow.months` | No | 3 | 1–6 months |

### Response

```json
{
  "success": true,
  "connectionBrief": {
    "relationship": "partner",
    "targetDate": "2026-04-03",
    "activePeriods": [
      {
        "monthKey": "2026-04",
        "startDate": "2026-04-01",
        "endDate": "2026-04-30",
        "tier": "PEAK|CLEAR|SUBTLE",
        "tierScore": 120,
        "personAFocus": {
          "dominantDomains": ["Partenariats et relations", "Ressources et valeurs"],
          "primarySignal": {
            "category": "transit|eclipse|zr|station|profection",
            "planetOrType": "Saturn",
            "natalPoint": "Venus",
            "aspectOrMarker": "square",
            "score": 3,
            "houses": [7],
            "startDate": "2026-03-01", "endDate": "2026-05-15",
            "cycle": { "hitNumber": 2, "totalHits": 3, "pattern": "Direct-Retrograde-Direct" }
          },
          "challenges": ["Tension autour de partenariats et relations"],
          "constructiveDirection": "L'énergie de la structure et la responsabilité en carré crée un défi lié à partenariats. C'est une invitation à clarifier vos priorités.",
          "rawData": {
            "profection": { "house": 6, "houseName": "...", "annualTheme": "..." },
            "monthScore": { "total": 194, "zr": 191, "transit": 3 },
            "events": [
              { "label": "ZR L2 — Virgo (fortune) · ...", "score": 78, "category": "zr", "startDate": "2025-11-30", "endDate": "2027-03-14", "houses": [6], "lotType": "fortune", "level": 2, "periodSign": "Virgo", "markers": [] },
              { "label": "Saturn square natal Venus", "score": 21, "category": "transit", "aspect": "square", "startDate": "2026-03-01", "endDate": "2026-05-15", "houses": [7] }
            ]
          }
        },
        "personBFocus": { "...same structure..." },
        "sharedTheme": "Les deux personnes partagent un focus autour de \"Partenariats et relations\".",
        "sharedInsight": "Des cycles importants sont actifs — cette période est porteuse d'une dynamique de changement significatif.",
        "actionTogether": "Privilégiez un dialogue ouvert pour clarifier vos attentes respectives et poser des bases claires avant d'agir ensemble.",
        "comparaison": {
          "memesDomaines": [7],
          "domainesA": [6, 7, 11], "domainesB": [7, 10, 12],
          "memeAxeEclipse": null,
          "charge": { "A": "charge", "B": "leger" },
          "tonalite": { "A": "friction", "B": "neutre" },
          "tempo": { "A": "moyen", "B": "lent" },
          "ecart": "decale",
          "techniquesAccordA": 2, "techniquesAccordB": 1,
          "silence": false
        }
      }
    ]
  },
  "computeTimeSeconds": 5.2
}
```

**`primarySignal.houses` / `rawData.events[].houses`:** the natal house(s) each signal touches — whole-sign, from the ASC. Transits/stations use the house of the aspected natal point; eclipses use the axis of the eclipse's own sign (2 houses); ZR uses the whole-sign house of the period sign. This is what makes two people's signals comparable (added 2026-09-02 — previously every event had `date: null` and no house, so nothing was comparable across people).

**`comparaison`:** computed server-side (never left to the LLM) from both people's houses-touched + charge + tonalite this month. `ecart` is `"synchrone"` (same house, comparable charge) / `"decale"` (same house or general activity, different charge) / `"asymetrique"` (one at `"pic"`, the other `"vide"`) / `"aucun"` (both `"vide"`). `silence: true` means neither person has 2+ independent techniques agreeing on one house and no house is shared — the UI/prompt should say nothing rather than fabricate a reading. `charge` reads `zr`/`transit` scores separately rather than `monthScore.total` (which is usually 90%+ ZR background and doesn't mean "busy month"). See `knowledge/PROMPT-MATCH-AMELIORATION.md` for the full design rationale.

**Tier logic:** `max(scoreA, scoreB) >= 3` → PEAK; `>= 2` → CLEAR; else SUBTLE

**Test:**
```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/connection-brief.php" \
  -H "Content-Type: application/json" \
  -d '{
    "relationship": "partner",
    "targetDate": "2026-04-03",
    "personA": {"birthDate":"1980-10-24","birthTime":"01:41","latitude":50.8503,"longitude":4.3517,"timezone":"Europe/Brussels"},
    "personB": {"birthDate":"1990-02-12","birthTime":"16:05","latitude":48.8566,"longitude":2.3522,"timezone":"Europe/Paris"},
    "responseWindow": {"months": 3}
  }'
```

---

## POST `/api/profile-insights`

**Purpose:** Super-feature for profile lists: (1) compare 2+ `id_person` charts for shared natal themes; (2) load a `person_event` by `id_event`, derive transit signatures at that date, and find which added profiles experienced the same transits (and when).

**PHP:** `profile-insights.php`  
**Calculator:** `calculators/profile_insights_calculator.js`

### Request — compare

```json
{
  "action": "compare",
  "idPersons": [48, 59116],
  "houses": [1, 7, 10],
  "aspectOrb": 2
}
```

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| `action` | ✅ | — | `compare` or `transit_match` |
| `idPersons` | ✅ (compare) | — | At least 2 database `id_person` values |
| `houses` | No | `[1,4,7,10]` | Whole-sign house rulers to compare |
| `aspectOrb` | No | `2` | Orb (degrees) for shared natal aspect detection |

### Request — transit_match

```json
{
  "action": "transit_match",
  "idEvent": 72783,
  "ownerUsername": "stephh",
  "maxProfiles": 50
}
```

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| `idEvent` | ✅ | — | `person_event.id_event` |
| `ownerUsername` | No | — | Fallback if event row lacks valid `id_person` / `id_user` birth data |
| `idPersons` | No | — | Optional subset to scan; default = profiles added by owner (`person_group`) |
| `maxProfiles` | No | `50` | Cap batch scans |

### Response — compare (excerpt)

```json
{
  "success": true,
  "action": "compare",
  "profileCount": 2,
  "common": {
    "sunSign": "Scorpio",
    "aspects": [{ "planet1": "Mars", "planet2": "Saturn", "aspect": "Square" }],
    "rulerPlacementsSame": [{ "house": 7, "ruler": "Venus", "rulerInHouse": 10, "label": "..." }]
  },
  "summaryBullets": ["Shared Sun sign: Scorpio", "1 shared natal aspect(s)"],
  "profiles": [{ "idPerson": 48, "bigThree": {}, "aspectCount": 12 }]
}
```

### Response — transit_match (excerpt)

```json
{
  "success": true,
  "action": "transit_match",
  "event": { "idEvent": 72783, "date": "2023-07-15", "category": "Career", "detail": "..." },
  "referenceSignatures": [{ "type": "aspect", "transitPlanet": "Saturn", "aspect": "square", "natalPoint": "Moon" }],
  "matches": [{ "idPerson": 59116, "matchScore": 2, "strongMatch": true, "signatureHits": [] }]
}
```

**Test:**

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/profile-insights.php" \
  -H "Content-Type: application/json" \
  -d '{"action":"compare","idPersons":[48,59116],"houses":[7,10]}'

curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/profile-insights.php" \
  -H "Content-Type: application/json" \
  -d '{"action":"transit_match","idEvent":72783,"ownerUsername":"stephh"}'
```

---

## POST /api/ephemeris-expert

**Purpose:** General-purpose ephemeris query engine. Designed to be called by an LLM as a tool to answer any astronomical/astrological question without needing natal data. Answers questions like "When is Pluto at 6° Aquarius?", "When was the last Saturn–Neptune conjunction?", "When is the next full moon in Scorpio?", "When does Mercury go retrograde next?".

**PHP file:** `ephemeris-expert.php`
**Calculator:** `calculators/ephemeris_expert_calculator.js`
**Function:** `ephemerisExpert(inputData)`

**No natal data required.** All queries are purely astronomical.

### Required Field

| Field | Type | Description |
|-------|------|-------------|
| `query_type` | string | One of: `planet_position`, `planet_at_degree`, `planet_degree_band`, `final_ingress`, `next_aspect`, `eclipse`, `moon_phase`, `retrograde`, `ingress` |

### Common Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `from_date` | string (ISO) | today | Start date for search |
| `direction` | string | `"next"` | `"next"` or `"previous"` |

### Query Type: `planet_position`

Returns snapshot of a planet at a given date.

```json
{
  "query_type": "planet_position",
  "planet": "Jupiter",
  "date": "2026-05-04"
}
```

**Response:** `longitude`, `sign`, `degree_in_sign`, `retrograde` (bool), `speed_per_day`.

---

### Query Type: `planet_at_degree`

Finds ALL crossings of a specific degree (handles retrograde loops — may return 3 dates).

```json
{
  "query_type": "planet_at_degree",
  "planet": "Pluto",
  "degree": 6,
  "sign": "Aquarius",
  "direction": "next",
  "from_date": "2026-05-04"
}
```

**Response:** `events[]` with `datetime`, `sign`, `degree_in_sign`, `motion` (direct/retrograde).

---

### Query Type: `planet_degree_band`

Returns **time windows** when a planet is within a degree band in a sign (e.g. “3° Aquarius” meaning **3°00′–3°59′**).

```json
{
  "query_type": "planet_degree_band",
  "planet": "Pluto",
  "degree": 3,
  "band_size": 1,
  "sign": "Aquarius",
  "direction": "next",
  "from_date": "2026-05-06",
  "max_windows": 3
}
```

**Response:** `band` + `windows[]` with `start_datetime` and `end_datetime`.

---

### Query Type: `next_aspect`

Returns **both** previous and next occurrence of an aspect between two planets.

```json
{
  "query_type": "next_aspect",
  "planet1": "Saturn",
  "planet2": "Neptune",
  "aspect": "conjunction",
  "from_date": "2026-05-04"
}
```

Valid aspects: `conjunction`, `sextile`, `square`, `trine`, `opposition`, `semisquare`, `semisextile`, `sesquiquadrate`, `quincunx`.

Optional: set `include_windows:true` to also include applying/separating timestamps for within 1° and 3°.\n+\n+**Response:** `next` (event), `previous` (event), `all_nearby[]`. Each event has both planets' positions.

---

### Query Type: `eclipse`

Finds solar and/or lunar eclipses.

```json
{
  "query_type": "eclipse",
  "eclipse_type": "any",
  "direction": "next",
  "from_date": "2026-05-04",
  "max_results": 5
}
```

`eclipse_type`: `"solar"`, `"lunar"`, or `"any"`. Optional: `sign_axis` (e.g. `"Taurus-Scorpio"`) and `include_penumbral` (default false). `max_results` max is 100.

**Response:** `events[]` with `type`, `subtype`, `sun_sign`, `moon_sign`, `description`.

---

### Query Type: `moon_phase`

Finds new moons or full moons, optionally filtered by Moon sign.

```json
{
  "query_type": "moon_phase",
  "phase": "full",
  "sign": "Scorpio",
  "direction": "next"
}
```

`phase`: `"new"`, `"first_quarter"`, `"full"`, `"last_quarter"`. `sign` is optional.

**Response:** `events[]` with `datetime`, `moon_sign`, `moon_degree`, `sun_sign`.

---

### Query Type: `retrograde`

Returns current status + upcoming SR/SD stations for a planet.

```json
{
  "query_type": "retrograde",
  "planet": "Mercury",
  "from_date": "2026-05-04"
}
```

**Response:** `current_status` (direct/retrograde), `current_position`, `upcoming_stations[]` (each with `type` SR/SD, `datetime`, `sign`, `degree_in_sign`), plus `shadow_periods[]` for SR→SD pairs.

---

### Query Type: `final_ingress`

Summarizes first ingress → slip-back(s) → final ingress into a sign (default within 15-year window).

```json
{
  "query_type": "final_ingress",
  "planet": "Uranus",
  "sign": "Gemini",
  "from_date": "2025-01-01"
}
```

**Response:** `first_ingress_from_previous_sign`, `retrograde_returns_to_previous_sign[]`, `final_ingress_from_previous_sign`.

---

### Query Type: `ingress`

Finds when a planet enters a sign.

```json
{
  "query_type": "ingress",
  "planet": "Saturn",
  "sign": "Aries",
  "direction": "next"
}
```

`sign` is optional — if omitted, returns next ingress into any sign.

**Response:** `events[]` with `from_sign`, `to_sign`, `datetime`, `motion`.

---

### Supported Planets

`Sun`, `Moon`, `Mercury`, `Venus`, `Mars`, `Jupiter`, `Saturn`, `Uranus`, `Neptune`, `Pluto`, `Chiron`, `North Node`, `South Node`

### Test Examples

```bash
# Pluto at 6° Aquarius
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/ephemeris-expert.php" \
  -H "Content-Type: application/json" \
  -d '{"query_type":"planet_at_degree","planet":"Pluto","degree":6,"sign":"Aquarius","direction":"next"}'

# Pluto in 3° Aquarius (3°00′–3°59′) — band window
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/ephemeris-expert.php" \
  -H "Content-Type: application/json" \
  -d '{"query_type":"planet_degree_band","planet":"Pluto","degree":3,"band_size":1,"sign":"Aquarius","direction":"next","from_date":"2026-05-06"}'

# Saturn conjunct Neptune (next + previous in one call)
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/ephemeris-expert.php" \
  -H "Content-Type: application/json" \
  -d '{"query_type":"next_aspect","planet1":"Saturn","planet2":"Neptune","aspect":"conjunction","from_date":"2026-05-04"}'

# Next eclipse
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/ephemeris-expert.php" \
  -H "Content-Type: application/json" \
  -d '{"query_type":"eclipse","eclipse_type":"any","direction":"next"}'

# Next full moon in Scorpio
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/ephemeris-expert.php" \
  -H "Content-Type: application/json" \
  -d '{"query_type":"moon_phase","phase":"full","sign":"Scorpio","direction":"next"}'

# Mercury retrograde stations
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/ephemeris-expert.php" \
  -H "Content-Type: application/json" \
  -d '{"query_type":"retrograde","planet":"Mercury"}'

# Jupiter entering Gemini
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/ephemeris-expert.php" \
  -H "Content-Type: application/json" \
  -d '{"query_type":"ingress","planet":"Jupiter","sign":"Gemini","direction":"next"}'

# Where is Mars today?
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/ephemeris-expert.php" \
  -H "Content-Type: application/json" \
  -d '{"query_type":"planet_position","planet":"Mars"}'
```

---

## POST /api/planetary-periods

**Purpose:** Hellenistic/Medieval planetary period timing. Each of the 7 classical planets has Minor, Mean, and Greater years (from Valens, Ptolemy, Bonatti). When the native's age crosses a threshold, that planet "becomes active" and brings forth its natal significations. Returns all milestones across the lifetime, the currently active planet, and the next upcoming threshold.

**PHP file:** `planetary-periods.php`
**Calculator:** `calculators/planetary_periods_calculator.js`
**Function:** `calculatePlanetaryPeriods(inputData)`

### Planetary Year Values

| Planet | Minor | Mean | Greater |
|--------|-------|------|---------|
| Moon | 25 | 66.5 | 108 |
| Mercury | 20 | 48 | 76 |
| Venus | 8 | 45 | 82 |
| Sun | 19 | 69.5 | 120 |
| Mars | 15 | 40.5 | 66 |
| Jupiter | 12 | 45.5 | 79 |
| Saturn | 30 | 43.5 | 57 |

### Request

```json
{ "birthDate": "1980-10-24" }
```

Or by username (pulls birth date from DB):
```json
{ "username": "ma1" }
```

| Field | Required | Notes |
|-------|----------|-------|
| `birthDate` | ✅ (or `username`) | YYYY-MM-DD or DD/MM/YYYY |
| `username` | ✅ (or `birthDate`) | Looks up birth data from DB |
| `referenceDate` | No | Override "today" for historical queries (YYYY-MM-DD) |
| `birthTime` | No | HH:mm — required for `domicileLordActivations` |
| `latitude` | No | Geographic latitude — required for `domicileLordActivations` |
| `longitude` | No | Geographic longitude — required for `domicileLordActivations` |
| `timezone` | No | e.g. `"America/New_York"` — required for `domicileLordActivations` |

### Response

```json
{
  "success": true,
  "data": {
    "birthDate": "1980-10-24",
    "currentAge": 45.59,
    "referenceDate": "2026-05-27",
    "currentlyActive": {
      "planet": "Jupiter",
      "period": "mean",
      "years": 45.5,
      "activationDate": "2026-04-24",
      "activationDateDisplay": "Apr 24, 2026",
      "isPast": true,
      "daysFromToday": -34,
      "status": "currently_active"
    },
    "nextMilestone": {
      "planet": "Mercury",
      "period": "mean",
      "years": 48,
      "activationDate": "2028-10-24",
      "activationDateDisplay": "Oct 24, 2028",
      "isPast": false,
      "daysFromToday": 880,
      "status": "upcoming"
    },
    "recentCluster": [ "...milestones in past 24 months..." ],
    "allMilestones": [ "...21 milestones sorted chronologically..." ],
    "planetaryYears": { "Moon": { "minor": 25, "mean": 66.5, "greater": 108 }, "...": "..." }
  }
}
```

Each milestone in `allMilestones` has:
- `planet` — Moon / Mercury / Venus / Sun / Mars / Jupiter / Saturn
- `period` — `minor` | `mean` | `greater`
- `years` — threshold age (e.g. 45.5)
- `activationDate` — YYYY-MM-DD
- `activationDateDisplay` — human-readable (e.g. "Apr 24, 2026")
- `isPast` — boolean
- `daysFromToday` — negative = past, positive = future
- `status` — `past` | `currently_active` | `upcoming`

---

### Demetra George: Planet & Domicile Lord Activation (`domicileLordActivations`)

**Source:** Demetra George, *Hellenistic Astrology Vol. II* — "Planet and Domicile Lord Activation" and "Timing by Planetary Period and Ascensional Time"

When `birthTime`, `latitude`, `longitude`, and `timezone` are provided, the response includes a `domicileLordActivations` block that shows **when each natal planet is activated** using 8 combined methods.

**Core concepts:**
- Each natal planet (guest) sits in a sign whose domicile lord (host) also has a natal position
- **Minor years** — the traditional Hellenistic threshold years for each planet (e.g. Venus = 8, Mercury = 20)
- **Ascensional time** — the degrees/years it takes a sign to rise over the horizon at the native's latitude (computed from oblique ascension, varies by latitude). Gemini ≈ 28–29 and Leo ≈ 38 at 40°N.

**The 8 activation methods per planet:**

| # | Method | Formula | Notes |
|---|--------|---------|-------|
| 1 | `minor_years_planet` | minor_years(planet) | Own threshold |
| 2 | `ascensional_time_planet_sign` | asc_time(planet's sign) | Own sign's rising time |
| 3 | `self_sum_minor_plus_asc` | minor_years(planet) + asc_time(planet's sign) | **Key method** — events here relate thematically to what happened at methods 1 and 2 |
| 4 | `minor_years_domicile_lord` | minor_years(domicile lord) | Host planet's own threshold |
| 5 | `sum_minor_years_both` | minor_years(planet) + minor_years(domicile lord) | Sum of both minor years |
| 6 | `sum_asc_times_both` | asc_time(planet sign) + asc_time(domicile lord sign) | Sum of both ascensional times |
| 7 | `minor_planet_plus_asc_lord` | minor_years(planet) + asc_time(domicile lord sign) | Cross-mix A |
| 8 | `asc_planet_plus_minor_lord` | asc_time(planet sign) + minor_years(domicile lord) | Cross-mix B |

**Verified example — Jacqueline Kennedy (born July 28, 1929, Southampton NY, 40.88°N):**
- Venus in Gemini (guest), Mercury in Leo (host/domicile lord of Gemini)
- `sum_minor_years_both`: Venus(8) + Mercury(20) = **28** → marriage-related event at 28
- `sum_asc_times_both`: asc(Gemini, 40°N ≈ 28.7) + asc(Leo, 40°N ≈ 38.3) = **67** → long-range activation
- `self_sum_minor_plus_asc`: Venus(8) + asc(Gemini ≈ 28.7) = **36.7** → relates to age-8 and age-28.7 events

**Ascensional time computation:**
Uses the proper astronomical oblique ascension formula (not a fixed table):  
`OA(λ, φ) = RA(λ) − arcsin(tan(φ) × tan(δ(λ)))`  
where φ = birth latitude, ε = obliquity of ecliptic (23.44°).  
The `ascensionalTimesUsed` field in the response lists all 12 sign values for the native's latitude.

**Response structure:**

```json
{
  "domicileLordActivations": {
    "latitude": 40.88,
    "methodology": "Demetra George — Planet & Domicile Lord Activation (7 methods)",
    "ascensionalTimesUsed": {
      "Aries": 17.79, "Taurus": 21.51, "Gemini": 28.66, "Cancer": 35.7,
      "Leo": 38.31, "Virgo": 38.03, "Libra": 38.03, "Scorpio": 38.31,
      "Sagittarius": 35.7, "Capricorn": 28.66, "Aquarius": 21.51, "Pisces": 17.79
    },
    "byPlanet": [
      {
        "planet": "Venus",
        "planetSign": "Gemini",
        "planetDegree": "16.54",
        "domicileLord": "Mercury",
        "domicileLordSign": "Leo",
        "minorYearsPlanet": 8,
        "minorYearsDomicileLord": 20,
        "ascensionalTimePlanetSign": 28.66,
        "ascensionalTimeDomicileLordSign": 38.31,
        "activationMethods": [ "... 8 method objects ..." ],
        "activationMethodsSorted": [ "... sorted by age ascending ..." ]
      }
    ],
    "allActivationsSorted": [ "... flat list across all planets, sorted by age ..." ]
  }
}
```

### Test

```bash
# By birth date
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/planetary-periods.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1980-10-24"}'

# By username
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/planetary-periods.php" \
  -H "Content-Type: application/json" \
  -d '{"username":"ma1"}'
```

---

## POST /api/planetary-activation

**Purpose:** Full Demetra George "Timing by Planetary Periods and Ascensional Times" workbook (June 2024). Implements Part One (sign table) and Part Two (all 10 A/B/C/D activation points per planet) plus a unified chronological timeline.

**PHP file:** `planetary-activation.php`
**Calculator:** `calculators/planetary_activation_calculator.js`
**Function:** `calculatePlanetaryActivation(inputData)`

### The Four Building Blocks

| Symbol | Meaning |
|--------|---------|
| **A** | Minor years of the **planet** (Sun=19, Moon=25, Mercury=20, Venus=8, Mars=15, Jupiter=12, Saturn=30) |
| **B** | Ascensional time of the **planet's own sign** at birth latitude (oblique ascension, varies by latitude) |
| **C** | Minor years of the planet's **domicile lord** |
| **D** | Ascensional time of the **domicile lord's sign** at birth latitude |

### 10 Activation Points per Planet

| # | Formula | Description |
|---|---------|-------------|
| 1 | A | Minor years (planet) |
| 2 | B | Ascensional time (planet's sign) |
| 3 | A+B | Self-sum ★ — echoes events at ages A and B |
| 4 | C | Minor years (domicile lord) |
| 5 | D | Ascensional time (domicile lord's sign) |
| 6 | C+D | Lord self-sum |
| 7 | A+C | Both minor years |
| 8 | B+D | Both ascensional times |
| 9 | A+D | Minor(planet) + asc(lord sign) |
| 10 | B+C | Asc(planet sign) + minor(lord) |

Each activation also includes **1/3, 1/2, 2/3** fractions per Demetra George's workbook.

### Request

```json
{
  "birthDate": "1980-10-24",
  "birthTime": "01:41",
  "latitude": 50.8467372,
  "longitude": 4.352493,
  "city": "Brussels",
  "country": "Belgium"
}
```

Or by username: `{ "username": "ma1" }`

| Field | Required | Notes |
|-------|----------|-------|
| `birthDate` | ✅ (or `username`) | YYYY-MM-DD |
| `birthTime` | ✅ | HH:mm — needed for natal positions |
| `latitude` | ✅ | Birth latitude — ascensional times vary by latitude |
| `longitude` | ✅ | Birth longitude |
| `city` + `country` | ✅ (or lat/lon + timezone) | For timezone resolution |
| `username` | ✅ (or birth fields) | Looks up from DB |

### Response Structure

```json
{
  "success": true,
  "data": {
    "birthDate": "1980-10-24",
    "currentAge": 45.68,
    "latitude": 50.85,
    "methodology": "Demetra George — Timing by Planetary Periods and Ascensional Times (June 2024)",
    "ascensionalTimesAllSigns": {
      "Aries": 13.48, "Taurus": 17.55, "Gemini": 26.8, "Cancer": 37.57,
      "Leo": 42.26, "Virgo": 42.34, "Libra": 42.34, "Scorpio": 42.26,
      "Sagittarius": 37.57, "Capricorn": 26.8, "Aquarius": 17.55, "Pisces": 13.48
    },
    "partOne": [
      {
        "sign": "Taurus",
        "ascensionalTime": 17.55,
        "planetsInSign": [
          { "planet": "Moon", "degree": 3.05, "minorYears": 25,
            "sumAB": 42.55, "sumAB_date": "2023-05-23", "sumAB_status": "past" }
        ]
      }
    ],
    "partTwo": [
      {
        "planet": "Venus", "planetSign": "Virgo", "planetDegree": 22.32,
        "domicileLord": "Mercury", "domicileLordSign": "Scorpio",
        "A": 8, "B": 42.34, "C": 20, "D": 42.26,
        "activations": [
          { "label": "A", "formula": "A", "description": "Minor years of Venus",
            "age": 8, "oneThird": 2.67, "oneHalf": 4, "twoThirds": 5.33,
            "date": "1988-10-23", "isPast": true, "status": "past" },
          "... 9 more activation objects ..."
        ],
        "activationsSorted": [ "... same, sorted by age ..." ],
        "nextActivation": { "label": "A+B", "age": 50.34, "date": "2031-02-23" }
      }
    ],
    "timeline": {
      "recentPast":     [ "... last 5 past activations across all planets ..." ],
      "nextFive":       [ "... next 5 upcoming activations across all planets ..." ],
      "allPast":        [ "... all past activations sorted chronologically ..." ],
      "allUpcoming":    [ "... all future activations sorted chronologically ..." ]
    }
  }
}
```

### Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/planetary-activation.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1980-10-24","birthTime":"01:41","latitude":50.8467,"longitude":4.3525,"city":"Brussels","country":"Belgium"}'

# By username
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/planetary-activation.php" \
  -H "Content-Type: application/json" \
  -d '{"username":"ma1"}'
```

---

## POST /api/person-search

Search **public persons** (`id_source IS NOT NULL`) by name with fuzzy matching.
Requires a valid Bearer API key.

### Authentication
```
Authorization: Bearer sk_<64-hex-chars>
```

### Parameters

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | one of name OR firstName+lastName | Full name to search (max 100 chars) |
| `firstName` | string | — | Used if `name` is not provided |
| `lastName` | string | — | Used if `name` is not provided |
| `limit` | integer | No | Max suggestions to return (1–10, default 5) |

Allowed characters: letters (incl. accented), spaces, hyphens, apostrophes, dots.

### Response — confident match

```json
{
  "success": true,
  "found": true,
  "confident": true,
  "query": "Marie Curie",
  "person": {
    "id": 1234,
    "firstName": "Marie",
    "lastName": "Curie",
    "fullName": "Marie Curie",
    "birthDate": "1867-11-07",
    "birthTime": "12:00",
    "city": "Warsaw",
    "country": "Poland",
    "timezone": "Europe/Warsaw",
    "matchScore": 1.0
  },
  "events": [
    { "id": 99, "date": "1903-10-10", "category": "Career", "subcategory": "Award", "detail": "Nobel Prize Physics" }
  ]
}
```

### Response — suggestions (low confidence)

```json
{
  "success": true,
  "found": true,
  "confident": false,
  "query": "curie",
  "message": "2 possible matches found. Please select the correct person.",
  "suggestions": [
    { "id": 1234, "fullName": "Marie Curie", "birthDate": "1867-11-07", "matchScore": 0.82, ... },
    { "id": 1235, "fullName": "Pierre Curie", "birthDate": "1859-05-15", "matchScore": 0.71, ... }
  ]
}
```

### Response — not found

```json
{ "success": true, "found": false, "query": "xyzunknown", "suggestions": [] }
```

### Error responses

| Code | Meaning |
|------|---------|
| 400 | Invalid input (missing name, bad characters, name too long) |
| 401 | Missing/invalid Bearer token |
| 429 | Rate limit exceeded (Retry-After header included) |
| 503 | Auth DB unavailable |

### curl example

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/person-search.php" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_<your_key>" \
  -d '{"name": "Marie Curie"}'
```

---

## POST /api/person-search-bulk

Bulk search up to 100 names in one request. Same auth and result format as `/api/person-search`.

### Option A — JSON body

```json
{ "names": ["Marie Curie", "Leonardo da Vinci", "Albert Einstein"] }
```

Each entry can also be: `{ "firstName": "Marie", "lastName": "Curie" }`

### Option B — CSV file upload (multipart/form-data)

Field name: `file`. Columns: `name` OR `firstName`,`lastName`.
Download the template first: `GET /person-search-template.php`

### Response

```json
{
  "success": true,
  "total": 3,
  "results": [
    { "query": "Marie Curie",       "found": true,  "confident": true,  "person": { ... }, "events": [...] },
    { "query": "Leonardo da Vinci", "found": true,  "confident": false, "suggestions": [...] },
    { "query": "Unknown Person XYZ","found": false, "suggestions": [] }
  ]
}
```

### curl example

```bash
# JSON array
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/person-search-bulk.php" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk_<your_key>" \
  -d '{"names":["Marie Curie","Albert Einstein"]}'

# CSV upload
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/person-search-bulk.php" \
  -H "Authorization: Bearer sk_<your_key>" \
  -F "file=@my_persons.csv"
```

---

## GET /person-search-template.php

Returns a downloadable CSV template. **No authentication required.**

```bash
# Download CSV template
curl "http://ai.zebrapad.io/full-suite-spiritual-api/person-search-template.php" -o template.csv

# Get JSON schema instead
curl "http://ai.zebrapad.io/full-suite-spiritual-api/person-search-template.php?format=json"
```

---

## Admin: API Key Management

**File:** `/admin/generate-api-key.php`
**Security:** Requires `ADMIN_SECRET` env var + IP restriction recommended.

### Generate a key

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/admin/generate-api-key.php" \
  -H "Content-Type: application/json" \
  -d '{"action":"generate","admin_secret":"YOUR_ADMIN_SECRET","client_name":"Client A","rpm_limit":60,"rpd_limit":1000}'
```

Response: `{ "api_key": "sk_<64hex>", "warning": "Store this key now — it cannot be retrieved again." }`

### List keys

```bash
-d '{"action":"list","admin_secret":"YOUR_ADMIN_SECRET"}'
```

### Revoke a key

```bash
-d '{"action":"revoke","admin_secret":"YOUR_ADMIN_SECRET","key_id":3}'
```

### Setup (run once)

```bash
psql -U postgres -d bubble -f D:\51.full-suite-api\setup_api_keys.sql
# Optional — enables better fuzzy matching in astrolearn DB:
psql -U postgres -d astrolearn -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

---

## POST /api/person-event-enrich

Fetches a person's Wikipedia biography, uses Claude AI to extract structured dated life events, and inserts them into the `person_event` table (`origin='ai_web'`).

**Requires:** `ANTHROPIC_API_KEY` set in `.env`

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id_person` | number | required* | Person's DB id (*or name) |
| `name` | string | required* | Person's full name (*or id_person) |
| `birth_date` | string | optional | YYYY-MM-DD — helps Claude age-stamp events |
| `birth_city` | string | optional | City of birth |
| `birth_country` | string | optional | Country of birth |
| `dry_run` | boolean | optional | If true, returns events without inserting into DB |

### Response

```json
{
  "success": true,
  "events_inserted": 18,
  "events_skipped": 3,
  "events_failed": 0,
  "events": [
    {
      "event_date": "1905-12-31",
      "category": "WORK",
      "subcategory": "Published/ Exhibited/ Released",
      "detail": "Published four landmark papers in Annalen der Physik (Annus Mirabilis), at age 26",
      "event_type": "date"
    }
  ],
  "wiki_chars": 85420
}
```

### Batch Scripts

```bash
# Step 1: Match 2000 famous names against DB (run once)
node scripts/01_match_famous_to_db.js

# Step 2a: Test one person (dry run — no DB writes)
node scripts/enrich_one_person.js --name "Albert Einstein" --dry-run

# Step 2b: Enrich one person
node scripts/enrich_one_person.js --name "Albert Einstein"
node scripts/enrich_one_person.js --id_person 37912

# Step 3: Batch-enrich 1000 most famous people (resumable)
node scripts/02_enrich_events_batch.js --limit 10   # test 10 first
node scripts/02_enrich_events_batch.js               # full run

# Resume after interruption (skips already-done people):
node scripts/02_enrich_events_batch.js
```

### Notes
- Events are skipped if a similar event already exists within ±20 days in the same category (Jaro-Winkler dedup)
- New events use `origin = 'ai_web'` to distinguish from ADB data (`origin = 'adb'`)
- `id_user = 59116` (system import user) since column is NOT NULL
- Batch rate limit: 3s between requests
- Progress saved to `scripts/.enrichment_progress.json` — can be resumed at any time

## POST /api/eclipse-life-pattern

**PHP:** `eclipse-life-pattern.php`
**Calculator:** `calculators/eclipse_life_pattern_calculator.js`

Detects the Brennan / Nick Dagan Best **eclipse-birth → life-events-on-eclipses** pattern, plus Kelly Surtees' **Sun/Moon time-lord** personal filter.

### What it answers

1. Was this person born near an eclipse? (closest before/after + days)
2. For each life event: how many days from the nearest eclipse?
3. KS filter: is the annual profection time lord Sun or Moon? → eclipses louder that year

### Request body

```json
{
  "birth": {
    "date": "1946-06-14",
    "time": "10:54",
    "timezone": "America/New_York",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "events": [
    { "date": "2017-08-21", "category": "WORK", "detail": "Great American Eclipse early in presidency" },
    { "date": "2024-04-08", "category": "WORK", "detail": "Total solar eclipse during campaign year" }
  ],
  "asOf": "2026-07-20",
  "birthOrbDays": 7,
  "eventOrbDays": 7
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birth` | object | required* | Birth data (*or `username` / flat `birthDate`) |
| `birth.date` | string | required | YYYY-MM-DD |
| `birth.time` | string | recommended | HH:MM — needed for accurate KS ASC/profection |
| `birth.latitude` / `longitude` | number | recommended | Required for KS filter |
| `birth.timezone` | string | optional | Default UTC |
| `username` | string | optional | Load birth from DB; body fields override |
| `events` | array | optional | Life events to score vs eclipses |
| `events[].date` | string | required if event | YYYY-MM-DD |
| `events[].category` | string | optional | e.g. WORK, Health, RELATIONSHIP |
| `events[].detail` | string | optional | Free text |
| `asOf` | string | optional | YYYY-MM-DD for top-level KS filter (default: today) |
| `birthOrbDays` | number | optional | Birth near-eclipse orb (default **7**, Brennan) |
| `eventOrbDays` | number | optional | Event near-eclipse orb (default **7**) |

### Response fields

| Field | Meaning |
|-------|---------|
| `birthEclipse.bornNearEclipse` | true if closest eclipse within `birthOrbDays` |
| `birthEclipse.closest` | Nearest eclipse: date, type, sign, `daysFromBirth`, direction |
| `birthEclipse.closestBefore` / `closestAfter` | Nearest on each side of birth |
| `ksFilter.timeLord` | Annual profection ruler at `asOf` |
| `ksFilter.eclipsesLoudThisYear` | true if time lord is **Sun** or **Moon** (KS) |
| `ksFilter.reason` | Short interpretive note |
| `events[].eclipse.withinOrb` | Event within `eventOrbDays` of an eclipse |
| `events[].eclipse.daysFromEvent` | Signed days (negative = eclipse before event) |
| `events[].ksFilter` | Same KS filter evaluated at the event date |
| `summary` | Hit counts, bornNearEclipse, eventHitRate, pattern note |

### Method notes

- **Brennan / NDB** (Astrology Podcast eps. 423, 425, 428, 524, 527, 530, 532): eclipse birth → major life events cluster near future eclipses; closer = more potent.
- **KS**: eclipses are not automatically dramatic; louder when annual time lord is Sun (Leo year) or Moon (Cancer year). Otherwise often not a major personal driver unless angular hits fire.
- Eclipse detection uses Swiss Ephemeris lunations with Moon near a lunar node (historical — not limited to 2019–2028).

### Example curl

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/eclipse-life-pattern.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birth": {
      "date": "1946-06-14",
      "time": "10:54",
      "timezone": "America/New_York",
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "events": [
      { "date": "2017-08-21", "category": "WORK", "detail": "Great American Eclipse" }
    ],
    "asOf": "2026-07-20"
  }'
```

### Birth-only quick check

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/eclipse-life-pattern.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birth": {
      "date": "1982-06-21",
      "time": "21:03",
      "timezone": "Europe/London",
      "latitude": 51.5074,
      "longitude": -0.1278
    }
  }'
```

---

## POST /api/circumambulations

**PHP:** `circumambulations.php`
**Calculator:** `calculators/circumambulation_calculator.js`

Hellenistic time lord technique (Demetra George T3). Two independent clocks run in parallel:
- **Clock A — primary time lord**: the releaser moves through Egyptian bound divisions; the bound ruler at the native's current age is the primary lord.
- **Clock B — participating time lord**: degree-exact encounters — every natal body (7 planets + nodal axis) casts rays onto fixed zodiacal degrees; the most recent contact before the native's age is the active participating lord.

Arc is measured in **oblique ascension** at the birth latitude (Ptolemy key: 1° OA = 1 year), not in raw ecliptic longitude. Validated against Astro-Seek "Primary Directions & Ptolemy key" results.

**Additive fields (2026-09-11):**
- `periodQuality` — Abu Ma'shar's full benefic/malefic combination matrix, reusing `/api/planetary-condition`'s own `functionalNature`/`category`/`aspectRelations` rather than a new dignity system. Includes a narrow, deliberately restrictive `crisis` classification (primary AND active participating lord both malefic AND both natally afflicted) plus a `lordOfYear` cross-check from `/api/profection`.
- `participatingTimeLords[].natalAspectToPrimary` / `.activatesNatalAspect` — whether this participant's *natal* whole-sign aspect to the primary time lord's natal sign matches the aspect ray that currently makes it a participant. When true, the natal relationship between the two lords is considered strongly activated (Demetra George, Lesson 4). Top-level `hasActivatedNatalAspect` is `true` if any entry in the array has this flag set.

### Request body

```json
{
  "birthDate": "1929-07-07",
  "birthTime": "08:30",
  "latitude": 19.4326,
  "longitude": -99.1332,
  "timezone": "America/Mexico_City",
  "targetDate": "1953-01-01",
  "releaser": "ascendant"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `birthDate` | string | ✅ | YYYY-MM-DD |
| `birthTime` | string | ✅ | HH:MM (local time) |
| `latitude` | number | ✅ | Signed decimal degrees (negative = south) |
| `longitude` | number | ✅ | Signed decimal degrees |
| `timezone` | string | ✅ | IANA timezone |
| `targetDate` | string | optional | YYYY-MM-DD; defaults to today (noon) |
| `releaser` | string | optional | `ascendant` (default), `sun`, `moon`, `fortune` |

### Response

Result wrapped in `{ success, data, timestamp }`. All ages in tropical years (365.2425 d).

```json
{
  "success": true,
  "data": {
    "input": { "nativeAge": 45.79, "releaser": "ascendant" },
    "chart": { "isDayChart": false },
    "releaserPosition": { "sign": "Leo", "degree": 29.65 },
    "directedPosition": { "sign": "Libra", "degree": 2.11 },

    "primaryTimeLord": {
      "planet": "Saturn",
      "bound": { "sign": "Libra", "degFrom": 0, "degTo": 6 },
      "periodStartAge": 42.83,
      "periodEndAge": 51.26,
      "natalHouse": 3,
      "activityLevel": "cadent",
      "natalCondition": "Libra 3.9° · H3 · exalted · contrary to sect",
      "interpretation": "Saturn governs this stretch of life from the 3rd house…",
      "nextLord": "Mercury",
      "nextIsContinuation": false
    },

    "activeParticipatingTimeLord": {
      "planet": "Jupiter",
      "planetSign": "Virgo",
      "planetDegree": 29.32,
      "aspectType": "conjunction",
      "direction": null,
      "raySign": "Virgo",
      "rayDegree": 29.32,
      "ageOfContact": 41.88,
      "natalAspectToPrimary": null,
      "activatesNatalAspect": false,
      "natalCondition": "Virgo 29.3° · H2 · peregrine · contrary to sect",
      "interpretation": "At age 41.9, the releaser arrives on the body of Jupiter…"
    },
    "nextParticipatingTimeLord": { "planet": "Saturn", "ageOfContact": 48.39, "aspectType": "conjunction" },
    "participatingTimeLords": [ /* all contacts 0–100, ascending by age; each entry also carries natalAspectToPrimary/activatesNatalAspect */ ],
    "hasActivatedNatalAspect": true,

    "periodQuality": {
      "classification": "mixed",
      "primary": { "planet": "Saturn", "functional": "malefic", "category": "mixed" },
      "participating": { "planet": "Jupiter", "functional": "benefic", "category": "not_as_bad_as_it_could_be", "aspectType": "conjunction" },
      "crisisFlags": [],
      "mitigatingFactors": ["participating_protected"],
      "lordOfYear": { "planet": "Venus", "category": "mixed", "note": "This year's profected lord is moderately conditioned." },
      "note": "Saturn (malefic, mixed) as primary time lord, paired with Jupiter (benefic, not_as_bad_as_it_could_be) as participating time lord via conjunction — classification: mixed. Mitigating factors present: participating_protected — this softens the reading; the period is unlikely to be uniformly difficult. Check the current year's profected lord (Venus, mixed) for the specific years of relief or intensity within this window."
    },

    "handingOverHistory": [
      /* every bound handover 0–100, ascending by age — same horizon as timeline/participatingTimeLords */
      { "fromLord": "Mercury", "toLord": "Venus", "ageOfTransition": 10.4,
        "transition": "neutral→benefic", "isContinuation": false }
    ],

    "timeline": [
      { "kind": "bound", "age": 0.5, "sign": "Virgo", "degree": 0, "lord": "Mercury", "isContinuation": false },
      { "kind": "ray",   "age": 1.6, "sign": "Virgo", "degree": 0.75, "lord": "Sun",
        "aspectType": "sextile", "direction": "dexter" }
    ]
  },
  "timestamp": "2026-08-08T12:00:00.000Z"
}
```

### Field reference

| Field | Description |
|-------|-------------|
| `releaserPosition` | Natal position of the releaser (fixed) |
| `directedPosition` | Where the releaser has been directed to at the target date |
| `primaryTimeLord.nextLord` | Ruler of the next bound — who takes over at `periodEndAge` |
| `primaryTimeLord.nextIsContinuation` | True when next bound has the same ruler (Virgo→Libra continuation case) |
| `activeParticipatingTimeLord` | Latest ray/body contact at or before native's age; null before first contact |
| `nextParticipatingTimeLord` | Next contact due after native's age |
| `participatingTimeLords` | All contacts across lifespan (0–100), ascending by age |
| `direction` | `"dexter"` (against zodiacal order) / `"sinister"` (with it) / `null` for conjunction & opposition |
| `participatingTimeLords[].natalAspectToPrimary` | Whole-sign aspect (or `null` if in aversion) between the primary time lord's natal sign and this participant's natal sign — a static chart-level fact, independent of current age |
| `participatingTimeLords[].activatesNatalAspect` | `true` when `natalAspectToPrimary` equals this entry's `aspectType` — the natal relationship between primary and participant is the same aspect that currently makes the participant active, so its themes are heightened (Demetra George, Lesson 4) |
| `hasActivatedNatalAspect` | `true` if any entry in `participatingTimeLords` has `activatesNatalAspect: true` — quick top-level check without scanning the array |
| `periodQuality.classification` | `favorable` \| `good` \| `mixed` \| `challenging` \| `crisis` — Abu Ma'shar's four-way benefic/malefic combination matrix, built from primary/participating `functional` × `category` (see `/api/planetary-condition`) |
| `periodQuality.crisisFlags` | Which crisis triggers fired (e.g. `primary_and_participating_both_malefic`, `primary_afflicted`, `malefic_to_malefic_handover`, `bodily_conjunction_to_natal_malefic`) — empty if none |
| `periodQuality.mitigatingFactors` | Which mitigation checks passed (e.g. `participating_protected`, `benefic_bonification_present`, `favorable_lord_of_year`) — presence should soften the reading even under a `crisis` classification |
| `periodQuality.lordOfYear` | This year's profected Lord of the Year and its `/api/planetary-condition` category (from `/api/profection`), for the annual relief/intensity cross-check within a multi-year window; `null` if profection data was unavailable |
| `periodQuality.primary` / `.participating` | `{ planet, functional, category }` mirrored verbatim from `/api/planetary-condition` — never re-derived. `.participating` is `null` when there's no active participating lord, or when the active participant is a node (outside the benefic/malefic matrix) |
| `handingOverHistory` | Every bound handover across the full lifespan (0–100), ascending by age — same horizon as `timeline`/`participatingTimeLords`, not capped at the native's current age |
| `handingOverHistory.isContinuation` | True when same ruler continues across a sign boundary |
| `timeline` | Both clocks merged, ascending by age, from age 0 to 100 |

### Method notes

- **Two independent clocks** — a bound change does not reset the participating lord; a ray contact does not change the primary lord.
- **Oblique ascension per degree** — not a sign-granular table. Timing changes with latitude: at Paris (48.85°N) the first Aries bound hands over at ~2.78 y, at the equator at ~5.51 y, at 48.85°S at ~8.24 y.
- **Nodes cast rays** — North Node (`NNode`) and South Node (`SNode`) are included as ray-casting bodies. Both rays land on the same degree at the same age; they are distinguished by planet name.
- **Mercury sect** — diurnal when oriental (rising before the Sun), nocturnal when occidental.
- **Fortune** — computed internally: `day: Asc + Moon − Sun`, `night: Asc + Sun − Moon`.
- **Continuation** — Virgo→Libra and Libra→Scorpio keep the same bound ruler across the sign boundary. The `isContinuation` flag marks these instead of labelling them as a handover.

### `periodQuality` classification matrix

| primary.functional | participating.functional | primary afflicted? | participating afflicted? | `classification` |
|---|---|---|---|---|
| benefic | none / neutral | no | — | `favorable` — benefic alone, well-conditioned, "general good fortune... being well-known" |
| benefic | none / neutral | yes | — | `good` — benefic alone, poorly conditioned; still net-positive, just a smaller version of the promise |
| benefic | benefic | no | no | `favorable` |
| benefic | benefic | yes (either) | — | `mixed` — benefics "never bad, but in poor condition, limited in how much good they can do" |
| benefic | malefic | any | any | `mixed` — "good fortune, managed with difficulty" |
| malefic | benefic | any | any | `mixed` — "subject to the malefic's difficulty, but rescued/softened" |
| malefic | none / neutral | no | — | `good` — malefic alone, well-dignified, "success in its own category" |
| malefic | none / neutral | yes | — | `challenging` — malefic alone, poorly dignified |
| malefic | malefic | no (either) | no (either) | `challenging` |
| malefic | malefic | **yes** | **yes** | **`crisis`** |
| either lord `complex_high_variance`, or condition data unavailable | — | — | — | `mixed` (nuance carried in `note`, per `/api/planetary-condition`'s own instruction not to flatten `complex_high_variance` into a single verdict) |

`category ∈ {poor_challenged, complex_high_variance}` counts as "afflicted"; `category ∈ {very_good, good}` counts as "well-conditioned". Only one row yields `crisis` — deliberately narrow, matching Demetra George's own restraint ("**some** of the real crisis periods," not every malefic/malefic pairing). Source: Demetra George, Circumambulation course, Lesson 4 (Abu Ma'shar's combination matrix).

**Important — `primary.functional`/`participating.functional` in the JSON response is the raw `/api/planetary-condition` label, not a clean tri-state.** `functionalNature.functional` can be `benefic`, `malefic`, `luminary` (Sun/Moon/unflipped Mercury), `functional_benefic` (a well-conditioned malefic — or a great-condition Sun/Mercury per Lesson 12), or `limited_benefic` (a badly-conditioned benefic). The classification matrix above is bucketed on `functionalNature.baseNature` (true planetary nature), not this label directly — a well-conditioned Saturn stays in the **malefic** row (that's exactly the "malefic alone in good condition" case), it does not jump to the benefic row just because its label flipped to `functional_benefic`. The one exception is a luminary flipped to `functional_benefic` in great condition, which is treated as benefic per Lesson 12. "none / neutral" in the table covers both no active participant and a functionally-neutral one (an unflipped luminary/Mercury).

### Acceptance test (Astro-Seek validated)

Birth 1980-10-24, ASC Leo 29°39′, latitude 50.85°N. At age 45.79 (targetDate 2026-09-11):
- Primary lord: **Saturn** (Libra 0–6, age 42.83–51.26) ✅
- Active participating: **Jupiter conjunction** (age 41.88) ✅
- Next participating: **Saturn conjunction** (age 48.39) ✅
- `periodQuality`: Saturn malefic/`mixed`, Jupiter benefic/`not_as_bad_as_it_could_be` → `classification: "mixed"`, `mitigatingFactors: ["participating_protected"]` — confirmed against the live endpoint 2026-09-11 ✅
- `handingOverHistory` spans the full 0–100 horizon (not capped at `nativeAge`): 11 handovers from age 0.48 to 85.17, plus a 12th (Mars→Venus) at age 95.11 — matches the `kind: "bound"` rows in `timeline` one-for-one, confirmed 2026-09-17 ✅

### Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/circumambulations.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1980-10-24","birthTime":"01:41","latitude":50.85,"longitude":4.35,"timezone":"Europe/Brussels"}'
```

---

## POST /api/planetary-condition

**PHP:** `planetary-condition.php`
**Calculator:** `calculators/planetary_condition_calculator.js`

Full Demetra George Techniques 9–15 ordered planetary condition assessment. Returns a per-planet analysis with sect, sect rejoicing, zodiacal dignity (domicile/exaltation/triplicity/bounds), solar phase + phasis, lunar phenomena, maltreatment/bonification (7 layers), and a qualitative grade (A+ to F or "complex/high-variance").

**Important**: does NOT implement the medieval point-sum (5/4/3/2/1). Grade is relative within the chart, per Demetra's explicit teaching.

**Additive `knowledge/planet.md` layer (2026-09-09):** each planet also carries the practical Time Lords categorical fields, computed from the same named factors above (never a hidden sum) — `category`, `strongPositives`/`strongNegatives`, `factorsUp`/`factorsDown`, `verdict`, `house` (angularity/topicQuality/joy, §3.8), `hemisphere` (eastern/western by house 1–6 vs 7–12, §3.9 — NOT solar phase), `witnessedByLights`, `guestHost` (§10 domicile-lord reception), `canItSee` (§4.3 three-check administrator score), `dorotheusTicks` (§7 LOY checklist), and `functionalNature` (§5 benefic/malefic function-flip). The existing `grade` (A+–F) field is unchanged for backward compatibility, but `category` is the field that matches Demetra's actual teaching — prefer it in new client code.

### Request body

```json
{
  "birthDate": "1907-07-06",
  "birthTime": "04:30",
  "latitude": 37.0902,
  "longitude": -95.7129,
  "timezone": "America/Chicago"
}
```

| Field | Type | Required |
|-------|------|----------|
| `birthDate` | string | ✅ |
| `birthTime` | string | ✅ |
| `latitude` | number | ✅ |
| `longitude` | number | ✅ |
| `timezone` | string | ✅ |

### Response

```json
{
  "success": true,
  "chart": { "isDayChart": false, "sect": { "chartSect": "night", "sectLight": "Moon" } },
  "planets": {
    "Mars": {
      "position": { "longitude": 295.8, "sign": "Capricorn", "degree": 25.8, "house": 1, "retrograde": true },
      "sect": { "ofTheSect": false, "role": "malefic_contrary_to_sect", "team": "nocturnal" },
      "sectRejoicing": { "hemisphereRejoicing": false, "signRejoicing": false, "phaseRejoicing": false, "note": "Mars phase-rejoicing is textually disputed..." },
      "zodiacalDignity": {
        "dignities": ["exaltation"],
        "debilities": [],
        "exaltation": true,
        "triplicity": { "element": "Earth", "primary": "Moon", "secondary": "Venus", "isOwnTriplicity": false },
        "bound": { "lord": "Saturn", "isOwnBound": false, "lordConditionInSign": "peregrine" }
      },
      "solarPhase": {
        "phase": "lying_hidden",
        "underBeams": true,
        "combust": false,
        "retrograde": true,
        "phasis": { "inPhasis": false }
      },
      "aspectRelations": {
        "maltreatment": [{ "layer": 7, "type": "in_6th_or_12th_house", "house": 1 }],
        "bonification": [],
        "complex": false
      },
      "grade": "complex/high-variance",
      "gradingFactors": ["contrary-to-sect (−)", "exaltation (++)", "under the beams (−)", "retrograde (−)"],
      "interpretation": "Mars (malefic, Capricorn H1): mixed — grade complex/high-variance. Key factors: contrary-to-sect (−); exaltation (++); under the beams (−); retrograde (−). COMPLEX: context-dependent outcome.",
      "house": { "number": 1, "angularity": "angular", "topicQuality": "good", "joy": false },
      "hemisphere": "eastern",
      "witnessedByLights": { "bySun": false, "byMoon": true, "either": true },
      "guestHost": { "host": "Saturn", "hostSign": "Aquarius", "isOwnHost": false, "hostSees": false, "note": "Saturn (domicile lord) is in aversion to this placement — guest's topics are unsupported/fragile (Demetra's guest/host rule, §10)." },
      "canItSee": { "rulesHouses": [4, 11], "seesRuledHouses": [{ "house": 4, "sees": true }, { "house": 11, "sees": false }], "allRuledHousesSeen": false, "seesNatalAscendant": true, "seesNatalPosition": null, "score": "1/2", "note": "..." },
      "dorotheusTicks": { "good": { "eastern": true, "direct": false, "visible": false, "witnessedByLights": true, "ownDignity": true }, "bad": { "western": false, "underBeams": true, "retrograde": true, "notWitnessedByLights": false, "alienSign": false }, "goodCount": 3, "badCount": 2 },
      "functionalNature": { "baseNature": "malefic", "functional": "malefic", "note": null },
      "category": "complex_high_variance",
      "strongPositives": ["exaltation"],
      "strongNegatives": ["contrary_to_sect", "under_the_beams", "retrograde"],
      "factorsUp": ["exaltation (++)"],
      "factorsDown": ["contrary-to-sect (−)", "under the beams (−)", "retrograde (−)"],
      "verdict": "Mars: complex high variance. Mixed does not mean average — do not sum plus/minus into one number. When activated, expect BOTH real benefit and real difficulty. Up: exaltation (++). Down: contrary-to-sect (−); under the beams (−); retrograde (−)."
    }
  },
  "counselingNote": "Grades are relative within this chart. A planet in poor condition describes a challenge, not a guaranteed personal trauma. Always cross-reference with timing techniques."
}
```

#### The `category` field (preferred — matches `planet.md` exactly)

| Category | Meaning |
|----------|---------|
| `very_good` | Of the sect (or functional benefic), own dignity, angular/joy, not maltreated — 3+ strong positives, no strong negatives |
| `good` | Net positive, 1–2 strong positives, no strong negatives |
| `mixed` | Clear strong positives AND strong negatives both present — will show BOTH when activated, not an average |
| `not_as_bad_as_it_could_be` | Contrary-to-sect / debilitated but protected (good house, visible, direct, not fragile) |
| `not_ideal_fragile` | Host (domicile lord) cannot see it, and/or cannot see the houses it administers, and/or (for the Moon specifically) a difficult house — frailty, not just "bad" |
| `poor_challenged` | Strong negatives with no protective factor and no strong positive |
| `complex_high_variance` | Degree-based bonification AND maltreatment both fire, with an enclosure on at least one side — highest-stakes mixed case |

`strongPositives`/`strongNegatives` name exactly which named factors drove the category (never a numeric score). **These do NOT include `guestHost`/`canItSee` frailty** — see `fragilityFlags` below; a planet with strong dignity/sect/phase does not get demoted to `mixed` just because it can't see the houses it administers.

**`fragilityFlags`** (fixed 2026-09-09 — was previously merged into `strongNegatives`, which wrongly forced `category: "mixed"` on planets like an of-the-sect domicile Mars with zero real debility, just because it couldn't see the houses it rules): `host_cannot_see_guest` / `cannot_see_houses_it_administers`, i.e. `guestHost.hostSees === false` and `canItSee.allRuledHousesSeen === false` — the two flags Demetra uses for "the boss has gone to the Amazon and cannot be reached" (Lesson 13) / "unsupported guest" (§10). These are about a planet's fitness to **administer** a house (time lord, house lord, ZR sub-lord) — they only steer the category towards `not_ideal_fragile` when there is no strong positive already present (or, for the Moon, always shade toward fragile per Demetra's explicit natal example).

**Maltreatment/bonification layers**: 0=whole-sign testimony, 1=degree-based 3° connection, 2=enclosure 7°, 3=overcoming, 4=striking with a ray, 5=opposition by badly-placed malefic, 6=domicile lord in bad house, 7=6th/12th placement.

### How to interpret the output

**Two parallel outputs, same factors:** `grade` (A+–F) is the older T9–T15 numeric-weight synthesis; `category` (see table above) is the `planet.md` categorical verdict Demetra actually teaches, read straight off `strongPositives`/`strongNegatives`/`factorsUp`/`factorsDown` with no hidden sum. They're derived from the same factor list and usually agree in direction, but `category` is authoritative for "mixed ≠ average" — e.g. a `B−`/`C` grade with `category: "mixed"` must still be narrated as two distinct outcomes (see `verdict`), never flattened to "middling." Prefer `category` in new client code; `grade` stays only for backward compatibility.

#### The ordered walkthrough (Demetra George's method)

The grade is NOT a point-sum. Read the `gradingFactors` array in order — each factor either strengthens or weakens the planet's ability to deliver its natal promise. The ordering matters: sect comes first because it sets the baseline authority; the later factors (maltreatment) can override earlier positive ones when they stack.

**The six-step order** (per `gradingFactors`):

1. **Sect** — first and most heavily weighted. `of-the-sect (+)` vs `contrary-to-sect (−)`. Contrary-to-sect planets start from a position of reduced authority: even a strong contrary-to-sect benefic tends to produce outcomes that are good in themselves but not in the native's long-term best interest (Valens).

2. **Sect rejoicing** — minor shading only. Three sub-conditions (hemisphere/sign/phase). 2–3/3 rejoicing = small bonus; 0/3 = minor penalty. Do not over-weight this.

3. **Zodiacal dignity** — domicile and exaltation are the strongest positives; detriment and fall the strongest negatives. Multiple dignities stack (domicile + own triplicity = markedly stronger than either alone). Peregrine (no rulership) = neutral, not harmed.

4. **Solar phase** — direct + visible + in effective phase (morning or evening star) = functional; retrograde + under beams = reduced. Cazimi (within 1° of Sun) is a powerful exception that overrides combustion. Chariot (under beams but in own sign) mitigates but does not cancel combustion. `phasis: inPhasis` = intense period around birth — amplifies ALL other factors, for better or worse.

5. **Lunar phenomena** — mostly relevant for the Moon itself: VOC (Hellenistic: no aspect in 30° ahead) = inactive; under the bond (±15° of lunation) = constrained; eclipse birth = survival-intensity natal imprint. For other planets: check if Moon is applying to them (helps ground their significations into concrete events).

6. **Aspect relations** — maltreatment is weighted heavily downward, especially when 2+ layers stack on one planet. Bonification, especially double-benefic trine support ("overcome by both benefics"), is weighted heavily upward and can substantially offset a detriment or fall but does not fully erase it.

#### Reading the grade

| Grade | Meaning |
|-------|---------|
| `A+` / `A` | Well-conditioned — can fully deliver natal promise; setbacks are temporary |
| `B+` / `B` | Supported — delivers most of its promise with some friction |
| `B−` / `C` | Mixed — some capacity to deliver, but with notable obstacles or limitations |
| `D` / `F` | Challenged — struggles to deliver; areas this planet rules will require extra effort or outside support |
| `complex/high-variance` | Both strong bonification AND strong maltreatment present — outcomes are context-dependent; do not reduce to a single verdict |

**Grades are RELATIVE within this chart** — compare Jupiter to Saturn within the same chart, not against an absolute scale. The planet with the highest grade has the most authority in this chart; the lowest grade flags the area most in need of support.

#### What a poor grade actually means

From Demetra's closing teaching: a planet in poor condition describes a *problem area the chart makes available*, not a guaranteed personal trauma. It may equally describe a cause the person champions for others, born from empathy. Always cross-reference with timing (Techniques 1–8) — a poorly conditioned planet that is activated by multiple timing systems simultaneously can still produce its promise. When surfacing poor-condition verdicts in client-facing text, avoid deterministic language: prefer "this area may require extra effort or outside support" over "this will go badly."

#### The `complex/high-variance` tag

When a planet has both strong bonification (e.g. enclosed by benefics) AND strong maltreatment (e.g. struck with ray by a malefic), do not average them into a middle grade. Flag it explicitly as complex. Examples:
- The Moon enclosed by benefics but also enclosed by malefics → outcomes depend entirely on which force is stronger at the moment of activation (timing technique)
- Mars exalted + in phasis + retrograde + contrary-to-sect → intensely powerful AND intensely problematic; context determines which face shows

#### Connecting to timing techniques

Planetary condition answers "how well can this planet deliver?" — it says nothing about WHEN. To answer "when will this planet's significations manifest?":
- Cross-reference with `/api/circumambulations` (is this planet currently a primary or participating time lord?)
- Cross-reference with `/api/profection` (is this planet the Lord of the Year?)
- Cross-reference with `/api/planetary-periods` (does the native's current age trigger this planet's minor years?)
- Convergence rule: the more timing systems pointing to the same planet simultaneously, the more certain the manifestation — even a poorly conditioned planet activated by all systems will produce something.

### Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/planetary-condition.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1907-07-06","birthTime":"04:30","latitude":37.0902,"longitude":-95.7129,"timezone":"America/Chicago"}'
```

---

## POST `/api/zodiacal-releasing`

**Added:** 2025 (updated 2026-07-23 — DG vs CB distinction implemented)
**PHP file:** `zodiacal-releasing.php`
**Calculator:** `calculators/zodiacal_releasing_calculator.js`
**Purpose:** Computes all four levels of Zodiacal Releasing (Vettius Valens / Demetra George) from any of 18 Arabic Lots, with DG-accurate peak ranking, Valens Peak flag, dual-track angularity, Loosing of the Bond markers, angular triads, and lot condition warnings.

---

### ZR Foundations

Zodiacal Releasing is a **nested time-lord technique**. A starting Lot "releases" through the zodiac, spending its domicile lord's minor years in each sign.

```
L1 (years)       → multi-year chapter theme
  L2 (months)    → sub-theme / monthly mood
    L3 (2.5 days)  → short windows / daily focus
      L4 (5 hours) → precise event timing
```

**Period lengths** (all levels use the same values in their respective unit):

| Sign | Lord | Years/Months/etc |
|------|------|-----------------|
| Aries | Mars | 15 |
| Taurus | Venus | 8 |
| Gemini | Mercury | 20 |
| Cancer | Moon | 25 |
| Leo | Sun | 19 |
| Virgo | Mercury | 20 |
| Libra | Venus | 8 |
| Scorpio | Mars | 15 |
| Sagittarius | Jupiter | 12 |
| **Capricorn** | **Saturn** | **27** ← not 30 (Valens exception) |
| Aquarius | Saturn | 30 |
| Pisces | Jupiter | 12 |

---

### Demetra George vs Chris Brennan — Key Differences

This API implements DG's method. Where DG and CB differ, fields are clearly named to reflect which model is in use.

#### 1. Peak Periods — Shared anchor, different ranking

**Both DG and CB** measure peaks from the **Lot of Fortune's angular signs** (1st, 4th, 7th, 10th from Fortune), regardless of which lot you're releasing from.

**Where they differ:**

| | DG (Hellenistic retreat L7–L9) | CB (Astrology Podcast ep. 192) |
|---|---|---|
| **1st & 10th from Fortune** | **MAJOR** peaks — strongest energeia | "Major peaks" in software |
| **4th & 7th from Fortune** | **Moderate** — lesser angular, still energized | Treated equally as "peak periods" |
| **Peak ≠ good** | Explicit: natal condition determines quality | Explicit: same |
| **Topic of peak** | Must use natal house of releasing sign | Fortune houses define the peak *flag* |

In the API response, `peakType: "major"` = 1st/10th from Fortune; `peakType: "moderate"` = 4th/7th. `isPeakPeriod: true` covers both (backward-compatible).

#### 2. Valens Peak (`valensPeak`) — DG-specific, NOT in CB

DG identifies a **Valens Peak** as a specific subset: releasing from **Spirit** (Lot of Daimon) to **Fortune's own sign or the 10th from Fortune**. This is Valens' original passage on **eminence, reputation, and public recognition**.

- Only present when `lotType: "spirit"`
- Represents the classic Valens "peak of fortune from the daimon track"
- CB does not use this term — it is DG's close reading of Valens
- In the API: `valensPeak: true` on the period + `dualTrack.fortune.valensPeak: true`

#### 3. Dual-Track Angularity — DG's "natal first" principle

DG teaches evaluating each period against **two independent axes**:

| Track | Source | What it measures |
|-------|--------|-----------------|
| **Natal / cosmic** | Natal whole-sign houses | Magnitude of intentional action, recognition — the Daimon track |
| **Fortune** | Angular signs from Fortune | Energeia / activity level — the Fortune track |

A period can be natal-angular (high Daimon magnitude) but cadent from Fortune (quieter material life) — or the reverse. Read both. Same L1 chapter can show success on one track while struggling on the other (DG's Snowden example in L10).

In the API: each period now has `dualTrack.natal` and `dualTrack.fortune`.

#### 4. Spirit's Topic — DG warning

DG explicitly warns: **do not assume Spirit = career**. Spirit's topic must be derived from the **natal house Spirit falls in** and the **condition of its lord**. The response now includes `releasing.spiritNatalHouse` for this reason.

Example: Spirit in 4th (homes/lands) with Saturn lord in 2nd → historic preservation, fundraising — not "editor career."

#### 5. Angular Triad — Schmidt/modern, NOT Valens

Both DG and CB teach the angular triad (preparatory → peak → carry-forward). DG explicitly flags this as **Schmidt's contemporary method, not from Valens**. Peaks at Fortune's 1st/10th appear strongly without the triad model.

In the API: `angularTriad.source: "schmidt"` on every triad — clearly label this in UX if presenting it to users.

#### 6. Cadent Lot Warning — DG only

DG (citing Valens): if the releasing lot is **cadent from the ASC**, ZR "falls and misses" — it speaks less clearly. Prefer the better-conditioned lot. The response includes `lotCondition` with this warning when applicable.

---

### Loosing of the Bond (LB)

When an L1 allotment exceeds 17 years 7 months, the sequence **jumps to the opposite sign** instead of continuing. Always a dramatic reversal or turning point.

| Sign | Duration | Jumps to |
|------|----------|----------|
| Gemini | 20y | Sagittarius |
| Cancer | 25y | Capricorn |
| Leo | 19y | Aquarius |
| Virgo | 20y | Pisces |
| Capricorn | 27y | Cancer |
| Aquarius | 30y | Leo |

Marked as `isLoosingOfBond: true` and `markers: ["LB"]`. The period just before LB gets `markers: ["pre-LB"]` — foreshadowing of the coming reversal (contemporary observation; DG has not fully confirmed).

#### Cu (Culmination) at L2

When an L2 sub-period reaches the **10th sign from the L1 sign** → `markers: ["Cu"]` and `isCulmination: true`. The month when L1 themes crystallize most intensely.

---

### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `birthDate` | string | ✅ | — | `"YYYY-MM-DD"` |
| `birthTime` | string | ✅ | — | `"HH:MM"` |
| `timezone` | string | ✅ | — | IANA tz (e.g. `"Europe/Brussels"`) |
| `latitude` | number | ✅* | — | Decimal degrees |
| `longitude` | number | ✅* | — | Decimal degrees |
| `city` | string | ✅* | — | Fallback if lat/lon absent |
| `country` | string | ✅* | — | Fallback if lat/lon absent |
| `username` | string | ➖ | — | Load birth data from DB |
| `lotType` | string | ➖ | `"fortune"` | Which lot to release from (see table below) |
| `targetDate` | string | ➖ | today | `"YYYY-MM-DD"` — which date to find the current period for |
| `maxLevels` | number | ➖ | `3` | How many nested levels to generate (1–4) |
| `l4Year` | number | ➖ | — | Year to generate L4 for (expensive; only request when needed) |
| `limitDate` | string | ➖ | today+20y | Upper boundary for period generation |

\* Provide `latitude`+`longitude` **or** `city`+`country` (auto-geocoded via Nominatim).

#### Available Lot Types (`lotType`)

| Value | Name | Themes |
|-------|------|--------|
| `fortune` | Lot of Fortune | Body, health, material circumstances, accidental fortune |
| `spirit` | Lot of Spirit | Career, intentional actions, motivation, psychology |
| `eros` | Lot of Eros | Desire, love, what the native is drawn toward |
| `father` | Lot of Father | Father, authority figures |
| `mother` | Lot of Mother | Mother, nurturing figures |
| `children` | Lot of Children | Children, fertility, creative offspring |
| `death` | Lot of Death | Endings, mortality themes |
| `victory` | Lot of Victory | Success, achievement |
| `nemesis` | Lot of Nemesis | Hidden enemies, downfall |
| `necessity` | Lot of Necessity | Compulsion, fate |
| `courage` | Lot of Courage | Bravery, willpower |
| `siblings` | Lot of Siblings | Brothers, sisters, close community |
| `marriage` | Lot of Marriage | Partnership, commitment |
| `illness` | Lot of Illness | Health challenges |
| `basis` | Lot of Basis | Foundation, support |
| `exaltation` | Lot of Exaltation | Honor, elevation |
| `accusation` | Lot of Accusation | Conflict, legal matters |
| `theft` | Lot of Theft | Loss, betrayal |
| `treachery` | Lot of Treachery | Deception, enemies |

For **Demetra George's standard practice**: always run both `fortune` and `spirit`. Fortune = body and material arc; Spirit = career and intentional arc.

---

### Response Structure

```json
{
  "personInfo": { "firstName": "...", "lastName": "..." },
  "chartType": "day",

  "natalChart": {
    "planets": {
      "Sun": { "longitude": 203.4, "sign": "Libra", "degree": 23.4, "house": 5, "retrograde": false }
    },
    "ascendant": 90.1,
    "mc": 0.5,
    "sect": "day"
  },

  "lots": {
    "fortune":    { "sign": "Gemini",       "degree": 14.5 },
    "spirit":     { "sign": "Sagittarius",  "degree": 14.5 },
    "eros":       { "sign": "...",          "degree": 0    },
    "nemesis":    { "sign": "...",          "degree": 0    },
    "necessity":  { "sign": "...",          "degree": 0    },
    "courage":    { "sign": "...",          "degree": 0    },
    "victory":    { "sign": "...",          "degree": 0    },
    "death":      { "sign": "...",          "degree": 0    },
    "father":     { "sign": "...",          "degree": 0    },
    "mother":     { "sign": "...",          "degree": 0    },
    "children":   { "sign": "...",          "degree": 0    },
    "siblings":   { "sign": "...",          "degree": 0    },
    "marriage":   { "sign": "...",          "degree": 0    },
    "illness":    { "sign": "...",          "degree": 0    },
    "basis":      { "sign": "...",          "degree": 0    },
    "exaltation": { "sign": "...",          "degree": 0    },
    "accusation": { "sign": "...",          "degree": 0    },
    "theft":      { "sign": "...",          "degree": 0    },
    "treachery":  { "sign": "...",          "degree": 0    }
  },

  "peakPeriodSigns": {
    "first":   "Gemini",
    "fourth":  "Virgo",
    "seventh": "Sagittarius",
    "tenth":   "Pisces"
  },

  "releasing": {
    "fromLot":      "Lot of Fortune",
    "startingSign": "Gemini",
    "maxLevels":    3,
    "targetDate":   "2026-07-23",

    "currentPeriods": {
      "L1": { "sign": "Sagittarius", "ruler": "Jupiter", "startDate": "2020-01-01", "endDate": "2032-01-01", "markers": [] },
      "L2": { "sign": "Pisces",      "ruler": "Jupiter", "startDate": "2026-03-01", "endDate": "2027-03-01", "markers": ["Cu"] },
      "L3": { "sign": "Gemini",      "ruler": "Mercury", "startDate": "2026-07-20", "endDate": "2026-07-25", "markers": [] }
    },

    "periods": [],
    "angularTriads": [],
    "loosingOfBondPeriods": [],
    "foreshadowingPeriods": []
  }
}
```

---

### Response Structure (top-level)

```json
{
  "personInfo": { "firstName": "...", "lastName": "..." },
  "chartType": "day",
  "natalChart": { "planets": {}, "ascendant": 90.1, "mc": 0.5, "sect": "day" },

  "lots": {
    "fortune": { "sign": "Gemini", "degree": 14.5 },
    "spirit":  { "sign": "Sagittarius", "degree": 14.5 }
  },

  "peakPeriodSigns": {
    "major":    { "first": "Gemini", "tenth": "Pisces" },       // DG: strongest (1st/10th)
    "moderate": { "fourth": "Virgo", "seventh": "Sagittarius" }, // DG: lesser angular
    // backward-compat flat aliases:
    "first": "Gemini", "fourth": "Virgo", "seventh": "Sagittarius", "tenth": "Pisces"
  },

  "lotCondition": {
    "fortune": { "house": 11, "angularity": "succedent", "isCadent": false },
    "spirit":  { "house": 5,  "angularity": "succedent", "isCadent": false },
    "warning": null   // or a string when a lot is cadent
  },

  "releasing": {
    "fromLot": "Lot of Fortune",
    "startingSign": "Gemini",
    "spiritNatalHouse": 5,  // DG: derive Spirit's topic from here, not assumed = career
    "maxLevels": 3,
    "targetDate": "2026-07-23",
    "currentPeriods": {
      "L1": { "sign": "Sagittarius", "ruler": "Jupiter", "startDate": "...", "endDate": "...", "markers": [] },
      "L2": { "sign": "Pisces", "ruler": "Jupiter", "startDate": "...", "endDate": "...", "markers": ["Cu"] },
      "L3": { "sign": "Gemini", "ruler": "Mercury", "startDate": "...", "endDate": "...", "markers": [] }
    },
    "periods": [],
    "angularTriads": [],
    "loosingOfBondPeriods": [],
    "foreshadowingPeriods": []
  }
}
```

---

### Period Object (each element inside `releasing.periods`)

| Field | Type | Description |
|-------|------|-------------|
| `level` | number | 1, 2, 3, or 4 |
| `sign` | string | The releasing sign |
| `ruler` | string | Domicile lord of the sign |
| `duration` | number | Units count (years/months/etc) |
| `durationUnit` | string | `"years"` / `"months"` / `"days"` / `"hours"` |
| `startDate` | string | ISO 8601 |
| `endDate` | string | ISO 8601 |
| `markers` | string[] | `[]`, `["LB"]`, `["pre-LB"]`, `["Cu"]`, or combinations |
| `isPeakPeriod` | boolean | True if angular from Fortune (any of 1/4/7/10) — umbrella flag |
| `peakType` | string\|null | **DG ranking**: `"major"` (1st/10th) \| `"moderate"` (4th/7th) \| `null` |
| `valensPeak` | boolean | **DG-specific**: Spirit releasing to Fortune/10th-from-Fortune — Valens eminence flag. Always `false` when releasing from Fortune |
| `natalAngular` | boolean | Is this sign in a natal angular house (1/4/7/10 from ASC)? DG's natal-first principle |
| `dualTrack` | object | **DG dual-track** — see below |
| `isCulmination` | boolean | L2 is 10th from the L1 sign (Cu marker) |
| `isLoosingOfBond` | boolean | Follows an LB jump |
| `isForeshadowing` | boolean | Same sign as LB destination, before LB |
| `isPreparatory` | boolean | Angular triad: sign before the peak |
| `isCarryForward` | boolean | Angular triad: sign after the peak |
| `isMediumPeriod` | boolean | Succession period; less active than peak |
| `isZeroPeak` | boolean | First L1 starts at the Lot's own sign (peak from birth) |
| `housePlacement` | object | `{ house, signification }` — natal whole-sign house |
| `beneficMalefic` | object | `{ ruling, aspects }` |
| `planetsInSign` | array | Natal planets in this releasing sign |
| `planetsAspectingSign` | array | Natal planets aspecting this sign (whole sign) |
| `angularTriad` | object | On peak periods: `{ source:"schmidt", preparatory, peak, carryForward }` |
| `subPeriods` | array | Nested periods |

#### `dualTrack` object (DG dual-track angularity)

```json
"dualTrack": {
  "natal": {
    "house": 10,
    "angularity": "angular",
    "isAngular": true
  },
  "fortune": {
    "houseFromFortune": 7,
    "isPeak": true,
    "peakType": "moderate",
    "valensPeak": false
  }
}
```

- `dualTrack.natal` = cosmic/daimon track: magnitude of intentional action and recognition
- `dualTrack.fortune` = Fortune track: energeia, activity level, material/bodily engagement
- Read BOTH: a period can be natal-angular (high Daimon magnitude) AND cadent from Fortune (quieter material life) — two separate stories

---

### How to Read ZR for UX

**Fortune track (body/material arc):**
- L1 natal house from ASC = life domain in focus (read this first per DG)
- `dualTrack.fortune.isPeak` = high-activity phase on the material/bodily axis
- `peakType: "major"` (1st/10th from Fortune) = strongest active chapters
- L2 `Cu` = month when L1 themes crystallize

**Spirit track (career/intentional arc):**
- `spiritNatalHouse` tells you what Spirit actually governs — use that, not "career" by default
- `valensPeak: true` = Valens-sourced eminence moment — Spirit hits Fortune or 10th from Fortune
- `dualTrack.natal.isAngular` = high Daimon magnitude — recognition for intentional action

**Key UX signals (priority order):**
1. `valensPeak: true` → highest priority — Valens eminence flag (Spirit track only)
2. `peakType: "major"` → "Peak chapter" — strong highlight (1st/10th from Fortune)
3. `peakType: "moderate"` → "Active chapter" — lighter highlight (4th/7th from Fortune)
4. `dualTrack.natal.isAngular + dualTrack.fortune.isPeak` → both tracks active simultaneously → extraordinary
5. `markers: ["LB"]` → "Life Reversal" — dramatic turning point
6. `markers: ["pre-LB"]` → "Building to reversal"
7. `markers: ["Cu"]` → "Culmination month" in L2 view
8. `angularTriad.source: "schmidt"` → label as "contemporary method" if shown to user
9. L1 ruler = L2 ruler → "Sole authority" callout
10. `lotCondition.warning` → show if cadent lot warning is present

---

### Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/zodiacal-releasing.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "lotType": "fortune",
    "targetDate": "2026-07-23",
    "maxLevels": 3
  }'
```

---

## POST `/api/profection`

**Added:** 2025 (updated 2026-07-23 — daily profection + multi-point + handing-over)
**PHP file:** `profection.php`
**Calculator:** `calculators/profection_calculator.js`
**Purpose:** Computes annual, monthly, and daily profections (Demetra George Techniques 5 & 6), multi-point profections from Sun and Moon, and Valens handing-over analysis.

---

### Demetra George — Key Concepts for UX

#### Annual Profection (T5)

The simplest and most universally used Hellenistic time-lord technique.

- Age 0 → 1st house. Age 1 → 2nd. Age 11 → 12th. Age 12 → back to 1st.
- The **Lord of the Year (LOY)** = domicile lord of the profected sign.
- The LOY governs the entire profection year (birthday-to-birthday).
- Any planet **in the profected sign** is co-activated.
- The **profected house's topic** = the year's theme.

**For UX:** Show "This year is a [house] year. Governed by [LOY planet]."

#### Monthly Profection (T6)

Rate: **one sign per month** from the annual profected sign.

- Key moment: when the monthly profection arrives at **the LOY's natal sign**, the year's theme tends to crystallize into a concrete event.

**For UX:** "This month the focus is on [monthly sign], a [house] theme."

#### Daily Profection (T6)

Rate: **one sign per 2.5 days** from the monthly profected sign.

- When the daily profection reaches the LOY's natal sign → precise event timing.
- 2.5 days/sign × 12 signs = 30 days per monthly cycle.

**For UX:** Daily card / planner. "Today's focus: [daily sign], [house] — [topic]. Changes every 2.5 days."

#### Multi-Point Profections (Valens)

Same sign-count (`age % 12`) applied to the Sun and Moon's natal sign.

- **Sun profection** → reputation, privilege, father
- **Moon profection** → body, health, conception/motherhood

When multiple profection points activate the same planet → that planet is especially important this year.

#### Handing-Over Analysis (Valens)

Each natal planet also profects to a new sign each year. When it lands in a sign ruled by a different planet, that's a "handing over." Sun and Moon handovers are `priority: "primary"` — most important.

Key verdicts in the response:
- `Sun_Saturn` → grievous year; difficulties with father/authority
- `Mars_Saturn` → among the most difficult combinations
- `Jupiter_Mars` → troubles and betrayals despite good intentions
- `Venus_Mars` → conflicts in love, separations

---

### Request Body

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `birthDate` | string | ✅ | — | `"YYYY-MM-DD"` |
| `birthTime` | string | ✅ | — | `"HH:MM"` |
| `timezone` | string | ✅ | — | IANA tz |
| `latitude` | number | ✅* | — | Decimal degrees |
| `longitude` | number | ✅* | — | Decimal degrees |
| `username` | string | ➖ | — | Load from DB |
| `targetDate` | string | ➖ | today | `"YYYY-MM-DD"` — date to analyze |

---

### Response Structure

```json
{
  "success": true,
  "targetDate": "2026-07-23",
  "age": 45,
  "monthsSinceBirthday": 9,

  "annualProfection": {
    "house": 10,
    "houseName": "10th House (Career, Public Image)",
    "sign": "Capricorn",
    "ruler": "Saturn",
    "rulerLocation": {
      "planet": "Saturn",
      "house": 3,
      "houseName": "3rd House (Communication, Siblings)",
      "sign": "Virgo",
      "degree": 12.3,
      "longitude": 162.3
    },
    "planetsInHouse": [],
    "description": "Focus on career, public image, reputation"
  },

  "monthlyProfection": {
    "house": 7,
    "houseName": "7th House (Partnerships, Relationships)",
    "sign": "Libra",
    "ruler": "Venus",
    "rulerLocation": { "planet": "Venus", "house": 1, "sign": "Cancer", "degree": 18.5 },
    "planetsInHouse": [{ "planet": "Mars", "sign": "Libra", "degree": 8.2, "house": 7 }],
    "description": "Focus on partnerships, relationships, collaboration"
  },

  "dailyProfection": {
    "house": 5,
    "houseName": "5th House (Creativity, Romance)",
    "sign": "Leo",
    "ruler": "Sun",
    "daysPerSign": 2.5,
    "daysSinceMonthlyStart": 7.4,
    "description": "Daily focus: Focus on creativity, self-expression, romance"
  },

  "profectionFromSun": {
    "house": 3,
    "sign": "Sagittarius",
    "ruler": "Jupiter",
    "description": "Reputation, privilege, relationship with father"
  },

  "profectionFromMoon": {
    "house": 8,
    "sign": "Cancer",
    "ruler": "Moon",
    "description": "Body, health, conception/motherhood, emotional life"
  },

  "handingOverAnalysis": [
    {
      "planet": "Sun",
      "profectedSign": "Capricorn",
      "handingTo": "Saturn",
      "verdict": "grievous — possible difficulties with father/authority; traditional: danger of death",
      "priority": "primary"
    },
    {
      "planet": "Moon",
      "profectedSign": "Leo",
      "handingTo": "Sun",
      "verdict": "Moon hands over to Sun",
      "priority": "primary"
    },
    {
      "planet": "Mars",
      "profectedSign": "Aries",
      "handingTo": "Mars",
      "verdict": "Mars hands over to Mars",
      "priority": "secondary"
    }
  ],

  "profectionYearBoundaries": {
    "startDate": "2025-10-24",
    "endDate": "2026-10-24",
    "currentAge": 45,
    "duration": "1 year"
  },

  "natalAscendant": { "longitude": 90.1, "sign": "Cancer" },

  "natalChartComplete": {
    "planets": {
      "Sun": { "longitude": 203.4, "sign": "Libra", "degree": 23.4, "house": 4 }
    },
    "ascendant": 90.1
  }
}
```

---

### Key Fields for UX

| Field | UX Use |
|-------|--------|
| `annualProfection.house` + `.sign` + `.ruler` | "Year theme" card header — the most important display |
| `annualProfection.ruler` | Lord of the Year — the governing planet all year |
| `annualProfection.rulerLocation.house` | Where the LOY lives — shapes how year-theme manifests |
| `annualProfection.planetsInHouse` | Co-activated planets this year |
| `monthlyProfection.house` + `.sign` | Monthly theme card |
| `dailyProfection.house` + `.sign` + `.ruler` | Daily card |
| `dailyProfection.daysPerSign` | Tooltip: "changes every 2.5 days" |
| `profectionFromSun` | Reputation / father sub-track |
| `profectionFromMoon` | Body / health sub-track |
| `handingOverAnalysis` (filter `priority: "primary"`) | Year-level warnings and quality verdicts |
| `profectionYearBoundaries` | Progress bar: how far through the profection year |

### Connecting Profection to Solar Return

Per Demetra George, the profection tells you *which planet* governs the year — the Solar Return tells you *whether that planet can deliver*. Call `/api/solar-return` after `/api/profection` and check: Is the LOY stronger or weaker in the SR? The SR is the diagnostic; the profection sets the question.

### Repeating Patterns

Every 12 years the same house is profected again: age 0, 12, 24, 36, 48, 60, 72 are all 1st-house years. In UX, optionally flag "You last had a [Nth house] year at age [X]" so the user can recall what that cycle brought.

---

### Test

```bash
# For today
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/profection.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517
  }'

# For a specific date
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/profection.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "targetDate": "2026-10-15"
  }'
```

---

## POST /api/timelord-synthesis

**PHP:** `timelord-synthesis.php`

**Purpose:** Demetra George Technique 8 — Integration/Synthesis. Runs all six Hellenistic timing systems for a target date and cross-checks which planet appears most frequently. The planet that appears across the most systems is the **signifying planet** of that period.

DG analogy: *"Think of each timing system as a board member. When all board members agree on Jupiter, Jupiter has sole authority and will do what it wants regardless of natal debilities."*

### Systems Checked (in parallel)

| # | System | What is extracted |
|---|--------|-------------------|
| 1 | Circumambulations | Primary time lord + all participating time lords |
| 2 | Annual Profection | Lord of the Year + planets bodily in profected sign |
| 3 | Monthly Profection | Monthly ruler + planets bodily in monthly sign |
| 4 | ZR from Fortune (L1 + L2) | L1 and L2 period rulers |
| 5 | ZR from Spirit (L1 + L2) | L1 and L2 period rulers; valensPeak flagged |
| 6 | Planetary Periods | All activations within ±2 years of current age |

### Request

```json
{
  "birthDate": "1980-10-24",
  "birthTime": "01:41",
  "timezone": "Europe/Brussels",
  "latitude": 50.8503,
  "longitude": 4.3517,
  "targetDate": "2026-07-24"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `birthDate` | ✅ | YYYY-MM-DD |
| `birthTime` | ✅ | HH:MM (24h) |
| `timezone` | ✅ | IANA tz string |
| `latitude` | ✅ | decimal degrees |
| `longitude` | ✅ | decimal degrees |
| `targetDate` | optional | YYYY-MM-DD; defaults to today |
| `username` | optional | DB lookup to fill birth data |
| `releaser` | optional | `ascendant` (default), `sun`, `moon`, `fortune` — for circumambulations |

### Response

```json
{
  "success": true,
  "targetDate": "2026-07-24",
  "age": 45.75,
  "sect": "day",

  "systems": {
    "circumambulations": {
      "primaryTimeLord": "Jupiter",
      "participating": ["Venus"],
      "planets": ["Jupiter", "Venus"],
      "periodStartAge": 40.2,
      "periodEndAge": 52.1,
      "natalCondition": "Jupiter is in its domicile in Sagittarius — strong benefic condition"
    },
    "profectionAnnual": {
      "lordOfYear": "Saturn",
      "house": 10,
      "sign": "Cancer",
      "planetsInHouse": ["Moon"],
      "planets": ["Saturn", "Moon"]
    },
    "profectionMonthly": {
      "ruler": "Venus",
      "house": 7,
      "sign": "Aries",
      "planetsInHouse": [],
      "planets": ["Venus"]
    },
    "zrFortune": {
      "l1Lord": "Jupiter",
      "l1Sign": "Sagittarius",
      "l2Lord": "Jupiter",
      "l2Sign": "Pisces",
      "peakType": "major",
      "valensPeak": false,
      "planets": ["Jupiter"],
      "lotCondition": { "house": 2, "angularity": "succedent", "isCadent": false }
    },
    "zrSpirit": {
      "l1Lord": "Saturn",
      "l1Sign": "Capricorn",
      "l2Lord": "Mercury",
      "l2Sign": "Gemini",
      "peakType": null,
      "valensPeak": false,
      "spiritNatalHouse": 5,
      "spiritTopicNote": "Spirit is in natal H5 — derive Spirit's topic from that house, not assumed = career.",
      "planets": ["Saturn", "Mercury"],
      "lotCondition": { "house": 5, "angularity": "succedent", "isCadent": false }
    },
    "planetaryPeriods": {
      "currentAge": 45.75,
      "activationsWindow": "±2 years",
      "activations": [
        { "planet": "Jupiter", "age": 45.67, "method": "minor", "label": "Jupiter Minor Years", "activationDate": "2026-03-12", "isPast": true }
      ],
      "activatedPlanets": ["Jupiter"],
      "planets": ["Jupiter"]
    }
  },

  "convergence": {
    "totalSystems": 6,
    "activeSystems": ["circumambulations", "profectionAnnual", "profectionMonthly", "zrFortune", "zrSpirit", "planetaryPeriods"],
    "planetCounts": {
      "Jupiter": 4,
      "Saturn": 2,
      "Venus": 2,
      "Mercury": 1,
      "Moon": 1
    },
    "rankedPlanets": [
      {
        "planet": "Jupiter",
        "count": 4,
        "systems": ["circumambulations", "zrFortune", "planetaryPeriods", "profectionAnnual"],
        "percentage": 67,
        "isSignifyingPlanet": true
      },
      {
        "planet": "Saturn",
        "count": 2,
        "systems": ["profectionAnnual", "zrSpirit"],
        "percentage": 33,
        "isSignifyingPlanet": false
      }
    ],
    "signifyingPlanet": "Jupiter",
    "signifyingPlanetCount": 4,
    "convergenceLevel": "strong",
    "interpretation": "Jupiter appears in 4 of 6 active systems. Strong convergence — Jupiter is the primary signifying planet. Look to its natal condition and house placement for the period's dominant theme.",
    "valensPeakActive": false,
    "valensPeakNote": null,
    "demetraRule": "When all board members agree on one planet, that planet has sole authority and will do what it wants regardless of natal debilities. Three+ systems = meaningful convergence; all six = extraordinary."
  }
}
```

### Key Response Fields

| Field | Description |
|-------|-------------|
| `convergence.signifyingPlanet` | The planet appearing in the most systems — the period's governing planet |
| `convergence.signifyingPlanetCount` | How many systems named it |
| `convergence.convergenceLevel` | `very_strong` (all-1), `strong` (4+), `moderate` (2-3), `weak` (1) |
| `convergence.rankedPlanets[].systems` | Which systems activated each planet |
| `convergence.valensPeakActive` | `true` when Spirit ZR L1 is in Fortune's sign or 10th from Fortune — DG's eminence/reputation window |
| `convergence.interpretation` | Human-readable summary of convergence strength and what it means |
| `systems.*.error` | Present if that system failed; others still run |
| `systems.zrSpirit.spiritTopicNote` | DG warning: derive Spirit's life topic from its natal house, not assumed = career |
| `systems.zrFortune.peakType` | `major` (Fortune's 1st/10th) or `moderate` (4th/7th) or null |

### Convergence Levels

| Level | When | Meaning |
|-------|------|---------|
| `very_strong` | Planet in 5 or 6 systems | Near-sole authority — dominant period theme |
| `strong` | Planet in 4 systems | Primary signifying planet |
| `moderate` | Planet in 2-3 systems | Leads but multiple themes active |
| `weak` | Planet in 1 system | No clear signifying planet — diffuse period |

### UX / AI Reading Priority

1. **Check `convergence.signifyingPlanet`** — this is the single most important field
2. **Check `convergence.valensPeakActive`** — if true, flag eminence/reputation window regardless of convergence
3. **Read `systems.zrFortune.peakType`** — if "major", the Fortune track is at peak energy
4. **Read `systems.zrSpirit.spiritTopicNote`** — always show this when Spirit is active to prevent career assumption error
5. **Read `convergence.interpretation`** for ready-to-display text
6. **If `convergence.convergenceLevel` = "weak"**, tell the user the period is multi-themed / unclear

### curl Example

```bash
# Today's date synthesis
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/timelord-synthesis.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "timezone": "Europe/Brussels",
    "latitude": 50.8503,
    "longitude": 4.3517
  }'

# Specific target date + username
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/timelord-synthesis.php" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ma1",
    "targetDate": "2026-10-15"
  }'
```

---

## Gene Keys

### POST /api/gene-keys

**Description:** Gene Keys Hologenetic Profile — returns Gene Keys for the natal Sun, Earth, Moon, Venus, and Mars positions. Same birth data format as blueprint.

**PHP:** `gene-keys.php`  
**Calculator:** `calculators/gene_keys_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `city` | string | Yes* | Birth city (alternative to lat/lon) |
| `country` | string | Yes* | Birth country |
| `timezone` | string | Yes | IANA timezone |
| `username` | string | No | Load birth data from DB |

**Response includes:**
- Gene Key number and name for Sun (Activation), Earth (Life's Work), Moon (Dream Arc), Venus (Pearl), Mars (SQ)
- Shadow, Gift, and Siddhi for each Gene Key
- Codon group and amino acid

---

### POST /api/gene-keys-interactive

**Description:** Gene Keys with full hologram visualization data — Hologenetic Profile including all 64 Gene Keys mapped to the natal chart.

**PHP:** `gene-keys-interactive.php`  
**Calculator:** `calculators/gene_keys_interactive_calculator.js`

Same parameters as `/api/gene-keys`. Returns richer output with the full Gene Keys profile grid and all 64 keys' activation status.

---

## Bodygraph Interactive (Legacy)

### POST /api/bodygraph-interactive

**Description:** Returns an HTML visualization of the Human Design bodygraph (legacy generator — predates `/api/hd/chart`). Returns `{ html: "...", humanDesign: {...} }`.

**PHP:** `bodygraph-interactive.php`  
**Calculator:** `calculators/bodygraph_chart_generator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes | Latitude |
| `longitude` | number | Yes | Longitude |
| `timezone` | string | Yes | IANA timezone |
| `theme` | string | No | `'light'` or `'dark'` |
| `width` | number | No | Width in px (default 1000) |
| `height` | number | No | Height in px (default 1200) |
| `showLegend` | boolean | No | Show legend (default true) |
| `showInfo` | boolean | No | Show info panel (default true) |

**Note:** Prefer `/api/hd/chart` for programmatic access (returns structured JSON). Use `/api/bodygraph-interactive` when you need the HTML visual directly.

---

## Person Search — CSV Export

### POST /api/person-search-export

**Description:** Same as `/api/person-search-bulk` but returns results as a **downloadable CSV file** instead of JSON. Useful for spreadsheet workflows.

**PHP:** `person-search-export.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `names` | array | Yes* | JSON array of name strings (Option A) |
| `file` | upload | Yes* | CSV file upload, field name `file` (Option B, multipart/form-data) |

**Auth:** Bearer token required (`Authorization: Bearer sk_<key>`).

**CSV Output Columns:** `query`, `found`, `confident`, `fullName`, `firstName`, `lastName`, `birthDate`, `birthTime`, `city`, `country`, `timezone`, `rating` (Rodden Rating), `matchScore`, `notes`

**Limits:** Max 100 names. CSV file max 512 KB.

```bash
# Option A — JSON names array
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/person-search-export.php" \
  -H "Authorization: Bearer sk_<key>" \
  -H "Content-Type: application/json" \
  -d '{"names": ["Marie Curie", "Albert Einstein"]}' \
  -o results.csv

# Option B — CSV file upload
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/person-search-export.php" \
  -H "Authorization: Bearer sk_<key>" \
  -F "file=@names.csv" \
  -o results.csv
```

---

## TocToc Highlights

### POST /api/toctoc-highlights

**Description:** Lightweight (~50 KB) yearly-only summary of the lifetime TocToc scan. Calls the same calculator as `/api/toctoc-timeline` but strips the heavy `monthlyTimeline` (500+ entries) and returns only `summary` + `yearly` + a convenience `biggestYear` field.

**PHP:** `toctoc-highlights.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes* | Format: YYYY-MM-DD |
| `birthTime` | string | Yes* | Format: HH:MM |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `timezone` | string | No | IANA timezone |
| `username` | string | No | Load birth data from DB (substitutes coords) |

**Response:** Same structure as `/api/toctoc-timeline` minus `monthlyTimeline`/`monthlyDetailed`, plus `biggestYear` (the year entry with the highest `sumScore`).

**Use cases:** Onboarding "your strongest past periods" screen, app home "your biggest year was 1994" card.

---

## Ask (Natural Language Routing)

### POST /api/ask

**Description:** Natural language question → calculator routing. Maps question intent to the appropriate endpoint and returns merged results.

**PHP:** `ask.php` → `endpoints/ask.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | string | Yes | Natural language question |
| `birthDate` | string | Yes* | Format: YYYY-MM-DD |
| `birthTime` | string | Yes* | Format: HH:MM |
| `city` | string | Yes* | Birth city |
| `country` | string | Yes* | Birth country |
| `latitude` | number | No | Latitude (alternative to city/country) |
| `longitude` | number | No | Longitude |
| `username` | string | No | Load birth data from DB |

**Example:**
```json
{
  "question": "What's happening for me this year?",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "city": "Paris",
  "country": "France"
}
```

---

## BaZi Extensions

### POST /api/bazi/animal-rankings

**Description:** Chinese zodiac animal luck rankings for a given year (based on the year's animal and the interactions with all 12 signs).

**PHP:** `bazi-animal-rankings.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | Yes | Year (e.g. 2026) |

---

### POST /api/bazi/animal-analysis

**Description:** Detailed compatibility analysis for two BaZi animal signs (compatibility score, harmony/clash/punishment patterns).

**PHP:** `bazi-animal-analysis.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `animal1` | string | Yes | First zodiac animal (e.g. `"Rat"`) |
| `animal2` | string | Yes | Second zodiac animal |

---

### POST /api/bazi/element-keywords

**Description:** Keywords and themes for the 5 elements and 10 heavenly stems in BaZi.

**PHP:** `bazi-element-keywords.php`

No required parameters (returns the full keyword library). Optional: `element` to filter.

---

### POST /api/bazi/keywords/adapted

**Description:** Adapted element keywords tuned to a specific Day Master (how each element manifests for this Day Master type).

**PHP:** `bazi-keywords-adapted.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dayMaster` | string | Yes | Heavenly stem of the Day pillar (e.g. `"Jia"`, `"Yi"`) |

---

### POST /api/bazi/keywords

**Description:** Full keyword library for BaZi stems (Heavenly Stems) and branches (Earthly Branches).

**PHP:** `bazi-keywords.php`

No required parameters.

---

## Feng Shui Extensions

### POST /api/fengshui/24-mountains

**Description:** 24 Mountains (Er Shi Si Shan) compass chart for a given year — which sectors are activated, auspicious, or inauspicious.

**PHP:** `fengshui-24-mountains.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | Yes | Year (e.g. 2026) |

---

### POST /api/fengshui/24-mountains/activation-dates

**Description:** Best activation dates for each of the 24 Mountains sectors within a year.

**PHP:** `fengshui-24-mountains-activation-dates.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | Yes | Year |
| `sector` | string | No | Specific sector to query (e.g. `"N1"`) |

---

### POST /api/fengshui/almanach/search

**Description:** Chinese almanac (Tong Shu / Chinese almanac) search — returns auspicious and inauspicious activities for a date or date range.

**PHP:** `fengshui-almanach-search.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | No | Date YYYY-MM-DD (default: today) |
| `startDate` | string | No | Start of range |
| `endDate` | string | No | End of range |
| `activity` | string | No | Filter by activity type |

---

### POST /api/fengshui/activation-dates/nobles
### POST /api/fengshui/activation-dates/prosperity
### POST /api/fengshui/activation-dates/health
### POST /api/fengshui/activation-dates/studies
### POST /api/fengshui/activation-dates/problem-solving

**Description:** Star-specific activation dates for the given category within a year. All share the same parameter format.

**PHP:** `fengshui-activation-dates-{category}.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | Yes | Year |
| `month` | number | No | Restrict to specific month |

---

### POST /api/fengshui/eclipses

**Description:** Eclipse impact analysis on feng shui sectors — which sectors are activated or disturbed by solar/lunar eclipses within a year.

**PHP:** `fengshui-eclipses.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | Yes | Year |

---

### POST /api/fengshui/period-9

**Description:** Period 9 (2024–2043) sector analysis — which sectors are prosperous, neutral, or afflicted under Period 9 flying stars.

**PHP:** `fengshui-period-9.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | No | Year (default: current) |
| `month` | number | No | Month for monthly overlay |

---

### POST /api/fengshui/period-9/activation-dates

**Description:** Best activation dates for Period 9 auspicious sectors.

**PHP:** `fengshui-period-9-activation-dates.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | Yes | Year |

---

## QMDJ Extensions

### POST /api/qimendunjia/destiny-palace

**Description:** QMDJ Destiny Palace for a person's birth data — which of the 9 QMDJ palaces is the person's natal palace.

**PHP:** `qimendunjia-destiny-palace.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `timezone` | string | Yes | IANA timezone |
| `gender` | string | No | `'male'` or `'female'` |

---

### POST /api/qimendunjia/palace-hexagrams

**Description:** I Ching hexagrams mapped to QMDJ palaces — returns the hexagram corresponding to each palace for the current or specified chart.

**PHP:** `qimendunjia-palace-hexagrams.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | Yes | Date YYYY-MM-DD |
| `time` | string | Yes | Time HH:MM |
| `timezone` | string | Yes | IANA timezone |

---

## Yi Jing (I Ching)

### POST /api/yijing/year-hexagram

**Description:** Yi Jing hexagram for annual energy guidance — returns the hexagram that governs the given year's energy, with its lines, judgment, and commentary.

**PHP:** `yijing-year-hexagram.php`  
**Calculator:** `calculators/yijing_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | Yes | Year (e.g. 2026). Also accepts via `?year=` query string. |

---

### POST /api/yijing/personal-hexagram

**Description:** Personal Yi Jing hexagram derived from birth data — the hexagram that governs a person's life theme.

**PHP:** `yijing-personal-hexagram.php`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `timezone` | string | Yes | IANA timezone |
| `username` | string | No | Load birth data from DB |

---

## Tibetan Astrology

### POST /api/tibetan-astrology/calculate

**Description:** Tibetan astrology chart — calculates Parkha (8 trigrams), Mewa (9 magic squares), Lotsawa birth element, and related Tibetan astrological indicators.

**PHP:** `tibetan-astrology-calculate.php`  
**Calculator:** `calculators/tibetan_astrology_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes* | Format: YYYY-MM-DD |
| `username` | string | Yes* | Load birth data from DB (alternative to birthDate) |

Also accepts `?birthDate=` and `?username=` as query string parameters.

---

## Celestial Movements

### POST /api/celestial-movements

**Description:** Eclipses, planetary retrogrades, and sign ingresses for a date range — unified celestial events calendar.

**PHP:** `celestial-movements.php`  
**Calculator:** `calculators/celestial_movements_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | No | Year (returns full-year events) |
| `startDate` | string | No | Start date YYYY-MM-DD |
| `endDate` | string | No | End date YYYY-MM-DD |

Also accepts `?startDate=`, `?endDate=`, `?year=` as query string parameters.

---

## Mantra

### POST /api/mantra/unlimited-opportunities

**Description:** Personalized mantra recommendations based on birth data — returns mantras aligned with the person's current planetary periods and life themes.

**PHP:** `mantra-unlimited-opportunities.php`  
**Calculator:** `calculators/mantra_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes* | Format: YYYY-MM-DD |
| `birthTime` | string | Yes* | Format: HH:MM |
| `username` | string | Yes* | Load birth data from DB (alternative) |

Also accepts `?username=` and `?birthDate=` as query string parameters.

---

## Manifestation

### POST /api/manifestation/dates

**Description:** Optimal manifestation dates — finds the best dates for setting intentions and manifesting, based on lunar phases and personal numerology/astrology.

**PHP:** `manifestation-dates.php`  
**Calculator:** `calculators/manifestation_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | No | Format: YYYY-MM-DD |
| `username` | string | No | Load birth data from DB |
| `startDate` | string | No | Start of search range |
| `endDate` | string | No | End of search range |
| `year` | number | No | Year to compute (default: current) |
| `month` | number | No | Restrict to specific month |

---

## Chart Data (Raw JSON)

### POST /api/chart-data

**Description:** Raw natal chart data (planets, houses, aspects) as structured JSON, without any HTML rendering. Lightweight alternative to `/api/birth-chart-interactive`.

**PHP:** `chart-data.php`  
**Calculator:** `calculators/chart_data_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `city` | string | Yes* | Birth city |
| `country` | string | Yes* | Birth country |
| `timezone` | string | Yes | IANA timezone |

---

## Mundane Monthly Agenda

### POST /api/mundane-monthly-agenda

**Description:** Monthly mundane event agenda — same calculator as `/api/mundane-timing`, formatted as an agenda/calendar feed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `year` | number | No | Year (default: current) |
| `month` | number | No | Month 1-12 (default: current) |
| `timezone` | string | No | IANA timezone |

---

## Monthly Horoscope

### POST /api/monthly-horoscope

**Description:** Monthly horoscope narrative for a sign or natal chart.

**Calculator:** `calculators/monthly_horoscope_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | No | Format: YYYY-MM-DD (for personalized) |
| `sign` | string | No | Zodiac sign (e.g. `"Scorpio"`) for generic |
| `year` | number | No | Year (default: current) |
| `month` | number | No | Month 1-12 (default: current) |

---

## Daily Brief

### POST /api/daily-brief

**Description:** Daily briefing — shorter/simpler version of `/api/daily-briefing-context`. Returns the day's key astrological signals for a person.

**PHP:** `daily-brief.php`  
**Calculator:** `calculators/daily_brief_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes* | Format: YYYY-MM-DD |
| `birthTime` | string | Yes* | Format: HH:MM |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `timezone` | string | Yes | IANA timezone |
| `username` | string | Yes* | Load birth data from DB (alternative) |
| `targetDate` | string | No | Date for brief (default: today) |

---

## Public Persons

### POST /api/public-persons

**Description:** Public person lookup by name — alternative to `/api/person-search`. Returns birth data for public figures from the database.

**Calculator:** `calculators/public_persons_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Person name to search |
| `limit` | number | No | Max results (default: 5) |

---

## Planetary Aspect Archetypes

### POST /api/planetary-aspect-archetypes

**Description:** Returns archetypal themes and psychological/spiritual meaning for planetary aspects in the natal chart.

**PHP:** `planetary-aspect-archetypes.php`  
**Calculator:** `calculators/planetary_aspect_archetypes_calculator.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `birthDate` | string | Yes | Format: YYYY-MM-DD |
| `birthTime` | string | Yes | Format: HH:MM |
| `latitude` | number | Yes* | Latitude |
| `longitude` | number | Yes* | Longitude |
| `city` | string | Yes* | Birth city |
| `country` | string | Yes* | Birth country |
| `timezone` | string | Yes | IANA timezone |

---

## Planetary Alignment Finder

### POST /api/planetary-alignment-finder

**Description:** Finds future (or past) dates when multiple specified planets form a given alignment or configuration.

**PHP:** `planetary-alignment-finder.php`  
**Calculator:** `calculators/planetary_alignment_finder.js`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `planets` | array | Yes | Planet names to watch (e.g. `["Saturn", "Jupiter"]`) |
| `aspect` | string | Yes | Aspect type (`"conjunction"`, `"trine"`, `"square"`, etc.) |
| `startDate` | string | No | Start of search range (default: today) |
| `endDate` | string | No | End of search range |
| `orb` | number | No | Orb in degrees (default: 1) |

---

## POST /api/person-categories

Browse public-person life events by curated category taxonomy. Queries `astrolearn.person_event` (only `id_source IS NOT NULL` persons).

**Two data shapes:**
- `dataType: "event"` → returns person + `event_date` + `age_at_event` + `detail` (dated life events)
- `dataType: "trait"` → returns person + `detail` only, no date (chronic traits, diagnoses, personality)

**PHP:** `person-categories.php`  
**Calculator:** `calculators/person_categories_calculator.js`

### Action: list_categories

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | `"list_categories"` |

**Response:**
```json
{
  "success": true,
  "categories": [
    { "id": "mental-health", "label": "Mental health struggles", "description": "...", "dataType": "trait", "count": 2179 },
    { "id": "divorce",       "label": "Divorces",                "description": "...", "dataType": "event", "count": 2343 }
  ]
}
```

### Action: get_people

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | `"get_people"` |
| `tagId` | string | Yes | One of the tag IDs from `list_categories` |
| `limit` | number | No | Max results (default: 50, max: 200) |
| `offset` | number | No | Pagination offset (default: 0) |

**Available tagIds:**

| tagId | Label | dataType |
|-------|-------|----------|
| `mental-health` | Mental health struggles | trait |
| `health-conditions` | Health conditions | trait |
| `body-traits` | Physical traits | trait |
| `personality-traits` | Personality traits | trait |
| `vocation` | Vocations & occupations | trait |
| `lifestyle` | Lifestyle & passions | trait |
| `notable` | Notable attributes | trait |
| `family-traits` | Family & relationship traits | trait |
| `prize` | Prizes & awards | event |
| `big-win` | Big wins | event |
| `publication` | Published works | event |
| `new-career` | Career launches | event |
| `marriage` | Marriages | event |
| `divorce` | Divorces | event |
| `new-relationship` | New relationships | event |
| `birth-of-child` | Birth of children | event |
| `death-of-loved-one` | Death of loved ones | event |
| `mental-health-episode` | Mental health episodes | event |
| `health-event` | Health events | event |
| `crime-event` | Crime involvement | event |
| `death` | Death events | event |

**Response (trait):**
```json
{
  "success": true,
  "tagId": "mental-health",
  "label": "Mental health struggles",
  "dataType": "trait",
  "count": 3,
  "offset": 0,
  "limit": 50,
  "people": [
    {
      "id_person": 123,
      "id_event": 1604616,
      "name": "Demi Moore",
      "birthdate": "1962-11-11",
      "birthyear": 1962,
      "birthplace": "Roswell, New Mexico",
      "subcategory": "Diagnoses",
      "detail": "Psychological : Abuse Alcohol : Rehab"
    }
  ]
}
```

**Response (event):**
```json
{
  "success": true,
  "tagId": "divorce",
  "label": "Divorces",
  "dataType": "event",
  "count": 3,
  "people": [
    {
      "id_person": 5508,
      "id_event": 1854974,
      "name": "Demi Moore",
      "birthdate": "1962-11-11",
      "birthyear": 1962,
      "birthplace": "Roswell, New Mexico",
      "subcategory": "Divorce dates",
      "detail": "Announced divorce from Willis",
      "event_date": "1998-06-24",
      "age_at_event": 35
    }
  ]
}
```

**Example:**
```bash
# List all categories with counts
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/person-categories.php" \
  -H "Content-Type: application/json" \
  -d '{"action":"list_categories"}'

# Get people who won prizes (event-based, includes dates)
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/person-categories.php" \
  -H "Content-Type: application/json" \
  -d '{"action":"get_people","tagId":"prize","limit":20}'

# Get people with mental health traits (trait-based, no dates)
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/person-categories.php" \
  -H "Content-Type: application/json" \
  -d '{"action":"get_people","tagId":"mental-health","limit":20}'
```

---

## POST /api/generate-report

Collects all astrological datasets for a person, then calls Claude AI to generate
a fully-designed, self-contained HTML report. One report per call. 2–4 min typical.

**PHP endpoint:** `http://ai.zebrapad.io/full-suite-spiritual-api/generate-report.php`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `birthDate` | string | "YYYY-MM-DD" |
| `birthTime` | string | "HH:MM" (24h) |
| `latitude` | float | Birth latitude, e.g. `50.8503` |
| `longitude` | float | Birth longitude, e.g. `4.3517` |
| `timezone` | string | IANA timezone, e.g. `"Europe/Brussels"` |
| `gender` | string | `"female"` or `"male"` (used for Feng Shui Gua) |
| `firstName` | string | Person's first name |
| `reportIndex` | int | Report to generate: **1–8** (see table below) |

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `lastName` | string | `""` | Person's last name |
| `city` | string | `""` | Birth city (for display) |
| `country` | string | `""` | Birth country (for display) |
| `model` | string | `"claude-opus-4-8"` | Claude model ID to use |

### Report Index Reference

| reportIndex | Report | Key data sources |
|------------|--------|-----------------|
| 1 | Thème natal | draw-your-chart, planetary-condition, ascensional-times, secondary-progressions, planetary-activation |
| 2 | Prévision année en cours | profection, solar-return-timeline, transit-cycles, zodiacal-releasing, numerology, timelord-synthesis, circumambulations, eclipse-life-pattern, arabic-parts, lucky/career/moon days, monthly-horoscope |
| 3 | Synthèse cross-système | draw-your-chart, HD, gene-keys, bazi, numerology |
| 4 | Human Design | hd/chart, gene-keys |
| 5 | Feng Shui | fengshui personal-directions, annual/monthly flying stars, afflictions, 24-mountains |
| 6 | BaZi & Qi Men | bazi (4 pillars + annual), qimendunjia destiny-palace |
| 7 | Timeline décennie | profection, solar-return-timeline, transit-cycles |
| 8 | Numérologie complète | numerology |

### Response

```json
{
  "success": true,
  "reportIndex": 1,
  "reportTitle": "Thème natal",
  "filename": "01-marie-ange-theme-natal.html",
  "html": "<!DOCTYPE html>...",
  "usage": { "input_tokens": 42000, "output_tokens": 11000 }
}
```

On error:
```json
{ "success": false, "error": "Missing required fields: birthTime, gender" }
```

### LLM Providers

| `llmProvider` | Model default | Cost | Setup |
|--------------|---------------|------|-------|
| `kimi` *(default)* | `moonshot-v1-128k` | Free tier | Set `KIMI_API_KEY` in .env — get key at platform.moonshot.cn |
| `ollama` | `mistral:latest` | Free (local) | Ollama running at `OLLAMA_URL` (default: localhost:11434). Pull a 70b model for best quality. |
| `anthropic` | `claude-opus-4-8` | ~$1–2/report | Set `ANTHROPIC_API_KEY` in .env |

### Timing

- **Duration**: ~2–4 min per report (data gathering ~30s + LLM generation ~90–180s)
- PHP `set_time_limit(600)` is already set in the endpoint

### Frontend Usage Example

```javascript
async function getReport(person, reportIndex) {
  const res = await fetch('http://ai.zebrapad.io/full-suite-spiritual-api/generate-report.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate:   person.birthDate,   // "1980-10-24"
      birthTime:   person.birthTime,   // "01:41"
      latitude:    person.latitude,    // 50.8503
      longitude:   person.longitude,   // 4.3517
      timezone:    person.timezone,    // "Europe/Brussels"
      gender:      person.gender,      // "female"
      firstName:   person.firstName,   // "Marie-Ange"
      lastName:    person.lastName,    // "Van"
      city:        person.city,        // "Bruxelles"
      country:     person.country,     // "Belgium"
      reportIndex: reportIndex         // 1–8
    })
  });
  const data = await res.json();
  if (data.success) {
    // data.html = full HTML document
    // data.filename = "01-marie-ange-theme-natal.html"
    return data.html;
  }
  throw new Error(data.error);
}

// Generate all 8 reports sequentially
for (let i = 1; i <= 8; i++) {
  const html = await getReport(person, i);
  // Save or display the HTML
}
```

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/generate-report.php" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1980-10-24",
    "birthTime": "01:41",
    "latitude": 50.8503,
    "longitude": 4.3517,
    "timezone": "Europe/Brussels",
    "gender": "female",
    "firstName": "Marie-Ange",
    "reportIndex": 1
  }'
```

---

## POST /api/wealth-lottery

Scores a natal chart against the Demetra George Hellenistic pattern found in 20 confirmed lottery winners. Returns a 1–10 rating and full scoring breakdown.

**PHP file:** `wealth-lottery.php`
**Calculator:** `calculators/wealth_lottery_calculator.js`

### Input Modes

**Mode 1 — Search by name (astrolearn + bubble DB):**
```json
{ "name": "Werner Bruni" }
```

**Mode 2 — Direct DB lookup:**
```json
{ "personId": 26200 }
```

**Mode 3 — Direct birth data:**
```json
{
  "birthDate": "1990-08-17",
  "birthTime": "06:00",
  "latitude": 49.6096,
  "longitude": 6.12966,
  "timezone": "Europe/Luxembourg",
  "personName": "Alix Rufas"
}
```

**Mode 4 — App user (bubble DB, resolved by wrapper):**
```json
{ "username": "alix_rufas" }
```

### Response

```json
{
  "success": true,
  "mode": "single",
  "person": { "name": "...", "birthDate": "...", "birthTime": "...", "city": "...", "country": "...", "rating": "..." },
  "chart": { "sect": "day|night", "sectLight": "Sun|Moon", "ascendantSign": "Leo" },
  "score": {
    "value": 16,
    "max": 36,
    "percentage": 44,
    "rating": 4,
    "label": "Mild",
    "interpretation": "..."
  },
  "keyIndicators": {
    "mars": { "sign": "...", "house": 1, "retrograde": false, "dignity": "domicile", "grade": "A", "ofSect": true, "testimony": "Venus(trine)" },
    "venus": { ... },
    "jupiter": { ... },
    "h5Lord": { "houseSign": "Sagittarius", "lord": "Jupiter", "lordSign": "Cancer", "lordHouse": 12, "lordGrade": "C", "testimony": "..." },
    "h2Lord": { ... },
    "h8Lord": { ... },
    "h11Lord": { ... },
    "pluto": { "sign": "Scorpio", "house": 4, "longitude": 225.1 },
    "planetsInH5": ["Mars"]
  },
  "allPlanets": { "Sun": {...}, "Moon": {...}, "Mercury": {...}, "Venus": {...}, "Mars": {...}, "Jupiter": {...}, "Saturn": {...} },
  "scoringBreakdown": [
    { "points": 5, "label": "Mars in domicile", "detail": "H1" },
    { "points": 3, "label": "Venus own sect", "detail": "benefic aligned with chart sect" }
  ]
}
```

### Scoring Rubric (MAX=36 → 1–10 rating)

| Factor | Points |
|--------|--------|
| Mars in domicile or triplicity | +5 |
| 5th lord receives Venus testimony | +4 |
| 5th lord receives Jupiter testimony | +3 |
| Mars grade A/A+ | +3 |
| Venus own sect | +3 |
| 11th lord grade A/A+ | +3 |
| 2nd lord in H1/5/9/11 | +3 |
| Venus in domicile/exaltation | +3 |
| Jupiter in H5 | +3 |
| Mars in exaltation | +3 |
| 5th lord in H1/5/9/11 | +2 |
| 8th lord in H1/5/9/11 | +2 |
| Pluto in H2/5/8 | +2 |
| 5th lord in domicile/exaltation | +2 |
| Mars in H5 | +2 |
| Venus grade A/A+ | +2 |
| Jupiter in domicile/exaltation | +2 |
| 11th lord in H1/5/9/11 | +1 |
| Jupiter in H1/5/9/11 (not H5) | +1 |
| 5th lord retrograde | -1 |
| Jupiter in fall | -1 |
| 5th lord in fall/detriment | -1 |

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/wealth-lottery.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Werner Bruni"}'
```

---

## POST /api/wealth-lottery-rank

Ranks multiple persons by their lottery-winner profile score (highest to lowest). Useful for comparing a group.

**PHP file:** `wealth-lottery-rank.php`
**Calculator:** `calculators/wealth_lottery_calculator.js`

### Input

**Names only:**
```json
{ "names": ["Werner Bruni", "Paula Moore", "Angela Kelly"] }
```

**Explicit person objects (mix of name lookups and direct birth data):**
```json
{
  "persons": [
    { "name": "Werner Bruni" },
    { "birthDate": "1990-08-17", "birthTime": "06:00", "latitude": 49.61, "longitude": 6.13, "timezone": "Europe/Luxembourg", "name": "Alix Rufas" }
  ]
}
```

### Response

```json
{
  "success": true,
  "mode": "ranking",
  "count": 3,
  "ranked": [
    {
      "rank": 1,
      "name": "Werner Bruni",
      "rating": 6,
      "percentage": 58,
      "label": "Moderate",
      "keySignals": ["Mars in domicile", "Venus own sect"],
      "detail": { ... full single-person result ... }
    },
    { "rank": 2, ... },
    { "rank": 3, ... }
  ]
}
```

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/wealth-lottery-rank.php" \
  -H "Content-Type: application/json" \
  -d '{"names": ["Werner Bruni", "Marie Curie", "Albert Einstein"]}'
```

---

## POST /api/entrepreneur

Scores a natal chart against the Hellenistic entrepreneur pattern. V3 rubric rebuilt from two studies: n=21 hand-picked elites and n=88 elite entrepreneurs from the astrolearn DB (validates signals vs base rates).

**PHP file:** `entrepreneur.php`
**Calculator:** `calculators/entrepreneur_calculator.js`

### Scoring Rubric (V3 — DB-validated, 2026-08-08)

**Key statistical findings from n=88 elite DB study:**
- H10 lord receives c/s/t from Jup/Venus: **80% vs base 66% (+14%)** — THE top differentiator
- Jupiter dignified: **53% vs base 42% (+11%)**
- Jupiter benefic (c/s/t) aspects per planet: **47–50% vs base 42% (+5–8%)**
- H10 lord receives ANY classical: 90% vs base 89% — near base rate noise (no longer the primary H10 signal)

| Tier | Signal | Points | Evidence |
|------|--------|--------|----------|
| A | Jupiter–Mercury classical aspect | +4 | 50% benefic vs 42% base (+8%) |
| A | Jupiter–Sun classical aspect | +3 | 49% benefic vs 42% base (+7%) |
| A | Jupiter–Mars classical aspect | +3 | 47% benefic vs 42% base (+5%) |
| A | Jupiter–Venus classical aspect | +2 | 47% benefic vs 42% base |
| A | Jupiter–Mercury harmonious (c/s/t) bonus | +1 | extra for easy-flow aspect |
| A | Jupiter in dignity (dom/ex/tri) | +3 | 53% vs base 42% (+11%) — increased from V2's +2 |
| B | H2 lord in good house (H1/2/5/9/10/11) | +4 | 76% in hand-picked elites (50% in broader n=88) |
| B | H2 lord in domicile/exaltation | +2 | — |
| B | H2 lord in fall/detriment | −2 | — |
| C | H10 lord receives Jup/Ven ANY classical | +3 | 90% of elites (near base rate) |
| C | **H10 lord receives Jup/Ven c/s/t (quality bonus)** | **+2** | **80% vs base 66% — #1 DB signal** |
| C | H10 lord in dom/ex/tri | +2 | — |
| C | H10 lord in fall/detriment | −1 | — |
| D | 3+ planets in domicile/exaltation | +4 | — |
| D | 2 planets in domicile/exaltation | +3 | — |
| D | 1 planet in domicile/exaltation | +1 | — |
| D | 1+ grade-A planet | +2 | — |
| D | Saturn grade A/A+ | +2 | master-builder bonus |
| D | Saturn in domicile/exaltation (if not grade A) | +1 | — |
| D | 2+ planets in angular houses | +2 | 80% vs base 74% (+6%) |
| P | Saturn in fall | −2 | — |
| P | Saturn in detriment | −1 | — |

**MAX_SCORE = 37** (soft cap — theoretical max with V3 signals ≈ 40)
→ percentage = min(100, score/37 × 100) → rating = round(pct/10)

**Note on self-testimony guard:** When H10 lord IS Venus or Jupiter, that planet cannot provide testimony to itself. Only the other benefic (or classical Jup/Ven aspect) is checked.

### Reference scores (V3)

| Person | Rating | Notes |
|--------|--------|-------|
| Warren Buffett | 9/10 (86%) | H2 Mars H10, H10 lord Moon receives Jupiter c/s/t, 3+ planets dom/exalt |
| Jeff Bezos | 9/10 (92%) | H2 Saturn dom H2, H10 lord Venus receives c/s/t (+2 quality bonus), 4 angular |
| Bill Gates | 8/10 (76%) | All 4 Jup aspects, Jup triplicity (+3), H10 Venus c/s/t bonus (+2) |
| Steve Jobs | 6/10 (62%) | Jup exalt (+3), H2 Moon H11, H10 lord Jup exalt; no c/s/t H10 bonus |
| Alix Rufas | 7/10 (70%) | Jup-Sun/Venus sextile, Jup triplicity, H2 Saturn H1 |
| Elon Musk | 5/10 (46%) | Jup–Mercury/Sun trines, but H10 lord Venus gets no testimony (Jup quincunx) |

### Input

**Search by name (astrolearn + bubble DB):**
```json
{ "name": "Elon Musk" }
```

**By DB person ID:**
```json
{ "personId": 41539 }
```

**Direct birth data:**
```json
{
  "birthDate": "1955-02-23",
  "birthTime": "19:15",
  "latitude": 37.3382,
  "longitude": -121.8863,
  "timezone": "America/Los_Angeles",
  "personName": "Steve Jobs"
}
```

### Response

```json
{
  "success": true,
  "mode": "single",
  "person": { "name": "STEVE JOBS", "birthDate": "1955-02-23", "birthTime": "19:15", "city": "SAN FRANCISCO", "country": "CALIFORNIA", "rating": "AA" },
  "chart": { "sect": "day", "sectLight": "Sun", "ascendantSign": "Virgo" },
  "score": {
    "value": 21,
    "max": 37,
    "percentage": 57,
    "rating": 6,
    "label": "Moderate",
    "interpretation": "STEVE JOBS's natal chart scores 57% on the entrepreneur / high-achiever profile..."
  },
  "keyIndicators": {
    "jupiter": { "sign": "Cancer", "house": 11, "dignity": "exaltation", "grade": "C" },
    "saturn":  { "sign": "Scorpio", "house": 3, "dignity": "peregrine", "grade": "complex/high-variance" },
    "h2Lord":  { "houseSign": "Libra", "lord": "Venus", "lordSign": "Capricorn", "lordHouse": 5, "lordDignity": "triplicity" },
    "h10Lord": { "houseSign": "Gemini", "lord": "Mercury", "lordSign": "Aquarius", "lordHouse": 6, "lordDignity": "triplicity" }
  },
  "scoringBreakdown": [
    { "points": 3, "label": "Jupiter–Sun trine", "detail": "vision amplifies leadership (81%)" },
    { "points": 3, "label": "Jupiter–Mars square", "detail": "vision drives executive action (71%)" },
    { "points": 2, "label": "Jupiter–Venus opposition", "detail": "vision expands wealth/alliances (71%)" },
    { "points": 4, "label": "H2 lord Venus in H5 (good house)", "detail": "wealth lord well-activated (76%)" },
    { "points": 3, "label": "2 planets in domicile/exaltation", "detail": "Mars, Jupiter" }
  ]
}
```

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/entrepreneur.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Elon Musk"}'
```

---

## POST /api/entrepreneur-rank

Ranks multiple persons by entrepreneur profile score (highest to lowest).

**PHP file:** `entrepreneur-rank.php`
**Calculator:** `calculators/entrepreneur_calculator.js`

### Input

**Names only:**
```json
{ "names": ["Steve Jobs", "Elon Musk", "Bill Gates", "Warren Buffett"] }
```

**Explicit person objects:**
```json
{
  "persons": [
    { "name": "Elon Musk" },
    { "birthDate": "1990-08-17", "birthTime": "06:00", "latitude": 49.61, "longitude": 6.13, "timezone": "Europe/Luxembourg", "name": "Alix Rufas" }
  ]
}
```

### Response

```json
{
  "success": true,
  "mode": "ranking",
  "count": 4,
  "ranked": [
    {
      "rank": 1,
      "name": "WARREN BUFFETT",
      "rating": 9,
      "percentage": 86,
      "label": "Very Strong",
      "keySignals": ["Jupiter–Mercury square", "Jupiter–Sun sextile", "Jupiter–Mars conjunction", "H2 lord Saturn in H2 (good house)"],
      "detail": { ... full single-person result ... }
    }
  ]
}
```

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/entrepreneur-rank.php" \
  -H "Content-Type: application/json" \
  -d '{"names": ["Steve Jobs", "Elon Musk", "Bill Gates", "Warren Buffett", "Jeff Bezos"]}'
```

---

## POST /api/happy-marriage

Scores a natal chart against the happy-marriage profile. V1 rubric built from n=172 persons tagged "marriage-very happy" or "marriage-compatible" (AA/A/B rated) vs n=80 "divorce-bitter" control in the astrolearn DB (born >= 1800).

**PHP files:** `happy-marriage.php` · `happy-marriage-rank.php` · `happy-marriage-synastry.php`  
**Calculator:** `calculators/happy_marriage_calculator.js`

### DB Study Findings (2026-08-09)

| Signal | Happy (n=172) | Divorced (n=80) | Delta | Notes |
|--------|--------------|----------------|-------|-------|
| **Moon–Venus c/s/t (natal)** | **45%** | **30%** | **+15%** | **#1 signal** |
| H7 lord dignified (dom/exalt/tri) | 44% | 34% | +10% | — |
| Venus dignified (dom/exalt/tri) | 41% | 33% | +8% | — |
| Jupiter–Venus c/s/t | 38% | 33% | +5% | — |
| Venus in fall/detriment | 28% | 34% | −6% | less bad in happy |
| H7 lord in fall/detriment | 27% | 33% | −6% | — |
| Moon–Sun c/s/t | 41% | 45% | −4% | NOT a signal |
| Saturn–Venus affliction | 40% | 40% | 0% | NOT a signal |

**Synastry (Jung, n=1904 VIP couples vs base rate):**  
Moon/Sun conj (either dir): 17% vs base 15.7% — marginal (+1.3%). Moon/Moon, Moon/ASC, Venus/Venus: all at base rate. Natal signals far outperform synastry in this dataset.

### Scoring Rubric (V1 — MAX=20)

| Signal | Points | Evidence |
|--------|--------|----------|
| Moon–Venus c/s/t (natal) | +5 | 45% happy vs 30% divorced (+15%) — #1 signal |
| Moon–Venus ANY classical | +1 | some Moon–Venus connection |
| Venus in dom/exalt/tri | +3 | 41% happy vs 33% divorced (+8%) |
| H7 lord in dom/exalt/tri | +3 | 44% happy vs 34% divorced (+10%) |
| Jupiter–Venus c/s/t | +2 | 38% happy vs 33% divorced (+5%) |
| Venus in H7 | +2 | classical: Venus in marriage house |
| Jupiter in H7 | +2 | classical: benefic in marriage house |
| Jupiter–Moon c/s/t | +1 | mild classical indicator |
| Moon dignified | +1 | mild |
| Venus angular (H1/4/10) | +1 | mild |
| Venus in fall/detriment | −2 | 28% happy vs 34% divorced |
| H7 lord in fall/detriment | −2 | 27% happy vs 33% divorced |
| Saturn conj/sq/opp Venus | −1 | classical malefic affliction |

### Input Modes

**Natal single — by name:**
```json
{ "name": "Gloria Estefan" }
```

**Natal single — by birth data:**
```json
{
  "birthDate": "1957-08-31", "birthTime": "13:00",
  "latitude": 23.1136, "longitude": -82.3666,
  "timezone": "America/Havana", "personName": "Gloria Estefan"
}
```

**Synastry — two people:**
```json
{
  "person1": { "name": "Jimmy Carter" },
  "person2": { "name": "Rosalynn Carter" }
}
```

**Ranking:**
```json
{ "names": ["Gloria Estefan", "T.S. Eliot", "Jimmy Carter"] }
```

### Response (single mode)

```json
{
  "success": true,
  "mode": "single",
  "person": { "name": "GLORIA ESTEFAN", "birthDate": "1957-08-31", "rating": "A" },
  "score": {
    "value": 14, "max": 20, "percentage": 70, "rating": 7,
    "label": "Good",
    "interpretation": "GLORIA ESTEFAN's natal chart scores 70% on the happy-marriage natal profile..."
  },
  "keyIndicators": {
    "ascSign": "Sagittarius", "h7Sign": "Gemini",
    "h7Lord": "Mercury", "h7LordDig": "domicile", "h7LordHouse": 10
  },
  "scoringBreakdown": [
    { "points": 5, "label": "Moon–Venus sextile", "detail": "#1 signal: 45% happy vs 30% divorced (+15%)" },
    { "points": 3, "label": "Venus in domicile", "detail": "41% happy vs 33% divorced (+8%)" },
    { "points": 2, "label": "Jupiter–Venus conjunction", "detail": "38% happy vs 33% divorced (+5%)" },
    { "points": 3, "label": "H7 lord Mercury in domicile", "detail": "44% happy vs 34% divorced (+10%)" }
  ]
}
```

### Reference Scores

| Person | Rating | Notes |
|--------|--------|-------|
| Gloria Estefan | 7/10 (70%) | Moon–Venus sex, Venus dom, Jup–Venus conj, H7 lord dom (H10) |
| T.S. Eliot | 6/10 (55%) | Moon–Venus tri, Venus dom, Venus H1, Jup–Venus sex |
| Elizabeth Barrett Browning | 4/10 (40%) | Venus exalt H7, Jup–Venus sex; H7 lord fall −2 |
| Fred Rogers | 4/10 (40%) | Moon–Venus conj, Venus exalt; Saturn sq Venus −1 |
| Jimmy Carter | 4/10 (35%) | Moon–Venus sex, Jup–Venus tri; Mars H7 lord peregrine |
| Queen Victoria | 2/10 (20%) | Venus detriment −2; Jup–Venus sex, Moon exalt, H7 lord domicile H12 |

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/happy-marriage.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Gloria Estefan"}'
```

---

## POST /api/firdaria

Computes Hellenistic/Medieval Firdaria major and sub-period time lords for a natal chart. Implements Abu Ma'shar sequences via KS (Surtees) with day/night variants and configurable node placement.

### Parameters

| Field | Required | Notes |
|-------|----------|-------|
| `birthDate` | yes | `YYYY-MM-DD` |
| `birthTime` | yes | `HH:MM` (24h). Defaults to `12:00` if omitted |
| `latitude` | yes | decimal degrees |
| `longitude` | yes | decimal degrees |
| `timezone` | yes | IANA timezone string (e.g. `"Europe/London"`) |
| `username` | no | DB lookup fallback |
| `sectOverride` | no | `"day"` \| `"night"` — force sect when Sun is on ASC/DSC cusp |
| `nodePlacement` | no | `"end"` (classic) \| `"afterMars"` (KS night default). Auto: day→`end`, night→`afterMars` |
| `targetDate` | no | `YYYY-MM-DD` reference date for `current` block. Defaults to today |

### Major period lengths

| Planet | Years |
|--------|------:|
| Sun | 10 |
| Venus | 8 |
| Mercury | 13 |
| Moon | 9 |
| Saturn | 11 |
| Jupiter | 12 |
| Mars | 7 |
| NNode | 3 |
| SNode | 2 |
| **Total cycle** | **75** |

### Sequences

**Day:** Sun → Venus → Mercury → Moon → Saturn → Jupiter → Mars → NNode → SNode → repeat  
**Night `nodePlacement:"end"`:** Moon → Saturn → Jupiter → Mars → Sun → Venus → Mercury → NNode → SNode → repeat  
**Night `nodePlacement:"afterMars"`:** Moon → Saturn → Jupiter → Mars → NNode → SNode → Sun → Venus → Mercury → repeat

### Sub-periods

Each major period splits into 7 equal parts among the 7 classical planets (nodes excluded as sub-lords). First sub-lord = the major lord; remaining continue in Chaldean order (Saturn → Jupiter → Mars → Sun → Venus → Mercury → Moon). When the major lord is a node, sub-periods start from Saturn.

### Response

```json
{
  "success": true,
  "sect": "day",
  "nodePlacement": "end",
  "current": {
    "majorLord": "Mercury",
    "subLord": "Moon",
    "majorStart": "1979-07-01",
    "majorEnd": "1992-07-01",
    "subStart": "1981-05-12",
    "subEnd": "1982-12-24"
  },
  "majors": [
    {
      "planet": "Sun",
      "startAge": 0,
      "endAge": 10,
      "startDate": "1961-07-01",
      "endDate": "1971-07-01"
    }
  ],
  "subs": [
    {
      "majorLord": "Sun",
      "subLord": "Sun",
      "startDate": "1961-07-01",
      "endDate": "1962-08-22"
    }
  ]
}
```

`majors` and `subs` are capped at age 150 (2 full 75-year cycles).

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/firdaria.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1961-07-01","birthTime":"18:45","latitude":51.5,"longitude":-0.1,"timezone":"Europe/London"}'
```

---

## POST /api/happy-marriage

Scores a natal chart against the happy-marriage natal rubric. Rubric derived from DB study: n=172 persons tagged "marriage-very happy" or "marriage-compatible" (AA/A/B rated) vs n=80 persons tagged "divorce bitter" (control group). Source: astrolearn DB, birth year ≥ 1800.

**PHP file:** `happy-marriage.php`

**Top validated signals:**
- Moon–Venus c/s/t (natal): 45% happy vs 30% divorced = **+15%** ← #1 signal
- H7 lord dignified (dom/exalt/tri): 44% vs 34% = +10%
- Venus dignified: 41% vs 33% = +8%
- Jupiter–Venus c/s/t: 38% vs 33% = +5%
- Venus in fall/detriment: 28% vs 34% → negative signal
- H7 lord in fall/detriment: 27% vs 33% → negative signal

**Non-signals (no delta):** Moon–Sun c/s/t, Saturn–Venus affliction, Moon dignified, Venus angular

**Modes (auto-detected from input):**
- Single natal: `{ name }` or `{ personId }` or `{ birthDate, birthTime, latitude, longitude, timezone }`
- Synastry: `{ person1: {…}, person2: {…} }` → routes to `/api/happy-marriage-synastry`
- Ranking: `{ names: ["…"] }` or `{ persons: [{…}] }` → routes to `/api/happy-marriage-rank`

### Required Parameters (single natal)

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Person name (searches astrolearn + bubble DB) |
| — or — | | |
| `birthDate` | string | YYYY-MM-DD |
| `birthTime` | string | HH:MM |
| `latitude` | number | Birth latitude |
| `longitude` | number | Birth longitude |
| `timezone` | string | IANA timezone |

### Response (single natal)

```json
{
  "success": true,
  "mode": "single",
  "person": {
    "name": "Marie Curie",
    "birthDate": "1867-11-07",
    "birthTime": "12:00",
    "city": "Warsaw",
    "country": "Poland",
    "rating": "AA"
  },
  "score": {
    "value": 14,
    "max": 20,
    "percentage": 70,
    "rating": 7,
    "label": "Good",
    "interpretation": "Marie Curie's natal chart scores 70% on the happy-marriage natal profile. Moderate indicators — supportive but not dominant natal signature for marriage."
  },
  "keyIndicators": {
    "moonVenusAspect": true,
    "h7LordDignified": true,
    "venusDignified": false
  },
  "scoringBreakdown": [
    { "signal": "Moon–Venus c/s/t", "points": 5, "found": true },
    { "signal": "H7 lord dignified", "points": 4, "found": true }
  ]
}
```

### Notes

- Synastry signals (Jung, n=1904 VIP couples) are marginal in this dataset; natal signals dominate.
- All three endpoints (`/api/happy-marriage`, `/api/happy-marriage-rank`, `/api/happy-marriage-synastry`) route through the same calculator file — the mode is auto-detected from the input shape.

---

## POST /api/happy-marriage-rank

Ranks multiple persons by happy-marriage profile score.

**PHP file:** `happy-marriage-rank.php`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `names` | string[] | Array of person names to search and rank |
| — or — | | |
| `persons` | object[] | Array of birth-data objects |

### Response

```json
{
  "success": true,
  "mode": "ranking",
  "results": [
    { "rank": 1, "name": "Person A", "rating": 9, "label": "Very good", "percentage": 90, "keySignals": ["Moon–Venus trine", "H7 lord dignified"] },
    { "rank": 2, "name": "Person B", "rating": 6, "label": "Moderate", "percentage": 60, "keySignals": [] }
  ]
}
```

---

## POST /api/happy-marriage-synastry

Cross-chart synastry analysis (Jung-style) comparing two persons.

**PHP file:** `happy-marriage-synastry.php`

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `person1` | object | Birth data for person 1 (`name` or full birth data) |
| `person2` | object | Birth data for person 2 (`name` or full birth data) |

### Response

```json
{
  "success": true,
  "mode": "synastry",
  "person1": { "name": "Person A" },
  "person2": { "name": "Person B" },
  "crossAspects": [
    { "planet1": "Moon", "person1": "A", "planet2": "Sun", "person2": "B", "aspect": "conjunction", "strength": "strong" }
  ],
  "synastryScore": { "value": 3, "interpretation": "Marginal cross-chart signals; natal indicators are more reliable." }
}
```

### Notes

- Per the Jung dataset (n=1904 VIP couples), synastry signals are only marginally above base rate. Natal profile is a stronger predictor.

```bash
# Example
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/happy-marriage.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Diana Spencer"}'

curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/happy-marriage-rank.php" \
  -H "Content-Type: application/json" \
  -d '{"names": ["Diana Spencer", "Marie Curie", "Audrey Hepburn"]}'
```

---

## POST /api/sports-professional

Scores a natal chart against the Sports Professional profile, derived from a DB study of n=232 sports team professionals vs n=486 general-population control (astrolearn DB, AA/A/B rated, birth time + coordinates required).

### Required Parameters (one of)

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Person name to search (fuzzy match) |
| `personId` | integer | astrolearn or bubble DB id_person |
| `birthDate` + `birthTime` + `latitude` + `longitude` + `timezone` | mixed | Direct birth data |

### Optional Parameters (ranking mode)

| Parameter | Type | Description |
|-----------|------|-------------|
| `names` | string[] | List of names to rank (returns ranked list) |
| `persons` | object[] | List of `{name}` or `{personId}` objects |

### Signals & Weights

| Signal | Points | Base % | Group % | Δ |
|--------|--------|--------|---------|---|
| Venus–Moon major aspect | 3 | 38.9 | 48.3 | +9.4% |
| ASC in fixed sign | 2 | 30.0 | 36.6 | +6.6% |
| Sun in domicile (Leo) | 2 | 9.7 | 14.7 | +5.0% |
| Mercury–Saturn major aspect | 1 | 39.5 | 44.4 | +4.9% |
| Moon–Mercury major aspect | 1 | 35.8 | 40.1 | +4.3% |
| 3+ planets in water signs | 1 | 25.7 | 29.7 | +4.0% |

Max score: 10. Rating = round(score/maxScore × 10).

### Response

```json
{
  "success": true,
  "mode": "single",
  "profile": "sports",
  "person": { "name": "...", "birthDate": "...", "birthTime": "..." },
  "score": { "value": 5, "max": 10, "percentage": 50, "rating": 5, "label": "Moderate", "interpretation": "..." },
  "rubric": "n=232 sports team pros vs n=486 general population (astrolearn DB)",
  "scoringBreakdown": [ { "signal": "...", "points": 3, "maxPoints": 3, "found": true, "base_rate": "38.9%", "group_rate": "48.3%" } ]
}
```

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/sports-professional.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Cristiano Ronaldo"}'

curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/sports-professional.php" \
  -H "Content-Type: application/json" \
  -d '{"names": ["Cristiano Ronaldo", "Roger Federer", "Serena Williams"]}'
```

---

## POST /api/scholar

Scores a natal chart against the Academic Scholar profile (n=229 PhDs / exceptional minds vs n=486 control).

### Required Parameters (one of)

Same as `/api/sports-professional`: `name`, `personId`, or direct birth data.

### Signals & Weights

| Signal | Points | Base % | Group % | Δ |
|--------|--------|--------|---------|---|
| Night chart | 3 | 48.4 | 55.4 | +7.1% |
| Planet(s) in H3 | 3 | 39.7 | 46.8 | +7.1% |
| Moon–Venus major aspect | 2 | 38.9 | 45.5 | +6.6% |
| Venus–Saturn major aspect | 2 | 42.2 | 48.6 | +6.5% |
| Mars–Moon major aspect | 2 | 39.3 | 45.5 | +6.2% |
| Moon–Mercury major aspect | 2 | 35.8 | 41.9 | +6.1% |
| ASC in earth sign | 2 | 26.5 | 32.4 | +5.9% |
| Mercury–Saturn major aspect | 2 | 39.5 | 44.6 | +5.1% |
| Venus in H2 | 1 | 6.0 | 11.3 | +5.3% |

Max score: 19.

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/scholar.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Marie Curie"}'
```

---

## POST /api/traveller

Scores a natal chart against the World Traveller / Expatriate profile (n=340 expatriates and international travellers vs n=486 control).

### Signals & Weights

| Signal | Points | Base % | Group % | Δ |
|--------|--------|--------|---------|---|
| Moon in mutable sign | 3 | 29.0 | 37.6 | +8.6% |
| Moon–Mercury major aspect | 2 | 35.8 | 42.6 | +6.8% |
| ASC in fire sign | 2 | 24.7 | 29.4 | +4.7% |
| Jupiter–Sun major aspect | 1 | 43.6 | 47.9 | +4.3% |

Max score: 8. Note: Earth ASC was a significant negative signal (−7.1%) but is not scored as a penalty here.

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/traveller.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Ernest Hemingway"}'
```

---

## POST /api/visual-artist

Scores a natal chart against the Fine Art Painter / Visual Artist profile (n=381 fine art painters vs n=486 control).

### Signals & Weights

| Signal | Points | Base % | Group % | Δ |
|--------|--------|--------|---------|---|
| Moon–Mercury major aspect | 3 | 35.8 | 43.6 | +7.8% |
| Mars–Sun major aspect | 2 | 51.0 | 57.5 | +6.5% |
| Planet(s) in H3 | 2 | 39.7 | 45.4 | +5.7% |
| Sun in exaltation (Aries) | 2 | 7.0 | 12.1 | +5.1% |
| Venus in exaltation (Pisces) | 2 | 8.4 | 13.1 | +4.7% |
| H10 lord in domicile | 1 | 13.4 | 17.6 | +4.2% |
| Moon–Mars major aspect | 1 | 39.3 | 43.3 | +4.0% |

Max score: 13.

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/visual-artist.php" \
  -H "Content-Type: application/json" \
  -d '{"name": "Pablo Picasso"}'

curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/visual-artist.php" \
  -H "Content-Type: application/json" \
  -d '{"names": ["Pablo Picasso", "Claude Monet", "Frida Kahlo", "Salvador Dali"]}'
```

---

## POST /api/lunar-return

Finds the moment the Moon returns to its natal longitude (~every 27.3 days). Casts a chart at the return location and generates a biwheel summary.

### Parameters

| Field | Required | Notes |
|-------|----------|-------|
| `birthDate` | yes | `YYYY-MM-DD` |
| `birthTime` | yes | `HH:MM` (24h) |
| `latitude` | yes | decimal degrees |
| `longitude` | yes | decimal degrees |
| `timezone` | yes | IANA timezone |
| `which` | no | `"next"` (default) \| `"prev"` \| `"around"` (nearest to `targetDate`) |
| `targetDate` | no | Reference date for search. Defaults to today |
| `returnLatitude` | no | Location for return chart. Defaults to birthplace |
| `returnLongitude` | no | Location for return chart. Defaults to birthplace |

### Response

```json
{
  "success": true,
  "which": "next",
  "returnMoment": { "utc": "2026-08-13T13:09:00.000Z", "local": "2026-08-13 14:09:00" },
  "natalMoon": { "longitude": 123.45, "sign": "Leo", "degree": 3.45 },
  "chart": {
    "ascendant": { "longitude": 210.0, "sign": "Scorpio", "degree": 0.0 },
    "mc": { "longitude": 120.0, "sign": "Leo", "degree": 0.0 },
    "planets": { "Moon": { "sign": "Leo", "degree": 3.45, "house": 10, "retrograde": false } }
  },
  "summary": {
    "lrAscSign": "Scorpio",
    "lrAscNatalHouse": 4,
    "angularPlanets": ["Moon", "Jupiter"],
    "moonAspects": [{ "planet": "Sun", "aspect": "trine", "orb": 1.2 }]
  },
  "accuracy": { "moonLonDiffDeg": 0 }
}
```

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/lunar-return.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1980-07-15","birthTime":"14:30","latitude":51.5,"longitude":-0.1,"timezone":"Europe/London","which":"next"}'
```

---

## POST /api/primary-directions

Directs ASC, MC, Sun, Moon (or any classical planet) to natal points by a fixed degree-per-year key. Returns all dated hits within a scan range. **No longevity or death-age fields.**

### Parameters

| Field | Required | Notes |
|-------|----------|-------|
| `birthDate` | yes | `YYYY-MM-DD` |
| `birthTime` | yes | `HH:MM` (24h) |
| `latitude` | yes | decimal degrees |
| `longitude` | yes | decimal degrees |
| `timezone` | yes | IANA timezone |
| `key` | no | `"naibod"` (default, ~0.9856°/yr) \| `"ptolemaic"` (1°/yr) |
| `targets` | no | Array of directed points. Default: `["asc","mc","sun","moon"]` |
| `aspects` | no | Array of aspect names. Default: conjunction, opposition, square, trine, sextile |
| `scanRange` | no | `{ fromYear, toYear }`. Default: current year ±2/+10 |

### Response

```json
{
  "success": true,
  "key": "naibod",
  "rateDegreesPerYear": 0.985626,
  "hits": [
    {
      "date": "2025-10-22",
      "directedPoint": "asc",
      "aspect": "opposition",
      "natalPoint": "venus",
      "arcDegrees": 45.12,
      "yearsElapsed": 45.77,
      "directedLongitude": 210.34,
      "directedSign": "Scorpio",
      "key": "naibod"
    }
  ],
  "totalHits": 4
}
```

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/primary-directions.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1980-07-15","birthTime":"14:30","latitude":51.5,"longitude":-0.1,"timezone":"Europe/London","key":"naibod","scanRange":{"fromYear":2025,"toYear":2030}}'
```

---

## POST /api/master-of-nativity

Identifies the predominator (the planet most suited to anchor the life) and its Egyptian bound lord candidate (master of nativity) per Chris Brennan TAP 205. **No longevity / death-age fields.**

### Parameters

| Field | Required | Notes |
|-------|----------|-------|
| `birthDate` | yes | `YYYY-MM-DD` |
| `birthTime` | yes | `HH:MM` (24h) |
| `latitude` | yes | decimal degrees |
| `longitude` | yes | decimal degrees |
| `timezone` | yes | IANA timezone |

### Response

```json
{
  "success": true,
  "sect": "day",
  "predominator": "Moon",
  "masterCandidate": "Mercury",
  "method": "sect_light_fallback",
  "rationale": [
    "Day chart",
    "Sun cadent (house 9); Moon in house 11 used as predominator",
    "Moon at 1.7° Virgo — Egyptian bound lord: Mercury"
  ],
  "masterCondition": {
    "planet": "Mercury",
    "sign": "Leo",
    "degree": 22.3,
    "house": 10,
    "dignity": "neutral",
    "retrograde": false
  },
  "condition": {
    "endpoint": "/api/planetary-condition",
    "note": "Call /api/planetary-condition for full DG T9–T15 grade of master candidate"
  }
}
```

### curl Test

```bash
curl -X POST "http://ai.zebrapad.io/full-suite-spiritual-api/master-of-nativity.php" \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1980-07-15","birthTime":"14:30","latitude":51.5,"longitude":-0.1,"timezone":"Europe/London"}'
```
