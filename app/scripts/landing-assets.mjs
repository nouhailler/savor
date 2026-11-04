// Ressources de la page de présentation (public/decouvrir/) : polices, icônes et vraies captures de l'application.
// Usage : npm run build && npm run landing:assets && npm run build
import { spawn } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { chromium, devices } from '@playwright/test';
import * as Icons from '@phosphor-icons/react/dist/ssr';

const root = new URL('../', import.meta.url).pathname;
const out = `${root}public/decouvrir/`;
for (const dir of ['fonts', 'img']) mkdirSync(`${out}${dir}`, { recursive: true });

// Polices déjà utilisées par l'application, copiées pour que la page n'ait aucun JavaScript à charger.
const fonts = [
  ['cormorant-garamond', 'cormorant-garamond-latin-500-normal'],
  ['cormorant-garamond', 'cormorant-garamond-latin-500-italic'],
  ['source-sans-3', 'source-sans-3-latin-400-normal'],
  ['source-sans-3', 'source-sans-3-latin-600-normal']
];
for (const [pkg, file] of fonts) copyFileSync(`${root}node_modules/@fontsource/${pkg}/files/${file}.woff2`, `${out}fonts/${file}.woff2`);

// Planche d'icônes Phosphor, les mêmes que dans l'application.
const sprite = {
  'soi-meme': 'User', relations: 'UsersThree', communication: 'ChatCircleText', usages: 'HandWaving', recevoir: 'ForkKnife', fetes: 'Confetti', voyager: 'Suitcase', etranger: 'GlobeHemisphereWest',
  search: 'MagnifyingGlass', library: 'Books', book: 'BookBookmark', quiz: 'Exam', review: 'ArrowsClockwise', bookmark: 'BookmarkSimple', link: 'LinkSimple', offline: 'WifiSlash', device: 'DeviceMobile', lock: 'LockKey', compass: 'Compass', arrow: 'ArrowRight'
};
const symbols = Object.entries(sprite).map(([id, name]) => {
  const inner = renderToStaticMarkup(createElement(Icons[name], { weight: 'light' })).replace(/^<svg[^>]*>|<\/svg>$/g, '');
  return `<symbol id="${id}" viewBox="0 0 256 256">${inner}</symbol>`;
});
writeFileSync(`${out}icons.svg`, `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>\n`);

// Captures réelles, depuis la version de production.
const base = 'http://localhost:4193';
const server = spawn('npx', ['vite', 'preview', '--port', '4193', '--strictPort'], { stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 2500));

async function enter(page) {
  await page.goto(`${base}/`);
  await page.getByRole('button', { name: 'Passer la présentation' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.waitForTimeout(500);
}

async function shoot(page, route, name) {
  await page.goto(`${base}/#${route}`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${out}img/${name}.jpg`, type: 'jpeg', quality: 74 });
}

const browser = await chromium.launch();
try {
  const desktop = await browser.newContext({ viewport: { width: 1100, height: 720 }, locale: 'fr-FR' });
  const dp = await desktop.newPage();
  await enter(dp);
  await shoot(dp, '/lecons/l-4-1-4', 'lecon');
  await shoot(dp, '/recherche?q=tutoiement', 'recherche');
  await shoot(dp, '/situations/s-4-1', 'situation');
  await shoot(dp, '/dictionnaire', 'dictionnaire');
  await shoot(dp, '/culture/japon', 'pays');

  const mobile = await browser.newContext({ ...devices['Pixel 7'], deviceScaleFactor: 1.5, locale: 'fr-FR' });
  const mp = await mobile.newPage();
  await enter(mp);
  await shoot(mp, '/apprendre', 'mobile-domaines');

  // Image de partage : le haut de la page de présentation elle-même.
  const og = await browser.newContext({ viewport: { width: 1200, height: 630 }, locale: 'fr-FR' });
  const op = await og.newPage();
  const res = await op.goto(`${base}/decouvrir/`);
  if (res?.ok()) {
    await op.waitForTimeout(500);
    await op.screenshot({ path: `${out}og.jpg`, type: 'jpeg', quality: 80 });
  }
} finally {
  await browser.close();
  process.kill(-server.pid);
}
