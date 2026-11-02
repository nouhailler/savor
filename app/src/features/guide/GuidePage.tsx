import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookBookmark, MagnifyingGlass } from '@phosphor-icons/react';
import { domains, getDomain, sheets } from '../../services/content';
import { Empty, PageHead, usePageTitle } from '../../components/ui';
import { normalize, plural } from '../../utils/text';

export default function GuidePage() {
  usePageTitle('Guide du savoir-vivre');
  const [query, setQuery] = useState('');
  const [domain, setDomain] = useState('all');
  const rows = useMemo(() => {
    const q = normalize(query);
    return sheets
      .filter((s) => domain === 'all' || s.domainId === domain)
      .filter((s) => !q || normalize(`${s.title} ${s.situation} ${s.tags.join(' ')}`).includes(q))
      .sort((a, b) => a.title.localeCompare(b.title, 'fr'));
  }, [query, domain]);
  return (
    <div className="stack gap-xl">
      <PageHead eyebrow="Guide du savoir-vivre" title="Une réponse, tout de suite." lead="Les fiches pratiques répondent à une question précise, sans parcours à suivre. Elles restent consultables quel que soit votre niveau." />
      <Link className="banner-link" to="/dictionnaire">
        <BookBookmark size={28} style={{ color: 'var(--gold-deep)', flex: 'none' }} aria-hidden="true" />
        <span className="stack" style={{ flex: 1, gap: '.125rem' }}>
          <span className="eyebrow">Les mots</span>
          <span className="banner-title">Le dictionnaire du savoir-vivre</span>
        </span>
        <ArrowRight size={20} aria-hidden="true" />
      </Link>
      <div className="grid-3">
        <label className="stack gap-xs"><span className="field-label">Chercher une fiche</span>
          <span className="search-box"><MagnifyingGlass aria-hidden="true" /><input className="input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Condoléances, invitation…" /></span>
        </label>
        <label className="stack gap-xs"><span className="field-label">Domaine</span>
          <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="all">Tous les domaines</option>
            {domains.map((d) => <option key={d.id} value={d.id}>{d.shortTitle}</option>)}
          </select>
        </label>
      </div>
      <p className="small muted" role="status">{plural(rows.length, 'fiche')}</p>
      {rows.length === 0 && <Empty title="Aucune fiche ne correspond." />}
      <div className="grid-wide">
        {rows.map((s) => (
          <Link key={s.id} to={`/guide/${s.id}`} className="card-link">
            <span className="xsmall muted">{getDomain(s.domainId)?.shortTitle}</span>
            <span className="card-title">{s.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
