/**
 * Aucun secret dans le code.
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * Le 02/09/2026, `app/api/celebs/route.ts` portait le mot de passe Postgres de
 * la base astrolearn EN CLAIR, versionne, dans un depot PUBLIC. Personne ne
 * l avait vu : aucun controle ne regardait le code source pour ca — le seul
 * qui existait verifiait `.env.example`, un fichier ou l on s attend a trouver
 * des noms de variables, pas des valeurs.
 *
 * Retirer un secret d un fichier ne le retire pas de l historique git. Ce
 * controle empeche le PROCHAIN, il ne repare pas le precedent : un secret
 * commite doit etre change, pas seulement efface.
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
// `--others --exclude-standard` ajoute les fichiers pas encore indexes, en
// respectant .gitignore : sans eux, ce controle ne voit que le passe et laisse
// passer tout fichier neuf jusqu au commit suivant.

const fichiers = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" })
  .split("\n")
  .filter((f) => /\.(tsx?|mjs|js|json|ya?ml|sh)$/.test(f))
  .filter((f) => existsSync(f))
  .filter((f) => !/^scripts\/verifier-secrets\.mjs$/.test(f))
  // Les tests de bout en bout portent le mot de passe d un compte JETABLE,
  // cree pour eux, sans acces a rien. Le nommer ici vaut mieux que de relacher
  // le motif : la regle reste stricte partout ailleurs.
  .filter((f) => !/^e2e\//.test(f));

/**
 * Les formes qui ne laissent aucun doute. On ne cherche pas a etre exhaustif :
 * un motif trop large ferait echouer sur du texte normal, et un controle qui
 * crie au loup se fait desactiver.
 */
const MOTIFS = [
  { nom: "clef OpenAI",        motif: /\bsk-[A-Za-z0-9_-]{20,}/ },
  { nom: "clef Stripe vive",   motif: /\b(sk|rk)_live_[A-Za-z0-9]{10,}/ },
  { nom: "secret de webhook",  motif: /\bwhsec_[A-Za-z0-9]{10,}/ },
  { nom: "clef RevenueCat",    motif: /\bappl_[A-Za-z0-9]{20,}/ },
  { nom: "jeton JWT",          motif: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/ },
  { nom: "clef privee",        motif: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
  // Un mot de passe affecte a une clef nommee, avec une valeur qui n est ni
  // vide, ni une variable, ni un exemple.
  {
    nom: "mot de passe en clair",
    motif: /\b(password|passwd|motDePasse)\s*[:=]\s*["'`](?!\s*["'`])(?!process\.)(?!\$\{)(?![A-Z_]+["'`])[^"'`\n]{8,}["'`]/i,
  },
  {
    nom: "chaine de connexion avec mot de passe",
    motif: /\b(postgres(ql)?|mysql|mongodb(\+srv)?):\/\/[^\s:@"'`]+:[^\s@"'`]{4,}@/i,
  },
];

const trouves = [];
for (const f of fichiers) {
  const lignes = readFileSync(f, "utf8").split("\n");
  lignes.forEach((ligne, i) => {
    // Une ligne de commentaire qui DECRIT le probleme n en est pas un.
    const l = ligne.trimStart();
    if (l.startsWith("//") || l.startsWith("*") || l.startsWith("#")) return;
    for (const m of MOTIFS) {
      if (m.motif.test(ligne)) {
        trouves.push({ f, ligne: i + 1, nom: m.nom, extrait: ligne.trim().slice(0, 80) });
        break;
      }
    }
  });
}

console.log("");
if (trouves.length) {
  console.log(`  ${trouves.length} secret(s) probable(s) dans le code :\n`);
  for (const t of trouves) console.log(`    ${t.f}:${t.ligne}  ${t.nom}\n        ${t.extrait}`);
  console.log("\n  Un secret commite doit etre CHANGE, pas seulement efface :");
  console.log("  l historique git le garde. Sors-le du code, mets-le dans");
  console.log("  l environnement, et tourne la clef.\n");
  process.exit(1);
}
console.log(`  ${fichiers.length} fichiers suivis, aucun secret en clair.\n`);
