import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { useUser } from '../../storage/UserContext';
import { domains } from '../../services/content';
import { domainProgress } from '../../services/daily';
import { Bar, DomainIcon, PageHead, usePageTitle } from '../../components/ui';

export default function DomainsPage() {
  usePageTitle('Apprendre');
  const { data } = useUser();
  return (
    <div className="stack gap-xl">
      <PageHead eyebrow="Apprendre" title="Les huit domaines" lead="Choisissez un domaine, puis un niveau. Vous pouvez aussi parcourir toute la bibliothèque, filtrer et rechercher." />
      <div className="row">
        <Link className="btn btn-secondary" to="/bibliotheque">Toute la bibliothèque<ArrowRight aria-hidden="true" /></Link>
        <Link className="btn btn-secondary" to="/evaluations">Évaluations</Link>
      </div>
      <div className="grid-wide">
        {domains.map((d) => {
          const p = domainProgress(data, d.id);
          return (
            <Link key={d.id} to={`/apprendre/${d.slug}`} className="card-link">
              <div className="row-between" style={{ width: '100%' }}>
                <span className="card-num">0{d.number}</span>
                <span style={{ color: 'var(--ink)' }}><DomainIcon name={d.icon} /></span>
              </div>
              <div className="card-title">{d.title}</div>
              <div className="small muted" style={{ flex: 1 }}>{d.description}</div>
              <Bar percent={p.percent} label={`Progression, ${d.shortTitle}`} />
              <div className="xsmall muted">{p.done} terminées sur {p.total} rédigées · {d.lessons.length} au catalogue</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
