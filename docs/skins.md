# Skins

This repository treats every customer experience as a "skin" that lives under `apps/webchat-spa/public/skins/{tenant}`. A skin contains:

- `skin.json`: metadata used by the SPA at runtime and by the validator at build time
- `assets/`: images such as logo, favicon, hero artwork
- `webchat/`: WebChat specific overrides (style options, Adaptive Cards host config, optional hooks script)
- `fullpage/`: HTML + CSS files for full page mode

## Creating a new tenant

1. Copy the `_template` folder into a new directory named after your tenant.
2. Update `skin.json`:
   - Ensure the `tenant` value matches the directory name.
   - Point every path to your new asset (remember to keep leading `/skins/...`).
   - Set `mode` to either `fullpage` or `widget`.
   - Update the `directLine.tokenUrl` to the URL exposed by greentic-messaging.
3. Replace the logo, favicon, and hero art inside `assets/`.
4. Customize the WebChat experience by editing `webchat/styleOptions.json` and `webchat/hostconfig.json`.
5. (Optional) Update `webchat/hooks.js` to inject store middleware or run code before render. The module can export:

```js
export function createStoreMiddleware() {
  return () => next => action => next(action);
}

export function onBeforeRender(context) {
  console.log('Ready to render', context.tenant);
}
```

6. For full page tenants, edit `fullpage/index.html` and `fullpage/page.css` to match the customer's look.
7. Run `npm run validate:skins` to ensure your skin passes schema + existence checks.
8. Commit and push—GitHub Pages will pick up the new folder automatically.

## Validation rules

- All paths in `skin.json` must start with `/skins/` so that GitHub Pages can serve them correctly.
- The validator confirms that favicon, logos, style option files, host config, hooks, and full-page templates all exist.
- Failing validation will break the CI build, so fix issues locally before opening a PR.
