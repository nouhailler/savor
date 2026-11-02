import { useSyncExternalStore } from 'react';

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallPlatform = 'ios' | 'android' | 'firefox-desktop' | 'safari-desktop' | 'other';

interface InstallState {
  installed: boolean;
  canPrompt: boolean;
}

let promptEvent: InstallPromptEvent | null = null;
let state: InstallState = { installed: isStandalone(), canPrompt: false };
const listeners = new Set<() => void>();

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return !!window.matchMedia?.('(display-mode: standalone)').matches || nav.standalone === true;
}

function setState(patch: Partial<InstallState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

// Le navigateur n'envoie cet événement qu'une fois, parfois avant le premier affichage :
// on l'écoute dès le chargement du module, importé tout au début de main.tsx.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    promptEvent = e as InstallPromptEvent;
    setState({ canPrompt: true });
  });
  window.addEventListener('appinstalled', () => {
    promptEvent = null;
    setState({ installed: true, canPrompt: false });
  });
}

export const useInstallState = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => state
  );

/** Ouvre la fenêtre d'installation du navigateur, lorsqu'il en propose une. */
export async function promptInstall(): Promise<boolean> {
  if (!promptEvent) return false;
  const e = promptEvent;
  await e.prompt();
  const { outcome } = await e.userChoice;
  promptEvent = null;
  setState({ canPrompt: false, installed: outcome === 'accepted' });
  return outcome === 'accepted';
}

export function detectPlatform(ua = navigator.userAgent, touchPoints = navigator.maxTouchPoints): InstallPlatform {
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && touchPoints > 1)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  if (/Firefox\//.test(ua)) return 'firefox-desktop';
  if (/Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return 'safari-desktop';
  return 'other';
}

export const INSTALL_STEPS: Record<InstallPlatform, { title: string; steps: string[]; note?: string }> = {
  ios: {
    title: 'Sur iPhone ou iPad',
    steps: ['Ouvrez cette page dans Safari.', 'Touchez le bouton Partager, le carré d’où sort une flèche.', 'Choisissez « Sur l’écran d’accueil ».', 'Touchez « Ajouter ».']
  },
  android: {
    title: 'Sur Android',
    steps: ['Ouvrez le menu du navigateur, souvent trois points en haut à droite.', 'Choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ».', 'Confirmez.']
  },
  'firefox-desktop': {
    title: 'Sur ordinateur avec Firefox',
    steps: ['Ouvrez cette page dans Chrome ou Edge.', 'Cliquez sur l’icône d’installation, à droite de la barre d’adresse.', 'Confirmez.'],
    note: 'Firefox pour ordinateur ne permet pas d’installer une application web. Vous pouvez aussi ajouter cette page à vos marque-pages.'
  },
  'safari-desktop': {
    title: 'Sur Mac avec Safari',
    steps: ['Ouvrez le menu Fichier.', 'Choisissez « Ajouter au Dock ».', 'Confirmez.']
  },
  other: {
    title: 'Sur votre navigateur',
    steps: ['Cherchez l’icône d’installation à droite de la barre d’adresse.', 'À défaut, ouvrez le menu du navigateur et choisissez « Installer l’application ».', 'Confirmez.'],
    note: 'Si cette option n’apparaît pas, l’application est peut-être déjà installée, ou le navigateur ne le permet pas sur cette adresse.'
  }
};
