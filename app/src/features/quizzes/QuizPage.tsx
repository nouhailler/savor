import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { FullLesson } from '../../types/content';
import { loadLesson, neighbours } from '../../services/content';
import { useUser } from '../../storage/UserContext';
import { Breadcrumb, usePageTitle } from '../../components/ui';
import NotFoundPage from '../home/NotFoundPage';
import { QuizRunner } from './QuizRunner';

export default function QuizPage() {
  const { lessonId = '' } = useParams();
  const [lesson, setLesson] = useState<FullLesson | null | undefined>(undefined);
  const { recordQuiz } = useUser();
  usePageTitle(lesson ? `Quiz : ${lesson.title}` : 'Quiz');

  useEffect(() => {
    let alive = true;
    loadLesson(lessonId).then((l) => { if (alive) setLesson(l); }).catch(() => { if (alive) setLesson(null); });
    return () => { alive = false; };
  }, [lessonId]);

  if (lesson === undefined) return <p className="muted" role="status">Chargement…</p>;
  if (!lesson) return <NotFoundPage />;

  const next = neighbours(lesson.id).next;
  const pass = lesson.quiz.passingScore;

  return (
    <div className="stack gap-xl" style={{ maxWidth: '47.5rem' }}>
      <header className="stack gap-s">
        <Breadcrumb items={[{ label: lesson.title, to: `/lecons/${lesson.id}` }, { label: 'Quiz de validation' }]} />
      </header>
      <QuizRunner
        questions={lesson.quiz.questions}
        onRestart={() => undefined}
        onFinish={(o) =>
          recordQuiz({
            source: lesson.id,
            sourceType: 'lesson',
            title: lesson.title,
            score: o.score,
            total: o.total,
            lessonId: lesson.id,
            answers: o.answers.map((a) => ({ questionId: a.questionId, correct: a.correct }))
          })
        }
        summary={(o) => (
          <>
            <h1 className="h2-sm" style={{ fontWeight: 600 }}>
              {o.percent >= 100 ? 'Sans faute.' : o.percent >= pass ? 'L’essentiel est acquis.' : 'Quelques usages à revoir.'}
            </h1>
            <p>
              {o.percent >= pass
                ? `Vous atteignez le seuil de ${pass} %. Les questions manquées reviendront dans vos révisions.`
                : `Le seuil de validation est de ${pass} %. Relisez les explications ci-dessous : elles valent autant que le score.`}
            </p>
          </>
        )}
        actions={
          <>
            <Link className="btn btn-secondary" to={`/lecons/${lesson.id}`}>Relire la leçon</Link>
            {next && <Link className="btn btn-primary" to={`/lecons/${next.id}`}>Leçon suivante</Link>}
          </>
        }
      />
    </div>
  );
}
