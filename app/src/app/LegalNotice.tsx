import { useEffect, useRef, useState } from 'react';
import { BookOpen, ChartLineUp, DeviceMobile, GlobeHemisphereWest, LockKey, UsersThree, WifiSlash, type Icon } from '@phosphor-icons/react';
import { InstallButton } from '../components/InstallButton';
import { Logo } from '../components/Logo';
import { useUser } from '../storage/UserContext';
import { LEGAL_NOTICE_VERSION, LEGAL_REPROMPT_ON_VERSION_CHANGE, legalNotice } from './legal';

const ONBOARDING: Record<'welcome' | 'path' | 'device', { title: string; intro: string; points: { icon: Icon; text: string }[] }> = {
  welcome: {
    title: 'Bienvenue dans L’Art du Savoir-Vivre',
    intro: 'Une encyclopédie pour apprendre les usages et comprendre leurs raisons, sans raideur et à votre rythme.',
    points: [
      { icon: BookOpen, text: 'Huit domaines, de la présentation de soi aux usages à l’étranger.' },
      { icon: UsersThree, text: 'Des situations à vivre, où vos choix modifient la suite.' },
      { icon: GlobeHemisphereWest, text: 'Des fiches pays, un guide pratique et un dictionnaire.' }
    ]
  },
  path: {
    title: 'Votre parcours',
    intro: 'Rien n’est verrouillé : vous pouvez tout lire, dans l’ordre qui vous convient.',
    points: [
      { icon: BookOpen, text: 'Chaque domaine propose trois niveaux : débutant, intermédiaire, avancé.' },
      { icon: ChartLineUp, text: 'Une évaluation initiale vous conseille où commencer, et les révisions reviennent quand il le faut.' }
    ]
  },
  device: {
    title: 'Sur votre appareil',
    intro: 'L’application ne demande ni compte ni adresse.',
    points: [
      { icon: LockKey, text: 'Votre progression reste sur cet appareil. Vous pouvez l’exporter ou l’effacer à tout moment.' },
      { icon: WifiSlash, text: 'Une fois chargée, elle fonctionne sans connexion et se met à jour d’elle-même.' },
      { icon: DeviceMobile, text: 'Installez-la pour l’ouvrir d’un geste depuis votre écran.' }
    ]
  }
};

export function LegalContent() {
  const { publisher } = legalNotice;
  return (
    <div className="stack gap-l">
      <section className="stack gap-xs">
        <h2 className="h3">Éditeur</h2>
        <p>{publisher.name} — {publisher.address}</p>
        <p>Contact : <a href={`mailto:${publisher.email}`}>{publisher.email}</a></p>
        <p>Hébergeur : <span className={publisher.host.startsWith('[') ? 'placeholder' : undefined}>{publisher.host}</span></p>
        <p className="small muted">Dernière mise à jour : {legalNotice.updatedAt} · Version {LEGAL_NOTICE_VERSION}</p>
      </section>
      {legalNotice.sections.map((s) => (
        <section key={s.title} className="stack gap-s">
          <h2 className="h3">{s.title}</h2>
          {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        </section>
      ))}
    </div>
  );
}

const STEPS = ['welcome', 'path', 'device', 'legal'] as const;

/** Accueil du premier lancement. L'avertissement légal en est la dernière étape, sans laquelle on n'entre pas. */
export function FirstLaunchNotice() {
  const { ready, data, acknowledgeLegal } = useUser();
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const primary = useRef<HTMLButtonElement>(null);
  const checkbox = useRef<HTMLInputElement>(null);
  const seen = data.legalNoticeVersion;
  const open = ready && (!seen || (LEGAL_REPROMPT_ON_VERSION_CHANGE && seen !== LEGAL_NOTICE_VERSION));
  const current = STEPS[step];
  const onLegal = current === 'legal';

  useEffect(() => {
    if (!open) return;
    if (onLegal && !details && !accepted) checkbox.current?.focus();
    else primary.current?.focus();
    // La case cochée ne doit pas déplacer le focus.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, details]);

  // Le bouton retour (Android) ferme d'abord les détails.
  useEffect(() => {
    if (!details) return;
    window.history.pushState({ ...window.history.state, legalDetails: true }, '');
    const onPop = () => setDetails(false);
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (window.history.state?.legalDetails) window.history.back();
    };
  }, [details]);

  if (!open) return null;

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && details) setDetails(false);
    if (e.key !== 'Tab') return;
    const els = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input'));
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const title = details ? 'Mentions légales' : onLegal ? `⚠️ ${legalNotice.title}` : ONBOARDING[current as keyof typeof ONBOARDING].title;

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="legal-title" onKeyDown={onKey}>
        <div className="modal-head stack gap-s">
          {current === 'welcome' && <Logo size={64} />}
          <h2 id="legal-title" className="h3">{title}</h2>
          {!details && (
            <div className="onboarding-steps" role="img" aria-label={`Étape ${step + 1} sur ${STEPS.length}`}>
              {STEPS.map((s, i) => <i key={s} className={i <= step ? 'done' : ''} />)}
            </div>
          )}
        </div>
        <div className="modal-body" tabIndex={0}>
          {details ? <LegalContent /> : onLegal ? (
            <div className="stack gap-s">
              {legalNotice.shortWarning.map((p, i) => <p key={i}>{p}</p>)}
              <label className="onboarding-accept">
                <input ref={checkbox} type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                <span>J’ai lu cet avertissement et je comprends que l’éditeur n’est pas responsable des données fournies dans l’application.</span>
              </label>
            </div>
          ) : (
            <div className="stack gap-m">
              <p>{ONBOARDING[current as keyof typeof ONBOARDING].intro}</p>
              <ul className="onboarding-list">
                {ONBOARDING[current as keyof typeof ONBOARDING].points.map(({ icon: PointIcon, text }) => (
                  <li key={text}><PointIcon size={22} aria-hidden="true" /><span>{text}</span></li>
                ))}
              </ul>
              {current === 'device' && <div><InstallButton /></div>}
            </div>
          )}
        </div>
        <div className="modal-foot">
          {onLegal ? (
            <button type="button" className="btn-link" onClick={() => setDetails(!details)}>
              {details ? 'Revenir à l’avertissement' : 'Voir les détails'}
            </button>
          ) : (
            <button type="button" className="btn-link" onClick={() => setStep(STEPS.length - 1)}>Passer la présentation</button>
          )}
          {onLegal ? (
            <button ref={primary} type="button" className="btn btn-primary" disabled={!accepted} onClick={() => acknowledgeLegal(LEGAL_NOTICE_VERSION)}>
              J’ai compris
            </button>
          ) : (
            <button ref={primary} type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>Continuer</button>
          )}
        </div>
      </div>
    </div>
  );
}
