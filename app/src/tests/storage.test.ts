import { beforeEach, describe, expect, it } from 'vitest';
import { clearAllData, closeDb, loadUserData, sanitizeUserData, saveUserData } from '../storage/db';
import { emptyUserData } from '../types/user';

describe('persistance locale', () => {
  beforeEach(async () => {
    await clearAllData();
  });
  it('conserve les données entre deux ouvertures', async () => {
    const d = emptyUserData();
    d.favorites.push({ id: 'lesson:l-4-1-2', targetType: 'lesson', targetId: 'l-4-1-2', createdAt: 'x' });
    await saveUserData(d);
    await closeDb();
    const r = await loadUserData();
    expect(r.data.favorites).toHaveLength(1);
    expect(r.recovered).toBe(false);
  });
  it('écarte un document corrompu sans planter', async () => {
    await saveUserData({ schemaVersion: 99 } as never);
    const r = await loadUserData();
    expect(r.recovered).toBe(true);
    expect(r.data.schemaVersion).toBe(1);
  });
  it('répare les champs manquants et refuse un fichier invalide', () => {
    expect(sanitizeUserData({ schemaVersion: 1, lessons: 'x', settings: { theme: 'dark' } })?.settings.theme).toBe('dark');
    expect(sanitizeUserData({ schemaVersion: 1, lessons: 'x' })?.lessons).toEqual({});
    expect(sanitizeUserData('nope')).toBeNull();
  });
});
