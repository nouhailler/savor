// La page de présentation est du HTML statique : ce test empêche ses affirmations de s'écarter du contenu réel.
import html from '../../public/decouvrir/index.html?raw';
import iconsSvg from '../../public/decouvrir/icons.svg?raw';
import { beforeAll, describe, expect, it } from 'vitest';
import { availableLessonCount, countries, dictionary, domains, scenarios, sheets } from '../services/content';
import { CONVENTION_HELP, CONVENTION_LABEL } from '../utils/labels';

// Liste des fichiers de public/ : ils ne sont pas chargés, seule leur présence compte.
const publicFiles = Object.keys(import.meta.glob('/public/**/*'));
const exists = (path: string) => publicFiles.includes(path);
const APP = 'https://savor.swinux.ch/';
let doc: Document;
const clean = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();

beforeAll(() => {
  doc = new DOMParser().parseFromString(html, 'text/html');
});

describe('page de présentation', () => {
  it('annonce les chiffres réels du contenu', () => {
    const expected: Record<string, number> = {
      domains: domains.length,
      lessons: availableLessonCount(),
      scenarios: scenarios.length,
      sheets: sheets.length,
      dictionary: dictionary.length,
      countries: countries.length
    };
    for (const [key, value] of Object.entries(expected)) {
      expect(doc.querySelector(`[data-count="${key}"]`)?.textContent, key).toBe(String(value));
    }
    expect(availableLessonCount()).toBe(domains.reduce((n, d) => n + d.lessons.length, 0));
    const meta = doc.querySelector('meta[name="description"]')?.getAttribute('content');
    expect(meta).toContain(`${availableLessonCount()} leçons`);
  });

  it('présente chaque domaine, avec sa description et son nombre de leçons', () => {
    const cards = [...doc.querySelectorAll<HTMLAnchorElement>('[data-domain]')];
    expect(cards.map((c) => c.dataset.domain).sort()).toEqual(domains.map((d) => d.slug).sort());
    for (const card of cards) {
      const domain = domains.find((d) => d.slug === card.dataset.domain)!;
      expect(card.getAttribute('href')).toBe(`${APP}#/apprendre/${domain.slug}`);
      expect(clean(card.textContent)).toContain(clean(domain.description));
      expect(clean(card.textContent)).toContain(`${domain.lessons.length} leçons`);
    }
  });

  it('ne cite que des situations existantes', () => {
    const cards = [...doc.querySelectorAll<HTMLAnchorElement>('[data-scenario]')];
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      const scenario = scenarios.find((s) => s.id === card.dataset.scenario);
      expect(scenario, card.dataset.scenario).toBeDefined();
      expect(card.getAttribute('href')).toBe(`${APP}#/situations/${scenario!.id}`);
      expect(clean(card.querySelector('h3')?.textContent)).toBe(clean(scenario!.title));
    }
  });

  it('reprend les statuts de règle affichés par l’application', () => {
    const rows = [...doc.querySelectorAll('[data-status]')].map((r) => [clean(r.querySelector('dt')?.textContent), clean(r.querySelector('dd')?.textContent)]);
    const app = Object.keys(CONVENTION_LABEL).map((k) => [clean(CONVENTION_LABEL[k as keyof typeof CONVENTION_LABEL]), clean(CONVENTION_HELP[k as keyof typeof CONVENTION_HELP])]);
    expect(rows).toEqual(app);
  });

  it('a des liens et des ressources valides', () => {
    for (const a of doc.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href')!;
      if (href.startsWith('#')) expect(doc.getElementById(href.slice(1)), href).not.toBeNull();
      else expect(href === 'https://github.com/nouhailler/savor' || href.startsWith(APP), href).toBe(true);
    }
    for (const el of doc.querySelectorAll('img[src], link[href]:not([rel="canonical"])')) {
      const file = el.getAttribute('src') ?? el.getAttribute('href')!;
      const path = file.startsWith('../') ? `/public/${file.slice(3)}` : `/public/decouvrir/${file}`;
      // Le manifeste est produit à la construction.
      if (!file.includes('manifest')) expect(exists(path), file).toBe(true);
    }
    for (const use of doc.querySelectorAll('use')) {
      const id = use.getAttribute('href')!.split('#')[1];
      expect(iconsSvg, id).toContain(`id="${id}"`);
    }
  });

  it('respecte les règles de la page : structure, images, aucun script, aucune preuve sociale', () => {
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelectorAll('script')).toHaveLength(0);
    for (const img of doc.querySelectorAll('img')) {
      expect(img.hasAttribute('alt'), img.getAttribute('src')!).toBe(true);
      expect(img.getAttribute('width')).toBeTruthy();
      expect(img.getAttribute('height')).toBeTruthy();
    }
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${APP}decouvrir/`);
    expect(doc.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(`${APP}decouvrir/og.jpg`);
    const text = clean(doc.body.textContent);
    expect(text).not.toMatch(/témoignage|avis clients?|utilisateurs satisfaits|intelligence artificielle|\bcoach|garanti|premium/i);
    expect(exists('/public/decouvrir/og.jpg')).toBe(true);
  });
});
