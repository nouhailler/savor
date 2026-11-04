import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../storage/UserContext';
import { PageHead, usePageTitle } from '../../components/ui';
import { LEVEL_LABEL, LEVEL_SUBTITLE } from '../../utils/labels';
import { LEVELS } from '../../types/content';
import { availableLessonCount, countries, dictionary, domains, scenarios, sheets } from '../../services/content';

export default function IntroPage() {
  usePageTitle('Présentation');
  const { setIntroSeen, ready } = useUser();
  useEffect(() => { if (ready) setIntroSeen(); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="stack gap-2xl narrow">
      <PageHead eyebrow="Présentation" title="Un ouvrage, pas un manuel de maintien." lead="L’Art du Savoir-Vivre s’adresse aux adultes qui veulent comprendre les usages autant que les connaître : d’où vient une règle, à quoi elle sert, quand l’appliquer et quand s’en écarter." />
      <section className="pull">
        <h2 className="h2">Le principe directeur</h2>
        <p className="rule-quote">L’élégance véritable ne consiste pas à respecter mécaniquement des conventions, mais à manifester naturellement du respect, de la considération, de la mesure et de l’intelligence dans ses relations avec les autres.</p>
      </section>
      <section className="stack gap-m">
        <h2 className="h2">Trois dimensions</h2>
        <div className="grid-3">
          <div className="card"><div className="card-title">La connaissance</div><p className="small">Les règles, leur origine, leur raison d’être.</p></div>
          <div className="card"><div className="card-title">La pratique</div><p className="small">Des situations réalistes, où l’on choisit et où l’on comprend les conséquences de son choix.</p></div>
          <div className="card"><div className="card-title">Le discernement</div><p className="small">Une règle n’est pas une obligation absolue : on apprend à l’adapter aux personnes et aux circonstances.</p></div>
        </div>
      </section>
      <section className="stack gap-m">
        <h2 className="h2">Trois niveaux</h2>
        <ul className="stack gap-s">
          {LEVELS.map((l) => <li key={l}><strong style={{ color: 'var(--ink)' }}>{LEVEL_LABEL[l]}</strong> — {LEVEL_SUBTITLE[l]}.</li>)}
        </ul>
        <p>Rien n’est verrouillé : un niveau validé est un repère, jamais une condition pour lire.</p>
      </section>
      <section className="stack gap-m">
        <h2 className="h2">Ce que contient cette édition</h2>
        <p>{domains.length} domaines, {availableLessonCount()} leçons rédigées, {scenarios.length} situations pratiques, {sheets.length} fiches, {dictionary.length} définitions et {countries.length} fiches pays. {availableLessonCount() < domains.reduce((n, d) => n + d.lessons.length, 0) && <> Le catalogue de référence compte {domains.reduce((n, d) => n + d.lessons.length, 0)} leçons : celles qui ne sont pas encore rédigées sont signalées « en préparation ».</>}</p>
        <p>Chaque règle indique son statut — principe intemporel, usage contemporain, convention traditionnelle, usage historique, pratique culturelle, ou usage variable — et son degré de normativité. Une convention n’est jamais présentée comme une obligation légale.</p>
      </section>
      <div className="row">
        <Link className="btn btn-primary" to="/apprendre">Parcourir les domaines</Link>
        <Link className="btn btn-secondary" to="/evaluations">Faire une évaluation initiale</Link>
      </div>
    </div>
  );
}
