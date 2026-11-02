# L'Art du Savoir-Vivre

Encyclopédie interactive des bonnes manières, de l'élégance et des relations sociales, pour adultes. Application web installable (PWA), utilisable hors ligne, sans compte ni serveur : la progression reste sur l'appareil.

**État : volumes de la première édition atteints (section 17 du cahier des charges), 86 leçons sur 158, contenus en attente de relecture humaine.** Voir [le rapport des fonctionnalités](docs/RAPPORT-FONCTIONNALITES.md) et [ce qui reste à faire](docs/RESTE-A-DEVELOPPER.md).

## Installation

Prérequis : Node.js 22.12 ou plus récent (vérifié avec Node 24) et npm.

```bash
npm install
```

```bash
npm run dev
```

L'application s'ouvre sur l'adresse indiquée par Vite. Le service worker n'est actif qu'en production.

## Production

```bash
npm run build
```

Le dossier `dist/` est un site statique, à servir en **HTTPS** : le service worker et l'installation l'exigent, sauf sur `localhost`. Les chemins sont relatifs et le routage passe par le fragment d'URL (`#/`) : aucune configuration de serveur n'est nécessaire, et l'application fonctionne aussi dans un sous-dossier. Pour Cloudflare, voir [le déploiement](docs/MAINTENANCE.md#déployer-sur-cloudflare).

Pour essayer le résultat en local :

```bash
npm run preview
```

**Avant une mise en ligne**, faites valider les mentions légales (`src/app/legal.ts`).

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Vérification TypeScript et build de production |
| `npm run preview` | Sert `dist/` en local |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript seul |
| `npm test` | Tests unitaires et contrôle éditorial (Vitest) |
| `npm run test:e2e` | Parcours navigateur, hors ligne, PWA, accessibilité (Playwright) ; exige un `build` à jour |
| `npm run content:stats` | Volumes de contenu par domaine |
| `npm run content:typo` | Normalise la typographie française des contenus |
| `npm run icons` | Régénère les icônes PNG depuis `public/logo.svg` |
| `npm run screenshots` | Refait les captures du README, après un `build` |
| `npm run deploy` | Construit et déploie sur Cloudflare |

Le premier lancement des tests navigateur peut demander `npx playwright install chromium`.

## Documentation

- [Documentation technique](docs/TECHNIQUE.md)
- [Documentation de maintenance](docs/MAINTENANCE.md)
- [Guide éditorial](docs/GUIDE-EDITORIAL.md)
- [Rapport des fonctionnalités réellement implémentées](docs/RAPPORT-FONCTIONNALITES.md)
- [Rapport des tests exécutés](docs/RAPPORT-TESTS.md)
- [Reste à développer](docs/RESTE-A-DEVELOPPER.md)
