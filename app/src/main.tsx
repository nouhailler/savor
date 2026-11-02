import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-ext-500-italic.css';
import '@fontsource/source-sans-3/latin-400.css';
import '@fontsource/source-sans-3/latin-500.css';
import '@fontsource/source-sans-3/latin-600.css';
import './styles/tokens.css';
import './styles/app.css';
import './services/install';
import { App } from './app/App';
import { startUpdates } from './services/updates';

startUpdates();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
