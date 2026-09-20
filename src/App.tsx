import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context';
import { ThemeProvider } from '@/theme';
import { AppRoutes } from '@/routes';

/** Raíz de la aplicación: tema global + enrutado + sesión del usuario. */
export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
