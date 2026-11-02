import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowCounterClockwise, ArrowLeft, ArrowRight, CheckCircle, Clock, Scales, SealQuestion, Target, XCircle } from '@phosphor-icons/react';
import type { FullLesson } from '../../types/content';
import { getDomain, loadLesson, neighbours, scenarios, sheets } from '../../services/content';
import { useUser } from '../../storage/UserContext';
import { Breadcrumb, FavButton, LevelBadge, useToast, usePageTitle } from '../../components/ui';
import { CONVENTION_HELP, CONVENTION_LABEL, LEVEL_LABEL, NORMATIVITY_LABEL } from '../../utils/labels';
import { paragraphs } from '../../utils/text';
import { ExerciseBlock } from '../quizzes/Exercises';
import NotFoundPage from '../home/NotFoundPage';

const TOC: [string, string][] = [
  ['sec-obj', 'Objectifs'], ['sec-intro', 'Introduction'], ['sec-exp', 'Explication'], ['sec-regles', 'Règles essentielles'],
  ['sec-pourquoi', 'Pourquoi ces règles'], ['sec-bons', 'Comportements adaptés'], ['sec-mauvais', 'Comportements inadaptés'],
  ['sec-nuances', 'Nuances et exceptions'], ['sec-contextes', 'Contextes'], ['sec-retenir', 'À retenir'], ['sec-exercice', 'Exercice'],
  ['sec-quiz', 'Quiz'], ['sec-refs', 'Références']
];

export default function LessonPage() {
  const { lessonId = '' } = useParams();
  const { hash } = useLocation();
  const [lesson, setLesson] = useState<FullLesson | null | undefined>(undefined);
  const { data, openLesson, setReadPercent, completeLesson, ready } = useUser();
  const toast = useToast();
  usePageTitle(lesson?.title ?? 'Leçon');

  useEffect(() => {
    let alive = true;
    setLesson(undefined);
    loadLesson(lessonId).then((l) => { if (alive) setLesson(l); }).catch(() => { if (alive) setLesson(null); });
    return () => { alive = false; };
  }, [lessonId]);

  useEffect(() => {
    if (lesson && ready) openLesson(lesson.id, lesson.title);
  }, [lesson?.id, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!lesson) return;
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (h > 0) setReadPercent(lesson.id, (window.scrollY / h) * 100);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, [lesson?.id, hash]); // eslint-disable-line react-hooks/exhaustive-deps

  if (lesson === undefined) return <p className="muted" role="status">Chargement de la leçon…</p>;
  if (lesson === null) return <NotFoundPage />;

  const domain = getDomain(lesson.domainId)!;
  const nb = neighbours(lesson.id);
  const progress = data.lessons[lesson.id];
  const completed = progress?.status === 'completed';
  const expand = data.settings.expandRuleDetails;
  const relatedScenarios = scenarios.filter((s) => s.relatedLessonIds.includes(lesson.id));
  const relatedSheets = sheets.filter((s) => s.relatedLessonIds.includes(lesson.id));
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: data.settings.reduceMotion ? 'auto' : 'smooth' });

  return (
    <div className="lesson-wrap">
      <article className="lesson-article">
        <header className="stack gap-m">
          <Breadcrumb items={[{ label: domain.shortTitle, to: `/apprendre/${domain.slug}` }, { label: `${LEVEL_LABEL[lesson.level]} · Leçon ${lesson.number}` }]} />
          <h1 className="display">{lesson.title}</h1>
          <div className="row">
            <LevelBadge level={lesson.level} />
            <span className="small muted row" style={{ gap: '.375rem' }}><Clock aria-hidden="true" />{lesson.estimatedDuration} min de lecture</span>
            <span style={{ marginLeft: 'auto' }}><FavButton type="lesson" id={lesson.id} title={lesson.title} withLabel /></span>
          </div>
        </header>

        <section id="sec-obj" className="objectives scroll-anchor">
          <h2 className="eyebrow sage">Objectifs de la leçon</h2>
          <ul className="stack gap-xs">
            {lesson.objectives.map((o, i) => <li key={i}><Target aria-hidden="true" />{o}</li>)}
          </ul>
        </section>

        <section id="sec-intro" className="prose scroll-anchor">
          <h2 className="sr-only">Introduction</h2>
          {paragraphs(lesson.introduction).map((p, i) => <p key={i} className={i === 0 ? 'dropcap' : undefined}>{p}</p>)}
        </section>

        <section id="sec-exp" className="stack gap-l scroll-anchor">
          <h2 className="h2">Explication</h2>
          {lesson.sections.map((s) => (
            <div key={s.title} className="stack gap-s prose">
              <h3 className="h3">{s.title}</h3>
              {paragraphs(s.content).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          ))}
        </section>

        <section id="sec-regles" className="stack gap-m scroll-anchor">
          <h2 className="h2">Les règles essentielles</h2>
          <ol className="stack">
            {lesson.rules.map((r, i) => (
              <li key={r.id} id={r.id} className="rule-item scroll-anchor">
                <span className="rule-num" aria-hidden="true">{i + 1}</span>
                <div className="stack gap-xs" style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                    <strong className="rule-title">{r.title}</strong>
                    <FavButton type="rule" id={r.id} title={r.title} />
                  </div>
                  <span>{r.description}</span>
                  <span className="row" style={{ gap: '.375rem' }}>
                    <span className="tag" title={CONVENTION_HELP[r.conventionType]}>{CONVENTION_LABEL[r.conventionType]}</span>
                    <span className="tag">{NORMATIVITY_LABEL[r.normativity]}</span>
                  </span>
                  <details className="rule-details" open={expand}>
                    <summary>Comprendre et appliquer</summary>
                    <dl className="rule-dl">
                      <div><dt>Pourquoi</dt><dd>{r.rationale}</dd></div>
                      <div><dt>Quand</dt><dd>{r.context}</dd></div>
                      <div><dt>Comment faire</dt><dd>{r.recommendedBehavior}</dd></div>
                      {r.exceptions.length > 0 && <div><dt>Exceptions</dt><dd>{r.exceptions.join(' ')}</dd></div>}
                      <div><dt>Si la règle n’a pas été respectée</dt><dd>{r.remedy}</dd></div>
                    </dl>
                  </details>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="sec-pourquoi" className="pull prose scroll-anchor">
          <h2 className="h2">Pourquoi ces règles existent</h2>
          {paragraphs(lesson.why).map((p, i) => <p key={i}>{p}</p>)}
        </section>

        <section id="sec-bons" className="stack gap-m scroll-anchor">
          <h2 className="h2">Comportements adaptés</h2>
          <div className="stack gap-m">
            {lesson.examples.map((e, i) => (
              <div key={i} className="card">
                <div className="do-head"><CheckCircle size={20} weight="fill" aria-hidden="true" />{e.context}</div>
                <p>{e.behavior}</p>
                <p className="small muted">{e.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="sec-mauvais" className="stack gap-m scroll-anchor">
          <h2 className="h2">Comportements inadaptés</h2>
          <div className="stack gap-m">
            {lesson.mistakes.map((m, i) => (
              <div key={i} className="card">
                <div className="dont-head"><XCircle size={20} weight="fill" aria-hidden="true" />{m.situation}</div>
                <p>{m.behavior}</p>
                <p className="small muted"><strong>Effet :</strong> {m.consequences}</p>
                <p className="small"><strong style={{ color: 'var(--ok-fg)' }}>Plutôt :</strong> {m.alternative}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="sec-nuances" className="stack gap-m scroll-anchor">
          <h2 className="h2">Nuances et exceptions</h2>
          {lesson.nuances.map((n, i) => (
            <div key={i} className="nuance">
              <Scales size={20} aria-hidden="true" />
              <p><strong style={{ color: 'var(--ink)' }}>{n.title}</strong> {n.text}</p>
            </div>
          ))}
        </section>

        <section id="sec-contextes" className="stack gap-m scroll-anchor">
          <h2 className="h2">Contextes d’application</h2>
          <ul className="stack gap-s dash-list">
            {lesson.contexts.map((c, i) => <li key={i}><span aria-hidden="true">—</span><span>{c}</span></li>)}
          </ul>
        </section>

        <section id="sec-retenir" className="keep scroll-anchor">
          <h2>Points à retenir</h2>
          {lesson.keyPoints.map((k, i) => (
            <div key={i} className="keep-item"><span aria-hidden="true">—</span><span>{k}</span></div>
          ))}
        </section>

        <section id="sec-exercice" className="stack gap-m scroll-anchor">
          <h2 className="h2">Exercice</h2>
          <ExerciseBlock exercise={lesson.exercise} lessonId={lesson.id} lessonTitle={lesson.title} />
        </section>

        <section id="sec-quiz" className="card-cream scroll-anchor">
          <h2 className="eyebrow">Quiz de validation</h2>
          <p className="h3">{lesson.quiz.questions.length} questions, chacune expliquée</p>
          {progress?.bestScore !== undefined && <p className="small">Meilleur résultat : {progress.bestScore} % en {progress.attempts} essai{progress.attempts > 1 ? 's' : ''}.</p>}
          <div className="row">
            <Link className="btn btn-primary" to={`/lecons/${lesson.id}/quiz`}><SealQuestion aria-hidden="true" />Lancer le quiz</Link>
            <Link className="btn btn-secondary" to={`/revisions?lecon=${lesson.id}`}><ArrowCounterClockwise aria-hidden="true" />Réviser</Link>
          </div>
        </section>

        {(relatedScenarios.length > 0 || relatedSheets.length > 0) && (
          <section className="stack gap-s">
            <h2 className="h2">Pour aller plus loin</h2>
            <ul className="stack gap-xs">
              {relatedScenarios.map((s) => <li key={s.id}><Link to={`/situations/${s.id}`}>Situation : {s.title}</Link></li>)}
              {relatedSheets.map((s) => <li key={s.id}><Link to={`/guide/${s.id}`}>Fiche : {s.title}</Link></li>)}
            </ul>
          </section>
        )}

        <section id="sec-refs" className="stack gap-m scroll-anchor">
          <h2 className="h2">Références documentaires</h2>
          <ul className="ref-list">
            {lesson.references.map((r, i) => (
              <li key={i}>
                {r.author && <>{r.author}, </>}<em>{r.title}</em>{r.publisher && <>, {r.publisher}</>}{r.year && <>, {r.year}</>}.{r.note && <span className="muted"> {r.note}</span>}
              </li>
            ))}
          </ul>
          <p className="xsmall muted">Texte original, version {lesson.version}, mis à jour le {lesson.updatedAt}.</p>
        </section>

        <div className="row">
          <button
            type="button"
            className={`btn ${completed ? 'btn-secondary' : 'btn-primary'}`}
            aria-pressed={completed}
            onClick={() => {
              completeLesson(lesson.id, lesson.title, !completed);
              toast(completed ? 'Leçon remise en cours' : 'Leçon marquée comme terminée');
            }}
          >
            <CheckCircle weight={completed ? 'fill' : 'regular'} aria-hidden="true" />
            {completed ? 'Terminée — annuler' : 'Marquer comme terminée'}
          </button>
        </div>

        <footer className="lesson-footer">
          {nb.prev ? (
            <Link className="nav-lesson" to={`/lecons/${nb.prev.id}`}><ArrowLeft size={18} aria-hidden="true" /><span><small>Précédent</small><strong>{nb.prev.title}</strong></span></Link>
          ) : <span />}
          {nb.next ? (
            <Link className="nav-lesson" to={`/lecons/${nb.next.id}`} style={{ textAlign: 'right' }}><span><small>Suivant</small><strong>{nb.next.title}</strong></span><ArrowRight size={18} aria-hidden="true" /></Link>
          ) : <Link className="nav-lesson" to={`/apprendre/${domain.slug}`}><span><small>Fin du domaine</small><strong>Revenir au domaine</strong></span><ArrowRight size={18} aria-hidden="true" /></Link>}
        </footer>
      </article>
      <aside className="toc">
        <div className="eyebrow muted">Dans cette leçon</div>
        <nav aria-label="Sommaire de la leçon" className="toc-list">
          {TOC.map(([id, label]) => <button type="button" key={id} onClick={() => jump(id)}>{label}</button>)}
        </nav>
      </aside>
    </div>
  );
}

