-- Favorable — accepter les codes d invitation FAV- en plus des UNFOLD-.
--
-- Le produit s appelle desormais Favorable, mais les codes generes portaient
-- encore le prefixe UNFOLD-. Ce fichier n est que la PREMIERE des trois etapes,
-- et l ordre n est pas negociable :
--
--   1. cette migration : la base accepte les deux formes         <- ici
--   2. la route serveur : la regex accepte les deux formes
--   3. le generateur : il produit desormais FAV-
--
-- Inverser l ordre — durcir le generateur avant d avoir assoupli la base —
-- ferait rejeter chaque nouveau code avec une erreur incomprehensible cote app,
-- et plus aucune connexion entre deux personnes ne serait possible.
--
-- AUCUN CODE EXISTANT N EST REECRIT. Un code deja partage par capture d ecran
-- ou par SMS doit continuer de fonctionner indefiniment. Les deux formats
-- coexistent, c est voulu, et c est le prix de ne casser la promesse de
-- personne.
--
-- Idempotent.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_invite_codes_shape') THEN
    ALTER TABLE invite_codes DROP CONSTRAINT chk_invite_codes_shape;
  END IF;

  ALTER TABLE invite_codes
    ADD CONSTRAINT chk_invite_codes_shape
    CHECK (code ~ '^(UNFOLD|FAV)-[A-Z0-9]{4}$');
END $$;
