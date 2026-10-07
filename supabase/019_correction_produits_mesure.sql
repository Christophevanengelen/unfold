-- Favorable : correction de l'enregistrement des produits mesures (07/10/2026).
--
-- Constat d'audit : la base de production ne correspondait pas a la migration
-- 018. (1) Les origines autorisees etaient stockees avec des chevrons litteraux
-- (`<https://astrolearn.io>`), donc aucune origine de navigateur ne correspondait.
-- (2) L'empreinte de la cle du site astrolearn.io ne correspondait pas a la cle
-- embarquee dans le site : tout appel recevait 401. (3) L'app Unfold (Next +
-- Capacitor) n'avait aucune origine : `capacitor://localhost` recevait 403.
-- (4) mesure_qr etait vide.
--
-- Appliquee a la main en production le 07/10/2026 (voir le rapport d'audit).
-- Idempotente : on peut la rejouer sans effet de bord. Seules les empreintes
-- SHA-256 des cles sont ici ; les cles sont publiques par conception.

-- Origines propres (sans chevrons), apps natives incluses.
UPDATE mesure_produits SET origines = ARRAY['https://agenda2027.zebrapad.io']                     WHERE app_id = 'agenda2027';
UPDATE mesure_produits SET origines = ARRAY['https://astrolearn.zebrapad.io']                     WHERE app_id = 'astrolearn';
UPDATE mesure_produits SET origines = ARRAY['https://astrolearn.io', 'https://www.astrolearn.io'] WHERE app_id = 'astrolearn-site';
UPDATE mesure_produits SET origines = ARRAY['https://astronum.zebrapad.io']                       WHERE app_id = 'astronum';
UPDATE mesure_produits SET origines = ARRAY['https://favorable.day', 'https://unfold.zebrapad.io'] WHERE app_id = 'unfold';
-- WebView Capacitor : iOS sert depuis capacitor://localhost, Android depuis https://localhost.
UPDATE mesure_produits SET origines = ARRAY['capacitor://localhost', 'https://localhost']         WHERE app_id = 'unfold-zebrapad';

-- Empreintes alignees sur les cles reellement embarquees.
UPDATE mesure_produits SET cle_hash = '512b099226462ea4ee5349fec2c808959c3b3bdf85fb0257e3af0fbfab015322' WHERE app_id = 'astrolearn-site';
UPDATE mesure_produits SET cle_hash = '1224297dd777a72390ca2132265f66ba2592b43b9235f0e069aab6ec7aa4e516' WHERE app_id = 'astrolearn';
UPDATE mesure_produits SET cle_hash = '3873a92f1c453f52c9bafd6b5cbcb3693a8952273d1db604915624e83bc8768d' WHERE app_id = 'astronum';

-- Les 16 QR de l'agenda 2027 (un par emplacement, jamais par exemplaire).
-- Cible modifiable plus tard sans reimprimer.
INSERT INTO mesure_qr (code, app_id, emplacement, campagne, cible) VALUES
  ('agenda-couv', 'agenda2027', 'Couverture', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-mode-emploi', 'agenda2027', 'Mode d''emploi (page Bienvenue)', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m01', 'agenda2027', 'Début de janvier', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m02', 'agenda2027', 'Début de février', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m03', 'agenda2027', 'Début de mars', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m04', 'agenda2027', 'Début de avril', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m05', 'agenda2027', 'Début de mai', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m06', 'agenda2027', 'Début de juin', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m07', 'agenda2027', 'Début de juillet', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m08', 'agenda2027', 'Début de août', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m09', 'agenda2027', 'Début de septembre', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m10', 'agenda2027', 'Début de octobre', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m11', 'agenda2027', 'Début de novembre', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-m12', 'agenda2027', 'Début de décembre', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-4e-couv', 'agenda2027', '4e de couverture', 'agenda2027', 'https://astrolearn.io/shop/agenda'),
  ('agenda-colis', 'agenda2027', 'Encart colis', 'agenda2027', 'https://astrolearn.io/shop/agenda')
ON CONFLICT (code) DO NOTHING;
