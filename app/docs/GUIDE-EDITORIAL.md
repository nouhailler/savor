# Guide éditorial — L'Art du Savoir-Vivre

Référence pour rédiger et relire les contenus (`src/content`). Le test `src/tests/content.test.ts` vérifie mécaniquement tout ce qui peut l'être.

## Exigences de fond
- Français correct, ton adulte, précis. Pas de généralités vagues : chaque recommandation est expliquée.
- Texte **entièrement original**. Rien de repris de *Le bonheur de séduire* (N. de Rothschild, 1991) ni d'aucun autre ouvrage ; exemples, dialogues et situations créés pour l'application.
- Approche contemporaine, égalitaire, inclusive. Jamais de règle assignée selon le sexe ou le statut social sans la contextualiser comme usage historique. Ne pas écrire « la maîtresse de maison » : « l'hôte », « la personne qui reçoit ».
- Élégance ≠ richesse. Aucune culture supérieure à une autre. Aucune manipulation sociale encouragée.
- Distinguer **convention** et **obligation légale** (`normativity`). `legal_obligation` seulement si un texte existe réellement, cité dans `references`.
- Dates et contexte pour tout contenu historique. Prudence sur les anecdotes d'origine : « on rapporte que », si non établies.
- Fiches pays : tendances, jamais vérités universelles ; note de limite de généralisation obligatoire.
- **Ne jamais inventer une source.** Citer uniquement des ouvrages et textes réels, sans inventer de numéro de page ni d'URL précise.

## Structure d'une leçon (`src/content/lessons/<domaine>/<id>.json`)
`id`, `version`, `status`, `createdAt`, `updatedAt`, `summary`, `estimatedDuration` (min, environ mots/200), `tags`, `objectives` (3–4), `introduction`, `sections` (3–4, 2–3 paragraphes chacune), `rules` (4–5), `why`, `examples` (3), `mistakes` (3), `nuances` (3), `contexts` (3–4), `keyPoints` (3–4), `exercise` (matching | ordering | case), `quiz` (`passingScore`, 5 questions), `references` (2–3), `revisions`.

Titre, niveau et programme viennent du catalogue (`src/content/domains`) : ne pas les répéter.

Identifiants stables : règles `<id>-rN`, questions `<id>-qN`.

### Statut (section 8.3)
`draft` : rédigée, conforme aux contrôles automatiques, pas encore relue par une personne. `validated` : relue par une personne compétente, qui en prend la responsabilité. Un test qui passe ne vaut pas validation.

### Règle (section 9.2)
`description` : quelle est la règle. `rationale` : pourquoi. `context` : quand. `recommendedBehavior` : comment. `exceptions`. `remedy` : comment réagir si elle n'a pas été respectée. Les erreurs sont dans `mistakes`.
`conventionType` : universal_principle | modern_custom | traditional_custom | historical_custom | cultural_custom | contextual_rule.
`normativity` : recommendation | common_usage | formal_convention | legal_obligation.

### Question
`type` : single | multiple | truefalse (choix `["Vrai","Faux"]`). `kind` : qcm | formulation | maladresse | vrai-faux. La bonne réponse ne doit pas être reconnaissable à sa longueur (test : au plus 1,3 fois le plus long leurre) ; les leurres doivent être plausibles. L’interface mélange les propositions : une correction ne dit jamais « la première » ou « la dernière », elle reprend les mots de la proposition. Pas de réponse arbitraire : l'`explanation` justifie, et dit ce qui rendrait une autre réponse fausse.

## Bibliographie réelle utilisable
Sociologie et histoire des mœurs : Norbert Elias, *La Civilisation des mœurs* (1939 ; trad. fr. Calmann-Lévy, 1973) · Erving Goffman, *La Mise en scène de la vie quotidienne* (Minuit, 1973), *Les Rites d'interaction* (Minuit, 1974) · Dominique Picard, *Politesse, savoir-vivre et relations sociales* (PUF, Que sais-je ?, 1998) · Marcel Mauss, *Essai sur le don* (1925) · Arnold Van Gennep, *Les Rites de passage* (1909) · Philippe Ariès, *L'Homme devant la mort* (Seuil, 1977) · André Comte-Sponville, *Petit traité des grandes vertus* (PUF, 1995) · Jean-Claude Kaufmann, *La Trame conjugale* (Nathan, 1992).
Textes anciens : Érasme, *La Civilité puérile* (1530) · Castiglione, *Le Livre du courtisan* (1528) · Antoine de Courtin, *Nouveau traité de la civilité* (1671) · La Bruyère, *Les Caractères* (1688) · Baronne Staffe, *Usages du monde* (1889) · Brillat-Savarin, *Physiologie du goût* (1825) · Grimod de La Reynière, *Manuel des amphitryons* (1808) · Aristote, *Rhétorique* · Cicéron, *De l'orateur*.
Communication et psychologie : Edward T. Hall, *La Dimension cachée* (Seuil, 1971), *Au-delà de la culture* (Seuil, 1979) · Paul Watzlawick et al., *Une logique de la communication* (Seuil, 1972) · Marshall Rosenberg, *Les mots sont des fenêtres (ou bien ce sont des murs)* (La Découverte) · Fisher et Ury, *Comment réussir une négociation* (Seuil, 1982) · Daniel Goleman, *L'Intelligence émotionnelle* (Robert Laffont, 1997) · Christophe André et François Lelord, *L'Estime de soi* (Odile Jacob, 1999).
Interculturel : Erin Meyer, *La Carte des différences culturelles* (Diateino, 2016) · Geert Hofstede et al., *Cultures et organisations* · Ministère français de l'Europe et des Affaires étrangères, *Conseils aux voyageurs* (diplomatie.gouv.fr) · offices de tourisme nationaux (JNTO, etc.).
Protocole : Décret n° 89-655 du 13 septembre 1989 relatif aux cérémonies publiques, préséances, honneurs civils et militaires · Convention de Vienne sur les relations diplomatiques (1961) · Jean Serres, *Manuel pratique de protocole* (Éd. de l'Arbre) · Debrett's (Royaume-Uni) · Emily Post Institute, *Emily Post's Etiquette*.
Deuil et fin de vie : Elisabeth Kübler-Ross, *Les Derniers Instants de la vie* (Labor et Fides) · Marie de Hennezel, *La Mort intime* (Robert Laffont, 1995) · Société française d'accompagnement et de soins palliatifs (SFAP) · Loi n° 2016-87 du 2 février 2016 (Claeys-Leonetti).
Droit français (repères) : Code civil art. 9 (vie privée) · Code de la santé publique art. L1110-4 (secret médical), art. R1336-5 (bruit de voisinage) · Code pénal art. R623-2 (tapage) · Loi n° 2005-102 du 11 février 2005 (handicap) · Décret n° 2006-1386 du 15 novembre 2006 (tabac dans les lieux collectifs) · Règlement (CE) n° 261/2004 (droits des passagers aériens) · Convention de Montréal (1999) · Loi du 9 décembre 1905 · Code de la route.
Langue : Académie française, *Dire, ne pas dire* · Maurice Grevisse, *Le Bon Usage* · Jacques Gandouin, *Correspondance et rédaction administratives* (Armand Colin).
Autres : UNESCO, « Repas gastronomique des Français » (2010), « Washoku » (2013) · Leave No Trace Center for Outdoor Ethics.

## Leçons de la première édition (3 par niveau et par domaine, soit 72)
1. Soi-même — 1.1.1, 1.1.3, 1.1.5 · 1.2.1, 1.2.3, 1.2.5 · 1.3.2, 1.3.3, 1.3.5
2. Relations — 2.1.2, 2.1.5, 2.1.6 · 2.2.2, 2.2.6, 2.2.7 · 2.3.2, 2.3.3, 2.3.6
3. Communication — 3.1.3, 3.1.4, 3.1.5 · 3.2.3, 3.2.6, 3.2.8 · 3.3.2, 3.3.4, 3.3.7
4. Usages — 4.1.2, 4.1.3, 4.1.4 · 4.2.2, 4.2.4, 4.2.7 · 4.3.1, 4.3.3, 4.3.4
5. Recevoir — 5.1.4, 5.1.6, 5.1.7 · 5.2.1, 5.2.2, 5.2.8 · 5.3.3, 5.3.5, 5.3.6
6. Fêtes — 6.1.1, 6.1.4, 6.1.5 · 6.2.1, 6.2.2, 6.2.4 · 6.3.2, 6.3.3, 6.3.4
7. Voyager — 7.1.4, 7.1.5, 7.1.6 · 7.2.1, 7.2.4, 7.2.5 · 7.3.1, 7.3.4, 7.3.5
8. Étranger — 8.1.1, 8.1.2, 8.1.4 · 8.2.1, 8.2.4, 8.2.6 · 8.3.3, 8.3.4, 8.3.5

Fichier : `src/content/lessons/<slug domaine>/l-X-Y-Z.json` (slugs : soi-meme, relations, communication, usages, recevoir, fetes, voyager, etranger).
