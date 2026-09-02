# La mesure qui interdit la promesse predictive

Faite le 02/09/2026 sur le corpus public d AstroLearn. Reproductible.

## La question

Si les periodes de pic « marquent » vraiment une vie, la part des evenements
biographiques qui tombe dedans doit DEPASSER la part de la vie qu elles
couvrent. Sinon, trouver un evenement dans un pic ne dit rien : on l aurait
trouve la par hasard.

Deux nombres, pas un :
- **couverture** = fraction des annees de vie situees dans un pic ;
- **touche** = fraction des evenements dates situes dans un pic.

## Le resultat

12 personnes, 33 a 57 evenements dates chacune, technique ZR (lot Spirit),
periodes `isPeakPeriod`.

| Personne | Couverture | Touche | Ecart |
|---|---|---|---|
| Albert Einstein | 29,0 | 26,3 | -2,7 |
| Warren Buffett | 28,6 | 25,7 | -2,9 |
| Donald Trump | 32,5 | 26,3 | -6,2 |
| Brad Pitt | 33,6 | 31,1 | -2,5 |
| Beyonce | 26,7 | 37,5 | +10,8 |
| Taylor Swift | 35,0 | 25,5 | -9,5 |
| Michael Jackson | 28,6 | 26,3 | -2,3 |
| Margaret Thatcher | 31,6 | 58,3 | +26,7 |
| Emmanuel Macron | 27,6 | 13,0 | -14,6 |
| Celine Dion | 26,6 | 25,8 | -0,8 |
| Paris Hilton | 35,9 | 54,2 | +18,3 |
| Jennifer Aniston | 26,1 | 27,6 | +1,5 |

**Ecart moyen : +1,32 point. Positifs : 4 sur 12. Etendue : -14,6 a +26,7.**

Indiscernable de zero a cette taille d echantillon.

## Le chiffre qui tranche

En prenant TOUS les chapitres au lieu des seuls pics :
**couverture 100 %, touche 100 %.**

Un decoupage qui couvre la vie entiere ne peut pas echouer, donc il ne prouve
rien. C est le piege central de ce genre d analyse, et il est ici mesure, pas
suppose.

## Ce que la mesure ne dit PAS

- Elle ne refute pas l astrologie. Elle refute UNE promesse commerciale precise.
- 12 themes, ~35 evenements : c est petit.
- Les dates du corpus sont grossieres — beaucoup d evenements sont poses au
  1er janvier de leur annee.
- La fiabilite de l heure de naissance n est pas connue ici (pas de cote Rodden
  disponible sur cette route). Une heure fausse deplace tout.
- Seuls les pics ZR/Spirit sont testes. Les autres techniques ne le sont pas.
- Biais de celebrite : Wikipedia date les succes mieux que les annees creuses.

## La consequence produit

Le produit ne peut pas etre **predictif** : « tes pics annoncent tes
evenements » n est pas soutenu par les donnees dont nous disposons.

Il doit etre **descriptif** : le moteur traduit une configuration en langage
clair et date, la personne juge elle-meme. C est plus honnete, c est ce qui nous
tient hors de la case « fortune telling » d Apple 4.3(b) (voir CONFORMITE.md),
et ca ne retire rien a la valeur : le metier du middle man n a jamais ete de
predire, il a toujours ete de traduire (voir REPORTING-REGLES.md).

## Pour refaire la mesure

Corpus public, sans authentification, sur app.astrolearn.io :
`/api/astrolearn/public/people?q=<nom>&limit=1` puis `period-quality` et
`events` avec le `personId` obtenu. Comparer `chapters[].isPeakPeriod` aux
`event_date`. Le detail des routes est dans MOTEUR-SURFACE.md.

Prochaine etape si on veut trancher pour de bon : un controle par thème
FAUX — comparer les evenements d une personne aux periodes d une AUTRE. Si
l ecart y est le meme, il n y a rien. C est le protocole de Dean & Kelly (2003).
