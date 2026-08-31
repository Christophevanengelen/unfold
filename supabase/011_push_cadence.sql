-- Favorable — la cadence choisie, et la memoire de ce qui est parti.
--
-- Deux manques apparus en ecrivant le planificateur.
--
-- 1. La frequence n est pas a nous de decider. Trois crans, mesures sur trois
--    themes reels : essentiel ~7 par an, normal ~34, tout ~54. Le reglage vit a
--    cote du jeton et non dans le telephone, pour survivre a une reinstallation
--    et pour que le serveur, qui decide des envois, puisse le lire.
--
-- 2. Sans trace de ce qui est parti, un cron qui tourne deux fois envoie deux
--    fois. push_envois porte une contrainte d unicite sur (appareil, clef) : la
--    deuxieme tentative ne fait rien, en silence, sans qu on ait a s en
--    souvenir dans le code.
--
-- Idempotent.

-- ─────────────────────────────────────────────────────────────────────────────
-- La cadence. ADD COLUMN IF NOT EXISTS pour pouvoir rejouer le fichier.
-- enregistrer_push_jeton n y touche pas : le choix de la personne survit donc a
-- chaque demarrage a froid, alors que tout le reste de la ligne est rafraichi.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE push_jetons
  ADD COLUMN IF NOT EXISTS cadence TEXT NOT NULL DEFAULT 'normal';

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_push_cadence') THEN
    ALTER TABLE push_jetons ADD CONSTRAINT chk_push_cadence
      CHECK (cadence IN ('essentiel', 'normal', 'tout'));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION regler_cadence_push(p_device_id TEXT, p_cadence TEXT)
RETURNS INTEGER AS $$
DECLARE
  touches INTEGER;
BEGIN
  UPDATE push_jetons SET cadence = p_cadence WHERE device_id = p_device_id AND actif;
  GET DIAGNOSTICS touches = ROW_COUNT;
  RETURN touches;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION regler_cadence_push(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION regler_cadence_push(TEXT, TEXT) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Ce qui est parti. La clef vient du planificateur et ne depend que du contenu
-- (« zr3:2027-03-28:Gemini »), jamais de l heure du calcul : c est ce qui rend
-- l envoi rejouable sans risque.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_envois (
  id         BIGSERIAL   PRIMARY KEY,
  device_id  TEXT        NOT NULL,
  cle        TEXT        NOT NULL,
  nature     TEXT        NOT NULL,
  envoye_le  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_push_envois UNIQUE (device_id, cle)
);

CREATE INDEX IF NOT EXISTS idx_push_envois_appareil
  ON push_envois(device_id, envoye_le DESC);

ALTER TABLE push_envois ENABLE ROW LEVEL SECURITY;
-- Aucune politique : ecriture par le service seulement.

-- Renvoie vrai si l envoi est nouveau, faux s il avait deja eu lieu. Le code
-- appelant n a donc pas a se souvenir : il demande, et n envoie que si on lui
-- dit oui.
CREATE OR REPLACE FUNCTION reserver_envoi_push(
  p_device_id TEXT, p_cle TEXT, p_nature TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  insere INTEGER;
BEGIN
  INSERT INTO push_envois (device_id, cle, nature)
  VALUES (p_device_id, p_cle, p_nature)
  ON CONFLICT (device_id, cle) DO NOTHING;
  GET DIAGNOSTICS insere = ROW_COUNT;
  RETURN insere > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION reserver_envoi_push(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reserver_envoi_push(TEXT, TEXT, TEXT) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Qui prevenir maintenant.
--
-- Le fuseau est celui de l APPAREIL, stocke a l enregistrement. On ne retient
-- que les appareils pour lesquels il est l heure dite CHEZ EUX : le cron tourne
-- toutes les heures, et chaque personne est servie a son heure locale. Un
-- fuseau devenu invalide entre deux versions de Postgres ne doit pas faire
-- tomber la requete entiere, d ou le garde-fou sur le nom du fuseau.
--
-- dernier_envoi permet au code d appliquer le plancher d espacement sans une
-- requete par personne.
-- ─────────────────────────────────────────────────────────────────────────────

-- Un fuseau invalide fait echouer AT TIME ZONE, et cette erreur emporte la
-- requete entiere : une seule ligne abimee et PLUS PERSONNE n est prevenu, sans
-- que rien ne le signale. Proteger avec un EXISTS dans le WHERE ne suffit pas —
-- SQL ne garantit pas l ordre d evaluation des conditions, et la conversion
-- peut s executer avant le garde-fou cense la proteger. Il faut donc rattraper
-- l erreur la ou elle se produit. La ligne fautive rend NULL, qui n est jamais
-- egal a rien, et se retire d elle-meme.
--
-- Ce garde-fou n est pas redondant avec le controle de la route : la liste des
-- fuseaux de Node et celle de PostgreSQL ne sont pas la meme liste.
CREATE OR REPLACE FUNCTION heure_locale_sure(p_fuseau TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN EXTRACT(HOUR FROM (now() AT TIME ZONE p_fuseau))::INTEGER;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE
   SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION push_a_prevenir(p_heure_locale INTEGER)
RETURNS TABLE (
  device_id     TEXT,
  jeton         TEXT,
  fournisseur   TEXT,
  plateforme    TEXT,
  locale        TEXT,
  cadence       TEXT,
  dernier_envoi TIMESTAMPTZ
) AS $$
  SELECT j.device_id, j.jeton, j.fournisseur, j.plateforme, j.locale, j.cadence,
         (SELECT max(e.envoye_le) FROM push_envois e WHERE e.device_id = j.device_id)
    FROM push_jetons j
   WHERE j.actif
     AND heure_locale_sure(j.fuseau) = p_heure_locale;
$$ LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION push_a_prevenir(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION push_a_prevenir(INTEGER) TO service_role;

-- La suppression de compte doit aussi emporter l historique d envoi.
CREATE OR REPLACE FUNCTION oublier_push_jetons(p_device_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  supprimes INTEGER;
BEGIN
  DELETE FROM push_envois WHERE device_id = p_device_id;
  DELETE FROM push_jetons WHERE device_id = p_device_id;
  GET DIAGNOSTICS supprimes = ROW_COUNT;
  RETURN supprimes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION oublier_push_jetons(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION oublier_push_jetons(TEXT) TO service_role;

-- Menage : l historique d envoi n a plus d interet apres un an.
CREATE OR REPLACE FUNCTION purge_push_envois(p_older_than INTERVAL DEFAULT '365 days')
RETURNS INTEGER AS $$
DECLARE
  supprimes INTEGER;
BEGIN
  DELETE FROM push_envois WHERE envoye_le < now() - p_older_than;
  GET DIAGNOSTICS supprimes = ROW_COUNT;
  RETURN supprimes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION purge_push_envois(INTERVAL) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION purge_push_envois(INTERVAL) TO service_role;
