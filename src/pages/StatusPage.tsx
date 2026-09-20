import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import HourglassIcon from '@mui/icons-material/HourglassEmpty';
import LockIcon from '@mui/icons-material/LockOutlined';
import PaymentsIcon from '@mui/icons-material/PaymentsOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Button, Link, Logo } from '@/components';
import { AuthBackground } from '@/layouts/AuthArtwork';
import { palette } from '@/theme/palette';
import { elevation } from '@/theme/tokens';
import { getStatusInfo } from './statusCatalog';
import type { StatusIcon } from './statusCatalog';

const ICONS: Record<StatusIcon, ReactElement> = {
  notFound: <SearchOffIcon fontSize="inherit" />,
  lock: <LockIcon fontSize="inherit" />,
  error: <ErrorIcon fontSize="inherit" />,
  cloud: <CloudOffIcon fontSize="inherit" />,
  time: <HourglassIcon fontSize="inherit" />,
  payment: <PaymentsIcon fontSize="inherit" />,
  block: <BlockIcon fontSize="inherit" />,
};

export interface StatusPageProps {
  /** Código HTTP (404, 403, 500…). */
  code: number;
  /** Ocupa toda la pantalla con el fondo de marca (errores globales). Si no, se integra en el shell. */
  fullPage?: boolean;
  /** Acción de "Reintentar"; por defecto recarga la página. */
  onRetry?: () => void;
  /** Detalle técnico opcional (ej. el `request_id` para reportar el problema). */
  detail?: string;
}

/**
 * Pantalla amable para errores HTTP: código grande, explicación en lenguaje claro y una salida
 * (volver al inicio, iniciar sesión o reintentar). Usada para URLs inexistentes (404), falta de
 * permisos (403) y fallos inesperados de la aplicación (500), entre otros.
 */
export function StatusPage({ code, fullPage = false, onRetry, detail }: StatusPageProps) {
  const info = getStatusInfo(code);
  const navigate = useNavigate();

  const content = (
    <Stack
      component="section"
      aria-labelledby="status-title"
      spacing={2.5}
      sx={{ alignItems: 'center', textAlign: 'center', maxWidth: 520 }}
    >
      {fullPage && <Logo />}

      <Box
        aria-hidden="true"
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: 40,
          color: palette.primary.main,
          backgroundColor: palette.brand.lightPink,
        }}
      >
        {ICONS[info.icon]}
      </Box>

      <Typography
        aria-hidden="true"
        sx={{
          fontSize: 'clamp(4rem, 18vw, 7rem)',
          fontWeight: 700,
          lineHeight: 1,
          color: palette.primary.main,
        }}
      >
        {code}
      </Typography>

      <Stack spacing={1}>
        <Typography id="status-title" component="h1" variant="h2">
          {info.title}
        </Typography>
        <Typography color="text.secondary">{info.message}</Typography>
        <Typography variant="caption" color="text.secondary">
          Error {code}
          {detail ? ` · ${detail}` : ''}
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        {info.login ? (
          <Button onClick={() => navigate('/login')}>Ir a iniciar sesión</Button>
        ) : (
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        )}
        {info.retry && (
          <Button variant="outlined" onClick={onRetry ?? (() => window.location.reload())}>
            Reintentar
          </Button>
        )}
        {code === 404 && !fullPage && <Link to="/">Ir al inicio</Link>}
      </Stack>
    </Stack>
  );

  if (!fullPage) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', py: { xs: 4, md: 8 } }}>{content}</Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        overflow: 'hidden',
      }}
    >
      <AuthBackground />
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 640,
          p: { xs: 3, sm: 6 },
          display: 'grid',
          placeItems: 'center',
          backgroundColor: palette.neutral.surface,
          boxShadow: elevation[3],
        }}
      >
        {content}
      </Box>
    </Box>
  );
}
