import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, GitBranch } from '@phosphor-icons/react';
import { useUser } from '../../storage/UserContext';
import { domains, getDomain, scenarios } from '../../services/content';
import { Empty, LevelBadge, PageHead, usePageTitle } from '../../components/ui';
import { LEVELS, type Level } from '../../types/content';
import { LEVEL_LABEL } from '../../utils/labels';
import { plural } from '../../utils/text';

export default function ScenariosPage() {
  usePageTitle('Situations pratiques');
  const [params] = useSearchParams();
  const { data } = useUser();
  const [domain, setDomain] = useState(params.get('domaine') ?? 'all');
  const [level, setLevel] = useState<Level | 'all'>('all');
  const rows = useMemo(
    () => scenarios.filter((s) => (domain === 'all' || s.domainId === domain) && (level === 'all' || s.level === level)),
    [domain, level]
  );
  return (
    <div className="stack gap-xl">
      <PageHead eyebrow="Situations pratiques" title="Que feriez-vous ?" sage lead="Des situations réalistes, où l’on choisit puis où l’on comprend. Certaines se ramifient : votre décision change la suite." />
      <div className="grid-3">
        <label className="stack gap-xs"><span className="field-label">Domaine</span>
          <select className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>
            <option value="all">Tous les domaines</option>
            {domains.map((d) => <option key={d.id} value={d.id}>{d.shortTitle}</option>)}
          </select>
        </label>
        <label className="stack gap-xs"><span className="field-label">Niveau</span>
          <select className="input" value={level} onChange={(e) => setLevel(e.target.value as Level | 'all')}>
            <option value="all">Tous les niveaux</option>
            {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
          </select>
        </label>
      </div>
      <p className="small muted" role="status">{plural(rows.length, 'situation')}</p>
      {rows.length === 0 && <Empty title="Aucune situation pour ce filtre." />}
      <div className="grid-wide">
        {rows.map((s) => {
          const r = data.scenarios[s.id];
          return (
            <Link key={s.id} to={`/situations/${s.id}`} className="card-link">
              <div className="row-between" style={{ width: '100%' }}><LevelBadge level={s.level} /><span className="xsmall muted">{getDomain(s.domainId)?.shortTitle}</span></div>
              <div className="card-title">{s.title}</div>
              <div className="small muted" style={{ flex: 1 }}>{s.description}</div>
              <div className="row xsmall muted" style={{ gap: '.75rem' }}>
                <span className="row" style={{ gap: '.25rem' }}><Clock aria-hidden="true" />{s.estimatedDuration} min</span>
                {s.steps.length > 1 && <span className="row" style={{ gap: '.25rem' }}><GitBranch aria-hidden="true" />{s.steps.length} étapes</span>}
                {r && <span className="row st-done" style={{ gap: '.25rem', fontWeight: 600 }}><CheckCircle aria-hidden="true" />{r.bestPercent} %</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
