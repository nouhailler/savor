# Reste à développer

## À faire avant une mise en ligne

Ces points dépendent d'une personne : ils ne peuvent pas être réglés par le code.

| Sujet | Ce qu'il faut faire |
|---|---|
| Relecture éditoriale | Les 158 leçons ont le statut `draft`. Elles ont passé les contrôles automatiques et une relecture par leur rédacteur, Claude, pas une relecture humaine. Passer à `validated` après celle-ci. |
| Références | Citées de mémoire, sans accès aux ouvrages ni contrôle en ligne. Vérifier titres, éditeurs et dates. |
| Textes de droit | Faire vérifier les leçons citant le droit, surtout 3.2.5, 3.3.3, 3.3.5, 4.1.8, 4.2.5, 4.2.8, 4.3.2, 4.3.6, 4.3.7, 5.2.4, 5.3.4, 6.1.3, 6.2.3, 6.2.5, 6.3.1, 6.3.4, 6.3.5, 7.1.1, 7.1.3, 7.1.5, 7.2.1, 7.2.2, 7.2.3, 7.2.7, 7.3.2, 7.3.5, 8.1.5, 8.3.1, 8.3.2, 8.3.3. Le délai funéraire de 14 jours (décret de 2024) et le plafond bagages sont rapportés de mémoire. |
| Fiches pays | `lastVerifiedAt` indique une date de rédaction. Les usages n'ont été ni contrôlés en ligne ni validés par des personnes de ces pays. |
| Droits d'auteur | Le livre source n'étant pas disponible, aucune comparaison de texte n'a été faite. Les contenus ont été rédigés sans lui. Un contrôle anti-plagiat reste souhaitable. |
| Mentions légales | Texte, éditeur (Swinux), clause de non-responsabilité et hébergeur (Cloudflare, Inc.) à valider juridiquement. Une clause de non-responsabilité n’a pas d’effet absolu, et sa portée dépend du droit applicable. |

## Contenu

- **Les 158 leçons du catalogue sont rédigées.** Rédigées en série, elles méritent une relecture d'ensemble : ton, redites entre leçons voisines (par exemple 3.3.5 et 4.3.6, 4.1.7 et 4.2.3) et tournures parfois lourdes, que les contrôles automatiques ne repèrent pas.
- Priorité de relecture humaine : les sujets graves (6.3.5 fin de vie, 6.3.6 deuils complexes, 3.3.5 confidences et danger), les numéros d'urgence et d'aide cités (3114, 3919, 119, 3018, 39 89, 0 980 980 930, 3117), et les fiches de régions (8.2.x), rédigées sans observation sur place.
- Les leçons 8.2.7 et 8.3.x couvrent de vastes régions en quelques pages : ce sont des points de départ, et elles le disent.
- D'autres fiches pays : 12 aujourd'hui.

## Fonctionnalités absentes ou partielles

| Sujet | État |
|---|---|
| Illustrations (7.4) | Aucune. L'application est entièrement typographique, faute d'images originales ou sous licence. |
| Attestation de niveau (5.12) | Les niveaux se valident et s'affichent, mais aucun certificat n'est généré. Le cahier le présente comme éventuel. |
| Déblocage des niveaux (phase 3) | Par choix : pas de verrou. L'évaluation initiale conseille un niveau, et le cahier demande un accès « jamais inutilement bloquant » (3.3). |
| Historique du défi quotidien (5.11) | Les défis réalisés apparaissent dans l'activité, et toutes les situations restent consultables. Il n'y a pas de page dédiée aux défis passés. |
| Langues | Interface et contenus uniquement en français. |

## Vérifications non réalisées

- **Le déploiement réel sur Cloudflare.** La configuration a été testée sous Wrangler en local, pas en ligne.
- **L’installation réelle** sur téléphone et ordinateur : l’invite du navigateur est simulée dans les tests, et les explications par plateforme n’ont pas été suivies sur ces appareils.
- **Firefox, Safari, Edge et de vrais téléphones.** Les tests tournent sur Chromium, dans deux formats (bureau et mobile émulé).
- **Lecteurs d'écran.** axe contrôle les attributs, mais personne n'a écouté l'application avec NVDA, VoiceOver ou TalkBack.
- **WCAG 2.2 complet.** axe ne détecte qu'une partie des critères ; un audit manuel reste nécessaire.
- **Lighthouse et réseau lent.** Seul un premier chargement en local a été mesuré.

## Évolutions futures (section 18)

Non commencées : mode audio, exercices oraux, reconnaissance vocale, entraînement à la conversation, simulations avancées, parcours personnalisés, génération de scénarios assistée par IA, assistant de consultation, comparaison entre pays, mode expert protocole, gestion éditoriale, import de modules.
