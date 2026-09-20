import { NavLink, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { config } from '@/config/env';
import { remoteRegistry } from '@/federation';

/**
 * Estructura base del shell con HTML semántico:
 * <header> · <nav> · <main> · <footer>, más un enlace "saltar al contenido"
 * para navegación por teclado y lectores de pantalla.
 */
export function ShellLayout() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Box
        component="a"
        href="#contenido-principal"
        sx={{
          position: 'absolute',
          left: -9999,
          '&:focus': { left: 8, top: 8, zIndex: 'tooltip', bgcolor: 'background.paper', p: 1 },
        }}
      >
        Saltar al contenido
      </Box>

      <AppBar component="header" position="static" color="primary">
        <Toolbar sx={{ flexWrap: 'wrap', gap: 2 }}>
          <Typography component="span" variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
            {config.appName}
          </Typography>

          <nav aria-label="Principal">
            <Box component="ul" sx={{ display: 'flex', gap: 2, listStyle: 'none', m: 0, p: 0 }}>
              <li>
                <NavItem to="/" label="Inicio" />
              </li>
              {remoteRegistry.map((remote) => (
                <li key={remote.id}>
                  <NavItem to={remote.path} label={remote.label} />
                </li>
              ))}
            </Box>
          </nav>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        id="contenido-principal"
        sx={{ flexGrow: 1, py: { xs: 3, md: 5 } }}
      >
        <Outlet />
      </Container>

      <Box component="footer" sx={{ py: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          {config.appName} · ambiente {config.appEnv}
        </Typography>
      </Box>
    </Box>
  );
}

interface NavItemProps {
  to: string;
  label: string;
}

/** Enlace de navegación; marca la página actual con `aria-current` (lo aplica NavLink). */
function NavItem({ to, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      style={({ isActive }) => ({
        color: 'inherit',
        fontWeight: isActive ? 700 : 400,
        textDecoration: isActive ? 'underline' : 'none',
        textUnderlineOffset: 6,
      })}
    >
      {label}
    </NavLink>
  );
}
