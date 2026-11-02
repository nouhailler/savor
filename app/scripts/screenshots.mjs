// Captures d'écran du README, depuis la version de production : npm run build && npm run screenshots
import { spawn } from 'node:child_process';
import { chromium, devices } from '@playwright/test';

const out = new URL('../docs/screenshots/', import.meta.url).pathname;
const base = 'http://localhost:4192';
const server = spawn('npx', ['vite', 'preview', '--port', '4192', '--strictPort'], { stdio: 'ignore', detached: true });
await new Promise((r) => setTimeout(r, 2500));

async function enter(page) {
  await page.goto(`${base}/`);
  await page.getByRole('button', { name: 'Passer la présentation' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await page.waitForTimeout(500);
}

async function shoot(page, name) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}${name}.png` });
}

const browser = await chromium.launch();

const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 }, locale: 'fr-FR' });
const dp = await desktop.newPage();
await dp.goto(`${base}/`);
await shoot(dp, 'onboarding');
await enter(dp);
await shoot(dp, 'accueil');
await dp.getByRole('button', { name: 'Ouvrir le menu' }).click();
await shoot(dp, 'menu');
await dp.goto(`${base}/#/lecons/l-4-3-3`);
await shoot(dp, 'lecon');
await dp.goto(`${base}/#/systeme`);
await shoot(dp, 'systeme');

const mobile = await browser.newContext({ ...devices['Pixel 7'], locale: 'fr-FR' });
const mp = await mobile.newPage();
await enter(mp);
await shoot(mp, 'mobile-accueil');
await mp.getByRole('button', { name: 'Ouvrir le menu' }).click();
await shoot(mp, 'mobile-menu');

await browser.close();
try {
  try {
  process.kill(-server.pid);
} catch {
  // Le serveur s'est déjà arrêté.
}
} catch {
  // Le serveur s'est déjà arrêté.
}
