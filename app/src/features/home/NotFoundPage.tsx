import { Link } from 'react-router-dom';
import { Empty, usePageTitle } from '../../components/ui';

export default function NotFoundPage() {
  usePageTitle('Page introuvable');
  return (
    <Empty title="Cette page n’existe pas ou plus.">
      <p>Le lien est peut-être ancien. La recherche ou l’accueil vous remettront sur la voie.</p>
      <div className="row">
        <Link className="btn btn-primary" to="/">Revenir à l’accueil</Link>
        <Link className="btn btn-secondary" to="/recherche">Rechercher</Link>
      </div>
    </Empty>
  );
}
