# GitHub Pages deployment

The `apps/webchat-spa` Vite project is deployed to GitHub Pages automatically:

1. Every push to `main` triggers `.github/workflows/pages.yaml`.
2. The workflow installs dependencies, validates all skins, and runs `npm run build`.
3. The Vite `public/` directory is copied into `dist` (including `skins/**`).
4. `actions/upload-pages-artifact` publishes `apps/webchat-spa/dist`.
5. `actions/deploy-pages` releases the artifact to the `github-pages` environment.

Because the site is an SPA the build pipeline copies `dist/index.html` to `dist/404.html`, giving us a fallback for routes such as `/customera` or `/customera/embed`.

## Custom domain (optional)

1. Configure your DNS to create a `CNAME` pointing your custom domain (e.g. `chat.greentic.ai`) to `<org>.github.io`.
2. In the repo settings → Pages, set the custom domain and enable HTTPS.
3. Add a `CNAME` file inside `apps/webchat-spa/public` with the domain name if you want it committed.
4. Update documentation and any embedding examples to use the new host.
