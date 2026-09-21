import { Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Logo } from '@/components';
import { APP_CREDITS } from '@/config/version';
import { palette } from '@/theme/palette';
import { elevation } from '@/theme/tokens';
import { AuthBackground, AuthIllustration } from './AuthArtwork';

/**
 * Estructura de las pantallas de acceso (login, registro, recuperación): tarjeta blanca
 * dividida en ilustración (izquierda) y formulario (derecha) sobre el fondo iris del diseño.
 * En pantallas pequeñas la ilustración se oculta y el formulario ocupa toda la tarjeta.
 */
export function AuthLayout() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <AuthBackground />

      <Box
        sx={{
          position: 'relative',
          flexGrow: 1,
          display: 'grid',
          placeItems: 'center',
          p: { xs: 2, md: 4 },
        }}
      >
        <Box
          component="main"
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 1000,
            minHeight: { md: 540 },
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            backgroundColor: palette.neutral.surface,
            boxShadow: elevation[3],
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              backgroundColor: palette.neutral.surfaceAlt,
            }}
          >
            <AuthIllustration />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: { xs: 3, sm: 6 },
            }}
          >
            <Box sx={{ display: { md: 'none' }, mb: 3 }}>
              <Logo />
            </Box>
            <Outlet />
          </Box>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          position: 'relative',
          py: 1.5,
          px: 2,
          textAlign: 'center',
          backgroundColor: palette.sidebar.background,
          color: palette.sidebar.text,
        }}
      >
        <Typography variant="body2" sx={{ color: 'inherit' }}>
          {APP_CREDITS}
        </Typography>
      </Box>
    </Box>
  );
}
