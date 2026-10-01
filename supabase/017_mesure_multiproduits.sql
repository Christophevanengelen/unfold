-- Favorable — mesure multi-produits.
--
-- Pourquoi : un seul tableau de bord doit comparer plusieurs produits (apps,
-- landings, agenda imprime a QR). Jusqu'ici app_events ne savait pas de quel
-- produit venait une ligne, et le tableau lisait un evenement a la fois (N+1).
--
-- Additive et idempotente : rien n est supprime, aucune ligne existante n est
-- modifiee. Les lignes deja la prennent app_id = 'unfold' par defaut, et le code
-- actuel (qui n envoie pas app_id) continue d ecrire sans changement.
--
-- Ce qu on NE stocke toujours PAS : aucune donnee de naissance, aucune adresse
-- IP, aucun lien install_id -> compte. Un identifiant d installation par
-- produit, jamais partage entre produits.

-- ── Produits ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mesure_produits (
  app_id     TEXT        PRIMARY KEY,                 -- 'unfold', 'astrolearn', 'agenda2027'...
  nom        TEXT        NOT NULL,
  famille    TEXT        NOT NULL CHECK (famille IN ('app', 'landing', 'imprime')),
  cle_hash   TEXT,                                    -- SHA-256 de la cle d ecriture ; NULL = pas de cle (unfold historique)
  origines   TEXT[]      NOT NULL DEFAULT '{}',       -- origines web autorisees (landings)
  actif      BOOLEAN     NOT NULL DEFAULT TRUE,
  cree_le    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO mesure_produits (app_id, nom, famille)
VALUES ('unfold', 'Favorable', 'app')
ON CONFLICT (app_id) DO NOTHING;

ALTER TABLE mesure_produits ENABLE ROW LEVEL SECURITY;
-- Aucune politique, volontairement : lecture et ecriture par le service seulement.

-- ── Evenements : colonnes ajoutees ──────────────────────────────────────────
ALTER TABLE app_events ADD COLUMN IF NOT EXISTS app_id   TEXT NOT NULL DEFAULT 'unfold';
ALTER TABLE app_events ADD COLUMN IF NOT EXISTS event_id UUID;

-- Idempotence : un client qui reessaie ne double pas l evenement.
CREATE UNIQUE INDEX IF NOT EXISTS ux_app_events_event_id
  ON app_events (app_id, event_id) WHERE event_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_app_events_app_event_time
  ON app_events (app_id, event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_app_install_time
  ON app_events (app_id, install_id, created_at DESC);

-- ── Codes QR (agenda imprime, liens de campagne) ────────────────────────────
-- Un code par EMPLACEMENT (couverture, mois de mars, encart colis...), jamais
-- par exemplaire : un code par exemplaire serait un identifiant individuel.
CREATE TABLE IF NOT EXISTS mesure_qr (
  code       TEXT        PRIMARY KEY,                 -- court, ex. 'agenda-couv'
  app_id     TEXT        NOT NULL REFERENCES mesure_produits (app_id),
  emplacement TEXT       NOT NULL,
  campagne   TEXT        NOT NULL,
  cible      TEXT        NOT NULL,                    -- URL de destination (https)
  actif      BOOLEAN     NOT NULL DEFAULT TRUE,
  cree_le    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE mesure_qr ENABLE ROW LEVEL SECURITY;

-- ── Lectures : toutes les mesures du tableau en une seule passe ─────────────

-- Comptes par evenement : evenements et installations distinctes, 7 et 30 jours.
-- Remplace une requete par evenement et par fenetre (N+1).
CREATE OR REPLACE FUNCTION kpi_comptes(p_app TEXT, p_depuis TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days')
RETURNS TABLE (event TEXT, evenements BIGINT, installations BIGINT, evenements_7j BIGINT, installations_7j BIGINT) AS $$
  SELECT
    e.event,
    COUNT(*)::BIGINT,
    COUNT(DISTINCT e.install_id)::BIGINT,
    COUNT(*) FILTER (WHERE e.created_at >= now() - INTERVAL '7 days')::BIGINT,
    COUNT(DISTINCT e.install_id) FILTER (WHERE e.created_at >= now() - INTERVAL '7 days')::BIGINT
  FROM app_events e
  WHERE e.app_id = p_app AND e.created_at >= p_depuis
  GROUP BY e.event;
$$ LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Entonnoir : parmi les installations qui ont fait l etape 1, combien ont fait
-- l etape 2 APRES, puis la 3 apres la 2, etc. Ordre des etapes = ordre du tableau.
CREATE OR REPLACE FUNCTION kpi_entonnoir(p_app TEXT, p_etapes TEXT[], p_depuis TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days')
RETURNS TABLE (rang INT, etape TEXT, installations BIGINT) AS $$
  WITH RECURSIVE
  s AS (SELECT name, ord::INT FROM unnest(p_etapes) WITH ORDINALITY AS u(name, ord)),
  f AS (
    SELECT e.install_id, s.ord, MIN(e.created_at) AS t
    FROM app_events e JOIN s ON s.name = e.event
    WHERE e.app_id = p_app AND e.created_at >= p_depuis
    GROUP BY e.install_id, s.ord
  ),
  chaine AS (
    SELECT install_id, ord, t FROM f WHERE ord = 1
    UNION ALL
    SELECT f.install_id, f.ord, f.t
    FROM chaine c JOIN f ON f.install_id = c.install_id AND f.ord = c.ord + 1 AND f.t >= c.t
  )
  SELECT s.ord, s.name, COUNT(c.install_id)::BIGINT
  FROM s LEFT JOIN chaine c ON c.ord = s.ord
  GROUP BY s.ord, s.name
  ORDER BY s.ord;
$$ LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Cohortes de retention : par semaine de premiere ouverture, part encore active
-- k semaines plus tard (au moins une ouverture dans la semaine k).
CREATE OR REPLACE FUNCTION kpi_cohortes(p_app TEXT, p_semaines INT DEFAULT 8)
RETURNS TABLE (cohorte DATE, taille BIGINT, semaine INT, actifs BIGINT) AS $$
  WITH premieres AS (
    SELECT install_id, date_trunc('week', MIN(created_at))::DATE AS cohorte
    FROM app_events
    WHERE app_id = p_app AND event = 'app_ouverte'
    GROUP BY install_id
    HAVING MIN(created_at) >= now() - make_interval(weeks => p_semaines)
  ),
  tailles AS (SELECT cohorte, COUNT(*)::BIGINT AS n FROM premieres GROUP BY cohorte),
  activite AS (
    SELECT p.cohorte,
           ((date_trunc('week', e.created_at)::DATE - p.cohorte) / 7)::INT AS k,
           COUNT(DISTINCT e.install_id)::BIGINT AS actifs
    FROM premieres p
    JOIN app_events e
      ON e.install_id = p.install_id AND e.app_id = p_app AND e.event = 'app_ouverte'
    GROUP BY 1, 2
  )
  SELECT t.cohorte, t.n, a.k, a.actifs
  FROM tailles t JOIN activite a USING (cohorte)
  WHERE a.k >= 0
  ORDER BY t.cohorte, a.k;
$$ LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Sources : d ou viennent les visites (page_vue) et ce qu elles cliquent.
CREATE OR REPLACE FUNCTION kpi_sources(p_app TEXT, p_depuis TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days')
RETURNS TABLE (source TEXT, visiteurs BIGINT, cliqueurs BIGINT) AS $$
  WITH visites AS (
    SELECT install_id,
           COALESCE(NULLIF(props->>'utm_source', ''), NULLIF(props->>'referrer', ''), 'direct') AS source
    FROM app_events
    WHERE app_id = p_app AND event = 'page_vue' AND created_at >= p_depuis
  ),
  clics AS (
    SELECT DISTINCT install_id FROM app_events
    WHERE app_id = p_app AND event = 'cta_clic' AND created_at >= p_depuis
  )
  SELECT v.source,
         COUNT(DISTINCT v.install_id)::BIGINT,
         COUNT(DISTINCT v.install_id) FILTER (WHERE c.install_id IS NOT NULL)::BIGINT
  FROM visites v LEFT JOIN clics c USING (install_id)
  GROUP BY v.source
  ORDER BY 2 DESC;
$$ LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = public, pg_temp;

-- Fraicheur : derniere donnee recue par produit. C est elle qui dit si le
-- suivi est tombe en panne (une absence de donnees ne doit pas se lire comme
-- une absence d usage).
CREATE OR REPLACE FUNCTION kpi_fraicheur()
RETURNS TABLE (app_id TEXT, derniere TIMESTAMPTZ, evenements_24h BIGINT) AS $$
  SELECT p.app_id,
         (SELECT MAX(e.created_at) FROM app_events e WHERE e.app_id = p.app_id),
         (SELECT COUNT(*) FROM app_events e WHERE e.app_id = p.app_id AND e.created_at >= now() - INTERVAL '24 hours')::BIGINT
  FROM mesure_produits p WHERE p.actif;
$$ LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION kpi_comptes(TEXT, TIMESTAMPTZ)          FROM PUBLIC;
REVOKE ALL ON FUNCTION kpi_entonnoir(TEXT, TEXT[], TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION kpi_cohortes(TEXT, INT)                 FROM PUBLIC;
REVOKE ALL ON FUNCTION kpi_sources(TEXT, TIMESTAMPTZ)          FROM PUBLIC;
REVOKE ALL ON FUNCTION kpi_fraicheur()                         FROM PUBLIC;
GRANT EXECUTE ON FUNCTION kpi_comptes(TEXT, TIMESTAMPTZ)          TO service_role;
GRANT EXECUTE ON FUNCTION kpi_entonnoir(TEXT, TEXT[], TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION kpi_cohortes(TEXT, INT)                 TO service_role;
GRANT EXECUTE ON FUNCTION kpi_sources(TEXT, TIMESTAMPTZ)          TO service_role;
GRANT EXECUTE ON FUNCTION kpi_fraicheur()                         TO service_role;
