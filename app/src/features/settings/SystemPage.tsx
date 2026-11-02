import { useEffect, useState } from 'react';
import { ArrowsClockwise, Lightning } from '@phosphor-icons/react';
import { usePageTitle, useToast } from '../../components/ui';
import { useUser } from '../../storage/UserContext';
import { InstallButton } from '../../components/InstallButton';
import { checkForUpdates, forceUpdate, useUpdateState, type UpdatePhase } from '../../services/updates';
import { isAutoUpdateEnabled, setAutoUpdateEnabled } from '../../utils/updatePrefs';

const DATE_TIME = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
const DATE = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });

const STATUS: Record<UpdatePhase, string> = {
  idle: 'Aucune vérification depuis l’ouverture.',
  checking: 'Vérification en cours…',
  current: 'Vous avez la dernière version.',
  downloading: 'Une nouvelle version se télécharge en arrière-plan.',
  ready: 'Une nouvelle version est prête à être installée.',
  applying: 'Installation en cours…',
  offline: 'Pas de connexion : la vérification reprendra dès votre retour en ligne.',
  error: 'Le serveur n’a pas répondu. Rien n’a été modifié ; réessayez plus tard.',
  unsupported: 'Les mises à jour ne sont actives que dans la version publiée de l’application.'
};

export default function SystemPage() {
  usePageTitle('Paramètres système');
  const { phase, lastCheck } = useUpdateState();
  const toast = useToast();
  const { acknowledgeLegal } = useUser();
  const [auto, setAuto] = useState(isAutoUpdateEnabled);
  const [online, setOnline] = useState(navigator.onLine);
  const busy = phase === 'checking' || phase === 'applying';

  useEffect(() => {
    const onNet = () => setOnline(navigator.onLine);
    window.addEventListener('online', onNet);
    window.addEventListener('offline', onNet);
    return () => {
      window.removeEventListener('online', onNet);
      window.removeEventListener('offline', onNet);
    };
  }, []);

  const toggleAuto = () => {
    setAutoUpdateEnabled(!auto);
    setAuto(!auto);
  };

  const force = async () => {
    if (!window.confirm('Effacer la version enregistrée et retélécharger l’application ? Votre progression, vos favoris et vos réglages sont conservés. Une connexion est nécessaire.')) return;
    if (!(await forceUpdate())) toast('La mise à jour n’a pas pu être lancée. Rien n’a été modifié.');
  };

  return (
    <div className="stack gap-xl narrow">
      <header className="stack gap-s">
        <div className="eyebrow">Application</div>
        <h1 className="display">Paramètres système</h1>
      </header>

      <section className="stack gap-s"><h2 className="eyebrow muted">Version</h2>
        <dl className="setting-group system-facts">
          <div className="setting-row"><dt>Version</dt><dd>{__APP_VERSION__}</dd></div>
          <div className="setting-row"><dt>Date de sortie</dt><dd>{DATE.format(new Date(__APP_RELEASE_DATE__))}</dd></div>
          <div className="setting-row"><dt>Dernière vérification</dt><dd data-testid="last-check">{lastCheck ? DATE_TIME.format(new Date(lastCheck)) : 'Jamais'}</dd></div>
          <div className="setting-row"><dt>Connexion</dt><dd>{online ? 'En ligne' : 'Hors ligne'}</dd></div>
        </dl>
      </section>

      <section className="stack gap-s"><h2 className="eyebrow muted">Mises à jour</h2>
        <div className="setting-group">
          <div className="setting-row">
            <div className="setting-label"><strong>État</strong><span role="status" data-testid="update-status">{STATUS[phase]}</span></div>
            <div className="row">
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void checkForUpdates()}><ArrowsClockwise size={18} aria-hidden="true" />Vérifier les mises à jour</button>
              <button type="button" className="btn btn-secondary" disabled={busy || !online} onClick={() => void force()}><Lightning size={18} aria-hidden="true" />Forcer la mise à jour</button>
            </div>
          </div>
          <div className="setting-row">
            <div className="setting-label">
              <strong>Mises à jour automatiques</strong>
              <span>Vérification à chaque ouverture, puis toutes les heures. La nouvelle version se télécharge en arrière-plan et s’installe quand vous quittez l’application, jamais pendant un quiz.</span>
            </div>
            <button type="button" role="switch" aria-checked={auto} aria-label="Mises à jour automatiques" className="switch" onClick={toggleAuto}>
              <span className="switch-track"><i /></span>
              <span style={{ minWidth: '4.5rem', textAlign: 'left' }}>{auto ? 'Activées' : 'Désactivées'}</span>
            </button>
          </div>
        </div>
      </section>

      <section className="stack gap-s"><h2 className="eyebrow muted">Installation</h2>
        <div className="setting-group">
          <div className="setting-row">
            <div className="setting-label"><strong>Installer l’application</strong><span>Une icône sur votre écran d’accueil ou votre bureau, et un accès sans connexion.</span></div>
            <InstallButton />
          </div>
          <div className="setting-row">
            <div className="setting-label"><strong>Accueil et avertissement</strong><span>Revoir la présentation de l’application et l’avertissement du premier lancement.</span></div>
            <button type="button" className="btn btn-secondary" onClick={() => acknowledgeLegal('')}>Revoir l’accueil</button>
          </div>
        </div>
      </section>
    </div>
  );
}
