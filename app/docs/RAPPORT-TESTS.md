# Rapport des tests exécutés

Dernière exécution : 2 novembre 2026, sur 86 leçons. Environnement : Linux, Node 24.21, Vitest 5.0.5, Playwright 1.64.1, Chromium.

## Résultat

| Contrôle | Commande | Résultat |
|---|---|---|
| TypeScript | `npm run typecheck` | Aucune erreur |
| Lint | `npm run lint` | Aucune erreur |
| Tests unitaires et contenu | `npm test` | **550 réussis sur 550** (7 fichiers) |
| Build de production | `npm run build` | Réussi, 152 fichiers en précache, 3,1 Mo |
| Parcours navigateur | `npm run test:e2e` | **108 réussis sur 108** (54 scénarios, bureau et mobile émulé) |
| Mêmes parcours sous Wrangler, avec les vrais en-têtes | `E2E_BASE_URL=… npx playwright test --project=desktop` | **54 réussis sur 54** |
| Dépendances de production | `npm audit --omit=dev` | **0 vulnérabilité** |
| Toutes dépendances | `npm audit` | 19 vulnérabilités, outils de développement seulement (voir plus bas) |

Il n'y a pas d'intégration continue : ces résultats ne se rejouent que par les commandes ci-dessus.

## Couverture (section 14)

### 14.1 et 14.3 : fonctions et technique

| Vérification | Où | Résultat |
|---|---|---|
| Navigation, 25 écrans, sans erreur console ni débordement | Playwright | Réussi, deux formats |
| Leçon terminée, favori conservé après rechargement | Playwright | Réussi |
| Quiz : correction, résultat conservé, question à réviser | Playwright | Réussi |
| Situation ramifiée : la décision modifie la suite | Playwright | Réussi |
| Évaluation avec situations | Playwright | Réussi |
| Recherche, dictionnaire, fiches, sans accents | Playwright, Vitest | Réussi |
| Paramètres : thème, taille, export | Playwright | Réussi |
| **Restauration** : tout effacer, constater la perte, importer, retrouver les données | Playwright | Réussi |
| **Clavier** : quiz au clavier, focus visible | Playwright | Réussi |
| Hors ligne : contenus, recherche, progression | Playwright | Réussi |
| PWA : manifeste, service worker | Playwright | Réussi |
| Persistance, document corrompu, fichier invalide | Vitest | Réussi |
| Écran en erreur : message, puis rétablissement | Vitest | Réussi |
| Répétition espacée, notation, crédit partiel | Vitest | Réussi |
| Premier lancement : étapes, acceptation obligatoire, mémorisation, réapparition | Playwright | Réussi |
| Menu : catégories, focus, Échap, bouton retour, navigation sans réouverture | Playwright | Réussi |
| Installation : invite simulée du navigateur, explications sinon | Playwright, Vitest | Réussi |
| Mises à jour, sur un serveur publiant une nouvelle version : vérification, détection, installation en quittant | Playwright | Réussi |
| Une nouvelle version n'interrompt pas un quiz | Playwright | Réussi |
| Forcer la mise à jour : progression conservée ; refus sans réseau | Playwright | Réussi |

### 14.2 : pédagogie

Contrôlé par `src/tests/content.test.ts`, pour chaque leçon : place au catalogue, structure de l'annexe B, 900 mots minimum, règles complètes et classées, cinq questions avec explication, réponses cohérentes, aucun paragraphe ni énoncé en double, références croisées valides, aucune assignation des rôles de réception selon le sexe, et, nouveauté, bonne réponse non repérable à sa longueur et correction sans renvoi à la place d'une proposition.

**Ce test ne juge que la forme.** La cohérence entre le niveau et la difficulté, l'exactitude, l'absence de contradiction et la qualité des situations reposent sur la relecture du rédacteur, Claude, et attendent une relecture humaine.

### 14.4 : sécurité

| Vérification | Résultat |
|---|---|
| Aucune requête vers un tiers sur les écrans parcourus | Réussi (Playwright) |
| Fichier de sauvegarde validé avant import | Réussi (Vitest) |
| Pas d'injection HTML (`dangerouslySetInnerHTML`) ni de lecture de la position | Vérifié par recherche dans le code |
| Dépendances de production | 0 vulnérabilité |

## Accessibilité

axe (règles WCAG 2.0, 2.1 et 2.2, A et AA) ne signale rien sur 10 contrôles, chacun dans deux formats : accueil, leçon en clair et en sombre, situation, quiz, fiche pays, paramètres en sombre, dictionnaire, progression, fiche pratique.

## Performance

Mesure unique, faite à 72 leçons, en local, sans limitation de réseau, Chromium de bureau : premier affichage de contenu à 300 ms, 19 requêtes, 886 Ko non compressés au premier chargement. La recherche et les quiz n'ont pas fait l'objet d'une mesure dédiée. Ce chiffre n'est pas une mesure de terrain.

## Dépendances : alertes restantes

`npm audit` signale 17 alertes modérées et 2 faibles, dans des paquets qui ne sont pas livrés aux utilisateurs :

- `eslint` et `typescript-eslint` (lint) ;
- `vite-plugin-pwa` et `workbox-build` (génération du service worker au build).

Les corrections proposées sont des rétrogradations majeures, non appliquées. Les 2 alertes critiques (`tinypool`, par `vitest`) ont été corrigées en passant à Vitest 5, sans échec de test.

## Non testé

Déploiement en ligne sur Cloudflare ; Firefox, Safari et Edge ; téléphones réels et installation effective ; lecteurs d'écran ; réseau lent ; audit WCAG manuel ; Lighthouse.

## Correctifs issus de cette campagne

| Problème trouvé | Correction |
|---|---|
| 76 QCM dont la bonne réponse se repérait à sa longueur | Propositions réécrites, test ajouté |
| 11 corrections disant « la première… », alors que l'ordre est mélangé | Réécrites, test ajouté (vérifié en le faisant échouer exprès) |
| Délai funéraire légal périmé dans la leçon 6.3.4 | Corrigé (14 jours, décret de 2024) |
| Leçons marquées `validated` sans relecture humaine | Passées à `draft`, sens du statut documenté |
| Faille critique dans une dépendance de test | Vitest mis à jour |
| Aucun filet si un écran échoue | `ErrorBoundary` ajouté |
| Restauration et clavier non couverts | Parcours ajoutés |
