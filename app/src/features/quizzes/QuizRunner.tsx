import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowCounterClockwise, ArrowRight, Check, CheckCircle, Minus, XCircle } from '@phosphor-icons/react';
import { scoreAnswer, type RunnerQuestion } from './scoring';
import { hashString, seededShuffle } from '../../utils/text';
import { QUESTION_KIND_LABEL } from '../../utils/labels';

const LETTERS = 'ABCDEFGH';

export interface QuizOutcome {
  score: number;
  total: number;
  percent: number;
  answers: { questionId: string; correct: boolean; credit: number; question: RunnerQuestion }[];
}

interface Props {
  questions: RunnerQuestion[];
  onFinish: (outcome: QuizOutcome) => void;
  onRestart?: () => void;
  summary?: (outcome: QuizOutcome) => ReactNode;
  actions?: ReactNode;
}

export function QuizRunner({ questions, onFinish, onRestart, summary, actions }: Props) {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState<Record<number, number[]>>({});
  const [checked, setChecked] = useState(false);
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const seed = useRef(Date.now() % 100000);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Les propositions sont mélangées, sauf vrai/faux, pour que la place de la réponse n'enseigne rien.
  const orders = useMemo(
    () =>
      questions.map((q) => {
        const order = q.choices.map((_, i) => i);
        return q.type === 'truefalse' ? order : seededShuffle(order, seed.current + hashString(q.id));
      }),
    [questions]
  );

  if (outcome) {
    return (
      <section className="stack" style={{ gap: '2rem' }} aria-label="Résultats">
        <div className="row" style={{ alignItems: 'flex-end', gap: '1rem 2rem' }}>
          <div className="score-big">{Math.round(outcome.score * 10) / 10}<small> / {outcome.total}</small></div>
          <div className="stack gap-xs" style={{ flex: 1, minWidth: '15rem' }}>{summary?.(outcome)}</div>
        </div>
        <div className="stack">
          <h2 className="eyebrow" style={{ marginBottom: '.375rem' }}>Correction détaillée</h2>
          {outcome.answers.map((a, i) => {
            const picked = picks[i] ?? [];
            const q = a.question;
            const status = a.credit >= 1 ? 'ok' : a.credit > 0 ? 'mid' : 'ko';
            return (
              <article key={q.id} className="correction">
                <span className="rule-num" aria-hidden="true">{i + 1}</span>
                <div className="stack gap-s" style={{ flex: 1, minWidth: 0 }}>
                  <div className="row-between">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 }}>{q.statement}</h3>
                    <span className={`verdict ${status}`}>
                      {status === 'ok' ? <Check aria-hidden="true" /> : status === 'mid' ? <Minus aria-hidden="true" /> : <ArrowCounterClockwise aria-hidden="true" />}
                      {status === 'ok' ? 'Juste' : status === 'mid' ? 'Acceptable' : 'À revoir'}
                    </span>
                  </div>
                  <div className="stack small" style={{ gap: '.25rem' }}>
                    <div><span className="muted">Votre réponse : </span><span style={{ color: 'var(--ink)' }}>{picked.map((p) => q.choices[p]).join(' ; ') || '—'}</span></div>
                    {a.credit < 1 && <div><span className="muted">Bonne réponse : </span><span style={{ color: 'var(--ok-fg)', fontWeight: 600 }}>{q.correctAnswers.map((c) => q.choices[c]).join(' ; ')}</span></div>}
                  </div>
                  <p className="small" style={{ lineHeight: 1.6 }}>{q.explanation}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="row">
          {onRestart && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setOutcome(null); setIndex(0); setPicks({}); setChecked(false);
                seed.current = Date.now() % 100000;
                onRestart();
                window.scrollTo(0, 0);
              }}
            >
              <ArrowCounterClockwise aria-hidden="true" />Recommencer
            </button>
          )}
          {actions}
        </div>
      </section>
    );
  }

  const q = questions[index];
  const order = orders[index];
  const picked = picks[index] ?? [];
  const isMulti = q.type === 'multiple';
  const credit = checked ? scoreAnswer(q, picked) : 0;
  const isLast = index === questions.length - 1;

  const toggle = (choice: number) => {
    if (checked) return;
    setPicks((prev) => {
      const cur = prev[index] ?? [];
      if (!isMulti) return { ...prev, [index]: [choice] };
      return { ...prev, [index]: cur.includes(choice) ? cur.filter((c) => c !== choice) : [...cur, choice] };
    });
  };

  const next = () => {
    if (isLast) {
      const answers = questions.map((qq, i) => {
        const c = scoreAnswer(qq, picks[i] ?? []);
        return { questionId: qq.id, correct: c >= 1, credit: c, question: qq };
      });
      const score = answers.reduce((n, a) => n + a.credit, 0);
      const result = { score, total: questions.length, percent: Math.round((score / questions.length) * 100), answers };
      setOutcome(result);
      onFinish(result);
      window.scrollTo(0, 0);
    } else {
      setIndex(index + 1);
      setChecked(false);
      headingRef.current?.focus();
    }
  };

  const feedback = q.choiceFeedback && picked.length === 1 ? q.choiceFeedback[picked[0]] : null;

  return (
    <section className="stack gap-l">
      <div className="stack gap-xs">
        <div className="row-between small muted">
          <span>Question {index + 1} sur {questions.length}</span>
          {q.kind && <span>{QUESTION_KIND_LABEL[q.kind]}</span>}
        </div>
        <div className="steps" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={index + 1} aria-label="Avancement du quiz">
          {questions.map((_, i) => <div key={i} className={i < index || (i === index && checked) ? 'done' : i === index ? 'current' : ''} />)}
        </div>
      </div>
      <h1 ref={headingRef} tabIndex={-1} className="display" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.375rem)', lineHeight: 1.15, outline: 'none' }}>{q.statement}</h1>
      {isMulti && <p className="small muted">Plusieurs réponses sont possibles.</p>}
      <div role={isMulti ? 'group' : 'radiogroup'} aria-label="Réponses" className="stack gap-s">
        {order.map((c, pos) => {
          const sel = picked.includes(c);
          const right = q.correctAnswers.includes(c);
          const partial = !!q.choiceScores && q.choiceScores[c] > 0 && q.choiceScores[c] < 1;
          let cls = 'choice';
          let mark: ReactNode = null;
          if (sel) cls += ' selected';
          if (checked) {
            if (right) {
              cls += ' right';
              mark = <span className="choice-mark" style={{ color: 'var(--ok-fg)' }}><CheckCircle size={18} weight="fill" aria-hidden="true" />{sel ? 'Votre réponse · juste' : 'Bonne réponse'}</span>;
            } else if (partial && sel) {
              mark = <span className="choice-mark" style={{ color: 'var(--mid-fg)' }}><Minus size={18} aria-hidden="true" />Votre réponse · acceptable</span>;
            } else if (sel) {
              cls += ' wrong';
              mark = <span className="choice-mark" style={{ color: 'var(--ko-fg)' }}><XCircle size={18} weight="fill" aria-hidden="true" />Votre réponse</span>;
            } else cls += ' dim';
          }
          return (
            <button key={c} type="button" role={isMulti ? 'checkbox' : 'radio'} aria-checked={sel} disabled={checked} className={cls} onClick={() => toggle(c)}>
              <span className="choice-letter" aria-hidden="true">{LETTERS[pos]}</span>
              <span className="choice-body"><span>{q.choices[c]}</span>{mark}</span>
            </button>
          );
        })}
      </div>
      {checked && (
        <div className="feedback" aria-live="polite">
          <div className={`feedback-title ${credit >= 1 ? 'ok' : credit > 0 ? '' : 'ko'}`}>
            {credit >= 1 ? <CheckCircle size={20} weight="fill" aria-hidden="true" /> : credit > 0 ? <Minus size={20} aria-hidden="true" /> : <XCircle size={20} weight="fill" aria-hidden="true" />}
            {credit >= 1 ? 'Juste.' : credit > 0 ? 'Acceptable, mais on peut faire mieux.' : 'Pas tout à fait.'}
          </div>
          {feedback && <p className="small">{feedback}</p>}
          <p style={{ fontSize: '1rem', lineHeight: 1.6 }}>{q.explanation}</p>
        </div>
      )}
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        {!checked ? (
          <button type="button" className="btn btn-primary" disabled={picked.length === 0} onClick={() => setChecked(true)}>Valider ma réponse</button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={next}>{isLast ? 'Voir la correction' : 'Question suivante'}<ArrowRight aria-hidden="true" /></button>
        )}
      </div>
    </section>
  );
}
