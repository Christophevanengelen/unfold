# Checklist App Store Connect — pour encaisser sur iPhone

Une seule fois, dans l ordre. Chaque valeur en `code` est celle que l app
attend : la taper autrement, c est une vente qui n arrive jamais.

**Prealable : la decision verrouillee (DECISIONS.md, 02/09/2026).** Un seul
produit, abonnement annuel, sans essai gratuit, sans mensuel. Le prix est a
toi ; le code porte 39,99 EUR (lib/billing/features.ts:94) comme valeur de
travail.

## 0. Ce que le code attend

| Quoi | Valeur exacte | Ou dans le code |
|---|---|---|
| Bundle ID de l app | `day.favorable.app` | capacitor.config.ts, project.pbxproj |
| Bundle ID du widget | `day.favorable.app.widget` | project.pbxproj |
| Groupe d abonnement | `unfold_pro` | APP_STORE_METADATA.md |
| Produit (auto-renouvelable, 1 an) | `unfold_annual_pro` | APP_STORE_METADATA.md |
| Droit RevenueCat (entitlement) | `premium` | lib/achats.ts:DROIT |
| Clef publique RevenueCat iOS | a coller dans `NEXT_PUBLIC_REVENUECAT_IOS_KEY` | lib/achats.ts:42 |

**A ne PAS creer :** `unfold_monthly_pro` (mensuel retire de l offre), aucun
produit non renouvelable ni « lifetime » (le webhook l ignore, et hurle si un
tel achat arrive — C16).

## 1. Accords et banque (bloque tout le reste, souvent oublie)
- [ ] App Store Connect → Accords, taxes et banque → **Paid Apps** : accepte.
- [ ] Coordonnees bancaires et formulaire fiscal completes (sinon les produits
      restent « Missing Metadata » sans explication).
- [ ] Question d entite : sous quel compte developpeur ? Si c est celui de
      Zebrapad, Inc. (Astronum), la fiche publiee porte cette entite — voir
      CONFORMITE.md sur l adresse publiee (DSA).

## 2. La fiche de l app
- [ ] Une app avec le Bundle ID `day.favorable.app` (ou la decision
      Astronum : transferer la fiche existante — une mise a jour qui change de
      finalite passe une revue complete).
- [ ] App Privacy : reponses coherentes avec APP_STORE_METADATA.md §Privacy.
- [ ] URL de politique de confidentialite et de conditions (favorable.day).

## 3. Le produit
- [ ] Fonctionnalites → Abonnements → **Creer un groupe** : `unfold_pro`.
- [ ] Dans le groupe, **Creer un abonnement** :
      - Product ID : `unfold_annual_pro` (exact, insensible au copier-coller ?
        non — le taper tel quel)
      - Duree : 1 an
      - Nom de reference : Favorable annuel
- [ ] Prix : choisir le palier au prix decide (le code dit 39,99 EUR).
      Verifier l equivalent dans les autres pays proposes.
- [ ] Localisation de l abonnement : nom affiche + description, au minimum
      FR et EN (l app est en dix langues ; les autres peuvent suivre).
- [ ] **Aucune offre d introduction, aucun essai gratuit** (decision).
- [ ] Capture d ecran de revue (l ecran du mur payant) + notes de revue.
- [ ] Statut attendu apres saisie : « Ready to Submit ».

## 4. RevenueCat
- [ ] Projet RevenueCat → App iOS avec le Bundle ID `day.favorable.app`.
- [ ] Coller le **App-Specific Shared Secret** d App Store Connect (Fiche de
      l app → Informations generales → Cle secrete partagee specifique a l app),
      ou configurer la cle API App Store Connect (recommande).
- [ ] Produits → importer `unfold_annual_pro`.
- [ ] Entitlements → creer `premium` → y attacher `unfold_annual_pro`.
- [ ] Offerings → une offre (par ex. `default`) marquee **Current** — le code lit
      `offerings.current` (lib/achats.ts:99) et rien d autre : une offre non
      courante est invisible pour l app → un package **Annual** (`$rc_annual`)
      → produit `unfold_annual_pro`.
- [ ] Copier la clef **publique** iOS (commence par `appl_`) →
      `NEXT_PUBLIC_REVENUECAT_IOS_KEY` dans .env.local ET dans Vercel
      (Production + Preview). Jamais la clef secrete cote client.
- [ ] Webhook RevenueCat → URL `https://favorable.day/api/billing/webhook/revenuecat`,
      Authorization header = la valeur que tu mets dans `REVENUECAT_WEBHOOK_SECRET`
      (Vercel Production + Preview). Sans elle, la route refuse tout.
- [ ] `REVENUECAT_API_KEY` (clef secrete, cote serveur seulement) dans Vercel.

## 4 bis. Le web (Stripe) — meme decision, meme produit
- [ ] Stripe → un prix **annuel recurrent** au prix decide → son id dans
      `STRIPE_PRICE_ANNUAL` (Vercel Production + Preview).
- [ ] Laisser **vides** `STRIPE_PRICE_MONTHLY` et `STRIPE_PRICE_LIFETIME` : le
      code les lit encore (lib/billing/stripe.ts:14-19) mais la decision les
      exclut ; vides, ces chemins echouent proprement au lieu de vendre.
- [ ] `STRIPE_WEBHOOK_SECRET` du point de terminaison
      `https://favorable.day/api/billing/webhook/stripe`.

## 5. Verifier avant TestFlight (regle : jamais de build sans demander)
- [ ] Users and Access → Sandbox → creer un testeur sandbox.
- [ ] Sur un iPhone en compte sandbox, lancer l app : `lib/achats.ts` doit
      passer de `ios_bloque` a une offre chargee ; acheter ; `entitlements.active.premium` = ok.
- [ ] Dans RevenueCat → Customers, l achat sandbox apparait avec le bon produit.
- [ ] Annuler dans Reglages iOS → l entitlement expire a la fin de la periode sandbox.

Quand les cases 1 a 4 sont cochees, on decide ensemble du build TestFlight.
