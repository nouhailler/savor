import { useEffect, useRef, useState } from 'react';
import { useUser } from '../storage/UserContext';
import { LEGAL_NOTICE_VERSION, LEGAL_REPROMPT_ON_VERSION_CHANGE, legalNotice } from './legal';

export function LegalContent() {
  const { publisher } = legalNotice;
  return (
    <div className="stack gap-l">
      <section className="stack gap-xs">
        <h2 className="h3">Éditeur</h2>
        <p>{publisher.name} — {publisher.address}</p>
        <p>Contact : <a href={`mailto:${publisher.email}`}>{publisher.email}</a></p>
        <p>Hébergeur : <span className="placeholder">{publisher.host}</span></p>
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

/** Avertissement du premier lancement. Les détails sont une seconde page de la modale. */
export function FirstLaunchNotice() {
  const { ready, data, acknowledgeLegal } = useUser();
  const [details, setDetails] = useState(false);
  const primary = useRef<HTMLButtonElement>(null);
  const seen = data.legalNoticeVersion;
  const open = ready && (!seen || (LEGAL_REPROMPT_ON_VERSION_CHANGE && seen !== LEGAL_NOTICE_VERSION));

  useEffect(() => {
    if (open) primary.current?.focus();
  }, [open, details]);

  // Le bouton retour (Android) ferme d'abord les détails.
  useEffect(() => {
    if (!details) return;
    window.history.pushState({ legalDetails: true }, '');
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
    const els = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button, a[href]'));
    if (!els.length) return;
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="legal-title" onKeyDown={onKey}>
        <div className="modal-head">
          <h2 id="legal-title" className="h3">{details ? 'Mentions légales' : `⚠️ ${legalNotice.title}`}</h2>
        </div>
        <div className="modal-body" tabIndex={0}>
          {details ? <LegalContent /> : (
            <div className="stack gap-s">{legalNotice.shortWarning.map((p, i) => <p key={i}>{p}</p>)}</div>
          )}
        </div>
        <div className="modal-foot">
          <button type="button" className="btn-link" onClick={() => setDetails(!details)}>
            {details ? 'Revenir à l’avertissement' : 'Voir les détails'}
          </button>
          <button ref={primary} type="button" className="btn btn-primary" onClick={() => acknowledgeLegal(LEGAL_NOTICE_VERSION)}>
            J’ai compris
          </button>
        </div>
      </div>
    </div>
  );
}
