/**
 * APPEL A — comprendre et classer ce que la personne raconte.
 *
 * Un seul appel modele, JSON strict. Ne rédige rien pour la personne, sauf
 * `questionDeRelance` si une information manque. Ne calcule rien : les dates
 * de periode sont resolues a partir du texte et de la date du jour, jamais
 * inventees. C est la fusion des « agents 1 et 2 » du brief — detection de
 * l information manquante et classification — dans un seul appel structure,
 * pour ne pas payer un modele deux fois pour comprendre une seule phrase.
 *
 * Ce fichier n importe PAS lib/garde-jargon.ts : sa sortie est un JSON
 * interne, jamais montre a la personne (sauf `questionDeRelance`, qui est une
 * question de suivi, pas la reponse finale, et n a donc pas a respecter
 * l interdit de jargon — mais le prompt le lui interdit quand meme, par
 * coherence de ton).
 */

import type { TopicMaison } from "@/lib/silence";
import { AUTRES_SYSTEMES } from "@/lib/astrologue-endpoints";

export type { TopicMaison };

export interface ComprehensionUtilisateur {
  sujet: "soi" | "autre";
  autrePersonne: { nomLibre: string } | null;
  topicCandidats: TopicMaison[];
  tense: "passe" | "present" | "futur" | "mixte";
  periode: {
    texteOriginal: string | null;
    dateDebut: string | null;
    dateFin: string | null;
    resolue: boolean;
  };
  manque: {
    dateOuPeriode: boolean;
    sujetOuDomaine: boolean;
    identitePersonne: boolean;
  };
  /**
   * La question releve d un systeme que "Parle avec un astrologue" ne couvre
   * pas (numerologie, Human Design, BaZi, Feng Shui, Qi Men Dun Jia, Yi Jing,
   * astrologie tibetaine, Jyotish/vedique) — voir lib/astrologue-endpoints.ts.
   * Le moteur les calcule peut-etre ailleurs, mais cette fonction ne parle
   * QUE le systeme occidental des 12 maisons ; forcer la question dedans
   * produirait une reponse qui a l air de repondre sans repondre a la vraie
   * question. On le dit, on ne fait pas semblant.
   */
  horsPerimetre: { horsPerimetre: boolean; systemeMentionne: string | null };
  /**
   * "Quand est-ce que je devrais signer / demenager / me marier ?" — une
   * recherche electionnelle (choisir une BONNE date future), pas une
   * description de ce qui se passe deja. Trouvaille du 12/09/2026 en
   * confrontant le routeur a la banque de 100 questions les plus posees
   * (create-api-md-files/100_MOST_ASKED_QUESTIONS.md du corpus RAG) :
   * "Great Beginnings & Endings" + "Electional Astrology" a elles seules
   * forment 20 des 100 questions les plus courantes. Sans ce champ, une
   * question electionnelle tombait dans le meme chemin que "qu'est-ce qui se
   * passe maintenant" et recevait une reponse qui ne repond pas a la vraie
   * question — jamais construite/testee, donc jamais activee dans le routeur
   * tant que Marie-Ange n'a pas confirme un point d'entree electionnel
   * compatible avec le temps d'une conversation.
   */
  demandeElection: boolean;
  questionDeRelance: string | null;
  pretPourMoteur: boolean;
  resumeInterne: string;
}

const TOPICS: TopicMaison[] = [
  "identity", "money", "communication", "home", "creativity", "health",
  "relationships", "transformation", "philosophy", "career", "community", "solitude",
];

function promptComprehension(aujourdhui: string, contexteUtilisateur: string): string {
  return `Tu es la première étape de "Parle avec un astrologue" sur Favorable. Une personne t'écrit librement ce qu'elle vit. Tu ne rédiges RIEN pour elle, sauf une éventuelle question de relance. Tu ne calcules rien, tu ne devines aucune date : le calcul appartient entièrement au moteur, jamais à toi.

Aujourd'hui est ${aujourdhui}. Sers-t'en pour résoudre une expression relative ("depuis juin", "ces trois derniers mois").
${contexteUtilisateur ? `\n${contexteUtilisateur}\nCe contexte t'aide à comprendre la personne, il ne remplace jamais ce qu'elle vient d'écrire.\n` : ""}

Réponds STRICTEMENT en JSON, avec ce format :
{
  "sujet": "soi" | "autre",
  "autrePersonne": { "nomLibre": "..." } | null,
  "topicCandidats": [1 à 2 valeurs parmi: ${TOPICS.join(", ")}],
  "tense": "passe" | "present" | "futur" | "mixte",
  "periode": {
    "texteOriginal": "citation exacte de la personne, ou null",
    "dateDebut": "YYYY-MM-DD ou null",
    "dateFin": "YYYY-MM-DD ou null (null = en cours, jusqu'à aujourd'hui)",
    "resolue": true | false
  },
  "manque": {
    "dateOuPeriode": true | false,
    "sujetOuDomaine": true | false,
    "identitePersonne": true | false
  },
  "horsPerimetre": { "horsPerimetre": true | false, "systemeMentionne": "..." | null },
  "demandeElection": true | false,
  "questionDeRelance": "une seule question, dans la langue de la personne, ou null",
  "pretPourMoteur": true | false,
  "resumeInterne": "1 phrase, jamais montrée à la personne"
}

RÈGLES :
- N'invente JAMAIS "dateDebut"/"dateFin". Si la personne ne donne aucun repère temporel et que la question porte clairement sur maintenant, laisse "periode.resolue": false et continue — CE N'EST PAS une information manquante en soi, seulement si le sens de la question l'exige (ex: "pourquoi ça traîne depuis si longtemps ?" sans date = information manquante).
- "topicCandidats" vient exclusivement de la liste donnée. N'utilise jamais un numéro de maison ni un nom de planète, même ici, en interne.
- Si "sujet": "autre", capture seulement le nom libre donné par la personne ("mon frère", "Julie") dans "autrePersonne.nomLibre" — ne fabrique jamais de date de naissance ni d'identité complète : l'application vérifiera si cette personne existe déjà dans ses connexions enregistrées.
- "horsPerimetre.horsPerimetre": true UNIQUEMENT si la personne demande explicitement un système que cette fonction ne couvre pas : ${Object.keys(AUTRES_SYSTEMES).join(", ")}, tarot, ou tout autre système de divination distinct de l'astrologie occidentale. Mets alors le nom (en français courant, ex. "numérologie", "Human Design") dans "systemeMentionne". Ne le déclenche JAMAIS pour une question normale sur sa vie — c'est réservé au cas où la personne nomme elle-même une autre pratique.
- "demandeElection": true si la personne demande de CHOISIR une bonne date future pour agir ("quand devrais-je signer", "quel est le meilleur moment pour déménager/me marier/lancer mon projet"). C'est différent de "qu'est-ce qui se passe" ou "qu'est-ce qui s'en vient" : ici la personne veut qu'on lui indique LA date, pas qu'on lui décrive une période. Cette fonction ne sait pas encore faire ça — ne remplis "topicCandidats"/"periode" que si tu peux, mais mets "demandeElection": true de toute façon.
- Une seule question à la fois dans "questionDeRelance", même si plusieurs choses manquent : choisis la plus utile pour avancer. "pretPourMoteur": false tant qu'une question est posée.
- "pretPourMoteur": true seulement si "horsPerimetre.horsPerimetre" et "demandeElection" sont faux, que tu peux remplir "sujet", au moins un "topicCandidats", et qu'aucun champ de "manque" n'est vrai.
- Ne rédige jamais de réponse de fond ici, même si tu penses savoir quoi dire : ce n'est pas ton rôle.
- Retourne strictement le JSON demandé, rien d'autre.`;
}

export interface AppelComprehensionOptions {
  apiKey: string;
  model?: string;
  historique: Array<{ role: "user" | "assistant"; content: string }>;
  message: string;
  /** Sortie de lib/profil-prompt.ts:lignesContexteUtilisateur, ou "". */
  contexteUtilisateur?: string;
}

export type ResultatComprehension =
  | { ok: true; comprehension: ComprehensionUtilisateur }
  | { ok: false; raison: "modele_indisponible" | "reponse_illisible" | "reponse_invalide"; detail?: string };

export async function appellerComprehension(
  options: AppelComprehensionOptions,
): Promise<ResultatComprehension> {
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const model = options.model ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: promptComprehension(aujourdhui, options.contexteUtilisateur ?? "") },
        ...options.historique,
        { role: "user", content: options.message },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 400,
    }),
  });

  if (!res.ok) {
    return { ok: false, raison: "modele_indisponible" };
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return { ok: false, raison: "modele_indisponible" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, raison: "reponse_illisible" };
  }

  const validation = validerComprehension(parsed);
  if (!validation.valide) {
    return { ok: false, raison: "reponse_invalide", detail: validation.detail };
  }
  return { ok: true, comprehension: validation.comprehension };
}

function validerComprehension(
  brut: unknown,
): { valide: true; comprehension: ComprehensionUtilisateur } | { valide: false; detail: string } {
  if (!brut || typeof brut !== "object" || Array.isArray(brut)) {
    return { valide: false, detail: "objet attendu" };
  }
  const o = brut as Record<string, unknown>;

  if (o.sujet !== "soi" && o.sujet !== "autre") {
    return { valide: false, detail: "sujet invalide" };
  }

  let autrePersonne: { nomLibre: string } | null = null;
  if (o.sujet === "autre") {
    const ap = o.autrePersonne as Record<string, unknown> | null;
    const nom = typeof ap?.nomLibre === "string" ? ap.nomLibre.trim() : "";
    if (!nom) return { valide: false, detail: "autrePersonne.nomLibre manquant" };
    autrePersonne = { nomLibre: nom };
  }

  const topicsBruts = Array.isArray(o.topicCandidats) ? o.topicCandidats : [];
  const topicCandidats = topicsBruts.filter((t): t is TopicMaison => TOPICS.includes(t as TopicMaison)).slice(0, 2);
  if (topicCandidats.length === 0 && o.sujet === "soi") {
    // Un sujet "soi" sans aucun domaine plausible n'est pas exploitable —
    // mais ce n'est pas nécessairement une erreur du modèle : c'est souvent
    // signe que "manque.sujetOuDomaine" aurait dû être vrai. On ne rejette
    // pas ici : le champ "manque" en aval porte la décision.
  }

  const tenseValide = ["passe", "present", "futur", "mixte"];
  const tense = tenseValide.includes(o.tense as string) ? (o.tense as ComprehensionUtilisateur["tense"]) : "present";

  const p = (o.periode ?? {}) as Record<string, unknown>;
  const periode: ComprehensionUtilisateur["periode"] = {
    texteOriginal: typeof p.texteOriginal === "string" ? p.texteOriginal : null,
    dateDebut: /^\d{4}-\d{2}-\d{2}$/.test(p.dateDebut as string) ? (p.dateDebut as string) : null,
    dateFin: /^\d{4}-\d{2}-\d{2}$/.test(p.dateFin as string) ? (p.dateFin as string) : null,
    resolue: p.resolue === true,
  };
  if (periode.resolue && !periode.dateDebut) {
    // "resolue" sans date de début n'a pas de sens — on rétrograde plutôt que
    // de laisser un état incohérent traverser le routeur.
    periode.resolue = false;
  }

  const m = (o.manque ?? {}) as Record<string, unknown>;
  const manque: ComprehensionUtilisateur["manque"] = {
    dateOuPeriode: m.dateOuPeriode === true,
    sujetOuDomaine: m.sujetOuDomaine === true || (o.sujet === "soi" && topicCandidats.length === 0),
    identitePersonne: m.identitePersonne === true,
  };

  const hp = (o.horsPerimetre ?? {}) as Record<string, unknown>;
  const horsPerimetre: ComprehensionUtilisateur["horsPerimetre"] = {
    horsPerimetre: hp.horsPerimetre === true,
    systemeMentionne: typeof hp.systemeMentionne === "string" && hp.systemeMentionne.trim() ? hp.systemeMentionne.trim() : null,
  };

  const demandeElection = o.demandeElection === true;
  const courtCircuite = horsPerimetre.horsPerimetre || demandeElection;

  const questionDeRelance = typeof o.questionDeRelance === "string" && o.questionDeRelance.trim().length > 0
    ? o.questionDeRelance.trim()
    : null;

  const questionRequise = !courtCircuite && (manque.dateOuPeriode || manque.sujetOuDomaine || manque.identitePersonne);
  const pretPourMoteur = !courtCircuite && o.pretPourMoteur === true && !questionRequise && questionDeRelance === null;

  const resumeInterne = typeof o.resumeInterne === "string" ? o.resumeInterne : "";

  return {
    valide: true,
    comprehension: {
      sujet: o.sujet,
      autrePersonne,
      topicCandidats,
      tense,
      periode,
      manque,
      horsPerimetre,
      demandeElection,
      questionDeRelance: courtCircuite ? null : questionRequise ? (questionDeRelance ?? "Peux-tu préciser ?") : null,
      pretPourMoteur,
      resumeInterne,
    },
  };
}
