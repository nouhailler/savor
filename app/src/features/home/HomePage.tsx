import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Books, Clock, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useUser } from '../../storage/UserContext';
import { domains, getLessonMeta, isLessonAvailable } from '../../services/content';
import { currentLevel, dailyScenario, domainProgress, globalProgress, recommendedLesson } from '../../services/daily';
import { Bar, DomainIcon, LevelBadge, usePageTitle } from '../../components/ui';
import { dayKey, formatRelative, formatToday, greeting } from '../../utils/date';
import { LEVEL_LABEL } from '../../utils/labels';
import { LEVELS } from '../../types/content';
import { plural } from '../../utils/text';

export default function HomePage() {
  usePageTitle('');
  const { data, ready } = useUser();
  const name = data.settings.displayName.trim();
  const global = globalProgress(data);
  const level = currentLevel(data);
  const lastId = data.lastLessonId;
  const last = lastId && isLessonAvailable(lastId) ? getLessonMeta(lastId) : undefined;
  const lastProgress = lastId ? data.lessons[lastId] : undefined;
  const reco = recommendedLesson(data);
  const recoMeta = reco ? getLessonMeta(reco.id) : undefined;
  const challenge = data.settings.dailyChallengeEnabled ? dailyScenario() : undefined;
  const today = data.challenges[dayKey()];
  const recent = data.attempts.slice(0, 3);
  const isNew = ready && !last && global.done === 0;

  return (
    <div className="stack gap-2xl">
      <header className="stack gap-xs">
        <div className="eyebrow">{formatToday()}</div>
        <h1 className="display">{greeting()}{name ? `, ${name}` : ''}.</h1>
        <p className="muted" style={{ maxWidth: '32.5rem' }}>« La politesse est à l’esprit ce que la grâce est au visage. » — Voltaire</p>
      </header>

      <div className="grid-2">
        {last ? (
          <article className="card card-lg card-raised">
            <div className="row-between">
              <div className="eyebrow">Reprendre là où vous étiez</div>
              <LevelBadge level={last.lesson.level} />
            </div>
            <div className="stack gap-xs">
              <div className="small muted">{last.domain.shortTitle}</div>
              <h2 className="h2-sm" style={{ fontWeight: 600 }}>{last.lesson.title}</h2>
            </div>
            <div className="stack gap-xs">
              <Bar percent={lastProgress?.readPercent ?? 0} label="Part de la leçon lue" />
              <div className="xsmall muted">
                {lastProgress?.status === 'completed' ? 'Leçon terminée' : `${lastProgress?.readPercent ?? 0} % lu`}
                {last.lesson.estimatedDuration ? ` · ${last.lesson.estimatedDuration} min de lecture` : ''}
              </div>
            </div>
            <div><Link className="btn btn-primary" to={`/lecons/${last.lesson.id}`}>Reprendre la leçon<ArrowRight aria-hidden="true" /></Link></div>
          </article>
        ) : (
          <article className="card card-lg card-raised">
            <div className="eyebrow">Pour commencer</div>
            <h2 className="h2-sm" style={{ fontWeight: 600 }}>Un ouvrage à parcourir à votre rythme</h2>
            <p>Huit domaines, trois niveaux, aucun ordre imposé. Commencez par la présentation de l’ouvrage, ou mesurez d’abord où vous en êtes.</p>
            <div className="row">
              <Link className="btn btn-primary" to="/presentation">Découvrir l’ouvrage<ArrowRight aria-hidden="true" /></Link>
              <Link className="btn btn-secondary" to="/evaluations">Me situer</Link>
            </div>
          </article>
        )}
        {challenge ? (
          <article className="card-cream">
            <div className="row-between">
              <div className="eyebrow sage">Défi du jour</div>
              <span className="small row" style={{ gap: '.375rem' }}><Clock aria-hidden="true" />{challenge.estimatedDuration} min</span>
            </div>
            <h2 className="h2-sm" style={{ fontWeight: 600 }}>{challenge.title}</h2>
            <p>{challenge.description}</p>
            <div style={{ marginTop: 'auto' }}>
              <Link className="btn btn-secondary" to={`/situations/${challenge.id}?defi=1`}>
                {today ? `Relevé (${today.percent} %) — revoir` : 'Relever le défi'}
              </Link>
            </div>
          </article>
        ) : (
          <article className="card-cream">
            <div className="eyebrow sage">Le guide</div>
            <h2 className="h2-sm" style={{ fontWeight: 600 }}>Une réponse rapide</h2>
            <p>Les fiches pratiques répondent à une question précise sans suivre un parcours.</p>
            <div><Link className="btn btn-secondary" to="/guide">Ouvrir le guide</Link></div>
          </article>
        )}
      </div>

      <section className="grid-2" style={{ alignItems: 'start' }} aria-label="Votre parcours">
        <div className="stack gap-s">
          <div className="eyebrow">Votre parcours</div>
          <div className="big-number">{global.percent} %</div>
          <p>
            {plural(global.done, 'leçon terminée', 'leçons terminées')} sur {global.total}.{' '}
            {isNew ? 'Aucun ordre imposé : on lit ici comme dans un bon livre.' : `Niveau de travail actuel : ${LEVEL_LABEL[level]}.`}
          </p>
          <Link className="btn-link" to="/progression">Voir ma progression détaillée</Link>
        </div>
        <div className="stack gap-m">
          {LEVELS.map((lv) => {
            const p = domains.reduce(
              (acc, d) => { const x = domainProgress(data, d.id, lv); return { done: acc.done + x.done, total: acc.total + x.total }; },
              { done: 0, total: 0 }
            );
            return (
              <div key={lv} className="stack gap-xs">
                <div className="row-between"><span style={{ color: 'var(--ink)', fontWeight: 600 }}>{LEVEL_LABEL[lv]}</span><span className="small">{p.done} / {p.total}</span></div>
                <Bar percent={p.total ? (p.done / p.total) * 100 : 0} label={`Niveau ${LEVEL_LABEL[lv]}`} />
              </div>
            );
          })}
        </div>
      </section>

      {(recoMeta || recent.length > 0) && (
        <section className="grid-2" style={{ alignItems: 'start' }}>
          {recoMeta && reco && (
            <Link className="banner-link" to={`/lecons/${reco.id}`}>
              <BookOpen size={28} style={{ color: 'var(--gold-deep)', flex: 'none' }} aria-hidden="true" />
              <span className="stack" style={{ flex: 1, gap: '.125rem' }}>
                <span className="eyebrow">Leçon recommandée</span>
                <span className="banner-title">{reco.title}</span>
                <span className="small muted">{recoMeta.domain.shortTitle} · {LEVEL_LABEL[reco.level]}</span>
              </span>
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          )}
          <div className="stack gap-s">
            <div className="row-between">
              <div className="eyebrow">Derniers résultats</div>
              <Link className="small" to="/revisions">Réviser</Link>
            </div>
            {recent.length === 0 && <p className="muted small">Vos résultats de quiz apparaîtront ici.</p>}
            {recent.map((a) => (
              <div key={a.id} className="row-between small" style={{ borderTop: '1px solid var(--rule-soft)', paddingTop: '.5rem' }}>
                <span style={{ color: 'var(--ink)' }}>
                  {a.sourceType === 'lesson' ? (getLessonMeta(a.source)?.lesson.title ?? 'Quiz') : a.sourceType === 'review' ? 'Quiz de révision' : 'Évaluation'}
                </span>
                <span className="muted">{a.percent} % · {formatRelative(a.date)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="stack gap-l">
        <div className="row-between">
          <h2 className="h2">Les huit domaines</h2>
          <span className="small muted">Chacun en trois niveaux : Débutant, Intermédiaire, Avancé</span>
        </div>
        <div className="grid-cards">
          {domains.map((d) => {
            const p = domainProgress(data, d.id);
            return (
              <Link key={d.id} to={`/apprendre/${d.slug}`} className="card-link">
                <div className="row-between" style={{ width: '100%' }}>
                  <span className="card-num">0{d.number}</span>
                  <span style={{ color: 'var(--ink)' }}><DomainIcon name={d.icon} /></span>
                </div>
                <div className="card-title">{d.shortTitle}</div>
                <div className="small muted" style={{ flex: 1, lineHeight: 1.45 }}>{d.description}</div>
                <div className="stack gap-xs" style={{ marginTop: '.25rem' }}>
                  <Bar percent={p.percent} label={`Progression, ${d.shortTitle}`} />
                  <div className="row-between xsmall muted"><span>{p.done} / {p.total} leçons</span><span style={{ fontWeight: 600 }}>{p.percent} %</span></div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid-2">
        <Link className="banner-link" to="/guide">
          <Books size={28} style={{ color: 'var(--sage-deep)', flex: 'none' }} aria-hidden="true" />
          <span className="stack" style={{ flex: 1, gap: '.125rem' }}>
            <span className="eyebrow sage">Accès rapide</span>
            <span className="banner-title">Guide pratique et dictionnaire</span>
          </span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
        <Link className="banner-link" to="/revisions">
          <ArrowCounterClockwise size={28} style={{ color: 'var(--gold-deep)', flex: 'none' }} aria-hidden="true" />
          <span className="stack" style={{ flex: 1, gap: '.125rem' }}>
            <span className="eyebrow">Consolider</span>
            <span className="banner-title">Révisions personnalisées</span>
          </span>
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
