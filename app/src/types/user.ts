// Données utilisateur — conservées uniquement sur l'appareil (IndexedDB).
import type { Level } from './content';

export type FavoriteType = 'lesson' | 'rule' | 'sheet' | 'scenario' | 'dictionary' | 'country';

export interface Favorite {
  id: string;
  targetType: FavoriteType;
  targetId: string;
  createdAt: string;
}

export interface LessonProgress {
  lessonId: string;
  status: 'in_progress' | 'completed';
  firstOpenedAt: string;
  lastOpenedAt: string;
  completionDate?: string;
  /** Part lue, de 0 à 100. */
  readPercent: number;
  bestScore?: number;
  attempts: number;
  lastAttemptDate?: string;
  exerciseDone?: boolean;
}

export interface QuizAttempt {
  id: string;
  /** Identifiant de leçon, ou clé d'évaluation, ou « revision ». */
  source: string;
  sourceType: 'lesson' | 'evaluation' | 'review' | 'challenge';
  score: number;
  total: number;
  percent: number;
  date: string;
}

export interface QuestionStat {
  questionId: string;
  /** Boîte de Leitner, de 1 (fragile) à 5 (acquis). */
  box: number;
  due: string;
  correct: number;
  wrong: number;
  lastSeen: string;
  lastCorrect: boolean;
}

export interface ScenarioResult {
  scenarioId: string;
  bestPercent: number;
  lastPercent: number;
  attempts: number;
  lastDate: string;
}

export interface EvaluationResult {
  key: string;
  domainId: string;
  level?: Level;
  kind: 'initial' | 'final';
  percent: number;
  passed: boolean;
  date: string;
  /** Pour l'évaluation initiale : niveau conseillé. */
  recommendedLevel?: Level;
}

export interface ChallengeResult {
  date: string;
  scenarioId: string;
  percent: number;
}

export type ActivityKind = 'lesson' | 'quiz' | 'scenario' | 'evaluation' | 'challenge' | 'review' | 'exercise';

export interface ActivityEntry {
  kind: ActivityKind;
  targetId: string;
  title: string;
  detail: string;
  date: string;
}

export type ThemeSetting = 'light' | 'dark' | 'system';
export type FontScale = 'normal' | 'large' | 'xlarge';

export interface UserSettings {
  displayName: string;
  theme: ThemeSetting;
  fontSize: FontScale;
  preferredLevel: Level | 'auto';
  dailyChallengeEnabled: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  expandRuleDetails: boolean;
}

export interface UserData {
  schemaVersion: 1;
  createdAt: string;
  updatedAt: string;
  introSeen: boolean;
  /** Version de l'avertissement légal acceptée sur cet appareil. */
  legalNoticeVersion?: string;
  lessons: Record<string, LessonProgress>;
  attempts: QuizAttempt[];
  questions: Record<string, QuestionStat>;
  scenarios: Record<string, ScenarioResult>;
  evaluations: Record<string, EvaluationResult>;
  challenges: Record<string, ChallengeResult>;
  favorites: Favorite[];
  activity: ActivityEntry[];
  lastLessonId?: string;
  settings: UserSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  displayName: '',
  theme: 'light',
  fontSize: 'normal',
  preferredLevel: 'auto',
  dailyChallengeEnabled: true,
  reduceMotion: false,
  highContrast: false,
  expandRuleDetails: false
};

export function emptyUserData(now: string = new Date().toISOString()): UserData {
  return {
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    introSeen: false,
    lessons: {},
    attempts: [],
    questions: {},
    scenarios: {},
    evaluations: {},
    challenges: {},
    favorites: [],
    activity: [],
    settings: { ...DEFAULT_SETTINGS }
  };
}
