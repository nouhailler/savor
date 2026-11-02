import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { search } from '../../services/search';
import type { ContentKind } from '../../types/content';
import { Empty, PageHead, usePageTitle } from '../../components/ui';
import { plural } from '../../utils/text';

const KINDS: [ContentKind | 'all', string][] = [
  ['all', 'Tout'], ['lesson', 'Leçons'], ['rule', 'Règles'], ['sheet', 'Fiches'], ['scenario', 'Situations'], ['dictionary', 'Définitions'], ['country', 'Pays']
];

export default function SearchPage() {
  usePageTitle('Recherche');
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  const [kind, setKind] = useState<ContentKind | 'all'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const t = setTimeout(() => setParams(query ? { q: query } : {}, { replace: true }), 300);
    return () => clearTimeout(t);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => search(query, kind === 'all' ? undefined : [kind]), [query, kind]);

  return (
    <div className="stack gap-xl narrow">
      <PageHead eyebrow="Recherche" title="Que cherchez-vous ?" lead="Leçons, règles, fiches, situations, définitions et pays. La recherche fonctionne aussi hors ligne." />
      <label className="stack gap-xs">
        <span className="sr-only">Rechercher dans toute l’application</span>
        <span className="search-box"><MagnifyingGlass aria-hidden="true" /><input ref={inputRef} className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tutoiement, condoléances, Japon…" /></span>
      </label>
      <div role="group" aria-label="Filtrer par type" className="row" style={{ gap: '.5rem' }}>
        {KINDS.map(([k, label]) => <button key={k} type="button" className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{label}</button>)}
      </div>
      {query.trim() && <p className="small muted" role="status">{plural(results.length, 'résultat')}</p>}
      {query.trim() && results.length === 0 && (
        <Empty title="Aucun résultat."><p>Essayez un terme plus général, ou vérifiez l’orthographe. Les accents sont facultatifs.</p></Empty>
      )}
      <ul>
        {results.map((r) => (
          <li key={`${r.kind}-${r.id}`}>
            <Link className="result-item" to={r.to}>
              <span className="eyebrow" style={{ letterSpacing: '.1em' }}>{r.meta}</span>
              <span className="result-title">{r.title}</span>
              <span className="small">{r.excerpt.length > 180 ? `${r.excerpt.slice(0, 180)}…` : r.excerpt}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
