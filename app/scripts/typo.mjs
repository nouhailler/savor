// Typographie française : espaces insécables devant : ; ? ! » et après «, dans tous les contenus.
// À lancer après rédaction : npm run content:typo
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src/content/', import.meta.url).pathname;
const NBSP = ' ';
const NNBSP = ' ';
const fix = (s) =>
  s
    .replace(/« +/g, `«${NBSP}`)
    .replace(/ +»/g, `${NBSP}»`)
    .replace(/ +([;?!])/g, `${NNBSP}$1`)
    .replace(/ +:/g, `${NBSP}:`)
    .replace(/(\d) (%|€|km|min\b|h\b)/g, `$1${NBSP}$2`)
    .replace(/\bn° /g, `n°${NBSP}`);
const walk = (v) => (typeof v === 'string' ? fix(v) : Array.isArray(v) ? v.map(walk) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)])) : v);
const files = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : p.endsWith('.json') ? [p] : []; });

let changed = 0;
for (const f of files(root)) {
  const raw = readFileSync(f, 'utf-8');
  const out = `${JSON.stringify(walk(JSON.parse(raw)), null, 2)}\n`;
  if (out !== raw) { writeFileSync(f, out); changed++; }
}
console.log(`${changed} fichiers normalisés.`);
