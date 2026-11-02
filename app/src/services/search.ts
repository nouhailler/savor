import type { ContentKind } from '../types/content';
import lessonSearch from 'virtual:lesson-search';
import { countries, dictionary, domains, isLessonAvailable, scenarios, sheets } from './content';
import { normalize, tokenize } from '../utils/text';

export interface SearchResult {
  kind: ContentKind;
  id: string;
  title: string;
  excerpt: string;
  meta: string;
  to: string;
  score: number;
}

interface IndexEntry {
  kind: ContentKind;
  id: string;
  title: string;
  normTitle: string;
  tags: string;
  body: string;
  excerpt: string;
  meta: string;
  to: string;
}

function entry(e: Omit<IndexEntry, 'normTitle' | 'tags' | 'body'> & { tags: string[]; body: string }): IndexEntry {
  return { ...e, normTitle: normalize(e.title), tags: normalize(e.tags.join(' ')), body: normalize(e.body) };
}

function buildIndex(): IndexEntry[] {
  const out: IndexEntry[] = [];
  for (const d of domains) {
    for (const l of d.lessons) {
      if (!isLessonAvailable(l.id)) continue;
      const rules = lessonSearch[l.id]?.rules ?? [];
      out.push(
        entry({
          kind: 'lesson',
          id: l.id,
          title: l.title,
          excerpt: l.summary ?? l.topics.join(', '),
          meta: `Leçon · ${d.shortTitle}`,
          to: `/lecons/${l.id}`,
          tags: [...(l.tags ?? []), ...l.topics],
          body: [l.summary ?? '', ...(lessonSearch[l.id]?.keyPoints ?? [])].join(' ')
        })
      );
      for (const r of rules) {
        out.push(
          entry({
            kind: 'rule',
            id: r.id,
            title: r.title,
            excerpt: r.description,
            meta: `Règle · ${l.title}`,
            to: `/lecons/${l.id}#${r.id}`,
            tags: [],
            body: `${r.description} ${r.context}`
          })
        );
      }
    }
  }
  for (const s of scenarios) {
    out.push(
      entry({
        kind: 'scenario',
        id: s.id,
        title: s.title,
        excerpt: s.description,
        meta: 'Situation pratique',
        to: `/situations/${s.id}`,
        tags: s.tags,
        body: `${s.description} ${s.context} ${s.rule}`
      })
    );
  }
  for (const s of sheets) {
    out.push(
      entry({
        kind: 'sheet',
        id: s.id,
        title: s.title,
        excerpt: s.situation,
        meta: 'Fiche pratique',
        to: `/guide/${s.id}`,
        tags: s.tags,
        body: `${s.situation} ${s.advice.join(' ')} ${s.example}`
      })
    );
  }
  for (const e of dictionary) {
    out.push(
      entry({
        kind: 'dictionary',
        id: e.id,
        title: e.term,
        excerpt: e.definition,
        meta: 'Dictionnaire',
        to: `/dictionnaire/${e.id}`,
        tags: e.related,
        body: `${e.definition} ${e.explanation}`
      })
    );
  }
  for (const c of countries) {
    out.push(
      entry({
        kind: 'country',
        id: c.id,
        title: c.name,
        excerpt: c.intro,
        meta: `Fiche pays · ${c.region}`,
        to: `/culture/${c.slug}`,
        tags: [c.region, ...c.languages],
        body: `${c.intro} ${c.sections.flatMap((s) => s.items).join(' ')}`
      })
    );
  }
  return out;
}

let index: IndexEntry[] | null = null;

export function search(query: string, kinds?: ContentKind[], limit = 60): SearchResult[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];
  index ??= buildIndex();
  const results: SearchResult[] = [];
  const phrase = normalize(query);
  for (const e of index) {
    if (kinds && !kinds.includes(e.kind)) continue;
    let score = 0;
    let matched = 0;
    for (const t of tokens) {
      let s = 0;
      if (e.normTitle.split(' ').includes(t)) s = 10;
      else if (e.normTitle.includes(t)) s = 7;
      else if (e.tags.includes(t)) s = 5;
      else if (e.body.includes(t)) s = 2;
      if (s) matched++;
      score += s;
    }
    if (matched < tokens.length) continue;
    if (e.normTitle.includes(phrase)) score += 12;
    if (e.kind === 'lesson' || e.kind === 'sheet') score += 1;
    results.push({ kind: e.kind, id: e.id, title: e.title, excerpt: e.excerpt, meta: e.meta, to: e.to, score });
  }
  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'fr')).slice(0, limit);
}
