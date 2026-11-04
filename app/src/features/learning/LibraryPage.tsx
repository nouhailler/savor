import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkSimple, Hourglass } from '@phosphor-icons/react';
import { useUser } from '../../storage/UserContext';
import { domains, isLessonAvailable } from '../../services/content';
import { lessonStatus } from '../../services/daily';
import { Empty, LevelBadge, PageHead, STATUS_LABEL, StatusIcon, usePageTitle } from '../../components/ui';
import { LEVELS, type Level } from '../../types/content';
import { LEVEL_LABEL } from '../../utils/labels';
import { normalize, plural } from '../../utils/text';

export default function LibraryPage() {
  usePageTitle('Bibliothèque');
  const { data, isFavorite } = useUser();
  const [domain, setDomain] = useState('all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const [query, setQuery] = useState('');
  const [onlyWritten, setOnlyWritten] = useState(true);
  const hasUnwritten = domains.some((d) => d.lessons.some((l) => !isLessonAvailable(l.id)));

  const rows = useMemo(() => {
    const q = normalize(query);
    return domains
      .filter((d) => domain === 'all' || d.id === domain)
      .flatMap((d) => d.lessons.map((l) => ({ d, l })))
      .filter(({ l }) => level === 'all' || l.level === level)
      .filter(({ l }) => !onlyWritten || isLessonAvailable(l.id))
      .filter(({ l }) => !q || normalize(`${l.title} ${l.summary ?? ''} ${l.topics.join(' ')} ${(l.tags ?? []).join(' ')}`).includes(q));
  }, [domain, level, query, onlyWritten]);

  return (
    <div className="stack gap-xl">
      <PageHead eyebrow="Apprendre" title="La bibliothèque" lead="Toutes les leçons, dans l’ordre pédagogique, avec leur temps de lecture." />
      <div className="stack gap-m">
        <div className="grid-3">
          <label className="stack gap-xs"><span className="field-label">Filtrer les leçons</span>
            <input className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mot-clé, thème…" />
          </label>
          <label className="stack gap-xs"><span className="field-label">Domaine</span>
            <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>
              <option value="all">Tous les domaines</option>
              {domains.map((d) => <option key={d.id} value={d.id}>{d.shortTitle}</option>)}
            </select>
          </label>
          <label className="stack gap-xs"><span className="field-label">Niveau</span>
            <select className="input" value={level} onChange={(e) => setLevel(e.target.value as Level | 'all')}>
              <option value="all">Tous les niveaux</option>
              {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
            </select>
          </label>
        </div>
        {hasUnwritten && <label className="row small"><input type="checkbox" checked={!onlyWritten} onChange={(e) => setOnlyWritten(!e.target.checked)} style={{ width: '1.25rem', height: '1.25rem' }} /> Afficher aussi les leçons en préparation</label>}
      </div>
      <p className="small muted" role="status">{plural(rows.length, 'leçon')}</p>
      {rows.length === 0 && <Empty title="Aucune leçon ne correspond."><p>{hasUnwritten ? 'Élargissez les filtres ou affichez les leçons en préparation.' : 'Élargissez les filtres.'}</p></Empty>}
      <ul className="stack">
        {rows.map(({ d, l }) => {
          const written = isLessonAvailable(l.id);
          const st = lessonStatus(data, l.id);
          const body = (
            <>
              <span className="row small muted" style={{ gap: '.5rem' }}>
                {written ? <StatusIcon status={st} size={16} /> : <Hourglass size={16} aria-hidden="true" />}
                {written ? STATUS_LABEL[st] : 'En préparation'} · {d.shortTitle}{l.estimatedDuration ? ` · ${l.estimatedDuration} min` : ''}
                {isFavorite('lesson', l.id) && <span className="row" style={{ gap: '.25rem' }}><BookmarkSimple size={14} weight="fill" aria-hidden="true" />Favori</span>}
              </span>
              <span className="result-title" style={written ? undefined : { color: 'var(--muted)', fontWeight: 500 }}>{l.title}</span>
              <span className="small">{l.summary ?? l.topics.join(' · ')}</span>
              <span style={{ marginTop: '.25rem' }}><LevelBadge level={l.level} /></span>
            </>
          );
          return <li key={l.id}>{written ? <Link className="result-item" to={`/lecons/${l.id}`}>{body}</Link> : <div className="result-item">{body}</div>}</li>;
        })}
      </ul>
    </div>
  );
}
