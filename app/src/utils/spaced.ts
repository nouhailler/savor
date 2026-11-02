import type { QuestionStat } from '../types/user';
import { addDays } from './date';

/** Intervalles (jours) de la méthode de Leitner : boîte 1 à 5. */
export const INTERVALS = [0, 1, 3, 7, 16, 35];

export function nextStat(prev: QuestionStat | undefined, questionId: string, correct: boolean, today: string): QuestionStat {
  const box = correct ? Math.min((prev?.box ?? 1) + 1, 5) : 1;
  return {
    questionId,
    box,
    due: addDays(today, correct ? INTERVALS[box] : 1),
    correct: (prev?.correct ?? 0) + (correct ? 1 : 0),
    wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
    lastSeen: today,
    lastCorrect: correct
  };
}

export function isDue(stat: QuestionStat, today: string): boolean {
  return stat.due <= today;
}

/** Part de bonnes réponses, de 0 à 1. */
export function mastery(stat: QuestionStat): number {
  const total = stat.correct + stat.wrong;
  return total ? stat.correct / total : 0;
}

/** Questions à revoir, les plus urgentes et les plus fragiles d'abord. */
export function selectForReview(stats: QuestionStat[], today: string, limit: number): QuestionStat[] {
  return stats
    .filter((s) => isDue(s, today))
    .sort((a, b) => a.box - b.box || mastery(a) - mastery(b) || a.due.localeCompare(b.due))
    .slice(0, limit);
}

export function selectFailed(stats: QuestionStat[], limit: number): QuestionStat[] {
  return stats
    .filter((s) => !s.lastCorrect)
    .sort((a, b) => mastery(a) - mastery(b))
    .slice(0, limit);
}

export function selectWeakest(stats: QuestionStat[], limit: number): QuestionStat[] {
  return stats
    .filter((s) => s.wrong > 0)
    .sort((a, b) => mastery(a) - mastery(b) || a.box - b.box)
    .slice(0, limit);
}

/** La question appartient à la leçon dont l'identifiant la préfixe : « l-4-1-2-q3 ». */
export function lessonIdOfQuestion(questionId: string): string {
  return questionId.replace(/-q\d+$/, '');
}
