# Deux features, une app — plan d implementation (02/09/2026)

Validation de Christophe sur le brouillon 2 : deux features.
1. **Aujourd hui** — ce qu il est important de savoir maintenant.
2. **La carte de ma vie** — mon identite dans les etoiles, l essentiel en un ecran.

Elles se partagent le « one shot » : la carte se calcule une fois (l objet
qu on achete), aujourd hui est la raison de revenir (ce qui justifie
l abonnement). La frise existante reste la vue d exploration, avant / arriere.

## Ce qui existe deja (branche depuis le 02/09)

| Besoin de l ecran | Source dans l app | Etat |
|---|---|---|
| Aujourd hui : parle / se tait / prochaine fenetre | `silence` dans le contexte momentum (lib/silence.ts) | branche |
| Prochain changement de chapitre, sa qualite, son domaine | phases ZR du paquet annuel : startDate, endDate, periodQuality, house, houseTopic | branche |
| Ta plus grande annee, annees fortes, annees dures | `saillants` dans le contexte (toctoc-highlights) | branche |
| Chapitres de toute la vie avec leur maison | phases ZR du paquet viager : house, dates (pas la qualite : le paquet court ne l envoie pas) | branche |
| Le briefing du jour, oriente par les priorites | daily-brief / daily-briefing | branche |
| Ages-cles, annees pivots, trois parties de vie, numerologie | six routes AstroLearn par personId — porte naissance demandee | lib/astrolearn-public.ts pret, porte fermee |

## Les briques a construire, dans l ordre

1. **`lib/rapport.ts`** — assemble un objet `Rapport` a partir du contexte :
   aujourd hui (silence + periode courante), les 90 jours (phases ZR a venir),
   la carte (saillants + fenetres d accord + chapitres viagers). Pur, teste
   sur les paquets captures.
2. **Ecran « Aujourd hui »** — app/app/aujourd-hui : le bandeau du brouillon 2
   + les 90 jours. Dessin de Christophe sur la base du brouillon.
3. **Ecran « Ma ligne de vie »** — app/app/ligne-de-vie : la carte, version 1
   avec ce qui est branche ; version 2 quand la porte s ouvre.
4. **Route de traduction** — app/api/openai/traduire : recoit UNIQUEMENT des
   structures calculees (dates, maisons, qualites), rend une phrase par carte,
   et un controle de sortie refuse toute date, tout chiffre, tout nom de
   technique absent de l entree (a extraire de validerBrief / detecterJargon).
   Cache par (empreinte de naissance, identifiant de periode).
5. **« Tu te reconnais ? »** — stockage local des reponses ; envoi optionnel
   et anonyme pour la mesure du faux positif sur de vraies personnes.
6. **Porte naissance ouverte** — brancher archetypes, pivots, parties de vie,
   numerologie via lib/astrolearn-public.ts ; la carte passe en version 2.

Regles qui ne bougent pas : descriptif, jamais predictif ; le modele traduit,
il n ajoute rien ; chaque phrase traduite est marquee (AI Act art. 50) ; les
dates viennent du moteur.
