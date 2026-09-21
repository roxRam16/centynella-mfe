import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, ToastProvider } from '@/context';
import { ThemeProvider } from '@/theme';
import { AppRoutes } from '@/routes';
import { AppErrorBoundary } from '@/routes/AppErrorBoundary';

/** Raíz de la aplicación: tema global + notificaciones + enrutado + sesión del usuario. */
export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppErrorBoundary>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </AppErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
