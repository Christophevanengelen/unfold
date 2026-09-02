/**
 * Le consentement doit exister AVANT le traceur, pas apres.
 *
 * lib/legal-content.ts promet : « We use analytics cookies only with your
 * explicit consent. » Aujourd hui cette phrase est vraie parce qu aucun
 * fournisseur n est branche — trackEvent() dans Hero.tsx ne fait qu un
 * console.log. components/legal/CookieConsent.tsx existe mais n est importe
 * nulle part, et personne ne s en apercoit tant que rien ne trace.
 *
 * Le jour ou quelqu un branche Plausible ou GA, la promesse devient fausse en
 * silence : le traceur part, la banniere reste debranchee, et l ecart ne se
 * voit ni a la compilation ni a l execution. Ce controle rend ce jour bruyant.
 *
 * Il n interdit pas de tracer. Il exige que brancher un traceur et brancher le
 * consentement soient le meme geste.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RACINES = ["app", "components", "lib"];
const BANNIERE = "components/legal/CookieConsent.tsx";

// Les vrais appels a un fournisseur tiers. On vise l APPEL, pas le mot : une
// phrase de politique de confidentialite qui contient « analytics » n est pas
// un traceur, et la faire echouer apprendrait a ignorer ce controle.
const TRACEURS = [
  { nom: "Google Analytics", re: /\bgtag\s*\(|googletagmanager\.com/ },
  { nom: "Plausible", re: /plausible\.io|window\.plausible\s*\(/ },
  { nom: "PostHog", re: /posthog\.(init|capture)\s*\(/ },
  { nom: "Mixpanel", re: /mixpanel\.(init|track)\s*\(/ },
  { nom: "Meta Pixel", re: /\bfbq\s*\(|connect\.facebook\.net/ },
  { nom: "Segment", re: /analytics\.(load|track)\s*\(/ },
];

function fichiers(dir, acc = []) {
  let entrees;
  try {
    entrees = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const e of entrees) {
    if (e === "node_modules" || e.startsWith(".")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) fichiers(p, acc);
    else if (/\.(ts|tsx)$/.test(p)) acc.push(p);
  }
  return acc;
}

const tous = RACINES.flatMap((r) => fichiers(r));
const source = new Map(tous.map((f) => [f, readFileSync(f, "utf8")]));

const trouves = [];
for (const [f, code] of source) {
  if (f === "scripts/verifier-consentement.mjs") continue;
  for (const t of TRACEURS) {
    if (t.re.test(code)) trouves.push({ fichier: f, traceur: t.nom });
  }
}

// On cherche l USAGE, jamais le nom. app/[locale]/layout.tsx contient un
// commentaire expliquant que Header et CookieConsent ont ete retires en avril :
// un controle qui cherche « CookieConsent » y voit une preuve que la banniere
// est branchee, et plus la suppression est bien documentee, plus il est aveugle.
// Seuls un import ou une balise JSX comptent.
const IMPORTE = /import\s*\{[^}]*\bCookieConsent\b[^}]*\}\s*from|import\s+CookieConsent\s+from/;
const MONTE = /<CookieConsent[\s/>]/;

const banniereBranchee = [...source].some(
  ([f, code]) => f !== BANNIERE && (IMPORTE.test(code) || MONTE.test(code)),
);

if (trouves.length === 0) {
  console.log(
    `\n  Consentement aux cookies    ok        aucun traceur tiers branche\n`,
  );
  process.exit(0);
}

if (banniereBranchee) {
  console.log(
    `\n  Consentement aux cookies    ok        ${trouves.length} traceur(s), banniere branchee\n`,
  );
  process.exit(0);
}

console.log(`\n  Un traceur est branche, le consentement ne l est pas :\n`);
for (const t of trouves) {
  console.log(`    ${t.fichier}  ->  ${t.traceur}`);
}
console.log(`
  ${BANNIERE} n est importe nulle part.

  lib/legal-content.ts promet « analytics cookies only with your explicit
  consent ». Tant que la banniere n est pas branchee, cette phrase est fausse,
  et c est exactement le terrain sur lequel la CNIL a sanctionne deux societes
  de voyance en ligne le 26/09/2024 (voir CONFORMITE.md).

  Soit on branche ${BANNIERE}, soit on retire le traceur.
`);
process.exit(1);
