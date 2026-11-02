import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkSimple,
  CaretRight,
  Check,
  CheckCircle,
  ChatText,
  Circle,
  CircleHalf,
  DoorOpen,
  Gift,
  GlobeHemisphereWest,
  HandHeart,
  Minus,
  SuitcaseRolling,
  UserCircle,
  UsersThree,
  X,
  type Icon
} from '@phosphor-icons/react';
import type { Level } from '../types/content';
import type { FavoriteType } from '../types/user';
import { useUser } from '../storage/UserContext';
import { LEVEL_LABEL, LEVEL_RANK } from '../utils/labels';

const DOMAIN_ICONS: Record<string, Icon> = {
  UserCircle, UsersThree, ChatText, HandHeart, DoorOpen, Gift, SuitcaseRolling, GlobeHemisphereWest
};

export function DomainIcon({ name, size = 22 }: { name: string; size?: number }) {
  const C = DOMAIN_ICONS[name] ?? Circle;
  return <C size={size} aria-hidden="true" />;
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} — L’Art du Savoir-Vivre` : 'L’Art du Savoir-Vivre';
  }, [title]);
}

export function LevelBadge({ level }: { level: Level }) {
  const rank = LEVEL_RANK[level];
  return (
    <span className={`badge-level ${level}`}>
      <span className="dots" aria-hidden="true">
        {[1, 2, 3].map((i) => <i key={i} className={i <= rank ? 'on' : ''} />)}
      </span>
      {LEVEL_LABEL[level]}
    </span>
  );
}

export function Breadcrumb({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Fil d’Ariane" className="breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="row" style={{ gap: '.5rem' }}>
          {i > 0 && <CaretRight size={12} aria-hidden="true" />}
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current={i === items.length - 1 ? 'page' : undefined} style={{ color: 'var(--ink)' }}>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export function Bar({ percent, label }: { percent: number; label?: string }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? 'Progression'}>
      <div style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
  );
}

export type LessonStatus = 'completed' | 'in_progress' | 'todo';

export const STATUS_LABEL: Record<LessonStatus, string> = { completed: 'Terminée', in_progress: 'En cours', todo: 'À découvrir' };

export function StatusIcon({ status, size = 19 }: { status: LessonStatus; size?: number }) {
  if (status === 'completed') return <CheckCircle size={size} weight="fill" className="st-done" aria-hidden="true" />;
  if (status === 'in_progress') return <CircleHalf size={size} className="st-prog" aria-hidden="true" />;
  return <Circle size={size} className="st-todo" aria-hidden="true" />;
}

export type VerdictKind = 'ok' | 'mid' | 'ko';
const VERDICT: Record<VerdictKind, [string, Icon]> = { ok: ['Recommandé', Check], mid: ['Acceptable', Minus], ko: ['À éviter', X] };

export const verdictOf = (score: number): VerdictKind => (score >= 1 ? 'ok' : score > 0 ? 'mid' : 'ko');

export function Verdict({ kind }: { kind: VerdictKind }) {
  const [label, I] = VERDICT[kind];
  return <span className={`verdict ${kind}`}><I size={14} aria-hidden="true" />{label}</span>;
}

export function FavButton({ type, id, title, withLabel = false }: { type: FavoriteType; id: string; title: string; withLabel?: boolean }) {
  const { isFavorite, toggleFavorite } = useUser();
  const toast = useToast();
  const on = isFavorite(type, id);
  const label = on ? `Retirer « ${title} » des favoris` : `Ajouter « ${title} » aux favoris`;
  const onClick = () => {
    const added = toggleFavorite(type, id);
    toast(added ? 'Ajouté à vos favoris' : 'Retiré de vos favoris');
  };
  if (withLabel) {
    return (
      <button type="button" className="btn-tool" aria-pressed={on} onClick={onClick}>
        <BookmarkSimple size={18} weight={on ? 'fill' : 'regular'} aria-hidden="true" />
        {on ? 'Dans vos favoris' : 'Ajouter aux favoris'}
        <span className="sr-only"> : {title}</span>
      </button>
    );
  }
  return (
    <button type="button" className="btn-icon" aria-pressed={on} aria-label={label} onClick={onClick}>
      <BookmarkSimple size={20} weight={on ? 'fill' : 'regular'} aria-hidden="true" />
    </button>
  );
}

export function PageHead({ eyebrow, title, lead, sage }: { eyebrow?: string; title: string; lead?: string; sage?: boolean }) {
  return (
    <header className="stack gap-s narrow">
      {eyebrow && <div className={`eyebrow${sage ? ' sage' : ''}`}>{eyebrow}</div>}
      <h1 className="display">{title}</h1>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}

export function Empty({ title, children, icon }: { title: string; children?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="empty">
      {icon}
      <div className="empty-title">{title}</div>
      {children}
    </div>
  );
}

export function DashList({ items }: { items: string[] }) {
  return (
    <ul className="stack gap-s dash-list">
      {items.map((it, i) => <li key={i}><span aria-hidden="true">—</span><span>{it}</span></li>)}
    </ul>
  );
}

// — Message éphémère —
const ToastCtx = createContext<(msg: string) => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = useCallback((m: string) => {
    clearTimeout(timer.current);
    setMsg(m);
    timer.current = setTimeout(() => setMsg(''), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div role="status" aria-live="polite">{msg && <div className="toast">{msg}</div>}</div>
    </ToastCtx.Provider>
  );
}
