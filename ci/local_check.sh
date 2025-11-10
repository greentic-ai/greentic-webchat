#!/usr/bin/env bash
set -euo pipefail

export NODE_VERSION=20

echo "[local_check] npm ci (root)"
npm ci

echo "[local_check] npm ci (apps/webchat-spa)"
(
  cd apps/webchat-spa
  npm ci
)

echo "[local_check] typecheck + validate:skins"
(
  cd apps/webchat-spa
  npm run typecheck --if-present
)
(
  cd apps/webchat-spa
  npm run validate:skins --if-present || true
)

echo "[local_check] build SPA"
(
  cd apps/webchat-spa
  npm run build
)

echo "[local_check] assembling site/"
rm -rf site
mkdir -p site/js site/skins
[ -d docs ] && rsync -a docs/ site/
mkdir -p site/app
rsync -a apps/webchat-spa/dist/ site/app/

shopt -s nullglob
for index in demos/*/index.html; do
  tenant=$(basename "$(dirname "$index")")
  dest="site/${tenant}"
  mkdir -p "$dest"
  cp "$index" "$dest/index.html"
  python3 scripts/inject_tenant.py "$tenant" "$dest/index.html"
done

[ -e site/skins/cisco.json ] || cat > site/skins/cisco.json <<'JSON'
{ "theme":"cisco","brand":{"name":"Cisco","primary":"#005c9a","accent":"#00a0e0","text":"#0b1220"} }
JSON
[ -e site/skins/zain-kuwait.json ] || cat > site/skins/zain-kuwait.json <<'JSON'
{ "theme":"zain-kuwait","brand":{"name":"Zain Kuwait","primary":"#3A0F54","accent":"#E10098","highlight":"#8CC63F","text":"#111114"} }
JSON

echo "[local_check] OK — site/ ready."
echo "Try locally: python3 -m http.server -d site 8080"
