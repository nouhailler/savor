import { useSyncExternalStore } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { getKnownBuild, getLastCheck, isAutoUpdateEnabled, setKnownBuild, setLastCheck } from '../utils/updatePrefs';

export type UpdatePhase = 'idle' | 'checking' | 'current' | 'downloading' | 'ready' | 'applying' | 'offline' | 'error' | 'unsupported';

export interface UpdateState {
  phase: UpdatePhase;
  lastCheck: string | null;
  /** Vrai au premier affichage après l'installation d'une nouvelle version. */
  justUpdated: boolean;
}

/** Une vérification par heure tant que l'application est ouverte, en plus de celle de chaque ouverture. */
export const CHECK_INTERVAL_MS = 60 * 60 * 1000;
/** Juste après l'ouverture et tant que rien n'a été touché, la nouvelle version peut s'appliquer sans gêne. */
const LAUNCH_WINDOW_MS = 8000;
// Un rechargement perdrait les réponses d'un quiz, d'une évaluation ou d'une situation en cours.
const BUSY_ROUTE = /\/quiz\b|\/evaluations\/.+|\/situations\/.+/;

let state: UpdateState = { phase: 'idle', lastCheck: getLastCheck(), justUpdated: false };
let applyPending: (() => void) | null = null;
const startedAt = Date.now();
let interacted = false;
const listeners = new Set<() => void>();

function setState(patch: Partial<UpdateState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export const useUpdateState = () => useSyncExternalStore(subscribe, () => state);
export const dismissJustUpdated = () => setState({ justUpdated: false });

function canApplyNow(): boolean {
  if (BUSY_ROUTE.test(window.location.hash)) return false;
  return document.visibilityState === 'hidden' || (!interacted && Date.now() - startedAt < LAUNCH_WINDOW_MS);
}

function applyIfPossible() {
  if (applyPending && isAutoUpdateEnabled() && canApplyNow()) applyNow();
}

/** Installe la version déjà téléchargée, puis recharge la page. */
export function applyNow() {
  if (!applyPending) return;
  setState({ phase: 'applying' });
  applyPending();
}

async function registration(): Promise<ServiceWorkerRegistration | undefined> {
  return navigator.serviceWorker?.getRegistration?.();
}

export async function checkForUpdates(): Promise<UpdatePhase> {
  if (!navigator.onLine) {
    setState({ phase: 'offline' });
    return 'offline';
  }
  const reg = await registration();
  if (!reg) {
    setState({ phase: 'unsupported' });
    return 'unsupported';
  }
  setState({ phase: 'checking' });
  try {
    await reg.update();
    const now = new Date().toISOString();
    setLastCheck(now);
    const phase: UpdatePhase = reg.waiting ? 'ready' : reg.installing ? 'downloading' : 'current';
    setState({ phase, lastCheck: now });
    return phase;
  } catch {
    setState({ phase: 'error' });
    return 'error';
  }
}

/**
 * Efface la version en cache et recharge depuis le réseau. La progression, dans IndexedDB, n'est pas touchée.
 * On vérifie d'abord que le serveur répond : sans réseau, l'application deviendrait inaccessible.
 */
export async function forceUpdate(): Promise<boolean> {
  if (!navigator.onLine) {
    setState({ phase: 'offline' });
    return false;
  }
  try {
    const res = await fetch(`./index.html?force=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(String(res.status));
  } catch {
    setState({ phase: 'error' });
    return false;
  }
  setState({ phase: 'applying' });
  const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
  await Promise.all(regs.map((r) => r.unregister()));
  if ('caches' in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
  window.location.reload();
  return true;
}

export function startUpdates() {
  for (const type of ['pointerdown', 'keydown'] as const) {
    window.addEventListener(type, () => { interacted = true; }, { once: true, capture: true });
  }
  const known = getKnownBuild();
  setKnownBuild(__APP_RELEASE_DATE__);
  if (known && known !== __APP_RELEASE_DATE__) setState({ justUpdated: true });

  const updateSW = registerSW({
    onNeedRefresh() {
      applyPending = () => {
        void updateSW(true);
      };
      setState({ phase: 'ready' });
      applyIfPossible();
    },
    onRegisteredSW() {
      void checkForUpdates();
    }
  });

  setInterval(() => void checkForUpdates(), CHECK_INTERVAL_MS);
  window.addEventListener('online', () => void checkForUpdates());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      applyIfPossible();
      return;
    }
    const last = state.lastCheck ? Date.parse(state.lastCheck) : 0;
    if (Date.now() - last >= CHECK_INTERVAL_MS) void checkForUpdates();
  });
}
