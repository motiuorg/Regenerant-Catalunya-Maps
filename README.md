# GQRegCat

Giulio's regenerative actors map for Catalunya — a clean-slate website using the ReFi BCN editorial-organic design system.

## What was copied from refibcn.github.io

- `src/styles/` — design tokens, theme system, global primitives
- Font stack via `@fontsource` (Averia Serif Libre, Geist, IBM Plex Mono, Fraunces)
- Layout/Nav/Footer/Button component patterns
- Astro 5 + static build setup

## What is different

- No ReFi BCN content, data, or pages
- Brand identity: GQRegCat
- Simplified nav: Map · Actors · About · Contact
- Placeholder map ready for your actor dataset + MapLibre

## Run locally

```bash
cd projects/GQRegCat
npm install
npm run dev
# → http://localhost:4321/GQRegCat/
```

> Because the site is configured for a GitHub project page (`/GQRegCat`), Astro also serves it under that base path in dev.

## Build

```bash
npm run build
# → dist/
```

To test the production build:

```bash
npm run preview
# → http://localhost:4321/GQRegCat/
```

## GitHub Pages deploy

The repo is set up to deploy automatically via GitHub Actions (`.github/workflows/deploy.yml`) every time you push to `main`.

Target URL: `https://giulioquarta.github.io/GQRegCat/`

### Push to GitHub for the first time

```bash
cd projects/GQRegCat

# If you haven't initialised git yet
git init

git add .
git commit -m "Initial GQRegCat scaffold with GitHub Pages + Notion plumbing"

# Option A: GitHub CLI (creates the repo and pushes in one go)
gh repo create giulioquarta/GQRegCat --public --source=. --push

# Option B: create the repo manually on github.com/giulioquarta/GQRegCat,
# then add the remote and push
git remote add origin git@github.com:giulioquarta/GQRegCat.git
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. Go to `https://github.com/giulioquarta/GQRegCat/settings/pages`
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
| `src/pages/actors.astro` | Actor directory |
| `src/components/Nav.astro` | Navigation items |
| `src/components/Footer.astro` | Footer links |
| `src/styles/themes/editorial-organic.css` | Colours, fonts, radius |
| `src/styles/theme.css` | Swap active theme |
| `astro.config.mjs` | Site/base path for GitHub Pages |
