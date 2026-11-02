import { useEffect, useRef, useState, Suspense } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { List, MagnifyingGlass } from '@phosphor-icons/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Logo } from '../components/Logo';
import { useUser } from '../storage/UserContext';
import { FirstLaunchNotice } from './LegalNotice';
import { MainMenu } from './MainMenu';
import { SHORTCUTS } from './menu';
import { UpdateBanner } from './UpdateBanner';

export function Layout() {
  const location = useLocation();
  const { pathname, search, hash } = location;
  const { data, recovered, volatile } = useUser();
  const navigate = useNavigate();
  // L'ouverture du menu ajoute une entrée d'historique : le bouton retour d'Android le referme.
  const menu = (location.state as { menu?: boolean } | null)?.menu === true;
  const [dismissed, setDismissed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  useEffect(() => {
    // Après un rechargement, le menu ne se rouvre pas de lui-même.
    if (menu) navigate({ pathname, search, hash }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (wasOpen.current && !menu) menuButton.current?.focus({ preventScroll: true });
    wasOpen.current = menu;
  }, [menu]);

  useEffect(() => {
    const root = document.documentElement;
    const s = data.settings;
    const applyTheme = () => {
      const dark = s.theme === 'dark' || (s.theme === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
      root.dataset.theme = dark ? 'dark' : 'light';
    };
    applyTheme();
    root.dataset.scale = s.fontSize;
    root.dataset.motion = s.reduceMotion ? 'reduced' : 'full';
    root.dataset.contrast = s.highContrast ? 'high' : 'normal';
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    mq?.addEventListener?.('change', applyTheme);
    return () => mq?.removeEventListener?.('change', applyTheme);
  }, [data.settings]);

  return (
    <div className="shell">
      <a className="skip-link" href="#contenu" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>Aller au contenu</a>
      <div className="main">
        <header className="topbar">
          <button ref={menuButton} type="button" className="btn-icon" aria-label="Ouvrir le menu" aria-haspopup="dialog" aria-expanded={menu} onClick={() => navigate({ pathname, search, hash }, { state: { menu: true } })}>
            <List size={22} aria-hidden="true" />
          </button>
          <Link to="/" className="topbar-brand"><Logo size={30} /><span>L’Art du <em>Savoir-Vivre</em></span></Link>
          <button type="button" className="btn-icon topbar-search" aria-label="Rechercher" onClick={() => navigate('/recherche')}>
            <MagnifyingGlass size={20} aria-hidden="true" />
          </button>
        </header>
        <UpdateBanner />
        {recovered && !dismissed && (
          <div className="notice-bar" role="alert">
            Vos données locales étaient illisibles : une copie a été mise de côté et l’application repart de zéro.
            <button type="button" className="btn-link" onClick={() => setDismissed(true)}>Fermer</button>
          </div>
        )}
        {volatile && !dismissed && (
          <div className="notice-bar" role="alert">
            Le stockage local est indisponible (navigation privée ?) : votre progression ne sera pas conservée.
            <button type="button" className="btn-link" onClick={() => setDismissed(true)}>Fermer</button>
          </div>
        )}
        <div id="contenu" ref={mainRef} tabIndex={-1} style={{ outline: 'none' }}>
          <main className="page" key={pathname}>
            <ErrorBoundary resetKey={pathname}>
              <Suspense fallback={<p className="muted" role="status">Chargement…</p>}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
      <nav aria-label="Raccourcis" className="bottom-nav">
        {SHORTCUTS.map((m) => (
          <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => `bottom-item${isActive ? ' active' : ''}`}>
            <m.icon size={21} aria-hidden="true" />{m.label}
          </NavLink>
        ))}
      </nav>
      {menu && <MainMenu onClose={() => navigate(-1)} />}
      <FirstLaunchNotice />
    </div>
  );
}
