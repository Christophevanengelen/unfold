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

## 3. Textes légaux — quatre problèmes trouvés le 31/08

Aucun prix en dur ne traîne dans `lib/legal-content.ts` : la seule mention est
générique. Bonne nouvelle. Mais l'inspection en a sorti quatre autres.

**a. Les textes légaux nomment « Unfold ».** Extrait des conditions :
*« Unfold n'est pas responsable des décisions que vous prenez… »*. Un document
qui engage juridiquement désigne une entité qui n'est plus le nom du produit.
C'est plus gênant qu'une incohérence de marque.

**b′. Adresses de contact — fait le 31/08.** Les dix-sept mentions pointent
désormais vers `cve@hi-def.be`. Le domaine a bien un MX chez Infomaniak,
contrairement à `unfold.app` qui n'en avait aucun. `hello@` n'existait pas — vérifié par Christophe le soir même. L'adresse
retenue est donc `cve@hi-def.be`, une boîte qui reçoit déjà. Point clos.

**b. Aucune identité du vendeur.** Ni raison sociale, ni adresse, ni numéro
d'entreprise, ni TVA. En Europe, les mentions légales sont obligatoires pour un
site commercial. Se règle en même temps que le point 1 (statut DSA), avec les
mêmes informations.

**c. La clause de facturation est inexacte.** Elle affirme que les abonnements
sont facturés « via l'App Store ou Google Play » et renvoie aux politiques de
remboursement de ces plateformes. Or le site vend en direct, par son propre
prestataire de paiement (voir `handleCheckout` dans `app/app/pricing/page.tsx`).
Pour un achat fait sur le web, la clause est fausse — et elle escamote le droit
de rétractation européen de quatorze jours, qui s'applique alors.

**d. Trois langues sur dix.** Les textes n'existent qu'en français, anglais et
espagnol, alors que l'app tourne en dix langues. Une personne en allemand, en
japonais ou en arabe accepte des conditions qu'elle ne lit pas dans sa langue.

Les points **b** et **c** touchent au droit de la consommation : ils demandent
une relecture par quelqu'un dont c'est le métier, pas une rédaction improvisée.

---

## 3 bis. Prix — fait le 31/08

Alignés dans `lib/billing/features.ts` et `APP_STORE_METADATA.md` :
5,99 €/mois, 39,99 €/an, 7 jours d'essai. Le site affichait jusque-là 9,99 €.

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
