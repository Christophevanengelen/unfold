/**
 * CE QUE `connection-brief` MET VRAIMENT DANS SES EVENEMENTS.
 *
 * ─── POURQUOI ───────────────────────────────────────────────────────────────
 *
 * Le prompt du Match (`connection-prompt.md`) demande au modele d ecrire
 * « ZR L3 Scorpion (Spirit) » : un lot, un niveau, un signe. Le type que l app
 * declare pour un evenement (`lib/connection-brief-api.ts:22`) ne connait que
 * cinq clefs — label, score, category, aspect, date. Ni `lotType`, ni `level`.
 *
 * Mais le type ne filtre rien a l execution : `buildPersonPayload`
 * (`lib/connection-delineation.ts:93`) recopie `rawData.events` tel quel dans
 * le corps envoye a OpenAI. Donc si le moteur pose deja `lotType` et `level`
 * sur ses evenements, ils arrivent DEJA au modele et le prompt est seul en
 * cause. S il ne les pose pas, le modele les invente, et c est le moteur qui
 * doit changer.
 *
 * Les deux corrections sont differentes. Ce controle tranche, en un appel.
 *
 * ─── CE QU IL FAIT, ET CE QU IL NE FAIT PAS ─────────────────────────────────
 *
 * Il appelle le vrai moteur avec deux themes fixes et imprime, par categorie
 * d evenement, l UNION des clefs observees et lesquelles des clefs voulues
 * manquent. Il ne juge aucune valeur astrologique — seulement la forme.
 *
 * ─── COMMENT S EN SERVIR ────────────────────────────────────────────────────
 *
 *     node scripts/sonder-connection-brief.mjs
 *     node scripts/sonder-connection-brief.mjs --json > /tmp/brief.json
 *
 * Hors de `npm run verifier` : il depend du reseau et d un service tiers.
 */

const BASE =
  process.env.NEXT_PUBLIC_API_BASE?.trim() ||
  "https://ai.zebrapad.io/full-suite-spiritual-api";

/** Deux themes fixes. Les valeurs changent avec le temps, la FORME non. */
const PERSONNE_A = {
  birthDate: "1985-04-12",
  birthTime: "08:30",
  latitude: 50.8503,
  longitude: 4.3517,
  timezone: "Europe/Brussels",
};
const PERSONNE_B = {
  birthDate: "1980-10-24",
  birthTime: "01:41",
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: "Europe/Paris",
};

/**
 * Les clefs que le prompt suppose. Une clef absente ici = une phrase que le
 * modele ne peut ecrire qu en l inventant.
 */
const VOULU = {
  zr: ["lotType", "level", "periodSign", "startDate", "endDate", "markers", "houses"],
  transit: ["startDate", "endDate", "houses", "cycle", "orb"],
  eclipse: ["axis", "seriesId", "startDate", "endDate", "houses"],
  station: ["startDate", "endDate", "houses"],
};

function deballer(reponse) {
  let courant = reponse;
  let n = 0;
  while (courant && typeof courant === "object" && "data" in courant && !("connectionBrief" in courant) && n < 3) {
    courant = courant.data;
    n++;
  }
  return courant;
}

async function main() {
  const enJson = process.argv.includes("--json");
  const corps = {
    relationship: "partner",
    targetDate: new Date().toISOString().slice(0, 10),
    personA: PERSONNE_A,
    personB: PERSONNE_B,
    responseWindow: { mode: "connection_month_plus_next", months: 3 },
  };

  const debut = Date.now();
  const res = await fetch(`${BASE}/connection-brief.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps),
  });
  const secondes = ((Date.now() - debut) / 1000).toFixed(1);

  if (!res.ok) {
    console.error(`connection-brief.php a repondu ${res.status} en ${secondes} s`);
    process.exit(1);
  }

  const brut = await res.json();
  if (enJson) {
    console.log(JSON.stringify(brut, null, 2));
    return;
  }

  const data = deballer(brut);
  const periodes = data?.connectionBrief?.activePeriods;
  if (!Array.isArray(periodes)) {
    console.error("Pas de connectionBrief.activePeriods dans la reponse. Recu :");
    console.error(JSON.stringify(brut).slice(0, 600));
    process.exit(1);
  }

  console.log(`\n${periodes.length} periodes, ${secondes} s\n`);

  // ── Les clefs d un bloc personne ──
  const clefsFocus = new Set();
  const clefsRawData = new Set();
  for (const p of periodes) {
    for (const focus of [p.personAFocus, p.personBFocus]) {
      if (!focus) continue;
      Object.keys(focus).forEach((k) => clefsFocus.add(k));
      if (focus.rawData) Object.keys(focus.rawData).forEach((k) => clefsRawData.add(k));
    }
  }
  console.log("personXFocus  :", [...clefsFocus].sort().join(", ") || "(vide)");
  console.log("  .rawData    :", [...clefsRawData].sort().join(", ") || "(absent)");

  // ── Les clefs d un evenement, par categorie ──
  const parCategorie = new Map(); // categorie -> { n, clefs:Set, exemple }
  for (const p of periodes) {
    for (const focus of [p.personAFocus, p.personBFocus]) {
      for (const ev of focus?.rawData?.events ?? []) {
        const cat = ev.category ?? "(sans categorie)";
        if (!parCategorie.has(cat)) parCategorie.set(cat, { n: 0, clefs: new Set(), exemple: ev });
        const entree = parCategorie.get(cat);
        entree.n++;
        Object.keys(ev).forEach((k) => entree.clefs.add(k));
      }
    }
  }

  if (parCategorie.size === 0) {
    console.log("\nAucun evenement dans rawData.events — c est deja la reponse.\n");
    return;
  }

  for (const [cat, { n, clefs, exemple }] of [...parCategorie].sort()) {
    const presentes = [...clefs].sort();
    const voulues = VOULU[cat] ?? [];
    const manquantes = voulues.filter((k) => !clefs.has(k));
    console.log(`\n── categorie "${cat}" — ${n} evenements`);
    console.log(`   clefs presentes : ${presentes.join(", ")}`);
    if (voulues.length) {
      console.log(
        manquantes.length
          ? `   MANQUANTES     : ${manquantes.join(", ")}`
          : `   rien ne manque de ce que le prompt suppose`,
      );
    }
    console.log(`   exemple        : ${JSON.stringify(exemple)}`);
  }

  // ── Le point dur : y a-t-il un calcul entre les deux personnes ? ──
  const identiques = periodes.filter(
    (p) => JSON.stringify(p.personAFocus) === JSON.stringify(p.personBFocus),
  ).length;
  const tiers = new Set(periodes.map((p) => p.tier));
  console.log(
    `\npaliers observes : ${[...tiers].join(", ")} · ` +
      `blocs A et B identiques : ${identiques}/${periodes.length}\n`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
