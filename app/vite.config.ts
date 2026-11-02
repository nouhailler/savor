/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

// Index compilé des leçons : les listes et la recherche ne chargent ainsi pas le corps des leçons,
// qui reste découpé en morceaux à la demande.
function lessonIndex(): Plugin {
  const root = new URL('./src/content/lessons/', import.meta.url).pathname;
  const lessons = () =>
    readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .flatMap((d) => readdirSync(join(root, d.name)).filter((f) => f.endsWith('.json')).map((f) => join(root, d.name, f)))
      .map((f) => ({ file: f, data: JSON.parse(readFileSync(f, 'utf-8')) }));
  const modules: Record<string, () => unknown> = {
    'virtual:lesson-meta': () =>
      Object.fromEntries(lessons().map(({ data: l }) => [l.id, { summary: l.summary, estimatedDuration: l.estimatedDuration, tags: l.tags }])),
    'virtual:lesson-search': () =>
      Object.fromEntries(
        lessons().map(({ data: l }) => [
          l.id,
          { keyPoints: l.keyPoints, rules: l.rules.map((r: Record<string, string>) => ({ id: r.id, title: r.title, description: r.description, context: r.context })) }
        ])
      )
  };
  return {
    name: 'lesson-index',
    resolveId: (id) => (id in modules ? `\0${id}` : null),
    load(id) {
      const key = id.startsWith('\0') ? id.slice(1) : '';
      if (!(key in modules)) return null;
      for (const { file } of lessons()) this.addWatchFile(file);
      return `export default ${JSON.stringify(modules[key]())};`;
    }
  };
}

// Les contenus pédagogiques (JSON) sont découpés en morceaux chargés à la demande,
// puis tous précachés par le service worker : l'application reste utilisable hors ligne.
export default defineConfig({
  base: './',
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    lessonIndex(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: "L'Art du Savoir-Vivre",
        short_name: 'Savoir-Vivre',
        description: 'Encyclopédie interactive des bonnes manières, de l’élégance et des relations sociales.',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#FAF7F0',
        theme_color: '#1D2640',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true
      },
      devOptions: { enabled: false }
    })
  ],
  build: {
    chunkSizeWarningLimit: 900
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    testTimeout: 20000
  }
});
