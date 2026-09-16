# rc2 — Regenerant Catalunya

Bioregional priorities and regenerative actor directory for Catalunya — a clean-slate website using the ReFi BCN editorial-organic design system. Deployed from the motiuorg repo as the Regenerant Catalunya Maps project page.

## What was copied from refibcn.github.io

- `src/styles/` — design tokens, theme system, global primitives
- Font stack via `@fontsource` (Averia Serif Libre, Geist, IBM Plex Mono, Fraunces)
- Layout/Nav/Footer/Button component patterns
- Astro 5 + static build setup

## What is different

- Brand identity: Regenerant Catalunya (rc2)
- Simplified nav: Priorities · Organizations · Programs · Events
- Placeholder map ready for your actor dataset + MapLibre

## Run locally

```bash
npm install
npm run dev
# → http://localhost:4321/Regenerant-Catalunya-Maps/
```

> Because the site is configured for a GitHub project page (`/Regenerant-Catalunya-Maps`), Astro also serves it under that base path in dev.

## Build

```bash
npm run build
# → dist/
```

To test the production build:

```bash
npm run preview
# → http://localhost:4321/Regenerant-Catalunya-Maps/
```

## GitHub Pages deploy

The repo is set up to deploy automatically via GitHub Actions (`.github/workflows/deploy.yml`) every time you push to `main`.

Target URL: `https://motiuorg.github.io/Regenerant-Catalunya-Maps/`

### Push to GitHub for the first time

```bash
# If you haven't initialised git yet
git init

git add .
git commit -m "Initial rc2 scaffold with GitHub Pages + Notion plumbing"

# Option A: GitHub CLI (creates the repo and pushes in one go)
gh repo create motiuorg/Regenerant-Catalunya-Maps --public --source=. --push

# Option B: create the repo manually on github.com/motiuorg/Regenerant-Catalunya-Maps,
# then add the remote and push
git remote add origin git@github.com:motiuorg/Regenerant-Catalunya-Maps.git
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. Go to `https://github.com/motiuorg/Regenerant-Catalunya-Maps/settings/pages`
2. Under **Build and deployment** → **Source**, select **GitHub Actions**
3. The workflow in `.github/workflows/deploy.yml` will take over from the next push

### Notion integration

1. Create a Notion integration at https://www.notion.so/my-integrations and copy the token
2. In your repo, go to **Settings → Secrets and variables → Actions → New repository secret**
3. Name: `NOTION_API_KEY`, Value: your Notion integration token
4. Share your actor database with the integration
5. Edit `src/data/databases.yaml` and replace `database_id: null` with your real database ID
6. Build the UI components that import from `src/lib/notion.ts`

For local development, copy `.env.example` to `.env` and add your token:

```bash
cp .env.example .env
# edit .env
NOTION_API_KEY=secret_xxx
```

## Where to start editing

| File | Purpose |
|------|---------|
| `src/data/site.yaml` | Site name, URL, description, legal note |
| `src/data/databases.yaml` | Notion database mappings |
| `src/lib/notion.ts` | Notion client + record normalisation |
| `src/pages/index.astro` | Home / map landing page |
| `src/components/Nav.astro` | Navigation items |
| `src/components/Footer.astro` | Footer links |
| `src/styles/themes/editorial-organic.css` | Colours, fonts, radius |
| `src/styles/theme.css` | Swap active theme |
| `astro.config.mjs` | Site/base path for GitHub Pages |

## Data files

| File | Purpose |
|------|---------|
| `src/data/databases.yaml` | Notion database IDs for actors, programs, and events |
| `src/data/priorities.yaml` | Six priorities registry: colours, keywords, diagnosis, leverage, framings, capital stack, sources |
| `src/data/indicators-static.yaml` | Static headline indicators for the scoreboard; live feeds to be added |
| `src/data/contribute.yaml` | Contribution modalities registry: time / attention / money / land / capital, each with links (bilingual en/ca) |
| `src/data/funding-needs.yaml` | Part 2 — restoration initiatives funding needs registry: public programmes, entity-led asks, structural gaps (dated snapshot) |

## Refresh cadence

The site is statically generated. GitHub Actions rebuilds it every 6 hours (`.github/workflows/deploy.yml`), pulling fresh Notion data and regenerating the static snapshot. Indicator live feeds will be added in a later increment; until then, the scoreboard uses the static values in `src/data/indicators-static.yaml`.

## Pages

| Page | Purpose |
|------|---------|
| `/` | Landing page with total mapped count and links to the three databases |
| `/organizations/` | Regenerative actors directory with filters by priority, territory, role, themes, and ontology tags |
| `/programs/` | Programs and initiatives directory with priority and territory filters |
| `/events/` | Events calendar and list view, sorted by date |
| `/priorities/` | Six-priority scoreboard and interdependence view |
| `/priorities/[id]/` | Individual priority page with diagnosis, leverage, capital stack, and related actors/programs |
| `/contribute/` | Every modality for contributing time / attention / money / land / capital to regenerating Catalunya, with direct links and provenance |
| `/contribute/#funding-needs` | Part 2: funding needs of restoration initiatives — public programmes, live asks, and structural gaps |

## Fluvià microsite (`/fluvia/`)

A hidden, unlinked watershed-scale reading of the same databases, focused on the Fluvià river basin (Garrotxa · Pla de l'Estany · Alt Empordà). It is not linked from the main nav; it is reached only by people who know the URL (`…/fluvia/`).

- `/fluvia/` — overview: basin facts, why-the-Fluvià, pressures, live counts, sources, and a catchment map (`public/assets/fluvia-map.jpg`, Gómez-Gener et al.)
- `/fluvia/priorities/` — six socio-ecological health readings of the river landscape, each with condition, signal, pressures, healthy state, and who is working on it
- `/fluvia/organizations/`, `/fluvia/programs/`, `/fluvia/events/` — directories with the same filter UX as the main site, scoped to the basin

All Fluvià pages pull from the **same Notion databases** as the main site, filtered to records tagged with **both `CATBIS` and `fluvia`** in their second-order tag property (`2NDTAG`; `Select` on older event rows). Filtering lives in `src/lib/crm.ts` (`hasFluvia`). Content lives in `src/data/fluvia.yaml` (en/ca/es) loaded via `src/lib/fluvia.ts`; the Fluvià nav is `src/components/FluviaNav.astro` (`shell="fluvia"` on `Layout`). Pages are rendered with `noindex` and use a cooler, blue-toned river palette (`src/styles/themes/fluvia-river.css`), applied only to Fluvià pages via the `theme-fluvia` class on `<html>` — the main site palette is untouched.

### Data files

| File | Purpose |
|------|---------|
| `src/data/fluvia.yaml` | All Fluvià copy (en/ca/es): overview, health-check priorities, directory ledes, sources |
| `src/lib/fluvia.ts` | Loader + `fluviaDict()` for the I18n engine |
| `src/components/FluviaNav.astro` | Fluvià sub-site nav with language switcher and back-link to the full map |
| `src/pages/fluvia/*.astro` | The five pages |
| `src/styles/themes/fluvia-river.css` | Blue-toned river palette, scoped to Fluvià pages |

To expose a new actor/program/event on the microsite, tag it `CATBIS` + `fluvia` in Notion; the next rebuild picks it up automatically.

## Where to start editing

| File | Purpose |
|------|---------|
| `src/data/site.yaml` | Site name, URL, description, legal note |
| `src/data/databases.yaml` | Notion database mappings |
| `src/data/priorities.yaml` | Priority identity, narrative, and capital stack |
| `src/data/indicators-static.yaml` | Scoreboard indicator values |
| `src/data/contribute.yaml` | Contribution modalities, links, and copy |
| `src/lib/contribute.ts` | Contribution data loader |
| `src/lib/notion.ts` | Notion client + record normalisation |
| `src/lib/priorities.ts` | Priority loader and helpers |
| `src/lib/indicators.ts` | Indicator loader |
| `src/pages/index.astro` | Home landing page |
| `src/pages/organizations.astro` | Organizations directory |
| `src/pages/programs.astro` | Programs directory |
| `src/pages/events.astro` | Events calendar/list |
| `src/pages/priorities/index.astro` | Priorities scoreboard |
| `src/pages/priorities/[id].astro` | Priority detail page |
| `src/pages/contribute.astro` | Contribution modalities page |
| `src/components/Nav.astro` | Navigation items |
| `src/components/Footer.astro` | Footer links |
| `src/styles/themes/editorial-organic.css` | Colours, fonts, radius |
| `src/styles/theme.css` | Swap active theme |
| `astro.config.mjs` | Site/base path for GitHub Pages |
