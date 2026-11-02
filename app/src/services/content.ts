import type {
  CatalogLesson,
  Country,
  DictionaryEntry,
  Domain,
  FullLesson,
  Lesson,
  Level,
  PracticalSheet,
  Scenario
} from '../types/content';
import lessonMeta from 'virtual:lesson-meta';

// Métadonnées : chargées d'emblée. Corps des leçons : chargés à la demande.
const domainModules = import.meta.glob<Domain>('../content/domains/*.json', { eager: true, import: 'default' });
const lessonLoaders = import.meta.glob<Lesson>('../content/lessons/*/*.json', { import: 'default' });
const scenarioModules = import.meta.glob<Scenario[]>('../content/scenarios/*.json', { eager: true, import: 'default' });
const sheetModules = import.meta.glob<PracticalSheet[]>('../content/sheets/*.json', { eager: true, import: 'default' });
const dictionaryModules = import.meta.glob<DictionaryEntry[]>('../content/dictionary/*.json', { eager: true, import: 'default' });
const countryModules = import.meta.glob<Country>('../content/countries/*.json', { eager: true, import: 'default' });

const fileId = (path: string) => path.split('/').pop()!.replace('.json', '');

const loaderById = new Map(Object.entries(lessonLoaders).map(([p, l]) => [fileId(p), l]));

export const domains: Domain[] = Object.values(domainModules)
  .map((d) => ({
    ...d,
    lessons: d.lessons.map((l) => ({
      ...l,
      summary: lessonMeta[l.id]?.summary,
      estimatedDuration: lessonMeta[l.id]?.estimatedDuration,
      tags: lessonMeta[l.id]?.tags ?? []
    }))
  }))
  .sort((a, b) => a.order - b.order);

export const scenarios: Scenario[] = Object.values(scenarioModules).flat();
export const sheets: PracticalSheet[] = Object.values(sheetModules).flat();
export const dictionary: DictionaryEntry[] = Object.values(dictionaryModules)
  .flat()
  .sort((a, b) => a.term.localeCompare(b.term, 'fr'));
export const countries: Country[] = Object.values(countryModules).sort((a, b) => a.name.localeCompare(b.name, 'fr'));

const lessonIndex = new Map<string, { lesson: CatalogLesson; domain: Domain }>();
for (const domain of domains) for (const lesson of domain.lessons) lessonIndex.set(lesson.id, { lesson, domain });

export const getDomain = (id: string) => domains.find((d) => d.id === id || d.slug === id);
export const getLessonMeta = (id: string) => lessonIndex.get(id);
export const isLessonAvailable = (id: string) => loaderById.has(id);
export const getScenario = (id: string) => scenarios.find((s) => s.id === id);
export const getSheet = (id: string) => sheets.find((s) => s.id === id);
export const getEntry = (id: string) => dictionary.find((e) => e.id === id);
export const getCountry = (id: string) => countries.find((c) => c.id === id || c.slug === id);

export const availableLessons = (domainId?: string, level?: Level): CatalogLesson[] =>
  domains
    .filter((d) => !domainId || d.id === domainId)
    .flatMap((d) => d.lessons)
    .filter((l) => isLessonAvailable(l.id) && (!level || l.level === level));

export const availableLessonCount = () => availableLessons().length;

export async function loadLesson(id: string): Promise<FullLesson | null> {
  const meta = lessonIndex.get(id);
  const loader = loaderById.get(id);
  if (!meta || !loader) return null;
  const body = await loader();
  return { ...meta.lesson, ...body, domainId: meta.domain.id };
}

/** Leçons rédigées voisines, dans l'ordre pédagogique du domaine. */
export function neighbours(id: string): { prev?: CatalogLesson; next?: CatalogLesson; position: number; total: number } {
  const meta = lessonIndex.get(id);
  if (!meta) return { position: 0, total: 0 };
  const list = meta.domain.lessons.filter((l) => isLessonAvailable(l.id));
  const i = list.findIndex((l) => l.id === id);
  return { prev: list[i - 1], next: list[i + 1], position: i + 1, total: list.length };
}

export function lessonTitle(id: string): string {
  return lessonIndex.get(id)?.lesson.title ?? id;
}
