import { Link, useParams } from 'react-router-dom';
import { dictionary, getEntry, getLessonMeta, isLessonAvailable } from '../../services/content';
import { Breadcrumb, FavButton, usePageTitle } from '../../components/ui';
import { normalize } from '../../utils/text';
import NotFoundPage from '../home/NotFoundPage';

export default function EntryPage() {
  const { entryId = '' } = useParams();
  const entry = getEntry(entryId);
  usePageTitle(entry?.term ?? 'Dictionnaire');
  if (!entry) return <NotFoundPage />;
  const related = entry.related.map((t) => ({ term: t, target: dictionary.find((e) => normalize(e.term) === normalize(t)) }));
  const lessons = entry.lessonIds.filter(isLessonAvailable);
  return (
    <article className="stack gap-xl narrower">
      <header className="stack gap-s">
        <Breadcrumb items={[{ label: 'Dictionnaire', to: '/dictionnaire' }, { label: entry.term }]} />
        <h1 className="display">{entry.term}</h1>
        <p className="lead" style={{ color: 'var(--ink)' }}>{entry.definition}</p>
        {entry.etymology && <p className="small muted">{entry.etymology}</p>}
        <div><FavButton type="dictionary" id={entry.id} title={entry.term} withLabel /></div>
      </header>
      <section className="stack gap-xs"><h2 className="eyebrow">Explication</h2><p>{entry.explanation}</p></section>
      <section className="stack gap-xs"><h2 className="eyebrow">Contexte</h2><p>{entry.context}</p></section>
      <section className="card"><h2 className="eyebrow sage">Exemple</h2><p className="rule-quote" style={{ fontSize: '1.3125rem' }}>{entry.example}</p></section>
      {related.length > 0 && (
        <section className="stack gap-xs"><h2 className="eyebrow">Termes associés</h2>
          <p>{related.map((r, i) => <span key={r.term}>{i > 0 && ' · '}{r.target ? <Link to={`/dictionnaire/${r.target.id}`}>{r.term}</Link> : r.term}</span>)}</p>
        </section>
      )}
      {lessons.length > 0 && (
        <section className="stack gap-xs"><h2 className="eyebrow">Leçons correspondantes</h2>
          <ul className="stack gap-xs">{lessons.map((id) => <li key={id}><Link to={`/lecons/${id}`}>{getLessonMeta(id)?.lesson.title}</Link></li>)}</ul>
        </section>
      )}
    </article>
  );
}
