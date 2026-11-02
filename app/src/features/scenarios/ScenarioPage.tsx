import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowCounterClockwise, ArrowRight, MapPinLine } from '@phosphor-icons/react';
import { getDomain, getLessonMeta, getScenario, isLessonAvailable } from '../../services/content';
import { useUser } from '../../storage/UserContext';
import { Breadcrumb, FavButton, LevelBadge, Verdict, usePageTitle, verdictOf } from '../../components/ui';
import { hashString, seededShuffle } from '../../utils/text';
import NotFoundPage from '../home/NotFoundPage';

const LETTERS = 'ABCDEF';

interface Decision { stepId: string; choiceId: string; score: number }

export default function ScenarioPage() {
  const { scenarioId = '' } = useParams();
  const [params] = useSearchParams();
  const isChallenge = params.get('defi') === '1';
  const scenario = getScenario(scenarioId);
  const { recordScenario, recordChallenge } = useUser();
  usePageTitle(scenario?.title ?? 'Situation');
  const [stepId, setStepId] = useState(scenario?.steps[0]?.id ?? '');
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [run, setRun] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = scenario?.steps.find((s) => s.id === stepId);
  const choices = useMemo(() => (step ? seededShuffle(step.choices, hashString(step.id + run)) : []), [step, run]);

  if (!scenario || !step) return <NotFoundPage />;

  const decision = decisions.find((d) => d.stepId === step.id);
  const chosen = decision ? step.choices.find((c) => c.id === decision.choiceId) : undefined;

  const choose = (choiceId: string, score: number) => {
    if (decision) return;
    const next = [...decisions, { stepId: step.id, choiceId, score }];
    setDecisions(next);
    const c = step.choices.find((x) => x.id === choiceId);
    if (!c?.nextStepId) {
      const percent = Math.round((next.reduce((n, d) => n + d.score, 0) / next.length) * 100);
      setFinished(true);
      recordScenario(scenario.id, scenario.title, percent);
      if (isChallenge) recordChallenge(scenario.id, scenario.title, percent);
    }
  };

  const percent = decisions.length ? Math.round((decisions.reduce((n, d) => n + d.score, 0) / decisions.length) * 100) : 0;
  const domain = getDomain(scenario.domainId);
  const lessons = scenario.relatedLessonIds.filter(isLessonAvailable);

  return (
    <div className="stack gap-xl" style={{ maxWidth: '48.75rem' }}>
      <header className="stack gap-s">
        <Breadcrumb items={[{ label: 'Situations pratiques', to: '/situations' }, { label: domain?.shortTitle ?? '' }]} />
        <div className="eyebrow sage">{isChallenge ? 'Défi du jour' : 'Situation pratique'} · {domain?.shortTitle}</div>
        <h1 className="display">{scenario.title}</h1>
        <div className="row">
          <LevelBadge level={scenario.level} />
          <span style={{ marginLeft: 'auto' }}><FavButton type="scenario" id={scenario.id} title={scenario.title} withLabel /></span>
        </div>
      </header>

      {decisions.length === 0 || decisions[0].stepId === step.id ? (
        <section className="context-card">
          <div className="eyebrow muted row" style={{ gap: '.5rem' }}><MapPinLine size={16} aria-hidden="true" />Le contexte</div>
          <p className="context-text">{scenario.context}</p>
          {scenario.characters.length > 0 && <p className="small"><strong>Personnages :</strong> {scenario.characters.join(' · ')}</p>}
        </section>
      ) : null}

      <section className="stack gap-m" aria-live="polite">
        {step.narrative && <p className="lead" style={{ color: 'var(--ink)' }}>{step.narrative}</p>}
        <h2 className="h2-sm">{step.question}</h2>
        <div role="radiogroup" aria-label="Vos options" className="stack gap-s">
          {choices.map((c, i) => {
            const sel = decision?.choiceId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={sel}
                disabled={!!decision}
                className={`choice${sel ? ' selected' : ''}${decision && !sel ? ' dim' : ''}`}
                onClick={() => choose(c.id, c.score)}
              >
                <span className="choice-letter" aria-hidden="true">{LETTERS[i]}</span>
                <span className="choice-body"><span>{c.label}</span>{decision && <Verdict kind={verdictOf(c.score)} />}</span>
              </button>
            );
          })}
        </div>
      </section>

      {chosen && (
        <section className="stack gap-l" aria-live="polite">
          <div className="card card-lg">
            <Verdict kind={verdictOf(chosen.score)} />
            <h3 className="h3">{chosen.feedbackTitle}</h3>
            <p style={{ lineHeight: 1.65 }}>{chosen.feedback}</p>
          </div>
          {chosen.nextStepId ? (
            <div>
              <button type="button" className="btn btn-primary" onClick={() => { setStepId(chosen.nextStepId!); window.scrollTo(0, 0); }}>
                La suite<ArrowRight aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <div className="pull" style={{ paddingBottom: 0, borderBottom: 0 }}>
                <div className="eyebrow">La règle en jeu</div>
                <p className="rule-quote">{scenario.rule}</p>
                {scenario.nuance && <p><strong style={{ color: 'var(--ink)' }}>Nuance —</strong> {scenario.nuance}</p>}
              </div>
              {finished && decisions.length > 1 && <p className="small muted">Votre parcours : {decisions.length} décisions, appréciation globale de {percent} %.</p>}
              <div className="row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setDecisions([]); setStepId(scenario.steps[0].id); setFinished(false); setRun((r) => r + 1); window.scrollTo(0, 0); }}
                >
                  <ArrowCounterClockwise aria-hidden="true" />Rejouer
                </button>
                {lessons[0] && <Link className="btn btn-primary" to={`/lecons/${lessons[0]}`}>Lire la leçon associée<ArrowRight aria-hidden="true" /></Link>}
              </div>
              {lessons.length > 1 && (
                <ul className="small stack gap-xs">
                  {lessons.slice(1).map((id) => <li key={id}><Link to={`/lecons/${id}`}>{getLessonMeta(id)?.lesson.title}</Link></li>)}
                </ul>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
