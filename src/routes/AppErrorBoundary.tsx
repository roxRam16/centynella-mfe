import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { StatusPage } from '@/pages/StatusPage';

interface BoundaryProps {
  children: ReactNode;
  /** Cuando cambia (p. ej. la URL), el error se descarta y se intenta renderizar de nuevo. */
  resetKey: string;
}

interface BoundaryState {
  hasError: boolean;
}

/** Red de seguridad global: un error inesperado al renderizar muestra la pantalla 500 en vez de una página en blanco. */
class ErrorBoundaryImpl extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[app] Error inesperado al renderizar', error, info.componentStack);
  }

  componentDidUpdate(previous: BoundaryProps): void {
    if (this.state.hasError && previous.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false }); // navegó a otra página: se reintenta
    }
  }

  render() {
    if (this.state.hasError) {
      return <StatusPage code={500} fullPage onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}

/** Envuelve la app: captura errores de render de cualquier pantalla y los muestra amablemente. */
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundaryImpl resetKey={pathname}>{children}</ErrorBoundaryImpl>;
}
