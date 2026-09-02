# Checklist App Store Connect — pour encaisser sur iPhone

Une seule fois, dans l ordre. Chaque valeur en `code` est celle que l app
attend : la taper autrement, c est une vente qui n arrive jamais.

**Prealable : la decision (DECISIONS.md, 02/09/2026, 12h30).** On remplace
Astronum par une mise a jour ; deux abonnements, annuel en avant et mensuel
disponible, sans essai gratuit. Prix dans le code : 39,99 EUR/an, 5,99 EUR/mois.

## 0. Ce que le code attend

| Quoi | Valeur exacte | Ou dans le code |
|---|---|---|
| Bundle ID de l app | **celui d Astronum — a obtenir de Marie-Ange** ; le code porte encore `day.favorable.app` et doit etre rekeye | capacitor.config.ts, project.pbxproj |
| Bundle ID du widget | `<bundle Astronum>.widget` | project.pbxproj |
| Groupe d abonnement | `unfold_pro` | APP_STORE_METADATA.md |
| Produit annuel (auto-renouvelable, 1 an) | `unfold_annual_pro` | APP_STORE_METADATA.md |
| Produit mensuel (auto-renouvelable, 1 mois) | `unfold_monthly_pro` | APP_STORE_METADATA.md |
| Droit RevenueCat (entitlement) | `premium` | lib/achats.ts:DROIT |
| Clef publique RevenueCat iOS | a coller dans `NEXT_PUBLIC_REVENUECAT_IOS_KEY` | lib/achats.ts:42 |

**A ne PAS creer :** aucun produit non renouvelable ni « lifetime » (le
webhook l ignore, et hurle si un tel achat arrive — C16). Aucune offre
d introduction ni essai sur aucun des deux.

## 1. Accords et banque (bloque tout le reste, souvent oublie)
- [ ] App Store Connect → Accords, taxes et banque → **Paid Apps** : accepte.
- [ ] Coordonnees bancaires et formulaire fiscal completes (sinon les produits
      restent « Missing Metadata » sans explication).
- [ ] **Entite : compte Zebrapad, Inc. — on met a jour Astronum.** Marie-Ange
      ajoute Christophe dans Users and Access (App Manager). Rien a creer cote
      societe, banque ou fisc. Le partage des revenus est regle par le 50/50.

## 2. La fiche de l app
- [ ] **La fiche existante d Astronum** : nouveau nom, nouvelles captures,
      nouvelle description, et le texte « Nouveautes » = le message d accueil
      de Christophe. Le Bundle ID reste celui d Astronum : rekeyer le code
      (capacitor.config.ts appId, project.pbxproj, widget, APNs, RevenueCat).
- [ ] Verifier avec Marie-Ange qu Astronum n a aucun abonne actif ni produit
      d achat integre existant qui entrerait en conflit.
- [ ] App Privacy : reponses coherentes avec APP_STORE_METADATA.md §Privacy.
- [ ] URL de politique de confidentialite et de conditions (favorable.day).

## 3. Le produit
- [ ] Fonctionnalites → Abonnements → **Creer un groupe** : `unfold_pro`.
- [ ] Dans le groupe, **Creer deux abonnements** (meme groupe : necessaire
      pour passer de l un a l autre) :
      - `unfold_annual_pro` — duree 1 an — nom de reference : Favorable annuel
      - `unfold_monthly_pro` — duree 1 mois — nom de reference : Favorable mensuel
      Taper les Product ID tels quels.
- [ ] Prix : paliers a 39,99 EUR (annuel) et 5,99 EUR (mensuel), ceux du
      code. Verifier l equivalent dans les autres pays proposes.
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
- [ ] Produits → importer `unfold_annual_pro` et `unfold_monthly_pro`.
- [ ] Entitlements → creer `premium` → y attacher les deux produits.
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

## 4 bis. Le web (Stripe) — memes plans
- [ ] Stripe → deux prix recurrents, 39,99 EUR/an et 5,99 EUR/mois → leurs id
      dans `STRIPE_PRICE_ANNUAL` et `STRIPE_PRICE_MONTHLY` (Vercel Production
      + Preview). Aucun essai sur les prix.
- [ ] Laisser **vide** `STRIPE_PRICE_LIFETIME` : le code le lit encore mais la
      decision l exclut ; vide, ce chemin echoue proprement au lieu de vendre.
- [ ] `STRIPE_WEBHOOK_SECRET` du point de terminaison
      `https://favorable.day/api/billing/webhook/stripe`.

## 5. Verifier avant TestFlight (regle : jamais de build sans demander)
- [ ] Users and Access → Sandbox → creer un testeur sandbox.
- [ ] Sur un iPhone en compte sandbox, lancer l app : `lib/achats.ts` doit
      passer de `ios_bloque` a une offre chargee ; acheter ; `entitlements.active.premium` = ok.
- [ ] Dans RevenueCat → Customers, l achat sandbox apparait avec le bon produit.
- [ ] Annuler dans Reglages iOS → l entitlement expire a la fin de la periode sandbox.

Quand les cases 1 a 4 sont cochees, on decide ensemble du build TestFlight.
