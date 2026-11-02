import { useEffect, useRef, useState, Suspense } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '../components/ErrorBoundary';
import {
  BookmarkSimple, BookOpen, Books, ChartLineUp, GearSix, GlobeHemisphereWest, HouseLine, List, MagnifyingGlass, UsersThree, type Icon
} from '@phosphor-icons/react';
import { useUser } from '../storage/UserContext';
import { FirstLaunchNotice } from './LegalNotice';
import { UpdateBanner } from './UpdateBanner';

const NAV: { to: string; label: string; icon: Icon; end?: boolean }[] = [
  { to: '/', label: 'Accueil', icon: HouseLine, end: true },
  { to: '/apprendre', label: 'Apprendre', icon: BookOpen },
  { to: '/situations', label: 'Situations pratiques', icon: UsersThree },
  { to: '/guide', label: 'Guide du savoir-vivre', icon: Books },
  { to: '/culture', label: 'Culture et usages', icon: GlobeHemisphereWest },
  { to: '/progression', label: 'Ma progression', icon: ChartLineUp },
  { to: '/favoris', label: 'Favoris', icon: BookmarkSimple },
  { to: '/parametres', label: 'Paramètres', icon: GearSix }
];

const MOBILE: { to: string; label: string; icon: Icon; end?: boolean }[] = [
  { to: '/', label: 'Accueil', icon: HouseLine, end: true },
  { to: '/apprendre', label: 'Apprendre', icon: BookOpen },
  { to: '/situations', label: 'Situations', icon: UsersThree },
  { to: '/culture', label: 'Culture', icon: GlobeHemisphereWest }
];

function NavItems({ onPick }: { onPick?: () => void }) {
  return (
    <>
      <NavLink to="/recherche" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onPick}>
        <MagnifyingGlass size={19} aria-hidden="true" />Rechercher
      </NavLink>
      {NAV.map((n) => (
        <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`} onClick={onPick}>
          <n.icon size={19} aria-hidden="true" />{n.label}
        </NavLink>
      ))}
    </>
  );
}

export function Layout() {
  const { pathname, hash } = useLocation();
  const { data, recovered, volatile } = useUser();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const menuFirst = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    setMenu(false);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  useEffect(() => {
    if (!menu) return;
    menuFirst.current?.querySelector('a')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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

  const moreActive = !MOBILE.some((m) => (m.end ? pathname === m.to : pathname.startsWith(m.to)));

  return (
    <div className="shell">
      <a className="skip-link" href="#contenu" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>Aller au contenu</a>
      <aside className="sidebar">
        <Link to="/" className="brand">
          <div className="brand-rule" />
          <div className="brand-name">L’Art du<br /><em>Savoir-Vivre</em></div>
          <div className="brand-sub">Encyclopédie des usages</div>
        </Link>
        <nav aria-label="Navigation principale" className="nav-list"><NavItems /></nav>
      </aside>
      <div className="main">
        <header className="topbar">
          <Link to="/" className="topbar-brand">L’Art du <em>Savoir-Vivre</em></Link>
          <button type="button" className="btn-icon" aria-label="Rechercher" onClick={() => navigate('/recherche')}>
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
      <nav aria-label="Navigation principale, mobile" className="bottom-nav">
        {MOBILE.map((m) => (
          <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => `bottom-item${isActive ? ' active' : ''}`}>
            <m.icon size={21} aria-hidden="true" />{m.label}
          </NavLink>
        ))}
        <button type="button" className={`bottom-item${moreActive || menu ? ' active' : ''}`} onClick={() => setMenu(true)} aria-haspopup="dialog" aria-expanded={menu}>
          <List size={21} aria-hidden="true" />Plus
        </button>
      </nav>
      {menu && (
        <div className="sheet-backdrop" onClick={() => setMenu(false)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label="Toutes les rubriques" onClick={(e) => e.stopPropagation()} ref={menuFirst}>
            <div className="sheet-title">Rubriques</div>
            <NavItems onPick={() => setMenu(false)} />
            <button type="button" className="nav-item" onClick={() => setMenu(false)}>Fermer</button>
          </div>
        </div>
      )}
      <FirstLaunchNotice />
    </div>
  );
}
