/**
 * ETALONNER LA VOIX DE L'APPEL B SUR DES CAS FIXES, SANS L'APP.
 *
 *     node scripts/etalonner-agent-ecriture.mjs
 *
 * Fait passer 2-3 verdicts inventes (calibres sur des motifs reels du corpus
 * RAG hors-ligne, jamais sur un vrai theme d utilisateur — voir
 * lib/astrologue-carnet-de-lecture.ts) par le MEME prompt que la route reelle,
 * puis imprime : le JSON produit, le resultat du garde-jargon, et une note de
 * reference humaine a comparer a l oeil. Ne note rien automatiquement.
 *
 * Miroir de lib/astrologue-prompt-redaction.ts et lib/garde-jargon.ts, comme
 * scripts/tester-prompt-match.mjs l est deja de lib/connection-delineation.ts :
 * aucun script de ce depot n execute de TypeScript directement (pas de
 * ts-node/tsx en dependance), donc la logique de prompt est reprise ici,
 * pas importee. Si l une des deux diverge, corriger les deux.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const LIMITE_MOTS_ASTROLOGUE = 140;

const CARNET_DE_LECTURE = `Une fenêtre courte et nette (quelques semaines) se décrit avec plus d'affirmation qu'une fenêtre longue et diffuse (plusieurs mois à années) : la première mérite une formulation précise, la seconde une formulation posée, presque en toile de fond.
Une Force élevée (plusieurs techniques indépendantes d'accord) autorise à nommer le sujet plus directement, mais jamais à en dramatiser l'issue : la Force dit qu'il se passe quelque chose de réel, jamais quoi qu'il va en résulter.
Ne jamais confondre "cette période est dense" avec "cette période sera difficile" : la densité est un fait du calcul, la tonalité (difficile, porteuse, neutre) ne l'est pas — le moteur ne la fournit pas, donc on ne l'invente pas.
Un chapitre de fond sans déclencheur immédiat se raconte comme un décor stable, jamais comme une urgence : c'est le déclencheur, quand il existe, qui justifie de parler maintenant plutôt que d'attendre.`;

const SOCLE = `DE LA MÉCANIQUE AU DOMAINE DE VIE — LA RÈGLE CENTRALE :
Les faits qu'on te donne parlent de maisons, de fenêtres, de force de convergence. C'est ta matière de travail, pas ton vocabulaire. Traduis systématiquement :
- la maison → le domaine de vie concret
- la durée et la force de la fenêtre → la nature du mouvement et la période
Écris le résultat de cette traduction. N'écris jamais l'opération elle-même.

INTERDIT DANS LE TEXTE RENDU — sans exception :
- aucun numéro de maison, aucun nom d'aspect, jamais "natal", aucun nom de signe comme étiquette
- le nom d'un astre : UNE SEULE FOIS au maximum. Zéro fois est une bonne réponse.
- ne jamais dire "le moteur" ni nommer une source technique
- ne jamais affirmer qu'un événement précis va se produire ; ne jamais transformer une force en pourcentage`;

const CAS = [
  {
    nom: "crise-double-convergence (calibré sur demetra/circumamb-crisis-periods.md)",
    fenetre: {
      maisonNum: 8, force: 3,
      declencheur: { debut: "2026-09-03", fin: "2026-09-18" },
      fond: { debut: "2026-06-12", fin: "2027-02-10" },
      approximee: false,
    },
    referenceHumaine: "Une période dense et resserrée sur l'argent partagé/les engagements, pas un simple 'ça bouge' vague — deux couches concordent, pas une seule.",
  },
  {
    nom: "silence-legitime",
    silence: { chapitreDeFond: null, prochaineFenetre: null },
    referenceHumaine: "Doit dire clairement que rien ne converge, le présenter comme une bonne nouvelle, sans inventer de date.",
  },
  {
    nom: "fenetre-longue-diffuse",
    fenetre: {
      maisonNum: 10, force: 2,
      declencheur: { debut: "2026-08-01", fin: "2026-10-15" },
      fond: { debut: "2025-01-01", fin: "2027-06-01" },
      approximee: true,
    },
    referenceHumaine: "Force plus faible et fenêtre plus large : le ton doit rester posé, presque un décor, pas une annonce nette.",
  },
];

function promptParle(f) {
  return `Tu écris la réponse de "Parle avec un astrologue" sur Favorable. Une personne t'a raconté ce qu'elle vit ; tu réponds en français courant, tutoiement, avec ces FAITS déjà calculés :

- domaine de vie concerné (maison numéro ${f.maisonNum}, à traduire — jamais à écrire tel quel)
- force de convergence : ${f.force} techniques indépendantes d'accord sur la même période
- fenêtre courte (déclencheur) : du ${f.declencheur.debut} au ${f.declencheur.fin}
- fenêtre longue (fond) : du ${f.fond.debut} au ${f.fond.fin}
- fenêtre approximative : ${f.approximee ? "oui, arrondie par le moteur" : "non, dates exactes"}

Réponds STRICTEMENT en JSON, ces quatre champs, toujours dans cet ordre :
{ "cePasse": "...", "dOuCaVient": "...", "quiLaDit": "...", "ceQuiChange": "..." }

${SOCLE}

VOIX : tutoiement partout, français courant, sobre, direct, premium. Maximum ${LIMITE_MOTS_ASTROLOGUE} mots au total.

CARNET DE LECTURE INTERNE (jamais montré, jamais cité) :
${CARNET_DE_LECTURE}`;
}

function promptSilence(v) {
  return `Tu écris la réponse de "Parle avec un astrologue" sur Favorable. Pour ce sujet précis et cette période, RIEN de fort ne converge dans les calculs du moteur.

${v.chapitreDeFond ? `Chapitre de fond en cours : ${v.chapitreDeFond.signification}` : "Aucun chapitre de fond identifié."}
${v.prochaineFenetre ? `Prochaine fenêtre de convergence : à partir du ${v.prochaineFenetre.debut}.` : "Aucune fenêtre à venir dans l'horizon connu."}

Réponds STRICTEMENT en JSON : { "reponse": "..." }

Dis clairement que rien de fort ne converge — présente-le comme une BONNE NOUVELLE. Ne donne une date que si elle est fournie ci-dessus.

${SOCLE}

VOIX : tutoiement, français courant. Maximum ${LIMITE_MOTS_ASTROLOGUE} mots.`;
}

// ─── Garde-jargon, mirroir de lib/garde-jargon.ts ────────────────────────

const IDEOGRAMMES = /[぀-ヿ㐀-䶿一-鿿豈-﫿]/g;
function compterMots(...textes) {
  const texte = textes.join(" ");
  const cjk = (texte.match(IDEOGRAMMES) ?? []).length;
  const reste = texte.replace(IDEOGRAMMES, " ").split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
  return reste + Math.ceil(cjk / 2);
}
const MOTIFS_JARGON = [
  { nom: "numero de maison", motif: /\b\d{1,2}\s*(?:e|è|ème|eme|er|re|ère|ere)?\s*[-–]?\s*(?:\d{1,2}\s*(?:e|è|ème|eme)?\s*)?maisons?\b/i },
  { nom: "maison numerotee", motif: /\bmaisons?\s+(?:n°\s*)?\d{1,2}\b/i },
  { nom: "nom d'aspect", motif: /\b(?:carr[ée]e?s?|oppositions?|conjonctions?|trigones?|sextiles?|quinconces?)\b/i },
  { nom: "reference au natal", motif: /\bnatal(?:e|es|aux)?\b/i },
];
function detecterJargon(...textes) {
  const texte = textes.join(" ");
  for (const { nom, motif } of MOTIFS_JARGON) if (motif.test(texte)) return nom;
  return null;
}

function valider(champs) {
  const textes = Object.values(champs);
  const mots = compterMots(...textes);
  if (mots > LIMITE_MOTS_ASTROLOGUE) return { valide: false, raison: `trop long (${mots} mots)` };
  const jargon = detecterJargon(...textes);
  if (jargon) return { valide: false, raison: `jargon: ${jargon}` };
  return { valide: true };
}

// ─── Appel OpenAI ─────────────────────────────────────────────────────────

function chargerCle() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  for (const f of [".env.local", ".env"]) {
    try {
      const ligne = readFileSync(join(process.cwd(), f), "utf8")
        .split("\n")
        .find((l) => l.startsWith("OPENAI_API_KEY="));
      if (ligne) return ligne.slice("OPENAI_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
    } catch {}
  }
  return null;
}

async function appeler(systemPrompt) {
  const cle = chargerCle();
  if (!cle) throw new Error("OPENAI_API_KEY introuvable (env ou .env.local)");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${cle}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Rédige la réponse à partir des faits donnés ci-dessus." },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 400,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
}

async function main() {
  for (const cas of CAS) {
    const prompt = cas.fenetre ? promptParle(cas.fenetre) : promptSilence(cas.silence);
    const sortie = await appeler(prompt);
    const validation = valider(sortie);
    console.log(`\n=== ${cas.nom} ===`);
    console.log("modèle   :", JSON.stringify(sortie, null, 2));
    console.log("garde    :", validation);
    console.log("humain   :", cas.referenceHumaine);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
