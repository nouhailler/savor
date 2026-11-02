import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { DownloadSimple, Export, Trash, UploadSimple } from '@phosphor-icons/react';
import { useUser } from '../../storage/UserContext';
import { useToast, usePageTitle } from '../../components/ui';
import { LEVELS } from '../../types/content';
import type { FontScale, ThemeSetting, UserSettings } from '../../types/user';
import { LEVEL_LABEL } from '../../utils/labels';
import { dayKey } from '../../utils/date';

interface InstallEvent extends Event { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> }

function Row({ label, desc, children }: { label: string; desc: string; children: ReactNode }) {
  return (
    <div className="setting-row">
      <div className="setting-label"><strong>{label}</strong><span>{desc}</span></div>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)}>
      <span className="switch-track"><i /></span>
      <span style={{ minWidth: '4.5rem', textAlign: 'left' }}>{checked ? 'Activé' : 'Désactivé'}</span>
    </button>
  );
}

function Seg<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="seg">
      {options.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}>{l}</button>)}
    </div>
  );
}

export default function SettingsPage() {
  usePageTitle('Paramètres');
  const { data, updateSettings, exportData, importData, resetProgress, eraseEverything } = useUser();
  const toast = useToast();
  const s = data.settings;
  const set = (patch: Partial<UserSettings>) => updateSettings(patch);
  const fileRef = useRef<HTMLInputElement>(null);
  const [storage, setStorage] = useState('');
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [sw, setSw] = useState<boolean | null>(null);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    navigator.storage?.estimate?.().then((e) => { if (e.usage !== undefined) setStorage(`${(e.usage / 1048576).toFixed(1).replace('.', ',')} Mo utilisés sur cet appareil`); });
    navigator.storage?.persisted?.().then(setPersisted);
    navigator.serviceWorker?.getRegistration?.().then((r) => setSw(!!r?.active));
    const onPrompt = (e: Event) => { e.preventDefault(); setInstall(e as InstallEvent); };
    const onNet = () => setOnline(navigator.onLine);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('online', onNet);
    window.addEventListener('offline', onNet);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('online', onNet);
      window.removeEventListener('offline', onNet);
    };
  }, []);

  const doExport = () => {
    const url = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `savoir-vivre-progression-${dayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Fichier de progression préparé');
  };

  const doImport = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast('Fichier trop volumineux'); return; }
    const ok = importData(await file.text());
    toast(ok ? 'Progression restaurée' : 'Ce fichier n’est pas une sauvegarde valide');
  };

  return (
    <div className="stack gap-xl narrow">
      <header className="stack gap-s">
        <div className="eyebrow">Paramètres</div>
        <h1 className="display">Votre confort de lecture</h1>
      </header>

      <section className="stack gap-s"><h2 className="eyebrow muted">Vous</h2>
        <div className="setting-group">
          <div className="setting-row">
            <label className="setting-label" htmlFor="display-name"><strong>Prénom (facultatif)</strong><span>Pour le message d’accueil. Il reste sur cet appareil.</span></label>
            <input id="display-name" className="input" style={{ maxWidth: '16rem' }} maxLength={40} autoComplete="off" value={s.displayName} onChange={(e) => set({ displayName: e.target.value })} />
          </div>
          <Row label="Niveau de travail" desc="Oriente les recommandations de l’accueil. Rien n’est verrouillé.">
            <select aria-label="Niveau de travail" className="select" style={{ maxWidth: '14rem' }} value={s.preferredLevel} onChange={(e) => set({ preferredLevel: e.target.value as UserSettings['preferredLevel'] })}>
              <option value="auto">Automatique</option>
              {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
            </select>
          </Row>
          <Row label="Défi du jour" desc="Afficher une situation renouvelée chaque jour sur l’accueil.">
            <Toggle label="Défi du jour" checked={s.dailyChallengeEnabled} onChange={(v) => set({ dailyChallengeEnabled: v })} />
          </Row>
        </div>
      </section>

      <section className="stack gap-s"><h2 className="eyebrow muted">Lecture</h2>
        <div className="setting-group">
          <Row label="Taille du texte" desc="S’applique à toute l’application.">
            <Seg<FontScale> label="Taille du texte" value={s.fontSize} options={[['normal', 'Normale'], ['large', 'Grande'], ['xlarge', 'Très grande']]} onChange={(v) => set({ fontSize: v })} />
          </Row>
          <Row label="Thème" desc="Papier le jour, encre la nuit.">
            <Seg<ThemeSetting> label="Thème" value={s.theme} options={[['light', 'Clair'], ['dark', 'Sombre'], ['system', 'Système']]} onChange={(v) => set({ theme: v })} />
          </Row>
          <Row label="Déplier le détail des règles" desc="Afficher d’emblée le « pourquoi », le « quand » et les exceptions de chaque règle.">
            <Toggle label="Déplier le détail des règles" checked={s.expandRuleDetails} onChange={(v) => set({ expandRuleDetails: v })} />
          </Row>
        </div>
      </section>

      <section className="stack gap-s"><h2 className="eyebrow muted">Accessibilité</h2>
        <div className="setting-group">
          <Row label="Réduire les animations" desc="Supprime les fondus et transitions.">
            <Toggle label="Réduire les animations" checked={s.reduceMotion} onChange={(v) => set({ reduceMotion: v })} />
          </Row>
          <Row label="Contraste renforcé" desc="Assombrit les textes secondaires et épaissit les séparateurs.">
            <Toggle label="Contraste renforcé" checked={s.highContrast} onChange={(v) => set({ highContrast: v })} />
          </Row>
        </div>
      </section>

      <section className="stack gap-s"><h2 className="eyebrow muted">Hors ligne et installation</h2>
        <div className="setting-group">
          <Row label="Disponibilité hors ligne" desc={sw ? 'Tous les contenus sont enregistrés sur cet appareil : leçons, quiz et recherche fonctionnent sans réseau.' : 'L’enregistrement hors ligne n’est pas encore actif sur ce navigateur.'}>
            <span className="tag">{online ? 'En ligne' : 'Hors ligne'}{sw ? ' · prêt' : ''}</span>
          </Row>
          {storage && (
            <Row label="Stockage" desc={storage}>
              {persisted === false ? (
                <button type="button" className="btn btn-secondary" onClick={() => navigator.storage.persist().then((v) => { setPersisted(v); toast(v ? 'Stockage protégé' : 'Le navigateur a refusé la demande'); })}>Protéger mes données</button>
              ) : persisted ? <span className="tag">Protégé</span> : null}
            </Row>
          )}
          {install && (
            <Row label="Installer l’application" desc="L’ajoute à votre écran d’accueil, comme un livre toujours à portée de main.">
              <button type="button" className="btn btn-secondary" onClick={() => { install.prompt(); install.userChoice.finally(() => setInstall(null)); }}><DownloadSimple aria-hidden="true" />Installer</button>
            </Row>
          )}
        </div>
      </section>

      <section className="stack gap-s"><h2 className="eyebrow muted">Mes données</h2>
        <div className="setting-group">
          <Row label="Exporter ma progression" desc="Un fichier de vos lectures, résultats, favoris et réglages.">
            <button type="button" className="btn btn-secondary" onClick={doExport}><Export aria-hidden="true" />Exporter</button>
          </Row>
          <Row label="Restaurer une sauvegarde" desc="Remplace les données de cet appareil par celles d’un fichier exporté.">
            <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}><UploadSimple aria-hidden="true" />Importer</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) doImport(f); e.target.value = ''; }} aria-label="Fichier de sauvegarde" />
          </Row>
          <Row label="Réinitialiser la progression" desc="Efface lectures et résultats. Vos favoris et réglages sont conservés.">
            <button type="button" className="btn btn-danger" onClick={() => { if (window.confirm('Effacer définitivement vos lectures et résultats ?')) { resetProgress(); toast('Progression réinitialisée'); } }}>Réinitialiser</button>
          </Row>
          <Row label="Effacer toutes mes données" desc="Supprime tout ce que l’application a enregistré sur cet appareil.">
            <button type="button" className="btn btn-danger" onClick={() => { if (window.confirm('Tout effacer sur cet appareil ? Cette action est irréversible.')) { eraseEverything().then(() => toast('Données effacées')); } }}><Trash aria-hidden="true" />Tout effacer</button>
          </Row>
        </div>
        <p className="small muted">Aucun compte, aucun traceur. Vos données ne quittent pas cet appareil, sauf si vous exportez vous-même un fichier.</p>
      </section>

      <section className="stack gap-xs small">
        <Link to="/presentation">Présentation de l’ouvrage</Link>
        <Link to="/a-propos">À propos et sources</Link>
        <Link to="/mentions-legales">Mentions légales</Link>
      </section>
      <p className="xsmall muted">Version {__APP_VERSION__}.</p>
    </div>
  );
}
