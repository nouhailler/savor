import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarCheck, ListChecks, SealCheck, SealQuestion, UsersThree, type Icon } from '@phosphor-icons/react';
import { useUser } from '../../storage/UserContext';
import { domains, getLessonMeta, getScenario, isLessonAvailable } from '../../services/content';
import { domainProgress, globalProgress } from '../../services/daily';
import { Bar, PageHead, usePageTitle } from '../../components/ui';
import { LEVELS } from '../../types/content';
import type { ActivityKind } from '../../types/user';
import { LEVEL_LABEL } from '../../utils/labels';
import { formatLongDate, formatRelative, dayKey } from '../../utils/date';
import { formatDuration } from '../../utils/text';
import { selectForReview } from '../../utils/spaced';

const KIND: Record<ActivityKind, [string, Icon]> = {
  lesson: ['Leçon', BookOpen], quiz: ['Quiz', SealQuestion], scenario: ['Situation', UsersThree], evaluation: ['Évaluation', SealCheck],
  challenge: ['Défi du jour', CalendarCheck], review: ['Révision', ListChecks], exercise: ['Exercice', ListChecks]
};

export default function ProgressPage() {
  usePageTitle('Ma progression');
  const { data } = useUser();
  const g = globalProgress(data);
  const quiz = data.attempts.filter((a) => a.sourceType === 'lesson');
  const avg = quiz.length ? Math.round(quiz.reduce((n, a) => n + a.percent, 0) / quiz.length) : null;
  const minutes = Object.values(data.lessons).filter((l) => l.status === 'completed').reduce((n, l) => n + (getLessonMeta(l.lessonId)?.lesson.estimatedDuration ?? 0), 0);
  const validated = Object.values(data.evaluations).filter((e) => e.kind === 'final' && e.passed);
  const due = selectForReview(Object.values(data.questions), dayKey(), 999).length;
  const challenges = Object.values(data.challenges).sort((a, b) => b.date.localeCompare(a.date));
  const stats: [string, string][] = [
    [`${g.done}`, `leçons terminées sur ${g.total}`],
    [`${Object.keys(data.scenarios).length}`, 'situations pratiquées'],
    [avg === null ? '—' : `${avg} %`, `moyenne sur ${quiz.length} quiz`],
    [formatDuration(minutes), 'de lecture']
  ];

  return (
    <div className="stack gap-2xl">
      <PageHead eyebrow="Ma progression" title="Votre carnet de lecture" lead="Ce que vous avez lu, pratiqué et vérifié. Aucun classement, aucune série à tenir : seulement de quoi savoir où reprendre." />
      <dl className="stat-row" style={{ margin: 0 }}>
        {stats.map(([v, l]) => <div key={l}><dt>{l}</dt><dd>{v}</dd></div>)}
      </dl>

      <section className="stack gap-m">
        <div className="row-between"><h2 className="h2">Par domaine et par niveau</h2><span className="small muted">Leçons terminées sur leçons rédigées</span></div>
        <div className="table-wrap">
          <table className="table" style={{ minWidth: '36rem' }}>
            <thead><tr><th scope="col">Domaine</th>{LEVELS.map((l) => <th scope="col" key={l}>{LEVEL_LABEL[l]}</th>)}</tr></thead>
            <tbody>
              {domains.map((d) => (
                <tr key={d.id}>
                  <th scope="row" style={{ fontWeight: 500 }}><Link to={`/apprendre/${d.slug}`}>{d.shortTitle}</Link></th>
                  {LEVELS.map((l) => {
                    const p = domainProgress(data, d.id, l);
                    const ok = data.evaluations[`${d.id}:${l}:final`]?.passed;
                    return (
                      <td key={l}>
                        <div className="stack gap-xs">
                          <Bar percent={p.percent} label={`${d.shortTitle}, ${LEVEL_LABEL[l]}`} />
                          <span className="xsmall" style={ok ? { color: 'var(--ok-fg)', fontWeight: 600 } : undefined}>{p.done} / {p.total}{ok ? ' · validé' : ''}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid-2">
        <Link className="banner-link" to="/revisions">
          <ListChecks size={28} style={{ color: 'var(--gold-deep)', flex: 'none' }} aria-hidden="true" />
          <span className="stack" style={{ flex: 1, gap: '.125rem' }}>
            <span className="eyebrow">À revoir</span>
            <span className="banner-title">{due ? `${due} question${due > 1 ? 's' : ''} à réviser aujourd’hui` : 'Révisions personnalisées'}</span>
          </span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
        <Link className="banner-link" to="/evaluations">
          <SealCheck size={28} style={{ color: 'var(--sage-deep)', flex: 'none' }} aria-hidden="true" />
          <span className="stack" style={{ flex: 1, gap: '.125rem' }}>
            <span className="eyebrow sage">Validations</span>
            <span className="banner-title">{validated.length} niveau{validated.length > 1 ? 'x' : ''} validé{validated.length > 1 ? 's' : ''}</span>
            <span className="xsmall muted">Attestation interne de progression, non un diplôme reconnu.</span>
          </span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </section>

      <section className="grid-2" style={{ alignItems: 'start' }}>
        <div className="stack gap-m">
          <h2 className="h2">Activité récente</h2>
          {data.activity.length === 0 && <p className="muted">Rien pour l’instant. Votre historique apparaîtra ici.</p>}
          <ol className="stack">
            {data.activity.slice(0, 12).map((a, i) => {
              const [label, I] = KIND[a.kind];
              return (
                <li key={i} className="row" style={{ flexWrap: 'nowrap', alignItems: 'flex-start', padding: '.875rem 0', borderTop: '1px solid var(--rule)' }}>
                  <I size={20} style={{ color: 'var(--gold-deep)', flex: 'none', marginTop: '.125rem' }} aria-hidden="true" />
                  <span className="stack" style={{ flex: 1, minWidth: 0, gap: '.125rem' }}>
                    <span style={{ color: 'var(--ink)', fontWeight: 500, lineHeight: 1.35 }}>{a.title}</span>
                    <span className="xsmall muted">{label} · {a.detail}</span>
                  </span>
                  <span className="xsmall muted" style={{ whiteSpace: 'nowrap' }}>{formatRelative(a.date)}</span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="stack gap-m">
          <h2 className="h2">Défis relevés</h2>
          {challenges.length === 0 && <p className="muted">Les défis du jour que vous relevez restent consultables ici.</p>}
          <ul className="stack">
            {challenges.slice(0, 15).map((c) => {
              const s = getScenario(c.scenarioId);
              return (
                <li key={c.date} style={{ padding: '.875rem 0', borderTop: '1px solid var(--rule)' }}>
                  {s ? <Link to={`/situations/${s.id}`}>{s.title}</Link> : <span>Situation retirée</span>}
                  <div className="xsmall muted">{formatLongDate(c.date)} · {c.percent} %</div>
                </li>
              );
            })}
          </ul>
          <h2 className="h2">Leçons à relire</h2>
          <ul className="stack gap-xs small">
            {Object.values(data.lessons)
              .filter((l) => l.bestScore !== undefined && l.bestScore < 70 && isLessonAvailable(l.lessonId))
              .slice(0, 8)
              .map((l) => <li key={l.lessonId}><Link to={`/lecons/${l.lessonId}`}>{getLessonMeta(l.lessonId)?.lesson.title}</Link> — meilleur quiz : {l.bestScore} %</li>)}
          </ul>
        </div>
      </section>
    </div>
  );
}
