import {
  ArrowsClockwise, BookBookmark, BookmarkSimple, BookOpen, Books, ChartLineUp, Compass, Exam, GearSix, GlobeHemisphereWest, HouseLine, Info,
  MagnifyingGlass, Notebook, Scales, SlidersHorizontal, UsersThree, type Icon
} from '@phosphor-icons/react';

export interface MenuItem {
  to: string;
  label: string;
  icon: Icon;
  end?: boolean;
}

/** Toute la navigation de l'application, regroupée par usage. */
export const MENU: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Découvrir',
    items: [
      { to: '/', label: 'Accueil', icon: HouseLine, end: true },
      { to: '/presentation', label: 'Présentation de l’ouvrage', icon: Compass },
      { to: '/recherche', label: 'Rechercher', icon: MagnifyingGlass }
    ]
  },
  {
    title: 'Apprendre',
    items: [
      { to: '/apprendre', label: 'Les huit domaines', icon: BookOpen },
      { to: '/bibliotheque', label: 'Toutes les leçons', icon: Books },
      { to: '/evaluations', label: 'Évaluations', icon: Exam }
    ]
  },
  {
    title: 'S’exercer',
    items: [
      { to: '/situations', label: 'Situations pratiques', icon: UsersThree },
      { to: '/revisions', label: 'Révisions', icon: ArrowsClockwise }
    ]
  },
  {
    title: 'Consulter',
    items: [
      { to: '/guide', label: 'Guide pratique', icon: Notebook },
      { to: '/dictionnaire', label: 'Dictionnaire', icon: BookBookmark },
      { to: '/culture', label: 'Culture et usages', icon: GlobeHemisphereWest }
    ]
  },
  {
    title: 'Mon parcours',
    items: [
      { to: '/progression', label: 'Ma progression', icon: ChartLineUp },
      { to: '/favoris', label: 'Favoris', icon: BookmarkSimple }
    ]
  },
  {
    title: 'Application',
    items: [
      { to: '/parametres', label: 'Paramètres', icon: GearSix },
      { to: '/systeme', label: 'Paramètres système', icon: SlidersHorizontal },
      { to: '/a-propos', label: 'À propos et sources', icon: Info },
      { to: '/mentions-legales', label: 'Mentions légales', icon: Scales }
    ]
  }
];

export const SHORTCUTS: MenuItem[] = [
  { to: '/', label: 'Accueil', icon: HouseLine, end: true },
  { to: '/apprendre', label: 'Apprendre', icon: BookOpen },
  { to: '/situations', label: 'Situations', icon: UsersThree },
  { to: '/culture', label: 'Culture', icon: GlobeHemisphereWest },
  { to: '/progression', label: 'Parcours', icon: ChartLineUp }
];
