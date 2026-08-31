# Ce qui bloque la publication de Favorable

Liste tenue à jour. Dernière revue : 31 août 2026, fin de soirée.
Les points sont classés par ce qui empêche réellement de publier.

---

## 1. Statut de professionnel (DSA) — BLOQUANT en Europe

Apple l'affiche en bandeau dans App Store Connect : sans ce statut, **les apps
sont retirées de l'App Store dans l'Union européenne**. Ce n'est pas un
avertissement de forme.

Ce qu'Apple demande, et **publie ensuite sur la fiche publique de l'app** :
adresse postale, numéro de téléphone, adresse e-mail.

**Décision à prendre avant de remplir :** ces informations deviennent publiques.
Une boîte postale ou une domiciliation d'entreprise évite de publier l'adresse
du domicile. Le numéro peut être un numéro dédié.

À faire par Christophe, avec accompagnement écran par écran.
→ App Store Connect › Business › Trader Status

---

## 2. Confidentialité — moitié faite

- [x] **Manifeste iOS** (`ios/App/App/PrivacyInfo.xcprivacy`) — corrigé le
      31/08/2026. Il déclarait zéro donnée collectée alors que l'app collecte
      date, heure et lieu de naissance, identifiant d'installation, prénom,
      e-mail, et événements d'usage. Cinq types déclarés, aucun marqué comme
      servant au suivi.
- [ ] **Questionnaire App Privacy dans App Store Connect** — c'est ce qui
      s'affiche sur la fiche de l'app. Il doit dire la même chose que le
      manifeste, sinon la contradiction se voit. Non rempli à ce jour.

---

## 3. Cohérence des mentions légales

Les prix ont été alignés le 31/08/2026 (5,99 €/mois, 39,99 €/an) dans
`lib/billing/features.ts` et `APP_STORE_METADATA.md`. Reste à vérifier
que rien ne traîne ailleurs : conditions générales, politique de
confidentialité, mentions légales, e-mails transactionnels.

**Décision produit en attente :** le prix « à vie » de 49 € n'a jamais été
tranché et devient incohérent — 49 € à vie contre 39,99 €/an, c'est quinze mois
d'abonnement. Le relever, ou retirer l'offre.

---

## 4. Signature Android

Aucune configuration de signature : impossible de déposer sur Google Play.
Demande une décision (où vit le keystore, qui le détient) avant d'écrire quoi
que ce soit — un keystore perdu interdit toute mise à jour de l'app, à vie.

---

## 5. Propriété et accords — signalé par la revue du 31/08

- Pas de fichier LICENSE.
- Aucun accord écrit avec Marie-Ange, dont le moteur de calcul est au cœur
  du produit.
- Le moteur (`ai.zebrapad.io`) est **joignable sans aucune authentification** —
  vérifié le 31/08 depuis un terminal, sans le moindre identifiant.

Ce n'est pas bloquant pour publier, mais ça le devient dès que l'app rapporte
de l'argent.
