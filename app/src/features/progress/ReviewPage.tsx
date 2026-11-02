import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowCounterClockwise, CalendarCheck, Warning, Lightning, Shuffle, type Icon } from '@phosphor-icons/react';
import { useUser } from '../../storage/UserContext';
import { availableLessons, getLessonMeta, isLessonAvailable, loadLesson } from '../../services/content';
import { Empty, PageHead, usePageTitle } from '../../components/ui';
import { QuizRunner } from '../quizzes/QuizRunner';
import { sample, type RunnerQuestion } from '../quizzes/scoring';
import { dayKey, formatLongDate } from '../../utils/date';
import { lessonIdOfQuestion, selectFailed, selectForReview, selectWeakest } from '../../utils/spaced';
import { lessonIdOfRule } from '../favorites/FavoritesPage';
import { plural } from '../../utils/text';

const SIZE = 10;

async function resolveQuestions(ids: string[]): Promise<RunnerQuestion[]> {
  const lessonIds = [...new Set(ids.map(lessonIdOfQuestion))].filter(isLessonAvailable);
  const lessons = await Promise.all(lessonIds.map(loadLesson));
  const all = new Map(lessons.flatMap((l) => l?.quiz.questions ?? []).map((q) => [q.id, q]));
  return ids.flatMap((id) => { const q = all.get(id); return q ? [q] : []; });
}

export default function ReviewPage() {
  usePageTitle('Révisions');
  const { data, recordQuiz } = useUser();
  const [params] = useSearchParams();
  const lessonParam = params.get('lecon');
  const [running, setRunning] = useState<{ questions: RunnerQuestion[]; title: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const today = dayKey();
  const stats = useMemo(() => Object.values(data.questions), [data.questions]);
  const due = useMemo(() => selectForReview(stats, today, SIZE), [stats, today]);
  const dueCount = useMemo(() => selectForReview(stats, today, 9999).length, [stats, today]);
  const failed = useMemo(() => selectFailed(stats, SIZE), [stats]);
  const weak = useMemo(() => selectWeakest(stats, SIZE), [stats]);
  const completed = Object.values(data.lessons).filter((l) => l.status === 'completed' && isLessonAvailable(l.lessonId));
  const favRules = data.favorites.filter((f) => f.targetType === 'rule');

  const start = async (ids: string[], title: string) => {
    setBusy(true);
    const questions = await resolveQuestions(ids);
    setBusy(false);
    if (questions.length) { setRunning({ questions, title }); window.scrollTo(0, 0); }
  };

  const startMixed = async () => {
    const pool = (completed.length ? completed.map((l) => l.lessonId) : availableLessons().map((l) => l.id));
    const lessons = await Promise.all(sample(pool, 6).map(loadLesson));
    const qs = lessons.flatMap((l) => l?.quiz.questions ?? []);
    if (qs.length) { setRunning({ questions: sample(qs, SIZE), title: 'Quiz de révision' }); window.scrollTo(0, 0); }
  };

  const startLesson = async (id: string) => {
    const l = await loadLesson(id);
    if (l) { setRunning({ questions: sample(l.quiz.questions, SIZE), title: `Révision : ${l.title}` }); window.scrollTo(0, 0); }
  };

  if (running) {
    return (
      <div className="stack gap-xl" style={{ maxWidth: '47.5rem' }}>
        <div className="eyebrow">{running.title}</div>
        <QuizRunner
          questions={running.questions}
          onFinish={(o) => recordQuiz({ source: 'revision', sourceType: 'review', title: running.title, score: o.score, total: o.total, answers: o.answers.map((a) => ({ questionId: a.questionId, correct: a.correct })) })}
          summary={(o) => (
            <>
              <h1 className="h2-sm" style={{ fontWeight: 600 }}>{o.percent >= 80 ? 'Solidement acquis.' : 'Ces notions reviendront bientôt.'}</h1>
              <p>Plus une question est maîtrisée, plus elle s’espace : de 1 à 35 jours. Une erreur la ramène au lendemain.</p>
            </>
          )}
          actions={<button type="button" className="btn btn-primary" onClick={() => setRunning(null)}>Revenir aux révisions</button>}
        />
      </div>
    );
  }

  const modes: { icon: Icon; title: string; desc: string; count: number; run: () => void }[] = [
    { icon: CalendarCheck, title: 'Questions du jour', desc: 'La répétition espacée vous ramène ce qui est sur le point de s’oublier.', count: dueCount, run: () => start(due.map((s) => s.questionId), 'Questions du jour') },
    { icon: ArrowCounterClockwise, title: 'Questions échouées', desc: 'Celles dont votre dernière réponse n’était pas la bonne.', count: failed.length, run: () => start(failed.map((s) => s.questionId), 'Questions échouées') },
    { icon: Warning, title: 'Notions les moins maîtrisées', desc: 'Les plus faibles taux de réussite, toutes dates confondues.', count: weak.length, run: () => start(weak.map((s) => s.questionId), 'Notions les moins maîtrisées') }
  ];

  return (
    <div className="stack gap-2xl">
      <PageHead eyebrow="Révisions" title="Consolider, sans bachoter" lead="La mémoire tient mieux quand on revient aux choses juste avant de les oublier." />
      {lessonParam && isLessonAvailable(lessonParam) && (
        <div className="card-cream">
          <div className="eyebrow">Réviser cette leçon</div>
          <p className="h3">{getLessonMeta(lessonParam)?.lesson.title}</p>
          <div className="row">
            <button type="button" className="btn btn-primary" onClick={() => startLesson(lessonParam)}>Lancer les questions</button>
            <Link className="btn btn-secondary" to={`/lecons/${lessonParam}#sec-retenir`}>Relire les points à retenir</Link>
          </div>
        </div>
      )}
      <div className="grid-wide">
        {modes.map((m) => (
          <section key={m.title} className="card">
            <m.icon size={24} style={{ color: 'var(--gold-deep)' }} aria-hidden="true" />
            <h2 className="card-title">{m.title}</h2>
            <p className="small muted" style={{ flex: 1 }}>{m.desc}</p>
            <p className="small">{plural(m.count, 'question')}</p>
            <div><button type="button" className="btn btn-secondary" disabled={!m.count || busy} onClick={m.run}>Commencer</button></div>
          </section>
        ))}
        <section className="card">
          <Shuffle size={24} style={{ color: 'var(--gold-deep)' }} aria-hidden="true" />
          <h2 className="card-title">Quiz de révision</h2>
          <p className="small muted" style={{ flex: 1 }}>Dix questions tirées des leçons terminées, ou de toute la bibliothèque si vous débutez.</p>
          <div><button type="button" className="btn btn-secondary" onClick={startMixed}><Lightning aria-hidden="true" />Lancer</button></div>
        </section>
      </div>
      <section className="grid-2" style={{ alignItems: 'start' }}>
        <div className="stack gap-s">
          <h2 className="h2">Leçons terminées</h2>
          {completed.length === 0 && <Empty title="Aucune leçon terminée pour l’instant."><Link to="/apprendre">Parcourir les domaines</Link></Empty>}
          <ul className="stack">
            {completed.slice(0, 20).map((l) => (
              <li key={l.lessonId} style={{ padding: '.75rem 0', borderTop: '1px solid var(--rule)' }}>
                <Link to={`/lecons/${l.lessonId}`}>{getLessonMeta(l.lessonId)?.lesson.title}</Link>
                {l.completionDate && <div className="xsmall muted">Terminée le {formatLongDate(l.completionDate)}{l.bestScore !== undefined ? ` · meilleur quiz ${l.bestScore} %` : ''}</div>}
              </li>
            ))}
          </ul>
        </div>
        <div className="stack gap-s">
          <h2 className="h2">Règles favorites</h2>
          {favRules.length === 0 && <p className="muted">Marquez une règle d’un signet, dans une leçon, pour la revoir ici.</p>}
          <ul className="stack">
            {favRules.map((f) => (
              <li key={f.id} style={{ padding: '.75rem 0', borderTop: '1px solid var(--rule)' }}>
                <Link to={`/lecons/${lessonIdOfRule(f.targetId)}#${f.targetId}`}>Règle de « {getLessonMeta(lessonIdOfRule(f.targetId))?.lesson.title} »</Link>
              </li>
            ))}
          </ul>
          <Link className="btn-link" to="/progression">Consulter l’historique de progression</Link>
        </div>
      </section>
    </div>
  );
}
