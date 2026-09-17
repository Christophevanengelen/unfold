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
| How compatible are we? | `compatibility` | % — Recherchées↔Perso dominant-planet fit (both directions averaged) |
| What am I drawn to vs what they are? | `compatibilityRadar` | 10-planet radar (asymmetric profiles) |
| How similar are our personalities? | `resemblance` + `similarityRadar` | % + Perso↔Perso radar |
| Is the attraction mutual? | `balance` | Balance/imbalance label (today: Perso-gap; legacy = \|aToB−bToA\|) |
| Is there a spark / attraction hits? | `attraction` | Aspect checklist (not a %). Full KS stack still 📋 |
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
| **Compatibility Score** | `compatibility` | `compatibility` | ⚠️ pairwise gap (not KNN) |
| **Radar 1 — What You're Drawn To** | `compatibility_radar` | `compatibilityRadar[]` | ⚠️ core-port dominants |
| **Resemblance Score** | `ressemblance` | `resemblance` | ✅ rescaled Perso↔Perso |
| **Radar 2 — How Similar You Are** | `similarity_radar` | `similarityRadar[]` | ⚠️ core-port dominants |
| **Balance Card** | `equilibre` | `balance` | ⚠️ Perso-gap (9018 asymmetry 📋) |
| **Attraction Card** | `attraction` | `attraction` | ✅ checklist; KS sparkHits 📋 |
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

### 4. Other shipped fields (unchanged this round)

| Field | One-liner |
|-------|-----------|
| `compatibility` | Mean of weighted gaps: A’s Recherchées vs B’s Perso, and reverse. Clamp [30,99]. Legacy display % used KNN distances averaged at **idx 9018** (`(aToB+bToA)/2`) — exposing directional `aToB`/`bToA` is 📋. |
| `compatibilityRadar` | Per planet: `pointsperc` = P1 Recherchées %, `pointsperc2` = P2 Perso %. |
| `resemblance` | Perso↔Perso gap, `rescaleGapPercent` [75,100]→[30,99]. |
| `similarityRadar` | Both Perso %. |
| `balance` | Mean \|Perso gap\| + `equil` labels. Legacy = \|attractedTo−reversed\| (📋 align). |
| `attraction` | Tight ≤3° conj/sextile/trine among Sun/Moon/Venus/Mars. **Not a %.** Full KS spark stack (Venus–Mars all aspects, planet→DSC, Pluto/Neptune/Uranus flags) → `match-attraction-spec.md` Phase B. |
| `boss` / `exclusive` | Tag-filtered mean Perso %; `who` + `confidence`. |
| `gift` | Sun of A in B’s house (and reverse) → domain text. |
| `hugs` | Moon/Venus harmony %; legacy water/air + `combi` still ❓. |

---

## Anatella compatibility % (idx 9018) — reference

```
order=2 compatibility: score = (attractedTo_distance + reversedAttractedTo_distance) / 2
order=1 equilibre:     score = abs(attractedTo_distance − reversedAttractedTo_distance)
order=3 ressemblance:  score = perso_vs_perso distance
```

Distances are KNN-normalized in the legacy graph (not portable pairwise). Our `compatibility.score` mirrors the **mean of both directions** using dominant-planet gaps instead of NN distance. Full plan to expose `aToB` / `bToA` / `subtitleKey`: `match-attraction-spec.md` §1.

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
| [`attraction.md`](attraction.md) | Bond temperament + future sparkHits |

---

## Q1 — Why production % ≠ our pairwise %

Legacy `compatibility` / `attraction` / `ressemblance` scores depend on **k=400 nearest neighbors** over the whole person population’s 10-D dominant vectors. A partner’s % is “where they rank among your 400 NNs,” not a closed formula of two charts. We intentionally use pairwise gap scores + [30,99] clamp instead of standing up a live KNN index.

## Still open

| ID | Topic |
|----|--------|
| Q3 | `hugs` `combi` ranking |
| Spec Phase A | `compatibility.aToB` / `bToA`, balance = asymmetry |
| Spec Phase B | KS `sparkHits` / flags / natal 7th profiles on `attraction` |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-09-17 | **`bond`** added; **`generalUnderstanding`** + KS temperament; **`mutualUnderstanding`** Mercury hits/headline; docs + `match-attraction-spec.md` / `attraction.md` |
| Earlier | boss / exclusive / gift / element entente / resemblance rescale / attraction checklist |
