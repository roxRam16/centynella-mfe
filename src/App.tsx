import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/theme';
import { AppRoutes } from '@/routes';

/** Raíz de la aplicación: tema global + enrutado. */
export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
