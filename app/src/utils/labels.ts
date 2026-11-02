import type { ConventionType, Level, Normativity } from '../types/content';

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé'
};

export const LEVEL_SUBTITLE: Record<Level, string> = {
  beginner: 'Acquérir les fondamentaux',
  intermediate: 'Maîtriser les usages',
  advanced: 'Cultiver l’art du savoir-vivre'
};

export const LEVEL_RANK: Record<Level, number> = { beginner: 1, intermediate: 2, advanced: 3 };

/** Seuils de validation proposés par le cahier des charges (section 5.12). */
export const LEVEL_THRESHOLD: Record<Level, number> = { beginner: 70, intermediate: 75, advanced: 80 };

export const CONVENTION_LABEL: Record<ConventionType, string> = {
  universal_principle: 'Principe intemporel',
  modern_custom: 'Usage contemporain',
  traditional_custom: 'Convention traditionnelle',
  historical_custom: 'Usage historique',
  cultural_custom: 'Pratique culturelle',
  contextual_rule: 'Selon les circonstances'
};

export const CONVENTION_HELP: Record<ConventionType, string> = {
  universal_principle: 'Un principe de respect valable partout et en tout temps.',
  modern_custom: 'Un usage actuel, largement partagé aujourd’hui.',
  traditional_custom: 'Une convention héritée, toujours pratiquée dans les cadres formels.',
  historical_custom: 'Un usage d’autrefois, présenté pour la culture : il n’est plus attendu.',
  cultural_custom: 'Une pratique propre à une culture ou à une région.',
  contextual_rule: 'Une règle qui dépend du lieu, des personnes et du moment.'
};

export const NORMATIVITY_LABEL: Record<Normativity, string> = {
  recommendation: 'Recommandation',
  common_usage: 'Usage courant',
  formal_convention: 'Convention formelle',
  legal_obligation: 'Obligation légale'
};

export const EXERCISE_LABEL = {
  matching: 'Association',
  ordering: 'Classement',
  case: 'Étude de cas'
} as const;

export const QUESTION_KIND_LABEL: Record<string, string> = {
  qcm: 'QCM',
  formulation: 'Choix d’une formulation',
  maladresse: 'Identifier la maladresse',
  'vrai-faux': 'Vrai ou faux',
  situation: 'Situation'
};
