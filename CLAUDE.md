# Unfold — Claude Code Project Instructions

## Project Overview
Unfold is a premium personal momentum app. This repo is the **web platform**: landing page, admin CMS, and app demo — built with Next.js 16, Tailwind v4, Prisma 7, PostgreSQL.

**Owner:** Christophe van Engelen (Product & Growth, Service Designer — NOT a coder)
**Tech partner:** Marie Ange (Backend API, mobile app — separate codebase)

## Session Startup Checklist

Every new Claude Code session MUST:

1. **Load NVM** (required for Node.js):
   ```bash
   export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
   ```

2. **Verify PostgreSQL is running** on port 5432:
   ```bash
   pg_isready -h localhost -p 5432
   ```
   If not running: `brew services start postgresql@17`

3. **Start the dev server** on port 3333:
   Use `preview_start` with name `unfold-dev` OR:
   ```bash
   npm run dev
   ```
   This runs on **port 3333** (hardcoded in package.json).

4. **Open browser** to show the work:
   - Landing: http://localhost:3333/en
   - Admin CMS: http://localhost:3333/admin
   - App Demo: http://localhost:3333/demo

## Port Assignments (DO NOT CHANGE)

| Service | Port | Notes |
|---------|------|-------|
| **Unfold Dev Server** | 3333 | Next.js (Turbopack) |
| **PostgreSQL** | 5432 | Shared instance, DB = `unfold_dev` |

Other projects on this machine use ports 3000, 5000, 7000, 8000, 9000 — avoid these.

## Database

- **Database name:** `unfold_dev`
- **Connection:** `postgresql://jhondoe@localhost:5432/unfold_dev?schema=public`
- **ORM:** Prisma 7 with `@prisma/adapter-pg` (client engine, NOT library engine)
- **Schema:** `prisma/schema.prisma`
- **Seed:** `npx prisma db seed`

### Prisma Commands
```bash
npx prisma db push      # Sync schema → DB (dev)
npx prisma generate     # Regenerate client after schema changes
npx prisma db seed      # Seed FR/EN/ES content
npx prisma studio       # Visual DB browser (opens on port 5555)
```

### PrismaClient Pattern (Prisma 7)
Always use the adapter pattern:
```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```
Do NOT use `datasources` or `datasourceUrl` — those are Prisma 5/6 APIs.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 (CSS-first, `@theme inline`) |
| ORM | Prisma 7 + @prisma/adapter-pg |
| Database | PostgreSQL 17 |
| Theme | next-themes (dark/light) |
| Fonts | Goodly (display) + Inter (body) |
| Icons | flowbite-react-icons (NO emoji) |
| i18n | DB-driven, zero hardcoded strings |
| Deploy | Vercel (auto-deploy from GitHub) |

## Project Structure

```
app/
├── [locale]/     → Public landing (DB-driven i18n)
├── admin/        → CMS (translations, KPIs, content)
├── demo/         → Mock app screens (API spec for Marie Ange)
├── api/          → Internal API routes
components/
├── landing/      → 10 landing page sections
├── admin/        → CMS components
├── ui/           → Shared primitives
lib/
├── db.ts         → Prisma client singleton (with adapter)
├── i18n.ts       → Translation fetcher from DB
├── mock-data.ts  → Typed mock API responses for demo
├── fonts.ts      → Goodly + Inter font config
types/
└── api.ts        → API contracts (TypeScript interfaces for Marie Ange)
prisma/
├── schema.prisma → Database schema
└── seed.ts       → Content seeder (FR/EN/ES)
```

## Design System (v2 — Flowbite-aligned DTCG)

- **Architecture:** Primitives (Tailwind 50-950) → Semantic tokens → CSS vars in `globals.css`
- **Token files:** `design systhem/Light mode.tokens.json` + `Dark mode.tokens.json` (W3C DTCG format)
- **Neutral scale:** `brand-50` → `brand-950` — purple-tinted mauve (never plain gray)
- **Accent scale:** `violet-50` → `violet-950` — muted premium purple (~#7C6BBF)
- **Dark mode:** `class` strategy via next-themes, independently tuned (not inverted)
- **Backgrounds:** Lavender-tinted in light (#F5F1FA), deep purple in dark (#1B1535)
- **Accent:** Muted sophisticated purple, NOT neon — #7C6BBF (light) / #9585CC (dark)
- **Direction:** "More Apple than Flowbite" — editorial, generous whitespace
- **Typography:** large, confident, minimal
- **DO:** momentum, rhythm, signal, timing, clarity
- **DON'T:** horoscope, mystical, cosmic, zodiac, destiny, magic

## Key Rules

1. **API Contract First** — UI matches `types/api.ts`, demo uses `lib/mock-data.ts`
2. **DB-driven i18n** — ALL user-facing text from PostgreSQL, never hardcoded
3. **No scope creep** — every feature must pass: understood in 5s? makes user return? viral? premium? simple?
4. **Ship small** — each feature ships independently
5. **Christophe is NOT a coder** — explain changes simply, automate everything possible
6. **Icons: Flowbite only, NEVER emoji** — Use `flowbite-react-icons` for ALL icons. Never use emoticon/emoji icons in UI. Import from `flowbite-react-icons/outline` or `flowbite-react-icons/solid`. Browse available icons at https://flowbite.com/icons/. Source: https://github.com/themesberg/flowbite-icons

## Naming & Code Conventions

### Files & Components
| What | Convention | Example |
|------|-----------|---------|
| React components | PascalCase | `SectionHeader.tsx`, `LifeDomains.tsx` |
| Utility/lib files | kebab-case | `mock-data.ts`, `domain-config.tsx` |
| API routes | kebab-case | `api/toctoc-proxy/route.ts` |
| CSS/styles | kebab-case | `globals.css` |
| Types files | kebab-case | `api.ts` |

### Variables & Functions
| What | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `SectionHeader`, `LifeDomains` |
| Functions | camelCase | `buildCapsules`, `assignLanes` |
| Constants | UPPER_SNAKE | `LANE_COUNT`, `PX_PER_MONTH` |
| Config objects | camelCase | `houseConfig`, `planetConfig` |
| Types/interfaces | PascalCase | `MomentumPhase`, `CapsuleData` |
| CSS vars | kebab-case | `--accent-purple`, `--bg-primary` |
| Translation keys | dot.notation | `free.title`, `compat.v2.eyebrow` |

### Atomic Design — Shared UI Components
| Component | Path | Purpose |
|-----------|------|---------|
| `SectionHeader` | `components/ui/SectionHeader.tsx` | Eyebrow + Title + Subtitle — enforces consistent typography |
| `ScrollReveal` | `components/ui/ScrollReveal.tsx` | Scroll-triggered animations |
| `MiniStatusBar` | `components/ui/MiniStatusBar.tsx` | Phone mockup status bar |
| `BottomNav` | `components/ui/BottomNav.tsx` | Phone mockup bottom nav |

**Rule:** Every landing section MUST use `SectionHeader` for its header block. No inline eyebrow/title/subtitle markup.

### Product Terminology (12 Houses, NOT 3 Domains)
The product covers **12 life domains** (astrological houses), NOT "love/health/work":
- `houseConfig` (12 entries) = current system
- `domainConfig` (3 entries) = deprecated, DO NOT use in new code
- `DomainKey` = deprecated, use `HouseNumber` instead

## GitHub

- **Repo:** `Christophevanengelen/unfold`
- **Branch strategy:** `main` = production, feature branches for work
- **Vercel:** auto-deploys from `main`
- **PATH for gh CLI:** `export PATH="/opt/homebrew/bin:$PATH"`

## Common Tasks

### Add a new translation key
1. Add to `prisma/seed.ts`
2. Run `npx prisma db seed`
3. Use in component via `getTranslations(locale, "landing")`

### Change the database schema
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Run `npx prisma generate`
4. Update `lib/db.ts` if needed

### Add a new landing section
1. Create component in `components/landing/`
2. Add content keys to seed
3. Import in `app/[locale]/page.tsx`

---

## Les apps natives (iOS / Android) — lire avant d y toucher

Verifie sur un vrai iPhone le 31 aout 2026 : l app native tourne.

### Comptes et identite

- **Identifiant fige** : `day.favorable.app`. Definitif des la premiere
  publication sur Google Play, il ne se change plus jamais ensuite.
- **Equipe Apple** : `LD9N97K83G` (« Christophe van Engelen »), compte
  `jhondoe2509@gmail.com`, role Admin. C est la sienne.
- **Ne jamais remettre** `JG9V6PMN8T` (Zebrapad, Inc., l equipe de Marie-Ange).
  Christophe ne veut pas y etre.
- **Google Play** : compte ouvert avant 2015, donc **exempt** de la regle des
  12 testeurs pendant 14 jours. Publication directe possible.

### Deux pieges de construction, deja corriges, a ne pas reintroduire

1. `app/page.tsx` est reste le modele de create-next-app. Sur le web le
   middleware redirige et personne ne la voit ; en natif il n y a pas de
   middleware, donc elle devenait l ecran d ouverture de l app.
   `scripts/build-native.sh` **ecrase toujours** `out/index.html`.
2. Le serveur interne de Capacitor sur iOS **ne sert pas l index d un dossier** :
   toute adresse sans extension de fichier retombe sur la page racine. Un
   `location.replace("./app/")` relatif se rempile et donne `/app/app/app/app/`,
   et un `/app/` absolu retombe sur la page d entree. La page d entree vise donc
   le fichier lui-meme : **`/app/index.html`**.

### Diagnostiquer un ecran vide dans l app

Injecter juste apres `<head>` dans `ios/App/App/public/app/index.html` un
`window.onerror` + `unhandledrejection` qui ecrivent l erreur en rouge par-dessus
la page. Seul moyen de voir un plantage JS sans inspecteur Safari. Retirer apres.

### Verifier un bundle

```
find ios/App/App/public -type f | wc -l      # environ 266
cat ios/App/App/capacitor.config.json        # aucune cle "url"
head -c 200 ios/App/App/public/index.html    # la page d entree, pas Next
```

### Outils Xcode pour l agent (session locale uniquement)

Xcode 26 expose un serveur MCP : construire, lancer sur l appareil et lire les
erreurs sans cliquer.

1. Xcode > Settings > Intelligence > Model Context Protocol >
   « Allow external agents to use Xcode tools ».
2. `claude mcp add --transport stdio xcode -- xcrun mcpbridge`
3. Garder le projet ouvert dans Xcode.

**Ne fonctionne que depuis une session locale sur le Mac.** Depuis une session
distante dans le nuage, le serveur ne remonte pas jusqu a l agent : verifie deux
fois le 31 aout 2026, ne pas y repasser du temps.

## Les skills de ce depot

Quatre skills vivent dans `.claude/skills/`. Ils ne repetent pas ce que le code
dit deja : ils gardent ce qui a coute des heures a decouvrir, et qu on ne peut
pas deviner en lisant les fichiers.

- **favorable-livrer** — envoyer sur TestFlight, suivre la revue beta, gerer
  testeurs et certificats. L envoi ne part QUE sur `[testflight]` dans le message
  de commit ou depuis l onglet Actions : Apple plafonne les envois par jour.
- **favorable-base** — migrations Supabase. `SUPABASE_DB_URL` dans `.env.local`
  donne un acces psql direct : ne jamais faire coller du SQL a Christophe.
- **favorable-site** — le site favorable.day : `force-dynamic` obligatoire sur
  toute page localisee, adresse de base, prix a source unique, vocabulaire qui
  tient a distance de l article 4.3(b). Contacts centralises sur hi-def.be.
- **favorable-natif** — les pieges de l app Capacitor : routes a barre finale,
  navigation par le routeur, greffons a synchroniser, et la panne muette qui est
  le defaut recurrent de ce depot.

Les lire avant de toucher a la livraison, a la base ou a l app.
