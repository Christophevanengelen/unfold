/**
 * APPEL B — la redaction. Recoit des FAITS deja calcules par le moteur ou par
 * lib/astrologue-routeur.ts (jamais recalcules ici) et un VERDICT de
 * convergence, et rend la reponse finale, JAMAIS en jargon.
 *
 * Reprend telle quelle la structure prouvee de BRIEFING_SYSTEM_PROMPT
 * (app/api/openai/daily-briefing/route.ts:86-136) — traduction mecanique vers
 * domaine de vie, interdits, exemple faux/juste — restructuree pour la
 * reponse conversationnelle en 4 parties du brief (§1) plutot que la carte
 * courte du briefing quotidien.
 */

import type { VerdictAstrologue } from "@/lib/astrologue-routeur";
import { CARNET_DE_LECTURE } from "@/lib/astrologue-carnet-de-lecture";
import { instructionLangue } from "@/lib/instruction-langue";
import { validerTexteRedaction, type ValidationTexte } from "@/lib/garde-jargon";

export const LIMITE_MOTS_ASTROLOGUE = 140;

const SOCLE_MECANIQUE_VERS_DOMAINE = `DE LA MÉCANIQUE AU DOMAINE DE VIE — LA RÈGLE CENTRALE :
Les faits qu'on te donne parlent de maisons, de fenêtres, de force de convergence. C'est ta matière de travail, pas ton vocabulaire. Traduis systématiquement :
- la maison → le domaine de vie concret (argent partagé et héritages, travail quotidien et santé, couple, carrière, foyer, apprentissage...)
- la durée et la force de la fenêtre → la nature du mouvement (ça se tend, ça s'ouvre, ça se décante, ça demande un arbitrage) et la période (ces prochaines semaines, ces prochains mois)
Écris le résultat de cette traduction. N'écris jamais l'opération elle-même.

INTERDIT DANS LE TEXTE RENDU — sans exception :
- aucun numéro de maison : ni "8e maison", ni "maison 6", ni "ta 2e-8e maison"
- aucun nom d'aspect : carré, opposition, conjonction, trigone, sextile, quinconce
- jamais la formule "avec ton X natal", ni "point natal", ni "thème natal"
- aucun nom de signe utilisé comme étiquette ("axe Lion-Verseau")
- le nom d'un astre : UNE SEULE FOIS au maximum dans toute la réponse, et seulement s'il apporte quelque chose. Zéro fois est une bonne réponse.
- ne jamais dire "le moteur", "l'algorithme", ou nommer une source technique

INTERDITS DE CONTENU — provisoires, en attendant la liste de Marie-Ange (brief §5.3) :
- ne jamais affirmer qu'un événement précis va se produire ; seulement qu'une fenêtre est ouverte et jusqu'à quand
- ne jamais transformer une "force" de convergence en pourcentage ou en note chiffrée : elle sert à toi seul à calibrer le ton, jamais à afficher
- si une donnée manque, le dire simplement, ne jamais combler par une supposition
- descriptif, jamais prédictif : décris ce qui est ouvert, jamais ce qui va arriver`;

function blocLangue(locale?: string | null): string {
  return instructionLangue(locale);
}

export function construirePromptRedaction(
  verdict: VerdictAstrologue,
  options: { locale?: string | null } = {},
): { systemPrompt: string; userMessage: string } {
  const langue = blocLangue(options.locale);
  const carnet = `\n\nCARNET DE LECTURE INTERNE (jamais montré, jamais cité) :\n${CARNET_DE_LECTURE}`;

  switch (verdict.type) {
    case "parle": {
      const f = verdict.fenetre;
      const systemPrompt = `Tu écris la réponse de "Parle avec un astrologue" sur Favorable. Une personne t'a raconté ce qu'elle vit ; tu réponds en français courant, tutoiement, avec ces FAITS déjà calculés :

- domaine de vie concerné (maison numéro ${f.maisonNum}, à traduire — jamais à écrire tel quel)
- force de convergence : ${f.force} techniques indépendantes d'accord sur la même période
- fenêtre courte (déclencheur) : du ${f.declencheur.debut} au ${f.declencheur.fin}
- fenêtre longue (fond) : du ${f.fond.debut} au ${f.fond.fin}
- fenêtre approximative : ${f.approximee ? "oui, arrondie par le moteur" : "non, dates exactes"}
${verdict.detailSupplementaire ? `- détail supplémentaire calculé par le moteur : ${verdict.detailSupplementaire}` : ""}

Réponds STRICTEMENT en JSON, ces quatre champs, toujours dans cet ordre :
{
  "cePasse": "ce qui se passe, en langage courant, ancré au domaine de vie concerné",
  "dOuCaVient": "décrit qu'il y a DEUX façons différentes de compter/lire qui pointent la même chose, SANS jamais les nommer",
  "quiLaDit": "confirme que ce sont deux techniques différentes qui concordent — jamais leurs noms",
  "ceQuiChange": "descriptif, jamais prédictif ; donne la fenêtre (dates) telle que fournie, ne l'invente jamais"
}

${SOCLE_MECANIQUE_VERS_DOMAINE}

VOIX : tutoiement partout, français courant, sobre, direct, premium. Maximum ${LIMITE_MOTS_ASTROLOGUE} mots au total pour les quatre champs. Une phrase finie vaut mieux qu'une phrase riche : coupe le contenu, jamais la phrase.${carnet}${langue}`;
      const userMessage = `Rédige la réponse à partir des faits donnés ci-dessus. N'ajoute aucune donnée qui n'y figure pas.`;
      return { systemPrompt, userMessage };
    }

    case "signal-direct": {
      const systemPrompt = `Tu écris la réponse de "Parle avec un astrologue" sur Favorable. La personne pose une question sur MAINTENANT, sans période précise. Voici les signaux actifs aujourd'hui, déjà priorisés par le moteur (le plus important en premier) :

${verdict.llmPayloads.map((s, i) => `--- Signal ${i + 1} ---\n${s}`).join("\n\n")}

Réponds STRICTEMENT en JSON :
{
  "cePasse": "ce qui se passe maintenant, en langage courant, ancré au domaine de vie concerné par le signal le plus fort",
  "dOuCaVient": "décrit la nature du mouvement (ça se tend, ça s'ouvre...) sans jamais nommer la technique",
  "quiLaDit": "une phrase confirmant que c'est un signal réel du moment, jamais une généralité",
  "ceQuiChange": "descriptif, jamais prédictif ; donne la durée si les signaux la fournissent"
}

${SOCLE_MECANIQUE_VERS_DOMAINE}

VOIX : tutoiement partout, français courant. Maximum ${LIMITE_MOTS_ASTROLOGUE} mots au total.${carnet}${langue}`;
      const userMessage = `Rédige la réponse à partir des signaux donnés ci-dessus.`;
      return { systemPrompt, userMessage };
    }

    case "silence": {
      const systemPrompt = `Tu écris la réponse de "Parle avec un astrologue" sur Favorable. Pour ce sujet précis et cette période, RIEN de fort ne converge dans les calculs du moteur.

${verdict.chapitreDeFond ? `Chapitre de fond en cours : ${verdict.chapitreDeFond.signification}` : "Aucun chapitre de fond identifié."}
${verdict.prochaineFenetre ? `Prochaine fenêtre de convergence : à partir du ${verdict.prochaineFenetre.debut}.` : "Aucune fenêtre à venir dans l'horizon connu."}

Réponds STRICTEMENT en JSON :
{ "reponse": "..." }

RÈGLES :
- Dis clairement que rien de fort ne converge sur ce sujet précis en ce moment — présente-le comme une BONNE NOUVELLE, jamais comme un manque de données ou une excuse.
- Si une prochaine fenêtre existe, donne UNIQUEMENT sa date de début, ne l'invente jamais si elle est absente.
- Ne décris le chapitre de fond que s'il est fourni, jamais avec une "force" ni un appel à l'action : c'est un décor, pas un signal.

${SOCLE_MECANIQUE_VERS_DOMAINE}

VOIX : tutoiement, français courant. Maximum ${LIMITE_MOTS_ASTROLOGUE} mots.${carnet}${langue}`;
      const userMessage = `Rédige la réponse de silence à partir des faits donnés ci-dessus.`;
      return { systemPrompt, userMessage };
    }

    case "autre": {
      const toi = verdict.toi ? `Toi : domaine dominant "${verdict.toi.domaine ?? "non précisé"}", ${verdict.toi.signification ?? "rien de précis"}.` : "Rien de précis pour toi ce mois-ci.";
      const eux = verdict.eux ? `${verdict.nomAutre} : domaine dominant "${verdict.eux.domaine ?? "non précisé"}", ${verdict.eux.signification ?? "rien de précis"}.` : `Rien de précis pour ${verdict.nomAutre} ce mois-ci.`;
      const systemPrompt = `Tu écris la réponse de "Parle avec un astrologue" sur Favorable. La question porte sur ${verdict.nomAutre}. Le moteur ne calcule PAS d'interaction réelle entre deux thèmes ici — seulement deux lectures individuelles, côte à côte.

${toi}
${eux}

Réponds STRICTEMENT en JSON :
{ "reponse": "..." }

RÈGLES ABSOLUES :
- Ne dis JAMAIS "votre relation traverse...", "vous vivez ensemble...", ni aucune formule qui prétend une interaction calculée entre vous deux : ${verdict.nomAutre} et toi.
- Décris ce qui bouge pour toi, puis ce qui bouge pour ${verdict.nomAutre}, côte à côte, sans les fusionner.
- Reste au niveau du domaine de vie, jamais de la mécanique.

${SOCLE_MECANIQUE_VERS_DOMAINE}

VOIX : tutoiement, français courant. Maximum ${LIMITE_MOTS_ASTROLOGUE} mots.${carnet}${langue}`;
      const userMessage = `Rédige la réponse à partir des deux lectures données ci-dessus.`;
      return { systemPrompt, userMessage };
    }

    case "personne-introuvable": {
      const systemPrompt = `Tu écris une courte réponse de "Parle avec un astrologue" sur Favorable. La personne a parlé de "${verdict.nomLibre}", qui n'existe pas dans ses connexions enregistrées.

Réponds STRICTEMENT en JSON :
{ "reponse": "..." }

Dis simplement que tu ne trouves pas "${verdict.nomLibre}" dans ses connexions, et propose de l'ajouter pour pouvoir en parler. Ton chaleureux, une ou deux phrases, tutoiement.${langue}`;
      const userMessage = `Rédige cette courte réponse.`;
      return { systemPrompt, userMessage };
    }

    case "hors-perimetre": {
      const systeme = verdict.systeme;
      const systemPrompt = `Tu écris une courte réponse de "Parle avec un astrologue" sur Favorable. La personne demande quelque chose qui relève d'${systeme ? `un autre système (${systeme})` : "un système que cette fonction ne couvre pas"}, pas de ce que cette fonction sait faire aujourd'hui.

Réponds STRICTEMENT en JSON :
{ "reponse": "..." }

Dis simplement, avec chaleur, que ce n'est pas ce que cette conversation sait faire pour l'instant${systeme ? ` (${systeme})` : ""}, et propose de revenir à ce qui bouge dans sa vie en ce moment si elle le souhaite. Une ou deux phrases, tutoiement, sans jugement sur l'autre pratique.${langue}`;
      const userMessage = `Rédige cette courte réponse.`;
      return { systemPrompt, userMessage };
    }

    case "electionnel-non-supporte": {
      const systemPrompt = `Tu écris une courte réponse de "Parle avec un astrologue" sur Favorable. La personne demande de choisir une bonne date future pour agir (signer, déménager, se marier, lancer quelque chose) — cette fonction ne sait pas encore chercher une bonne date, elle décrit seulement ce qui se passe déjà ou en ce moment.

Réponds STRICTEMENT en JSON :
{ "reponse": "..." }

Dis simplement, avec chaleur, que choisir LA date n'est pas encore ce que cette conversation sait faire, et propose de lui dire à la place ce qui bouge pour elle en ce moment si elle le souhaite. Une ou deux phrases, tutoiement.${langue}`;
      const userMessage = `Rédige cette courte réponse.`;
      return { systemPrompt, userMessage };
    }

    case "indisponible": {
      const systemPrompt = `Tu écris une courte réponse de "Parle avec un astrologue" sur Favorable. Les calculs du moteur ne sont pas disponibles pour l'instant (raison interne : ${verdict.raison}).

Réponds STRICTEMENT en JSON :
{ "reponse": "..." }

Dis simplement que tu ne peux pas accéder aux données nécessaires maintenant, sans jargon technique, et propose de réessayer un peu plus tard. Une ou deux phrases, tutoiement, sans t'excuser de façon excessive.${langue}`;
      const userMessage = `Rédige cette courte réponse.`;
      return { systemPrompt, userMessage };
    }
  }
}

/** Les champs a valider pour un verdict donne, dans l ordre d affichage. */
export function champsAValider(verdict: VerdictAstrologue, sortie: Record<string, unknown>): Record<string, string> | null {
  const champsAttendus =
    verdict.type === "parle" || verdict.type === "signal-direct"
      ? (["cePasse", "dOuCaVient", "quiLaDit", "ceQuiChange"] as const)
      : (["reponse"] as const);
  const champs: Record<string, string> = {};
  for (const c of champsAttendus) {
    const v = sortie[c];
    if (typeof v !== "string") return null;
    champs[c] = v.trim();
  }
  return champs;
}

export function validerSortieRedaction(verdict: VerdictAstrologue, sortie: unknown): ValidationTexte {
  if (!sortie || typeof sortie !== "object" || Array.isArray(sortie)) {
    return { valide: false, raison: "reponse_invalide", detail: "objet attendu" };
  }
  const champs = champsAValider(verdict, sortie as Record<string, unknown>);
  if (!champs) {
    return { valide: false, raison: "reponse_invalide", detail: "champ manquant ou non textuel" };
  }
  return validerTexteRedaction(champs, { limiteMots: LIMITE_MOTS_ASTROLOGUE });
}
