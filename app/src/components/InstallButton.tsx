import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, DownloadSimple } from '@phosphor-icons/react';
import { detectPlatform, INSTALL_STEPS, promptInstall, useInstallState } from '../services/install';

function InstallHelp({ onClose }: { onClose: () => void }) {
  const help = INSTALL_STEPS[detectPlatform()];
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, []);
  return createPortal(
    <div className="modal-backdrop modal-top" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Escape') onClose();
          if (e.key === 'Tab') {
            e.preventDefault();
            closeRef.current?.focus();
          }
        }}
      >
        <div className="modal-head"><h2 id="install-title" className="h3">Installer l’application</h2></div>
        <div className="modal-body stack gap-s">
          <p>Elle s’ouvrira comme une application, depuis une icône sur votre écran, et fonctionnera sans connexion.</p>
          <p><strong>{help.title}</strong></p>
          <ol className="install-steps">{help.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          {help.note && <p className="small muted">{help.note}</p>}
        </div>
        <div className="modal-foot" style={{ justifyContent: 'flex-end' }}>
          <button ref={closeRef} type="button" className="btn btn-primary" onClick={onClose}>J’ai compris comment faire</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Installe en un geste si le navigateur le permet ; sinon, explique comment faire sur cet appareil. */
export function InstallButton({ variant = 'button' }: { variant?: 'button' | 'menu' }) {
  const { installed, canPrompt } = useInstallState();
  const [help, setHelp] = useState(false);

  if (installed) {
    if (variant === 'menu') return null;
    return <span className="tag"><CheckCircle size={16} weight="fill" aria-hidden="true" /> Déjà installée</span>;
  }

  const onClick = () => {
    if (canPrompt) void promptInstall();
    else setHelp(true);
  };

  return (
    <>
      <button type="button" className={variant === 'menu' ? 'nav-item' : 'btn btn-secondary'} onClick={onClick}>
        <DownloadSimple size={19} aria-hidden="true" />Installer l’application
      </button>
      {help && <InstallHelp onClose={() => setHelp(false)} />}
    </>
  );
}
