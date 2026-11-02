// Contenu légal centralisé : un seul texte, rendu par un seul composant (modale et page).
// L'application ne lit pas la position de l'appareil : pas de section « Précision de la localisation ».
// Pas d'âge minimum ni de politique de confidentialité distincte à ce stade : à décider par l'éditeur.
export const LEGAL_NOTICE_VERSION = '1.1';
// La version 1.1 ajoute la clause de non-responsabilité de l'éditeur : elle est présentée à ceux qui avaient accepté la précédente.
export const LEGAL_REPROMPT_ON_VERSION_CHANGE = true;

export const legalNotice = {
  title: 'Information importante',
  shortWarning: [
    'Cette application est fournie à titre informatif et pratique. Malgré les précautions prises lors de son développement, elle peut contenir des erreurs, des imprécisions ou présenter des limitations techniques.',
    'L’utilisation de cette application se fait sous votre responsabilité. Les informations, résultats, données ou recommandations fournis par l’application ne doivent pas être considérés comme infaillibles.',
    'L’éditeur de l’application n’est pas responsable des données, informations et contenus qu’elle fournit, ni de l’usage qui en est fait, dans les limites autorisées par la réglementation applicable.',
    'Pour toute information importante ou décision susceptible d’avoir des conséquences, vérifiez les données auprès de sources fiables et officielles ou auprès d’un professionnel compétent.',
    'En utilisant cette application, vous reconnaissez avoir pris connaissance de cet avertissement.'
  ],
  publisher: { name: 'Swinux', address: 'Canton de Vaud, Suisse', email: 'contact@swinux.ch', host: 'Cloudflare, Inc.' },
  updatedAt: '2 novembre 2026',
  sections: [
    {
      title: 'Avertissement',
      paragraphs: [
        'L’Art du Savoir-Vivre est un ouvrage pédagogique numérique. Les usages décrits sont des repères, pas des lois : ils varient selon les personnes, les milieux, les régions et les époques.',
        'Certaines leçons abordent le droit, la santé, le deuil ou la fin de vie. Elles ne remplacent ni un avocat, ni un médecin, ni un professionnel de l’accompagnement.'
      ]
    },
    {
      title: 'Limitation de responsabilité',
      paragraphs: [
        'Cette application est proposée à titre informatif, documentaire, éducatif et/ou pratique selon sa finalité. Elle est destinée à fournir à l’utilisateur des informations, données, outils ou fonctionnalités destinés à faciliter son utilisation.',
        'L’éditeur s’efforce de fournir des informations aussi fiables, pertinentes et actualisées que possible. Toutefois, aucune garantie ne peut être donnée quant à l’exactitude, l’exhaustivité, l’actualité ou la pertinence des informations présentées.',
        'Certaines informations peuvent provenir de sources externes ou être générées, calculées ou interprétées automatiquement. Des erreurs, omissions, imprécisions ou incohérences peuvent donc subsister.',
        'L’utilisateur reconnaît utiliser l’application sous sa propre responsabilité et demeure seul responsable de l’utilisation qu’il fait des informations et fonctionnalités proposées.',
        'L’application ne doit pas être considérée comme une source unique ou définitive d’information lorsqu’une décision importante, professionnelle, financière, médicale, juridique, scientifique, géographique ou liée à la sécurité est concernée.',
        'Lorsque cela est nécessaire, l’utilisateur doit vérifier les informations auprès de sources officielles, de documents de référence ou d’un professionnel qualifié.'
      ]
    },
    {
      title: 'Utilisation de l’application',
      paragraphs: [
        'Malgré les efforts déployés pour assurer le bon fonctionnement de l’application, l’éditeur ne garantit pas que celle-ci sera disponible en permanence, exempte d’erreurs ou compatible avec tous les appareils, systèmes d’exploitation, navigateurs, réseaux ou configurations.',
        'L’utilisation de l’application implique que l’utilisateur a pris connaissance du présent avertissement et accepte les conditions d’utilisation applicables à l’application.'
      ]
    },
    {
      title: 'Exactitude des informations',
      paragraphs: [
        'Les fiches pays décrivent des tendances, jamais des vérités valables pour tous les habitants d’un pays. Chaque fiche indique ses sources et sa date de dernière relecture.',
        'Les mentions de textes de loi sont données à titre de repère et peuvent évoluer : seule la version en vigueur fait foi.'
      ]
    },
    {
      title: 'Dysfonctionnements et disponibilité',
      paragraphs: [
        'Des interruptions, ralentissements, pertes de connexion, erreurs techniques ou indisponibilités temporaires peuvent notamment survenir.'
      ]
    },
    {
      title: 'Données et résultats',
      paragraphs: [
        'Les résultats, calculs, estimations, localisations, statistiques, recommandations ou autres données produits par l’application sont fournis à titre indicatif, sauf indication contraire explicite.',
        'L’utilisateur doit apprécier leur pertinence en fonction de son propre contexte et procéder aux vérifications nécessaires avant toute utilisation susceptible d’entraîner des conséquences importantes.',
        'Les validations de niveau sont des attestations internes de progression : elles ne constituent ni un diplôme ni une certification professionnelle reconnue.',
        'Votre progression, vos favoris et vos préférences restent sur cet appareil. Ils ne sont transmis à aucun service ; vous pouvez les exporter ou les effacer depuis les Paramètres.',
        'Dans les limites autorisées par la réglementation applicable, l’éditeur ne saurait être tenu responsable des dommages, pertes, préjudices ou conséquences résultant directement ou indirectement de l’utilisation, de l’impossibilité d’utiliser ou de l’interprétation des informations ou fonctionnalités proposées par l’application.',
        'Cette limitation concerne notamment, lorsque cela est applicable, les erreurs ou omissions dans les informations, les dysfonctionnements techniques, les interruptions de service, les pertes de données, les problèmes de connexion, les incompatibilités matérielles ou logicielles et les décisions prises par l’utilisateur sur la base des informations fournies.'
      ]
    },
    {
      title: 'Sources externes',
      paragraphs: [
        'Lorsque l’application utilise ou référence des données provenant de sources externes, celles-ci peuvent évoluer, devenir indisponibles ou être modifiées indépendamment de l’éditeur. L’éditeur ne garantit donc pas la disponibilité permanente ni l’exactitude des contenus provenant de ces sources.'
      ]
    },
    {
      title: 'Évolution de l’application',
      paragraphs: [
        'Les fonctionnalités, contenus, données et services proposés par l’application peuvent être modifiés, mis à jour, suspendus ou supprimés à tout moment afin d’assurer son évolution et sa maintenance.'
      ]
    }
  ]
};
