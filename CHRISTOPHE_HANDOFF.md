# Unfold — Ship to App Store Handoff (Christophe)

**Status as of 2026-04-28:**
- ✅ Web app live at https://unfold-nine.vercel.app — astrology positioning, 10 languages, Stripe billing wired
- ✅ Capacitor iOS shell ready in `/ios` (bundle ID `com.zebrapad.unfold`)
- ✅ All code work done — only Apple-side work blocking submission
- ⏳ Apple Developer Program enrollment (YOUR ACTION) — gates everything below

---

## Critical Path: 5 actions you need to do

### 1. Apple Developer Program enrollment ($99/year)

Go to https://developer.apple.com/programs/enroll/

Use your existing Apple ID (the same one Marie Ange added you to as `Zebrapad, Inc.` Team `JG9V6PMN8T`).

If you're enrolling under your own name vs the Zebrapad org, choose:
- **Individual** ($99/yr) — fastest, your name shows on App Store
- **Organization** ($99/yr) — Zebrapad shows on App Store, requires DUNS number (Marie Ange may already have one)

Time: 1-2 days for Apple to approve enrollment, sometimes a week for Org.

### 2. Create the App in App Store Connect

Once Dev Program is active, go to https://appstoreconnect.apple.com → My Apps → "+"

- **Platform:** iOS
- **Name:** `Unfold` (or `Unfold: Astrology Timing` if "Unfold" is taken)
- **Primary Language:** English (U.S.) — we'll add localizations after
- **Bundle ID:** `com.zebrapad.unfold` (must match iOS Xcode project — already configured)
- **SKU:** `unfold-001` (internal ID, anything unique)
- **User Access:** Full Access

After creation, fill in the metadata from `APP_STORE_METADATA.md` (English first, then add FR/ES/PT-BR localizations).

### 3. Generate the iOS Distribution Certificate

Open Xcode → Settings → Accounts → click your Apple ID → "Manage Certificates" → "+" → **Apple Distribution**.

This creates a cert tied to your Mac. You only need to do this once per Mac.

### 4. Create the App Store Provisioning Profile

In App Store Connect (or Xcode automatic signing):
- Profile type: **App Store**
- Bundle ID: `com.zebrapad.unfold`
- Certificate: the Distribution cert from step 3

If using Xcode automatic signing (recommended): just open `ios/App/App.xcworkspace` → select the `App` target → Signing & Capabilities → make sure "Automatically manage signing" is checked and Team is `Zebrapad, Inc. (JG9V6PMN8T)`. Xcode handles the profile.

### 5. Archive and Upload

In Xcode with `ios/App/App.xcworkspace` open:
- Set scheme to `App` (not `App-iPhone16Pro`)
- Set destination to **Any iOS Device (arm64)**
- Menu: **Product → Archive** — takes 2-5 minutes
- When done, Organizer opens automatically → click **Distribute App** → **App Store Connect** → **Upload**
- Xcode signs with the Distribution cert + uploads to App Store Connect

After upload (5-15 minutes), the build appears in App Store Connect → TestFlight tab. Add it to a TestFlight group for internal testing.

For **App Store review submission**: in App Store Connect, go to "1.0 Prepare for Submission" → fill required fields → "Add for Review" → "Submit for Review".

Apple review typically takes 24-48 hours for new apps.

---

## What's already done for you

### Code-side ready

| Asset | Status | Notes |
|---|---|---|
| Bundle ID | ✅ `com.zebrapad.unfold` | Matches Apple Dev Team `JG9V6PMN8T` |
| Apple Team config | ✅ Set in Xcode project | `JG9V6PMN8T` |
| App icon (1024×1024) | ✅ Real Unfold mark | `ios/App/App/Assets.xcassets/AppIcon.appiconset/` |
| Info.plist permissions | ✅ Camera, Photos, ATT | Localized usage strings included |
| Privacy info (PrivacyInfo.xcprivacy) | ✅ NSPrivacyTracking=false | UserDefaults declared |
| URL scheme (deep link) | ✅ `unfold://auth/callback` | For magic-link authentication |
| Encryption export (ITSAppUsesNonExemptEncryption) | ✅ false | TLS only |
| Capacitor live URL | ✅ Loads from Vercel | Auto-updates with web deploys |
| Status bar / splash / safe areas | ✅ Configured + theme-aware | Light/dark mode synced |
| Multi-language UI | ✅ 10 languages | Auto-detect + in-app picker |
| Stripe billing | ✅ Live mode env vars set | Web-only checkout (per anti-steering) |
| OpenAI personalization | ✅ Locale-aware | GPT replies in user's language |
| Magic link auth | ✅ Locale stored in user metadata | Supabase email templates need configuring |

### Live web infrastructure

| Service | Status |
|---|---|
| Production URL | https://unfold-nine.vercel.app |
| Vercel auto-deploy from `main` | ✅ |
| Supabase database | ✅ All tables (subscriptions, billing_events, profiles, etc.) |
| Stripe products + webhook | ✅ Live mode |
| GDPR delete (Article 17) | ✅ Authenticated full purge |

### App Store Connect metadata ready

See `APP_STORE_METADATA.md` for ready-to-paste:
- Description in EN/FR/ES/PT-BR
- Keywords per locale
- Screenshot requirements
- Privacy disclosure

---

## V1 Strategy: Web Stripe only (no IAP yet)

The iOS bundle deliberately ships **without** Apple IAP. Per Apple anti-steering rule 3.1.1:
- ✅ NO mention of price in the iOS UI
- ✅ NO link from iOS to web checkout
- ✅ "Débloque dans la version Pro" message instead

Users who want Pro discover it via:
- Sharing the web URL
- Direct visit to unfold-nine.vercel.app
- Word of mouth + your marketing

**Phase 4** (2-4 weeks after launch traction): we add RevenueCat + Apple IAP for native iOS subscriptions. This requires more App Store config but we can ship V1 without it.

---

## Things to configure in Supabase Dashboard (manual)

These can't be done via code — log into https://supabase.com/dashboard/project/ykrequspwobhnlbcldam:

1. **Email templates** for magic link in 4 languages:
   - Auth → Email Templates → "Magic Link"
   - Add localized templates for FR, EN, PT, ES (English template likely already there)
   - Use `{{ .Data.locale }}` in metadata to branch

2. **SMTP settings** — currently using Supabase's default SMTP (limited deliverability). Recommend hooking up Resend or SendGrid for production reliability.

3. **Auth callback URLs** — make sure these are in Auth → URL Configuration:
   - `https://unfold-nine.vercel.app/auth/callback`
   - `unfold://auth/callback` (for the iOS deep link)

---

## After App Store approval — V1 launch checklist

When Apple approves the app and you're ready to release:

1. **App Store Connect** — manually release the build (not auto-release after approval — gives you control)
2. **Update real App Store ID** in `components/landing/AppStoreBadges.tsx` — replace `id6740000000` with the real ID Apple assigns
3. **Create the Play Store listing** with the same `com.zebrapad.unfold` package (Google Play Console — $25 one-time)
4. **Marie Ange API content translations** — ask her for FR→EN/ES/PT translations of:
   - Capsule names (~25 strings: "Brouillard créatif"→"Creative Fog", etc.)
   - House names (Foyer→Home, Carrière→Career, etc.)
5. **Marketing push:**
   - Update landing page screenshots to real iPhone mockups
   - Cross-post on r/astrology, r/AskAstrologers (provide value, don't spam — see `memory/launch-language-strategy.md` for per-market positioning)
   - Submit to Product Hunt (Tuesday morning Pacific time for max visibility)
   - Email magic-link new-user welcome flow

---

## V1.1 backlog (after V1 ships)

- Apple IAP via RevenueCat (Phase 4 in original plan)
- Push notifications (peak alerts)
- DE + IT language launch (already coded, just needs marketing)
- App Store optimization based on real download data
- Brazilian Portuguese pricing PPP adjustment (R$39.90/mo if conversion is low at R$54.90)
- Universal links (web → app birth data autofill)
- Apple Family Sharing
- Referral program (after Apple anti-steering risk audit)

---

## If something goes wrong

- **Vercel deploy fails:** check `dpl_*` ID in Vercel dashboard → Build Logs
- **Stripe webhook misfires:** Stripe dashboard → Developers → Webhooks → see Events
- **Supabase write fails:** check service-role key is set in Vercel env vars
- **iOS Archive fails signing:** verify Apple Dev Program is active + Distribution cert exists
- **Apple rejects** for anti-steering: search the iOS bundle for any price string (`grep -r "9,99\|9.99\|EUR\|€" ios/`) — should be zero results

---

## Key files for reference

```
APP_STORE_METADATA.md            — paste-ready listings in 4 languages
CHRISTOPHE_HANDOFF.md            — this file
memory/launch-playbook.md        — full architecture doc
memory/launch-language-strategy.md — why these 4 languages
ios/App/App.xcworkspace          — open this in Xcode (NOT App.xcodeproj)
capacitor.config.ts              — server URL + plugin config
lib/i18n-demo.ts                 — single source of truth for app i18n
lib/billing/stripe.ts            — Stripe locale mapping (centralized)
app/demo/pricing/page.tsx        — in-app pricing (where Premium CTA lands)
```

---

You've got this. The hard engineering work is done; the rest is paperwork + clicking Upload.
