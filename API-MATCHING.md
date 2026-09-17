# Matching API — Screen-by-Screen Reference

**Endpoint:** `POST /api/match`  
**Calculator:** `calculators/match_calculator.js`  
**Updated:** 2026-09-17

Maps every matching-UI screen to the JSON field in `/api/match`, what it computes, and where the formula comes from.

| Doc | Role |
|-----|------|
| This file | Screen → field → how to read the improved API |
| [`match.md`](match.md) | App-side wiring (Dart `report_name`, gauges) |
| [`API-COMPLETE-DOCUMENTATION.md`](API-COMPLETE-DOCUMENTATION.md) | Full request/response schema |
| [`attraction.md`](attraction.md) | Theory: spark vs compatibility vs longevity, temperament |
| [`match-attraction-spec.md`](match-attraction-spec.md) | Implementation plan (9018 %, sparkHits backlog) |
| `knowledge/match/*.jpeg` | UI screenshots (Temperament, Get along, Bond, …) |

**Status legend**
- ✅ **Shipped** — live in `/api/match`, documented below
- ⚠️ **Approximate** — returns data, different basis than legacy Anatella
- 📋 **Specced, not built** — see `match-attraction-spec.md`

---

## Quick map — what answers which question?

| User question (UI) | Field | Kind of answer |
|--------------------|-------|----------------|
| How compatible are we? | `compatibility` | % — Recherchées↔Perso dominant-planet fit; also exposes `aToB`/`bToA`/`subtitleKey` (idx 9018-faithful) |
| What am I drawn to vs what they are? | `compatibilityRadar` | 10-planet radar (asymmetric profiles) |
| How similar are our personalities? | `resemblance` + `similarityRadar` | % + Perso↔Perso radar |
| Is the attraction mutual? | `balance` | `asymmetry = \|aToB−bToA\|` (idx 9018 order=1), UI score inverts it |
| Is there a spark / who's it with? | `attraction` | Ranked `sparkHits[]` + `idealizationFlags`/`obsessionFlags`/`electricUnstableFlags`/`longevityHits` + natal 7th-house profiles — full KS stack, not a % (`attraction.md` §1.5) |
| **Do you have a bond?** | **`bond`** | **Temperament compare + element headline + comfort links** ✅ |
| **How do you get along?** | **`mutualUnderstanding`** | **Mercury synastry hits + gloss bullets** ✅ |
| Temperament (Fire/Earth gauges) | `generalUnderstanding` | Element pair + same `temperamentCompare` as bond ✅ |
| Who leads? | `boss` | Who wins (not a pair %) |
| Who is more loyal? | `exclusive` | Who wins (not a pair %) |
| What do we give each other? | `gift` | Sun-in-house domains both ways |
| Physical/emotional warmth | `hugs` | % heuristic (legacy combi ⚠️) |

**Do not collapse spark, bond, get-along, and compatibility into one score.** They answer different questions (`attraction.md` §0).

---

## Screen → field → status

| Screen name | Legacy `report_name` | `/api/match` field | Status |
|---|---|---|---|
| **Compatibility Score** | `compatibility` | `compatibility` | ✅ idx 9018 formula, pairwise gap not KNN (Q1) |
| **Radar 1 — What You're Drawn To** | `compatibility_radar` | `compatibilityRadar[]` | ⚠️ core-port dominants |
| **Resemblance Score** | `ressemblance` | `resemblance` | ✅ rescaled Perso↔Perso |
| **Radar 2 — How Similar You Are** | `similarity_radar` | `similarityRadar[]` | ⚠️ core-port dominants |
| **Balance Card** | `equilibre` | `balance` | ✅ idx 9018 asymmetry formula (2026-09-17) |
| **Attraction Card** | `attraction` | `attraction` | ✅ full KS sparkHits engine (2026-09-17) |
| **Bond Card** (“Do you have a bond?”) | (app `.bond`) | **`bond`** | ✅ **new 2026-09-17** |
| **Who Leads** | `boss` | `boss` | ✅ |
| **Loyalty / Exclusivity** | `exclusif` | `exclusive` | ✅ |
| **Temperament Card** | `entente_generale` | **`generalUnderstanding`** | ✅ **augmented 2026-09-17** |
| **How do you get along?** | `1to1_ententeIntel` | **`mutualUnderstanding`** | ✅ **augmented 2026-09-17** |
| **Gift Card** | `gift` | `gift` | ✅ |
| **Hugs Card** | `hugs` | `hugs` | ⚠️ |

---

## Improved fields in detail (2026-09-17)

### 1. `bond` — “Do you have a bond?”

**Purpose:** Day-to-day bond feel via **temperament comparison** (KS / Greenbaum), not Venus–Mars spark.

**Computation**
1. Dominant **element** per person (Fire/Earth/Air/Water from Perso `pointsPerc` by sign) → gauges + `headline`.
2. **Temperament** per person: tally hot/cold/wet/dry from ASC sign, ASC ruler sign, Moon sign, Moon phase, Sun-by-season → 1–2 dominants (choleric / sanguine / melancholic / phlegmatic).
3. **Compare:** `sharedQualities`, `wetBinding` (`both_wet` | `both_dry` | `mixed`), `hasMinimumOverlap` (KS: ≥1 shared quality helps).
4. Soft **Moon/Venus (and Sun–Moon)** comfort aspects → “Comfort links: …” bullets.

**Shape**
```json
{
  "score": 75,
  "label": "Good",
  "headline": "attraction by a deep difference",
  "element1": "Water",
  "element2": "Fire",
  "element1Pct": 62.4,
  "element2Pct": 37,
  "sharedQualities": ["cold", "dry"],
  "wetBinding": "both_dry",
  "hasMinimumOverlap": true,
  "temperamentCompare": {
    "person1": { "hot": 1, "cold": 4, "wet": 1, "dry": 4, "dominants": ["melancholic"], "qualities": { "cold": true, "dry": true }, "moonPhase": "full_disseminating", "ascSign": "Leo", "moonSign": "Taurus" },
    "person2": { "...": "same shape" },
    "sharedQualities": ["cold", "dry"],
    "wetBinding": "both_dry",
    "hasMinimumOverlap": true,
    "score": 75,
    "note": "Shared cold + dry — a common pacing language.",
    "bulletPoints": ["Shared cold + dry — …", "Both dry — chemistry may not cling; …"]
  },
  "bulletPoints": ["A: melancholic · B: melancholic", "attraction by a deep difference", "…", "Comfort links: Moon sextile Sun (orb 3.3°)"],
  "desc": "Shared cold + dry — a common pacing language."
}
```

**How to read**
- `score` = UI overlap gauge only ([30,99]) — **not** soulmate / spark %.
- `headline` from element-pair tier: same → “familiar elemental bond”; compatible → “complementary…”; challenging → “attraction by a deep difference”.
- `wetBinding`: wet sticks; dry needs space (`attraction.md` §2.5).
- Same `temperamentCompare` object as under `generalUnderstanding`.

Also exposed as `person1.temperament` / `person2.temperament`.

---

### 2. `generalUnderstanding` — Temperament card (Fire 56% + Earth 45%)

**Legacy:** `entente_generale` / workbook `entente` sheet.  
**Now:** element pair **+** full KS temperament compare (same engine as `bond`).

**Shape (key fields)**
```json
{
  "score": 50,
  "label": "Moderate",
  "headline": "attraction by a deep difference",
  "element1": "Water",
  "element2": "Fire",
  "element1Pct": 62.4,
  "element2Pct": 37,
  "bulletPoints": [
    "Fire and Water can extinguish or overheat each other — …",
    "passion meets sensitivity",
    "Shared cold + dry — a common pacing language.",
    "…"
  ],
  "temperamentCompare": { "...": "identical to bond.temperamentCompare" }
}
```

**UI mapping (screenshot `match/7-temp.jpeg`)**
| UI | Field |
|----|-------|
| Left/right % gauges | `element1Pct` / `element2Pct` |
| Fire / leaf icons | `element1` / `element2` |
| Title under gauges | `headline` |
| Bullet list | `bulletPoints` |

`score` is still the element-tier score (same/compatible/challenging), not the temperament overlap score (that lives on `bond.score` / `temperamentCompare.score`).

---

### 3. `mutualUnderstanding` — “How do you get along?”

**Legacy:** `1to1_ententeIntel` / `synastrieAspectMercury` sheet (77 rows).  
**Now:** structured Mercury synastry both ways — not the sheet’s literal French rows, but the same planet targets.

**Computation:** each person’s **Mercury** aspects the other’s Mercury, Sun, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto (Ptolemaic aspects via `crossAspect`). Soft vs hard harmony → gloss + headline.

**Shape**
```json
{
  "score": 59,
  "label": "Moderate",
  "headline": "similar attitudes, strong chances of getting along",
  "hits": [
    {
      "from": "Alice",
      "planetFrom": "Mercury",
      "planetTo": "Jupiter",
      "aspect": "Trine",
      "orb": 2.1,
      "harmony": 0.7,
      "gloss": "agreement and understanding; expansive conversation"
    }
  ],
  "bulletPoints": [
    "exchange of ideas, stimulation",
    "feeling of limitation in ideas",
    "…"
  ],
  "desc": "similar attitudes…. exchange of ideas; …"
}
```

**Headline rules (approx.)**
| Pattern | Headline |
|---------|----------|
| Clearly more soft than hard hits | `similar attitudes, strong chances of getting along` |
| Clearly more hard | `disagreements — work the dialogue` |
| Mixed | `mix of stimulation and friction in how you talk` |
| Default | `mutual understanding` |

**Gloss examples (engine table)**  
Mercury–Mercury soft → “exchange of ideas, stimulation”; hard → “divergence of ideas”.  
Mercury–Saturn hard → “feeling of limitation in ideas”.  
Mercury–Moon soft → “felt + mental same-wavelength click”.

**UI:** `match/10-getalong.jpeg` — feed `bulletPoints` (and optionally `headline`) straight to the card.

---

### 4. `compatibility` / `balance` — idx 9018-faithful (2026-09-17)

**Legacy formula, verified directly against `match_M.anatella`:**

```
idx 8974/8977/9023 (normalize):
  attractedTo_distance = 97.8 - ((raw - 9.32) * 62.8 / 75.87)   // same for reversed + resemblance's raw "distance"

idx 9018 (score by order):
  order=2 compatibility: score = (attractedTo_distance + reversedAttractedTo_distance) / 2
  order=1 equilibre:     score = abs(attractedTo_distance - reversedAttractedTo_distance)
  order=3 ressemblance:  score = distance   // perso vs perso, already computed elsewhere

idx 9022 (subtitle buckets, on the compatibility score):
  <35 very_low · 35–61.4 low · 61.4–63.49 average · 63.49–69.22 high · ≥69.22 very_high (legacy repeats "very_high" past this — collapsed to one bucket)
```

`raw`/`distance` above are the **population-relative KNN distances** from `1.3Fourchette_P1P2_DB3_webapp.anatella` (Q1 — not portable pairwise). We reuse the **exact same score/asymmetry/subtitle formulas** but feed them our dominant-planet gap-score `aToB`/`bToA` (Recherchées↔Perso, `weightedGapAvg`) instead of the KNN distance — same structure, different (portable) input.

**`compatibility` shape:**
```json
{
  "score": 78, "aToB": 69.1, "bToA": 87.4,
  "label": "Good", "subtitleKey": "high_compatibility",
  "desc": "..."
}
```
`score = round((aToB + bToA) / 2)`, clamped [30,99]. `subtitleKey` is the idx 9022 bucket **computed on `score`** (not on the raw legacy distance scale) — see the known-limitation note below.

**`balance` shape:**
```json
{
  "score": 81, "asymmetry": 18.3,
  "label": "Acceptable imbalance", "label_fr": "déséquilibre acceptable",
  "desc": "..."
}
```
`asymmetry = |aToB - bToA|` (idx 9018 order=1, exact port). `score = 99 - asymmetry`, clamped [30,99], **inverted for the UI gauge** (higher = more balanced) since the raw legacy value is lower-is-better. `label`/`label_fr` bucket on `asymmetry` via the existing `equil`-sheet-derived `EQUIL_BUCKETS` (0-5/5-15/15-30/30-50/50-100).

**Known limitation:** the idx 9022 bucket cutpoints (35/61.4/63.5/69.2) were calibrated against the legacy's own KNN-normalized distance distribution. Our gap-score substitute for `aToB`/`bToA` tends to sit higher (60-90+) on real pairs tested, so `subtitleKey` skews toward `high_compatibility`/`very_high_compatibility` more often than production likely does. The formula is ported exactly; only the input distribution differs.

---

### 5. `attraction` — full KS spark-hit engine (2026-09-17, `attraction.md` §1–§3, §7)

**Not a percentage.** Two natal "attraction profiles" (built once per person) plus a ranked list of synastry contacts, split into flavor flags — mirrors `attraction.md` §1.5's suggested engine output. Real legacy attraction score is the k=400 KNN (Q1, not portable); this is the practical from-scratch substitute the spec calls for.

**`natalProfileA` / `natalProfileB`** (`attraction.md` §1.1, §2.1) — built by `buildNatalAttractionProfile()`:
```json
{
  "sect": "night",
  "seventhSign": "Aquarius",
  "seventhRuler": { "planet": "Saturn", "sign": "Libra", "house": 3, "dignity": "exaltation", "combust": false, "averseToSeventh": false },
  "planetsInSeventh": [],
  "venus": { "sign": "Virgo", "house": 2, "dignity": "fall" },
  "mars": { "sign": "Sagittarius", "house": 5 },
  "moon": { "sign": "Aries", "house": 9 },
  "angles": { "asc": 148.97, "dsc": 328.97, "mc": 48.65, "ic": 228.65 },
  "sectBeneficInOrRulingSeventh": false
}
```
- **Sect** — Sun's whole-sign house from ASC; houses 7-12 = day, 1-6 = night.
- **7th sign** — always the **Descendant's own sign** (KS rule: use this even if intercepted), not a whole-sign-only derivation.
- **7th ruler** — **traditional** ruler (`TRAD_RULERS`: Mars/Scorpio, Saturn/Aquarius, Jupiter/Pisces, etc.), with **dignity** (domicile/exaltation/detriment/fall/peregrine — 7-planet traditional table only, no dignity for Uranus/Neptune/Pluto), **combust** (≤8° of the Sun), and **averseToSeventh** (ruler's whole-sign house is 12 or 2 — the "6th/8th from the 7th" `attraction.md` §1.1 rule).
- **sectBeneficInOrRulingSeventh** — Jupiter (day) or Venus (night) either sits in the 7th or rules it — partner *quality*, not spark (§2.1 point 8).
- All houses are **whole-sign from the Ascendant** (`wholeSignHouse()`), not the Placidus houses used elsewhere in this endpoint — `attraction.md`'s explicit house-system default.

**`sparkHits[]`** (`attraction.md` §1.5, §3, ranked per §7) — built by `buildSparkHits()`, sorted by `(priority, orb)`:

| priority | `type` | Rule (both directions always checked) | Orb |
|---|---|---|---|
| 1 | `planet_angle` | Sun/Moon/Venus/Mars conjunct the other's ASC/DSC/MC/IC | ≤3° |
| 2 | `venus_mars` | Venus↔Mars, any of the 5 Ptolemaic aspects (squares/oppositions **still count** as chemistry per KS) | ≤6° |
| 3 | `pluto_personal` | Pluto ↔ Sun/Moon/Venus/Mars | ≤6° |
| 4 | `neptune_personal` | Neptune ↔ same set → also `idealizationFlags` | ≤6° |
| 5 | `uranus_personal` | Uranus ↔ same set → also `electricUnstableFlags` unless grounded (see below) | ≤6° |
| 6 | `node_personal` | Sun/Moon/Venus/Mars ↔ the other's North **or** South Node (not outer↔node — too common per KS) | ≤6° |
| 7 | `overlay_7_or_5` | Venus, Mars, Pluto, or the person's own ASC-ruler placed in the other's whole-sign 5th or 7th house | — |
| 8 | `asc_dsc_reversal` | A's ASC sign equals B's DSC sign (or vice versa) | exact sign match |

Each hit: `{ type, priority, direction: 'a_to_b'|'b_to_a'|'mutual', planetA, planetB, aspect, orb, house, gloss }`. `gloss` is a short engine-owned line per type (`SPARK_GLOSS` table) — not `attraction.md`'s prose verbatim.

**"Grounded" for Uranus (§3.5):** `hasSaturnSynastryAspect()` (any Saturn↔personal-planet aspect between the two charts) **or** `isEarthHeavy()` (≥40% of either person's Perso `pointsPerc` sits in Earth-sign placements). If either is true, Uranus hits get the "grounded" gloss instead of "on/off, needs Saturn or earth."

**Flags** — direct filters of `sparkHits`:
- `idealizationFlags` = all `neptune_personal` hits
- `obsessionFlags` = all `pluto_personal` hits
- `electricUnstableFlags` = all `uranus_personal` hits (gloss already reflects grounded/ungrounded)

**`longevityHits[]`** (§3.7, §1.5 point 6) — deliberately **excluded from `sparkHits`**, never contributes to spark: Saturn↔personal (both directions, ≤6°) and Sun–Moon mutual aspects (Jung/KS longevity link). "Saturn is gravity, not spark — don't score it as chemistry" (`attraction.md` §7 rule 5).

**`qualityNotes[]`** (§1.1 point 8-9, §2.1) — plain-text notes from each profile's 7th-ruler dignity/combustion/aversion and sect-benefic condition — "what kind of partners," not "did we catch fire" (§7 rule 6).

**Legacy-compat `hits[]`/`count`/`desc`** (§2.6) — a flat projection of `sparkHits` filtered to Sun/Moon/Venus/Mars-only contacts (drops Pluto/Neptune/Uranus/node/overlay/reversal rows), **widened to 6° and including squares/oppositions** — the old ≤3°-soft-only builder was "the main bug vs `attraction.md`" per `match-attraction-spec.md` §2.6, now fixed.

**Full response shape:**
```json
{
  "hits": [ { "person1Planet": "Mars", "person2Planet": "Venus", "aspect": "Trine", "orb": 5.05 } ],
  "count": 1,
  "desc": "...",
  "natalProfileA": { "...": "see above" },
  "natalProfileB": { "...": "see above" },
  "sparkHits": [ { "type": "venus_mars", "priority": 2, "...": "..." } ],
  "idealizationFlags": [],
  "obsessionFlags": [],
  "electricUnstableFlags": [],
  "longevityHits": [],
  "qualityNotes": [ "Marie ange LE's 7th ruler (Saturn in Libra) is exaltation — higher caliber or a smoother path to partners." ]
}
```

**Deliberately out of scope (attraction.md §1.3-§1.4, `match-attraction-spec.md` non-goals):** meeting/wedding charts, composite/Davison, Lot of Eros / zodiacal releasing timing, progressions. `timingAtMeeting[]` stays unbuilt until asked.

---

### 6. Other shipped fields (unchanged)

| Field | One-liner |
|-------|-----------|
| `compatibilityRadar` | Per planet: `pointsperc` = P1 Recherchées %, `pointsperc2` = P2 Perso %. |
| `resemblance` | Perso↔Perso gap, `rescaleGapPercent` [75,100]→[30,99]. |
| `similarityRadar` | Both Perso %. |
| `boss` / `exclusive` | Tag-filtered mean Perso %; `who` + `confidence`, not a pair score. |
| `gift` | Sun of A in B's house (and reverse) → domain text. |
| `hugs` | Moon/Venus harmony %; legacy water/air + `combi` still ❓ (Q3). |

---

## Legacy source files (citations)

| Asset | Used for |
|-------|----------|
| `match_M.anatella` | All `report_name` cards; idx **9018** score; boss/exclusive filters |
| `1.1.Natal_Dominantes_DB3.anatella` + sheet `points_perso` | Perso / Recherchées % |
| `1.3Fourchette_P1P2_DB3_webapp.anatella` + `echelle_synastrie` | Legacy attraction/compatibility point engine |
| `03.API_id_json_Insight_1_add_popularity_rivalite.anatella` | KNN k=400 → why pairwise ≠ production % |
| `03.API_id_json_Insight_2.anatella` | Gift (Sun in house) |
| Sheets `entente`, `synastrieAspectMercury`, `equil`, `house`, `gauss`, `signs` | Copy / buckets / tags |
| [`attraction.md`](attraction.md) | Bond temperament (§2.5) + full sparkHits engine (§1, §2, §3, §7) |

---

## Q1 — Why production % ≠ our pairwise %

Legacy `compatibility` / `attraction` / `ressemblance` scores depend on **k=400 nearest neighbors** over the whole person population’s 10-D dominant vectors. A partner’s % is “where they rank among your 400 NNs,” not a closed formula of two charts. We intentionally use pairwise gap scores (`aToB`/`bToA`) through the **exact idx 9018 formula structure** instead of standing up a live KNN index — same math, portable input.

## Still open

| ID | Topic |
|----|--------|
| Q3 | `hugs` `combi` ranking |
| — | `attraction.md` §1.3-§1.4 (composite/Davison/meeting charts, ZR-from-Eros timing, progressions) — explicitly out of scope until asked, per `match-attraction-spec.md` |

## Deliberately not from this round (per `attraction.md` §8 / out-of-scope list)

Vertex, asteroid Eros, Chiron/Lilith, sexual-orientation prediction, composite-chart-as-spark — none of these are computed, matching `attraction.md`'s own "what not to treat as attraction" list.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-09-17 | **Phase A/B shipped:** `compatibility.aToB/bToA/subtitleKey` + `balance.asymmetry` (idx 9018-exact); `attraction` rebuilt as `sparkHits[]` + natal 7th-house profiles + idealization/obsession/electric/longevity flags (`attraction.md` §1-§3, §7) |
| 2026-09-17 (earlier) | **`bond`** added; **`generalUnderstanding`** + KS temperament; **`mutualUnderstanding`** Mercury hits/headline; docs + `match-attraction-spec.md` / `attraction.md` |
| Earlier | boss / exclusive / gift / element entente / resemblance rescale / attraction checklist |
