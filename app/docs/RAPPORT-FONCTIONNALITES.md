# Rapport des fonctionnalités réellement implémentées

Date : 2 novembre 2026. Version : voir `package.json`.

Légende : **Fait** = fonctionne et est couvert par un test automatique ou un contrôle de contenu. **Partiel** = voir la colonne. Rien n'est factice : une leçon non rédigée porte la mention « En préparation » et n’ouvre aucune page.

## Critères d'acceptation (section 15)

| ID | Exigence | État | Preuve ou réserve |
|---|---|---|---|
| ACC-001 | Huit domaines | Fait | Test de catalogue, parcours navigateur |
| ACC-002 | Trois niveaux | Fait | Test de catalogue : 3 leçons minimum par niveau et domaine |
| ACC-003 | Catalogue | Fait | 158 leçons classées, 72 rédigées, filtres et bibliothèque |
| ACC-004 | Contenus | Fait, à relire | 72 leçons structurées selon l'annexe B ; statut `draft` tant qu'aucune personne ne les a relues |
| ACC-005 | Fiches pratiques | Fait | 40 fiches, recherche et consultation |
| ACC-006 | Quiz | Fait | 72 quiz, 360 questions, correction expliquée, crédit partiel |
| ACC-007 | Scénarios | Fait | 32 situations ramifiées ; le test vérifie qu'aucune étape n'est inatteignable |
| ACC-008 | Progression | Fait | Conservée après rechargement, export et restauration testés |
| ACC-009 | Favoris | Fait | Ajout, suppression, conservation |
| ACC-010 | Recherche | Fait | Globale, locale, insensible aux accents |
| ACC-011 | Dictionnaire | Fait | 64 définitions |
| ACC-012 | Pays | Fait, à vérifier | 12 fiches complètes ; usages non vérifiés en ligne ni par des spécialistes |
| ACC-013 | PWA | Fait | Manifeste et service worker testés ; installation réelle non testée sur téléphone |
| ACC-014 | Hors ligne | Fait | Contenus, recherche et progression testés sans réseau |
| ACC-015 | Responsive | Fait | 24 écrans sans débordement, bureau et mobile émulé |
| ACC-016 | Accessibilité | Partiel | 10 contrôles axe sans défaut (WCAG 2.0 à 2.2, A et AA), focus et clavier testés sur le quiz ; ni audit manuel ni lecteur d'écran |
| ACC-017 | Confidentialité | Fait | Aucun appel tiers (testé), données locales, effacement et export |
| ACC-018 | Droits d'auteur | Partiel | Textes rédigés pour l'application, sans accès au livre ; aucune comparaison automatique possible |
| ACC-019 | Sources | Partiel | Présentes sur chaque leçon et fiche pays ; citées de mémoire, à vérifier |
| ACC-020 | Qualité | Fait | Build, lint et tests réussis, voir le [rapport des tests](RAPPORT-TESTS.md) |

**Conclusion : la première édition fonctionne et atteint les volumes prévus. Le projet n'est pas « terminé » au sens de la section 15 tant que ACC-016, ACC-018 et ACC-019 restent partiels.** Ces trois points demandent une vérification humaine.

## Contenu (section 17)

| Type | Minimum | Réalisé |
|---|---:|---:|
| Domaines | 8 | 8 |
| Niveaux par domaine | 3 | 3 |
| Leçons rédigées | 72 | 72 (9 par domaine, 3 par niveau et domaine) |
| Fiches pratiques | 40 | 40 |
| Scénarios | 32 | 32 |
| Quiz | 24 | 72 |
| Questions de quiz | 240 | 360 |
| Définitions | 60 | 64 |
| Fiches pays | 12 | 12 |

Volume total des leçons : environ 220 000 mots, 3 000 en moyenne par leçon.

## Écrans (section 6.2)

| Écrans | Route | État |
|---|---|---|
| SCR-001 Accueil | `/` | Fait |
| SCR-002 Présentation | `/presentation` | Fait |
| SCR-003 à 005 Domaines, domaine, niveaux | `/apprendre`, `/apprendre/:id` | Fait |
| SCR-006 Catalogue | `/bibliotheque` | Fait |
| SCR-007 Leçon | `/lecons/:id` | Fait |
| SCR-008 Fiche pratique | `/guide/:id` | Fait |
| SCR-009, 010 Scénarios | `/situations` | Fait |
| SCR-011, 012 Quiz et correction | `/lecons/:id/quiz` | Fait |
| SCR-013 Révisions | `/revisions` | Fait |
| SCR-014 Dictionnaire | `/dictionnaire` | Fait |
| SCR-015, 016 Pays | `/culture` | Fait |
| SCR-017 Recherche | `/recherche` | Fait |
| SCR-018 Favoris | `/favoris` | Fait |
| SCR-019 Progression | `/progression` | Fait |
| SCR-020 Évaluations | `/evaluations` | Fait |
| SCR-021 Paramètres | `/parametres` | Fait |
| SCR-022 À propos | `/a-propos` | Fait |
| Ajout : mentions légales | `/mentions-legales` | Fait, à valider juridiquement |

## Fonctions (section 5)

| Section | État | Note |
|---|---|---|
| 5.1 Tableau de bord | Fait | |
| 5.2 Bibliothèque | Fait | |
| 5.3 Écran de leçon | Fait | |
| 5.4 Fiches | Fait | |
| 5.5 Mises en situation | Fait | |
| 5.6 Quiz et exercices | Fait | QCM, vrai/faux, association, classement, formulation, maladresse, scénario, étude de cas |
| 5.7 Révision | Fait | Répétition espacée, questions échouées, notions fragiles, règles favorites |
| 5.8 Dictionnaire | Fait | |
| 5.9 Recherche | Fait | |
| 5.10 Favoris | Fait | |
| 5.11 Défi quotidien | Partiel | Renouvelé, corrigé, compté dans la progression ; pas de page des défis passés |
| 5.12 Évaluations | Partiel | Initiale et finale, seuils, situations incluses ; pas de certificat (facultatif) |
| 7.4 Illustrations | Non fait | Interface typographique, aucune image |

Hors cahier, ajouté à l'initiative du développeur : l'avertissement au premier lancement et les mentions légales. Ils viennent d'un modèle réutilisable et sont à valider.
