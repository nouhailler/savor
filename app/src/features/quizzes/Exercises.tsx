import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, X } from '@phosphor-icons/react';
import type { CaseStudyExercise, Exercise, MatchingExercise, OrderingExercise } from '../../types/content';
import { useUser } from '../../storage/UserContext';
import { hashString, seededShuffle } from '../../utils/text';
import { EXERCISE_LABEL } from '../../utils/labels';

function Matching({ ex, onDone }: { ex: MatchingExercise; onDone: () => void }) {
  const options = useMemo(() => seededShuffle(ex.pairs.map((p) => p.right), hashString(ex.title)), [ex]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const complete = ex.pairs.every((_, i) => answers[i]);
  const good = ex.pairs.filter((p, i) => answers[i] === p.right).length;
  return (
    <div className="stack gap-s">
      {ex.pairs.map((p, i) => {
        const ok = answers[i] === p.right;
        return (
          <div key={i} className="match-row">
            <label htmlFor={`m-${i}`} style={{ color: 'var(--ink)', fontWeight: 500 }}>{p.left}</label>
            <div className="stack gap-xs">
              <select id={`m-${i}`} className="select" disabled={checked} value={answers[i] ?? ''} onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}>
                <option value="">Choisir…</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              {checked && (ok
                ? <span className="verdict ok"><Check aria-hidden="true" />Juste</span>
                : <span className="small" style={{ color: 'var(--ko-fg)' }}><X aria-hidden="true" /> Réponse : {p.right}</span>)}
            </div>
          </div>
        );
      })}
      {!checked ? (
        <div><button type="button" className="btn btn-secondary" disabled={!complete} onClick={() => { setChecked(true); onDone(); }}>Vérifier</button></div>
      ) : (
        <div className="feedback" aria-live="polite">
          <div className="feedback-title">{good} / {ex.pairs.length} associations justes</div>
          <p className="small">{ex.explanation}</p>
          <div><button type="button" className="btn-link" onClick={() => { setChecked(false); setAnswers({}); }}>Recommencer</button></div>
        </div>
      )}
    </div>
  );
}

function Ordering({ ex, onDone }: { ex: OrderingExercise; onDone: () => void }) {
  const [order, setOrder] = useState(() => {
    const s = seededShuffle(ex.items, hashString(ex.title));
    return s.every((v, i) => v === ex.items[i]) ? [...ex.items].reverse() : s;
  });
  const [checked, setChecked] = useState(false);
  const good = order.filter((v, i) => v === ex.items[i]).length;
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const n = [...order];
    [n[i], n[j]] = [n[j], n[i]];
    setOrder(n);
  };
  return (
    <div className="stack gap-s">
      <ol className="stack gap-xs">
        {order.map((item, i) => (
          <li key={item} className={`order-item${checked ? (item === ex.items[i] ? ' right' : ' wrong') : ''}`}>
            <span className="rule-num" style={{ flex: '0 0 1.5rem', fontSize: '1.25rem' }} aria-hidden="true">{i + 1}</span>
            <span style={{ flex: 1 }}>{item}</span>
            {!checked && (
              <span className="row" style={{ gap: '.25rem', flexWrap: 'nowrap' }}>
                <button type="button" className="btn-icon" disabled={i === 0} aria-label={`Monter : ${item}`} onClick={() => move(i, -1)}><ArrowUp aria-hidden="true" /></button>
                <button type="button" className="btn-icon" disabled={i === order.length - 1} aria-label={`Descendre : ${item}`} onClick={() => move(i, 1)}><ArrowDown aria-hidden="true" /></button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {!checked ? (
        <div><button type="button" className="btn btn-secondary" onClick={() => { setChecked(true); onDone(); }}>Vérifier l’ordre</button></div>
      ) : (
        <div className="feedback" aria-live="polite">
          <div className="feedback-title">{good} / {ex.items.length} étapes bien placées</div>
          {good < ex.items.length && (
            <ol className="small stack" style={{ gap: '.125rem' }}>{ex.items.map((it, i) => <li key={it}>{i + 1}. {it}</li>)}</ol>
          )}
          <p className="small">{ex.explanation}</p>
          <div><button type="button" className="btn-link" onClick={() => setChecked(false)}>Réessayer</button></div>
        </div>
      )}
    </div>
  );
}

function CaseStudy({ ex, onDone }: { ex: CaseStudyExercise; onDone: () => void }) {
  const [note, setNote] = useState('');
  const [shown, setShown] = useState(false);
  return (
    <div className="stack gap-s">
      <p className="context-text" style={{ fontSize: '1.25rem' }}>{ex.situation}</p>
      <ul className="stack gap-xs dash-list">{ex.questions.map((q, i) => <li key={i}><span aria-hidden="true">—</span><span>{q}</span></li>)}</ul>
      <label className="stack gap-xs">
        <span className="field-label">Votre analyse (facultative, non enregistrée)</span>
        <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      {!shown ? (
        <div><button type="button" className="btn btn-secondary" onClick={() => { setShown(true); onDone(); }}>Voir une analyse possible</button></div>
      ) : (
        <div className="feedback" aria-live="polite">
          <div className="feedback-title">Une analyse possible</div>
          <p className="small" style={{ whiteSpace: 'pre-line' }}>{ex.modelAnswer}</p>
        </div>
      )}
    </div>
  );
}

export function ExerciseBlock({ exercise, lessonId, lessonTitle }: { exercise: Exercise; lessonId: string; lessonTitle: string }) {
  const { markExerciseDone } = useUser();
  const onDone = () => markExerciseDone(lessonId, lessonTitle);
  return (
    <div className="card">
      <div className="eyebrow">{EXERCISE_LABEL[exercise.type]}</div>
      <h3 className="h3">{exercise.title}</h3>
      {exercise.type !== 'case' && <p className="small muted">{exercise.instructions}</p>}
      {exercise.type === 'matching' && <Matching ex={exercise} onDone={onDone} />}
      {exercise.type === 'ordering' && <Ordering ex={exercise} onDone={onDone} />}
      {exercise.type === 'case' && <CaseStudy ex={exercise} onDone={onDone} />}
    </div>
  );
}
