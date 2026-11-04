import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const APP = 'https://savor.swinux.ch/';

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

async function acceptApp(page: Page) {
  await page.getByRole('button', { name: 'Passer la présentation' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'J’ai compris' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

test.describe('page de présentation', () => {
  test('s’affiche sans erreur, sans script et sans débordement', async ({ page }) => {
    const errors = watchErrors(page);
    let scripts = 0;
    page.on('request', (r) => { if (r.resourceType() === 'script') scripts += 1; });
    await page.goto('/decouvrir/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Elle se cultive');
    await expect(page.getByRole('main').getByRole('link', { name: 'Explorer Savor' })).toBeInViewport();
    for (const y of [0, 2000, 4000, 8000]) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState('networkidle');
    const broken = await page.evaluate(() => [...document.images].filter((i) => { i.loading = 'eager'; return i.complete && !i.naturalWidth; }).map((i) => i.src));
    expect(broken).toEqual([]);
    expect(scripts).toBe(0);
    expect(errors).toEqual([]);
  });

  test('respecte les critères WCAG contrôlés par axe', async ({ page }) => {
    await page.goto('/decouvrir/');
    for (const details of await page.locator('details').all()) await details.locator('summary').click();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id} : ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
  });

  test('se parcourt au clavier : évitement, focus visible, FAQ', async ({ page }) => {
    await page.goto('/decouvrir/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused();
    await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeInViewport();
    const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
    expect(outline).not.toBe('none');
    const first = page.locator('details').first();
    await first.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('open', '');
  });

  test('le bouton secondaire mène aux thèmes, et chaque appel principal à l’application', async ({ page }) => {
    await page.goto('/decouvrir/');
    await page.getByRole('link', { name: 'Découvrir l’encyclopédie' }).click();
    await expect(page.locator('#themes')).toBeInViewport();
    for (const name of ['Explorer Savor', 'Découvrir Savor', 'Explorer l’encyclopédie']) {
      await expect(page.getByRole('main').getByRole('link', { name, exact: true }).first()).toHaveAttribute('href', APP);
    }
  });

  test('chaque lien vers l’application ouvre une vraie page', async ({ page }) => {
    await page.goto('/decouvrir/');
    const hrefs = await page.locator('a[href^="https://savor.swinux.ch/"]').evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')!))]);
    expect(hrefs.length).toBeGreaterThan(15);
    await page.goto('/');
    await acceptApp(page);
    for (const href of hrefs) {
      const hash = new URL(href).hash;
      await page.goto(`/${hash}`);
      await expect(page.getByRole('heading', { level: 1 }).first(), href).toBeVisible();
      await expect(page.getByText('Page introuvable', { exact: false }), href).toHaveCount(0);
    }
  });

  test('un visiteur arrivant par un lien profond retrouve sa page après l’avertissement', async ({ page }) => {
    await page.goto('/#/apprendre/usages');
    await acceptApp(page);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('usages', { ignoreCase: true });
  });

  test('référence les métadonnées, le manifeste et les icônes de l’application', async ({ page, request }) => {
    await page.goto('/decouvrir/');
    await expect(page).toHaveTitle(/^Savor — /);
    const manifestHref = await page.locator('link[rel="manifest"]').evaluate((l: HTMLLinkElement) => l.href);
    const manifest = await (await request.get(manifestHref)).json();
    expect(manifest.start_url).toBe('./');
    for (const icon of manifest.icons) expect((await request.get(new URL(icon.src, manifestHref).href)).ok(), icon.src).toBe(true);
    expect((await request.get('/decouvrir/og.jpg')).ok()).toBe(true);
  });

  test('cohabite avec le service worker : l’application et la page gardent chacune leur adresse, même hors ligne', async ({ page, context }) => {
    await page.goto('/');
    await acceptApp(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForTimeout(600);
    await page.reload();
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(1);

    await page.goto('/decouvrir/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Elle se cultive');
    expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(1);

    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Elle se cultive');
    await expect(page.locator('img.shot').first()).toHaveJSProperty('complete', true);
    await page.goto('/#/recherche');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeVisible();
    await context.setOffline(false);
  });
});
