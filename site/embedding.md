# Embedding WebChat

Every tenant skin is available at `https://<org>.github.io/greentic-webchat/{tenant}` for the full-page experience and `/{tenant}/embed` for the widget layout. Third parties can embed the widget by loading BotFramework-WebChat from the official CDN, fetching a Direct Line token from `greentic-messaging`, and calling `WebChat.renderWebChat`.

## Vanilla JavaScript

```html
<script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
<script type="module">
  const site = 'https://<org>.github.io/greentic-webchat';
  const tenant = 'customera';
  const skin = await fetch(`${site}/skins/${tenant}/skin.json`).then(r => r.json());
  const [token, styleOptions, hostConfig] = await Promise.all([
    fetch(skin.directLine.tokenUrl).then(r => r.json()).then(j => j.token),
    fetch(`${site}${skin.webchat.styleOptions}`).then(r => r.json()),
    fetch(`${site}${skin.webchat.adaptiveCardsHostConfig}`).then(r => r.json())
  ]);
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
    styleOptions,
    adaptiveCardsHostConfig: hostConfig,
    locale: skin.webchat.locale
  }, document.getElementById('chat'));
</script>
```

See `packages/embed-examples/vanilla` for a working sample.

## React example

`packages/embed-examples/react` exposes a tiny `WebChatEmbed` component that downloads the tenant skin at runtime and renders it once the CDN script is ready. Run it locally with:

```bash
cd packages/embed-examples/react
npm install
npm run dev
```

Use the `VITE_WEBCHAT_SITE` env var to point at a staging deployment if you are not using GitHub Pages.

## Token endpoint & CORS

- Tokens must always come from `greentic-messaging`; never bake secrets into this repo.
- CORS should allow `https://<org>.github.io` so that Pages can fetch tokens directly from the browser.
- Tokens are short lived; the SPA always fetches a fresh token when the page loads.
