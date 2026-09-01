-- Favorable — le cran « aucune » : couper les notifications sans revoquer iOS.
--
-- L app permettait d ACTIVER les notifications et jamais de les arreter. Une
-- fois la permission accordee, la ligne du reglage devenait inerte : plus aucun
-- moyen, depuis l app, de dire « arretez ».
--
-- iOS n autorise pas a revoquer une permission depuis l app — il faut passer par
-- les Reglages du telephone, ou presque personne ne va. Mais rien ne nous oblige
-- a ENVOYER. Ce cran coupe l envoi cote serveur, ce qui est ce que
-- « desactiver » veut dire pour la personne.
--
-- Sans cette migration, la contrainte refuserait la valeur et le reglage
-- echouerait en silence.
--
-- Idempotent.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_push_cadence') THEN
    ALTER TABLE push_jetons DROP CONSTRAINT chk_push_cadence;
  END IF;
  ALTER TABLE push_jetons ADD CONSTRAINT chk_push_cadence
    CHECK (cadence IN ('aucune', 'essentiel', 'normal', 'tout'));
END $$;
