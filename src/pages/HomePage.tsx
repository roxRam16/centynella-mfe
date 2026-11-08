import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AppsIcon from '@mui/icons-material/AppsOutlined';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import PointOfSaleIcon from '@mui/icons-material/PointOfSaleOutlined';
import { Alert, Button, Card, Grid, GridItem } from '@/components';
import { config } from '@/config/env';
import { remoteRegistry } from '@/federation';
import { useApiHealth, useAuth } from '@/hooks';
import { PERMISSIONS } from '@/services/types';

interface QuickAction {
  to: string;
  label: string;
  description: string;
  icon: ReactElement;
}

/** Mismo criterio de visibilidad que el menú lateral (`buildNavigation`): Ventas y Inventario
 * según el permiso, un acceso por cada microfrontend registrado. Ocultarlo no es seguridad. */
function buildQuickActions(hasPermission: (permission: string) => boolean): QuickAction[] {
  const actions: QuickAction[] = [];
  if (hasPermission(PERMISSIONS.SALES_CREATE)) {
    actions.push({
      to: '/sales',
      label: 'Nueva venta',
      description: 'Cobra un carrito en el punto de venta.',
      icon: <PointOfSaleIcon />,
    });
  }
  if (hasPermission(PERMISSIONS.PRODUCTS_READ)) {
    actions.push({
      to: '/inventory',
      label: 'Inventario',
      description: 'Catálogo de productos y existencia.',
      icon: <InventoryIcon />,
    });
  }
  for (const remote of remoteRegistry) {
    actions.push({
      to: remote.path,
      label: remote.label,
      description: 'Microfrontend registrado.',
      icon: <AppsIcon />,
    });
  }
  return actions;
}

/** Página de inicio: "Hola Mundo" del shell + accesos rápidos a lo que se usa a diario. */
export function HomePage() {
  const health = useApiHealth();
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const quickActions = buildQuickActions(hasPermission);

  return (
    <Stack component="section" spacing={4} aria-labelledby="titulo-inicio">
      <Stack spacing={1}>
        <Typography id="titulo-inicio" component="h1" variant="h1">
          ¡Hola Mundo!
        </Typography>
        <Typography color="text.secondary">
          Shell de {config.appName}: el host donde se integrarán los microfrontends.
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary">
            Sesión iniciada como <strong>{user.name}</strong> · rol {user.role}
          </Typography>
        )}
      </Stack>

      {quickActions.length > 0 && (
        <Stack
          component="nav"
          aria-label="Accesos rápidos"
          direction="row"
          spacing={2}
          flexWrap="wrap"
        >
          {quickActions.map((action) => (
            <Card key={action.to} padding={2} interactive>
              <Stack spacing={1} sx={{ width: 220 }}>
                <Stack direction="row" spacing={1} alignItems="center" color="primary.main">
                  {action.icon}
                  <Typography sx={{ fontWeight: 600 }}>{action.label}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
                <Button variant="outlined" onClick={() => navigate(action.to)}>
                  Ir
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

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
