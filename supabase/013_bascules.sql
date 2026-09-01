-- Favorable — les dates de bascule, stockees une fois.
--
-- POURQUOI CETTE TABLE EXISTE.
--
-- Le cron des notifications rappelait le moteur d ephemerides une fois par
-- personne et par jour, pour recalculer des dates qui ne changent jamais. Avec
-- mille utilisateurs, c est mille appels quotidiens sur un serveur tiers — et
-- mille occasions de tomber sur une panne.
--
-- Or le contenu est deja charge une seule fois cote app, et garde en cache
-- trente jours. Les dates d entree et de sortie de periode en decoulent
-- directement. Il suffit donc de les deposer ici, et le cron n a plus qu a
-- lire sa propre base : « qui a une bascule demain ? »
--
-- CE QU ON STOCKE, ET RIEN DE PLUS.
--
-- Une date, un sens, une duree, un numero de maison, une intensite. Aucun
-- titre, aucun texte : le libelle se fabrique a l envoi, dans la langue de la
-- personne (voir lib/maisons-i18n.ts). Aucune donnee de naissance non plus —
-- la table dit quand quelque chose arrive, jamais pourquoi.
--
-- Idempotent.

CREATE TABLE IF NOT EXISTS push_bascules (
  id          BIGSERIAL   PRIMARY KEY,
  device_id   TEXT        NOT NULL,
  -- Clef stable fabriquee par l app a partir du contenu seul, jamais de
  -- l heure du calcul : renvoyer la meme liste deux fois ne cree pas de
  -- doublon.
  cle         TEXT        NOT NULL,
  jour        DATE        NOT NULL,
  sens        TEXT        NOT NULL CHECK (sens IN ('entree', 'sortie')),
  duree_jours INTEGER,
  maison      SMALLINT    CHECK (maison BETWEEN 1 AND 12),
  score       SMALLINT    NOT NULL DEFAULT 1 CHECK (score BETWEEN 1 AND 4),
  depose_le   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_push_bascules UNIQUE (device_id, cle)
);

-- La seule lecture du cron : « qui bascule ce jour-la ».
CREATE INDEX IF NOT EXISTS idx_push_bascules_jour
  ON push_bascules(jour, device_id);

ALTER TABLE push_bascules ENABLE ROW LEVEL SECURITY;
-- Aucune politique : ecriture par le service uniquement, comme les autres.

-- ─────────────────────────────────────────────────────────────────────────────
-- Deposer les bascules d un appareil.
--
-- L app envoie sa liste complete ; on remplace tout ce qui est a venir pour cet
-- appareil. Remplacer plutot que fusionner : si une periode disparait du calcul
-- — donnees de naissance corrigees, moteur mis a jour — sa bascule doit
-- disparaitre aussi. Une fusion laisserait des notifications fantomes pour des
-- periodes qui n existent plus.
--
-- Le passe n est pas touche : il sert de trace de ce qui a ete envoye.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION deposer_bascules(p_device_id TEXT, p_bascules JSONB)
RETURNS INTEGER AS $$
DECLARE
  posees INTEGER;
BEGIN
  DELETE FROM push_bascules
   WHERE device_id = p_device_id AND jour >= CURRENT_DATE;

  INSERT INTO push_bascules (device_id, cle, jour, sens, duree_jours, maison, score)
  SELECT p_device_id,
         b->>'cle',
         (b->>'jour')::DATE,
         b->>'sens',
         NULLIF(b->>'duree', '')::INTEGER,
         NULLIF(b->>'maison', '')::SMALLINT,
         COALESCE(NULLIF(b->>'score', '')::SMALLINT, 1)
    FROM jsonb_array_elements(p_bascules) AS b
   WHERE (b->>'jour')::DATE >= CURRENT_DATE
  ON CONFLICT (device_id, cle) DO NOTHING;

  GET DIAGNOSTICS posees = ROW_COUNT;
  RETURN posees;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION deposer_bascules(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION deposer_bascules(TEXT, JSONB) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Qui prevenir, et de quoi.
--
-- Remplace l appel au moteur : une jointure entre les jetons dont c est
-- l heure locale et les bascules du jour vise.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION bascules_a_annoncer(p_heure_locale INTEGER, p_preavis INTEGER DEFAULT 1)
RETURNS TABLE (
  device_id     TEXT,
  jeton         TEXT,
  locale        TEXT,
  cadence       TEXT,
  dernier_envoi TIMESTAMPTZ,
  cle           TEXT,
  jour          DATE,
  sens          TEXT,
  duree_jours   INTEGER,
  maison        SMALLINT,
  score         SMALLINT
) AS $$
  SELECT j.device_id, j.jeton, j.locale, j.cadence,
         (SELECT max(e.envoye_le) FROM push_envois e WHERE e.device_id = j.device_id),
         b.cle, b.jour, b.sens, b.duree_jours, b.maison, b.score
    FROM push_jetons j
    JOIN push_bascules b ON b.device_id = j.device_id
   WHERE j.actif
     AND heure_locale_sure(j.fuseau) = p_heure_locale
     AND b.jour = CURRENT_DATE + p_preavis
   ORDER BY b.score DESC, b.duree_jours ASC NULLS LAST;
$$ LANGUAGE sql STABLE SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION bascules_a_annoncer(INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION bascules_a_annoncer(INTEGER, INTEGER) TO service_role;

-- La suppression de compte emporte les bascules.
CREATE OR REPLACE FUNCTION oublier_push_jetons(p_device_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  supprimes INTEGER;
BEGIN
  DELETE FROM push_bascules WHERE device_id = p_device_id;
  DELETE FROM push_envois   WHERE device_id = p_device_id;
  DELETE FROM push_jetons   WHERE device_id = p_device_id;
  GET DIAGNOSTICS supprimes = ROW_COUNT;
  RETURN supprimes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION oublier_push_jetons(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION oublier_push_jetons(TEXT) TO service_role;

-- Menage : une bascule passee depuis plus de six mois ne sert plus a rien.
CREATE OR REPLACE FUNCTION purge_push_bascules()
RETURNS INTEGER AS $$
DECLARE
  supprimes INTEGER;
BEGIN
  DELETE FROM push_bascules WHERE jour < CURRENT_DATE - INTERVAL '180 days';
  GET DIAGNOSTICS supprimes = ROW_COUNT;
  RETURN supprimes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION purge_push_bascules() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION purge_push_bascules() TO service_role;
