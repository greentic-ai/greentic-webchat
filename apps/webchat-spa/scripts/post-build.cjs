#!/usr/bin/env node
const { copyFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const distDir = join(__dirname, '..', 'dist');
const indexFile = join(distDir, 'index.html');
const fallbackFile = join(distDir, '404.html');

if (existsSync(indexFile)) {
  copyFileSync(indexFile, fallbackFile);
  console.log('[post-build] Copied index.html -> 404.html for SPA fallback.');
} else {
  console.warn('[post-build] index.html not found; skipping fallback copy.');
}
