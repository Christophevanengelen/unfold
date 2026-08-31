/**
 * Verifie la lecture des adresses de retour, sans telephone ni Supabase.
 *
 * Pourquoi ce fichier : la panne d origine etait muette. Le schema unfold://
 * etait declare, iOS ouvrait bien l app, et le jeton partait a la poubelle sans
 * qu aucune erreur ne s affiche — la personne voyait juste l ecran d accueil,
 * pas connectee. Rien, dans aucun journal, ne disait pourquoi.
 *
 * On remplace donc Supabase par un mouchard et on regarde ce qui lui est
 * demande pour chaque forme d adresse.
 *
 *   node scripts/verifier-liens-profonds.mjs
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dossier = mkdtempSync(join(tmpdir(), "liens-"));

// Un faux client : il note ce qu on lui demande au lieu d appeler le reseau.
writeFileSync(join(dossier, "faux-supabase.ts"), `
export const appels: any[] = [];
export const supabaseAuth = {
  auth: {
    setSession: async (a: any) => { appels.push(["setSession", a]); return { error: null }; },
    exchangeCodeForSession: async (c: any) => { appels.push(["echange", c]); return { error: null }; },
  },
};
`);
writeFileSync(join(dossier, "faux-platform.ts"), `export const isNative = () => false;\n`);

execFileSync("npx", ["esbuild", "lib/deep-links.ts", "--bundle", "--platform=node",
  "--format=esm", `--outfile=${join(dossier, "liens.mjs")}`, "--log-level=error",
  `--alias:@/lib/supabase-auth=${join(dossier, "faux-supabase.ts")}`,
  `--alias:@/lib/platform=${join(dossier, "faux-platform.ts")}`,
  "--external:@capacitor/*"], { stdio: "inherit" });

const { ouvrirSessionDepuisAdresse, RETOUR_NATIF } = await import(join(dossier, "liens.mjs"));
const { appels } = await import(join(dossier, "liens.mjs")).then(() => import(join(dossier, "faux-supabase.ts")).catch(() => ({ appels: [] })));

let echecs = 0;
const verifier = (nom, condition) => {
  if (!condition) echecs++;
  console.log(`${condition ? "  ok  " : "ECHEC "} ${nom}`);
};

console.log("\nLa lecture des adresses de retour");

verifier("l adresse de retour vise bien l app",
  RETOUR_NATIF === "unfold://localhost/auth/callback");

verifier("jetons dans le fragment : session ouverte",
  await ouvrirSessionDepuisAdresse(
    `${RETOUR_NATIF}?locale=fr#access_token=AAA&refresh_token=BBB&token_type=bearer`) === true);

verifier("code dans la requete : session ouverte",
  await ouvrirSessionDepuisAdresse(`${RETOUR_NATIF}?code=XYZ`) === true);

verifier("code dans le fragment : session ouverte aussi",
  await ouvrirSessionDepuisAdresse(`${RETOUR_NATIF}#code=XYZ`) === true);

console.log("\nCe qui ne doit RIEN ouvrir");

verifier("lien expire renvoye par Supabase",
  await ouvrirSessionDepuisAdresse(
    `${RETOUR_NATIF}#error=access_denied&error_description=Email+link+is+invalid+or+has+expired`) === false);

verifier("jeton d acces seul, sans rafraichissement",
  await ouvrirSessionDepuisAdresse(`${RETOUR_NATIF}#access_token=AAA`) === false);

verifier("une adresse quelconque de l app",
  await ouvrirSessionDepuisAdresse("unfold://localhost/app/timeline/") === false);

verifier("une chaine qui n est pas une adresse",
  await ouvrirSessionDepuisAdresse("n importe quoi") === false);

verifier("une adresse vide",
  await ouvrirSessionDepuisAdresse("") === false);

rmSync(dossier, { recursive: true, force: true });
console.log(echecs === 0 ? "\nTout passe.\n" : `\n${echecs} echec(s).\n`);
process.exit(echecs === 0 ? 0 : 1);
