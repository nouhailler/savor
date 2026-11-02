import { Link } from 'react-router-dom';
import { SealCheck } from '@phosphor-icons/react';
import { useUser } from '../../storage/UserContext';
import { domains } from '../../services/content';
import { PageHead, usePageTitle } from '../../components/ui';
import { LEVELS } from '../../types/content';
import { LEVEL_LABEL, LEVEL_THRESHOLD } from '../../utils/labels';

export default function EvaluationsPage() {
  usePageTitle('Évaluations');
  const { data } = useUser();
  return (
    <div className="stack gap-xl">
      <PageHead
        eyebrow="Évaluations"
        title="Bilans de niveau"
        lead="L’évaluation initiale vous situe dans un domaine. L’évaluation finale valide un niveau : elle mêle questions et situations pratiques."
      />
      <p className="small muted narrow">
        Seuils de validation : {LEVELS.map((l) => `${LEVEL_LABEL[l]} ${LEVEL_THRESHOLD[l]} %`).join(' · ')}. Une validation est une attestation interne de progression, non un diplôme professionnel reconnu. Aucun contenu n’est verrouillé par ces évaluations.
      </p>
      <div className="grid-wide">
        {domains.map((d) => {
          const init = data.evaluations[`${d.id}:all:initial`];
          return (
            <section key={d.id} className="card" aria-label={d.shortTitle}>
              <span className="card-num">0{d.number}</span>
              <h2 className="card-title">{d.shortTitle}</h2>
              <Link className="btn-link" to={`/evaluations/${d.id}/initial`}>
                Évaluation initiale{init ? ` (${init.percent} %)` : ''}
              </Link>
              <ul className="stack gap-xs">
                {LEVELS.map((l) => {
                  const r = data.evaluations[`${d.id}:${l}:final`];
                  return (
                    <li key={l} className="row-between small">
                      <Link to={`/evaluations/${d.id}/final/${l}`}>Niveau {LEVEL_LABEL[l]}</Link>
                      {r && (r.passed
                        ? <span className="row st-done" style={{ gap: '.25rem', fontWeight: 600 }}><SealCheck size={16} aria-hidden="true" />Validé {r.percent} %</span>
                        : <span className="muted">{r.percent} %</span>)}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
