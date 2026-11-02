import { openDB, type IDBPDatabase } from 'idb';
import { DEFAULT_SETTINGS, emptyUserData, type UserData } from '../types/user';
import { clearUpdatePrefs } from '../utils/updatePrefs';

const DB_NAME = 'savoir-vivre';
const STORE = 'documents';
const USER_KEY = 'user';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      }
    });
  }
  return dbPromise;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Valide et répare un document utilisateur (restauration, données locales corrompues).
 * Retourne null si le document est inexploitable.
 */
export function sanitizeUserData(raw: unknown): UserData | null {
  if (!isRecord(raw) || raw.schemaVersion !== 1) return null;
  const base = emptyUserData();
  const asRecord = (v: unknown) => (isRecord(v) ? v : {});
  const asArray = (v: unknown) => (Array.isArray(v) ? v : []);
  return {
    ...base,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : base.createdAt,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : base.updatedAt,
    introSeen: raw.introSeen === true,
    legalNoticeVersion: typeof raw.legalNoticeVersion === 'string' ? raw.legalNoticeVersion : undefined,
    lessons: asRecord(raw.lessons) as UserData['lessons'],
    attempts: asArray(raw.attempts) as UserData['attempts'],
    questions: asRecord(raw.questions) as UserData['questions'],
    scenarios: asRecord(raw.scenarios) as UserData['scenarios'],
    evaluations: asRecord(raw.evaluations) as UserData['evaluations'],
    challenges: asRecord(raw.challenges) as UserData['challenges'],
    favorites: asArray(raw.favorites) as UserData['favorites'],
    activity: asArray(raw.activity) as UserData['activity'],
    lastLessonId: typeof raw.lastLessonId === 'string' ? raw.lastLessonId : undefined,
    settings: { ...DEFAULT_SETTINGS, ...asRecord(raw.settings) } as UserData['settings']
  };
}

export interface LoadResult {
  data: UserData;
  /** Vrai si un document illisible a été écarté (une copie est conservée). */
  recovered: boolean;
  /** Vrai si IndexedDB n'est pas disponible : la session ne sera pas conservée. */
  volatile: boolean;
}

export async function loadUserData(): Promise<LoadResult> {
  try {
    const db = await getDb();
    const raw = await db.get(STORE, USER_KEY);
    if (raw === undefined) return { data: emptyUserData(), recovered: false, volatile: false };
    const clean = sanitizeUserData(raw);
    if (clean) return { data: clean, recovered: false, volatile: false };
    await db.put(STORE, raw, `corrupted-${Date.now()}`);
    return { data: emptyUserData(), recovered: true, volatile: false };
  } catch {
    return { data: emptyUserData(), recovered: false, volatile: true };
  }
}

export async function saveUserData(data: UserData): Promise<void> {
  const db = await getDb();
  await db.put(STORE, data, USER_KEY);
}

export async function clearAllData(): Promise<void> {
  const db = await getDb();
  await db.clear(STORE);
  clearUpdatePrefs();
}

/** Pour les tests : referme la connexion. */
export async function closeDb(): Promise<void> {
  if (dbPromise) {
    (await dbPromise).close();
    dbPromise = null;
  }
}
