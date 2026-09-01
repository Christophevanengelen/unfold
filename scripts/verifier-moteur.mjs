/**
 * LE CONTRAT ENTRE LE MOTEUR ET L APP.
 *
 * ─── POURQUOI CE CONTROLE EXISTE ────────────────────────────────────────────
 *
 * Le moteur d ephemerides appartient a Marie-Ange, l app a Christophe. Deux
 * personnes, deux depots, une seule interface — et rien, jusqu ici, ne disait
 * si les deux se parlaient encore.
 *
 * Ce que ca a coute, mesure le 01/09/2026 : `endpoints/daily-brief.php` rend
 * `{ success, data: { success, signals } }`. La route de l app lisait
 * `briefData.signals`, un niveau trop haut. La condition d erreur etait donc
 * toujours vraie et la route sortait en 502 avant meme d appeler le modele.
 * Le briefing « Aujourd hui » n a JAMAIS fonctionne, et le message d erreur —
 * « aucun signal rapide exploitable » — se lisait comme une journee calme. Le
 * defaut etait donc invisible, y compris dans les journaux.
 *
 * Le typage TypeScript ne protege de rien ici : `DailyBriefResponse` decrivait
 * la reponse SANS son enveloppe, donc il CONFIRMAIT la lecture fausse. Un type
 * ecrit a la main sur une reponse distante n est pas une verification, c est
 * une croyance.
 *
 * ─── CE QUE CE CONTROLE FAIT, ET CE QU IL NE FAIT PAS ───────────────────────
 *
 * Il appelle le vrai moteur avec un theme connu et verifie, pour chaque champ
 * que l app LIT REELLEMENT, qu il est present et du bon type. Chaque attente
 * porte le fichier et la ligne qui la consomme : quand ca casse, on sait quoi
 * ouvrir.
 *
 * Il ne juge PAS la justesse astrologique. Les valeurs sont a Marie-Ange, la
 * forme est partagee. Ce controle ne parle que de la forme.
 *
 * ─── COMMENT S EN SERVIR ────────────────────────────────────────────────────
 *
 *     node scripts/verifier-moteur.mjs
 *
 * Il n est PAS dans `npm run verifier` : il depend du reseau et d un service
 * tiers, et un controle qui echoue parce qu un serveur distant tousse finit
 * par etre desactive, emportant les autres avec lui. Il se lance a la main,
 * apres une modification du moteur ou avant une livraison.
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE?.trim() || "https://ai.zebrapad.io/full-suite-spiritual-api";

/** Un theme fixe. Les valeurs changent avec le temps, la FORME non. */
const THEME = {
  birthDate: "1985-04-12",
  birthTime: "08:30",
  latitude: 50.8503,
  longitude: 4.3517,
  timezone: "Europe/Brussels",
};

/**
 * Descend un chemin dans un objet, en traversant l enveloppe si besoin.
 * L API rend tantot `{ data: X }`, tantot `X`, tantot `{ data: { data: X } }`.
 * On l accepte — mais on DIT laquelle on a trouvee, parce que c est exactement
 * cette variation qui a casse la route du briefing.
 */
function deballer(reponse) {
  let niveau = 0;
  let courant = reponse;
  while (courant && typeof courant === "object" && "data" in courant && !("boudins" in courant) && !("signals" in courant) && niveau < 3) {
    courant = courant.data;
    niveau++;
  }
  return { valeur: courant, enveloppes: niveau };
}

function lire(obj, chemin) {
  return chemin.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/**
 * Les attentes. Chacune porte le fichier qui la consomme : sans cela, un echec
 * dit « champ absent » et on cherche pendant vingt minutes.
 */
const CONTRATS = [
  {
    nom: "toctoc-year",
    chemin: "toctoc-year.php",
    quoi: "les periodes de l annee, qui remplissent la timeline au chargement rapide",
    corps: { ...THEME, year: new Date().getFullYear() },
    // ATTENTION : ce point d entree ne rend PAS de `boudins`. La premiere
    // version de ce controle l attendait, par analogie avec toctoc-app-short,
    // et annoncait donc un contrat rompu sur un moteur parfaitement correct.
    // Une fausse alerte envoyee a Marie-Ange lui aurait fait chercher un defaut
    // inexistant, et aurait use la confiance dans ce controle des le premier
    // usage. `lib/momentum-adapter.ts:29` lit `response.data.months`.
    attentes: [
      { chemin: "months", type: "array", lu: "lib/momentum-adapter.ts:29 (yearDataToPhases)" },
      { chemin: "currentMonth", type: "object", lu: "types/api.ts (TocTocYearData)" },
    ],
  },
  {
    nom: "toctoc-app-short",
    chemin: "toctoc-app-short.php",
    quoi: "la vie entiere, en forme allegee",
    corps: THEME,
    attentes: [
      { chemin: "boudins", type: "array", lu: "lib/momentum-adapter.ts:174" },
      { chemin: "boudins.0.s", type: "string", lu: "lib/momentum-api.ts:144 (date de debut)" },
      { chemin: "boudins.0.sc", type: "number", lu: "lib/momentum-api.ts:146 (score)" },
      { chemin: "boudins.0.col", type: "string", lu: "lib/momentum-api.ts:148 (couleur)" },
    ],
  },
  {
    nom: "daily-brief",
    // Celui-ci vit sous /endpoints/, pas a la racine. Le premier essai
    // appelait `${BASE}/daily-brief.php` et recevait un 404 — encore une
    // fausse alerte, due au controle et non au moteur.
    // Voir app/api/openai/daily-brief/route.ts:356.
    chemin: "endpoints/daily-brief.php",
    quoi: "les signaux rapides du jour",
    corps: THEME,
    attentes: [
      { chemin: "success", type: "boolean", lu: "app/api/openai/daily-brief/route.ts:374" },
      { chemin: "signals", type: "array", lu: "app/api/openai/daily-brief/route.ts:374" },
    ],
    // C est CE point d entree qui a casse. Son enveloppe est le sujet.
    surveiller: "enveloppe",
  },
];

const TYPES = {
  array: (v) => Array.isArray(v),
  string: (v) => typeof v === "string",
  number: (v) => typeof v === "number",
  boolean: (v) => typeof v === "boolean",
  object: (v) => v !== null && typeof v === "object" && !Array.isArray(v),
};

async function appeler(chemin, corps) {
  const reponse = await fetch(`${BASE}/${chemin}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corps),
    signal: AbortSignal.timeout(120_000),
  });
  if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
  return reponse.json();
}

console.log(`\n  Moteur : ${BASE}`);
console.log(`  Theme de reference : ${THEME.birthDate} ${THEME.birthTime} ${THEME.timezone}\n`);

let echecs = 0;

for (const contrat of CONTRATS) {
  process.stdout.write(`  ${contrat.nom.padEnd(20)}`);
  let brut;
  try {
    brut = await appeler(contrat.chemin, contrat.corps);
  } catch (e) {
    console.log(`INJOIGNABLE  ${e.message}`);
    console.log(`      ${contrat.quoi}\n`);
    echecs++;
    continue;
  }

  const { valeur, enveloppes } = deballer(brut);
  const manques = [];
  for (const a of contrat.attentes) {
    const v = lire(valeur, a.chemin);
    if (v === undefined || !TYPES[a.type](v)) {
      manques.push({ ...a, trouve: v === undefined ? "absent" : typeof v });
    }
  }

  if (manques.length === 0) {
    const note = enveloppes > 0 ? `  (${enveloppes} enveloppe${enveloppes > 1 ? "s" : ""})` : "";
    console.log(`ok${note}`);
    continue;
  }

  echecs++;
  console.log("CONTRAT ROMPU");
  console.log(`      ${contrat.quoi}`);
  for (const m of manques) {
    console.log(`      ${m.chemin} : attendu ${m.type}, ${m.trouve}`);
    console.log(`          lu par ${m.lu}`);
  }
  console.log(`      Racine reelle : ${JSON.stringify(Object.keys(valeur ?? {})).slice(0, 120)}\n`);
}

console.log("");
if (echecs) {
  console.log(`  ${echecs} point(s) d entree ne servent plus ce que l app lit.\n`);
  console.log(`  Ce controle ne juge pas l astrologie — seulement la FORME de la`);
  console.log(`  reponse. Les valeurs restent celles de Marie-Ange.\n`);
  process.exit(1);
}
console.log(`  Les ${CONTRATS.length} points d entree servent ce que l app attend.\n`);
