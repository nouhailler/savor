import { describe, expect, it } from 'vitest';
import { sample, scenarioToQuestion, scoreAnswer, type RunnerQuestion } from '../features/quizzes/scoring';
import { recommendLevel } from '../features/quizzes/EvaluationPage';
import { scenarios } from '../services/content';

const single: RunnerQuestion = { id: 'x-q1', type: 'single', statement: 's', choices: ['a', 'b'], correctAnswers: [1], explanation: 'e', difficulty: 1 };
const multi: RunnerQuestion = { ...single, type: 'multiple', choices: ['a', 'b', 'c'], correctAnswers: [0, 2] };

describe('correction', () => {
  it('note un choix simple', () => {
    expect(scoreAnswer(single, [1])).toBe(1);
    expect(scoreAnswer(single, [0])).toBe(0);
    expect(scoreAnswer(single, [])).toBe(0);
  });
  it('exige la réponse exacte pour un choix multiple', () => {
    expect(scoreAnswer(multi, [2, 0])).toBe(1);
    expect(scoreAnswer(multi, [0])).toBe(0);
    expect(scoreAnswer(multi, [0, 1, 2])).toBe(0);
  });
  it('accorde un crédit partiel aux situations', () => {
    const q = scenarioToQuestion(scenarios[0]);
    const partial = q.choiceScores!.findIndex((s) => s === 0.5);
    expect(q.kind).toBe('situation');
    expect(q.correctAnswers.length).toBeGreaterThan(0);
    if (partial >= 0) expect(scoreAnswer(q, [partial])).toBe(0.5);
  });
  it('tire sans répétition', () => {
    const r = sample([1, 2, 3, 4, 5], 3);
    expect(new Set(r).size).toBe(3);
  });
  it('conseille le premier niveau sous son seuil', () => {
    expect(recommendLevel({ beginner: 50, intermediate: 90, advanced: 90 })).toBe('beginner');
    expect(recommendLevel({ beginner: 70, intermediate: 60, advanced: 90 })).toBe('intermediate');
    expect(recommendLevel({ beginner: 100, intermediate: 100, advanced: 100 })).toBe('advanced');
  });
});
