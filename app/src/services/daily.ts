import type { CatalogLesson, Level, Scenario } from '../types/content';
import { LEVELS } from '../types/content';
import type { UserData } from '../types/user';
import { daysBetween, dayKey } from '../utils/date';
import { seededShuffle } from '../utils/text';
import { availableLessons, scenarios } from './content';

const EPOCH = '2026-01-01';

/** Défi du jour : parcours stable et sans répétition de l'ensemble des situations. */
export function dailyScenario(day: string = dayKey()): Scenario | undefined {
  if (!scenarios.length) return undefined;
  const n = scenarios.length;
  const offset = Math.abs(daysBetween(EPOCH, day));
  const cycle = Math.floor(offset / n);
  const order = seededShuffle(scenarios, cycle + 7);
  return order[offset % n];
}

export function lessonStatus(data: UserData, id: string): 'completed' | 'in_progress' | 'todo' {
  return data.lessons[id]?.status ?? 'todo';
}

/** Niveau de travail : le choix de l'utilisateur, sinon le plus bas qui n'est pas achevé. */
export function currentLevel(data: UserData): Level {
  if (data.settings.preferredLevel !== 'auto') return data.settings.preferredLevel;
  for (const level of LEVELS) {
    if (availableLessons(undefined, level).some((l) => lessonStatus(data, l.id) !== 'completed')) return level;
  }
  return 'advanced';
}

export function recommendedLesson(data: UserData): CatalogLesson | undefined {
  const start = LEVELS.indexOf(currentLevel(data));
  const order = [...LEVELS.slice(start), ...LEVELS.slice(0, start)];
  for (const level of order) {
    const found = availableLessons(undefined, level).find((l) => lessonStatus(data, l.id) === 'todo' && l.id !== data.lastLessonId);
    if (found) return found;
  }
  return undefined;
}

export function globalProgress(data: UserData) {
  const all = availableLessons();
  const done = all.filter((l) => lessonStatus(data, l.id) === 'completed').length;
  return { done, total: all.length, percent: all.length ? Math.round((done / all.length) * 100) : 0 };
}

export function domainProgress(data: UserData, domainId: string, level?: Level) {
  const all = availableLessons(domainId, level);
  const done = all.filter((l) => lessonStatus(data, l.id) === 'completed').length;
  return { done, total: all.length, percent: all.length ? Math.round((done / all.length) * 100) : 0 };
}
