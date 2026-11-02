import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { X } from '@phosphor-icons/react';
import { InstallButton } from '../components/InstallButton';
import { Logo } from '../components/Logo';
import { MENU } from './menu';

/** Menu complet. Les liens remplacent l'entrée d'historique du menu : le bouton retour ne le rouvre pas. */
export function MainMenu({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
    if (e.key !== 'Tab') return;
    const els = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href], button'));
    const first = els[0];
    const last = els[els.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer" role="dialog" aria-modal="true" aria-label="Menu" onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <div className="drawer-head">
          <Link to="/" replace className="drawer-brand">
            <Logo size={38} />
            <span className="brand-name">L’Art du <em>Savoir-Vivre</em></span>
          </Link>
          <button ref={closeRef} type="button" className="btn-icon" aria-label="Fermer le menu" onClick={onClose}><X size={20} aria-hidden="true" /></button>
        </div>
        <nav aria-label="Navigation principale" className="drawer-nav">
          {MENU.map((group) => (
            <div key={group.title} className="drawer-group">
              <div className="eyebrow muted drawer-title">{group.title}</div>
              {group.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} replace className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                  <item.icon size={19} aria-hidden="true" />{item.label}
                </NavLink>
              ))}
              {group.title === 'Application' && <InstallButton variant="menu" />}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
