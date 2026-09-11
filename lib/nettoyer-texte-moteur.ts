/**
 * Le moteur ne renvoie pas de la prose : il renvoie des gabarits. Quatre
 * d entre eux — `constructiveDirection`, `sharedTheme`, `sharedInsight`,
 * `actionTogether` — s affichent TELS QUELS des que l IA echoue ou que la
 * personne n est pas payante. C est donc ce texte-la que la plupart des gens
 * lisent, pas celui du modele.
 *
 * Et il contient, mot pour mot, les phrases que connection-prompt.md interdit :
 *
 *   « Vous êtes dans une période de transitions majeures du Lot de Fortune
 *     dans votre Zodiaque Déchaîné. »        ← B0bis
 *   « … — une complémentarité à cultiver ensemble ce mois-ci. »
 *   « alignement »
 *
 * Le produit se vend sur le fait de NE PAS dire ces phrases. Elles sont
 * coupees ici, au seul endroit par ou le texte du moteur entre dans l app.
 *
 * Ce qui n est PAS corrige ici : le vouvoiement du moteur, alors que tout le
 * reste de l app tutoie. Une conversion automatique casse une phrase sur trois
 * (« pour vous » → « pour tu »). Ca reste B0bis, cote moteur.
 */
export function nettoyerTexteMoteur(texte: string | undefined | null): string {
  if (!texte) return "";
  let t = texte
    // La phrase d ouverture entiere, pas ses mots un par un : la reecrire
    // morceau par morceau donnait « Vous êtes dans une période de transitions
    // majeures des circonstances. » Ce qui suit — l annee de vie — est vrai et
    // utile, on le garde.
    .replace(
      /^\s*Vous\s+êtes\s+dans\s+une\s+période\s+de\s+transitions[^.]*\.\s*/i,
      "",
    )
    .replace(/\s*—\s*une\s+complémentarité\s+à\s+cultiver[^.]*\.?/gi, ".")
    .replace(/\s*dans votre Zodiaque\s+D[ée]cha[îi]n[ée]\.?/gi, ".")
    // L article part avec le mot qu il accompagne, sinon « la libération
    // zodiacale » devient « la chapitre de vie ». Le remplacement a genre
    // different se fait par groupe, pas mot a mot.
    .replace(/de\s+la\s+lib[ée]ration\s+zodiacale/gi, "du chapitre de vie")
    .replace(/la\s+lib[ée]ration\s+zodiacale/gi, "le chapitre de vie")
    .replace(/lib[ée]ration\s+zodiacale/gi, "chapitre de vie")
    .replace(/Zodiaque\s+D[ée]cha[îi]n[ée]/gi, "chapitre de vie")
    .replace(/du\s+Lot\s+de\s+Fortune/gi, "des circonstances")
    .replace(/du\s+Lot\s+d['’]Esprit/gi, "de la direction prise")
    .replace(/du\s+Lot\s+d['’]?[ÉE]ros/gi, "des liens")
    .replace(/Lot de Fortune/gi, "circonstances")
    .replace(/Lot d['’]Esprit/gi, "direction prise")
    .replace(/Lot d['’]?[ÉE]ros/gi, "liens")
    .replace(/Alignement/g, "Accord")
    .replace(/alignement/g, "accord")
    .replace(/\.\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
  // Couper la premiere phrase laisse parfois une minuscule en tete.
  if (t) t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}
