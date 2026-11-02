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

Le texte unique est `src/app/legal.ts`, rendu par la modale et par la page. `LEGAL_NOTICE_VERSION` y est enregistrée. Monter la version ne redemande pas l'acceptation : voyez le commentaire dans ce fichier pour le faire le jour où un changement le justifie. Pour rejouer le premier lancement : Paramètres, « Tout effacer ».

## Publier une version

1. Augmentez `version` dans `package.json`.
2. Lancez `npm run lint`, `npm test`, `npm run build`, puis `npm run test:e2e`.
3. Déployez `dist/`.

Les utilisateurs voient un bandeau les invitant à mettre à jour.

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
| « Le stockage local est indisponible » à l'écran | Navigation privée ou stockage refusé : la session tourne en mémoire |
