# Accès infrastructure — le playbook central, à lire avant de bloquer

Écrit le 18/09/2026, après des mois de sessions qui perdaient des heures sur
des « je n'ai pas accès » évitables. Instruction explicite de Christophe ce
jour-là : on est en R&D, avant tout revenu, personne n'a intérêt à nous
attaquer — la priorité est la vitesse, pas la prudence excessive. Ne plus
jamais redemander une connexion pour GitHub, Vercel, Supabase ou Infomaniak.

**La règle avant tout le reste : un outil qui échoue n'est pas la preuve que
l'accès manque.** `list_projects`/`get_project` de Vercel via MCP ont rendu
vide/404 sur le projet `unfold` le 18/09 alors que l'accès existait bel et
bien — `get_git_deployment_context` (MCP) et `vercel whoami` (CLI local)
l'ont confirmé dans la foulée. Avant de conclure a un blocage : essayer le
CLI local, puis un autre outil MCP du meme service, avant de dire qu'il
manque quelque chose.

**Christophe ne connaît jamais un mot de passe.** Ne jamais compter sur une
saisie de sa part. Chercher un CLI, une clé, un token — pas un formulaire de
connexion.

## GitHub — durable, rien à faire

`gh auth status` : connecté (`Christophevanengelen`), token dans le
trousseau macOS, scopes `gist, read:org, repo, workflow`. Utiliser `gh`
directement pour tout : commits, push, PR, Actions, `gh secret list` (les
NOMS des secrets seulement — GitHub ne rend jamais une valeur de secret via
API, à personne, même au propriétaire ; ce n'est pas une prudence à
contourner, c'est une limite de la plateforme).

## Vercel — durable, rien à faire

Le CLI `vercel` est déjà connecté en local sur cette machine
(`~/Library/Application Support/com.vercel.cli/auth.json`, compte
`vanengelenchristophe-6584`). `vercel whoami`, `vercel link`, `vercel env
add/ls/pull` fonctionnent sans navigateur — vérifié le 18/09 en posant
`LIAISON_PASSWORD` en production sans un seul clic Chrome.

Ce fichier d'auth porte un `refreshToken` : le CLI se renouvelle tout seul à
l'usage. Limite testée et confirmée le 18/09 : Vercel refuse qu'un jeton CLI
en crée un autre (`vercel api /v3/user/tokens` → 403 « Cannot create tokens
for this app »). Un jeton personnel sans expiration ne peut donc naître que
depuis vercel.com/account/tokens, à la main — pas un blocage récurrent, un
aller simple si le CLI local venait un jour à vraiment expirer (jamais vu
jusqu'ici).

Le compte : `vanengelenchristophe@gmail.com` (confirmé par un mail « New
sign-in detected » reçu à cette adresse), connexion via « Continue with
Google » — il n'y a pas de mot de passe Vercel séparé à chercher.

L'équipe : `vanengelenchristophe-6584's projects`
(`team_WOr8m0BlfvPCkEDuJrsX8Y9o`).

## Supabase — durable, rien à faire

`SUPABASE_DB_URL` (accès psql direct) et `SUPABASE_SERVICE_ROLE_KEY`
(service-role, n'expire pas) vivent dans `.env.local`. `psql` n'est pas
installé sur cette machine — utiliser le module `pg` en Node à la place
(voir la creation de la table `liaison_marie_ange` le 18/09 pour l'exemple).
Toujours tester une migration sur un PostgreSQL jetable local avant de
l'appliquer en production (`initdb` + `pg_ctl`, `LC_ALL=en_US.UTF-8` sinon le
postmaster refuse de démarrer sur ce Mac).

## Infomaniak — pas encore posé, chemin connu

Sert aujourd'hui au DNS/MX de `hi-def.be` (voir `AVANT-PUBLICATION.md`).
Aucune clé locale ni MCP pour l'instant — jamais eu besoin d'y toucher par
API. Si un jour il faut modifier une zone DNS ou un enregistrement : Infomaniak
propose un jeton d'API généré une fois depuis leur Manager, sans expiration
courte. Un aller simple, comme pour Vercel au tout début — pas un blocage à
répéter. Demander à Christophe de le générer UNE fois, le stocker dans
`.env.local`, ne plus jamais redemander ensuite.

## Apple / App Store Connect — la vraie limite restante

Le seul des cinq qui redemande encore un navigateur aujourd'hui : ajouter un
testeur TestFlight se fait en pilotant Chrome sur App Store Connect avec les
identifiants Apple de Christophe.

Une clé d'API App Store Connect COMPLÈTE existe pourtant déjà en secret
GitHub Actions depuis le 31/08/2026 : `APPLE_API_ISSUER_ID`,
`APPLE_API_KEY_ID`, `APPLE_API_PRIVATE_KEY` — elle sert déjà à l'envoi
automatique des builds vers TestFlight (`.github/workflows/apps.yml`, job
`ios-testflight`). Impossible de relire sa VALEUR depuis `gh secret list`
(limite GitHub, pas une prudence).

**La sortie sans redemander à Christophe** : un workflow GitHub Actions
`workflow_dispatch` supplémentaire (déclenché par `gh workflow run` avec un
email en paramètre) qui appelle l'API App Store Connect (endpoint
bêta-testeurs) avec CES MÊMES secrets déjà posés. Ajouter un testeur devient
une commande `gh`, zéro navigateur, zéro identifiant Apple retapé — même
principe que `vercel env add`. Pas encore construit au 18/09/2026 ; c'est la
prochaine pièce à poser dès qu'une invitation TestFlight est redemandée, sans
repartir de zéro sur l'analyse ci-dessus.
