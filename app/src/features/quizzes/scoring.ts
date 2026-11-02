import type { Question, Scenario } from '../../types/content';

/** Question telle que la pose le moteur : crédit partiel possible pour les situations. */
export interface RunnerQuestion extends Question {
  /** Crédit de chaque choix (0, 0,5 ou 1) : situations pratiques d'une évaluation. */
  choiceScores?: number[];
  choiceFeedback?: string[];
  scenarioId?: string;
}

export function scoreAnswer(q: RunnerQuestion, picked: number[]): number {
  if (q.choiceScores) return picked.length === 1 ? (q.choiceScores[picked[0]] ?? 0) : 0;
  if (q.type === 'multiple') {
    const set = new Set(q.correctAnswers);
    return picked.length === set.size && picked.every((p) => set.has(p)) ? 1 : 0;
  }
  return picked.length === 1 && q.correctAnswers.includes(picked[0]) ? 1 : 0;
}

/** Première décision d'un scénario, posée comme une question à crédit partiel. */
export function scenarioToQuestion(s: Scenario): RunnerQuestion {
  const step = s.steps[0];
  const scores = step.choices.map((c) => c.score);
  return {
    id: `${s.id}-eval`,
    type: 'single',
    kind: 'situation',
    statement: `${step.narrative} ${step.question}`,
    choices: step.choices.map((c) => c.label),
    correctAnswers: scores.flatMap((v, i) => (v === 1 ? [i] : [])),
    explanation: s.rule,
    difficulty: 2,
    choiceScores: scores,
    choiceFeedback: step.choices.map((c) => `${c.feedbackTitle} ${c.feedback}`),
    scenarioId: s.id
  };
}

export function sample<T>(items: T[], n: number, random: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
