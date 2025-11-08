#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

step() {
  echo "\n[local_check] $1\n"
}

step "Ensuring dependencies are installed"
npm install

step "Type checking webchat SPA"
npm run -w apps/webchat-spa typecheck

step "Validating tenant skins"
npm run validate:skins

step "Building SPA bundle"
npm run build
