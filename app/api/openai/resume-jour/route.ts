/**
 * POST /api/openai/resume-jour
 *
 * La synthese ecrite qui accompagne le resume du jour.
 *
 * ─── EN QUOI ELLE DIFFERE DES DEUX AUTRES ───────────────────────────────────
 *
 * `daily-brief` et `daily-briefing` appellent le moteur, prennent les trois
 * signaux les plus forts, et demandent au modele d en faire un texte. Celle-ci
 * n appelle RIEN : elle recoit les periodes deja ouvertes, telles que
 * l appareil les connait, et demande seulement de les mettre en phrases.
 *
 * Trois consequences :
 *
 *  1. **Le modele n a plus aucune matiere brute a traduire.** On lui donne des
 *     domaines de vie en toutes lettres et des durees en jours. Il ne peut donc
 *     plus laisser passer de jargon : il n en recoit pas.
 *  2. **Rien ne peut etre invente sans que ca se voie.** Le texte doit parler
 *     des periodes fournies, et le garde-fou refuse tout nom de technique.
 *  3. **Un appel au lieu de deux**, et l ecran reste lisible meme si celui-ci
 *     echoue : le dessin, lui, est deja la.
 *
 * ─── FORME DE LA REPONSE ────────────────────────────────────────────────────
 *
 * SUCCES  200  { ok: true, resume: string, action?: string }
 * ECHEC   4xx/5xx  { ok: false, raison: string }
 *
 * RAISONS : sujet_manquant 400 · configuration 500 · modele_indisponible 502 ·
 *           reponse_illisible 502 · reponse_trop_longue 502 ·
 *           jargon_technique 502 · budget_depasse 429 · garde_indisponible 503
 */

import { NextRequest, NextResponse } from "next/server";
import {
  enforceAiBudget,
  applyGuardCookie,
  budgetErrorHeaders,
  AiBudgetError,
  AiGuardUnavailableError,
  type AiGuardResult,
} from "@/lib/ai-guard";
import { corsHandler, corsPreflightResponse } from "@/lib/cors";
import { instructionLangue } from "@/lib/instruction-langue";
import { compterMots, detecterJargon, detecterAstreRepete } from "@/lib/garde-jargon";

export const runtime = "nodejs";

const OPENAI_MODEL = "gpt-4o-mini";
/** La carte porte deja le dessin : le texte l accompagne, il ne le remplace pas. */
const LIMITE_MOTS = 55;

interface PeriodeEnvoyee {
  /** Le domaine de vie, en toutes lettres, deja traduit par l ecran. */
  domaine: string;
  /** Jours ecoules depuis l ouverture. */
  depuis: number;
  /** Jours restants, ou null si la fin n est pas connue. */
  restants: number | null;
  /** Ce que le moteur dit de la qualite de la periode, quand il le dit. */
  qualite?: string;
}

function echec(raison: string, status: number, guard: AiGuardResult | null) {
  const res = NextResponse.json({ ok: false, raison }, { status });
  return guard ? applyGuardCookie(guard, res) : res;
}

const SYSTEME = `Tu ecris la synthese quotidienne de Favorable.

On te donne les PERIODES DE VIE actuellement ouvertes pour une personne. Elles te sont donnees en clair : un domaine de vie, depuis combien de jours elle est ouverte, combien de jours il lui reste.

Tu ne recois aucune donnee technique, et tu n as donc rien a traduire. Ecris simplement ce que ces periodes racontent ensemble.

FORMAT JSON strict :
{
  "resume": "2 a 3 phrases. Ce qui porte la periode en cours, et ce que les autres ajoutent autour.",
  "action": "1 phrase concrete, facultative. Omets-la si rien d utile ne vient."
}

CE QUI EST INTERDIT, sans exception :
- inventer une periode qui n est pas dans la liste ;
- annoncer ce qui va arriver. Le produit est DESCRIPTIF : on decrit ce qui est ouvert, jamais ce que ca produira ;
- nommer une technique, un astre, un aspect, une maison numerotee, une eclipse ou une retrogradation. Tu n en recois pas, n en invente pas ;
- juger. « Une periode chargee » est un compte, « une periode difficile » est un jugement que la donnee ne porte pas.

REGLES :
- Maximum ${LIMITE_MOTS} mots pour resume + action. Au-dela la reponse est rejetee et la personne ne lit rien : compte tes mots.
- Une phrase finie vaut mieux qu une phrase riche : coupe le contenu, jamais la phrase.
- Tutoiement, francais courant, ton sobre.
- Si une periode dure depuis longtemps, dis-le comme un fond ; si elle vient de s ouvrir, dis-le comme une nouvelle. C est la seule hierarchie qui t est demandee.`;

async function handlePost(request: NextRequest) {
  let guard: AiGuardResult | null = null;
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return echec("configuration", 500, null);

    const body = (await request.json()) as {
      locale?: string | null;
      periodes?: PeriodeEnvoyee[];
    };
    const periodes = Array.isArray(body.periodes) ? body.periodes.slice(0, 6) : [];
    if (periodes.length === 0) return echec("sujet_manquant", 400, null);

    guard = await enforceAiBudget(request, "resume-jour");

    const faits = periodes
      .map((p, i) => {
        const reste = p.restants === null ? "fin non datee" : `encore ${p.restants} jours`;
        const q = p.qualite ? `, qualite annoncee par le calcul : ${p.qualite}` : "";
        return `${i + 1}. ${p.domaine} — ouverte depuis ${p.depuis} jours, ${reste}${q}`;
      })
      .join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: SYSTEME + instructionLangue(body.locale ?? "fr") },
          { role: "user", content: `Les periodes ouvertes aujourd hui :\n${faits}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.55,
        max_tokens: 260,
      }),
    });

    if (!res.ok) {
      console.error("[resume-jour] OpenAI", res.status);
      return echec("modele_indisponible", 502, guard);
    }
    const data = await res.json();
    const contenu = data.choices?.[0]?.message?.content;
    if (!contenu) return echec("modele_indisponible", 502, guard);

    let sortie: { resume?: unknown; action?: unknown };
    try {
      sortie = JSON.parse(contenu);
    } catch {
      return echec("reponse_illisible", 502, guard);
    }

    const resume = typeof sortie.resume === "string" ? sortie.resume.trim() : "";
    const action = typeof sortie.action === "string" ? sortie.action.trim() : "";
    if (!resume) return echec("reponse_illisible", 502, guard);

    // Les memes garde-fous que partout : la longueur, puis le jargon. Le modele
    // ne recoit aucune mecanique, mais il en connait — rien ne l empeche d en
    // ecrire de lui-meme.
    if (compterMots(resume, action) > LIMITE_MOTS) {
      return echec("reponse_trop_longue", 502, guard);
    }
    if (detecterJargon(resume, action) || detecterAstreRepete(resume, action)) {
      return echec("jargon_technique", 502, guard);
    }

    return applyGuardCookie(
      guard,
      NextResponse.json({ ok: true, resume, action: action || undefined }),
    );
  } catch (error) {
    if (error instanceof AiBudgetError) {
      return NextResponse.json({ ok: false, raison: "budget_depasse", ...error.toJSON() }, {
        status: 429,
        headers: budgetErrorHeaders(error),
      });
    }
    if (error instanceof AiGuardUnavailableError) {
      return NextResponse.json({ ok: false, raison: "garde_indisponible" }, { status: error.status });
    }
    console.error("[resume-jour]", error);
    return echec("erreur_interne", 500, guard);
  }
}

export const POST = corsHandler(handlePost);

export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}
