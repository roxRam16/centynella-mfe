import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Tipografía de marca: Poppins (Regular · Medium · SemiBold · Bold), autoalojada (sin CDN externo).
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
