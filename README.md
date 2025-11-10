# Greentic WebChat

Static, skinnable BotFramework-WebChat experiences built with React + Vite. Each tenant lives entirely inside `public/skins/{tenant}` so pushing to `main` instantly deploys new demos via GitHub Pages.

## Quick start

```bash
npm install
npm run dev           # local SPA at http://localhost:5173
npm run validate:skins
npm run build         # validates skins, builds, and copies index -> 404 fallback
```

> **Note:** Rollup distributes platform-specific native bindings. If you switch Node versions/architectures (e.g., Apple Silicon arm64 vs Rosetta x64) and see `Cannot find module @rollup/rollup-…`, delete `node_modules`, run `npm install`, and re-run your build so npm can reinstall the matching optional dependency. The root `optionalDependencies` list keeps both darwin builds declared explicitly for reproducible installs.

To run the same checks we expect in CI, execute:

```bash
./ci/local_check.sh
```

This script installs dependencies, type-checks the SPA, validates all skins, and runs the production build so you can catch issues before pushing.

The primary app lives under `apps/webchat-spa`. Example embeds live under `packages/embed-examples`.

## Repository layout

```
apps/
  webchat-spa/        React/Vite SPA + runtime bootstrap
    public/skins/     Tenant assets, skins, hooks, and HTML
packages/
  embed-examples/     Vanilla + React embedding samples
.github/workflows/    GitHub Pages deployment
```

## Runtime behavior

- Tenant resolution honors `?tenant=...`, then `<html data-tenant="...">`, and finally the first non-repo path segment (`/customera`, `/customerb/embed`, etc.).
- The SPA downloads `/skins/{tenant}/skin.json`, validates it with the shared Zod schema, and loads asset files in parallel.
- Direct Line tokens are fetched at runtime from `greentic-messaging` using the `tokenUrl` inside the skin; nothing is embedded during build.
- WebChat is loaded from the official CDN and rendered with tenant style options + Adaptive Cards host config.
- Optional `hooks.js` modules can register store middleware or run pre-render logic.
- Full-page skins stream their own HTML/CSS shell; widget mode renders the lightweight SPA layout.

## Skins & docs

- [`docs/skins.md`](docs/skins.md) – how to add tenants, assets, and hooks.
- [`docs/embedding.md`](docs/embedding.md) – snippets for loading the widget from third-party sites.
- [`docs/pages.md`](docs/pages.md) – CI/CD + custom domain instructions.

### Tenant & Base Path Resolution (GitHub Pages friendly)

Deployments now load a tiny `public/js/tenant-resolver.js` helper before any other script. It sets two globals that every runtime consumer can rely on:

1. `window.__TENANT__` respects `?tenant=cisco`, then `<html data-tenant="cisco">`, and finally falls back to the first path segment **after** the repo slug (so `/greentic-webchat/cisco` correctly resolves to `cisco` instead of `greentic-webchat`). Default fallback remains `_template`.
2. `window.__BASE_PATH__` honors `<base href="...">` when present, otherwise it becomes `/greentic-webchat/` on GitHub Pages and `/` in local/dev environments.

Every skin/style/adaptive-card fetch now uses the base path:

```ts
const url = `${window.__BASE_PATH__}skins/${encodeURIComponent(window.__TENANT__!)}/skin.json`;
const skin = await (await fetch(url)).json();
```

The resolver also exposes `window.__loadSkin__()` for standalone demos if you need to pull a tenant skin without booting the full SPA.

#### Manual QA checklist

- **Local:** `npm run dev` → open `http://localhost:5173/?tenant=cisco` and verify the Cisco skin loads without console errors; `window.__TENANT__ === 'cisco'` and `window.__BASE_PATH__ === '/'`.
- **Local attribute override:** remove the query string and add `<html data-tenant="customera">` (or load from a static file) – the Customer A skin should load.
- **GitHub Pages:** visit `https://greentic-ai.github.io/greentic-webchat/cisco` and confirm the Cisco skin renders, `window.__TENANT__ === 'cisco'`, and `window.__BASE_PATH__ === '/greentic-webchat/'`.
- **GitHub Pages with query:** `https://greentic-ai.github.io/greentic-webchat/cisco?tenant=customerb` should render Customer B while keeping the `/cisco` path, again with `/greentic-webchat/` as the base path.
- Console should not show “Unable to load skin” errors in any scenario.

## GitHub Pages

`.github/workflows/pages.yaml` runs on every push to `main`, validates skins, builds the SPA, and deploys `/apps/webchat-spa/dist` to the Pages environment. The build copies `index.html` to `404.html` so deep links resolve without server routing.
