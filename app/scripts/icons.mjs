// Génère les icônes PNG à partir de public/logo.svg : npm run icons
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const pub = new URL('../public/', import.meta.url).pathname;
const logo = readFileSync(`${pub}logo.svg`, 'utf-8');
// Icône pleine, sans coins arrondis : le système applique son propre masque.
const square = logo.replace('rx="104"', 'rx="0"');
// Zone de sécurité des icônes adaptatives : le dessin tient dans les 80 % centraux.
const maskable = square.replace('</title>', '</title><rect width="512" height="512" fill="#1D2640"/><g transform="translate(51 51) scale(.8)">').replace('</svg>', '</g></svg>');

const targets = [
  ['pwa-192.png', 192, logo],
  ['pwa-512.png', 512, logo],
  ['pwa-maskable-512.png', 512, maskable],
  ['apple-touch-icon.png', 180, square]
];

const browser = await chromium.launch();
for (const [file, size, svg] of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  await page.screenshot({ path: `${pub}${file}`, omitBackground: true });
  await page.close();
}
await browser.close();
