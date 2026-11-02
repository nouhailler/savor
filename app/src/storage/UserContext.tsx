import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Level } from '../types/content';
import {
  emptyUserData,
  type ActivityEntry,
  type Favorite,
  type FavoriteType,
  type UserData,
  type UserSettings
} from '../types/user';
import { clearAllData, loadUserData, sanitizeUserData, saveUserData } from './db';
import { dayKey } from '../utils/date';
import { nextStat } from '../utils/spaced';

const MAX_ACTIVITY = 200;
const MAX_ATTEMPTS = 500;

export interface AnswerRecord {
  questionId: string;
  correct: boolean;
}

export interface UserApi {
  data: UserData;
  ready: boolean;
  recovered: boolean;
  volatile: boolean;
  openLesson(lessonId: string, title: string): void;
  setReadPercent(lessonId: string, percent: number): void;
  completeLesson(lessonId: string, title: string, completed: boolean): void;
  markExerciseDone(lessonId: string, title: string): void;
  recordQuiz(input: {
    source: string;
    sourceType: 'lesson' | 'evaluation' | 'review';
    title: string;
    score: number;
    total: number;
    answers: AnswerRecord[];
    lessonId?: string;
  }): void;
  recordAnswers(answers: AnswerRecord[]): void;
  recordScenario(scenarioId: string, title: string, percent: number): void;
  recordChallenge(scenarioId: string, title: string, percent: number): void;
  recordEvaluation(input: {
    domainId: string;
    level?: Level;
    kind: 'initial' | 'final';
    percent: number;
    passed: boolean;
    recommendedLevel?: Level;
    title: string;
  }): void;
  isFavorite(type: FavoriteType, id: string): boolean;
  toggleFavorite(type: FavoriteType, id: string): boolean;
  removeFavorite(id: string): void;
  updateSettings(patch: Partial<UserSettings>): void;
  setIntroSeen(): void;
  acknowledgeLegal(version: string): void;
  exportData(): string;
  importData(json: string): boolean;
  resetProgress(): void;
  eraseEverything(): Promise<void>;
}

const Ctx = createContext<UserApi | null>(null);

function pushActivity(list: ActivityEntry[], e: ActivityEntry): ActivityEntry[] {
  return [e, ...list].slice(0, MAX_ACTIVITY);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UserData>(() => emptyUserData());
  const [ready, setReady] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const [volatile, setVolatile] = useState(false);
  const latest = useRef(data);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dirty = useRef(false);

  useEffect(() => {
    let alive = true;
    loadUserData().then((r) => {
      if (!alive) return;
      latest.current = r.data;
      setData(r.data);
      setRecovered(r.recovered);
      setVolatile(r.volatile);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const flush = useCallback(() => {
    if (!dirty.current) return;
    dirty.current = false;
    saveUserData(latest.current).catch(() => setVolatile(true));
  }, []);

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);

  const update = useCallback(
    (fn: (d: UserData) => UserData) => {
      const next = { ...fn(latest.current), updatedAt: new Date().toISOString() };
      latest.current = next;
      setData(next);
      dirty.current = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, 250);
    },
    [flush]
  );

  const api = useMemo<UserApi>(() => {
    const now = () => new Date().toISOString();
    return {
      data,
      ready,
      recovered,
      volatile,
      openLesson(lessonId, title) {
        update((d) => {
          const prev = d.lessons[lessonId];
          const t = now();
          const recentlyLogged = d.activity[0]?.targetId === lessonId && d.activity[0]?.kind === 'lesson';
          return {
            ...d,
            lastLessonId: lessonId,
            lessons: {
              ...d.lessons,
              [lessonId]: prev
                ? { ...prev, lastOpenedAt: t }
                : { lessonId, status: 'in_progress', firstOpenedAt: t, lastOpenedAt: t, readPercent: 0, attempts: 0 }
            },
            activity: recentlyLogged
              ? d.activity
              : pushActivity(d.activity, { kind: 'lesson', targetId: lessonId, title, detail: prev?.status === 'completed' ? 'relue' : 'ouverte', date: t })
          };
        });
      },
      setReadPercent(lessonId, percent) {
        const p = Math.round(Math.max(0, Math.min(100, percent)));
        const prev = latest.current.lessons[lessonId];
        if (!prev || p <= prev.readPercent) return;
        update((d) => ({ ...d, lessons: { ...d.lessons, [lessonId]: { ...d.lessons[lessonId], readPercent: p } } }));
      },
      completeLesson(lessonId, title, completed) {
        update((d) => {
          const prev = d.lessons[lessonId];
          const t = now();
          const base = prev ?? { lessonId, firstOpenedAt: t, lastOpenedAt: t, readPercent: 0, attempts: 0, status: 'in_progress' as const };
          return {
            ...d,
            lessons: {
              ...d.lessons,
              [lessonId]: {
                ...base,
                status: completed ? 'completed' : 'in_progress',
                completionDate: completed ? t : undefined,
                readPercent: completed ? 100 : base.readPercent
              }
            },
            activity: completed
              ? pushActivity(d.activity, { kind: 'lesson', targetId: lessonId, title, detail: 'terminée', date: t })
              : d.activity
          };
        });
      },
      markExerciseDone(lessonId, title) {
        update((d) => {
          const prev = d.lessons[lessonId];
          if (!prev || prev.exerciseDone) return d;
          return {
            ...d,
            lessons: { ...d.lessons, [lessonId]: { ...prev, exerciseDone: true } },
            activity: pushActivity(d.activity, { kind: 'exercise', targetId: lessonId, title, detail: 'exercice réalisé', date: now() })
          };
        });
      },
      recordQuiz({ source, sourceType, title, score, total, answers, lessonId }) {
        update((d) => {
          const t = now();
          const today = dayKey();
          const questions = { ...d.questions };
          for (const a of answers) questions[a.questionId] = nextStat(questions[a.questionId], a.questionId, a.correct, today);
          const percent = total ? Math.round((score / total) * 100) : 0;
          const lessons = { ...d.lessons };
          if (lessonId) {
            const prev = lessons[lessonId] ?? { lessonId, status: 'in_progress' as const, firstOpenedAt: t, lastOpenedAt: t, readPercent: 0, attempts: 0 };
            lessons[lessonId] = {
              ...prev,
              attempts: prev.attempts + 1,
              lastAttemptDate: t,
              bestScore: Math.max(prev.bestScore ?? 0, percent)
            };
          }
          return {
            ...d,
            lessons,
            questions,
            attempts: [{ id: `${source}-${t}`, source, sourceType, score, total, percent, date: t }, ...d.attempts].slice(0, MAX_ATTEMPTS),
            activity: pushActivity(d.activity, {
              kind: sourceType === 'review' ? 'review' : 'quiz',
              targetId: source,
              title,
              detail: `${score} / ${total}`,
              date: t
            })
          };
        });
      },
      recordAnswers(answers) {
        update((d) => {
          const today = dayKey();
          const questions = { ...d.questions };
          for (const a of answers) questions[a.questionId] = nextStat(questions[a.questionId], a.questionId, a.correct, today);
          return { ...d, questions };
        });
      },
      recordScenario(scenarioId, title, percent) {
        update((d) => {
          const prev = d.scenarios[scenarioId];
          const t = now();
          return {
            ...d,
            scenarios: {
              ...d.scenarios,
              [scenarioId]: {
                scenarioId,
                bestPercent: Math.max(prev?.bestPercent ?? 0, percent),
                lastPercent: percent,
                attempts: (prev?.attempts ?? 0) + 1,
                lastDate: t
              }
            },
            activity: pushActivity(d.activity, { kind: 'scenario', targetId: scenarioId, title, detail: `${percent} %`, date: t })
          };
        });
      },
      recordChallenge(scenarioId, title, percent) {
        update((d) => {
          const today = dayKey();
          if (d.challenges[today]) return d;
          return {
            ...d,
            challenges: { ...d.challenges, [today]: { date: today, scenarioId, percent } },
            activity: pushActivity(d.activity, { kind: 'challenge', targetId: scenarioId, title, detail: `défi du jour · ${percent} %`, date: now() })
          };
        });
      },
      recordEvaluation({ domainId, level, kind, percent, passed, recommendedLevel, title }) {
        update((d) => {
          const key = `${domainId}:${level ?? 'all'}:${kind}`;
          const t = now();
          const prev = d.evaluations[key];
          // Une validation acquise le reste : un essai moins bon ne l'efface pas.
          const keep = prev?.passed && !passed;
          return {
            ...d,
            evaluations: {
              ...d.evaluations,
              [key]: keep
                ? { ...prev, date: t }
                : { key, domainId, level, kind, percent: Math.max(percent, prev?.passed ? prev.percent : 0), passed, date: t, recommendedLevel }
            },
            attempts: [
              { id: `${key}-${t}`, source: key, sourceType: 'evaluation' as const, score: percent, total: 100, percent, date: t },
              ...d.attempts
            ].slice(0, MAX_ATTEMPTS),
            activity: pushActivity(d.activity, { kind: 'evaluation', targetId: key, title, detail: `${percent} %`, date: t })
          };
        });
      },
      isFavorite(type, id) {
        return data.favorites.some((f) => f.targetType === type && f.targetId === id);
      },
      toggleFavorite(type, id) {
        const key = `${type}:${id}`;
        const exists = latest.current.favorites.some((f) => f.id === key);
        update((d) => ({
          ...d,
          favorites: exists
            ? d.favorites.filter((f) => f.id !== key)
            : [{ id: key, targetType: type, targetId: id, createdAt: now() } as Favorite, ...d.favorites]
        }));
        return !exists;
      },
      removeFavorite(id) {
        update((d) => ({ ...d, favorites: d.favorites.filter((f) => f.id !== id) }));
      },
      updateSettings(patch) {
        update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
      },
      setIntroSeen() {
        update((d) => (d.introSeen ? d : { ...d, introSeen: true }));
      },
      acknowledgeLegal(version) {
        update((d) => ({ ...d, legalNoticeVersion: version }));
      },
      exportData() {
        return JSON.stringify(latest.current, null, 2);
      },
      importData(json) {
        try {
          const clean = sanitizeUserData(JSON.parse(json));
          if (!clean) return false;
          update(() => clean);
          return true;
        } catch {
          return false;
        }
      },
      resetProgress() {
        update((d) => ({
          ...emptyUserData(d.createdAt),
          introSeen: d.introSeen,
          legalNoticeVersion: d.legalNoticeVersion,
          favorites: d.favorites,
          settings: d.settings
        }));
      },
      async eraseEverything() {
        clearTimeout(timer.current);
        dirty.current = false;
        await clearAllData();
        const fresh = emptyUserData();
        latest.current = fresh;
        setData(fresh);
      }
    };
  }, [data, ready, recovered, volatile, update]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useUser(): UserApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useUser doit être utilisé dans UserProvider');
  return v;
}
