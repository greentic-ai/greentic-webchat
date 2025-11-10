# Cisco Web Chat Demo

## Inject a Direct Line token
- The demo currently injects `window.__DIRECT_LINE_TOKEN__ = "cisco_demo_token"` inside `index.html` for the Cisco customer showcase.
- To use a different bot instance, replace that value or inject your own snippet before the closing `</body>` tag:

  ```html
  <script>window.__DIRECT_LINE_TOKEN__ = "YOUR_TOKEN_HERE";</script>
  ```

## Serve locally

```bash
npm run sync:cisco   # copies this demo under docs/cisco for GitHub Pages
cd docs
python3 -m http.server 8080
# open http://localhost:8080/cisco
```

## Notes
- Cisco logo assets live under `./assets/` and the PNG (`cisco-logo@2x.png`) can replace the inline SVG if needed for older environments.
- Cisco logo and favicon used with permission for demo purposes.
