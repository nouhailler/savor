import { Link } from 'react-router-dom';
import { Breadcrumb, PageHead, usePageTitle } from '../../components/ui';
import { availableLessonCount, countries, dictionary, domains, scenarios, sheets } from '../../services/content';
import { CONVENTION_HELP, CONVENTION_LABEL } from '../../utils/labels';
import type { ConventionType } from '../../types/content';

export default function AboutPage() {
  usePageTitle('À propos');
  return (
    <div className="stack gap-xl narrow">
      <Breadcrumb items={[{ label: 'Paramètres', to: '/parametres' }, { label: 'À propos' }]} />
      <PageHead eyebrow="À propos" title="Présentation et sources" lead="Une encyclopédie numérique du savoir-vivre contemporain, pensée pour les adultes, consultable sans compte et sans connexion." />
      <section className="stack gap-s">
        <h2 className="h2">Cette édition</h2>
        <p>{availableLessonCount()} leçons rédigées sur les {domains.reduce((n, d) => n + d.lessons.length, 0)} du catalogue de référence, {scenarios.length} situations, {sheets.length} fiches pratiques, {dictionary.length} définitions, {countries.length} fiches pays. Version {__APP_VERSION__}.</p>
      </section>
      <section className="stack gap-s">
        <h2 className="h2">Originalité des contenus</h2>
        <p>Le plan général s’inspire des grands thèmes traités par <em>Le bonheur de séduire – L’art de réussir, Savoir-vivre aujourd’hui</em> de Nadine de Rothschild (Fixot, 1991). Aucun texte, exemple ou illustration de cet ouvrage n’est reproduit : tous les contenus de l’application sont rédigés spécifiquement pour elle.</p>
        <p>Les usages de 1991 ne sont pas présentés comme des règles actuelles. L’approche est contemporaine, égalitaire et respectueuse : aucune tenue ni aucun comportement n’est assigné selon le sexe ou le statut social.</p>
      </section>
      <section className="stack gap-s">
        <h2 className="h2">Le statut des règles</h2>
        <p>Chaque règle affiche son statut, pour ne jamais confondre principe, convention et loi :</p>
        <ul className="stack gap-xs">
          {(Object.keys(CONVENTION_LABEL) as ConventionType[]).map((k) => <li key={k}><strong style={{ color: 'var(--ink)' }}>{CONVENTION_LABEL[k]}</strong> — {CONVENTION_HELP[k]}</li>)}
        </ul>
      </section>
      <section className="stack gap-s">
        <h2 className="h2">Sources</h2>
        <p>Chaque leçon et chaque fiche pays indique ses références : ouvrages de sociologie et d’histoire des mœurs, textes officiels, sources interculturelles. Ces références orientent le lecteur qui veut approfondir ; elles ne valent pas caution de chaque phrase.</p>
        <p>Les fiches pays ont fait l’objet d’une relecture éditoriale, datée sur chaque fiche ; elles n’ont pas été validées par des spécialistes de chaque pays. Signalez toute erreur à l’éditeur.</p>
      </section>
      <section className="stack gap-xs">
        <h2 className="h2">Composants techniques</h2>
        <p className="small">Polices Cormorant Garamond et Source Sans 3 (licence SIL OFL), intégrées localement. Icônes Phosphor (licence MIT). React, Vite, idb, Workbox (licences MIT).</p>
        <Link to="/mentions-legales">Mentions légales</Link>
      </section>
    </div>
  );
}
