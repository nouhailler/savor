import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Hourglass, SealCheck, SealQuestion, UsersThree } from '@phosphor-icons/react';
import { useUser } from '../../storage/UserContext';
import { getDomain, isLessonAvailable, scenarios } from '../../services/content';
import { domainProgress, lessonStatus } from '../../services/daily';
import { Bar, Breadcrumb, LevelBadge, STATUS_LABEL, StatusIcon, usePageTitle } from '../../components/ui';
import NotFoundPage from '../home/NotFoundPage';
import { formatDuration, plural } from '../../utils/text';
import { LEVEL_LABEL } from '../../utils/labels';

export default function DomainPage() {
  const { domainId = '' } = useParams();
  const domain = getDomain(domainId);
  const { data } = useUser();
  usePageTitle(domain?.title ?? 'Domaine');
  if (!domain) return <NotFoundPage />;

  const p = domainProgress(data, domain.id);
  const minutes = domain.lessons.reduce((n, l) => n + (isLessonAvailable(l.id) ? (l.estimatedDuration ?? 0) : 0), 0);
  const linked = scenarios.filter((s) => s.domainId === domain.id);

  return (
    <div className="stack" style={{ gap: '2.75rem' }}>
      <Breadcrumb items={[{ label: 'Apprendre', to: '/apprendre' }, { label: domain.shortTitle }]} />
      <header className="grid-2" style={{ alignItems: 'end' }}>
        <div className="stack gap-s">
          <div className="eyebrow">Domaine 0{domain.number}</div>
          <h1 className="display">{domain.title}</h1>
          <p className="lead">{domain.objective}</p>
        </div>
        <div className="stack gap-s">
          <div className="row" style={{ gap: '.5rem 1.5rem' }}>
            <span><strong style={{ color: 'var(--ink)' }}>{p.total}</strong> leçons rédigées</span>
            <span><strong style={{ color: 'var(--ink)' }}>{p.done}</strong> terminées</span>
            <span><strong style={{ color: 'var(--ink)' }}>{formatDuration(minutes)}</strong> de lecture</span>
          </div>
          <Bar percent={p.percent} label="Progression dans le domaine" />
          <div className="xsmall muted">{p.percent} % du domaine parcouru</div>
        </div>
      </header>

      <div className="grid-3">
        {domain.levels.map((lv) => {
          const lessons = domain.lessons.filter((l) => l.level === lv.level);
          const lp = domainProgress(data, domain.id, lv.level);
          const evalResult = data.evaluations[`${domain.id}:${lv.level}:final`];
          return (
            <section key={lv.level} className="level-card" aria-labelledby={`lv-${lv.level}`}>
              <div className="level-head">
                <LevelBadge level={lv.level} />
                <h2 id={`lv-${lv.level}`} className="level-title">{lv.title}</h2>
                <p className="small" style={{ lineHeight: 1.5 }}>{lv.description}</p>
                <div className="xsmall muted">
                  {lp.done} sur {plural(lp.total, 'leçon rédigée', 'leçons rédigées')}
                  {evalResult?.passed && <span className="row st-done" style={{ gap: '.25rem', marginTop: '.25rem' }}><SealCheck size={16} aria-hidden="true" />Niveau validé ({evalResult.percent} %)</span>}
                </div>
              </div>
              <ol className="lesson-list">
                {lessons.map((l) => {
                  if (!isLessonAvailable(l.id)) {
                    return (
                      <li key={l.id} className="lesson-item planned" title={l.topics.join(', ')}>
                        <Hourglass size={19} className="st-todo" aria-hidden="true" />
                        <span className="stack" style={{ gap: '.125rem' }}>
                          <span className="lesson-item-title">{l.title}</span>
                          <span className="lesson-item-meta">En préparation</span>
                        </span>
                      </li>
                    );
                  }
                  const st = lessonStatus(data, l.id);
                  return (
                    <li key={l.id}>
                      <Link className="lesson-item" to={`/lecons/${l.id}`}>
                        <StatusIcon status={st} />
                        <span className="stack" style={{ gap: '.125rem' }}>
                          <span className="lesson-item-title">{l.title}</span>
                          <span className="lesson-item-meta">{STATUS_LABEL[st]} · {l.estimatedDuration} min</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
              <div style={{ padding: '0 1.5rem 1.25rem' }}>
                <Link className="btn-link" to={`/evaluations/${domain.id}/final/${lv.level}`}>Évaluer le niveau {LEVEL_LABEL[lv.level]}</Link>
              </div>
            </section>
          );
        })}
      </div>

      <section className="grid-3">
        <Link className="banner-link" to={`/situations?domaine=${domain.id}`}>
          <UsersThree size={28} style={{ color: 'var(--sage-deep)', flex: 'none' }} aria-hidden="true" />
          <span className="stack" style={{ flex: 1, gap: '.125rem' }}>
            <span className="eyebrow sage">Mettre en pratique</span>
            <span className="banner-title">{plural(linked.length, 'situation pratique liée', 'situations pratiques liées')}</span>
          </span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
        <Link className="banner-link" to={`/evaluations/${domain.id}/initial`}>
          <SealQuestion size={28} style={{ color: 'var(--gold-deep)', flex: 'none' }} aria-hidden="true" />
          <span className="stack" style={{ flex: 1, gap: '.125rem' }}>
            <span className="eyebrow">Se situer</span>
            <span className="banner-title">Évaluation initiale du domaine</span>
          </span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
