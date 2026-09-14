/**
 * CARNET DE LECTURE — jamais montre a la personne, jamais interpole avec ses
 * donnees. Un texte fixe, ecrit une fois hors-ligne, qui aide l Appel B a
 * calibrer sa GRAVITE et sa NETTETE de ton selon la force et la duree d une
 * fenetre — jamais son contenu, qui vient exclusivement de lib/silence.ts.
 *
 * Distille a la main a partir de 2-3 transcripts du corpus RAG hors-ligne
 * (C:\Users\marie\Documents\dev2\data\rag-astroknowledge\transcripts),
 * notamment le motif observe dans demetra/circumamb-crisis-periods.md : la
 * gravite d une periode tient a la CONDITION des points impliques autant qu a
 * leur CONVERGENCE — deux techniques qui s accordent sur une fenetre courte et
 * nette pesent plus qu un accord large et diffus, meme a Force egale.
 *
 * Ce module n est PAS un appel reseau, PAS une requete au corpus RAG : voir
 * scripts/etalonner-agent-ecriture.mjs pour la verification hors-ligne contre
 * les cas reels. Le corpus n est jamais interroge en direct pendant une
 * conversation (decision produit, voir le brief et le plan d implementation).
 */
export const CARNET_DE_LECTURE = `Une fenêtre courte et nette (quelques semaines) se décrit avec plus d'affirmation qu'une fenêtre longue et diffuse (plusieurs mois à années) : la première mérite une formulation précise, la seconde une formulation posée, presque en toile de fond.
Une Force élevée (plusieurs techniques indépendantes d'accord) autorise à nommer le sujet plus directement, mais jamais à en dramatiser l'issue : la Force dit qu'il se passe quelque chose de réel, jamais quoi qu'il va en résulter.
Ne jamais confondre "cette période est dense" avec "cette période sera difficile" : la densité est un fait du calcul, la tonalité (difficile, porteuse, neutre) ne l'est pas — le moteur ne la fournit pas, donc on ne l'invente pas.
Un chapitre de fond sans déclencheur immédiat se raconte comme un décor stable, jamais comme une urgence : c'est le déclencheur, quand il existe, qui justifie de parler maintenant plutôt que d'attendre.`;
