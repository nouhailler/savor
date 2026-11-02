import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { dictionary } from '../../services/content';
import { Breadcrumb, Empty, PageHead, usePageTitle } from '../../components/ui';
import { normalize, plural } from '../../utils/text';

const letterOf = (term: string) => normalize(term).charAt(0).toUpperCase();

export default function DictionaryPage() {
  usePageTitle('Dictionnaire');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const q = normalize(query);
    return q ? dictionary.filter((e) => normalize(`${e.term} ${e.definition}`).includes(q)) : dictionary;
  }, [query]);
  const letters = useMemo(() => [...new Set(rows.map((e) => letterOf(e.term)))], [rows]);
  const jump = (letter: string) => document.getElementById(`lettre-${letter}`)?.scrollIntoView();
  return (
    <div className="stack gap-xl narrow">
      <Breadcrumb items={[{ label: 'Guide', to: '/guide' }, { label: 'Dictionnaire' }]} />
      <PageHead eyebrow="Dictionnaire" title="Les mots du savoir-vivre" lead="Des définitions originales, leur contexte et un exemple, pour nommer juste ce que l’on observe." />
      <label className="stack gap-xs"><span className="field-label">Chercher un terme</span>
        <input className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tact, préséance…" />
      </label>
      <nav aria-label="Index alphabétique" className="alpha-nav">
        {letters.map((l) => <button key={l} type="button" className="btn-link" style={{ minWidth: '2.25rem', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '1.125rem' }} onClick={() => jump(l)}>{l}</button>)}
      </nav>
      <p className="small muted" role="status">{plural(rows.length, 'entrée')}</p>
      {rows.length === 0 && <Empty title="Aucun terme ne correspond." />}
      {letters.map((letter) => (
        <section key={letter} id={`lettre-${letter}`} className="scroll-anchor">
          <h2 className="h2" style={{ color: 'var(--gold-deep)' }}>{letter}</h2>
          <ul>
            {rows.filter((e) => letterOf(e.term) === letter).map((e) => (
              <li key={e.id}>
                <Link to={`/dictionnaire/${e.id}`} className="result-item">
                  <span className="result-title">{e.term}</span>
                  <span className="small">{e.definition}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
