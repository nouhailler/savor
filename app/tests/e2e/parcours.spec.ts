import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { extname, join, normalize } from 'node:path';

async function finishOnboarding(page: Page) {
  await page.getByRole('button', { name: 'Passer la présentation' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

async function accept(page: Page) {
  await page.goto('/');
  await finishOnboarding(page);
}

const ROUTES = [
  '/', '/presentation', '/apprendre', '/apprendre/usages', '/bibliotheque', '/lecons/l-4-1-2', '/lecons/l-4-1-2/quiz', '/evaluations',
  '/evaluations/usages/initial', '/situations', '/situations/s-2-2', '/guide', '/guide/f-presenter-deux-personnes', '/dictionnaire', '/dictionnaire/d-tact',
  '/culture', '/culture/japon', '/recherche?q=japon', '/favoris', '/progression', '/revisions', '/parametres', '/systeme', '/a-propos', '/mentions-legales'
];

test('premier lancement : accueil par étapes, acceptation obligatoire, mémorisation, puis réapparition après effacement', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Bienvenue dans L’Art du Savoir-Vivre' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('heading', { name: 'Votre parcours' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByRole('heading', { name: 'Sur votre appareil' })).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Installer l’application' })).toBeVisible();
  await page.getByRole('button', { name: 'Continuer' }).click();
  await expect(page.getByText('L’éditeur de l’application n’est pas responsable des données')).toBeVisible();
  const ok = page.getByRole('button', { name: 'J’ai compris' });
  await expect(ok).toBeDisabled();
  await page.getByRole('button', { name: 'Voir les détails' }).click();
  await expect(page.getByRole('heading', { name: 'Limitation de responsabilité' })).toBeVisible();
  await page.getByRole('button', { name: 'Revenir à l’avertissement' }).click();
  await page.getByRole('checkbox').check();
  await ok.click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Les huit domaines' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.evaluate(() => new Promise<void>((res) => { const r = indexedDB.deleteDatabase('savoir-vivre'); r.onsuccess = r.onerror = r.onblocked = () => res(); }));
  await page.reload();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('menu hamburger : catégories, navigation, fermeture au clavier et au retour', async ({ page }) => {
  await accept(page);
  const open = page.getByRole('button', { name: 'Ouvrir le menu' });
  await open.click();
  const menu = page.getByRole('dialog', { name: 'Menu' });
  for (const title of ['Découvrir', 'Apprendre', 'S’exercer', 'Consulter', 'Mon parcours', 'Application']) await expect(menu.getByText(title, { exact: true })).toBeVisible();
  await expect(menu.getByRole('button', { name: 'Fermer le menu' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(open).toBeFocused();
  await open.click();
  await page.goBack();
  await expect(menu).toHaveCount(0);
  await open.click();
  await menu.getByRole('link', { name: 'Dictionnaire' }).click();
  await expect(menu).toHaveCount(0);
  await expect(page).toHaveURL(/#\/dictionnaire$/);
  await page.goBack();
  await expect(menu).toHaveCount(0);
  await expect(page).toHaveURL(/:\d+\/(#\/)?$/);
});

test('installation : invite du navigateur si elle existe, explications sinon', async ({ page }) => {
  await accept(page);
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  await page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'Installer l’application' }).click();
  await expect(page.getByRole('heading', { name: 'Installer l’application' })).toBeVisible();
  await page.getByRole('button', { name: 'J’ai compris comment faire' }).click();
  await page.evaluate(() => {
    const e = new Event('beforeinstallprompt', { cancelable: true }) as Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };
    e.prompt = async () => { (window as unknown as { promptCalled: boolean }).promptCalled = true; };
    e.userChoice = Promise.resolve({ outcome: 'accepted' });
    window.dispatchEvent(e);
  });
  await page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'Installer l’application' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { promptCalled?: boolean }).promptCalled)).toBe(true);
  await expect(page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'Installer l’application' })).toHaveCount(0);
});

test('la mention de localisation est absente : l’application ne lit pas la position', async ({ page }) => {
  await accept(page);
  await page.goto('/#/mentions-legales');
  await expect(page.getByRole('heading', { name: 'Avertissement' })).toBeVisible();
  await expect(page.getByText('Précision de la localisation')).toHaveCount(0);
});

test('leçon : terminer, ajouter aux favoris, retrouver après rechargement', async ({ page }) => {
  await accept(page);
  await page.goto('/#/lecons/l-4-1-2');
  await page.getByRole('button', { name: /Ajouter aux favoris : Saluer et prendre congé/ }).click();
  await page.getByRole('button', { name: 'Marquer comme terminée' }).click();
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.getByRole('button', { name: /Terminée — annuler/ })).toBeVisible();
  await page.goto('/#/favoris');
  await expect(page.getByRole('link', { name: /Saluer et prendre congé/ })).toBeVisible();
  await page.getByRole('button', { name: /Retirer « Saluer et prendre congé »/ }).click();
  await expect(page.getByText('Rien de marqué ici pour l’instant')).toBeVisible();
  await page.goto('/#/progression');
  await expect(page.getByText('Saluer et prendre congé').first()).toBeVisible();
});

test('quiz : correction détaillée, résultat conservé, question à réviser', async ({ page }) => {
  await accept(page);
  await page.goto('/#/lecons/l-4-1-2/quiz');
  for (let i = 0; i < 5; i++) {
    await page.locator('.choice').first().click();
    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    await expect(page.locator('.feedback')).toBeVisible();
    await page.getByRole('button', { name: /Question suivante|Voir la correction/ }).click();
  }
  await expect(page.getByRole('heading', { name: 'Correction détaillée' })).toBeVisible();
  await page.waitForTimeout(400);
  await page.goto('/#/revisions');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Questions échouées' })).toBeVisible();
});

test('situation ramifiée : la décision modifie la suite', async ({ page }) => {
  await accept(page);
  await page.goto('/#/situations/s-5-4');
  await page.getByRole('radio', { name: /Bonsoir Ana, bienvenue/ }).click();
  await expect(page.getByText('Ana n’a rien fait.')).toBeVisible();
  await page.getByRole('button', { name: 'La suite' }).click();
  await expect(page.getByText('je ne mange pas de porc')).toBeVisible();
  await page.getByRole('radio', { name: /je vous prépare une belle omelette/ }).click();
  await expect(page.getByText('La règle en jeu')).toBeVisible();
});

test('évaluation : niveau évalué avec situations', async ({ page }) => {
  await accept(page);
  await page.goto('/#/evaluations/usages/final/beginner');
  await expect(page.getByText(/Seuil : 70/)).toBeVisible();
  await expect(page.getByText(/Question 1 sur/)).toBeVisible();
});

test('recherche, dictionnaire et fiches sans accent', async ({ page }) => {
  await accept(page);
  await page.goto('/#/recherche');
  await page.getByRole('searchbox').fill('condoleances');
  await expect(page.getByRole('link', { name: /Comment présenter ses condoléances/ })).toBeVisible();
  await page.goto('/#/dictionnaire');
  await page.getByRole('searchbox').fill('preseance');
  await expect(page.getByRole('link', { name: /Préséance/ })).toBeVisible();
});

test('paramètres : thème, taille, export, réinitialisation', async ({ page }) => {
  await accept(page);
  await page.goto('/#/parametres');
  await page.getByRole('radio', { name: 'Sombre' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('radio', { name: 'Très grande' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-scale', 'xlarge');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exporter', exact: true }).click()]);
  expect(dl.suggestedFilename()).toMatch(/^savoir-vivre-progression-.*\.json$/);
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('restauration : une sauvegarde exportée rétablit les données effacées', async ({ page }) => {
  await accept(page);
  await page.goto('/#/lecons/l-4-1-2');
  await page.getByRole('button', { name: /favoris/i }).first().click();
  await page.waitForTimeout(400);
  await page.goto('/#/parametres');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exporter', exact: true }).click()]);
  const backup = readFileSync(await dl.path());
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Tout effacer' }).click();
  await expect(page.getByText('Données effacées')).toBeVisible();
  await page.reload();
  await finishOnboarding(page);
  await page.goto('/#/favoris');
  await expect(page.locator('main a[href*="l-4-1-2"]')).toHaveCount(0);
  await page.goto('/#/parametres');
  await page.locator('input[type=file]').setInputFiles({ name: 'sauvegarde.json', mimeType: 'application/json', buffer: backup });
  await expect(page.getByText('Progression restaurée')).toBeVisible();
  await page.waitForTimeout(400);
  await page.reload();
  await page.goto('/#/favoris');
  await expect(page.locator('main a[href*="l-4-1-2"]').first()).toBeVisible();
});

test('clavier : le quiz se parcourt sans souris, avec un focus visible', async ({ page }) => {
  await accept(page);
  await page.goto('/#/lecons/l-4-1-2/quiz');
  await page.locator('.choice').first().waitFor();
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => document.activeElement?.classList.contains('choice'))) break;
  }
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page.locator('.choice.selected')).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Valider ma réponse' })).toBeEnabled();
  await page.getByRole('button', { name: 'Valider ma réponse' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.feedback')).toBeVisible();
});

test('hors ligne : contenus, recherche et progression disponibles après mise en cache', async ({ page, context }) => {
  await accept(page);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.waitForTimeout(800);
  await context.setOffline(true);
  await page.goto('/#/lecons/l-8-2-6');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Asie orientale' })).toBeVisible();
  await page.getByRole('button', { name: 'Marquer comme terminée' }).click();
  await page.goto('/#/recherche');
  await page.getByRole('searchbox').fill('japon');
  await expect(page.getByRole('link', { name: /^Fiche pays/ })).toBeVisible();
  await page.goto('/#/culture/maroc');
  await expect(page.getByRole('heading', { name: 'Maroc', level: 1 })).toBeVisible();
  await page.goto('/#/lecons/l-4-1-3/quiz');
  await expect(page.getByText('Question 1 sur 5')).toBeVisible();
  await context.setOffline(false);
});

test('PWA : manifeste installable et service worker', async ({ page, request }) => {
  await accept(page);
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const res = await request.get(`/${href!.replace('./', '')}`);
  const m = await res.json();
  expect(m.name).toBe("L'Art du Savoir-Vivre");
  expect(m.display).toBe('standalone');
  expect(m.icons.some((i: { sizes: string }) => i.sizes === '512x512')).toBe(true);
  expect((await request.get('/sw.js')).ok()).toBe(true);
});

test('aucun appel réseau vers un tiers', async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on('request', (r) => { if (!r.url().startsWith(baseURL!) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
  await accept(page);
  for (const r of ['/#/lecons/l-4-1-2', '/#/culture/japon', '/#/recherche?q=tact']) { await page.goto(r); await page.waitForTimeout(150); }
  expect(external).toEqual([]);
});

for (const route of ROUTES) {
  test(`affichage sans débordement ni erreur : ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await accept(page);
    await page.goto(`/#${route}`);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'débordement horizontal').toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

for (const [route, theme] of [['/', 'light'], ['/lecons/l-4-1-2', 'light'], ['/lecons/l-4-1-2', 'dark'], ['/situations/s-2-2', 'light'], ['/lecons/l-4-1-2/quiz', 'light'], ['/culture/japon', 'light'], ['/parametres', 'dark'], ['/dictionnaire', 'light'], ['/progression', 'light'], ['/guide/f-presenter-deux-personnes', 'light']] as const) {
  test(`accessibilité WCAG AA (axe) : ${route} ${theme}`, async ({ page }) => {
    await accept(page);
    if (theme === 'dark') {
      await page.goto('/#/parametres');
      await page.getByRole('radio', { name: 'Sombre' }).click();
      await page.waitForTimeout(350);
    }
    await page.goto(`/#${route}`);
    await page.waitForTimeout(600);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const summary = results.violations.map((v) => `${v.id} (${v.nodes.length}) : ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
    expect(summary).toEqual([]);
  });
}

test.describe('mises à jour', () => {
  // Serveur dédié : on publie une « nouvelle version » en changeant le service worker servi.
  const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
  let server: Server;
  let origin = '';
  let release = '';

  test.beforeAll(async () => {
    const dist = join(process.cwd(), 'dist');
    server = createServer((req, res) => {
      const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]));
      try {
        const body = readFileSync(join(dist, path === '/' ? 'index.html' : path));
        res.writeHead(200, { 'content-type': MIME[extname(path) || '.html'] ?? 'application/octet-stream', 'cache-control': 'no-store' });
        res.end(path.endsWith('sw.js') ? Buffer.concat([body, Buffer.from(release)]) : body);
      } catch {
        res.writeHead(404).end();
      }
    });
    await new Promise<void>((done) => server.listen(0, () => done()));
    const address = server.address();
    origin = `http://localhost:${typeof address === 'object' && address ? address.port : 0}`;
  });

  test.afterAll(() => { server.close(); });

  test.beforeEach(() => { release = ''; });

  async function open(page: Page) {
    await page.goto(`${origin}/`);
    await finishOnboarding(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    // Le service worker ne prend la main qu'à la visite suivante.
    await page.waitForTimeout(400);
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  }

  test('paramètres système : dates, vérification, nouvelle version détectée et installée en quittant', async ({ page }) => {
    await open(page);
    await page.goto(`${origin}/#/systeme`);
    await expect(page.getByText('Date de sortie')).toBeVisible();
    await page.getByRole('button', { name: 'Vérifier les mises à jour' }).click();
    await expect(page.getByTestId('update-status')).toHaveText('Vous avez la dernière version.');
    await expect(page.getByTestId('last-check')).not.toHaveText('Jamais');

    release = '\n// nouvelle version';
    await page.getByRole('button', { name: 'Vérifier les mises à jour' }).click();
    await expect(page.getByText('Une nouvelle version est prête', { exact: false }).first()).toBeVisible({ timeout: 20000 });

    // Quitter l'application installe la version téléchargée, sans action de l'utilisateur.
    await page.evaluate(() => { (window as unknown as { avant: boolean }).avant = true; });
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => !(window as unknown as { avant?: boolean }).avant, undefined, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Paramètres système' })).toBeVisible();
    await expect(page.getByText('Une nouvelle version est prête', { exact: false })).toHaveCount(0);
  });

  test('une nouvelle version n’interrompt pas un quiz en cours', async ({ page }) => {
    await open(page);
    await page.goto(`${origin}/#/systeme`);
    release = '\n// nouvelle version';
    await page.getByRole('button', { name: 'Vérifier les mises à jour' }).click();
    await expect(page.getByText('Une nouvelle version est prête', { exact: false }).first()).toBeVisible({ timeout: 20000 });
    await page.goto(`${origin}/#/lecons/l-4-1-2/quiz`);
    await page.locator('.choice').first().click();
    await page.evaluate(() => {
      (window as unknown as { avant: boolean }).avant = true;
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(1500);
    expect(await page.evaluate(() => (window as unknown as { avant?: boolean }).avant)).toBe(true);
    await expect(page.locator('.choice.selected')).toHaveCount(1);
  });

  test('forcer la mise à jour : la progression est conservée', async ({ page }) => {
    await open(page);
    await page.goto(`${origin}/#/lecons/l-4-1-2`);
    await page.getByRole('button', { name: /favoris/i }).first().click();
    await page.waitForTimeout(400);
    await page.goto(`${origin}/#/systeme`);
    await page.evaluate(() => { (window as unknown as { avant: boolean }).avant = true; });
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: 'Forcer la mise à jour' }).click();
    await page.waitForFunction(() => !(window as unknown as { avant?: boolean }).avant, undefined, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Paramètres système' })).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.goto(`${origin}/#/favoris`);
    await expect(page.locator('main a[href*="l-4-1-2"]').first()).toBeVisible();
  });

  test('forcer la mise à jour sans réseau ne casse rien', async ({ page, context }) => {
    await open(page);
    await page.goto(`${origin}/#/systeme`);
    await expect(page.getByRole('heading', { name: 'Paramètres système' })).toBeVisible();
    await context.setOffline(true);
    await expect(page.getByRole('button', { name: 'Forcer la mise à jour' })).toBeDisabled();
    await page.getByRole('button', { name: 'Vérifier les mises à jour' }).click();
    await expect(page.getByTestId('update-status')).toContainText('Pas de connexion');
    await page.goto(`${origin}/#/lecons/l-4-1-2`);
    await expect(page.locator('main h1').first()).toBeVisible();
    await context.setOffline(false);
  });
});
