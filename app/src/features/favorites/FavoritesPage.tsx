import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookBookmark, BookmarkSimple, BookOpen, Files, GlobeHemisphereWest, ListChecks, UsersThree, type Icon } from '@phosphor-icons/react';
import type { FavoriteType } from '../../types/user';
import type { Rule } from '../../types/content';
import { getCountry, getDomain, getEntry, getLessonMeta, getScenario, getSheet, loadLesson } from '../../services/content';
import { useUser } from '../../storage/UserContext';
import { Empty, PageHead, usePageTitle, useToast } from '../../components/ui';
import { LEVEL_LABEL } from '../../utils/labels';

const FILTERS: [FavoriteType | 'all', string][] = [
  ['all', 'Tout'], ['lesson', 'Leçons'], ['rule', 'Règles'], ['sheet', 'Fiches'], ['scenario', 'Situations'], ['dictionary', 'Définitions'], ['country', 'Pays']
];

const TYPE: Record<FavoriteType, [string, Icon]> = {
  lesson: ['Leçon', BookOpen], rule: ['Règle', ListChecks], sheet: ['Fiche pratique', Files], scenario: ['Situation pratique', UsersThree],
  dictionary: ['Définition', BookBookmark], country: ['Fiche pays', GlobeHemisphereWest]
};

/** « l-4-1-2-r3 » appartient à la leçon « l-4-1-2 ». */
export const lessonIdOfRule = (ruleId: string) => ruleId.replace(/-r\d+$/, '');

export default function FavoritesPage() {
  usePageTitle('Favoris');
  const { data, removeFavorite } = useUser();
  const toast = useToast();
  const [filter, setFilter] = useState<FavoriteType | 'all'>('all');
  const [rules, setRules] = useState<Record<string, Rule>>({});

  useEffect(() => {
    const ids = [...new Set(data.favorites.filter((f) => f.targetType === 'rule').map((f) => lessonIdOfRule(f.targetId)))];
    let alive = true;
    Promise.all(ids.map(loadLesson)).then((lessons) => {
      if (!alive) return;
      const map: Record<string, Rule> = {};
      for (const l of lessons) for (const r of l?.rules ?? []) map[r.id] = r;
      setRules(map);
    });
    return () => { alive = false; };
  }, [data.favorites]);

  const resolve = (type: FavoriteType, id: string): { title: string; meta: string; to: string } | null => {
    switch (type) {
      case 'lesson': {
        const m = getLessonMeta(id);
        return m ? { title: m.lesson.title, meta: `${m.domain.shortTitle} · ${LEVEL_LABEL[m.lesson.level]}`, to: `/lecons/${id}` } : null;
      }
      case 'rule': {
        const lid = lessonIdOfRule(id);
        const m = getLessonMeta(lid);
        return m ? { title: rules[id]?.title ?? 'Règle', meta: m.lesson.title, to: `/lecons/${lid}#${id}` } : null;
      }
      case 'sheet': {
        const s = getSheet(id);
        return s ? { title: s.title, meta: getDomain(s.domainId)?.shortTitle ?? '', to: `/guide/${id}` } : null;
      }
      case 'scenario': {
        const s = getScenario(id);
        return s ? { title: s.title, meta: `${getDomain(s.domainId)?.shortTitle} · ${s.estimatedDuration} min`, to: `/situations/${id}` } : null;
      }
      case 'dictionary': {
        const e = getEntry(id);
        return e ? { title: e.term, meta: e.definition, to: `/dictionnaire/${id}` } : null;
      }
      case 'country': {
        const c = getCountry(id);
        return c ? { title: c.name, meta: c.region, to: `/culture/${c.slug}` } : null;
      }
    }
  };

  const count = (t: FavoriteType | 'all') => (t === 'all' ? data.favorites.length : data.favorites.filter((f) => f.targetType === t).length);
  const items = data.favorites.filter((f) => filter === 'all' || f.targetType === filter);

  return (
    <div className="stack gap-xl" style={{ maxWidth: '53.75rem' }}>
      <PageHead eyebrow="Favoris" title="Vos pages marquées" lead="Ce que vous avez gardé sous la main. Tout reste disponible hors ligne." />
      <div role="group" aria-label="Filtrer les favoris" className="row" style={{ gap: '.5rem' }}>
        {FILTERS.map(([k, label]) => <button key={k} type="button" className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{label}<span>{count(k)}</span></button>)}
      </div>
      {items.length === 0 && (
        <Empty title="Rien de marqué ici pour l’instant" icon={<BookmarkSimple size={28} style={{ color: 'var(--gold-deep)' }} aria-hidden="true" />}>
          <p>Touchez le signet en haut d’une leçon, d’une règle, d’une situation, d’une fiche ou d’une définition pour la retrouver ici.</p>
        </Empty>
      )}
      <ul className="stack">
        {items.map((f) => {
          const r = resolve(f.targetType, f.targetId);
          const [typeLabel, I] = TYPE[f.targetType];
          const title = r?.title ?? 'Contenu retiré de cette édition';
          return (
            <li key={f.id} className="row" style={{ flexWrap: 'nowrap', gap: '1rem', padding: '1.125rem 0', borderTop: '1px solid var(--rule)' }}>
              <span style={{ flex: '0 0 44px', height: 44, borderRadius: 5, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}><I size={22} aria-hidden="true" /></span>
              {r ? (
                <Link to={r.to} className="stack" style={{ flex: 1, minWidth: 0, gap: '.1875rem', textDecoration: 'none', color: 'inherit' }}>
                  <span className="eyebrow" style={{ letterSpacing: '.12em' }}>{typeLabel}</span>
                  <span className="result-title">{title}</span>
                  <span className="small muted">{r.meta}</span>
                </Link>
              ) : <span style={{ flex: 1 }} className="muted">{title}</span>}
              <button type="button" className="btn-icon" aria-label={`Retirer « ${title} » des favoris`} onClick={() => { removeFavorite(f.id); toast('Retiré de vos favoris'); }}>
                <BookmarkSimple size={20} weight="fill" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
