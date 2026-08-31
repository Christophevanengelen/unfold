---
name: favorable-base
description: "Ecrire et appliquer une migration Supabase sur Favorable, sans jamais faire coller du SQL a Christophe. A utiliser des qu il est question de la base, d une table, d une migration, d une fonction SQL, de RLS, ou d un acces Supabase."
---

# La base de Favorable

## L acces direct existe deja — ne fais coller personne

    cd ~/Documents/unfold && set -a && . ./.env.local && set +a
    /opt/homebrew/opt/postgresql@16/bin/psql "$SUPABASE_DB_URL" -f supabase/0XX.sql

`SUPABASE_DB_URL` est dans `.env.local` et pointe sur la base de production
(projet `jvpdpjqidxtavmaaeudn`).

**Une session entiere a ete passee a faire coller des migrations dans le
tableau de bord avant de s en apercevoir.** Christophe n est pas developpeur et
chaque copier-coller est une interruption doublee d un risque : son gestionnaire
de presse-papier avait un jour recolle trois migrations sans qu il le sache.

Avant de demander un geste manuel, cherche toujours l acces qu on a deja :
`.env.local`, `npx vercel whoami`, les CLI installes, le trousseau.

## Eprouver la migration avant de la lancer

Un PostgreSQL jetable, deux minutes, et on ne decouvre rien en production :

    export LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
    PGBIN=/opt/homebrew/opt/postgresql@16/bin
    rm -rf /tmp/pgs && mkdir -p /tmp/pgs
    $PGBIN/initdb -D /tmp/pgs/d -U postgres --auth=trust -E UTF8 --locale=en_US.UTF-8
    $PGBIN/pg_ctl -D /tmp/pgs/d -o "-p 55432 -k /tmp/pgs -c listen_addresses='' -c lc_messages=C" -l /tmp/pgs/log start
    export PGHOST=/tmp/pgs PGPORT=55432 PGUSER=postgres
    $PGBIN/psql -c "CREATE ROLE service_role NOLOGIN;" postgres

Deux pieges de mise en route sur ce Mac :
- **`LC_ALL` doit etre valide**, sinon « le postmaster est devenu multithreade »
  au demarrage ;
- **le chemin du socket est limite a 103 octets** — le dossier de travail est
  trop long, d ou `/tmp/pgs`.

Puis **passer la migration deux fois de suite** : elle doit etre idempotente.

## Les regles du depot

- `CREATE TABLE IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`,
  `ADD COLUMN IF NOT EXISTS`, contraintes ajoutees dans un `DO $$` garde.
- **RLS activee, aucune politique** : ecriture par le service uniquement, jamais
  lisible depuis un navigateur.
- `REVOKE ALL ... FROM PUBLIC` puis `GRANT EXECUTE ... TO service_role` sur
  chaque fonction.

## `SECURITY DEFINER` : toujours figer le chemin

    $$ LANGUAGE plpgsql SECURITY DEFINER
       SET search_path = public, pg_temp;

**`pg_temp` doit etre nomme, et en dernier.** Postgres le cherche en premier
quand on ne le mentionne pas : ecrire `SET search_path = public` seul laisserait
une table temporaire masquer la vraie. C est ce que l Advisor de Supabase
signale sous `function_search_path_mutable`.

## Une erreur ne se protege pas par un `WHERE`

    -- FAUX : SQL ne garantit pas l ordre d evaluation des conditions.
    WHERE EXISTS (SELECT 1 FROM pg_timezone_names z WHERE z.name = j.fuseau)
      AND EXTRACT(HOUR FROM (now() AT TIME ZONE j.fuseau)) = p_heure

Un seul fuseau abime faisait tomber la requete entiere — **plus personne
n etait prevenu, et rien ne le signalait**. Il faut rattraper l erreur la ou
elle se produit, dans une fonction `EXCEPTION WHEN OTHERS THEN RETURN NULL`
(voir `heure_locale_sure` dans `011_push_cadence.sql`). NULL n est egal a rien
et la ligne fautive se retire d elle-meme.

## Ce qu on ne stocke pas

Aucune donnee de naissance, aucun nom, aucune adresse IP dans les tables de
mesure et de notification. L identifiant d appareil vient de `lib/device-id.ts`.

Le fuseau des notifications est celui de l **appareil**, jamais
`profiles.timezone` qui est le fuseau de **naissance** : quelqu un ne a Kinshasa
et vivant a Bruxelles serait reveille a 6 h 30.

## Toute suppression de compte doit tout emporter

`app/api/profile/forget` — si une table nouvelle porte quoi que ce soit lie a
une personne, elle doit y etre branchee. Une notification qui arrive apres un
effacement demande est un incident declarable.
