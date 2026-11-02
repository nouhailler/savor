// Préférences techniques de mise à jour : propres à cet appareil, hors de la sauvegarde exportable.
const KEYS = { lastCheck: 'sv_update_last_check', auto: 'sv_update_auto', build: 'sv_update_build' } as const;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Stockage refusé : la préférence ne vaudra que pour cette session.
  }
}

export const getLastCheck = () => read(KEYS.lastCheck);
export const setLastCheck = (iso: string) => write(KEYS.lastCheck, iso);
export const isAutoUpdateEnabled = () => read(KEYS.auto) !== 'off';
export const setAutoUpdateEnabled = (on: boolean) => write(KEYS.auto, on ? 'on' : 'off');
export const getKnownBuild = () => read(KEYS.build);
export const setKnownBuild = (build: string) => write(KEYS.build, build);

export function clearUpdatePrefs() {
  for (const key of Object.values(KEYS)) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Rien à effacer si le stockage est refusé.
    }
  }
}
