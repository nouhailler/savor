# Documentation technique

## Choix et raisons

| Choix | Raison |
|---|---|
| React 19, TypeScript, Vite | Stack recommandée par le cahier (10.2) |
| Contenus en JSON dans `src/content` | Séparer le contenu du code (principe 12) et faire évoluer le catalogue sans toucher aux écrans |
| Aucun serveur, aucun compte | Confidentialité (section 11) : rien à transmettre, rien à sécuriser côté serveur |
| IndexedDB (`idb`) pour les données utilisateur | Persistance plus fiable que `localStorage` ; repli en mémoire signalé si le stockage est refusé |
| `HashRouter`, chemins relatifs | Déploiement statique n'importe où, sans réécriture d'URL côté serveur |
| Polices embarquées (`@fontsource`, sous-ensembles latins) | Aucun appel à un tiers, fonctionnement hors ligne |
| Workbox via `vite-plugin-pwa`, `registerType: 'prompt'` | Tout le site en précache ; une mise à jour est proposée, jamais imposée en pleine leçon |

## Structure

```
src/
  app/          Coquille : routes, mise en page, avertissement légal, bandeau de mise à jour
  components/   Composants partagés, filet d'erreur
  features/     Un dossier par espace : home, learning, quizzes, scenarios, guide,
                dictionary, countries, search, favorites, progress, settings
  services/     content (accès aux contenus), search (index local), daily (recommandations)
  storage/      db (IndexedDB), UserContext (état utilisateur et écritures)
  types/        Modèle de données : content.ts, user.ts
  utils/        Dates, texte, libellés, répétition espacée
  styles/       tokens.css (design system), app.css
  content/      domains, lessons/<domaine>, scenarios, sheets, dictionary, countries
  tests/        Vitest
tests/e2e/      Playwright
scripts/        content-stats, typo
```

## Chargement des contenus

Chaque leçon est un morceau JavaScript chargé à la demande. Les listes et la recherche ne chargent pas le corps des leçons : deux modules virtuels, produits par le plugin `lessonIndex` de `vite.config.ts`, fournissent au build un index compilé.

- `virtual:lesson-meta` : métadonnées (résumé, durée, mots-clés).
- `virtual:lesson-search` : texte indexable, chargé par la seule page de recherche.

**Piège connu** : importer un même JSON de leçon à la fois statiquement et dynamiquement annule le découpage. Passez toujours par `services/content.ts`.

## Données utilisateur

Base IndexedDB `savoir-vivre`, magasin `documents`, clé `user` : un seul document `UserData` (`types/user.ts`), versionné par `schemaVersion`. `sanitizeUserData` répare les champs manquants ; un document illisible est écarté, l'utilisateur en est averti (`recovered`). Export et import passent par le même contrôle.

L'avertissement légal est mémorisé dans ces données. Sa version figure dans `src/app/legal.ts`.

## Moteurs

- **Quiz** (`features/quizzes/QuizRunner.tsx`, `scoring.ts`) : choix simple, multiple, vrai/faux, crédit partiel. Les propositions sont mélangées à chaque session, sauf vrai/faux : une correction ne peut donc pas dire « la première ».
- **Exercices** (`Exercises.tsx`) : association, classement, étude de cas.
- **Scénarios** (`features/scenarios`) : situations ramifiées, score 1 / 0,5 / 0 par choix.
- **Évaluations** (`EvaluationPage.tsx`) : initiale (niveau conseillé) et finale par niveau, avec des situations et pas seulement des QCM. Seuils 70 / 75 / 80 %.
- **Révision** (`utils/spaced.ts`) : boîtes de Leitner, intervalles 0, 1, 3, 7, 16, 35 jours.
- **Recherche** (`services/search.ts`) : index local, insensible aux accents.
- **Défi du jour** (`services/daily.ts`) : une situation choisie à partir de la date, identique pour la journée.

## Hors ligne et mises à jour

Le service worker précache tous les fichiers générés (environ 2,7 Mo, dont toutes les leçons). Après la première visite, tout fonctionne sans réseau. Une nouvelle version déclenche le bandeau `UpdateBanner`. La progression, en IndexedDB, n'est pas touchée par le remplacement du cache.

## Sécurité et confidentialité

Aucun appel réseau vers un tiers (vérifié par un test), aucun traceur, aucun cookie, aucune donnée saisie hormis le fichier de sauvegarde, qui est validé avant import. Aucun `dangerouslySetInnerHTML` n'est nécessaire : les contenus s'affichent comme du texte. L'application ne lit pas la position de l'appareil.

## Accessibilité

Objectif WCAG 2.2 AA. Tokens de couleur vérifiés par axe en clair et en sombre, focus visible, navigation au clavier, tailles de texte réglables, états non portés par la seule couleur (le quiz affiche aussi une icône et un libellé).
