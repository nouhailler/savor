import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  /** Change de valeur à chaque navigation : l'erreur d'une page ne bloque pas les suivantes. */
  resetKey: string;
  children: ReactNode;
}

interface State {
  failedKey: string | null;
}

// Filet de sécurité de la section 10.6 : un écran qui échoue, ou un morceau de code absent du cache
// hors ligne, laisse la navigation disponible et n'affecte pas les données enregistrées.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failedKey: null };

  static getDerivedStateFromError(): Partial<State> {
    return { failedKey: '' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur d’affichage', error, info.componentStack);
    this.setState({ failedKey: this.props.resetKey });
  }

  componentDidUpdate(prev: Props) {
    if (prev.resetKey !== this.props.resetKey && this.state.failedKey !== null) this.setState({ failedKey: null });
  }

  render() {
    if (this.state.failedKey === null) return this.props.children;
    return (
      <div className="stack gap-s" role="alert">
        <h1 className="display">Cette page n’a pas pu s’afficher</h1>
        <p>Votre progression n’est pas affectée. Vérifiez votre connexion si vous ouvrez cette page pour la première fois, puis réessayez.</p>
        <div><button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Recharger</button></div>
      </div>
    );
  }
}
