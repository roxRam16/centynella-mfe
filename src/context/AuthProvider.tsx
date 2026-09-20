import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { registerSessionRefresher } from '@/services/apiClient';
import * as authService from '@/services/authService';
import { publishAuthEvent, subscribeAuthEvents } from '@/services/authChannel';
import { tokenStore } from '@/services/tokenStore';
import type { Profile, TokenResponse } from '@/services/types';
import { AuthContext } from './AuthContext';
import type { AuthContextValue, AuthStatus } from './AuthContext';

/** Renovar el access token con este margen antes de que venza. */
const REFRESH_MARGIN_MS = 60_000;
const MIN_REFRESH_DELAY_MS = 5_000;

interface AuthState {
  status: AuthStatus;
  user: Profile | null;
  /** Momento (epoch ms) en que vence el access token. */
  expiresAt: number | null;
}

const LOADING: AuthState = { status: 'loading', user: null, expiresAt: null };
const ANONYMOUS: AuthState = { status: 'anonymous', user: null, expiresAt: null };

/**
 * Dueño de la sesión del usuario en el shell.
 *
 *  · Al abrir/recargar la app restaura la sesión con la cookie del refresh token (persistencia).
 *  · Renueva el access token antes de que venza y ante un 401 (ver `apiClient`).
 *  · Sincroniza el cierre de sesión entre pestañas.
 *
 * Los remotes obtienen todo esto por `useAuth()` compartiendo este contexto (singleton de React).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(LOADING);

  const applySession = useCallback((session: TokenResponse) => {
    tokenStore.set(session.access_token);
    setState({
      status: 'authenticated',
      user: session.user,
      expiresAt: Date.now() + session.expires_in * 1000,
    });
  }, []);

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setState(ANONYMOUS);
  }, []);

  /** Pide un access token nuevo. `false` si ya no hay sesión (queda como anónimo). */
  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const session = await authService.refreshSession();
      if (session) {
        applySession(session);
        return true;
      }
    } catch {
      // Sin red o servidor caído: se trata como sesión no disponible.
    }
    clearSession();
    return false;
  }, [applySession, clearSession]);

  // 1) Restaurar la sesión al abrir la app.
  useEffect(() => {
    let cancelled = false;
    void authService
      .refreshSession()
      .then((session) => {
        if (cancelled) return;
        if (session) applySession(session);
        else clearSession();
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  // 2) Que el cliente HTTP pueda renovar la sesión ante un 401.
  useEffect(() => {
    registerSessionRefresher(refresh);
    return () => registerSessionRefresher(null);
  }, [refresh]);

  // 3) Renovación proactiva antes de que venza el access token.
  useEffect(() => {
    if (state.status !== 'authenticated' || state.expiresAt === null) return;
    const delay = Math.max(state.expiresAt - Date.now() - REFRESH_MARGIN_MS, MIN_REFRESH_DELAY_MS);
    const timer = setTimeout(() => void refresh(), delay);
    return () => clearTimeout(timer);
  }, [state.status, state.expiresAt, refresh]);

  // 4) Sincronía entre pestañas.
  useEffect(
    () =>
      subscribeAuthEvents((event) => {
        if (event === 'logout') clearSession();
        else void refresh();
      }),
    [clearSession, refresh],
  );

  const login = useCallback<AuthContextValue['login']>(
    async (input) => {
      const session = await authService.login(input);
      applySession(session);
      publishAuthEvent('login');
      return session.user;
    },
    [applySession],
  );

  const logout = useCallback<AuthContextValue['logout']>(async () => {
    try {
      await authService.logout();
    } catch {
      // Aun si falla la red, la sesión local se cierra.
    } finally {
      clearSession();
      publishAuthEvent('logout');
    }
  }, [clearSession]);

  const updateUser = useCallback((user: Profile) => {
    setState((current) => (current.status === 'authenticated' ? { ...current, user } : current));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status: state.status,
      user: state.user,
      isAuthenticated: state.status === 'authenticated',
      login,
      logout,
      setSession: applySession,
      updateUser,
      hasPermission: (permission) => state.user?.permissions.includes(permission) ?? false,
    }),
    [state.status, state.user, login, logout, applySession, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
