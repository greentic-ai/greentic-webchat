import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { skinSchema } from '../apps/webchat-spa/shared/skin-schema.mjs';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const publicDir = path.join(repoRoot, 'apps', 'webchat-spa', 'public');
const skinsDir = path.join(publicDir, 'skins');

async function readJson(file) {
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw);
}

function ensureFileExists(relativeUrl) {
  if (/^https?:/i.test(relativeUrl)) {
    return Promise.resolve();
  }
  if (!relativeUrl.startsWith('/')) {
    throw new Error(`Path must be absolute from /skins: ${relativeUrl}`);
  }
  const filePath = path.join(publicDir, relativeUrl.replace(/^\//, ''));
  return fs.access(filePath);
}

async function validateSkin(dir) {
  const skinPath = path.join(skinsDir, dir, 'skin.json');
  const json = await readJson(skinPath);
  const parsed = skinSchema.parse(json);

  await Promise.all([
    ensureFileExists(parsed.brand.favicon),
    ensureFileExists(parsed.brand.logo),
    ensureFileExists(parsed.webchat.styleOptions),
    ensureFileExists(parsed.webchat.adaptiveCardsHostConfig),
    ensureFileExists(parsed.fullpage.index),
    ensureFileExists(parsed.fullpage.css),
    parsed.hooks?.script ? ensureFileExists(parsed.hooks.script) : Promise.resolve()
  ]);
}

async function main() {
  const entries = await fs.readdir(skinsDir);
  const filtered = entries.filter((name) => !name.startsWith('.'));
  const failures = [];

  await Promise.all(
    filtered.map(async (dir) => {
      try {
        await validateSkin(dir);
        console.log(`✓ ${dir}`);
      } catch (error) {
        failures.push(`${dir}: ${error.message}`);
      }
    })
  );

  if (failures.length) {
    console.error('Skin validation failed:\n' + failures.join('\n'));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error while validating skins', error);
  process.exit(1);
});
