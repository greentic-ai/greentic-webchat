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

- Tenant is derived from the first URL segment (`/customera`, `/customerb/embed`, etc.).
- The SPA downloads `/skins/{tenant}/skin.json`, validates it with the shared Zod schema, and loads asset files in parallel.
- Direct Line tokens are fetched at runtime from `greentic-messaging` using the `tokenUrl` inside the skin; nothing is embedded during build.
- WebChat is loaded from the official CDN and rendered with tenant style options + Adaptive Cards host config.
- Optional `hooks.js` modules can register store middleware or run pre-render logic.
- Full-page skins stream their own HTML/CSS shell; widget mode renders the lightweight SPA layout.

## Skins & docs

- [`docs/skins.md`](docs/skins.md) – how to add tenants, assets, and hooks.
- [`docs/embedding.md`](docs/embedding.md) – snippets for loading the widget from third-party sites.
- [`docs/pages.md`](docs/pages.md) – CI/CD + custom domain instructions.

## GitHub Pages

`.github/workflows/pages.yaml` runs on every push to `main`, validates skins, builds the SPA, and deploys `/apps/webchat-spa/dist` to the Pages environment. The build copies `index.html` to `404.html` so deep links resolve without server routing.
