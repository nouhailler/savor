import { useEffect, useState } from 'react';

// Le service worker est enregistré dans main.tsx ; il signale ici qu'une mise à jour attend.
let applyUpdate: (() => void) | null = null;
const listeners = new Set<() => void>();

export function announceUpdate(apply: () => void) {
  applyUpdate = apply;
  listeners.forEach((l) => l());
}

export function UpdateBanner() {
  const [available, setAvailable] = useState(applyUpdate !== null);
  useEffect(() => {
    const l = () => setAvailable(true);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  if (!available) return null;
  return (
    <div className="notice-bar" role="status">
      Une nouvelle version est prête. Votre progression sera conservée.
      <button type="button" className="btn-link" onClick={() => applyUpdate?.()}>Mettre à jour</button>
    </div>
  );
}
