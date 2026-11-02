import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/App';
import { ToastProvider } from '../components/ui';
import { UserProvider } from '../storage/UserContext';
import { clearAllData } from '../storage/db';
import { ErrorBoundary } from '../components/ErrorBoundary';

vi.mock('virtual:pwa-register', () => ({ registerSW: () => () => undefined }));

function renderAt(path: string) {
  return render(
    <UserProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <AppRoutes />
        </MemoryRouter>
      </ToastProvider>
    </UserProvider>
  );
}

describe('parcours', () => {
  it('affiche l’avertissement au premier lancement, puis l’accueil', async () => {
    await clearAllData();
    const user = userEvent.setup();
    renderAt('/');
    await user.click(await screen.findByRole('button', { name: 'Passer la présentation' }, { timeout: 8000 }));
    const btn = screen.getByRole('button', { name: 'J’ai compris' });
    expect(btn).toBeDisabled();
    await user.click(screen.getByRole('checkbox'));
    await user.click(btn);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(await screen.findByText('Les huit domaines', {}, { timeout: 8000 })).toBeInTheDocument();
  });
  it('déroule un quiz jusqu’à la correction', async () => {
    const user = userEvent.setup();
    renderAt('/lecons/l-4-1-2/quiz');
    for (let i = 0; i < 5; i++) {
      const group = await screen.findByRole('button', { name: 'Valider ma réponse' }, { timeout: 8000 });
      const choice = screen.getAllByRole(i === 4 ? 'checkbox' : 'radio')[0];
      await user.click(choice);
      await user.click(group);
      await user.click(screen.getByRole('button', { name: /Question suivante|Voir la correction/ }));
    }
    expect(await screen.findByText('Correction détaillée')).toBeInTheDocument();
  });
  it('joue une situation et explique le choix', async () => {
    const user = userEvent.setup();
    renderAt('/situations/s-2-2');
    await screen.findByText('Le plat de la belle-mère', {}, { timeout: 8000 });
    await user.click(screen.getByRole('radio', { name: /Vous goûtez/ }));
    expect(await screen.findByText('Vous honorez le geste sans vous trahir.')).toBeInTheDocument();
    expect(screen.getByText('La règle en jeu')).toBeInTheDocument();
  });
  it('signale une page introuvable', async () => {
    renderAt('/lecons/inexistante');
    expect(await screen.findByText('Cette page n’existe pas ou plus.', {}, { timeout: 8000 })).toBeInTheDocument();
  });
});

describe('écran en erreur', () => {
  const Boom = () => { throw new Error('boom'); };
  it('affiche un message, puis se rétablit à la navigation suivante', async () => {
    const silence = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { rerender } = render(<ErrorBoundary resetKey="/a"><Boom /></ErrorBoundary>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Votre progression n’est pas affectée');
    rerender(<ErrorBoundary resetKey="/b"><p>Page suivante</p></ErrorBoundary>);
    expect(await screen.findByText('Page suivante')).toBeInTheDocument();
    silence.mockRestore();
  });
});
