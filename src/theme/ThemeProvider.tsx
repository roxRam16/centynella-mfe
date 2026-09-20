import type { ReactNode } from 'react';
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { theme } from './theme';

interface ThemeProviderProps {
  children: ReactNode;
}

/** Aplica el tema de CENTYNELLA y el reset de estilos a toda la app. */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
