# Reste à développer

## À faire avant une mise en ligne

Ces points dépendent d'une personne : ils ne peuvent pas être réglés par le code.

| Sujet | Ce qu'il faut faire |
|---|---|
| Relecture éditoriale | Les 72 leçons ont le statut `draft`. Elles ont passé les contrôles automatiques et une relecture par leur rédacteur, Claude, pas une relecture humaine. Passer à `validated` après celle-ci. |
| Références | Citées de mémoire, sans accès aux ouvrages ni contrôle en ligne. Vérifier titres, éditeurs et dates. |
| Textes de droit | Faire vérifier les leçons citant le droit, surtout 6.3.4, 7.1.5, 7.2.1, 7.3.5, 8.3.3. Le délai funéraire de 14 jours (décret de 2024) et le plafond bagages sont rapportés de mémoire. |
| Fiches pays | `lastVerifiedAt` indique une date de rédaction. Les usages n'ont été ni contrôlés en ligne ni validés par des personnes de ces pays. |
| Droits d'auteur | Le livre source n'étant pas disponible, aucune comparaison de texte n'a été faite. Les contenus ont été rédigés sans lui. Un contrôle anti-plagiat reste souhaitable. |
| Mentions légales | Hébergeur à renseigner (`[À COMPLÉTER]`). Texte et éditeur (Swinux) à valider juridiquement. |

## Contenu

- **86 leçons du catalogue** ne sont pas encore rédigées (72 sur 158). Elles figurent au catalogue avec la mention « En préparation », sans page factice.
- Les volumes de la section 17 sont atteints, mais ce sont des minimums. Pour accompagner un adulte pendant plusieurs années, les leçons restantes sont la priorité.
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

- **Firefox, Safari, Edge et de vrais téléphones.** Les tests tournent sur Chromium, dans deux formats (bureau et mobile émulé).
- **Lecteurs d'écran.** axe contrôle les attributs, mais personne n'a écouté l'application avec NVDA, VoiceOver ou TalkBack.
- **WCAG 2.2 complet.** axe ne détecte qu'une partie des critères ; un audit manuel reste nécessaire.
- **Lighthouse et réseau lent.** Seul un premier chargement en local a été mesuré.

## Évolutions futures (section 18)

Non commencées : mode audio, exercices oraux, reconnaissance vocale, entraînement à la conversation, simulations avancées, parcours personnalisés, génération de scénarios assistée par IA, assistant de consultation, comparaison entre pays, mode expert protocole, gestion éditoriale, import de modules.
