import { describe, expect, it } from 'vitest';
import type { Country, DictionaryEntry, Domain, Exercise, Lesson, PracticalSheet, Scenario } from '../types/content';
import { LEVELS } from '../types/content';
import { CONVENTION_LABEL, NORMATIVITY_LABEL } from '../utils/labels';

// Contrôle éditorial mécanique : cahier des charges, sections 8, 9, 14.2, 17 et annexe B.
type FileLesson = Lesson & { summary: string; estimatedDuration: number; tags: string[] };

const domains = Object.values(import.meta.glob<Domain>('../content/domains/*.json', { eager: true, import: 'default' }));
const lessonFiles = import.meta.glob<FileLesson>('../content/lessons/*/*.json', { eager: true, import: 'default' });
const scenarios = Object.values(import.meta.glob<Scenario[]>('../content/scenarios/*.json', { eager: true, import: 'default' })).flat();
const sheets = Object.values(import.meta.glob<PracticalSheet[]>('../content/sheets/*.json', { eager: true, import: 'default' })).flat();
const dictionary = Object.values(import.meta.glob<DictionaryEntry[]>('../content/dictionary/*.json', { eager: true, import: 'default' })).flat();
const countries = Object.values(import.meta.glob<Country>('../content/countries/*.json', { eager: true, import: 'default' }));

const lessons = Object.entries(lessonFiles).map(([path, l]) => ({ path, slug: path.split('/').at(-2)!, file: path.split('/').pop()!.replace('.json', ''), l }));
const catalog = new Map(domains.flatMap((d) => d.lessons.map((l) => [l.id, { d, l }] as const)));
const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

function lessonWords(l: FileLesson): number {
  const parts = [
    l.introduction, l.why, ...l.objectives, ...l.keyPoints, ...l.contexts,
    ...l.sections.map((s) => s.content),
    ...l.rules.flatMap((r) => [r.description, r.rationale, r.context, r.recommendedBehavior, r.remedy, ...r.exceptions]),
    ...l.examples.flatMap((e) => [e.context, e.behavior, e.explanation]),
    ...l.mistakes.flatMap((m) => [m.situation, m.behavior, m.consequences, m.alternative]),
    ...l.nuances.map((n) => n.text)
  ];
  return parts.reduce((n, s) => n + wordCount(s), 0);
}

function checkExercise(e: Exercise) {
  if (e.type === 'matching') {
    expect(e.pairs.length).toBeGreaterThanOrEqual(3);
    expect(new Set(e.pairs.map((p) => p.right)).size).toBe(e.pairs.length);
    expect(e.explanation.length).toBeGreaterThan(30);
  } else if (e.type === 'ordering') {
    expect(e.items.length).toBeGreaterThanOrEqual(3);
    expect(new Set(e.items).size).toBe(e.items.length);
    expect(e.explanation.length).toBeGreaterThan(30);
  } else {
    expect(e.questions.length).toBeGreaterThanOrEqual(1);
    expect(e.modelAnswer.length).toBeGreaterThan(100);
  }
}

describe('catalogue', () => {
  it('comporte huit domaines et trois niveaux par domaine', () => {
    expect(domains).toHaveLength(8);
    for (const d of domains) {
      expect(d.levels.map((l) => l.level)).toEqual(LEVELS);
      for (const lv of LEVELS) expect(d.lessons.filter((l) => l.level === lv).length).toBeGreaterThan(0);
    }
  });
  it('a des identifiants uniques', () => {
    const ids = domains.flatMap((d) => d.lessons.map((l) => l.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe.each(lessons)('leçon $file', ({ slug, file, l }) => {
  it('existe au catalogue, au bon endroit', () => {
    const entry = catalog.get(file);
    expect(entry, `${file} absent du catalogue`).toBeDefined();
    expect(entry!.d.slug).toBe(slug);
    expect(l.id).toBe(file);
  });
  it('respecte la structure pédagogique (annexe B)', () => {
    expect(l.summary.length).toBeGreaterThan(40);
    expect(l.objectives.length).toBeGreaterThanOrEqual(3);
    expect(wordCount(l.introduction)).toBeGreaterThanOrEqual(40);
    expect(l.sections.length).toBeGreaterThanOrEqual(3);
    for (const s of l.sections) expect(wordCount(s.content), s.title).toBeGreaterThanOrEqual(60);
    expect(l.rules.length).toBeGreaterThanOrEqual(4);
    expect(wordCount(l.why)).toBeGreaterThanOrEqual(50);
    expect(l.examples.length).toBeGreaterThanOrEqual(3);
    expect(l.mistakes.length).toBeGreaterThanOrEqual(3);
    expect(l.nuances.length).toBeGreaterThanOrEqual(2);
    expect(l.contexts.length).toBeGreaterThanOrEqual(3);
    expect(l.keyPoints.length).toBeGreaterThanOrEqual(3);
    expect(l.references.length).toBeGreaterThanOrEqual(1);
    expect(l.revisions.length).toBeGreaterThanOrEqual(1);
    checkExercise(l.exercise);
  });
  it('est réellement approfondie', () => {
    const words = lessonWords(l);
    expect(words, 'trop courte').toBeGreaterThanOrEqual(900);
    expect(l.estimatedDuration).toBeGreaterThanOrEqual(Math.floor(words / 400));
    expect(l.estimatedDuration).toBeLessThanOrEqual(Math.ceil(words / 100));
  });
  it('a des règles complètes et classées (9.2, 9.3)', () => {
    l.rules.forEach((r, i) => {
      expect(r.id).toBe(`${l.id}-r${i + 1}`);
      for (const k of ['title', 'description', 'rationale', 'context', 'recommendedBehavior', 'remedy'] as const) expect(r[k].length, `${r.id}.${k}`).toBeGreaterThan(10);
      expect(Array.isArray(r.exceptions)).toBe(true);
      expect(CONVENTION_LABEL[r.conventionType], r.id).toBeDefined();
      expect(NORMATIVITY_LABEL[r.normativity], r.id).toBeDefined();
    });
  });
  it('a un quiz valide, expliqué', () => {
    expect(l.quiz.questions.length).toBeGreaterThanOrEqual(5);
    expect(l.quiz.passingScore).toBeGreaterThanOrEqual(50);
    l.quiz.questions.forEach((q, i) => {
      expect(q.id).toBe(`${l.id}-q${i + 1}`);
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(new Set(q.choices).size).toBe(q.choices.length);
      expect(q.correctAnswers.length).toBeGreaterThanOrEqual(1);
      for (const a of q.correctAnswers) expect(a).toBeLessThan(q.choices.length);
      if (q.type === 'truefalse') expect(q.choices).toEqual(['Vrai', 'Faux']);
      if (q.type === 'single' || q.type === 'truefalse') expect(q.correctAnswers.length).toBe(1);
      expect(q.explanation.length, q.id).toBeGreaterThan(50);
    });
  });
  it('a un quiz qui ne se devine pas à sa forme (guide éditorial)', () => {
    for (const q of l.quiz.questions) {
      if (q.type === 'truefalse') continue;
      // La correction ne peut pas désigner une proposition par sa place : l’interface les mélange.
      expect(q.explanation, `${q.id} : renvoi à la place d’une proposition`).not.toMatch(/\b[Ll]a (première|deuxième|troisième|quatrième|dernière)( formule| phrase| réponse| proposition)?\s+(?!place|personne)/);
      if (q.type !== 'single') continue;
      const right = q.choices[q.correctAnswers[0]].length;
      const longest = Math.max(...q.choices.filter((_, i) => i !== q.correctAnswers[0]).map((c) => c.length));
      expect(right, `${q.id} : la bonne réponse se repère à sa longueur`).toBeLessThanOrEqual(longest * 1.3);
    }
  });
});

describe('contenus sans répétition artificielle', () => {
  it('aucun paragraphe de leçon ni règle n’est réutilisé', () => {
    const seen = new Map<string, string>();
    for (const { file, l } of lessons) {
      const texts = [l.introduction, l.why, ...l.sections.flatMap((s) => s.content.split(/\n\s*\n/)), ...l.rules.map((r) => r.description)];
      for (const t of texts) {
        const k = t.trim();
        if (k.length < 60) continue;
        expect(seen.has(k), `doublon ${file} / ${seen.get(k)} : ${k.slice(0, 60)}`).toBe(false);
        seen.set(k, file);
      }
    }
  });
  it('les énoncés de questions sont uniques', () => {
    const all = lessons.flatMap(({ l }) => l.quiz.questions.map((q) => q.statement));
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('références croisées', () => {
  const known = new Set(catalog.keys());
  it('scénarios', () => {
    const ids = new Set<string>();
    for (const s of scenarios) {
      expect(ids.has(s.id), s.id).toBe(false);
      ids.add(s.id);
      expect(domains.some((d) => d.id === s.domainId), s.id).toBe(true);
      for (const id of s.relatedLessonIds) expect(known.has(id), `${s.id} → ${id}`).toBe(true);
      const stepIds = new Set(s.steps.map((st) => st.id));
      const reached = new Set([s.steps[0].id]);
      for (const st of s.steps) {
        expect(st.choices.length, st.id).toBeGreaterThanOrEqual(3);
        expect(st.choices.some((c) => c.score === 1), `${st.id} sans réponse recommandée`).toBe(true);
        for (const c of st.choices) {
          expect(c.feedback.length, c.id).toBeGreaterThan(40);
          if (c.nextStepId) {
            expect(stepIds.has(c.nextStepId), `${c.id} → ${c.nextStepId}`).toBe(true);
            reached.add(c.nextStepId);
          }
        }
      }
      expect(reached.size, `${s.id} : étape inatteignable`).toBe(s.steps.length);
    }
  });
  it('fiches pratiques', () => {
    const ids = new Set(sheets.map((s) => s.id));
    expect(ids.size).toBe(sheets.length);
    for (const s of sheets) {
      expect(s.advice.length, s.id).toBeGreaterThanOrEqual(3);
      expect(s.mistakes.length, s.id).toBeGreaterThanOrEqual(2);
      expect(s.reasons.length, s.id).toBeGreaterThan(50);
      expect(s.example.length, s.id).toBeGreaterThan(15);
      for (const id of s.relatedLessonIds) expect(known.has(id), `${s.id} → ${id}`).toBe(true);
    }
  });
  it('dictionnaire', () => {
    const ids = new Set(dictionary.map((e) => e.id));
    expect(ids.size).toBe(dictionary.length);
    for (const e of dictionary) {
      for (const k of ['definition', 'explanation', 'context', 'example'] as const) expect(e[k].length, `${e.id}.${k}`).toBeGreaterThan(15);
      for (const id of e.lessonIds) expect(known.has(id), `${e.id} → ${id}`).toBe(true);
    }
  });
  it('fiches pays complètes (8.4)', () => {
    const required = ['greetings', 'punctuality', 'invitations', 'table', 'gifts', 'dress', 'verbal', 'nonverbal', 'sensitive', 'professional', 'mistakes', 'tips'];
    for (const c of countries) {
      expect(c.sections.map((s) => s.key).sort(), c.id).toEqual([...required].sort());
      for (const s of c.sections) expect(s.items.length, `${c.id}.${s.key}`).toBeGreaterThanOrEqual(2);
      expect(c.languages.length).toBeGreaterThan(0);
      expect(c.sources.length, c.id).toBeGreaterThanOrEqual(2);
      expect(c.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(c.generalizationNote.length).toBeGreaterThan(40);
    }
  });
});

describe('modération éditoriale (9.5)', () => {
  it('n’assigne pas les rôles de réception selon le sexe', () => {
    const blob = JSON.stringify([lessons.map((x) => x.l), scenarios, sheets, dictionary, countries]).toLowerCase();
    expect(blob).not.toContain('maîtresse de maison');
    expect(blob).not.toContain('maître de maison');
  });
});

describe('contenu minimal de la première édition (section 17)', () => {
  const available = lessons.map(({ file }) => catalog.get(file)!).filter(Boolean);
  it('atteint les seuils', () => {
    const questions = lessons.reduce((n, { l }) => n + l.quiz.questions.length, 0);
    expect(available.length).toBeGreaterThanOrEqual(72);
    expect(sheets.length).toBeGreaterThanOrEqual(40);
    expect(scenarios.length).toBeGreaterThanOrEqual(32);
    expect(questions).toBeGreaterThanOrEqual(240);
    expect(dictionary.length).toBeGreaterThanOrEqual(60);
    expect(countries.length).toBeGreaterThanOrEqual(12);
  });
  it('couvre chaque niveau de chaque domaine (3 leçons minimum)', () => {
    for (const d of domains) for (const lv of LEVELS) {
      const n = available.filter((a) => a.d.id === d.id && a.l.level === lv).length;
      expect(n, `${d.id}/${lv}`).toBeGreaterThanOrEqual(3);
    }
  });
});
