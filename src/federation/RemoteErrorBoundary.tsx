import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert } from '@/components';

interface RemoteErrorBoundaryProps {
  /** Nombre legible del microfrontend, para el mensaje de error. */
  name: string;
  children: ReactNode;
}

interface RemoteErrorBoundaryState {
  hasError: boolean;
}

/**
 * Aísla fallos de un microfrontend: si un remote no carga (caído, versión rota),
 * el shell y el resto de remotes siguen funcionando. Es el corazón de la
 * resiliencia en una arquitectura de microfrontends.
 */
export class RemoteErrorBoundary extends Component<
  RemoteErrorBoundaryProps,
  RemoteErrorBoundaryState
> {
  state: RemoteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RemoteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[federation] Falló el microfrontend "${this.props.name}"`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="error" title={`No se pudo cargar "${this.props.name}"`}>
          El módulo no está disponible en este momento. Intenta de nuevo más tarde.
        </Alert>
      );
    }
    return this.props.children;
  }
}
