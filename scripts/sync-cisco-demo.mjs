import { cpSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('.');
const source = resolve(root, 'demos/cisco');
const destination = resolve(root, 'docs/cisco');

if (!existsSync(source)) {
  console.error('Missing source directory:', source);
  process.exit(1);
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });

console.log('Synced Cisco demo from', source, 'to', destination);
