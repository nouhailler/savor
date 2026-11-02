import { LegalContent } from '../../app/LegalNotice';
import { Breadcrumb, PageHead, usePageTitle } from '../../components/ui';

export default function LegalPage() {
  usePageTitle('Mentions légales');
  return (
    <div className="stack gap-xl narrower">
      <Breadcrumb items={[{ label: 'Paramètres', to: '/parametres' }, { label: 'Mentions légales' }]} />
      <PageHead title="Mentions légales" />
      <LegalContent />
    </div>
  );
}
