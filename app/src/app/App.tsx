import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { UserProvider } from '../storage/UserContext';
import { ToastProvider } from '../components/ui';
import { Layout } from './Layout';

const HomePage = lazy(() => import('../features/home/HomePage'));
const IntroPage = lazy(() => import('../features/home/IntroPage'));
const DomainsPage = lazy(() => import('../features/learning/DomainsPage'));
const DomainPage = lazy(() => import('../features/learning/DomainPage'));
const LibraryPage = lazy(() => import('../features/learning/LibraryPage'));
const LessonPage = lazy(() => import('../features/learning/LessonPage'));
const QuizPage = lazy(() => import('../features/quizzes/QuizPage'));
const EvaluationsPage = lazy(() => import('../features/quizzes/EvaluationsPage'));
const EvaluationPage = lazy(() => import('../features/quizzes/EvaluationPage'));
const ScenariosPage = lazy(() => import('../features/scenarios/ScenariosPage'));
const ScenarioPage = lazy(() => import('../features/scenarios/ScenarioPage'));
const GuidePage = lazy(() => import('../features/guide/GuidePage'));
const SheetPage = lazy(() => import('../features/guide/SheetPage'));
const DictionaryPage = lazy(() => import('../features/dictionary/DictionaryPage'));
const EntryPage = lazy(() => import('../features/dictionary/EntryPage'));
const CountriesPage = lazy(() => import('../features/countries/CountriesPage'));
const CountryPage = lazy(() => import('../features/countries/CountryPage'));
const SearchPage = lazy(() => import('../features/search/SearchPage'));
const FavoritesPage = lazy(() => import('../features/favorites/FavoritesPage'));
const ProgressPage = lazy(() => import('../features/progress/ProgressPage'));
const ReviewPage = lazy(() => import('../features/progress/ReviewPage'));
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'));
const AboutPage = lazy(() => import('../features/settings/AboutPage'));
const LegalPage = lazy(() => import('../features/settings/LegalPage'));
const NotFoundPage = lazy(() => import('../features/home/NotFoundPage'));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="presentation" element={<IntroPage />} />
        <Route path="apprendre" element={<DomainsPage />} />
        <Route path="apprendre/:domainId" element={<DomainPage />} />
        <Route path="bibliotheque" element={<LibraryPage />} />
        <Route path="lecons/:lessonId" element={<LessonPage />} />
        <Route path="lecons/:lessonId/quiz" element={<QuizPage />} />
        <Route path="evaluations" element={<EvaluationsPage />} />
        <Route path="evaluations/:domainId/:kind" element={<EvaluationPage />} />
        <Route path="evaluations/:domainId/:kind/:level" element={<EvaluationPage />} />
        <Route path="situations" element={<ScenariosPage />} />
        <Route path="situations/:scenarioId" element={<ScenarioPage />} />
        <Route path="guide" element={<GuidePage />} />
        <Route path="guide/:sheetId" element={<SheetPage />} />
        <Route path="dictionnaire" element={<DictionaryPage />} />
        <Route path="dictionnaire/:entryId" element={<EntryPage />} />
        <Route path="culture" element={<CountriesPage />} />
        <Route path="culture/:slug" element={<CountryPage />} />
        <Route path="recherche" element={<SearchPage />} />
        <Route path="favoris" element={<FavoritesPage />} />
        <Route path="progression" element={<ProgressPage />} />
        <Route path="revisions" element={<ReviewPage />} />
        <Route path="parametres" element={<SettingsPage />} />
        <Route path="a-propos" element={<AboutPage />} />
        <Route path="mentions-legales" element={<LegalPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ToastProvider>
    </UserProvider>
  );
}
