import { useParams } from 'react-router-dom';
import { BookOpen, Briefcase, ChatText, Clock, CoatHanger, EnvelopeOpen, ForkKnife, Gift, HandWaving, Lightbulb, Warning, WarningCircle, type Icon } from '@phosphor-icons/react';
import type { CountrySectionKey } from '../../types/content';
import { getCountry } from '../../services/content';
import { Breadcrumb, DashList, FavButton, usePageTitle } from '../../components/ui';
import { formatLongDate } from '../../utils/date';
import NotFoundPage from '../home/NotFoundPage';

const SECTION: Record<CountrySectionKey, [string, Icon]> = {
  greetings: ['Salutations', HandWaving],
  punctuality: ['Ponctualité', Clock],
  invitations: ['Invitations', EnvelopeOpen],
  table: ['À table', ForkKnife],
  gifts: ['Cadeaux', Gift],
  dress: ['Tenues et conventions', CoatHanger],
  verbal: ['Communication verbale', ChatText],
  nonverbal: ['Communication non verbale', BookOpen],
  sensitive: ['Sujets sensibles', WarningCircle],
  professional: ['Usages professionnels', Briefcase],
  mistakes: ['Erreurs fréquentes', Warning],
  tips: ['Conseils pratiques', Lightbulb]
};

export default function CountryPage() {
  const { slug = '' } = useParams();
  const c = getCountry(slug);
  usePageTitle(c?.name ?? 'Fiche pays');
  if (!c) return <NotFoundPage />;
  return (
    <div className="stack gap-2xl">
      <Breadcrumb items={[{ label: 'Culture et usages', to: '/culture' }, { label: c.name }]} />
      <header className="grid-2" style={{ alignItems: 'end', paddingBottom: '2rem', borderBottom: '1px solid var(--rule)' }}>
        <div className="stack gap-s">
          <div className="eyebrow">Culture et usages · {c.region}</div>
          <h1 className="display" style={{ fontSize: 'clamp(3rem, 7vw, 5.25rem)', lineHeight: .95 }}>{c.name}</h1>
          <p className="lead">{c.intro}</p>
          <p className="small muted">Langues principales : {c.languages.join(', ')}</p>
          <div><FavButton type="country" id={c.id} title={c.name} withLabel /></div>
        </div>
        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem 1.5rem' }}>
          {c.highlights.map((h) => (
            <div key={h.label}>
              <dt className="eyebrow muted" style={{ letterSpacing: '.08em' }}>{h.label}</dt>
              <dd style={{ margin: '2px 0 0', color: 'var(--ink)', fontWeight: 600 }}>{h.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="nuance card-cream" style={{ flexDirection: 'row' }}>
        <WarningCircle size={22} aria-hidden="true" />
        <p><strong style={{ color: 'var(--ink)' }}>Limites de cette fiche.</strong> {c.generalizationNote}</p>
      </div>

      <div className="grid-wide">
        {c.sections.map((s) => {
          const [title, I] = SECTION[s.key];
          return (
            <section key={s.key} className="card">
              <div className="row" style={{ gap: '.625rem', flexWrap: 'nowrap' }}>
                <I size={22} style={{ color: 'var(--gold-deep)', flex: 'none' }} aria-hidden="true" />
                <h2 className="card-title" style={{ fontSize: '1.5625rem' }}>{title}</h2>
              </div>
              <DashList items={s.items} />
            </section>
          );
        })}
      </div>

      {c.phrases.length > 0 && (
        <section className="stack gap-m narrow">
          <h2 className="h2">Phrases utiles</h2>
          <div className="stack">
            {c.phrases.map((p) => (
              <div key={p.original} className="stack" style={{ padding: '.875rem 0', borderTop: '1px solid var(--rule)', gap: '.125rem' }}>
                <span lang="und" style={{ fontFamily: 'var(--serif)', fontSize: '1.4375rem', fontStyle: 'italic', color: 'var(--ink)' }}>{p.original}</span>
                <span className="small muted">{p.meaning}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="stack gap-s narrow">
        <h2 className="h2">Sources documentaires</h2>
        <ul className="ref-list">
          {c.sources.map((r, i) => (
            <li key={i}>{r.author && <>{r.author}, </>}<em>{r.title}</em>{r.publisher && <>, {r.publisher}</>}{r.year && <>, {r.year}</>}.{r.note && <span className="muted"> {r.note}</span>}</li>
          ))}
        </ul>
        <p className="xsmall muted">Dernière relecture éditoriale : {formatLongDate(c.lastVerifiedAt)}. Usages à vérifier sur place et auprès de sources officielles avant toute circonstance importante.</p>
      </section>
    </div>
  );
}
