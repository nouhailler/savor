import { Link, useParams } from 'react-router-dom';
import { Check, Quotes, Scales, X } from '@phosphor-icons/react';
import { getDomain, getLessonMeta, getSheet, isLessonAvailable } from '../../services/content';
import { Breadcrumb, FavButton, usePageTitle } from '../../components/ui';
import NotFoundPage from '../home/NotFoundPage';

export default function SheetPage() {
  const { sheetId = '' } = useParams();
  const sheet = getSheet(sheetId);
  usePageTitle(sheet?.title ?? 'Fiche pratique');
  if (!sheet) return <NotFoundPage />;
  const lessons = sheet.relatedLessonIds.filter(isLessonAvailable);
  return (
    <article className="stack gap-xl narrower">
      <header className="stack gap-s">
        <Breadcrumb items={[{ label: 'Guide', to: '/guide' }, { label: getDomain(sheet.domainId)?.shortTitle ?? '' }]} />
        <div className="eyebrow">Fiche pratique</div>
        <h1 className="display">{sheet.title}</h1>
        <div><FavButton type="sheet" id={sheet.id} title={sheet.title} withLabel /></div>
      </header>
      <section className="context-card">
        <h2 className="eyebrow muted">La situation</h2>
        <p style={{ fontSize: '1.125rem', color: 'var(--ink)' }}>{sheet.situation}</p>
      </section>
      <section className="stack gap-s">
        <h2 className="h2">Le comportement conseillé</h2>
        <ol className="stack">
          {sheet.advice.map((a, i) => (
            <li key={i} className="rule-item"><span className="rule-num" aria-hidden="true">{i + 1}</span><span>{a}</span></li>
          ))}
        </ol>
      </section>
      <section className="pull prose">
        <h2 className="h2">Les raisons</h2>
        <p>{sheet.reasons}</p>
      </section>
      <section className="stack gap-s">
        <h2 className="dont-head h3"><X aria-hidden="true" />Les erreurs à éviter</h2>
        <ul className="stack gap-s">
          {sheet.mistakes.map((m, i) => <li key={i} className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start' }}><X size={16} style={{ color: 'var(--terracotta)', flex: 'none', marginTop: '.35rem' }} aria-hidden="true" /><span>{m}</span></li>)}
        </ul>
      </section>
      <section className="card">
        <h2 className="do-head"><Quotes aria-hidden="true" />Une formulation possible</h2>
        <p className="rule-quote" style={{ fontSize: '1.375rem' }}>{sheet.example}</p>
      </section>
      {sheet.culturalNuances && (
        <section className="nuance"><Scales size={20} aria-hidden="true" /><p><strong style={{ color: 'var(--ink)' }}>Nuances culturelles.</strong> {sheet.culturalNuances}</p></section>
      )}
      {lessons.length > 0 && (
        <section className="stack gap-xs">
          <h2 className="eyebrow">Pour approfondir</h2>
          <ul className="stack gap-xs">
            {lessons.map((id) => <li key={id} className="row" style={{ gap: '.375rem' }}><Check size={14} aria-hidden="true" /><Link to={`/lecons/${id}`}>{getLessonMeta(id)?.lesson.title}</Link></li>)}
          </ul>
        </section>
      )}
    </article>
  );
}
