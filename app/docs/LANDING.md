# Page de présentation

Page statique qui présente Savor et renvoie vers l'application. Adresse prévue : `https://savor.swinux.ch/decouvrir/`.

## Pourquoi `/decouvrir/` et pas la racine

`https://savor.swinux.ch/` sert déjà l'application, et les appels à l'action doivent y mener. Mettre la page à la racine obligerait à déplacer l'application, avec une conséquence lourde : la progression, l'installation et le service worker sont liés à l'adresse et à la portée du service worker. Ce choix est donc réversible à faible coût, l'inverse ne l'est pas.

## Technologies

HTML et CSS, sans JavaScript ni dépendance, dans `public/decouvrir/` :

| Fichier | Rôle |
|---|---|
| `index.html` | La page |
| `style.css` | Reprend les couleurs et les polices de l'application |
| `icons.svg` | Icônes Phosphor |
| `fonts/` | Cormorant Garamond et Source Sans 3 |
| `img/` | Vraies captures de l'application |
| `og.jpg` | Image de partage |

Vite copie ce dossier tel quel dans `dist/decouvrir/`.

## Commandes

```bash
npm run dev
```

```bash
npm run build
```

Les polices, les icônes et les captures se régénèrent ainsi, après un changement visible de l'application :

```bash
npm run build && npm run landing:assets && npm run build
```

## Modifier le contenu

Les chiffres, les domaines, les situations et les statuts sont écrits dans le HTML. `src/tests/landing.test.ts` les compare au contenu réel : si une leçon est ajoutée sans mettre la page à jour, le test échoue.

## PWA

- La page réutilise le manifeste de l'application : l'installer depuis cette page installe l'application.
- Il n'y a pas de second service worker. La page n'enregistre pas non plus celui de l'application, pour ne pas faire télécharger 5 Mo à un simple visiteur.
- Pour qui a déjà ouvert l'application, le service worker précache la page et ses captures : elle reste consultable hors ligne. `navigateFallbackDenylist` empêche `/decouvrir` d'être remplacé par l'application.
- Un visiteur qui n'a jamais ouvert l'application n'a pas la page hors ligne.

## Déploiement

Rien de plus à régler : la page fait partie de `dist/`. Sur Cloudflare Pages : racine `app`, commande `npm run build`, sortie `dist`. `public/_headers` empêche la mise en cache durable de son HTML.

## Tests

- `src/tests/landing.test.ts` : affirmations, liens internes, ressources, métadonnées.
- `tests/e2e/decouvrir.spec.ts` : affichage sur deux formats, console, débordement, axe, clavier, liens vers l'application, manifeste, service worker et hors ligne.

Résultats : [RAPPORT-TESTS.md](RAPPORT-TESTS.md).

## Points à décider

- **Nom :** la page dit « Savor », l'application affiche « L'Art du Savoir-Vivre ». La page l'explique au visiteur, mais il faudra sans doute harmoniser.
- **Politique de confidentialité :** il n'y en a pas. `src/app/legal.ts` laisse ce choix à l'éditeur. Le pied de page ne renvoie donc qu'aux mentions légales.
- **Lien GitHub :** présent dans le pied de page. À retirer si sa publication n'est pas souhaitée.
- **Accès :** l'application ne contient ni compte ni paiement. La FAQ le dit au présent, sans engagement pour l'avenir : à confirmer par l'éditeur.
- **Lien entrant :** l'application ne renvoie pas vers cette page, et la racine du site n'est pas modifiée. Son adresse se partage directement.
