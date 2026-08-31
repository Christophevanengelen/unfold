-- Favorable — mesure d usage.
--
-- Pourquoi une table maison plutot qu un service tiers : le produit vit dans
-- deux corps, un site web et une app Capacitor. L app est un binaire statique,
-- elle n a pas de page vue au sens ou l entend un outil web, et c est justement
-- elle qu on veut mesurer. Les routes API de Favorable, elles, repondent aux
-- deux. On garde donc les donnees chez nous, sans prestataire supplementaire.
--
-- Ce qu on NE stocke PAS : aucune donnee de naissance, aucun nom, aucune
-- adresse, aucune adresse IP. L identifiant d installation est genere sur
-- l appareil, il ne dit rien de la personne et ne suit personne d un appareil
-- a l autre. Le drapeau « ne pas me suivre » du navigateur est respecte en
-- amont, cote client : l evenement n est jamais envoye.
--
-- La retention ne s emet pas, elle se calcule. On enregistre les ouvertures
-- d app, et on lit la part de gens revenus en J+1 ou J+7 par une requete. Une
-- app ne sait pas de facon fiable quel jour elle en est.
--
-- Idempotent.

CREATE TABLE IF NOT EXISTS app_events (
  id           BIGSERIAL   PRIMARY KEY,
  event        TEXT        NOT NULL,          -- nom parmi une liste fermee, voir la route
  install_id   TEXT        NOT NULL,          -- identifiant d installation, genere sur l appareil
  surface      TEXT        NOT NULL,          -- 'app' | 'web'
  locale       TEXT,                          -- 'fr', 'en', ...
  props        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Les deux seules lectures qu on fera : « combien d evenements X sur la periode »
-- et « quelles installations sont revenues ».
CREATE INDEX IF NOT EXISTS idx_app_events_event_time
  ON app_events(event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_install_time
  ON app_events(install_id, created_at DESC);

ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;
-- Aucune politique, volontairement : ecriture par le service seulement, jamais
-- lisible depuis un navigateur.

-- ─────────────────────────────────────────────────────────────────────────────
-- Lecture : la retention, calculee et non emise.
-- Renvoie, pour les installations dont la premiere ouverture tombe dans la
-- fenetre, la part qui a rouvert l app le lendemain et une semaine plus tard.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION retention_app(p_depuis TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days')
RETURNS TABLE (
  installations BIGINT,
  revenus_j1    BIGINT,
  revenus_j7    BIGINT
) AS $$
  WITH premieres AS (
    SELECT install_id, MIN(created_at) AS debut
    FROM app_events
    WHERE event = 'app_ouverte'
    GROUP BY install_id
    HAVING MIN(created_at) >= p_depuis
  )
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM app_events e
      WHERE e.install_id = p.install_id
        AND e.event = 'app_ouverte'
        AND e.created_at >= p.debut + INTERVAL '1 day'
        AND e.created_at <  p.debut + INTERVAL '2 days'
    ))::BIGINT,
    COUNT(*) FILTER (WHERE EXISTS (
      SELECT 1 FROM app_events e
      WHERE e.install_id = p.install_id
        AND e.event = 'app_ouverte'
        AND e.created_at >= p.debut + INTERVAL '7 days'
        AND e.created_at <  p.debut + INTERVAL '8 days'
    ))::BIGINT
  FROM premieres p;
$$ LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION retention_app(TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION retention_app(TIMESTAMPTZ) TO service_role;

-- Menage. Les evenements bruts ne servent plus au-dela d un an.
CREATE OR REPLACE FUNCTION purge_app_events(p_older_than INTERVAL DEFAULT '365 days')
RETURNS INTEGER AS $$
DECLARE
  removed INTEGER;
BEGIN
  DELETE FROM app_events WHERE created_at < now() - p_older_than;
  GET DIAGNOSTICS removed = ROW_COUNT;
  RETURN removed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION purge_app_events(INTERVAL) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION purge_app_events(INTERVAL) TO service_role;
