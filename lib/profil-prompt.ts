/**
 * Le contexte utilisateur injecte dans un prompt — priorites, phase de vie,
 * ton, stress, objectif, situations. UNE source, trois consommateurs
 * (personalize, daily-brief, daily-briefing).
 *
 * Ce module ne contient que le CONTEXTE, pas les regles de voix : personalize
 * exige de nommer la planete, le briefing interdit tout jargon. Les regles
 * restent dans chaque route ; ce qui est commun, c est qui est la personne.
 *
 * Tout ce qui est ecrit ici a ete DECLARE ou OBSERVE — jamais calcule par le
 * modele. Il reformule, il n invente pas (REPORTING-REGLES.md).
 */
export function lignesContexteUtilisateur(
  userProfile: Record<string, unknown> | null | undefined,
): string {
  if (!userProfile) return "";
  const lines: string[] = ["--- CONTEXTE UTILISATEUR ---"];

  if (userProfile.lifePhase) {
    const phases: Record<string, string> = {
      stable: "Phase de consolidation — angle : ajustement, continuité",
      transition: "Phase de transition — angle : pivot, réorientation, clarification",
      crisis: "Phase de crise — angle : protection, recentrage, simplification. Ton contenant, pas alarmiste.",
      reconstruction: "Phase de reconstruction — angle : reprise, redéfinition",
      expansion: "Phase d'expansion — angle : croissance, opportunité, déploiement",
    };
    lines.push(`Phase de vie : ${phases[userProfile.lifePhase as string] ?? userProfile.lifePhase}`);
  }

  if (Array.isArray(userProfile.effectivePriorities) && userProfile.effectivePriorities.length > 0) {
    // `?? "declared"` faisait passer pour DECLAREES des priorites dont on
    // ignorait l origine — et sautait du meme coup l avertissement de prudence.
    // Le modele affirmait alors « tu as dit que… » sur une deduction. Origine
    // inconnue = meme prudence qu une observation.
    const source = typeof userProfile.prioritySource === "string" ? userProfile.prioritySource : "inconnue";
    lines.push(`Priorités (${source}) : ${(userProfile.effectivePriorities as string[]).join(", ")}`);
    if (source !== "declared") {
      lines.push("⚠ Priorités non déclarées par la personne — personnaliser avec prudence, ne pas sur-affirmer.");
    }
  }

  if (userProfile.effectiveStyle) {
    const styles: Record<string, string> = {
      direct: "Style direct — net, court, sans détour",
      reassuring: "Style rassurant — doux, contenant, pas alarmiste",
      inspiring: "Style inspirant — mobilisateur, visionnaire",
      pragmatic: "Style pragmatique — concret, actionnable, utilitaire",
    };
    lines.push(`Ton : ${styles[userProfile.effectiveStyle as string] ?? userProfile.effectiveStyle}`);
  }
  if (userProfile.effectiveStress === "high") {
    lines.push("⚠ Stress élevé — éviter formulations alarmistes, rester concret et contenant.");
  }
  if (userProfile.currentGoal) lines.push(`Objectif actuel : ${userProfile.currentGoal}`);
  if (userProfile.workStatus) lines.push(`Situation pro : ${userProfile.workStatus}`);
  if (userProfile.relationshipStatus) lines.push(`Situation relationnelle : ${userProfile.relationshipStatus}`);

  lines.push("--- FIN CONTEXTE UTILISATEUR ---");
  return lines.join("\n");
}
