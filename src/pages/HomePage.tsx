import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { Alert, Button, Grid, GridItem } from '@/components';
import { config } from '@/config/env';
import { remoteRegistry } from '@/federation';
import { useApiHealth } from '@/hooks';

/** Página de inicio: "Hola Mundo" del shell + prueba de vida contra CENTYNELLA-CORE. */
export function HomePage() {
  const health = useApiHealth();

  return (
    <Stack component="section" spacing={4} aria-labelledby="titulo-inicio">
      <Stack spacing={1}>
        <Typography id="titulo-inicio" component="h1" variant="h1">
          ¡Hola Mundo!
        </Typography>
        <Typography color="text.secondary">
          Shell de {config.appName}: el host donde se integrarán los microfrontends.
        </Typography>
      </Stack>

      <Grid spacing={3}>
        <GridItem md={6}>
          <Stack spacing={2} aria-live="polite">
            <Typography component="h2" variant="h2">
              Estado del backend
            </Typography>

            {health.status === 'loading' && (
              <CircularProgress aria-label="Consultando CENTYNELLA-CORE" />
            )}
            {health.status === 'success' && (
              <Alert severity="success" title="CENTYNELLA-CORE en línea">
                {health.data.service} v{health.data.version}
              </Alert>
            )}
            {health.status === 'error' && (
              <Alert
                severity="error"
                title="Sin conexión con CENTYNELLA-CORE"
                action={
                  <Button variant="text" onClick={health.reload}>
                    Reintentar
                  </Button>
                }
              >
                {health.error.message}
              </Alert>
            )}
          </Stack>
        </GridItem>

        <GridItem md={6}>
          <Stack spacing={2}>
            <Typography component="h2" variant="h2">
              Microfrontends
            </Typography>
            {remoteRegistry.length === 0 ? (
              <Alert severity="info">Aún no hay microfrontends registrados.</Alert>
            ) : (
              <Typography>{remoteRegistry.length} microfrontend(s) registrado(s).</Typography>
            )}
          </Stack>
        </GridItem>
      </Grid>
    </Stack>
  );
}
