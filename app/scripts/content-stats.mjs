// Bilan chiffré des contenus rédigés : npm run content:stats
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src/content/', import.meta.url).pathname;
const json = (p) => JSON.parse(readFileSync(p, 'utf-8'));
const files = (d) => (existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.json')).map((f) => join(d, f)) : []);
const words = (v) => (typeof v === 'string' ? v.split(/\s+/).filter(Boolean).length : Array.isArray(v) ? v.reduce((n, x) => n + words(x), 0) : v && typeof v === 'object' ? Object.values(v).reduce((n, x) => n + words(x), 0) : 0);

let lessons = 0, questions = 0, total = 0;
const rows = [];
for (const dir of readdirSync(join(root, 'lessons'))) {
  const list = files(join(root, 'lessons', dir)).map(json);
  lessons += list.length;
  questions += list.reduce((n, l) => n + l.quiz.questions.length, 0);
  const w = list.reduce((n, l) => n + words(l), 0);
  total += w;
  rows.push(`${dir.padEnd(16)} ${String(list.length).padStart(3)} leçons  ${String(w).padStart(7)} mots  ${list.length ? Math.round(w / list.length) : 0} mots/leçon`);
}
const flat = (d) => files(join(root, d)).flatMap(json);
console.log(rows.join('\n'));
console.log(`\nLeçons : ${lessons} (${total} mots) · Questions : ${questions}`);
console.log(`Scénarios : ${flat('scenarios').length} · Fiches : ${flat('sheets').length} · Définitions : ${flat('dictionary').length} · Pays : ${files(join(root, 'countries')).length}`);
