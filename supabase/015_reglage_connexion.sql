-- Favorable — le reglage des notifications, connexion par connexion.
--
-- La cadence (011, 014) gouverne la vie de la personne seule. Elle ne dit rien
-- de ce qui se passe ENTRE deux personnes, et un cran unique pour tout le monde
-- ne tiendrait pas : on ne veut pas savoir la meme chose de sa compagne et d un
-- collegue.
--
-- Quatre crans, lus par lib/push-planification.ts :
--
--   aucune     — cette connexion ne previent de rien.
--   communs    — seulement les moments forts communs. Defaut.
--   avec_autre — plus les bascules de leur cote.
--   tout       — plus les mois simplement nets, et non seulement les pics.
--
-- Pourquoi en base et non dans le telephone : c est le serveur qui envoie, donc
-- c est lui qui doit lire le reglage ; et le choix doit survivre a une
-- reinstallation, comme la cadence, puisqu il vit a cote du jeton.
--
-- La table dit QUELLE connexion et QUEL cran. Elle ne porte ni nom, ni date de
-- naissance, ni quoi que ce soit de la personne d en face : l identifiant de
-- connexion est celui que l app utilise deja dans ses adresses.
--
-- Idempotent.

CREATE TABLE IF NOT EXISTS push_reglages_connexion (
  device_id  TEXT        NOT NULL,
  connexion  TEXT        NOT NULL,
  reglage    TEXT        NOT NULL DEFAULT 'communs',
  modifie_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pk_push_reglages_connexion PRIMARY KEY (device_id, connexion)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_reglage_connexion') THEN
    ALTER TABLE push_reglages_connexion ADD CONSTRAINT chk_reglage_connexion
      CHECK (reglage IN ('aucune', 'communs', 'avec_autre', 'tout'));
  END IF;
END $$;

-- Un seul appel, qu il s agisse d un premier choix ou d un changement d avis.
CREATE OR REPLACE FUNCTION regler_connexion_push(
  p_device_id TEXT,
  p_connexion TEXT,
  p_reglage   TEXT
)
RETURNS INTEGER AS $$
DECLARE
  touches INTEGER;
BEGIN
  INSERT INTO push_reglages_connexion (device_id, connexion, reglage)
  VALUES (p_device_id, p_connexion, p_reglage)
  ON CONFLICT (device_id, connexion)
  DO UPDATE SET reglage = EXCLUDED.reglage, modifie_le = now();
  GET DIAGNOSTICS touches = ROW_COUNT;
  RETURN touches;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION regler_connexion_push(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION regler_connexion_push(TEXT, TEXT, TEXT) TO service_role;

-- La table n est jamais lue depuis le navigateur : seul le service_role y
-- touche, par la fonction ci-dessus et par le cron.
ALTER TABLE push_reglages_connexion ENABLE ROW LEVEL SECURITY;
