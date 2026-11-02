// Modèle de contenu pédagogique — cf. cahier des charges, section 8.
// Les contenus vivent dans src/content (JSON), séparés du code applicatif.

export type Level = 'beginner' | 'intermediate' | 'advanced';
export const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced'];

/** Statut d'un usage (section 9.3). */
export type ConventionType =
  | 'universal_principle'
  | 'modern_custom'
  | 'traditional_custom'
  | 'historical_custom'
  | 'cultural_custom'
  | 'contextual_rule';

/** Degré de normativité (section 9.3) — ne jamais confondre convention et obligation légale. */
export type Normativity = 'recommendation' | 'common_usage' | 'formal_convention' | 'legal_obligation';

export interface Reference {
  title: string;
  author?: string;
  publisher?: string;
  year?: string;
  url?: string;
  note?: string;
}

export interface Revision {
  version: string;
  date: string;
  note: string;
}

export interface LevelInfo {
  level: Level;
  title: string;
  description: string;
}

export interface CatalogLesson {
  id: string;
  /** Numérotation du cahier des charges, ex. « 4.1.2 ». */
  number: string;
  level: Level;
  title: string;
  /** Points du programme, repris du catalogue de référence. */
  topics: string[];
  /** Résumé éditorial (leçons rédigées). */
  summary?: string;
  estimatedDuration?: number;
  tags?: string[];
}

export interface Domain {
  id: string;
  slug: string;
  number: number;
  title: string;
  shortTitle: string;
  description: string;
  objective: string;
  icon: string;
  order: number;
  active: boolean;
  levels: LevelInfo[];
  lessons: CatalogLesson[];
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  rationale: string;
  context: string;
  recommendedBehavior: string;
  exceptions: string[];
  /** Comment réagir si la règle n'a pas été respectée (section 9.2, question 7). */
  remedy: string;
  conventionType: ConventionType;
  normativity: Normativity;
}

export interface Example {
  context: string;
  behavior: string;
  explanation: string;
}

export interface Mistake {
  situation: string;
  behavior: string;
  consequences: string;
  alternative: string;
}

export interface Nuance {
  title: string;
  text: string;
}

export interface Section {
  title: string;
  /** Paragraphes séparés par une ligne vide. */
  content: string;
}

export type QuestionType = 'single' | 'multiple' | 'truefalse';

export interface Question {
  id: string;
  type: QuestionType;
  /** Sous-type pédagogique affiché (QCM, choix d'une formulation, identification d'une maladresse…). */
  kind?: 'qcm' | 'formulation' | 'maladresse' | 'vrai-faux' | 'situation';
  statement: string;
  choices: string[];
  correctAnswers: number[];
  explanation: string;
  difficulty: 1 | 2 | 3;
  tags?: string[];
}

export interface Quiz {
  passingScore: number;
  questions: Question[];
}

export interface MatchingExercise {
  type: 'matching';
  title: string;
  instructions: string;
  pairs: { left: string; right: string }[];
  explanation: string;
}

export interface OrderingExercise {
  type: 'ordering';
  title: string;
  instructions: string;
  /** Étapes dans le bon ordre ; l'interface les mélange. */
  items: string[];
  explanation: string;
}

export interface CaseStudyExercise {
  type: 'case';
  title: string;
  situation: string;
  questions: string[];
  modelAnswer: string;
}

export type Exercise = MatchingExercise | OrderingExercise | CaseStudyExercise;

export interface Lesson {
  id: string;
  version: string;
  /** `validated` est réservé à une relecture éditoriale humaine ; le test de contenu ne vaut pas validation. */
  status: 'draft' | 'validated';
  createdAt: string;
  updatedAt: string;
  objectives: string[];
  introduction: string;
  sections: Section[];
  rules: Rule[];
  /** « Pourquoi cette règle existe » : sens et origine des usages. */
  why: string;
  examples: Example[];
  mistakes: Mistake[];
  nuances: Nuance[];
  contexts: string[];
  keyPoints: string[];
  exercise: Exercise;
  quiz: Quiz;
  references: Reference[];
  revisions: Revision[];
}

/** Leçon complète : métadonnées du catalogue + contenu rédigé. */
export interface FullLesson extends CatalogLesson, Lesson {
  domainId: string;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  /** 1 = recommandé, 0.5 = acceptable, 0 = à éviter. */
  score: 0 | 0.5 | 1;
  feedbackTitle: string;
  feedback: string;
  nextStepId?: string;
}

export interface ScenarioStep {
  id: string;
  narrative: string;
  question: string;
  choices: ScenarioChoice[];
}

export interface Scenario {
  id: string;
  domainId: string;
  level: Level;
  title: string;
  description: string;
  context: string;
  characters: string[];
  estimatedDuration: number;
  steps: ScenarioStep[];
  /** La règle en jeu, rappelée à la fin. */
  rule: string;
  nuance?: string;
  relatedLessonIds: string[];
  tags: string[];
}

export interface PracticalSheet {
  id: string;
  domainId: string;
  title: string;
  situation: string;
  advice: string[];
  reasons: string;
  mistakes: string[];
  example: string;
  culturalNuances?: string;
  relatedLessonIds: string[];
  tags: string[];
}

export interface DictionaryEntry {
  id: string;
  term: string;
  definition: string;
  explanation: string;
  context: string;
  example: string;
  related: string[];
  lessonIds: string[];
  etymology?: string;
}

export interface CountrySection {
  key: CountrySectionKey;
  items: string[];
}

export type CountrySectionKey =
  | 'greetings'
  | 'punctuality'
  | 'invitations'
  | 'table'
  | 'gifts'
  | 'dress'
  | 'verbal'
  | 'nonverbal'
  | 'sensitive'
  | 'professional'
  | 'mistakes'
  | 'tips';

export interface Country {
  id: string;
  slug: string;
  name: string;
  region: string;
  languages: string[];
  intro: string;
  highlights: { label: string; value: string }[];
  sections: CountrySection[];
  phrases: { original: string; meaning: string }[];
  generalizationNote: string;
  sources: Reference[];
  lastVerifiedAt: string;
}

export type ContentKind = 'lesson' | 'scenario' | 'sheet' | 'dictionary' | 'country' | 'rule';
