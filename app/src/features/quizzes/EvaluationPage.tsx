import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LEVELS, type Level } from '../../types/content';
import { availableLessons, getDomain, loadLesson, scenarios } from '../../services/content';
import { useUser } from '../../storage/UserContext';
import { Breadcrumb, Empty, usePageTitle } from '../../components/ui';
import { LEVEL_LABEL, LEVEL_THRESHOLD } from '../../utils/labels';
import NotFoundPage from '../home/NotFoundPage';
import { QuizRunner, type QuizOutcome } from './QuizRunner';
import { sample, scenarioToQuestion, type RunnerQuestion } from './scoring';

const FINAL_QUESTIONS = 10;
const FINAL_SITUATIONS = 2;
const INITIAL_PER_LEVEL = 4;

async function questionsOf(domainId: string, level: Level) {
  const lessons = await Promise.all(availableLessons(domainId, level).map((l) => loadLesson(l.id)));
  return lessons.flatMap((l) => l?.quiz.questions ?? []);
}

/** Niveau conseillé : le premier dont le seuil n'est pas atteint. */
export function recommendLevel(perLevel: Record<Level, number>): Level {
  for (const level of LEVELS) if (perLevel[level] < LEVEL_THRESHOLD[level]) return level;
  return 'advanced';
}

export default function EvaluationPage() {
  const { domainId = '', kind, level } = useParams();
  const domain = getDomain(domainId);
  const validLevel = LEVELS.includes(level as Level) ? (level as Level) : undefined;
  const isFinal = kind === 'final' && !!validLevel;
  const isInitial = kind === 'initial';
  const [questions, setQuestions] = useState<RunnerQuestion[] | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [recommended, setRecommended] = useState<Level | null>(null);
  const { recordEvaluation, recordAnswers } = useUser();
  const label = isFinal ? `Évaluation finale, niveau ${LEVEL_LABEL[validLevel!]}` : 'Évaluation initiale';
  usePageTitle(label);

  useEffect(() => {
    if (!domain || (!isFinal && !isInitial)) return;
    let alive = true;
    setQuestions(null);
    (async () => {
      let qs: RunnerQuestion[];
      if (isFinal) {
        const situations = scenarios.filter((s) => s.domainId === domain.id && s.level === validLevel);
        qs = [...sample(await questionsOf(domain.id, validLevel!), FINAL_QUESTIONS), ...sample(situations, FINAL_SITUATIONS).map(scenarioToQuestion)];
      } else {
        const groups = await Promise.all(LEVELS.map((l) => questionsOf(domain.id, l)));
        qs = groups.flatMap((g) => sample(g, INITIAL_PER_LEVEL));
      }
      if (alive) setQuestions(qs);
    })().catch(() => { if (alive) setQuestions([]); });
    return () => { alive = false; };
  }, [domain?.id, isFinal, isInitial, validLevel, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!domain || (!isFinal && !isInitial)) return <NotFoundPage />;
  if (questions === null) return <p className="muted" role="status">Préparation de l’évaluation…</p>;
  if (questions.length === 0) {
    return <Empty title="Pas encore assez de contenu pour cette évaluation."><Link to={`/apprendre/${domain.slug}`}>Revenir au domaine</Link></Empty>;
  }

  const threshold = isFinal ? LEVEL_THRESHOLD[validLevel!] : 0;
  const onFinish = (o: QuizOutcome) => {
    const passed = isFinal && o.percent >= threshold;
    let reco: Level | undefined;
    if (isInitial) {
      const perLevel = { beginner: 0, intermediate: 0, advanced: 0 } as Record<Level, number>;
      LEVELS.forEach((l, i) => {
        const part = o.answers.slice(i * INITIAL_PER_LEVEL, (i + 1) * INITIAL_PER_LEVEL);
        perLevel[l] = part.length ? (part.reduce((n, a) => n + a.credit, 0) / part.length) * 100 : 0;
      });
      reco = recommendLevel(perLevel);
      setRecommended(reco);
    }
    recordEvaluation({ domainId: domain.id, level: validLevel, kind: isFinal ? 'final' : 'initial', percent: o.percent, passed, recommendedLevel: reco, title: `${label} · ${domain.shortTitle}` });
    // Les questions rencontrées alimentent la répétition espacée (hors situations, déjà suivies à part).
    const plain = o.answers.filter((a) => !a.question.scenarioId);
    if (plain.length) recordAnswers(plain.map((a) => ({ questionId: a.questionId, correct: a.correct })));
  };

  return (
    <div className="stack gap-xl" style={{ maxWidth: '47.5rem' }}>
      <header className="stack gap-s">
        <Breadcrumb items={[{ label: 'Évaluations', to: '/evaluations' }, { label: domain.shortTitle, to: `/apprendre/${domain.slug}` }, { label: label }]} />
        <p className="small muted">
          {questions.length} questions{isFinal ? ` dont des situations pratiques (crédit partiel possible). Seuil : ${threshold} %.` : ', tous niveaux confondus, pour vous situer sans enjeu.'}
        </p>
      </header>
      <QuizRunner
        key={attempt}
        questions={questions}
        onFinish={onFinish}
        onRestart={() => setAttempt((a) => a + 1)}
        summary={(o) => (
          <>
            {isFinal ? (
              <>
                <h1 className="h2-sm" style={{ fontWeight: 600 }}>{o.percent >= threshold ? `Niveau ${LEVEL_LABEL[validLevel!]} validé.` : 'Le niveau n’est pas encore validé.'}</h1>
                <p>{o.percent} % pour un seuil de {threshold} %. {o.percent >= threshold ? 'Il s’agit d’une attestation interne de progression, non d’un diplôme professionnel reconnu.' : 'Rien n’est verrouillé pour autant : relisez, pratiquez, revenez quand vous le souhaitez.'}</p>
              </>
            ) : (
              <>
                <h1 className="h2-sm" style={{ fontWeight: 600 }}>{recommended ? `Nous vous conseillons le niveau ${LEVEL_LABEL[recommended]}.` : 'Évaluation terminée.'}</h1>
                <p>{o.percent} % de réussite. Ce n’est qu’un repère : vous pouvez lire n’importe quelle leçon.</p>
              </>
            )}
          </>
        )}
        actions={<Link className="btn btn-primary" to={`/apprendre/${domain.slug}`}>Revenir au domaine</Link>}
      />
    </div>
  );
}
