import { describe, expect, it } from 'vitest';
import { search } from '../services/search';
import { normalize, tokenize } from '../utils/text';

describe('recherche globale', () => {
  it('ignore les accents et la casse', () => {
    expect(normalize('Élégance à l’Œil')).toBe('elegance a l oeil');
    expect(tokenize('Comment présenter ses condoléances ?')).toEqual(['presenter', 'condoleances']);
  });
  it('couvre leçons, règles, fiches, situations, définitions et pays', () => {
    const kinds = (q: string) => new Set(search(q).map((r) => r.kind));
    expect(kinds('condoleances').has('lesson')).toBe(true);
    expect(kinds('condoleances').has('sheet')).toBe(true);
    expect(kinds('condoleances').has('dictionary')).toBe(true);
    expect(kinds('japon').has('country')).toBe(true);
    expect(kinds('baguettes').has('rule')).toBe(true);
    expect(kinds('belle-mere plat').has('scenario') || kinds('plat').has('scenario')).toBe(true);
  });
  it('filtre par type et ne renvoie rien pour une requête vide', () => {
    expect(search('tutoiement', ['dictionary'])[0].title).toBe('Tutoiement');
    expect(search('   ')).toEqual([]);
  });
});
