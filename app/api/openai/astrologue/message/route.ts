/**
 * POST /api/openai/astrologue/message
 *
 * Un tour de "Parle avec un astrologue" (messages/briefing-astrologue-marie-ange.html).
 * Deux appels modele au plus par tour (jamais quatre — decision prise avant
 * implementation, voir C:\Users\marie\.claude\plans\i-need-to-wirk-cuddly-crab.md) :
 *
 *   Appel A (lib/astrologue-comprehension.ts)  — comprendre + classer + detecter
 *                                                 ce qui manque, JSON structure.
 *   Agent 3 (lib/astrologue-routeur.ts)        — code pur, PAS un appel modele :
 *                                                 decide quoi demander au moteur,
 *                                                 fait voter lib/silence.ts.
 *   Appel B (lib/astrologue-prompt-redaction.ts) — redige la reponse finale,
 *                                                   jamais de jargon (lib/garde-jargon.ts).
 *
 * Reponse : meme discipline ok:true/ok:false que app/api/openai/daily-briefing/route.ts.
 *
 * SUCCES — HTTP 200
 *   { ok: true, sessionId, turn, message: { role: "assistant", content },
 *     parties?: { cePasse, dOuCaVient, ceQuiChange, prochaineDate? },
 *     visuel?: { forme: "fenetre", maison, force, debut, fin, approximee }
 *            | { forme: "signaux", priorites: number[] },
 *     needsClarification: boolean, awaitingDetail?: boolean }
 *
 * ECHEC — HTTP 400, 404, 409, 429, 500, 502 ou 503
 *   { ok: false, raison: string }
 *
 * RAISONS possibles (verifiees par scripts/verifier-astrologue.mjs) :
 *   sujet_manquant         400  deviceId absent
 *   birthdata_manquant     400  date/heure de naissance absentes
 *   fuseau_manquant        400  fuseau absent : sans lui le theme serait faux
 *   reponse_invalide       400  message vide, ou 502 si le modele rend un JSON incomplet
 *   session_introuvable    404  session archivee ou inexistante
 *   theme_perime           409  birth_hash de la requete != celui de la session
 *   budget_depasse         429  quota AI atteint (bucket "astrologue")
 *   configuration          500  cle OpenAI absente
 *   erreur_interne         500  exception inattendue
 *   modele_indisponible    502  OpenAI a repondu en erreur ou a vide (Appel A ou B)
 *   reponse_illisible      502  le JSON du modele n'est pas parsable
 *   reponse_trop_longue    502  au-dela de LIMITE_MOTS_ASTROLOGUE mots (Appel B)
 *   jargon_technique       502  mecanique celeste laissee dans le texte (Appel B)
 *   garde_indisponible     503  le garde-fou de budget ne peut pas se prononcer
 */

import { NextRequest, NextResponse, after } from "next/server";
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
import { lignesContexteUtilisateur } from "@/lib/profil-prompt";
import { appellerComprehension } from "@/lib/astrologue-comprehension";
import {
  resoudreConversation,
  type BirthDataPayload,
  type JobPret,
} from "@/lib/astrologue-routeur";
import {
  construirePromptRedaction,
  validerSortieRedaction,
} from "@/lib/astrologue-prompt-redaction";
import {
  creerSession,
  chargerSession,
  chargerMessages,
  ajouterMessage,
  incrementerTour,
  chargerConnexions,
  chargerJobsPrets,
  consommerJob,
  planifierJob,
  hashParams,
  marquerJob,
  birthHash,
} from "@/lib/astrologue-session";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";
const OPENAI_MODEL = "gpt-4o-mini";

function echec(raison: string, status: number, guard?: AiGuardResult, extra?: Record<string, unknown>) {
  return applyGuardCookie(guard, NextResponse.json({ ok: false, raison, ...extra }, { status }));
}

async function handlePost(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return echec("configuration", 500);

  let guard: AiGuardResult | undefined;

  try {
    const body = await request.json();
    const {
      sessionId: sessionIdEntrant,
      deviceId,
      birthData,
      userProfile,
      locale,
      message,
    } = body as {
      sessionId?: string;
      deviceId?: string;
      birthData?: BirthDataPayload;
      userProfile?: Record<string, unknown> | null;
      locale?: string;
      message?: string;
    };

    if (!deviceId) return echec("sujet_manquant", 400);
    if (!birthData?.birthDate || !birthData?.birthTime) return echec("birthdata_manquant", 400);
    if (!birthData.timezone) return echec("fuseau_manquant", 400);
    if (!message || typeof message !== "string" || !message.trim()) {
      return echec("reponse_invalide", 400);
    }

    // ── BUDGET GATE ──
    // Un seul appel a enforceAiBudget par tour, meme si le tour finit par
    // faire deux appels modele (Appel A puis Appel B) : l appeler deux fois
    // minterait deux cookies de session differents sur la MEME requete
    // entrante (le second appel ne peut pas voir le Set-Cookie que le premier
    // vient de produire), ce qui casserait l identite anonyme d un tour a
    // l autre. Bucket dedie "astrologue", separe de "openai", pour regler le
    // budget de cette fonction independamment des autres routes.
    try {
      guard = await enforceAiBudget(request, "astrologue");
    } catch (err) {
      if (err instanceof AiBudgetError) {
        return NextResponse.json({ ok: false, raison: "budget_depasse", ...err.toJSON() }, {
          status: err.status,
          headers: budgetErrorHeaders(err),
        });
      }
      if (err instanceof AiGuardUnavailableError) {
        console.error("[astrologue/message] guard unavailable:", err.reason);
        return NextResponse.json({ ok: false, raison: "garde_indisponible", ...err.toJSON() }, { status: err.status });
      }
      throw err;
    }

    // ── Session ──
    let session = sessionIdEntrant ? await chargerSession(sessionIdEntrant) : null;
    if (session && session.birth_hash !== birthHash(birthData)) {
      return echec("theme_perime", 409, guard);
    }
    if (!session) {
      session = await creerSession({ deviceId, birthData, locale, subjectKind: "self" });
    }
    if (session.status === "archived") {
      return echec("session_introuvable", 404, guard);
    }

    // Capture dans une constante non-nullable : `session` est un `let`
    // reassigne plus haut, et TypeScript ne conserve pas son retrecissement de
    // type a l interieur de la fermeture passee a `after()` plus bas.
    const sessionId = session.id;

    const tour = session.turn_count + 1;
    const historiqueBrut = await chargerMessages(sessionId, 16);
    const historique = historiqueBrut
      .filter((m) => m.turn < tour)
      .map((m) => ({ role: m.role, content: m.content }));

    // ── Appel A ──
    const resultatA = await appellerComprehension({
      apiKey,
      model: OPENAI_MODEL,
      historique,
      message,
      contexteUtilisateur: lignesContexteUtilisateur(userProfile),
    });

    if (!resultatA.ok) {
      return echec(resultatA.raison, 502, guard);
    }
    const comprehension = resultatA.comprehension;

    // Un seul message utilisateur par tour, la sortie structuree de l Appel A
    // rangee dessus — jamais montree, elle sert au tour suivant et au debug.
    await ajouterMessage({
      sessionId, turn: tour, role: "user",
      content: message, structured: comprehension,
    });

    // Une question hors perimetre (numerologie, Human Design...) ou
    // electionnelle ("quand devrais-je...") n a pas de question manquante a
    // poser : elle doit traverser jusqu a l Agent 3, qui la court-circuite
    // vers le verdict correspondant, et l Appel B, qui decline dans le meme
    // ton que le reste des reponses.
    if (!comprehension.pretPourMoteur && !comprehension.horsPerimetre.horsPerimetre && !comprehension.demandeElection) {
      const question = comprehension.questionDeRelance ?? "Peux-tu préciser ce que tu veux dire ?";
      await ajouterMessage({ sessionId, turn: tour, role: "assistant", content: question });
      await incrementerTour(sessionId, tour);
      return applyGuardCookie(
        guard,
        NextResponse.json({
          ok: true,
          sessionId,
          turn: tour,
          message: { role: "assistant", content: question },
          needsClarification: true,
        }),
      );
    }

    // ── Agent 3 (deterministe) ──
    const connexions = comprehension.sujet === "autre" ? await chargerConnexions(deviceId) : [];
    const jobsBrut = await chargerJobsPrets(sessionId);
    const jobsPrets: JobPret[] = jobsBrut.map((j) => ({
      id: j.id, endpoint: j.endpoint, status: j.status === "ready" ? "ready" : "failed",
      params: j.params, result: j.result,
    }));

    const routage = await resoudreConversation(comprehension, birthData, connexions, jobsPrets);

    if (routage.jobConsommeId) await consommerJob(routage.jobConsommeId);

    // ── Appel B ──
    const { systemPrompt, userMessage } = construirePromptRedaction(routage.verdict, {
      locale,
      // La redaction ne voyait pas la question. Elle repondait donc sur le
      // domaine du signal le plus fort, meme quand ce n etait pas celui qu on
      // lui demandait — et sans le dire. Voir la REGLE DE PERTINENCE du prompt.
      questionPosee: message,
    });
    /**
     * DEUX TENTATIVES, PAS UNE.
     *
     * Le garde-fou (lib/garde-jargon.ts) refuse un texte qui laisse passer un
     * nom de technique ou qui depasse la longueur. Il a raison de refuser.
     * Mais jusqu au 16/09/2026 un refus rendait un 502, et l ecran affichait
     * « Je n ai pas pu repondre cette fois » — mesure du jour : question sur le
     * travail, reponse correcte redigee par le modele, rejetee pour jargon,
     * et la personne se retrouvait devant rien. Le garde-fou transformait une
     * faute de style en panne complete, de facon repetable.
     *
     * On redemande donc UNE fois, en nommant precisement ce qui a fait echouer
     * la premiere. Un modele a qui l on dit « tu as ecrit une conjonction, ne
     * nomme aucune technique » corrige presque toujours. Une seule reprise :
     * au-dela, on paierait une boucle pour un texte qui ne veut pas sortir, et
     * l echec honnete redevient la bonne reponse.
     */
    async function redigerUneFois(correction: string | null) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [
            { role: "system", content: systemPrompt + instructionLangue(locale) },
            { role: "user", content: correction ? `${userMessage}\n\n${correction}` : userMessage },
          ],
          response_format: { type: "json_object" },
          // On resserre a la reprise : la premiere version etait juste sur le
          // fond, c est la forme qu il faut corriger, pas reinventer le texte.
          temperature: correction ? 0.3 : 0.6,
          max_tokens: 400,
        }),
      });
      if (!res.ok) {
        console.error("[astrologue/message] OpenAI error (redaction):", res.status);
        return { panne: "modele_indisponible" as const };
      }
      const data = await res.json();
      const contenu = data.choices?.[0]?.message?.content;
      if (!contenu) return { panne: "modele_indisponible" as const };
      let sortie: unknown;
      try {
        sortie = JSON.parse(contenu);
      } catch {
        return { panne: "reponse_illisible" as const };
      }
      const v = validerSortieRedaction(routage.verdict, sortie);
      return v.valide
        ? { sortie }
        : { rejet: { raison: v.raison, detail: v.detail } };
    }

    let essai = await redigerUneFois(null);
    if ("rejet" in essai && essai.rejet) {
      const { raison, detail } = essai.rejet;
      console.warn(`[astrologue/message] reprise apres ${raison}: ${detail}`);
      const consigne =
        raison === "reponse_trop_longue"
          ? `Ta reponse precedente etait trop longue (${detail}). Recris-la, meme contenu, nettement plus court.`
          : `Ta reponse precedente a ete refusee : ${detail}. Recris-la sans aucun nom de technique, d aspect, de maison numerotee ni d astre repete. Meme contenu, meme structure, dit en francais courant.`;
      essai = await redigerUneFois(consigne);
    }

    if ("panne" in essai && essai.panne) {
      return echec(essai.panne, essai.panne === "modele_indisponible" ? 502 : 502, guard);
    }
    if ("rejet" in essai && essai.rejet) {
      console.error(`[astrologue/message] rejet ${essai.rejet.raison}: ${essai.rejet.detail}`);
      return echec(essai.rejet.raison, 502, guard);
    }

    const sortieB = (essai as { sortie: unknown }).sortie;
    const o = sortieB as Record<string, string>;
    // Structure Vela (messages/vela-astrologue.html, ecran 4) : "parle" porte
    // une 4e partie "prochaine date" ; "signal-direct" s'arrete a trois
    // parties, sans date a annoncer honnetement (voir garde-jargon.champsAValider).
    const texteAffiche =
      routage.verdict.type === "parle"
        ? [o.cePasse, o.dOuCaVient, o.ceQuiChange, o.prochaineDate].join(" ")
        : routage.verdict.type === "signal-direct"
          ? [o.cePasse, o.dOuCaVient, o.ceQuiChange].join(" ")
          : o.reponse;

    await ajouterMessage({
      sessionId, turn: tour, role: "assistant",
      content: texteAffiche, structured: { verdict: routage.verdict },
    });
    await incrementerTour(sessionId, tour);

    // ── Handoff en arriere-plan (jamais attendu dans cette reponse) ──
    if (routage.arrierePlan) {
      const { endpoint, params } = routage.arrierePlan;
      const paramsHash = hashParams(params);
      const nouveauJob = await planifierJob({ sessionId, turn: tour, endpoint, params });
      // Un job deja planifie a un tour precedent (encore "pending") ne doit
      // pas relancer un second appel de 50-67s vers le moteur.
      if (nouveauJob) after(() => executerJobArrierePlan(sessionId, endpoint, paramsHash, params));
    }

    return applyGuardCookie(
      guard,
      NextResponse.json({
        ok: true,
        sessionId,
        turn: tour,
        message: { role: "assistant", content: texteAffiche },
        // Les memes mots, decoupes. `content` reste la source unique — c est
        // lui qu on stocke et qu on relit —, mais l ecran 4 de Vela montre
        // quatre temps titres, pas un bloc. Les rendre separement evite a
        // l interface de recouper le texte a coups d expressions
        // regulieres, ce qui reviendrait a reecrire par-dessus la redaction.
        // Absent quand le verdict n a pas cette forme (silence, question).
        parties:
          routage.verdict.type === "parle"
            ? {
                cePasse: o.cePasse,
                dOuCaVient: o.dOuCaVient,
                ceQuiChange: o.ceQuiChange,
                prochaineDate: o.prochaineDate,
              }
            : routage.verdict.type === "signal-direct"
              ? { cePasse: o.cePasse, dOuCaVient: o.dOuCaVient, ceQuiChange: o.ceQuiChange }
              : undefined,
        /**
         * De quoi dessiner, et rien de plus.
         *
         * Christophe, le 16/09 : « une fois la problematique saisie et les
         * donnees recuperees, je veux un rapport de qualite, graphique ». Ce
         * champ porte les SEULES valeurs mesurees que le routeur a en main —
         * le domaine touche, le nombre de techniques qui concordent, et la
         * fenetre de dates. Pas un chiffre de plus.
         *
         * Ce qu on n envoie volontairement pas : un pourcentage. `force` est
         * un NOMBRE DE TECHNIQUES qui se rejoignent (lib/silence.ts :
         * `force: participants.length`), pas un score sur cent. Le rendre en
         * pourcentage fabriquerait une precision qui n existe pas — c est
         * exactement le reproche fait aux rapports generes du marche.
         *
         * `approximee` dit que la fenetre est approchee. Il remonte jusqu a
         * l ecran : une date approchee s affiche comme approchee.
         *
         * Additif : une interface qui l ignore continue de marcher.
         */
        visuel:
          routage.verdict.type === "parle"
            ? {
                forme: "fenetre" as const,
                maison: routage.verdict.fenetre.maisonNum,
                force: routage.verdict.fenetre.force,
                debut: routage.verdict.fenetre.declencheur.debut,
                fin: routage.verdict.fenetre.declencheur.fin,
                approximee: routage.verdict.fenetre.approximee,
              }
            // Une question au present n a pas de fenetre a montrer : le moteur
            // rend une hierarchie de signaux actifs, pas une periode. On dessine
            // donc ce qu il y a — combien de choses sont actives, et comment
            // elles se classent — au lieu de forcer une frise sur des donnees
            // qui n en ont pas.
            : routage.verdict.type === "signal-direct" && routage.verdict.signaux.length > 0
              ? {
                  forme: "signaux" as const,
                  priorites: routage.verdict.signaux.map((s) => s.priorite),
                }
              : undefined,
        needsClarification: false,
        awaitingDetail: !!routage.arrierePlan,
      }),
    );
  } catch (error) {
    console.error("[astrologue/message] Error:", error);
    return echec("erreur_interne", 500, guard);
  }
}

/**
 * Lance apres l envoi de la reponse (Next 16 `after()`) : jamais dans le
 * cycle requete/reponse d une conversation, exactement comme le brief
 * l exige pour toctoc-boudin-detail (50-57s) et toctoc-app-short (~67s).
 * Le resultat est lu au tour suivant via lib/astrologue-session.ts:chargerJobsPrets.
 */
async function executerJobArrierePlan(
  sessionId: string,
  endpoint: "toctoc-boudin-detail" | "toctoc-app-short",
  paramsHash: string,
  params: Record<string, unknown>,
): Promise<void> {
  try {
    const res = await fetch(`${TOCTOC_BASE}/${endpoint}.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const json = await res.json().catch(() => null);
    // boudinId instable d un point d entree a l autre (POUR-MARIE-ANGE-QUESTIONS.md
    // Q8) : un {"error":"Boudin not found"} est un echec DEFINITIF pour cet id,
    // jamais retente.
    if (!res.ok || !json || json.error) {
      await marquerJob(sessionId, endpoint, paramsHash, {
        status: "failed",
        error: typeof json?.error === "string" ? json.error : `HTTP ${res.status}`,
      });
      return;
    }
    const result = json?.data ?? json;
    await marquerJob(sessionId, endpoint, paramsHash, { status: "ready", result });
  } catch (err) {
    await marquerJob(sessionId, endpoint, paramsHash, {
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export function OPTIONS(req: NextRequest) {
  return corsPreflightResponse(req);
}

export const POST = corsHandler(handlePost);
