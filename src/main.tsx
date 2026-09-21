import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Tipografía: Poppins (Regular · Medium · SemiBold · Bold), autoalojada (sin CDN externo).
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
// Títulos y botones: Raleway (se combina con Poppins para el texto).
import '@fontsource/raleway/600.css';
import '@fontsource/raleway/700.css';
import '@fontsource/raleway/800.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
