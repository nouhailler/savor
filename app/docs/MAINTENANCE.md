# Documentation de maintenance

## Ajouter une leçon

1. Repérez son identifiant dans `src/content/domains/<domaine>.json` : `l-X-Y-Z`. Le titre, le niveau et le programme viennent du catalogue.
2. Créez `src/content/lessons/<slug du domaine>/l-X-Y-Z.json` selon le [guide éditorial](GUIDE-EDITORIAL.md), avec `"status": "draft"`.
3. Lancez :

```bash
npm run content:typo
```

```bash
npm test
```

Aucun fichier de code n'est à modifier : la leçon apparaît au build suivant. Le passage à `validated` suppose une relecture humaine.

## Ajouter un autre contenu

Scénarios, fiches, définitions : ajoutez une entrée au fichier JSON voulu de `src/content/scenarios`, `sheets` ou `dictionary`. Les identifiants restent stables, car ils servent de clé à la progression et aux favoris. Fiche pays : un fichier par pays dans `src/content/countries`, avec ses douze sections, ses sources, sa date `lastVerifiedAt` et sa note de limite de généralisation.

Le test de contenu refuse un renvoi vers une leçon qui n'existe pas au catalogue, une étape de scénario inatteignable, une règle incomplète ou une question sans explication.

## Corriger un contenu publié

Modifiez le JSON, augmentez `version`, mettez à jour `updatedAt` et ajoutez une ligne à `revisions`. Ne renommez pas un identifiant de règle ou de question : l'historique de révision de l'utilisateur en dépend.

## Vérifier les fiches pays et les références

Les usages changent, et les droits des voyageurs aussi. Relisez au moins une fois par an :

- les fiches pays (`lastVerifiedAt`) ;
- les leçons citant un texte de droit, surtout 6.3.4 (délais funéraires), 7.1.5 et 7.3.5 (droits des passagers, plafonds de la convention de Montréal).

## Faire évoluer les données utilisateur

Un champ nouveau reçoit une valeur par défaut dans `emptyUserData` et `sanitizeUserData`. Si le format change vraiment, augmentez `schemaVersion` et écrivez une migration dans `storage/db.ts` : aujourd'hui, un document d'une autre version est écarté.

## Modifier les mentions légales

Le texte unique est `src/app/legal.ts`, rendu par la modale et par la page. `LEGAL_NOTICE_VERSION` y est enregistrée. Monter la version redemande l'acceptation à tous, directement à l'étape de l'avertissement : ne le faites que pour un changement qui le justifie, sinon passez `LEGAL_REPROMPT_ON_VERSION_CHANGE` à `false`. Pour rejouer le premier lancement : Paramètres, « Tout effacer ». Les étapes de présentation sont dans `src/app/LegalNotice.tsx`.

## Publier une version

1. Augmentez `version` dans `package.json`.
2. Lancez `npm run lint`, `npm test`, `npm run build`, puis `npm run test:e2e`.
3. Déployez.

Les applications déjà installées détectent la nouvelle version en moins d'une heure d'utilisation, ou à la prochaine ouverture, et l'installent d'elles-mêmes. La date de sortie affichée est celle du build.

## Déployer sur Cloudflare

L'application est servie comme ressources statiques par Cloudflare Workers. La configuration est dans `wrangler.jsonc`, et le nom `savoir-vivre` y donne l'adresse `savoir-vivre.<votre-sous-domaine>.workers.dev`.

**Depuis votre poste**, une première fois `npx wrangler login`, puis :

```bash
npm run deploy
```

**À chaque `git push`** : dans le tableau de bord, *Workers & Pages*, *Create*, *Import a repository*, puis choisissez le dépôt et réglez :

| Réglage | Valeur |
|---|---|
| Root directory | `app` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Le fichier `.node-version` impose Node 22 au build. Si le nom du Worker créé dans le tableau de bord diffère de `savoir-vivre`, alignez `name` dans `wrangler.jsonc`.

**Cloudflare Pages** : le projet en ligne se construit avec ces réglages : racine `app`, commande `npm run build`, sortie `dist`, sans commande de déploiement. Une racine vide provoque l'erreur `Could not read package.json`.

**Ne changez pas d'adresse à la légère** : le service worker, l'installation et la progression sont liés à l'adresse. Une progression enregistrée sur `workers.dev` ne suit pas vers un domaine personnalisé, sauf par export et import. Choisissez donc le domaine définitif avant d'annoncer l'application.

**Cache et en-têtes** : `public/_headers`. Les fichiers de `/assets/` portent une empreinte et restent en cache un an. `sw.js`, `index.html` et le manifeste ne doivent jamais rester en cache, sinon les mises à jour ne seraient plus détectées. Après un changement de la CSP, vérifiez sous Wrangler :

```bash
npx wrangler dev --port 8788
```

```bash
E2E_BASE_URL=http://127.0.0.1:8788 npx playwright test --project=desktop
```

Laissez désactivés Rocket Loader et les injections de script (Web Analytics, Zaraz) : ils seraient bloqués par la CSP, et l'application promet l'absence de traceur.

## Dépendances

```bash
npm audit --omit=dev
```

Cette commande doit rester à 0 : c'est ce qui part en production. Les alertes restantes concernent des outils de build et de lint, voir le [rapport des tests](RAPPORT-TESTS.md). `npm audit fix --force` propose des rétrogradations (`eslint@4`, `vite-plugin-pwa@1.1`) : ne l'appliquez pas.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| Les tests navigateur portent sur une ancienne version | `npm run test:e2e` sert `dist/` : relancez `npm run build` |
| Une leçon n'est plus découpée en morceau séparé | Import statique du JSON quelque part : passez par `services/content.ts` |
| L'ancienne version persiste en local | Service worker en cache : acceptez le bandeau, ou videz les données du site |
| Une leçon ajoutée n'est pas contrôlée par `npm test` | Cache de modules de Vitest : il doit rester désactivé (`fsModuleCache: false`) |
| « Le stockage local est indisponible » à l'écran | Navigation privée ou stockage refusé : la session tourne en mémoire |
