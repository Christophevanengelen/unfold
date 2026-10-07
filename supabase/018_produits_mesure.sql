-- Favorable — enregistrement des produits mesures.
--
-- Seules les empreintes SHA-256 des cles sont ici. Les cles elles-memes sont
-- publiques par conception (elles sont dans le code d'une app ou d'une page) :
-- elles identifient un produit, elles ne protegent rien. La protection, c'est
-- l'origine autorisee, la liste fermee d'evenements et le garde-fou des props
-- (voir app/api/events/route.ts).
--
-- Origines : a renseigner pour les sites web (ex. UPDATE mesure_produits SET
-- origines = ARRAY['https://astrolearn.io'] WHERE app_id = 'astrolearn-site').
-- Les apps natives n'envoient pas d'origine.
--
-- Idempotent. A passer APRES 017.

INSERT INTO mesure_produits (app_id, nom, famille, cle_hash) VALUES
  -- Empreintes remplacees le 07/10/2026 : les anciennes ne correspondaient a aucune
  -- cle embarquee dans un depot. Voir 019_correction_produits_mesure.sql.
  ('astrolearn', 'AstroLearn (app Flutter)', 'app', '1224297dd777a72390ca2132265f66ba2592b43b9235f0e069aab6ec7aa4e516'),
  ('astronum', 'AstroNum / unfoldastro (app Flutter)', 'app', '3873a92f1c453f52c9bafd6b5cbcb3693a8952273d1db604915624e83bc8768d'),
  ('unfold-zebrapad', 'Unfold (app Next + Capacitor, dépôt de Marie-Ange)', 'app', '287833d50d31555900fe9814dec14e5f8cda18534d8025d3faa20e7a916d37df'),
  ('astrolearn-site', 'Site AstroLearn', 'landing', '512b099226462ea4ee5349fec2c808959c3b3bdf85fb0257e3af0fbfab015322'),
  ('agenda2027', 'Agenda 2027 (imprimé, QR)', 'imprime', 'e28b81ff26aa3f419d61a537f0f0e8f05cf33bce8f59e93ebcfac5df1d9c0b82')
ON CONFLICT (app_id) DO UPDATE SET cle_hash = EXCLUDED.cle_hash, nom = EXCLUDED.nom, famille = EXCLUDED.famille;
