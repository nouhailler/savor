import { describe, expect, it } from 'vitest';
import { lessonIdOfQuestion, mastery, nextStat, selectFailed, selectForReview, selectWeakest } from '../utils/spaced';

describe('répétition espacée', () => {
  it('fait monter de boîte en cas de bonne réponse et espace l’échéance', () => {
    const a = nextStat(undefined, 'q', true, '2026-11-02');
    expect(a.box).toBe(2);
    expect(a.due).toBe('2026-11-05');
    const b = nextStat(a, 'q', true, '2026-11-05');
    expect(b.box).toBe(3);
    expect(b.due).toBe('2026-11-12');
  });
  it('ramène en boîte 1 et au lendemain après une erreur', () => {
    const a = nextStat({ questionId: 'q', box: 4, due: '2026-12-01', correct: 3, wrong: 0, lastSeen: '2026-11-01', lastCorrect: true }, 'q', false, '2026-11-02');
    expect(a.box).toBe(1);
    expect(a.due).toBe('2026-11-03');
    expect(mastery(a)).toBe(0.75);
  });
  it('ne dépasse pas la boîte 5', () => {
    let s = nextStat(undefined, 'q', true, '2026-01-01');
    for (let i = 0; i < 10; i++) s = nextStat(s, 'q', true, '2026-01-01');
    expect(s.box).toBe(5);
  });
  it('sélectionne les questions dues, échouées et faibles', () => {
    const stats = [
      nextStat(undefined, 'a', false, '2026-11-01'),
      nextStat(undefined, 'b', true, '2026-11-01'),
      nextStat(nextStat(undefined, 'c', true, '2026-10-01'), 'c', false, '2026-11-01')
    ];
    expect(selectForReview(stats, '2026-11-02', 10).map((s) => s.questionId).sort()).toEqual(['a', 'c']);
    expect(selectFailed(stats, 10).map((s) => s.questionId).sort()).toEqual(['a', 'c']);
    expect(selectWeakest(stats, 10)[0].questionId).toBe('a');
  });
  it('retrouve la leçon d’une question', () => {
    expect(lessonIdOfQuestion('l-4-1-2-q3')).toBe('l-4-1-2');
  });
});
