import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { countries, getDomain } from '../../services/content';
import { Empty, PageHead, usePageTitle } from '../../components/ui';
import { normalize } from '../../utils/text';

export default function CountriesPage() {
  usePageTitle('Culture et usages');
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('all');
  const regions = useMemo(() => [...new Set(countries.map((c) => c.region))].sort((a, b) => a.localeCompare(b, 'fr')), []);
  const rows = countries.filter(
    (c) => (region === 'all' || c.region === region) && (!query || normalize(`${c.name} ${c.languages.join(' ')}`).includes(normalize(query)))
  );
  const domain = getDomain('etranger');
  return (
    <div className="stack gap-xl">
      <PageHead eyebrow="Culture et usages" title="L’encyclopédie des usages" lead="Des fiches pour comprendre, non pour caricaturer : un usage décrit une tendance, jamais tous les habitants d’un pays." />
      {domain && (
        <Link className="banner-link" to={`/apprendre/${domain.slug}`}>
          <span className="stack" style={{ flex: 1, gap: '.125rem' }}>
            <span className="eyebrow">Domaine 08</span>
            <span className="banner-title">Les leçons du savoir-vivre à l’étranger</span>
          </span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      )}
      <div className="grid-3">
        <label className="stack gap-xs"><span className="field-label">Chercher un pays</span>
          <input className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="stack gap-xs"><span className="field-label">Région</span>
          <select className="input" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="all">Toutes les régions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
      </div>
      {rows.length === 0 && <Empty title="Aucun pays ne correspond." />}
      <div className="grid-wide">
        {rows.map((c) => (
          <Link key={c.id} to={`/culture/${c.slug}`} className="card-link">
            <span className="eyebrow">{c.region}</span>
            <span className="card-title" style={{ fontSize: '1.875rem' }}>{c.name}</span>
            <span className="small muted" style={{ flex: 1 }}>{c.intro}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
