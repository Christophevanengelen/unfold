-- Favorable — jetons de notification.
--
-- Ce que la table garde : de quoi joindre un appareil, et rien d autre. Pas de
-- nom, pas de date de naissance, pas de lieu, pas d adresse IP. L identifiant
-- d appareil est celui qui circule deja dans le produit (lib/device-id.ts).
--
-- Le fuseau vient de l APPAREIL, pas du theme natal. profiles.timezone est le
-- fuseau de NAISSANCE : quelqu un ne a Kinshasa et vivant a Bruxelles serait
-- reveille a 6 h 30 du matin. C est une confusion facile et couteuse.
--
-- L unicite porte sur le jeton seul, pas sur le couple (appareil, jeton). Un
-- jeton identifie une installation ; apres une restauration de sauvegarde il
-- peut reapparaitre sous un autre identifiant d appareil. Avec l unicite sur le
-- couple on garderait deux lignes vivantes et la personne recevrait tout en
-- double. Avec l unicite sur le jeton, le conflit reattribue proprement la
-- ligne.
--
-- Idempotent.

CREATE TABLE IF NOT EXISTS push_jetons (
  id           BIGSERIAL   PRIMARY KEY,
  jeton        TEXT        NOT NULL,
  fournisseur  TEXT        NOT NULL CHECK (fournisseur IN ('apns', 'fcm')),
  plateforme   TEXT        NOT NULL CHECK (plateforme IN ('ios', 'android')),
  device_id    TEXT        NOT NULL,
  fuseau       TEXT        NOT NULL,
  locale       TEXT,
  actif        BOOLEAN     NOT NULL DEFAULT TRUE,
  cree_le      TIMESTAMPTZ NOT NULL DEFAULT now(),
  vu_le        TIMESTAMPTZ NOT NULL DEFAULT now(),
  invalide_le  TIMESTAMPTZ,
  motif        TEXT,
  CONSTRAINT uq_push_jetons UNIQUE (jeton)
);

CREATE INDEX IF NOT EXISTS idx_push_jetons_appareil
  ON push_jetons(device_id) WHERE actif;
CREATE INDEX IF NOT EXISTS idx_push_jetons_vu
  ON push_jetons(vu_le);

ALTER TABLE push_jetons ENABLE ROW LEVEL SECURITY;
-- Aucune politique, volontairement : ecriture par le service seulement, jamais
-- lisible depuis un navigateur. Meme regle que ai_usage_counters et app_events.

-- ─────────────────────────────────────────────────────────────────────────────
-- Enregistrement. Appele a chaque demarrage a froid de l app, pas une seule
-- fois a l installation : une ecriture ratee se repare ainsi toute seule au
-- lancement suivant. C est ce qui rend acceptable l echec silencieux cote
-- route.
--
-- Un jeton qu on avait enterre et qui revient de lui-meme est vivant : on
-- remet actif a vrai et on efface le motif.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION enregistrer_push_jeton(
  p_jeton       TEXT,
  p_fournisseur TEXT,
  p_plateforme  TEXT,
  p_device_id   TEXT,
  p_fuseau      TEXT,
  p_locale      TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO push_jetons (jeton, fournisseur, plateforme, device_id, fuseau, locale)
  VALUES (p_jeton, p_fournisseur, p_plateforme, p_device_id, p_fuseau, p_locale)
  ON CONFLICT (jeton) DO UPDATE SET
    fournisseur = EXCLUDED.fournisseur,
    plateforme  = EXCLUDED.plateforme,
    device_id   = EXCLUDED.device_id,
    fuseau      = EXCLUDED.fuseau,
    locale      = EXCLUDED.locale,
    vu_le       = now(),
    actif       = TRUE,
    invalide_le = NULL,
    motif       = NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION enregistrer_push_jeton(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION enregistrer_push_jeton(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Invalidation. Le refus du fournisseur fait autorite : c est le seul signal
-- fiable. Personne ne nous previent quand quelqu un coupe les notifications
-- dans les reglages de son telephone.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION invalider_push_jeton(p_jeton TEXT, p_motif TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE push_jetons
     SET actif = FALSE, invalide_le = now(), motif = p_motif
   WHERE jeton = p_jeton;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION invalider_push_jeton(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION invalider_push_jeton(TEXT, TEXT) TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Menage. Les jetons invalides depuis longtemps, et ceux qu on n a plus revus
-- depuis six mois : l app se reenregistrant a chaque demarrage, un jeton non
-- revu est mort dans les faits.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION purge_push_jetons()
RETURNS INTEGER AS $$
DECLARE
  supprimes INTEGER;
BEGIN
  DELETE FROM push_jetons
   WHERE (NOT actif AND invalide_le < now() - INTERVAL '90 days')
      OR (actif AND vu_le < now() - INTERVAL '180 days');
  GET DIAGNOSTICS supprimes = ROW_COUNT;
  RETURN supprimes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION purge_push_jetons() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION purge_push_jetons() TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- Suppression de compte. app/api/profile/forget efface les donnees d une
-- personne ; ses jetons doivent partir avec, sinon une notification arriverait
-- apres un effacement demande. Ce serait un incident declarable.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION oublier_push_jetons(p_device_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  supprimes INTEGER;
BEGIN
  DELETE FROM push_jetons WHERE device_id = p_device_id;
  GET DIAGNOSTICS supprimes = ROW_COUNT;
  RETURN supprimes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION oublier_push_jetons(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION oublier_push_jetons(TEXT) TO service_role;
