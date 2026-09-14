# Couverture de "Parle avec un astrologue" contre les 100 questions les plus posées

Confronté le 12/09/2026 : le routeur (`lib/astrologue-routeur.ts`) contre
`C:\Users\marie\Documents\dev\rag-astroknowledge\create-api-md-files\100_MOST_ASKED_QUESTIONS.md`
(banque de 100 questions construite à partir du corpus CB/KS/Demetra/Leisa) et
contre le catalogue complet des ~177 endpoints du moteur
(`lib/astrologue-endpoints-catalogue.json`, extrait le 12/09/2026 de
`API-COMPLETE-DOCUMENTATION.md`).

But : vérifier que toute question plausible reçoit le BON appel moteur, ou —
à défaut — une réponse honnête qui dit ce que la fonction ne sait pas encore
faire, jamais une réponse qui a l'air juste sans l'être.

## Ce qui est couvert, tel quel

| Catégorie (n° questions) | Chemin dans le routeur |
|---|---|
| Eclipses (8) | `toctoc-year` → famille `nodal` (`lib/silence.ts`) + `daily-briefing-context` |
| Big Transits (12) | `toctoc-year` → convergence par maison (`fenetresDeConvergence`) |
| Health & Medical (8) | même chemin générique, maison `health` — pas de diagnostic, seulement la fenêtre |
| Challenges / Difficultés (12) | même chemin générique — **la tonalité (difficile/facile) est volontairement jamais affirmée**, le moteur ne la donne pas (voir `lib/astrologue-carnet-de-lecture.ts`) ; c'est un choix de produit déjà pris, pas un trou |
| Synastry & Compatibility (10) | branche `sujet: "autre"` → `connection-brief` — recadré : c'est une lecture solo à deux, pas un vrai calcul à deux (`synastryReelle: false`, `POUR-MARIE-ANGE-QUESTIONS.md` Q6) |

## Ce qui était un vrai trou, corrigé aujourd'hui

**Great Beginnings & Endings (8) + Electional Astrology (12) = 20/100 questions.**
"Quand devrais-je signer / déménager / me marier / lancer mon projet ?" est une
recherche d'une BONNE date future — une question différente de "qu'est-ce qui
se passe", que le routeur ne distinguait pas avant aujourd'hui. Sans le
distinguo, ces 20 questions tombaient dans le chemin "présent, période non
résolue" et recevaient une réponse sur les signaux d'AUJOURD'HUI — une réponse
qui n'a pas l'air fausse mais qui ne répond pas à la vraie question.

Corrigé : `ComprehensionUtilisateur.demandeElection` (nouveau champ, Appel A)
détecte l'intention, `lib/astrologue-routeur.ts` la court-circuite vers un
verdict `electionnel-non-supporte` avant tout appel moteur, et l'Appel B
décline chaleureusement plutôt que de répondre à côté. Le moteur documente
bien une famille "Electional Astrology" (12 endpoints, `/api/electional/*`),
mais l'activer demande une recherche vers l'avant sur des mois — hors du temps
d'une conversation tel que construit aujourd'hui (voir §5 du plan
d'implémentation). À reprendre avec Marie-Ange si le produit veut vraiment
répondre à ces 20 questions.

## Ce qui reste hors périmètre — par choix de produit, pas par oubli

| Catégorie (n° questions) | Pourquoi ce n'est pas dans cette fonction |
|---|---|
| Personal Traits & Characteristics (10) | Question de trait natal ("suis-je créatif ?"), sans dimension de timing. `CLAUDE.md` définit ce produit comme momentum/timing, explicitement pas un rapport de personnalité (« DON'T: horoscope »). Déjà servi ailleurs (`/api/openai/personalize`, `/api/blueprint`), pas dans cette conversation. |
| Timing Techniques (10) | Question sur le FONCTIONNEMENT d'une technique ("qu'est-ce que le zodiacal releasing ?") — répondre exigerait le jargon que cette fonction s'interdit par principe (`lib/garde-jargon.ts`). Aujourd'hui, l'Appel A la traiterait comme une question personnelle ambiguë et poserait une relance — pas cassé, mais pas taillé pour. |
| Chart Interpretation & Fundamentals (10) | Question natale/méthodologique ("mon heure de naissance est-elle fiable ?", "qu'est-ce que le sect ?") — même famille que Personal Traits, hors du "qu'est-ce qui se passe dans ma vie" que cette fonction couvre. |

## Autres systèmes (déjà géré)

Numérologie, Human Design, BaZi, Feng Shui, Qi Men Dun Jia, Yi Jing,
astrologie tibétaine, Jyotish/védique — 57 des 177 endpoints du moteur, listés
dans `lib/astrologue-endpoints.ts` (`AUTRES_SYSTEMES`). L'Appel A les détecte
(`horsPerimetre`) et décline avec le nom du système, avant tout appel moteur.

## Trouvaille annexe, à vérifier avec Marie-Ange

`API-COMPLETE-DOCUMENTATION.md` marque les `/api/query/*` — documentés comme
"Strategic query endpoints for chatbot use" — **"Not Available on Production —
Not routed in PHP"**. Le routeur ne s'appuyait déjà pas dessus ; bon à savoir
avant que quiconque compte dessus pour une évolution future.
