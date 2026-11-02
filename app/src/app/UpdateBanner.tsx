import { applyNow, dismissJustUpdated, useUpdateState } from '../services/updates';

export function UpdateBanner() {
  const { phase, justUpdated } = useUpdateState();
  if (phase === 'ready' || phase === 'applying') {
    return (
      <div className="notice-bar" role="status">
        Une nouvelle version est prête. Elle s’installera à votre prochain passage, sans toucher à votre progression.
        <button type="button" className="btn-link" onClick={applyNow}>Installer maintenant</button>
      </div>
    );
  }
  if (!justUpdated) return null;
  return (
    <div className="notice-bar" role="status">
      L’application vient d’être mise à jour (version {__APP_VERSION__}).
      <button type="button" className="btn-link" onClick={dismissJustUpdated}>Fermer</button>
    </div>
  );
}
